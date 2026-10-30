"use client";

import { useSyncExternalStore } from "react";
import { ShieldCheck } from "lucide-react";
import { currentSession, type Session } from "@/lib/platform/markets";
import { cn } from "@/lib/utils";
import { Section } from "./Section";

const DAY = [
  { session: "extended", from: 0, minutes: 60 },
  { session: "closed", from: 60, minutes: 480 },
  { session: "extended", from: 540, minutes: 330 },
  { session: "regular", from: 870, minutes: 390 },
  { session: "extended", from: 1260, minutes: 180 },
] as const;

const LEGEND = [
  { session: "regular", label: "Regular US hours", spread: "spread ×1.0", clip: "full clip" },
  { session: "extended", label: "Either side of regular hours", spread: "spread ×1.5", clip: "clip ×0.75" },
  { session: "closed", label: "Home exchange closed", spread: "spread ×3.0", clip: "clip ×0.5" },
] as const;

const HALTS = [
  { trigger: "Oracle data passes the session age limit, or Chainlink and Pyth disagree beyond a set band", clears: "fresh reports agree" },
  { trigger: "An issuer or feed pause covers a corporate action, or a guardian steps in by hand", clears: "that pause is lifted" },
  { trigger: "A single update shifts the price more than 25%", clears: "review passes the time lock" },
  { trigger: "A Solana cluster restart happened and its one-hour grace window is still open", clears: "that window has ended" },
] as const;

/** Regime tones on the logo's scale: open is lit white, extended is mid grey, closed falls into the dark. */
const TONE: Record<Session, { stroke: string; fill: string; text: string; bg: string; soft: string }> = {
  regular: { stroke: "stroke-arc-ink", fill: "fill-arc-ink", text: "text-arc-ink", bg: "bg-arc-ink", soft: "border border-white/35 bg-white/[0.06]" },
  extended: { stroke: "stroke-arc-ink-3", fill: "fill-arc-ink-2", text: "text-arc-ink-2", bg: "bg-arc-ink-3", soft: "border border-arc-line-strong" },
  closed: { stroke: "stroke-arc-line-strong", fill: "fill-arc-ink-3", text: "text-arc-ink-3", bg: "bg-arc-ink-4", soft: "border border-arc-line-strong" },
};

const SESSION_NAME: Record<Session, string> = { regular: "OPEN", extended: "EXTENDED", closed: "CLOSED" };

const SIZE = 320;
const MIDPT = SIZE / 2;
const R = 118;
const C = 2 * Math.PI * R;

/** A clock that ticks every 20 seconds on the client and is absent on the server, so hydration matches. */
const TICK = 20_000;
function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, TICK);
  return () => window.clearInterval(id);
}
const getSnapshot = () => Math.floor(Date.now() / TICK);
const getServerSnapshot = () => null;

const polar = (minutes: number, r: number) => {
  const a = (minutes / 1440) * 2 * Math.PI - Math.PI / 2;
  // Rounded so the server and the browser serialise identical coordinates.
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return { x: round(MIDPT + r * Math.cos(a)), y: round(MIDPT + r * Math.sin(a)) };
};

