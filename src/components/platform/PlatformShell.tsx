"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Briefcase,
  ChevronRight,
  KeyRound,
  Droplets,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useSession } from "./PlatformProviders";
import { useNow } from "./usePlatformData";
import { shortAddress } from "@/lib/platform/format";
import { REGIMES, currentSession } from "@/lib/platform/markets";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };

const GROUPS: readonly { label: string; items: readonly NavItem[] }[] = [
  {
    label: "Venue",
    items: [
      { href: "/platform", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/platform/swap", label: "Trade", icon: ArrowRightLeft },
      { href: "/platform/liquidity", label: "Vaults", icon: Droplets },
    ],
  },
  {
    label: "Personal",
    items: [
      { href: "/platform/portfolio", label: "Holdings", icon: Briefcase },
      { href: "/platform/settings", label: "Account", icon: Settings },
    ],
  },
  {
    label: "Open record",
    items: [{ href: "/platform/explorer", label: "Ledger", icon: Search }],
  },
];

const NAV: NavItem[] = GROUPS.flatMap((g) => [...g.items]);

const SESSION_TEXT = {
  regular: "text-arc-ink",
  extended: "text-arc-ink-2",
  closed: "text-arc-ink-3",
} as const;

const SESSION_DOT = {
  regular: "bg-arc-ink",
  extended: "bg-arc-ink-3",
  closed: "bg-arc-ink-4",
} as const;

const SESSION_NAME = { regular: "Market open", extended: "Extended", closed: "Market closed" } as const;

function utcClock(now: number) {
  const d = new Date(now);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

/**
 * The venue's chrome. On desktop a fixed sidebar holds the mark and the grouped destinations, and a
 * sticky top bar over the content carries the breadcrumb, the live session and the account. Below
 * the lg breakpoint the sidebar becomes a drawer opened from a compact top bar.
 */
export function PlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { ready, authenticated, walletAddress, email, login, logout, sessionError } = useSession();
  const now = useNow();
  const session = currentSession(new Date(now));
  const regime = REGIMES[session];
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));
  const current = NAV.find((item) => isActive(item.href, item.exact));
  const group = GROUPS.find((g) => g.items.some((i) => i.href === current?.href));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  const nav = (
    <nav aria-label="Main sections" className="space-y-6">
      {GROUPS.map((g) => (
        <div key={g.label}>
          <p className="px-3 pb-2 text-[11.5px] font-medium text-arc-ink-4">{g.label}</p>
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex h-9 items-center gap-3 rounded-[9px] px-3 text-[13.5px] font-medium transition-colors",
                      active
                        ? "bg-arc-hover text-arc-ink ring-1 ring-arc-line-strong"
                        : "text-arc-ink-3 hover:bg-arc-sunk hover:text-arc-ink"
                    )}
                  >
                    <item.icon
                      className={cn("size-4 shrink-0 transition-colors", active ? "text-arc-accent-ink" : "text-arc-ink-4 group-hover:text-arc-ink-3")}
                      aria-hidden="true"
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const sessionPill = (compact = false) => (
    <div
      className="flex h-8 items-center gap-2 rounded-[8px] border border-arc-line bg-arc-paper px-3 text-[12.5px]"
      title={`Current session: spread ×${(regime.spreadMulBps / 10_000).toFixed(1)}, clip ×${(regime.clipMulBps / 10_000).toFixed(2)}`}
    >
      <span className={cn("h-3 w-[3px] rounded-[1px]", SESSION_DOT[session])} aria-hidden="true" />
      <span className={cn("font-medium", SESSION_TEXT[session])}>
        <span className="sr-only">Session for US equities: </span>
        {SESSION_NAME[session]}
      </span>
      {!compact && (
        <>
          <span className="h-3 w-px bg-arc-line-strong" aria-hidden="true" />
          <span className="num text-arc-ink-3">spreads ×{(regime.spreadMulBps / 10_000).toFixed(1)}</span>
          <span className="h-3 w-px bg-arc-line-strong" aria-hidden="true" />
          <span className="num text-arc-ink-3" suppressHydrationWarning>
            {utcClock(now)} UTC
          </span>
        </>
      )}
    </div>
  );

  const accountButton = !ready ? (
    <div className="h-8 w-28 animate-pulse rounded-full bg-arc-sunk" />
  ) : authenticated ? (
    <div className="flex h-8 items-center gap-2 rounded-[8px] border border-arc-line bg-arc-paper pl-1 pr-3">
      <Avatar size="sm" />
      <span className="num text-[12.5px] font-medium text-arc-ink">{shortAddress(walletAddress)}</span>
    </div>
  ) : (
    <button type="button" onClick={login} className="btn btn-primary btn-sm h-8">
      Sign in
    </button>
  );

  const account = !ready ? (
    <div className="h-[52px] animate-pulse rounded-[12px] bg-arc-sunk" />
  ) : authenticated ? (
    <div className="flex items-center gap-3 rounded-[12px] p-2 pl-2.5 transition-colors hover:bg-arc-sunk">
      <Avatar />
      <div className="min-w-0 flex-1">
        <div className="num truncate text-[13px] font-medium text-arc-ink">{shortAddress(walletAddress)}</div>
        <div className="truncate text-[12px] text-arc-ink-4">{email ?? "Wallet sign-in"}</div>
      </div>
      <button
        type="button"
        onClick={() => void logout()}
        aria-label="Sign out"
        title="Sign out"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-[9px] text-arc-ink-4 transition-colors hover:bg-arc-paper hover:text-arc-ink"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  ) : (
    // On desktop the top bar carries the sign-in button, so the rail only needs it inside the mobile drawer.
    <button type="button" onClick={login} className="btn btn-primary w-full lg:hidden">
      Sign in
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </button>
  );

  const rail = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center px-5">
        <Logo size={26} />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-5">{nav}</div>
      <div className="space-y-2 border-t border-arc-line p-3">
        <Link
          href="/"
          onClick={close}
          className="flex h-9 items-center gap-3 rounded-[9px] px-3 text-[13px] text-arc-ink-3 transition-colors hover:bg-arc-sunk hover:text-arc-ink"
        >
          <ArrowLeft className="size-4 text-arc-ink-4" aria-hidden="true" />
          Return to arcter.xyz
        </Link>
        {account}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-arc-canvas">
      {/* Desktop sidebar */}
      <aside className="fixed bottom-3 left-3 top-3 z-40 hidden w-[232px] overflow-hidden rounded-[18px] border border-arc-line bg-arc-paper/85 backdrop-blur-xl lg:block">{rail}</aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 border-b border-arc-line bg-arc-canvas/85 backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Logo size={26} withWordmark={false} />
            <span className="h-4 w-px bg-arc-line-strong" aria-hidden="true" />
            <span className="truncate text-[14px] font-medium text-arc-ink">{current?.label ?? "App"}</span>
          </div>
          <div className="flex items-center gap-2">
            {sessionPill(true)}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="platform-drawer"
              className="inline-flex size-10 items-center justify-center rounded-[10px] border border-arc-line bg-arc-paper text-arc-ink-2 transition-colors hover:text-arc-ink"
            >
              <Menu className="size-[18px]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
        <div
          onClick={close}
          className={cn("absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
        />
        <div
          id="platform-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          inert={!open}
          className={cn(
            "absolute inset-y-3 left-3 w-[86%] max-w-[300px] overflow-hidden rounded-[18px] border border-arc-line bg-arc-paper shadow-[var(--shadow-stage)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open ? "translate-x-0" : "-translate-x-[calc(100%+12px)]"
          )}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="absolute right-3 top-2 z-10 inline-flex size-10 items-center justify-center rounded-[10px] text-arc-ink-3 transition-colors hover:bg-arc-sunk hover:text-arc-ink"
          >
            <X className="size-[18px]" />
          </button>
          {rail}
        </div>
      </div>

      <div className="lg:pl-[256px]">
        {/* Desktop top bar */}
        <header className="sticky top-0 z-30 hidden h-14 border-b border-arc-line bg-arc-canvas/80 backdrop-blur-xl backdrop-saturate-150 lg:block">
          <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-6 px-8">
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13.5px]">
              <span className="text-arc-ink-4">{group?.label ?? "App"}</span>
              <ChevronRight className="size-3.5 text-arc-ink-4" aria-hidden="true" />
              <span className="truncate font-medium text-arc-ink">{current?.label ?? "Overview"}</span>
            </nav>
            <div className="flex items-center gap-2">
              {sessionPill()}
              {accountButton}
            </div>
          </div>
        </header>

        <main className="relative mx-auto w-full max-w-[1280px] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          {sessionError && (
            <div
              role="alert"
              className="mb-6 flex gap-3 rounded-[12px] border border-arc-down/25 bg-arc-down/[0.06] px-4 py-3 text-[13.5px] text-arc-down"
            >
              <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-arc-down" aria-hidden="true" />
              {sessionError}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

/** A round identity chip for the signed-in wallet. */
function Avatar({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-gradient-to-b from-white to-arc-ink-4 text-white",
        size === "sm" ? "size-6" : "size-8"
      )}
      aria-hidden="true"
    >
      <span className={cn("rounded-full bg-arc-canvas/80", size === "sm" ? "size-1.5" : "size-2")} />
    </span>
  );
}

/** A gate that prompts the visitor to sign in before any account-specific content is shown. */
export function RequireAuth({ children, title, body }: { children: React.ReactNode; title?: string; body?: string }) {
  const { ready, authenticated, login } = useSession();
  if (!ready) return <div className="h-48 animate-pulse rounded-[14px] bg-arc-sunk" />;
  if (!authenticated) {
    return (
      <div className="panel relative overflow-hidden">
        <div className="dot-field pointer-events-none absolute inset-y-0 right-0 w-1/2" aria-hidden="true" />
        <div className="relative flex flex-col items-start gap-4 p-6 md:p-10">
          <span className="grid size-10 place-items-center rounded-[10px] bg-arc-accent-soft text-arc-accent-ink" aria-hidden="true">
            <KeyRound className="size-[18px]" />
          </span>
          <h2 className="h-section text-[28px] text-arc-ink">{title ?? "Sign in to continue"}</h2>
          <p className="max-w-xl text-[14px] leading-relaxed text-arc-ink-3">
            {body ?? "Use an email address or a wallet. Arcter is self-custodial, so trades settle to and from your own wallet. US persons and residents of excluded jurisdictions cannot use Arcter."}
          </p>
          <button type="button" onClick={login} className="btn btn-primary mt-1">
            Sign in
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
