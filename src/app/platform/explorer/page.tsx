"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, Gauge, Layers, ReceiptText, SearchX } from "lucide-react";
import { useNow, useVenue } from "@/components/platform/usePlatformData";
import {
  BarChart,
  Badge,
  EmptyState,
  LeaderRow,
  PageHead,
  Segmented,
  Sheet,
  Skeleton,
  StatBand,
  StatCard,
  Table,
  Td,
  Th,
  sessionTone,
} from "@/components/platform/ui";
import { fmtAgo, fmtBps, fmtCompact } from "@/lib/platform/format";
import { FEES, QUOTE_SYMBOL, REGIMES, TIERS, currentSession } from "@/lib/platform/markets";
import { TokenLogo } from "@/components/platform/TokenLogo";

type SideFilter = "all" | "buy" | "sell";
type VenueFilter = "all" | "vault" | "rfq";

const SIDE_OPTIONS = [
  { value: "all", label: "Any side" },
  { value: "buy", label: "Bought" },
  { value: "sell", label: "Sold" },
] as const;

const VENUE_OPTIONS = [
  { value: "all", label: "Any source" },
  { value: "vault", label: "Vaults" },
  { value: "rfq", label: "Makers" },
] as const;

const fmtMul = (bps: number) => `x${(bps / 10_000).toFixed(1)}`;

