import { Ban, ChartLine, Code, DoorOpen, Lock, Receipt, ShieldCheck, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Section } from "./Section";

const ENTRIES = [
  { title: "Itemized fill records", icon: Receipt, body: "Mid, spread, skew and fee become separate fields in each fill event, matching the ticket you signed.", check: "reconcile a fill against Solscan or the Solana Explorer" },
  { title: "A hard oracle band", icon: ShieldCheck, body: "Any fill beyond the band is rejected by program invariant, whichever lane it came from.", check: "compare any fill price with the band at its slot" },
  { title: "Published fill quality", icon: ChartLine, body: "The gap between every fill and the reference price is reported with nothing filtered out.", check: "recompute any figure from on-chain events" },
  { title: "No payment for order flow", icon: Ban, body: "The router gives no liquidity source preference. It picks the better price it can verify.", check: "work out the cheaper lane from a fill's inputs" },
  { title: "Custody stays with you", icon: Lock, body: "Each trade moves tokens under your own signature, and no standing approval is ever requested.", check: "inspect the signer list on any swap" },
  { title: "No Arcter condition on exits", icon: DoorOpen, body: "Withdrawals continue where safe, HALTED included. Issuers sit outside this: they can freeze tokens or move them, even from a vault.", check: "read each mint's extensions and the Ledger halt record" },
  { title: "Upgrades come with notice", icon: Timer, body: "Programs stay upgradeable, so their code can change. Upgrades and parameter changes pass a Squads multisig and its time lock.", check: "read the upgrade authority on each program account" },
  { title: "Verified builds", icon: Code, body: "Every program ships as a verified build. An audit is in progress, and no completed audit report has been published.", check: "rebuild from the tagged source and compare" },
] as const;

/** Bento rhythm on large screens: three rows of four columns, with four of the cards running double. */
const WIDE = new Set([0, 5, 6, 7]);

export function PromiseGrid() {
  return (
    <Section
      id="guarantees"
      tone="canvas"
      title={
        <>
          What we <em>owe</em> you on every trade
        </>
      }
      lede="Each commitment is paired with a check you can run yourself, from public on-chain data. A failed check counts as an incident, with a written post-mortem within 14 days."
    >
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ENTRIES.map((e, i) => {
          const Icon = e.icon;
          const wide = WIDE.has(i);
          return (
            <li key={e.title} className={cn("card card-hover flex flex-col overflow-hidden", wide && "lg:col-span-2")}>
              <div className="flex flex-1 flex-col p-6">
                <span className="grid size-9 place-items-center rounded-[10px] bg-arc-accent-soft text-arc-accent-ink">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <h3 className={cn("mt-6 text-arc-ink", wide ? "h-section text-[28px]" : "h-card text-[17px]")}>{e.title}</h3>
                <p className={cn("mt-2.5 leading-relaxed text-arc-ink-3", wide ? "max-w-[46ch] text-[15px]" : "text-[14px]")}>
                  {e.body}
                </p>
              </div>
              <p className="flex items-baseline gap-2 border-t border-arc-line bg-arc-canvas px-6 py-3.5 text-[13px] leading-relaxed">
                <span className="shrink-0 font-semibold text-arc-accent-ink">Check</span>
                <span className="text-arc-ink-2">{e.check}</span>
              </p>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
