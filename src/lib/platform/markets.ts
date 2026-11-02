/**
 * The platform's listings and vault pricing.
 *
 * The quotes produced here follow the arcter-vault formula (fee taken from the quote-token side,
 * a regime-adjusted half-spread around the mid, signed inventory skew, plus clip and band checks), and the
 * session comes from the US-equity clock. The listing data mirrors supabase/seed.sql and is the local
 * fallback when the data service is unavailable.
 */

export type Session = "regular" | "extended" | "closed";

export interface TierParams {
  label: string;
  baseHalfSpreadBps: number;
  maxSkewBps: number;
  inventoryBandBps: number;
  oracleBandBps: number;
  /** The biggest single swap allowed in the regular session, as quote-token notional. */
  maxClip: number;
}

export const TIERS: Record<1 | 2 | 3, TierParams> = {
  1: { label: "A", baseHalfSpreadBps: 10, maxSkewBps: 15, inventoryBandBps: 2000, oracleBandBps: 75, maxClip: 50_000 },
  2: { label: "B", baseHalfSpreadBps: 20, maxSkewBps: 25, inventoryBandBps: 2000, oracleBandBps: 150, maxClip: 20_000 },
  3: { label: "C", baseHalfSpreadBps: 40, maxSkewBps: 50, inventoryBandBps: 2000, oracleBandBps: 300, maxClip: 5_000 },
};

export const REGIMES: Record<Session, { label: string; spreadMulBps: number; clipMulBps: number }> = {
  regular: { label: "OPEN", spreadMulBps: 10_000, clipMulBps: 10_000 },
  extended: { label: "EXTENDED", spreadMulBps: 15_000, clipMulBps: 7_500 },
  closed: { label: "CLOSED", spreadMulBps: 30_000, clipMulBps: 5_000 },
};

export const FEES = { swapFeeBps: 2, rfqFeeBps: 2, spreadShareBps: 1000 } as const;

export const QUOTE_SYMBOL = "USDC";

export interface VaultMarket {
  symbol: string;
  name: string;
  tier: 1 | 2 | 3;
  /** Price in USDC for one whole token. */
  mid: number;
  /** The token's share of vault value in bps, where 5000 means on target. */
  inventoryRatioBps: number;
  /** Value of the vault, in USDC. */
  tvl: number;
  volume24h: number;
}

export const MARKETS: VaultMarket[] = [
  { symbol: "NVDAx", name: "NVIDIA xStock", tier: 1, mid: 177.4, inventoryRatioBps: 5128, tvl: 2118.37, volume24h: 294.42 },
  { symbol: "SPYx", name: "SPDR S&P 500 ETF xStock", tier: 1, mid: 643.56, inventoryRatioBps: 4966, tvl: 2459.62, volume24h: 386.97 },
  { symbol: "AAPLx", name: "Apple xStock", tier: 1, mid: 229.65, inventoryRatioBps: 5098, tvl: 1406.93, volume24h: 102.33 },
  { symbol: "MSFTx", name: "Microsoft xStock", tier: 1, mid: 510.2, inventoryRatioBps: 5145, tvl: 890.21, volume24h: 34 },
  { symbol: "QQQx", name: "Invesco QQQ ETF xStock", tier: 1, mid: 592.18, inventoryRatioBps: 4944, tvl: 1224.68, volume24h: 85.14 },
  { symbol: "TSLAx", name: "Tesla xStock", tier: 2, mid: 345.57, inventoryRatioBps: 4595, tvl: 403.46, volume24h: 25 },
  { symbol: "AMZNx", name: "Amazon xStock", tier: 2, mid: 230.7, inventoryRatioBps: 5000, tvl: 0, volume24h: 0 },
  { symbol: "PLTRx", name: "Palantir xStock", tier: 3, mid: 146.61, inventoryRatioBps: 5000, tvl: 0, volume24h: 0 },
];

export const marketBySymbol = Object.fromEntries(MARKETS.map((m) => [m.symbol, m])) as Record<string, VaultMarket>;

/**
 * Works out the US-equity session from the UTC clock (standard time): regular from 14:30 to 21:00,
 * extended from 09:00 to 14:30 and from 21:00 to 01:00, and closed at all other times and across the
 * weekend. On the venue, the session comes from the oracle's market status; this clock merely approximates it locally.
 */
export function currentSession(now: Date = new Date()): Session {
  const day = now.getUTCDay(); // 0 is Sunday through 6 for Saturday
  const minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const inWrappedTail = minutes < 60; // 00:00 to 01:00 counts as part of the prior day's extended session
  if (inWrappedTail) {
    const prev = (day + 6) % 7;
    return prev === 0 || prev === 6 ? "closed" : "extended";
  }
  if (day === 0 || day === 6) return "closed";
  if (minutes >= 870 && minutes < 1260) return "regular"; // 14:30 to 21:00
  if (minutes >= 540 && minutes < 870) return "extended"; // 09:00 to 14:30
  if (minutes >= 1260) return "extended"; // 21:00 to midnight
  return "closed";
}

export interface SwapQuoteResult {
  ok: boolean;
  reason?: string;
  session: Session;
  regimeLabel: string;
  mid: number;
  halfSpreadBps: number;
  skewBps: number;
  feeBps: number;
  /** Amount out, in tokens for a buy and in USDC for a sell. */
  amountOut: number;
  feeAmount: number;
  spreadAmount: number;
  /** Notional in the quote token at mid, which is the unit the clip is measured in. */
  notional: number;
  clip: number;
}

