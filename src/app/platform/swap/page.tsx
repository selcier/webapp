"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowDownUp, Info } from "lucide-react";
import { useSession } from "@/components/platform/PlatformProviders";
import { useNow, useVenue } from "@/components/platform/usePlatformData";
import {
  Badge,
  Button,
  LeaderRow,
  Notice,
  PageHead,
  Segmented,
  Select,
  Sheet,
  Skeleton,
  sessionTone,
} from "@/components/platform/ui";
import { fmtBps, fmtMoney } from "@/lib/platform/format";
import { FEES, QUOTE_SYMBOL, REGIMES, TIERS, currentSession, quoteSwap } from "@/lib/platform/markets";
import { TokenLogo } from "@/components/platform/TokenLogo";

const SLIPPAGE_OPTIONS = [10, 15, 30, 50] as const;
const SLIPPAGE_SEGMENTS = SLIPPAGE_OPTIONS.map((bps) => ({ value: String(bps), label: `${(bps / 100).toFixed(2)}%` }));

const TITLE = "Read the whole price before you sign";
const DESCRIPTION =
  "The ticket itemizes mid, spread, skew and fee before you sign. A swap is one transaction with one signature, settles in USDC, and fails if the result falls below your floor.";

/** The market or token logo: a tile in headers, a round mark inside token chips. */
function Monogram({ symbol, size = "md" }: { symbol: string; size?: "sm" | "md" }) {
  return size === "sm" ? <TokenLogo symbol={symbol} size={26} rounded="round" /> : <TokenLogo symbol={symbol} size={32} />;
}

/** A token chip that sits on the right of an amount field. */
function TokenChip({ symbol }: { symbol: string }) {
  return (
    <span className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-arc-line bg-arc-paper pl-1.5 pr-3.5 shadow-[var(--shadow-sheet)]">
      <Monogram symbol={symbol} size="sm" />
      <span className="text-[14px] font-medium text-arc-ink">{symbol}</span>
    </span>
  );
}

/** The shared backdrop laid behind the ticket, darkened so the ticket always leads. */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="card-stage relative isolate overflow-hidden !rounded-[22px] !shadow-none px-3 py-6 sm:px-6 sm:py-10 lg:px-10 lg:py-14">
      <Image
        src="/images/hero-backdrop.jpg"
        alt=""
        fill
        priority
        quality={85}
        sizes="(min-width: 1024px) 1150px, 100vw"
        className="-z-30 object-cover object-[72%_50%] opacity-80"
      />
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-arc-canvas/60 via-arc-canvas/40 to-arc-canvas/90" aria-hidden="true" />
      <div className="grid-lines absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
      {children}
    </div>
  );
}

function SwapSkeleton() {
  return (
    <div className="space-y-8">
      <PageHead bare code="ARC · 02 · Trade" title={TITLE} description={DESCRIPTION} />
      <Stage>
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,520px)_320px] lg:justify-center">
          <div className="card-stage p-6">
            <Skeleton rows={8} />
          </div>
          <div className="panel p-5">
            <Skeleton rows={5} />
          </div>
        </div>
      </Stage>
    </div>
  );
}

export default function SwapPage() {
  return (
    <Suspense fallback={<SwapSkeleton />}>
      <SwapRoute />
    </Suspense>
  );
}

/** Reads the `?market=` deep link and remounts the ticket when it changes. */
function SwapRoute() {
  const requested = useSearchParams().get("market");
  return <SwapTicket key={requested ?? ""} requested={requested} />;
}

