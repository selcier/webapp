import { BriefcaseBusiness, FileSignature, Layers, Route, Users, Vault } from "lucide-react";
import { Section } from "./Section";

const LANES = [
  {
    name: "Vault lane",
    icon: Vault,
    does: "One Market account per asset holds that asset and USDC, and quotes both sides around the verified mid. Tier, regime and inventory set the width. Everyday sizes fill here.",
    gets: "You can recompute a fill from public inputs, and depositors are paid from spread. They still carry inventory risk, gap risk and issuer risk.",
  },
  {
    name: "Maker lane",
    icon: FileSignature,
    does: "Approved makers sign short-lived ed25519 quotes off-chain. The taker's transaction carries the signature, and the native Ed25519 program verifies it during settlement.",
    gets: "Larger sizes avoid walking a curve. A PDA blocks replay, each quote has to sit inside the oracle band, and both legs settle together or not at all.",
  },
  {
    name: "Router",
    icon: Route,
    does: "The arcter-router program is the single entry point. It enforces your minimum output and expiry, compares the two lanes, and shows you one price on one ticket.",
    gets: "A stock-to-stock trade runs as two legs through USDC under one signature. If a leg fails, the transaction reverts and no tokens move.",
  },
] as const;

const FIGURES = [
  { v: "75 bps", k: "Tier A oracle band", s: "A hard limit for vault and maker fills alike. The program rejects any Tier A fill further than this from the verified mid." },
  { v: "2 bps", k: "Protocol fee", s: "A separate ticket line. The protocol also keeps 10% of the spread income of each vault, and the SOL network fee comes on top." },
  { v: "None", k: "Held by Arcter", s: "Tokens sit in your wallet or in vault accounts governed by program rules. Your signature moves them, with no standing approvals. Issuer powers still apply." },
] as const;

const SEATS = [
  { who: "Takers", icon: Users, what: "Read the regime and each cost on one ticket, then sign once. Not available to US persons or other excluded jurisdictions." },
  { who: "Depositors", icon: Layers, what: "Deposit into a vault and earn spread income. Exit pro rata in kind. An issuer can freeze tokens or move them, including out of a vault." },
  { who: "Makers", icon: BriefcaseBusiness, what: "Signing off-chain has no network cost. Your quote wins only by paying more than the vault, inside the band, and the taker's transaction settles it." },
] as const;

export function VenueLanes() {
  return (
    <Section
      id="routing"
      tone="paper"
      title={
        <>
          Two sources of liquidity, <em>one</em> ticket
        </>
      }
      lede="Arcter runs two lanes behind a single router. Oracle-centered vaults take everyday sizes, and approved makers sign quotes for larger orders. You see the better of the two as one price."
    >
      <ol className="grid gap-4 md:grid-cols-3">
        {LANES.map((l, i) => {
          const Icon = l.icon;
          return (
            <li key={l.name} className="card card-hover flex flex-col p-6 md:p-7">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-[10px] bg-arc-accent-soft text-arc-accent-ink">
                  <Icon className="size-[18px]" aria-hidden="true" />
                </span>
                <span className="num text-[12px] text-arc-ink-4">Component {i + 1}</span>
              </div>
              <h3 className="h-section mt-6 text-[28px] text-arc-ink">{l.name}</h3>
              <p className="mt-5 text-[13px] font-semibold text-arc-ink">How it works</p>
              <p className="mt-2 text-[15px] leading-[1.65] text-arc-ink-2">{l.does}</p>
              <div className="rule my-6" />
              <p className="text-[13px] font-semibold text-arc-ink">The result</p>
              <p className="mt-2 text-[15px] leading-[1.65] text-arc-ink-3">{l.gets}</p>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 grid overflow-hidden rounded-[18px] border border-arc-line bg-arc-canvas sm:grid-cols-3">
        {FIGURES.map((f, i) => (
          <div key={f.k} className={"p-6 md:p-7" + (i > 0 ? " border-t border-arc-line sm:border-l sm:border-t-0" : "")}>
            <p className="text-[13px] font-medium text-arc-ink-3">{f.k}</p>
            <p className="num mt-4 text-[clamp(36px,4vw,46px)] font-semibold leading-none tracking-[-0.045em] text-arc-ink">{f.v}</p>
            <p className="mt-4 text-[14px] leading-relaxed text-arc-ink-3">{f.s}</p>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <p className="caps">Participants</p>
        <ul className="mt-5 grid gap-8 md:grid-cols-3">
          {SEATS.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.who} className="flex gap-4 border-t border-arc-line pt-5">
                <Icon className="mt-0.5 size-[18px] shrink-0 text-arc-accent-ink" aria-hidden="true" />
                <div>
                  <h3 className="h-card text-[16px] text-arc-ink">{s.who}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-arc-ink-3">{s.what}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
