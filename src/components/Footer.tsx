import Link from "next/link";
import { Logo } from "@/components/Logo";
import { NAV_LINKS, SITE } from "@/lib/site";

const PRODUCT = [
  { label: "Overview", href: SITE.appHref },
  { label: "Trade", href: "/platform/swap" },
  { label: "Vaults", href: "/platform/liquidity" },
  { label: "Ledger", href: "/platform/explorer" },
] as const;

const SECTIONS = NAV_LINKS.map((l) => ({ label: l.label, href: l.href }));

const OUTSIDE = [
  { label: `${SITE.xHandle} on X`, href: SITE.xUrl },
  { label: "GitHub", href: SITE.githubUrl },
  { label: "Contact by email", href: `mailto:${SITE.contactEmail}` },
] as const;

/** Mark and one line of purpose on the left, three link columns on the right, small print beneath. */
export function Footer() {
  return (
    <footer className="border-t border-arc-line bg-arc-canvas">
      <div className="page pb-10 pt-16 md:pt-20">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo size={28} />
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-arc-ink-3">
              A self-custodial exchange for tokenized stocks on Solana, settled in USDC. Not available to US persons
              or other excluded jurisdictions.
            </p>
          </div>
          <Column title="Product" links={PRODUCT} />
          <Column title="On this page" links={SECTIONS} />
          <Column title="Contact" links={OUTSIDE} external />
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-arc-line pt-6 text-[13px] text-arc-ink-4 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; 2026 Arcter</span>
          <span className="inline-flex items-center gap-2">
            Built on Solana. Upgrades pass a time-locked multisig.
          </span>
        </div>
      </div>
    </footer>
  );
}

function Column({
  title,
  links,
  external = false,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
  external?: boolean;
}) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-arc-ink">{title}</p>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.href}>
            {external ? (
              <a
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-[14px] text-arc-ink-3 transition-colors hover:text-arc-ink"
              >
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="text-[14px] text-arc-ink-3 transition-colors hover:text-arc-ink">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