/** Prices a swap with the arcter-vault formula. `amountIn` is in USDC for a buy and in tokens for a sell. */
export function quoteSwap(
  market: VaultMarket,
  buyToken: boolean,
  amountIn: number,
  session: Session = currentSession()
): SwapQuoteResult {
  const tier = TIERS[market.tier];
  const regime = REGIMES[session];
  const base: SwapQuoteResult = {
    ok: false,
    session,
    regimeLabel: regime.label,
    mid: market.mid,
    halfSpreadBps: 0,
    skewBps: 0,
    feeBps: FEES.swapFeeBps,
    amountOut: 0,
    feeAmount: 0,
    spreadAmount: 0,
    notional: 0,
    clip: (tier.maxClip * regime.clipMulBps) / 10_000,
  };
  if (!Number.isFinite(amountIn) || amountIn <= 0) return { ...base, reason: "Type an amount to see a quote" };

  // Skew carries a sign and is positive when the vault is long the token; whichever side rebalances gets the tighter quote.
  let skew = (tier.maxSkewBps * (market.inventoryRatioBps - 5_000)) / tier.inventoryBandBps;
  skew = Math.max(-tier.maxSkewBps, Math.min(tier.maxSkewBps, skew));
  const half = Math.max(0, (tier.baseHalfSpreadBps * regime.spreadMulBps) / 10_000 + (buyToken ? -skew : skew));
  if (half + FEES.swapFeeBps > tier.oracleBandBps) {
    return { ...base, skewBps: Math.round(skew), reason: "No quote: this price would sit outside the oracle band" };
  }

  let out: SwapQuoteResult;
  if (buyToken) {
    const feeAmount = (amountIn * FEES.swapFeeBps) / 10_000;
    const net = amountIn - feeAmount;
    const ask = market.mid * (1 + half / 10_000);
    const amountOut = net / ask;
    out = {
      ...base,
      ok: true,
      halfSpreadBps: half,
      skewBps: Math.round(skew),
      amountOut,
      feeAmount,
      spreadAmount: net - amountOut * market.mid,
      notional: amountIn,
    };
  } else {
    const midValue = amountIn * market.mid;
    const bid = market.mid * (1 - half / 10_000);
    const gross = amountIn * bid;
    const feeAmount = (gross * FEES.swapFeeBps) / 10_000;
    out = {
      ...base,
      ok: true,
      halfSpreadBps: half,
      skewBps: Math.round(skew),
      amountOut: gross - feeAmount,
      feeAmount,
      spreadAmount: midValue - gross,
      notional: midValue,
    };
  }
  if (out.notional > out.clip) {
    return { ...out, ok: false, reason: `Above the ${out.clip.toLocaleString("en-US")} ${QUOTE_SYMBOL} clip in force during ${REGIMES[session].label}` };
  }
  return out;
}

export interface DemoFill {
  minutesAgo: number;
  symbol: string;
  side: "buy" | "sell";
  notional: number;
  venue: "vault" | "rfq";
  /** How far the fill sat from the oracle mid, as bps over mid paid by the taker. */
  executionBps: number;
}

/** Local fallback fills, mirroring the last day of seed.sql. */
export const DEMO_FILLS: DemoFill[] = [
  { minutesAgo: 15, symbol: "SPYx", side: "buy", notional: 180, venue: "vault", executionBps: 13 },
  { minutesAgo: 39, symbol: "NVDAx", side: "buy", notional: 63, venue: "vault", executionBps: 10 },
  { minutesAgo: 94, symbol: "AAPLx", side: "sell", notional: 47.33, venue: "vault", executionBps: 12 },
  { minutesAgo: 161, symbol: "SPYx", side: "buy", notional: 130, venue: "vault", executionBps: 14 },
  { minutesAgo: 219, symbol: "QQQx", side: "buy", notional: 46, venue: "vault", executionBps: 13 },
  { minutesAgo: 291, symbol: "NVDAx", side: "sell", notional: 90.42, venue: "vault", executionBps: 12 },
  { minutesAgo: 370, symbol: "MSFTx", side: "buy", notional: 34, venue: "vault", executionBps: 13 },
  { minutesAgo: 594, symbol: "NVDAx", side: "buy", notional: 141, venue: "rfq", executionBps: 10 },
  { minutesAgo: 683, symbol: "TSLAx", side: "buy", notional: 25, venue: "vault", executionBps: 24 },
  { minutesAgo: 801, symbol: "SPYx", side: "sell", notional: 76.97, venue: "vault", executionBps: 10 },
];

/** Entries for the Ledger's Change history. */
export const GOVERNANCE_LOG = [
  {
    date: "2026-08-30",
    action: "Markets opened",
    detail: "Eight listings added through create_market. Tier A: SPYx, QQQx, AAPLx, MSFTx and NVDAx. Tier B: TSLAx and AMZNx. Tier C: PLTRx.",
  },
  {
    date: "2026-08-30",
    action: "Parameters set",
    detail: "Tiers A, B and C use half-spreads of 10, 20 and 40 bps, with oracle bands of 75, 150 and 300 bps. EXTENDED scales spreads x1.5 and CLOSED x3.0. The venue fee is 2 bps plus 10% of spread. Parameter changes pass through arcter-config, its Squads multisig and a one-hour time lock.",
  },
  {
    date: "2026-08-29",
    action: "Programs deployed",
    detail: "Six programs registered: arcter-router, arcter-vault, arcter-rfq, arcter-oracle, arcter-access and arcter-config.",
  },
] as const;