export default function ExplorerPage() {
  const venue = useVenue();
  const now = useNow();
  const session = currentSession(new Date(now));

  const [side, setSide] = useState<SideFilter>("all");
  const [venueFilter, setVenueFilter] = useState<VenueFilter>("all");

  const fills = useMemo(() => venue.data?.fills ?? [], [venue.data]);
  const governance = venue.data?.governance ?? [];
  const markets = venue.data?.markets ?? [];
  const marketCount = markets.length;
  const nameOf = (symbol: string) => markets.find((m) => m.symbol === symbol)?.name;

  const stats = useMemo(() => {
    const total = fills.reduce((s, f) => s + f.notional, 0);
    const weighted = fills.reduce((s, f) => s + f.executionBps * f.notional, 0);
    const rfq = fills.filter((f) => f.venue === "rfq").reduce((s, f) => s + f.notional, 0);
    return {
      total,
      avgBps: total > 0 ? weighted / total : null,
      rfqShare: total > 0 ? (rfq / total) * 100 : 0,
      rfqCount: fills.filter((f) => f.venue === "rfq").length,
    };
  }, [fills]);

  const chronological = useMemo(() => [...fills].sort((a, b) => b.minutesAgo - a.minutesAgo), [fills]);
  const chartData = chronological.map((f) => ({ label: `${f.symbol} · ${fmtAgo(f.minutesAgo)}`, value: f.executionBps }));

  const shown = fills.filter((f) => (side === "all" || f.side === side) && (venueFilter === "all" || f.venue === venueFilter));

  const loading = venue.loading && !venue.data;

  return (
    <div>
      <PageHead
        code="ARC · 05 · Ledger"
        title="A record built to be checked"
        description="The Ledger summarizes trades, parameters and change history. Fills settle on Solana, and the chain is the authority if the two ever differ."
      />

      <StatBand className="mt-6">
        <StatCard
          label="Trades"
          value={loading ? "…" : String(fills.length)}
          hint={venue.data?.source === "supabase" ? "Indexed venue data" : "Local listing data"}
          icon={<ReceiptText aria-hidden="true" />}
        />
        <StatCard
          label="Total size"
          value={loading ? "…" : fmtCompact(stats.total, QUOTE_SYMBOL)}
          hint="Sum of the rows listed"
          icon={<Layers aria-hidden="true" />}
        />
        <StatCard
          label="Average cost over mid"
          value={loading ? "…" : fmtBps(stats.avgBps)}
          hint="Size-weighted"
          accent="accent"
          icon={<Gauge aria-hidden="true" />}
        />
        <StatCard
          label="Maker share"
          value={loading ? "…" : `${stats.rfqShare.toFixed(0)}%`}
          hint={`by size, ${stats.rfqCount} of ${fills.length} rows`}
          icon={<ArrowLeftRight aria-hidden="true" />}
        />
      </StatBand>

      <Sheet label="Cost per trade" meta="bps over the oracle mid" className="mt-6">
        {loading ? (
          <Skeleton rows={4} />
        ) : (
          <BarChart
            data={chartData}
            height={150}
            format={(v) => fmtBps(v)}
            emptyLabel="Nothing to chart"
            axisLabels={
              chronological.length > 0
                ? [
                    `Earliest, ${fmtAgo(chronological[0].minutesAgo)}`,
                    `${chronological.length} rows`,
                    `Newest, ${fmtAgo(chronological[chronological.length - 1].minutesAgo)}`,
                  ]
                : undefined
            }
          />
        )}
      </Sheet>

      <Sheet
        label="Trade record"
        meta={venue.data?.source === "supabase" ? "indexed fills" : "local fills"}
        className="mt-6"
      >
        {loading ? (
          <Skeleton rows={8} />
        ) : fills.length === 0 ? (
          <EmptyState
            icon={<ReceiptText aria-hidden="true" />}
            title="No trades to show"
            action={
              <Link href="/platform/swap" className="btn btn-secondary btn-sm">
                Go to Trade
              </Link>
            }
          />
        ) : (
          <>
            <div className="-mx-5 -mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-arc-line px-5 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <Segmented label="Side filter" options={SIDE_OPTIONS} value={side} onChange={setSide} />
                <Segmented label="Source filter" options={VENUE_OPTIONS} value={venueFilter} onChange={setVenueFilter} />
              </div>
              <span className="text-[12.5px] text-arc-ink-3">
                <span className="num text-arc-ink-2">{shown.length}</span> of <span className="num">{fills.length}</span>
              </span>
            </div>
            {shown.length === 0 ? (
              <div className="pt-5">
                <EmptyState
                  icon={<SearchX aria-hidden="true" />}
                  title="No trades match these filters"
                  action={
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setSide("all");
                        setVenueFilter("all");
                      }}
                    >
                      Reset filters
                    </button>
                  }
                />
              </div>
            ) : (
              <Table minWidth={720}>
                <thead>
                  <tr>
                    <Th>Age</Th>
                    <Th>Market</Th>
                    <Th>Side</Th>
                    <Th className="text-right">Size</Th>
                    <Th>Filled by</Th>
                    <Th className="text-right">Cost over mid</Th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((f, i) => {
                    const name = nameOf(f.symbol);
                    return (
                      <tr key={`${f.minutesAgo}-${f.symbol}-${i}`}>
                        <Td className="whitespace-nowrap font-mono text-[12.5px] text-arc-ink-3">{fmtAgo(f.minutesAgo)}</Td>
                        <Td>
                          <div className="flex items-center gap-3">
                            <TokenLogo symbol={f.symbol} size={32} />
                            <div className="min-w-0 leading-tight">
                              <div className="font-medium text-arc-ink">{f.symbol}</div>
                              {name && <div className="truncate text-[12.5px] text-arc-ink-4">{name}</div>}
                            </div>
                          </div>
                        </Td>
                        <Td>
                          <Badge tone={f.side === "buy" ? "up" : "down"}>{f.side === "buy" ? "Buy" : "Sell"}</Badge>
                        </Td>
                        <Td className="whitespace-nowrap text-right text-arc-ink">
                          {fmtCompact(f.notional)}
                          <span className="text-arc-ink-4"> {QUOTE_SYMBOL}</span>
                        </Td>
                        <Td>
                          <span className="tag">{f.venue === "rfq" ? "Maker" : "Vault"}</span>
                        </Td>
                        <Td className="whitespace-nowrap text-right text-arc-ink">
                          {f.executionBps.toFixed(1)}
                          <span className="text-arc-ink-4"> bps</span>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </>
        )}
        <p className="mt-5 text-[12px] leading-relaxed text-arc-ink-3">
          The record keeps every fill, closed-session fills included, and filters change only the view.
        </p>
      </Sheet>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-2">
        <Sheet label="Parameters in force" meta="set through arcter-config">
          <ParamGroup title="By tier">
            {([1, 2, 3] as const).map((t) => (
              <LeaderRow
                key={t}
                label={
                  <span className="inline-flex items-center gap-2.5">
                    <Badge tone={t === 1 ? "accent" : "muted"}>Tier {TIERS[t].label}</Badge>
                    <span>
                      spread <span className="num text-arc-ink-2">{fmtBps(TIERS[t].baseHalfSpreadBps)}</span>
                    </span>
                  </span>
                }
                value={
                  <>
                    band {fmtBps(TIERS[t].oracleBandBps, 0)}
                    <span className="text-arc-ink-4"> · </span>
                    clip {fmtCompact(TIERS[t].maxClip, QUOTE_SYMBOL)}
                  </>
                }
              />
            ))}
          </ParamGroup>
          <ParamGroup title="Right now">
            <LeaderRow label="Current regime" value={<Badge tone={sessionTone(session)}>{REGIMES[session].label}</Badge>} />
          </ParamGroup>
          <ParamGroup title="Spread multipliers">
            <LeaderRow label="Extended session" value={`${fmtMul(REGIMES.extended.spreadMulBps)}`} />
            <LeaderRow label="Closed session" value={`${fmtMul(REGIMES.closed.spreadMulBps)}`} />
          </ParamGroup>
          <ParamGroup title="Fees">
            <LeaderRow label="Vault trades" value={fmtBps(FEES.swapFeeBps)} />
            <LeaderRow label="Maker trades" value={fmtBps(FEES.rfqFeeBps)} />
            <LeaderRow label="Venue share of spread" value={`${FEES.spreadShareBps / 100}%`} />
          </ParamGroup>
          <ParamGroup title="Listings">
            <LeaderRow label="Listings" value={String(marketCount)} />
          </ParamGroup>
        </Sheet>

        <Sheet label="Change history" meta="parameter and program changes">
          <p className="mb-5 text-[13px] text-arc-ink-3">A parameter change shows here during its one-hour time lock, before it takes effect.</p>
          <ol className="relative space-y-5">
            {governance.map((entry, i) => (
              <li key={entry.date + entry.action} className="relative pl-6">
                {i < governance.length - 1 && (
                  <span aria-hidden="true" className="absolute bottom-[-20px] left-[3px] top-4 w-px bg-arc-line-strong" />
                )}
                <span
                  aria-hidden="true"
                  className={
                    i === 0
                      ? "absolute left-0 top-[7px] size-[7px] rounded-full bg-arc-accent ring-4 ring-arc-accent-soft"
                      : "absolute left-0 top-[7px] size-[7px] rounded-full border border-arc-line-strong bg-arc-paper"
                  }
                />
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="text-[14px] font-medium text-arc-ink">{entry.action}</span>
                  <time dateTime={entry.date} className="font-mono text-[11.5px] text-arc-ink-3">
                    {entry.date}
                  </time>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-arc-ink-2">{entry.detail}</p>
              </li>
            ))}
          </ol>
        </Sheet>
      </div>
    </div>
  );
}

function ParamGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-arc-line pt-3 mt-3 first:mt-0 first:border-t-0 first:pt-0">
      <h3 className="lbl mb-1">{title}</h3>
      {children}
    </div>
  );
}