function SwapTicket({ requested }: { requested: string | null }) {
  const { authenticated, login } = useSession();
  const venue = useVenue();
  const now = useNow();
  const session = currentSession(new Date(now));
  const regime = REGIMES[session];

  const markets = useMemo(() => venue.data?.markets ?? [], [venue.data]);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [buyToken, setBuyToken] = useState(true);
  const [amountRaw, setAmountRaw] = useState("10000");
  const [slippageBps, setSlippageBps] = useState(15);

  // An explicit pick wins; otherwise the deep link (if it names a listed market); otherwise the first market.
  const linked = requested ? markets.find((m) => m.symbol.toLowerCase() === requested.toLowerCase()) : undefined;
  const market = markets.find((m) => m.symbol === symbol) ?? linked ?? markets[0];
  const amountIn = Number(amountRaw.replace(/,/g, ""));
  const quote = useMemo(
    () => (market ? quoteSwap(market, buyToken, amountIn, session) : null),
    [market, buyToken, amountIn, session]
  );

  if (venue.loading && !venue.data) return <SwapSkeleton />;
  if (!market || !quote) return null;

  const tier = TIERS[market.tier];
  const minOut = quote.ok ? quote.amountOut * (1 - slippageBps / 10_000) : 0;
  const inSymbol = buyToken ? QUOTE_SYMBOL : market.symbol;
  const outSymbol = buyToken ? market.symbol : QUOTE_SYMBOL;
  const outDigits = buyToken ? 4 : 2;
  const regimeMul = (regime.spreadMulBps / 10_000).toFixed(1);
  const sessionHalfSpread = (tier.baseHalfSpreadBps * regime.spreadMulBps) / 10_000;

  const unit = (s: string) => <span className="text-arc-ink-4"> {s}</span>;

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHead bare code="ARC · 02 · Trade" title={TITLE} description={DESCRIPTION} />

      <Stage>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,520px)_320px] lg:justify-center xl:gap-8">
        {/* Ticket */}
        <div className="relative min-w-0">
          <section aria-label={`Ticket for ${market.symbol} and ${QUOTE_SYMBOL}`} className="card-stage p-4 sm:p-6">
            {/* Ticket head */}
            <div className="flex items-center justify-between gap-3 px-1">
              <div className="flex min-w-0 items-center gap-3">
                <Monogram symbol={market.symbol} />
                <div className="min-w-0">
                  <h2 className="truncate text-[16px] font-medium text-arc-ink">
                    {market.symbol} <span className="text-arc-ink-4">/ {QUOTE_SYMBOL}</span>
                  </h2>
                  <p className="truncate text-[12.5px] text-arc-ink-4">{market.name}</p>
                </div>
              </div>
              <Badge tone={sessionTone(session)}>
                {regime.label} x{regimeMul}
              </Badge>
            </div>

            {/* Market selector */}
            <div className="mt-5">
              <label htmlFor="swap-market" className="lbl mb-2 block px-1">
                Listing
              </label>
              <Select id="swap-market" value={market.symbol} onChange={(e) => setSymbol(e.target.value)}>
                {markets.map((m) => (
                  <option key={m.symbol} value={m.symbol}>
                    {m.symbol} · {m.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Pay / flip / receive */}
            <div className="mt-4">
              <div className="rounded-[14px] border border-arc-line bg-arc-canvas p-4 transition-[border-color,box-shadow] focus-within:border-arc-accent focus-within:bg-arc-paper focus-within:shadow-[0_0_0_3px_rgb(255_255_255/0.06)]">
                <label htmlFor="swap-pay" className="lbl block">
                  You send<span className="sr-only">, {inSymbol}</span>
                </label>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    id="swap-pay"
                    inputMode="decimal"
                    autoComplete="off"
                    value={amountRaw}
                    onChange={(e) => setAmountRaw(e.target.value)}
                    placeholder="0.00"
                    className="num min-w-0 flex-1 bg-transparent text-[32px] font-semibold leading-none tracking-[-0.03em] text-arc-ink outline-none placeholder:text-arc-ink-4 sm:text-[36px]"
                  />
                  <TokenChip symbol={inSymbol} />
                </div>
              </div>

              <div className="relative z-10 -my-[18px] flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (quote.ok) setAmountRaw(quote.amountOut.toFixed(buyToken ? 4 : 2));
                    setBuyToken((v) => !v);
                  }}
                  aria-label="Reverse send and get"
                  className="group grid size-10 place-items-center rounded-[12px] border border-arc-line-strong bg-arc-paper text-arc-ink-2 ring-[5px] ring-arc-paper transition-colors hover:border-arc-accent/50 hover:text-arc-accent-ink"
                >
                  <ArrowDownUp className="size-4 transition-transform duration-300 group-hover:rotate-180" aria-hidden="true" />
                </button>
              </div>

              <div className="rounded-[14px] border border-arc-line bg-arc-canvas p-4">
                <label htmlFor="swap-receive" className="lbl block">
                  You get<span className="sr-only">, {outSymbol}</span>
                </label>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    id="swap-receive"
                    readOnly
                    tabIndex={-1}
                    value={quote.ok ? fmtMoney(quote.amountOut, "", outDigits) : ""}
                    placeholder="0.00"
                    className="num min-w-0 flex-1 bg-transparent text-[32px] font-semibold leading-none tracking-[-0.03em] text-arc-ink outline-none placeholder:text-arc-ink-4 sm:text-[36px]"
                  />
                  <TokenChip symbol={outSymbol} />
                </div>
              </div>
            </div>

            {/* Line-by-line breakdown */}
            <div className="mt-5 rounded-[14px] border border-arc-line px-4 py-2">
              <LeaderRow label="Oracle mid" value={<>{fmtMoney(quote.mid)}{unit(QUOTE_SYMBOL)}</>} sub="price per whole token" />
              <LeaderRow
                label={`Half-spread · ${fmtBps(quote.halfSpreadBps)}`}
                value={quote.ok ? <>{fmtMoney(quote.spreadAmount)}{unit(QUOTE_SYMBOL)}</> : "n/a"}
                sub={`Tier ${tier.label} base ${fmtBps(tier.baseHalfSpreadBps)} at x${regimeMul} under ${regime.label}, with ${quote.skewBps >= 0 ? "+" : ""}${quote.skewBps} bps skew`}
              />
              <LeaderRow
                label={`Venue fee · ${fmtBps(quote.feeBps)}`}
                value={quote.ok ? <>{fmtMoney(quote.feeAmount)}{unit(QUOTE_SYMBOL)}</> : "n/a"}
                sub="the protocol's own charge, listed apart from the spread"
              />
              <div className="my-1.5 rule" aria-hidden="true" />
              <LeaderRow
                label={<span className="text-arc-ink-2">Least you get · {(slippageBps / 100).toFixed(2)}% tolerance</span>}
                value={
                  quote.ok ? (
                    <span className="font-medium">
                      {fmtMoney(minOut, "", outDigits)}
                      {unit(outSymbol)}
                    </span>
                  ) : (
                    "n/a"
                  )
                }
                sub="the router enforces this floor, and a worse result fails"
              />
            </div>

            {/* Slippage bound */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
              <span className="lbl">Price tolerance</span>
              <Segmented
                label="Price tolerance"
                options={SLIPPAGE_SEGMENTS}
                value={String(slippageBps)}
                onChange={(v) => setSlippageBps(Number(v))}
                className="num"
              />
            </div>

            {!quote.ok && quote.reason && (
              <div className="mt-4">
                <Notice tone="warn">{quote.reason}</Notice>
              </div>
            )}
            {session === "closed" && (
              <div className="mt-4">
                <Notice tone="warn">
                  US markets are closed. This quote includes a 3x session spread, and the clip is cut to x0.5. An
                  order that can wait for the next regular session is usually cheaper.
                </Notice>
              </div>
            )}

            <div className="mt-5">
              {authenticated ? (
                <Button variant="accent" className="btn-lg w-full" disabled>
                  Swap
                </Button>
              ) : (
                <Button variant="accent" className="btn-lg w-full" onClick={login}>
                  Sign in with email or wallet
                </Button>
              )}
              <p className="mt-3 flex gap-2 px-1 text-[12.5px] leading-relaxed text-arc-ink-3">
                <Info className="mt-0.5 size-3.5 shrink-0 text-arc-ink-4" aria-hidden="true" />
                <span>
                  {authenticated
                    ? "One transaction and one signature. The router fills from the vault or an approved maker, whichever prices better."
                    : "Sign in to trade. Permissioned markets also require a TRADER attestation."}
                </span>
              </p>
            </div>
          </section>
        </div>

        {/* Side panels */}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
          <Sheet label="Listing" meta={<Badge tone="muted">Tier {tier.label}</Badge>}>
            <div className="flex items-center gap-3">
              <Monogram symbol={market.symbol} />
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-arc-ink">{market.symbol}</p>
                <p className="truncate text-[12.5px] text-arc-ink-4">{market.name}</p>
              </div>
            </div>
            <p className="num mt-5 text-[30px] font-semibold leading-none tracking-[-0.03em] text-arc-ink">
              {fmtMoney(quote.mid)}
              <span className="text-[14px] font-normal text-arc-ink-4"> {QUOTE_SYMBOL}</span>
            </p>
            <p className="mt-2 text-[12.5px] text-arc-ink-3">Oracle mid from Chainlink Data Streams.</p>
            <dl className="divide-hair mt-5 border-t border-arc-line text-[13px]">
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-arc-ink-3">Regime</dt>
                <dd>
                  <Badge tone={sessionTone(session)}>
                    {regime.label} x{regimeMul}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-arc-ink-3">Half-spread in force</dt>
                <dd className="num text-arc-ink">{fmtBps(sessionHalfSpread)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 pt-2.5">
                <dt className="text-arc-ink-3">Largest trade allowed</dt>
                <dd className="num text-arc-ink">
                  {fmtMoney(quote.clip, "", 0)}
                  {unit(QUOTE_SYMBOL)}
                </dd>
              </div>
            </dl>
          </Sheet>

          <Sheet label="How a fill settles">
            <dl className="divide-hair -my-1 text-[13px]">
              {[
                ["Route", buyToken ? `${QUOTE_SYMBOL} → ${market.symbol}` : `${market.symbol} → ${QUOTE_SYMBOL}`],
                ["Filled by", "vault or maker, at the better price"],
                ["Oracle band", fmtBps(tier.oracleBandBps, 0)],
                ["Venue fee, vault", fmtBps(FEES.swapFeeBps)],
                ["Venue fee, RFQ", fmtBps(FEES.rfqFeeBps)],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-arc-ink-3">{k}</dt>
                  <dd className="num text-right text-arc-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 border-t border-arc-line pt-4 text-[12.5px] text-arc-ink-3">One signature and no standing approval. Network fees are paid in SOL, and a failed transaction still costs its fee.</p>
          </Sheet>

          <div className="rounded-[14px] border border-arc-line bg-arc-paper px-4 py-3.5 shadow-[var(--shadow-sheet)]">
            <p className="flex items-center gap-2 text-[13px] font-medium text-arc-ink-2">
              <Info className="size-3.5 text-arc-accent-ink" aria-hidden="true" />
              How this quote is built
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-arc-ink-3">
              Start from the oracle mid, taken from Chainlink Data Streams with a Pyth
              cross-check. Add the half-spread for this tier at the session multiplier, then let inventory skew shift it. The venue
              fee stays on its own line, and no quote appears if the price would leave the oracle band.
            </p>
          </div>
        </div>
      </div>
      </Stage>
    </div>
  );
}
