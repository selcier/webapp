import { ArrowUpRight, Mail, Plus } from "lucide-react";
import { SITE } from "@/lib/site";
import { Section } from "./Section";

const FAQS = [
  {
    q: "How do I trade on Arcter?",
    a: "Connect a Solana wallet, pick two assets, read the itemized price and sign once. The ticket shows mid, spread, skew and fee before you sign, and the fill record keeps the same lines. A failed transaction still costs its SOL network fee. An audit is in progress, and no completed audit report has been published.",
  },
  {
    q: "Who can use it?",
    a: "US persons and other excluded jurisdictions cannot use Arcter. Issuers set those lists, and they differ by token and channel. Kraken's xStocks pages exclude the US, Canada, the UK and Australia plus prohibited regions, while Ondo limits UK, Swiss and some EEA access to qualified or professional clients. Each market takes the strictest reading that applies.",
  },
  {
    q: "Does holding NVDAx make me an NVIDIA shareholder?",
    a: "No. xStocks are 1:1 backed tracker certificates from Backed Assets (JE) Limited. They give price exposure and no shareholder rights. A Scaled UI Amount multiplier reflects splits and dividends while your raw balance stays put. Mint settings also let an issuer freeze tokens or move them out of any account, so issuer risk stays with the holder.",
  },
  {
    q: "Why is a Sunday quote wider than a Tuesday one?",
    a: "The share's exchange is closed, so depositors carry the gap until it reopens. In CLOSED the spread is ×3.0 and the clip ×0.5. Pre-market and after-hours run as EXTENDED, at ×1.5 and ×0.75. The ticket names the regime and multiplier ahead of your signature, and a trade that can wait for OPEN should cost less.",
  },
  {
    q: "How do vault depositors earn, and what can they lose?",
    a: "Income is spread from fills, less a 10% protocol share, and it accrues to share value. There are no token emissions or points. Losses can come from inventory held through a price gap or from an issuer: a freeze can hold the token side of a withdrawal, and a permanent delegate can move tokens out of a vault. The unaffected USDC side can still leave. No outcome is guaranteed.",
  },
  {
    q: "Who can change the rules or the code?",
    a: "Programs are upgradeable through a Squads multisig with a time lock, so the code can change. Parameter changes take the same path, with reasons published first. Verified builds let anyone match deployed code to its source. A guardian can pause trading but cannot move funds, and quotes come from the public formula, so the team has no way to set one by hand.",
  },
  {
    q: "Can other apps integrate with Arcter?",
    a: "Yes. Attestations are held per wallet, so any client can call the router directly, and the router applies the same checks whichever app sends the transaction. The quote formula is public, so an integrator can rebuild a vault price from the same oracle report and Market account and compare it with the fill record.",
  },
] as const;

export function Questions() {
  return (
    <Section
      id="help"
      tone="paper"
      title={
        <>
          Straight answers, <em>risks</em> included
        </>
      }
      lede="Seven things a careful reader would want to know before trusting a venue. The documentation goes further, with quote math, failure cases and open questions."
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[18px] border border-arc-line bg-arc-canvas p-6">
            <p className="h-card text-[16px] text-arc-ink">Need more detail?</p>
            <p className="mt-3 text-[15px] leading-relaxed text-arc-ink-3">
              Only <span className="num font-semibold text-arc-ink">{FAQS.length}</span> topics fit here. For the rest, look
              us up on GitHub or send an email.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={SITE.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                Arcter on GitHub
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
              <a href={`mailto:${SITE.contactEmail}`} className="btn btn-ghost btn-sm">
                <Mail className="size-4" aria-hidden="true" />
                Send an email
              </a>
            </div>
          </div>
        </aside>

        <div className="divide-hair border-y border-arc-line">
          {FAQS.map((f, i) => (
            <details key={f.q} className="group" open={i === 0}>
              <summary className="flex min-h-[64px] list-none items-start gap-5 py-5 [&::-webkit-details-marker]:hidden">
                <h3 className="h-card flex-1 text-[17px] text-arc-ink md:text-[18px]">{f.q}</h3>
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-arc-line-strong text-arc-ink-3 transition-[transform,color,background-color,border-color] duration-300 group-open:rotate-45 group-open:border-arc-ink group-open:bg-arc-ink group-open:text-white">
                  <Plus className="size-4" aria-hidden="true" />
                </span>
              </summary>
              <p className="pb-6 pr-12 text-[15.5px] leading-[1.7] text-arc-ink-3">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
