import { Section } from "./Section";

/** The four facts with a number at their heart, set large. */
const HEADLINE = [
  { label: "Slot time", fig: "~400 ms", note: "unchanged by the Votor upgrade" },
  { label: "Finality target", fig: "~150 ms", note: "Votor, live since 21 Oct 2026" },
  { label: "Base fee", fig: "5,000", note: "lamports per signature, paid in SOL" },
  { label: "xStocks on Solana", fig: "100+", note: "and 250+ Ondo instruments" },
] as const;

/** The rest of the datasheet. */
const SPECS = [
  { label: "Arcter programs", value: "Upgradeable through a Squads multisig with a time lock" },
  { label: "Consensus", value: "Proof of Stake, leaders on a published schedule" },
  { label: "xStocks issuer", value: "Backed Assets (JE) Limited, Jersey, as Token-2022 mints" },
  { label: "Corporate actions", value: "Scaled UI Amount multiplier on xStocks mints" },
  { label: "Oracle design", value: "Chainlink Data Streams, with a Pyth cross-check" },
  { label: "Settlement asset", value: "USDC from Circle, native on Solana" },
  { label: "Transaction limits", value: "1,232 bytes, blockhash expiry after about 150 slots" },
  { label: "Last cluster halt", value: "6 Feb 2024, 1,000 days clear reported about 2 Nov 2026" },
] as const;

const REASONS = [
  "Token-2022 settings sit on the mint, so a venue can read hooks, delegates and multipliers. Issuers can still freeze or move tokens.",
  "Solana reported about $4.4B of tokenized stock volume in Sept 2026, so the flow Arcter serves already runs here.",
  "Low base fees keep modest tickets worth executing and short slots narrow the quote gap. Congestion and RPC failures still occur.",
] as const;

const pad = (n: number) => String(n).padStart(2, "0");

/** The venue's underlying chain, laid out as a spec sheet on a night band: four headline figures, then the datasheet. */
export function ChainBand() {
  return (
    <Section
      id="network"
      tone="night"
      title={
        <>
          Solana, <em>with the dates</em> attached
        </>
      }
      lede="Arcter runs on Solana. This sheet describes the network and its assets as of 7 Nov 2026, so each figure can be checked against its date. Network facts drift, and the date says when they held."
    >
      <dl className="grid gap-px overflow-hidden rounded-[16px] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
        {HEADLINE.map((h) => (
          <div key={h.label} className="flex min-h-[188px] flex-col bg-arc-night-2 p-6">
            <dt className="text-[13px] font-medium text-white/55">{h.label}</dt>
            <dd className="mt-auto pt-8">
              <span className="num block text-[clamp(44px,4.6vw,60px)] font-medium leading-none tracking-[-0.05em] text-white">{h.fig}</span>
              <span className="mt-3 block text-[14px] text-white/55">{h.note}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 overflow-hidden rounded-[16px] border border-white/10 bg-white/[0.02]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 md:px-7">
          <span className="text-[14px] font-semibold text-white">Datasheet, 7 Nov 2026</span>
          <span className="num text-[12px] text-white/45">{SPECS.length} rows</span>
        </div>
        <dl className="grid md:grid-cols-2">
          {SPECS.map((s, i) => (
            <div
              key={s.label}
              className={
                "flex items-baseline gap-4 border-white/10 px-6 py-4 md:px-7" +
                (i > 0 ? " border-t" : "") +
                (i === 1 ? " md:border-t-0" : "") +
                (i % 2 === 1 ? " md:border-l" : "")
              }
            >
              <dt className="flex min-w-0 flex-1 items-baseline gap-4">
                <span className="shrink-0 text-[13.5px] text-white/55">{s.label}</span>
                <span className="hidden flex-1 border-b border-dotted border-white/15 sm:block" aria-hidden="true" />
              </dt>
              <dd className="text-right text-[13.5px] font-medium text-white">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <ol className="mt-14 grid gap-8 md:grid-cols-3">
        {REASONS.map((r, i) => (
          <li key={r} className="relative border-t border-white/15 pt-5">
            <span className="absolute -top-px left-0 h-px w-16 bg-gradient-to-r from-white to-transparent" aria-hidden="true" />
            <span className="num font-mono text-[12px] text-white/45">{pad(i + 1)}</span>
            <p className="mt-3 text-[15px] leading-[1.65] text-white/70">{r}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
