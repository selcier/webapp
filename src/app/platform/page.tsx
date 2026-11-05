"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, Gauge, Inbox, Vault } from "lucide-react";
import { useSession } from "@/components/platform/PlatformProviders";
import { useNow, useVenue } from "@/components/platform/usePlatformData";
import {
  Badge,
  BarChart,
  BarList,
  EmptyState,
  ExplorerLink,
  PageHead,
  Segmented,
  Sheet,
  Skeleton,
  sessionDot,
  sessionTone,
} from "@/components/platform/ui";
import { fmtAgo, fmtBps, fmtCompact, fmtMoney } from "@/lib/platform/format";
import { FEES, QUOTE_SYMBOL, REGIMES, TIERS, currentSession, quoteSwap, type Session } from "@/lib/platform/markets";
import { cn } from "@/lib/utils";
import { TokenLogo } from "@/components/platform/TokenLogo";

/** A short bar whose colour follows the session: up when open, warn when extended, neutral when closed, down when halted. */
function SessionDot({ session }: { session: string }) {
  return <span aria-hidden="true" className={cn("inline-block h-3 w-[3px] rounded-[1px]", sessionDot(session))} />;
}

/** The market's logo tile. */
function Monogram({ symbol }: { symbol: string }) {
  return <TokenLogo symbol={symbol} size={32} />;
}

const SESSION_NOTE: Record<Session, string> = {
  regular: "US exchanges are in regular hours. Spreads sit at their tier base, and the full clip is available.",
  extended: "US trading is in pre-market or after-hours. The underlying is thinner, so the spread scales x1.5 and the clip x0.75.",
  closed: "US exchanges are shut. The spread scales x3.0 to pay for gap risk at the reopen, and the clip falls to x0.5.",
};

type TierFilter = "all" | "1" | "2" | "3";
const TIER_OPTIONS = [
  { value: "all", label: "All tiers" },
  { value: "1", label: "Tier A" },
  { value: "2", label: "Tier B" },
  { value: "3", label: "Tier C" },
] as const satisfies readonly { value: TierFilter; label: string }[];

const fmtQuote = (v: number) => fmtMoney(v, QUOTE_SYMBOL);

