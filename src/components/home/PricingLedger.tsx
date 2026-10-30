import { Cpu, RotateCcw, Scale } from "lucide-react";
import { Section } from "./Section";

const MID = 177.4;
const PRICE = (MID * 1.001) / (1 - 0.0002); // half-spread applied to the mid, fee taken from the quote side
const BAND_BPS = 75;
const PRICE_BPS = ((PRICE - MID) / MID) * 10_000; // where the worked price sits inside the band

const fmt = (n: number, d = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const LINES = [
  {
    op: "",
    term: "verified mid",
    figure: `${fmt(MID)} USDC`,
    note: "Chainlink Data Streams is the primary source, with Pyth as a cross-check. A stale report, or a gap between the two beyond a set band, halts the market.",
  },
  {
    op: "+",
    term: "half-spread × regime",
    figure: "10.0 bps, ×1.0",
    note: "Tier A starts from 10 bps per side. The regime then multiplies it: OPEN keeps ×1.0, EXTENDED applies ×1.5 and CLOSED applies ×3.0.",
  },
  {
    op: "±",
    term: "skew",
    figure: "+0 bps",
    note: "A vault away from its 50/50 target charges more on the crowded side and less on the helpful side, within ±15 bps on Tier A.",
  },
  {
    op: "+",
    term: "protocol fee",
    figure: "2.0 bps",
    note: "A distinct ticket line and a distinct field in the fill record. The price itself never absorbs it.",
  },
] as const;

const GUARANTEES = [
  {
    icon: Cpu,
    title: "Recomputed inside your transaction",
    body: "The program rebuilds the vault price from the signed report and the Market account as it executes. A front end cannot quote you outside the formula.",
  },
  {
    icon: Scale,
    title: "A maker must improve on the vault",
    body: "An ed25519-signed quote from an approved maker must sit inside the oracle band and pay you more than the vault. Signing off-chain costs a maker nothing.",
  },
  {
    icon: RotateCcw,
    title: "You sign the minimum",
    body: "Each swap carries a minimum output and an expiry, and a blockhash lapses after about 150 slots anyway. Keep the minimum tight, since sandwich attacks exist on Solana.",
  },
] as const;

/** An operator sitting in the gutter between two terms: above the card when stacked, to its left in a row. */
function Operator({ op }: { op: string }) {
  return (
    <span
      className="absolute left-1/2 top-0 z-10 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-arc-line bg-arc-paper text-[15px] font-medium leading-none text-arc-accent-ink shadow-[var(--shadow-sheet)] lg:-left-2 lg:top-1/2 lg:-translate-x-1/2"
      aria-hidden="true"
    >
      {op}
    </span>
  );
}

export function PricingLedger() {
  const marker = 50 + (PRICE_BPS / BAND_BPS) * 50; // percent along a -75 to +75 bps track

  return (
    <Section
      id="formula"
      tone="paper"
      title={
        <>
          Four terms, and <em>anyone</em> can redo the sum
        </>
      }
      lede="Reserves decide how wide a quote is, never where it sits. The formula is public, so a holder with the same inputs reaches the same result. Figures below work through one NVDAx quote."
    >
      {/* The equation, written out once */}
      <div className="flex flex-col gap-3 rounded-[16px] border border-arc-line bg-arc-canvas px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span className="caps">Public formula</span>
        <p className="font-mono text-[clamp(13px,1.8vw,16px)] leading-relaxed text-arc-ink">
          price <span className="text-arc-accent-ink">=</span> verified mid <span className="text-arc-accent-ink">+</span> half-spread{" "}
          <span className="text-arc-accent-ink">×</span> regime <span className="text-arc-accent-ink">±</span> skew{" "}
          <span className="text-arc-accent-ink">+</span> protocol fee
        </p>
      </div>

      {/* Each term as its own sheet */}
      <ol className="mt-8 grid gap-6 lg:mt-4 lg:grid-cols-4 lg:gap-4">
        {LINES.map((l, i) => (
          <li key={l.term} className="card relative flex flex-col p-6">
            {l.op && <Operator op={l.op} />}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] font-medium text-arc-ink-3">{l.term}</span>
              <span className="text-[11.5px] text-arc-ink-4">Term {i + 1}</span>
            </div>
            <p className="num mt-5 text-[26px] font-semibold leading-none tracking-[-0.03em] text-arc-ink">{l.figure}</p>
            <div className="rule my-5" />
            <p className="text-[14.5px] leading-relaxed text-arc-ink-3">{l.note}</p>
          </li>
        ))}
      </ol>

      {/* The result, held inside its band */}
      <div className="card-stage relative mt-6 grid gap-8 p-6 sm:p-8 lg:mt-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-12">
        <span
          className="absolute left-1/2 top-0 z-10 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-arc-ink text-[15px] font-semibold leading-none text-arc-canvas"
          aria-hidden="true"
        >
          =
        </span>
        <div>
          <span className="text-[13px] text-arc-ink-3">Worked quote</span>
          <p className="mt-4 flex items-baseline gap-3">
            <span className="num text-[clamp(44px,6vw,64px)] font-semibold leading-none tracking-[-0.045em] text-arc-ink">{fmt(PRICE)}</span>
            <span className="text-[14px] font-medium text-arc-ink-4">USDC</span>
          </p>
          <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-arc-ink-3">
            A mid of 177.40 USDC, worked term by term. The program rejects a Tier A fill more than 75 bps from the verified mid.
          </p>
        </div>

        <figure aria-label={`Quoted price ${PRICE_BPS.toFixed(1)} bps over mid, within an oracle band of ${BAND_BPS} bps on each side`}>
          <div className="flex justify-between text-[12px] text-arc-ink-4" aria-hidden="true">
            <span>-{BAND_BPS} bps</span>
            <span>mid</span>
            <span>+{BAND_BPS} bps</span>
          </div>
          <div className="relative mt-3 h-12" aria-hidden="true">
            <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-arc-sunk" />
            {Array.from({ length: 7 }).map((_, i) => (
              <span
                key={i}
                className="absolute top-1/2 h-4 w-px -translate-y-1/2 bg-arc-line-strong"
                style={{ left: `${(i / 6) * 100}%` }}
              />
            ))}
            <span className="absolute left-1/2 top-0 h-full w-px bg-arc-ink-3" />
            <span
              className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-white/30"
              style={{ left: "50%", width: `${marker - 50}%` }}
            />
            <span
              className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-arc-canvas bg-white ring-1 ring-white/40"
              style={{ left: `${marker}%` }}
            />
          </div>
          <figcaption className="mt-3 flex items-center justify-between gap-4 text-[12.5px]">
            <span className="text-arc-ink-3">verified mid {fmt(MID)}</span>
            <span className="num font-semibold text-arc-ink">+{PRICE_BPS.toFixed(1)} bps</span>
          </figcaption>
        </figure>
      </div>

      <ol className="mt-16 grid gap-x-10 gap-y-10 md:grid-cols-3">
        {GUARANTEES.map((g) => (
          <li key={g.title}>
            <span className="grid size-10 place-items-center rounded-[10px] bg-arc-accent-soft text-arc-accent-ink">
              <g.icon className="size-[18px]" aria-hidden="true" />
            </span>
            <h3 className="h-card mt-5 text-[18px] text-arc-ink">{g.title}</h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-arc-ink-3">{g.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
