import { Check, Minus } from "lucide-react";
import { Section } from "./Section";

const ROWS = [
  { what: "The midpoint", them: "The ratio of the two reserves, which moves when someone trades", us: "A verified oracle report, with an oracle band around every fill" },
  { what: "A closed exchange", them: "Usually no separate charge for gap risk", us: "CLOSED regime: spread ×3.0 and clip ×0.5, both printed on the ticket" },
  { what: "How depositors earn", them: "Fees, less what arbitrage takes on each outside move", us: "Spread around the mid, with skew paying to rebalance. Inventory risk remains" },
  { what: "Splits and multipliers", them: "Handling varies by pool and by integration", us: "Math in raw units, multiplier read per quote, HALTED during an issuer or feed pause" },
  { what: "Bigger tickets", them: "Cost rises with size along the curve", us: "Approved makers sign quotes held inside the oracle band" },
  { what: "Showing the cost", them: "Often shown as one output figure", us: "Mid, spread, skew and fee on separate lines, then in the fill record" },
] as const;

export function CompareTable() {
  return (
    <Section
      id="versus"
      tone="canvas"
      title={
        <>
          A listed share <em>already</em> has a price
        </>
      }
      lede="Constant-product pools suit tokens whose price forms on-chain. An equity token tracks a price formed on an exchange, so Arcter starts from that reference and builds the quote around it. Here is how the two approaches differ."
    >
      {/* Desktop: a three-column matrix with the Arcter column raised on its own sheet. */}
      <div className="relative hidden md:block">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-[40%] rounded-[20px] border border-arc-line bg-arc-paper shadow-[var(--shadow-stage)]"
          aria-hidden="true"
        />
        <table className="relative w-full table-fixed border-separate border-spacing-0 text-left">
          <colgroup>
            <col className="w-[20%]" />
            <col className="w-[40%]" />
            <col className="w-[40%]" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="caps px-6 pb-5 pt-7 align-bottom">Question</th>
              <th scope="col" className="px-6 pb-5 pt-7 align-bottom font-normal">
                <span className="text-[13px] font-medium text-arc-ink-4">General-purpose DEX</span>
                <span className="h-card mt-2 block text-[18px] text-arc-ink-3">Constant-product pool</span>
              </th>
              <th scope="col" className="px-7 pb-5 pt-7 align-bottom font-normal">
                <span className="text-[12.5px] text-arc-ink-3">Reference-priced</span>
                <span className="h-card mt-2 block text-[18px] text-arc-ink">Arcter</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={r.what} className="align-top">
                <th scope="row" className="border-t border-arc-line px-6 py-5 text-[15px] font-semibold text-arc-ink">
                  {r.what}
                </th>
                <td className="border-t border-arc-line px-6 py-5">
                  <span className="flex gap-3 text-[14.5px] leading-relaxed text-arc-ink-3">
                    <Minus className="mt-[3px] size-4 shrink-0 text-arc-ink-4" aria-hidden="true" />
                    {r.them}
                  </span>
                </td>
                <td className={"border-t border-arc-line px-7 py-5" + (i === ROWS.length - 1 ? " pb-7" : "")}>
                  <span className="flex gap-3 text-[14.5px] leading-relaxed text-arc-ink">
                    <span className="mt-[2px] grid size-[18px] shrink-0 place-items-center rounded-full bg-arc-ink text-arc-canvas">
                      <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                    {r.us}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: one card per property, the two answers stacked. */}
      <ul className="flex flex-col gap-4 md:hidden">
        {ROWS.map((r) => (
          <li key={r.what} className="card overflow-hidden">
            <div className="card-head">
              <h3 className="h-card text-[16px] text-arc-ink">{r.what}</h3>
            </div>
            <dl className="divide-hair">
              <div className="flex gap-3 px-5 py-4">
                <Minus className="mt-[3px] size-4 shrink-0 text-arc-ink-4" aria-hidden="true" />
                <div>
                  <dt className="text-[12.5px] font-medium text-arc-ink-4">Constant-product pool</dt>
                  <dd className="mt-1.5 text-[14.5px] leading-relaxed text-arc-ink-3">{r.them}</dd>
                </div>
              </div>
              <div className="flex gap-3 bg-arc-accent-soft/60 px-5 py-4">
                <Check className="mt-[3px] size-4 shrink-0 text-arc-accent-ink" aria-hidden="true" />
                <div>
                  <dt className="text-[12.5px] font-medium text-arc-accent-ink">Arcter</dt>
                  <dd className="mt-1.5 text-[14.5px] leading-relaxed text-arc-ink">{r.us}</dd>
                </div>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <p className="mx-auto mt-12 max-w-2xl text-center text-[15px] leading-relaxed text-arc-ink-3">
        Pools remain a good fit for assets with no outside price. Proprietary AMMs already quote crypto majors
        well, though their logic is private. Arcter&apos;s bet is a public formula for assets that have a reference.
      </p>
    </Section>
  );
}