export default function OverviewPage() {
  const { authenticated, login } = useSession();
  const venue = useVenue();
  const now = useNow();
  const session = currentSession(new Date(now));
  const [tier, setTier] = useState<TierFilter>("all");

  const markets = useMemo(() => venue.data?.markets ?? [], [venue.data]);
  const fills = useMemo(() => venue.data?.fills ?? [], [venue.data]);
  const loading = venue.loading && !venue.data;

  const tvl = markets.reduce((acc, m) => acc + m.tvl, 0);
  const volume = markets.reduce((acc, m) => acc + m.volume24h, 0);
  const funded = markets.filter((m) => m.tvl > 0).length;

  const dayFills = useMemo(() => fills.filter((f) => f.minutesAgo < 1440), [fills]);
  const avgExecution = dayFills.length ? dayFills.reduce((s, f) => s + f.executionBps, 0) / dayFills.length : null;

  // 24 hourly buckets from fills, oldest on the left.
  const hourly = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, i) => {
      const h = 23 - i;
      return { label: h === 0 ? "Last hour" : `${h}h ago`, value: 0 };
    });
    for (const f of dayFills) buckets[23 - Math.floor(f.minutesAgo / 60)].value += f.notional;
    return buckets;
  }, [dayFills]);
  const fillVolume = dayFills.reduce((s, f) => s + f.notional, 0);

  const shown = tier === "all" ? markets : markets.filter((m) => String(m.tier) === tier);
  const tvlRank = [...markets].filter((m) => m.tvl > 0).sort((a, b) => b.tvl - a.tvl);
  const latest = [...fills].sort((a, b) => a.minutesAgo - b.minutesAgo).slice(0, 5);

  return (
    <div>
      <PageHead
        code="ARC · 01 · Overview"
        title="Prices, spreads and sessions in one view"
        description="Session, spread scaling and fees for every listing. Each quote is priced around the oracle mid and settles in USDC."
        action={
          !authenticated ? (
            <button type="button" onClick={login} className="btn btn-primary">
              Sign in
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          ) : (
            <Link href="/platform/swap" className="btn btn-primary">
              Go to Trade
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )
        }
      />

      {/* Volume and the venue's key figures, read as one instrument */}
      <section className="panel grid grid-cols-[minmax(0,1fr)] overflow-hidden lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[13px] text-arc-ink-3">Volume, 24h</p>
              <p className="num mt-3 text-[clamp(40px,5vw,56px)] font-medium leading-none tracking-[-0.05em] text-arc-ink">
                {fmtCompact(volume, QUOTE_SYMBOL)}
              </p>
            </div>
            <p className="font-mono text-[11.5px] text-arc-ink-4">vault and RFQ fills, hourly</p>
          </div>
          <div className="mt-7">
            {loading ? (
              <Skeleton rows={4} />
            ) : (
              <BarChart
                data={hourly}
                height={150}
                format={fmtQuote}
                axisLabels={["24h ago", "12h ago", "Now"]}
                emptyLabel="No fills in the past 24 hours"
              />
            )}
          </div>
        </div>
        <dl className="grid grid-cols-1 border-t border-arc-line sm:grid-cols-3 lg:grid-cols-1 lg:border-l lg:border-t-0">
          {[
            { k: "Vault value", v: fmtCompact(tvl, QUOTE_SYMBOL), s: `${funded} of ${markets.length} listings funded`, Icon: Vault },
            { k: "Fills, 24h", v: String(dayFills.length), s: `${fmtCompact(fillVolume, QUOTE_SYMBOL)} of flow`, Icon: Activity },
            { k: "Cost over mid", v: avgExecution === null ? "n/a" : fmtBps(avgExecution), s: "average half-spread and fee", Icon: Gauge },
          ].map(({ k, v, s, Icon }, i) => (
            <div
              key={k}
              className={cn(
                "flex flex-col justify-center gap-2 px-5 py-5 sm:px-6",
                i > 0 && "border-t border-arc-line sm:border-l sm:border-t-0 lg:border-l-0 lg:border-t"
              )}
            >
              <dt className="flex items-center justify-between text-[12.5px] text-arc-ink-3">
                {k}
                <Icon className="size-3.5 text-arc-ink-4" aria-hidden="true" />
              </dt>
              <dd className="num text-[26px] font-medium leading-none tracking-[-0.04em] text-arc-ink">{v}</dd>
              <dd className="text-[12px] text-arc-ink-4">{s}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* The session, as a strip of the three quoting regimes */}
      <section className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-px overflow-hidden rounded-[14px] border border-arc-line bg-arc-line md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))]">
        <div className="flex flex-col justify-center gap-2 bg-arc-paper px-5 py-4">
          <div className="flex items-center gap-2.5">
            <SessionDot session={session} />
            <span className="text-[14px] font-medium text-arc-ink">Session regime</span>
          </div>
          <p className="text-[12.5px] leading-relaxed text-arc-ink-3">{SESSION_NOTE[session]}</p>
        </div>
        {(["regular", "extended", "closed"] as const).map((s) => {
          const r = REGIMES[s];
          const lit = s === session;
          return (
            <div key={s} className={cn("flex flex-col justify-center gap-1.5 px-5 py-4", lit ? "bg-arc-hover" : "bg-arc-paper")}>
              <div className="flex items-center justify-between">
                <Badge tone={lit ? sessionTone(s) : "muted"}>{r.label}</Badge>
                {lit && <span className="font-mono text-[11px] text-arc-ink-3">now</span>}
              </div>
              <p className={cn("num text-[13px]", lit ? "text-arc-ink" : "text-arc-ink-4")}>
                spread x{(r.spreadMulBps / 10_000).toFixed(1)} · clip x{(r.clipMulBps / 10_000).toFixed(2)}
              </p>
            </div>
          );
        })}
      </section>
      <p className="mt-2 px-1 text-[12px] text-arc-ink-4">
        Venue fee {fmtBps(FEES.swapFeeBps, 0)}, plus {FEES.spreadShareBps / 100}% of vault spread revenue. Oracle market status governs pricing.
      </p>

      {/* Listings as tiles */}
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-medium tracking-[-0.03em] text-arc-ink">Markets</h2>
            <p className="mt-1 text-[12.5px] text-arc-ink-4">
              {shown.length} {shown.length === 1 ? "listing" : "listings"} ·{" "}
              {venue.data?.source === "supabase" ? "indexed venue data" : "local listing data"}
            </p>
          </div>
          <Segmented label="Tier filter for listings" options={TIER_OPTIONS} value={tier} onChange={setTier} />
        </div>

        {loading ? (
          <div className="mt-5">
            <Skeleton rows={6} />
          </div>
        ) : shown.length === 0 ? (
          <div className="mt-5">
            <EmptyState icon={<Inbox />} title="No listings in this tier" body="Choose a different tier." />
          </div>
        ) : (
          <ul className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {shown.map((m) => {
              const q = quoteSwap(m, true, 1_000, session);
              const href = `/platform/swap?market=${encodeURIComponent(m.symbol)}`;
              const tokenShare = m.inventoryRatioBps / 100;
              return (
                <li key={m.symbol}>
                  <Link
                    href={href}
                    aria-label={`Quote ${m.symbol} on the ticket`}
                    className="card card-hover group flex h-full flex-col p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-3">
                        <Monogram symbol={m.symbol} />
                        <span className="min-w-0">
                          <span className="block text-[14px] font-medium text-arc-ink">{m.symbol}</span>
                          <span className="block truncate text-[12px] text-arc-ink-4">{m.name}</span>
                        </span>
                      </span>
                      <Badge tone={m.tier === 1 ? "accent" : "muted"}>{TIERS[m.tier].label}</Badge>
                    </div>

                    <p className="num mt-6 text-[28px] font-medium leading-none tracking-[-0.04em] text-arc-ink">
                      {fmtMoney(m.mid)}
                      <span className="ml-1.5 text-[12px] font-normal tracking-normal text-arc-ink-4">{QUOTE_SYMBOL}</span>
                    </p>

                    <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-arc-line pt-4 text-[12px]">
                      <div>
                        <dt className="text-arc-ink-4">Buy half-spread</dt>
                        <dd className="num mt-1 text-[13.5px] text-arc-ink">{q.halfSpreadBps.toFixed(1)} bps</dd>
                      </div>
                      <div>
                        <dt className="text-arc-ink-4">Clip in force</dt>
                        <dd className="num mt-1 text-[13.5px] text-arc-ink">{fmtCompact(q.clip)}</dd>
                      </div>
                      <div>
                        <dt className="text-arc-ink-4">Volume, 24h</dt>
                        <dd className="num mt-1 text-[13.5px] text-arc-ink-2">{m.volume24h > 0 ? fmtMoney(m.volume24h) : "0"}</dd>
                      </div>
                      <div>
                        <dt className="text-arc-ink-4">Vault value</dt>
                        <dd className="num mt-1 text-[13.5px] text-arc-ink-2">{m.tvl > 0 ? fmtMoney(m.tvl) : "0"}</dd>
                      </div>
                    </dl>

                    <div className="mt-auto pt-5">
                      <div className="flex justify-between font-mono text-[10.5px] text-arc-ink-4">
                        <span>Token {tokenShare.toFixed(0)}%</span>
                        <span>USDC {(100 - tokenShare).toFixed(0)}%</span>
                      </div>
                      <div className="relative mt-1.5 h-1 overflow-hidden rounded-full bg-arc-sunk" aria-hidden="true">
                        <div className="absolute inset-y-0 left-0 bg-arc-ink-2" style={{ width: `${tokenShare}%` }} />
                        <div className="absolute inset-y-[-2px] left-1/2 w-px bg-arc-ink-4" />
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-4 px-1 text-[12px] leading-relaxed text-arc-ink-4">
          The buy half-spread starts from the tier base, takes the session multiplier, then moves with inventory skew. Select a market to quote it.
        </p>
      </section>

      {/* Flow and depth */}
      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Sheet label="Latest fills" meta={<ExplorerLink href="/platform/explorer">View the Ledger</ExplorerLink>}>
          {loading ? (
            <Skeleton rows={5} />
          ) : latest.length === 0 ? (
            <EmptyState icon={<Activity />} title="No fills to show" body="Vault and RFQ fills appear here as they settle." />
          ) : (
            <ol className="relative -my-1 border-l border-arc-line pl-5">
              {latest.map((f, i) => (
                <li key={`${f.symbol}-${f.minutesAgo}-${i}`} className="relative py-2.5">
                  <span
                    className={cn(
                      "absolute -left-[23px] top-1/2 h-px w-3 -translate-y-1/2",
                      f.side === "buy" ? "bg-arc-up" : "bg-arc-down"
                    )}
                    aria-hidden="true"
                  />
                  <div className="flex items-center gap-3">
                    <span className="w-24 shrink-0 font-mono text-[11.5px] text-arc-ink-4">{fmtAgo(f.minutesAgo)}</span>
                    <span className={cn("w-10 shrink-0 text-[12.5px]", f.side === "buy" ? "text-arc-up" : "text-arc-down")}>
                      {f.side === "buy" ? "Buy" : "Sell"}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-arc-ink">
                      {f.symbol}
                      {f.venue === "rfq" && <span className="ml-2 text-[12px] font-normal text-arc-ink-4">RFQ</span>}
                    </span>
                    <span className="num shrink-0 text-[13.5px] text-arc-ink-2">
                      {fmtMoney(f.notional)}
                      <span className="text-arc-ink-4"> {QUOTE_SYMBOL}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Sheet>
        <Sheet label="Value per vault" meta={<span className="num">{fmtCompact(tvl, QUOTE_SYMBOL)}</span>}>
          {loading ? (
            <Skeleton rows={5} />
          ) : tvlRank.length === 0 ? (
            <EmptyState icon={<Vault />} title="No funded vaults" />
          ) : (
            <BarList
              items={tvlRank.map((m) => ({
                key: m.symbol,
                label: m.symbol,
                value: m.tvl,
                display: (
                  <>
                    {fmtMoney(m.tvl, "", 0)}
                    <span className="text-arc-ink-4"> {QUOTE_SYMBOL}</span>
                  </>
                ),
              }))}
            />
          )}
        </Sheet>
      </div>
    </div>
  );
}