export function SessionClock() {
  const tick = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const now = tick === null ? null : new Date(tick * TICK);
  const live = now ? currentSession(now) : null;
  const minutes = now ? now.getUTCHours() * 60 + now.getUTCMinutes() : 0;
  const clock = now
    ? `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`
    : "--:--";
  const day = now?.getUTCDay();
  const weekend = day === 0 || day === 6;
  const hand = polar(minutes, R + 14);
  const handIn = polar(minutes, R - 40);

  return (
    <Section
      id="hours"
      tone="canvas"
      title={
        <>
          The <em>session</em> is part of the price
        </>
      }
      lede="An equity token can move on Solana at any hour, while the share it tracks has regular trading for about 6.5 hours each weekday. Every market sits in one of four regimes, and three of them quote."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-8">
        {/* The dial */}
        <div className="card overflow-hidden">
          <div className="card-head">
            <span className="h-card text-[14px] text-arc-ink">UTC session dial</span>
            <span className="tag num">{clock} UTC</span>
          </div>
          <div className="relative px-6 py-8">
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="relative mx-auto w-full max-w-[340px]"
              role="img"
              aria-label="Weekday regimes in UTC: CLOSED from 01:00 until 09:00, then EXTENDED until 14:30, OPEN until 21:00, and EXTENDED until 01:00"
            >
              <circle cx={MIDPT} cy={MIDPT} r={R} fill="none" className="stroke-arc-sunk" strokeWidth="22" />
              <circle cx={MIDPT} cy={MIDPT} r={R - 44} fill="none" className="stroke-arc-line-strong" strokeWidth="1" strokeDasharray="2 5" />
              {DAY.map((seg, i) => {
                const len = (seg.minutes / 1440) * C - 3;
                const start = (seg.from / 1440) * C + 1.5;
                const lit = live === seg.session;
                return (
                  <circle
                    key={i}
                    cx={MIDPT}
                    cy={MIDPT}
                    r={R}
                    fill="none"
                    className={cn(TONE[seg.session].stroke, "transition-opacity duration-500")}
                    strokeOpacity={live === null ? 0.7 : lit ? 1 : 0.22}
                    strokeWidth="22"
                    strokeDasharray={`${len} ${C - len}`}
                    strokeDashoffset={-start}
                    transform={`rotate(-90 ${MIDPT} ${MIDPT})`}
                  />
                );
              })}
              {Array.from({ length: 96 }).map((_, q) => {
                const major = q % 24 === 0;
                const hour = q % 4 === 0;
                const a = polar(q * 15, R + 17);
                const b = polar(q * 15, R + (major ? 29 : hour ? 24 : 20));
                return (
                  <line
                    key={q}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    className={major ? "stroke-arc-ink-3" : "stroke-arc-line-strong"}
                    strokeWidth="1"
                  />
                );
              })}
              {[0, 6, 12, 18].map((h) => {
                const p = polar(h * 60, R - 28);
                return (
                  <text
                    key={h}
                    x={p.x}
                    y={p.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="var(--font-sans)"
                    fontSize="10"
                    className="fill-arc-ink-3"
                  >
                    {String(h).padStart(2, "0")}:00
                  </text>
                );
              })}
              {now && (
                <g>
                  <line x1={handIn.x} y1={handIn.y} x2={hand.x} y2={hand.y} className="stroke-arc-ink" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx={hand.x} cy={hand.y} r="9" className="fill-arc-ink/10" />
                  <circle cx={hand.x} cy={hand.y} r="4" className="fill-arc-ink" />
                </g>
              )}
              {live ? (
                <>
                  <text
                    x={MIDPT}
                    y={MIDPT - 6}
                    textAnchor="middle"
                    fontFamily="var(--font-sans)"
                    fontWeight="500"
                    letterSpacing="-0.5"
                    fontSize="26"
                    className={TONE[live].fill}
                  >
                    {SESSION_NAME[live]}
                  </text>
                  <text x={MIDPT} y={MIDPT + 16} textAnchor="middle" fontFamily="var(--font-sans)" fontSize="9" letterSpacing="1.5" className="fill-arc-ink-3">
                    {weekend ? "WEEKEND, UTC" : "WEEKDAY, UTC"}
                  </text>
                </>
              ) : (
                <>
                  <text x={MIDPT} y={MIDPT - 4} textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="500" fontSize="24" className="fill-arc-ink">
                    Weekdays
                  </text>
                  <text x={MIDPT} y={MIDPT + 16} textAnchor="middle" fontFamily="var(--font-sans)" fontSize="9" letterSpacing="1.5" className="fill-arc-ink-3">
                    UTC TIME
                  </text>
                </>
              )}
            </svg>
          </div>
        </div>

        {/* The regimes */}
        <div className="flex flex-col gap-6">
          <ul className="card divide-hair overflow-hidden">
            {LEGEND.map((l) => {
              const lit = live === l.session;
              return (
                <li
                  key={l.label}
                  className={cn(
                    "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 transition-colors sm:px-6",
                    lit && "bg-arc-canvas"
                  )}
                >
                  <span className={cn("h-8 w-[3px] rounded-full", TONE[l.session].bg, !lit && live && "opacity-30")} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="h-card text-[17px] text-arc-ink">{l.label}</p>
                    <p className="num mt-1 text-[13px] text-arc-ink-3">
                      {l.spread} · {l.clip}
                    </p>
                  </div>
                  {lit ? (
                    <span className={cn("inline-flex h-[22px] items-center rounded-[6px] px-2 text-[12px] font-medium", TONE[l.session].text, TONE[l.session].soft)}>
                      Now
                    </span>
                  ) : (
                    <span className="text-[12px] text-arc-ink-4">{SESSION_NAME[l.session]}</span>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="px-1 text-[15px] leading-relaxed text-arc-ink-3">
            A weekend is CLOSED from start to finish. Vaults still quote, at ×3.0 with half the clip, because
            someone carries the gap into Monday and that risk belongs in the price. The ticket names the
            regime and its multiplier ahead of your signature. Each signal can only tighten a market, never
            loosen it. An order placed in regular hours pays a narrower spread, and the ticket makes that
            comparison easy.
          </p>
        </div>
      </div>

      {/* Fault table */}
      <div className="card mt-6 overflow-hidden lg:mt-8">
        <div className="card-head px-5 py-4 sm:px-6">
          <h3 className="h-card text-[17px] text-arc-ink sm:text-[18px]">What moves a market to HALTED</h3>
          <span className="tag num shrink-0">{HALTS.length}</span>
        </div>
        <ol className="divide-hair">
          {HALTS.map((h, i) => (
            <li
              key={h.trigger}
              className="grid gap-2 px-5 py-4 sm:grid-cols-[32px_minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:px-6"
            >
              <span className="num text-[13px] text-arc-ink-4">{i + 1}</span>
              <span className="text-[15px] leading-relaxed text-arc-ink-2">{h.trigger}</span>
              <span className="justify-self-start rounded-[6px] bg-arc-accent-soft px-2.5 py-1.5 text-[12.5px] font-medium leading-snug text-arc-accent-ink sm:justify-self-end">
                Back once {h.clears}
              </span>
            </li>
          ))}
        </ol>
        <p className="flex items-center gap-2.5 border-t border-arc-line bg-arc-canvas px-5 py-3.5 text-[13.5px] text-arc-ink-3 sm:px-6">
          <ShieldCheck className="size-4 shrink-0 text-arc-ink-2" aria-hidden="true" />
          HALTED stops quotes. Withdrawals continue where safe, though an issuer freeze can hold the token side while USDC stays withdrawable.
        </p>
      </div>
    </Section>
  );
}
