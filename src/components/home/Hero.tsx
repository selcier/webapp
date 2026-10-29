import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowRightLeft,
  Briefcase,
  Droplets,
  LayoutDashboard,
  Search,
} from "lucide-react";
import { SITE } from "@/lib/site";
import { MARKETS, TIERS } from "@/lib/platform/markets";
import { TokenLogo } from "@/components/platform/TokenLogo";
import { cn } from "@/lib/utils";

/**
 * The opening screen: a large claim on the left over the lit stairs of the backdrop, then the
 * product window and a ticker of the markets.
 */
const AMOUNT_IN = 10_000;
const MID = 177.4;
const FEE = (AMOUNT_IN * 2) / 10_000;
const NET = AMOUNT_IN - FEE;
const OUT = NET / (MID * 1.001); // open session with a 10 bps half-spread
const SPREAD_COST = NET - OUT * MID;

const fmt = (n: number, d = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const SIDEBAR = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Trade", icon: ArrowRightLeft, active: true },
  { label: "Vaults", icon: Droplets },
  { label: "Holdings", icon: Briefcase },
  { label: "Ledger", icon: Search },
] as const;

export function Hero() {
  const tape = [...MARKETS, ...MARKETS];

  return (
    <section className="relative isolate -mt-16 overflow-hidden bg-arc-canvas pt-16">
      {/* The backdrop (shared with the app banners): lit stairs on a grid floor, kept clear on the left
          for the claim and faded into the canvas at the base. */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[820px] md:h-[900px]" aria-hidden="true">
        <Image
          src="/images/hero-backdrop.jpg"
          alt=""
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover object-[78%_50%] opacity-70 md:object-[64%_50%] md:opacity-100"
        />
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-arc-canvas/80 to-transparent md:w-1/4" />
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-b from-transparent to-arc-canvas" />
      </div>

      <div className="page relative pt-16 md:pt-24">
        <div className="max-w-[560px]">
          <h1 className="display animate-rise delay-1 text-[clamp(40px,5.2vw,66px)] text-arc-ink">
            Tokenized stocks, <em>priced in the open.</em>
          </h1>

          <p className="animate-rise delay-2 mt-6 max-w-[50ch] text-[15.5px] leading-[1.65] text-arc-ink-3 md:text-[16.5px]">
            A self-custodial exchange on Solana. Every quote starts from a verified oracle mid and settles in
            USDC, with spread, skew and fee on separate lines. Trade from your own wallet and sign once.
          </p>

          <div className="animate-rise delay-3 mt-9 flex flex-wrap items-center gap-3">
            <Link href={SITE.appHref} className="btn btn-primary btn-lg">
              Launch app
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="#formula" className="btn btn-secondary btn-lg">
              Read the quote math
            </Link>
          </div>

          <ul className="animate-rise delay-4 mt-12 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[12px] text-arc-ink-4">
            <li>Chainlink Data Streams with a Pyth cross-check</li>
            <li>Built for Solana</li>
            <li>Settles in USDC</li>
          </ul>
        </div>

        {/* The product */}
        <div id="platform" className="animate-rise delay-4 relative mt-20 scroll-mt-24 md:mt-28">
          <div className="wash absolute -inset-x-10 -top-16 h-64 -z-10" aria-hidden="true" />
          <AppWindow />
        </div>

      </div>

      {/* The catalogue, running along the base */}
      <div className="mt-20 border-y border-arc-line md:mt-24">
        <div className="fade-x overflow-hidden py-4">
          <div className="marquee" aria-hidden="true">
            {tape.map((m, i) => (
              <span key={`${m.symbol}-${i}`} className="flex shrink-0 items-center gap-3 border-r border-arc-line px-7 text-[13px] leading-none">
                <TokenLogo symbol={m.symbol} size={20} rounded="round" />
                <span className="font-medium text-arc-ink">{m.symbol}</span>
                <span className="num font-mono text-arc-ink-3">{fmt(m.mid)}</span>
                <span className="num font-mono text-arc-ink-4">{TIERS[m.tier].baseHalfSpreadBps} bps</span>
              </span>
            ))}
          </div>
        </div>
        <p className="sr-only">
          Markets shown: {MARKETS.map((m) => `${m.symbol}, Tier ${TIERS[m.tier].label}`).join("; ")}.
        </p>
      </div>
    </section>
  );
}

/** A browser window holding a still of the app: its sidebar, the market list and the quote ticket. */
function AppWindow() {
  return (
    <div className="card-stage overflow-hidden rounded-[20px] text-left">
      <div className="flex h-11 items-center gap-4 border-b border-arc-line bg-arc-canvas px-4">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-px w-3 bg-arc-line-strong" />
          <span className="h-px w-3 bg-arc-line-strong" />
        </span>
        <span className="mx-auto flex h-6 min-w-0 max-w-[340px] flex-1 items-center justify-center rounded-[6px] border border-arc-line bg-arc-canvas px-3 font-mono text-[11.5px] text-arc-ink-4">
          <span className="truncate">{SITE.domain}/platform/swap</span>
        </span>
        <span className="w-[42px]" aria-hidden="true" />
      </div>

      <div className="grid md:grid-cols-[minmax(0,1fr)_360px] lg:grid-cols-[56px_minmax(0,1fr)_380px]">
        {/* Sidebar */}
        <aside className="hidden flex-col items-center gap-1 border-r border-arc-line bg-arc-canvas py-3 lg:flex" aria-hidden="true">
          <Image src="/images/logo-mark.png" alt="" width={26} height={26} className="mb-3 rounded-[6px]" />
          {SIDEBAR.map((item) => (
            <span
              key={item.label}
              title={item.label}
              className={cn(
                "grid size-8 place-items-center rounded-[8px]",
                "active" in item
                  ? "bg-arc-hover text-arc-ink ring-1 ring-arc-line-strong"
                  : "text-arc-ink-4"
              )}
            >
              <item.icon className="size-3.5" />
            </span>
          ))}
        </aside>

        {/* Market list */}
        <div className="hidden min-w-0 border-r border-arc-line md:block" aria-hidden="true">
          <div className="flex items-center justify-between px-5 pb-4 pt-6">
            <span className="h-card text-[14px] text-arc-ink">Markets</span>
            <span className="seg">
              <span className="seg-item inline-flex items-center" aria-pressed="true">All</span>
              <span className="seg-item inline-flex items-center">Tier A</span>
            </span>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_80px_56px] border-y border-arc-line bg-arc-canvas px-5 py-2 text-[11.5px] font-medium text-arc-ink-3">
            <span>Market</span>
            <span className="text-right">Mid</span>
            <span className="text-right">Spread</span>
          </div>
          <ul className="divide-hair">
            {MARKETS.map((m, i) => (
              <li
                key={m.symbol}
                className={cn(
                  "grid grid-cols-[minmax(0,1fr)_80px_56px] items-center px-5 py-3.5 text-[13px]",
                  i === 0 && "bg-white/[0.035]"
                )}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <TokenLogo symbol={m.symbol} size={26} />
                  <span className="min-w-0">
                    <span className="block font-semibold text-arc-ink">{m.symbol}</span>
                    <span className="block truncate text-[11.5px] text-arc-ink-4">{m.name}</span>
                  </span>
                </span>
                <span className="num text-right text-arc-ink">{fmt(m.mid)}</span>
                <span className="num text-right text-arc-accent-ink">{TIERS[m.tier].baseHalfSpreadBps}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Ticket */}
        <div className="bg-arc-paper p-5 md:p-6">
          <QuoteTicket />
        </div>
      </div>
    </div>
  );
}

function QuoteTicket() {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 px-1">
        <span className="flex items-center gap-2.5">
          <TokenLogo symbol="NVDAx" size={30} />
          <span>
            <span className="block text-[14.5px] font-semibold tracking-[-0.01em] text-arc-ink">
              NVDAx <span className="font-normal text-arc-ink-4">/ USDC</span>
            </span>
            <span className="block text-[12px] text-arc-ink-4">NVIDIA tokenized stock</span>
          </span>
        </span>
        <span className="inline-flex h-[22px] items-center rounded-[5px] border border-arc-line-strong px-2 font-mono text-[11px] text-arc-ink-2">
          OPEN ×1.0
        </span>
      </div>

      <div className="relative mt-5 space-y-2">
        <TicketField label="Pay" value={fmt(AMOUNT_IN, 0)} symbol="USDC" />
        <span
          className="absolute left-1/2 top-1/2 z-10 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[10px] border border-arc-line-strong bg-arc-paper text-arc-ink-2 ring-4 ring-arc-paper"
          aria-hidden="true"
        >
          <ArrowDown className="size-4" />
        </span>
        <TicketField label="Receive" value={fmt(OUT, 4)} symbol="NVDAx" />
      </div>

      <dl className="mt-5 rounded-[12px] border border-arc-line px-4 py-1.5">
        <Row k="Verified mid" v={`${fmt(MID)} USDC`} />
        <Row k="Spread · 10.0 bps at ×1.0" v={`${fmt(SPREAD_COST)} USDC`} />
        <Row k="Skew" v="+0 bps" />
        <Row k="Protocol fee · 2.0 bps" v={`${fmt(FEE)} USDC`} />
      </dl>

      <Link href={SITE.appHref} className="btn btn-accent mt-5 h-12 w-full">
        Start trading
      </Link>

      <p className="mt-3 text-center text-[12px] text-arc-ink-4">Every cost line is shown before you sign</p>
    </div>
  );
}

function TicketField({ label, value, symbol }: { label: string; value: string; symbol: string }) {
  return (
    <div className="rounded-[12px] border border-arc-line bg-arc-canvas px-4 py-4">
      <p className="lbl">{label}</p>
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <span className="num min-w-0 truncate text-[clamp(22px,6vw,25px)] font-medium leading-none tracking-[-0.04em] text-arc-ink">
          {value}
        </span>
        <span className="inline-flex h-8 shrink-0 items-center gap-2 rounded-full border border-arc-line-strong bg-arc-paper pl-1 pr-3 text-[13px] font-medium text-arc-ink">
          <TokenLogo symbol={symbol} size={24} rounded="round" />
          {symbol}
        </span>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-arc-line py-2.5 last:border-b-0">
      <dt className="text-[12.5px] text-arc-ink-3">{k}</dt>
      <dd className="num text-[13px] font-medium text-arc-ink">{v}</dd>
    </div>
  );
}
