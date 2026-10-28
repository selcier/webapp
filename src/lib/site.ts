/** Brand constants used throughout the site. */
export const SITE = {
  name: "Arcter",
  domain: "arcter.xyz",
  url: "https://arcter.xyz",
  xHandle: "@arcterdotxyz",
  xUrl: "https://x.com/arcterdotxyz",
  githubUrl: "https://github.com/arcterdotxyz",
  contactEmail: "hello@arcter.xyz",
  appHref: "/platform",
} as const;

/** Homepage sections, in reading order. */
export const NAV_LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "Quote math", href: "#formula" },
  { label: "Sessions", href: "#hours" },
  { label: "Pool comparison", href: "#versus" },
  { label: "Solana", href: "#network" },
  { label: "Commitments", href: "#guarantees" },
  { label: "Questions", href: "#help" },
] as const;

/** The header carries only the main destinations; the footer links to every section. */
export const HEADER_LINKS = NAV_LINKS.filter((l) => ["Platform", "Quote math", "Sessions", "Questions"].includes(l.label));
