"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Building blocks for the venue app. White sheets sit on the warm canvas with a hairline edge,
 * labels are quiet and sentence case, and every figure is set in tabular numerals so columns line
 * up. Light green is the one accent; up, warn and down appear only on values and status.
 */

export type Tone = "up" | "warn" | "accent" | "down" | "muted";

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("panel p-5", className)}>{children}</div>;
}

/** A panel with a title row and separately padded content. Tables placed first bleed to its edges. */
export function Sheet({
  label,
  meta,
  className,
  children,
}: {
  label: string;
  meta?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("panel overflow-hidden", className)}>
      <div className="panel-head">
        <h2 className="h-card truncate text-[14.5px] text-arc-ink">{label}</h2>
        {meta && <div className="flex shrink-0 items-center gap-2 text-[12.5px] text-arc-ink-3">{meta}</div>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

/**
 * The page header. `bare` pages show a title row with context and actions; every other page keeps
 * its heading for screen readers only, so the content starts at the top of the screen.
 */
export function PageHead({
  code,
  title,
  description,
  action,
  bare = false,
}: {
  code: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Plain title row without the backdrop, for pages built around a single object. */
  bare?: boolean;
}) {
  if (bare) {
    return (
      <div className="animate-rise flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <span className="sr-only">{code}</span>
          <h1 className="h-section text-[34px] text-arc-ink md:text-[42px]">{title}</h1>
          {description && <p className="mt-3 max-w-[68ch] text-[14.5px] leading-relaxed text-arc-ink-3">{description}</p>}
        </div>
        {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
      </div>
    );
  }
  // Pages without a plain title row carry no visible header; the heading stays for screen readers.
  return (
    <div className="sr-only">
      <span>{code}</span>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}
/** A row of KPI panels. */
export function StatBand({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4", className)}>{children}</div>;
}

/** One KPI: a quiet label, the figure, a hint, and optionally a small chart underneath. */
export function StatCard({
  label,
  value,
  hint,
  accent,
  chart,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  /** "accent" sets the figure in green; "down" marks it as a loss or fault. */
  accent?: "accent" | "down";
  chart?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="panel flex min-w-0 flex-col p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="lbl">{label}</span>
        {icon && (
          <span className="grid size-7 place-items-center rounded-[8px] bg-arc-sunk text-arc-ink-3 [&>svg]:size-3.5">{icon}</span>
        )}
      </div>
      <div
        className={cn(
          "num mt-3 truncate text-[22px] font-semibold leading-none tracking-[-0.03em] sm:text-[27px]",
          accent === "accent" ? "text-arc-accent-ink" : accent === "down" ? "text-arc-down" : "text-arc-ink"
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-2 truncate text-[12.5px] text-arc-ink-3">{hint}</div>}
      {chart && <div className="mt-4">{chart}</div>}
    </div>
  );
}

/** A status chip: an outlined mono label, lit white for live states and coloured only for warnings and faults. */
export function Badge({ tone = "muted", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center whitespace-nowrap rounded-[5px] border px-2 font-mono text-[11px] uppercase tracking-[0.02em]",
        tone === "up" && "border-arc-up/30 text-arc-up",
        tone === "warn" && "border-arc-warn/30 text-arc-warn",
        tone === "accent" && "border-white/35 bg-white/[0.06] text-arc-ink",
        tone === "down" && "border-arc-down/35 text-arc-down",
        tone === "muted" && "border-arc-line-strong text-arc-ink-3"
      )}
    >
      {children}
    </span>
  );
}

/** Session tones: lit while open, grey in extended hours or while closed, down when halted. */
export function sessionTone(session: string): Tone {
  if (session === "regular") return "accent";
  if (session === "extended") return "muted";
  if (session === "closed") return "muted";
  return "down";
}

/** The indicator colour for a session: white while open, fading grey otherwise. */
export function sessionDot(session: string) {
  if (session === "regular") return "bg-arc-ink";
  if (session === "extended") return "bg-arc-ink-3";
  if (session === "closed") return "bg-arc-ink-4";
  return "bg-arc-down";
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="lbl mb-2 block text-arc-ink-2">{label}</span>
      {children}
      {hint && <span className="mt-2 block text-[12.5px] leading-relaxed text-arc-ink-3">{hint}</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const check = props.type === "checkbox" || props.type === "radio";
  return (
    <input {...props} className={cn(check ? "size-4 cursor-pointer accent-arc-accent" : "field", props.className)} />
  );
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={cn("relative block", className)}>
      <select {...props} className="field cursor-pointer appearance-none pr-10" />
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-arc-ink-3"
        aria-hidden="true"
      />
    </span>
  );
}

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "accent" | "secondary" | "danger" }) {
  return (
    <button
      {...props}
      className={cn(
        "btn disabled:cursor-not-allowed",
        variant === "primary" && "btn-primary",
        variant === "accent" && "btn-accent",
        variant === "secondary" && "btn-secondary",
        variant === "danger" && "border border-arc-down/30 bg-arc-paper text-arc-down hover:bg-arc-down/[0.05]",
        className
      )}
    />
  );
}

export function EmptyState({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-arc-line-strong bg-arc-canvas px-6 py-12 text-center">
      <span
        className="mb-4 grid size-10 place-items-center rounded-[10px] border border-arc-line bg-arc-paper text-arc-ink-3 [&>svg]:size-[18px]"
        aria-hidden="true"
      >
        {icon ?? <span className="h-px w-3 bg-arc-ink-3" />}
      </span>
      <p className="text-[15px] font-semibold tracking-[-0.01em] text-arc-ink">{title}</p>
      {body && <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-arc-ink-3">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "error"; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "flex gap-3 rounded-[12px] border px-4 py-3 text-[13.5px] leading-relaxed",
        tone === "info" && "border-arc-accent/15 bg-arc-accent-soft text-arc-ink-2",
        tone === "warn" && "border-arc-warn/20 bg-arc-warn/[0.06] text-arc-ink-2",
        tone === "error" && "border-arc-down/25 bg-arc-down/[0.06] text-arc-down"
      )}
    >
      <span
        className={cn(
          "mt-[7px] size-1.5 shrink-0 rounded-full",
          tone === "info" && "bg-arc-accent",
          tone === "warn" && "bg-arc-warn",
          tone === "error" && "bg-arc-down"
        )}
        aria-hidden="true"
      />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/**
 * A dashboard table. Placed first inside a Sheet it bleeds to the panel's edges and sits flush under
 * the title row; rows are hairline-divided and tint on hover.
 */
export function Table({ children, minWidth = 640 }: { children: React.ReactNode; minWidth?: number }) {
  return (
    <div className="scrollbar-none -mx-5 overflow-x-auto first:-mt-5">
      <table
        className={cn(
          "num w-full border-collapse text-left text-[13.5px]",
          "[&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-arc-canvas",
          "[&_tbody_tr:last-child>td]:border-b-0",
          "[&_th:first-child]:pl-5 [&_td:first-child]:pl-5",
          "[&_th:last-child]:pr-5 [&_td:last-child]:pr-5"
        )}
        style={{ minWidth }}
      >
        {children}
      </table>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        "h-10 whitespace-nowrap border-b border-arc-line bg-arc-canvas pr-4 text-[12px] font-medium text-arc-ink-3",
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("h-[54px] border-b border-arc-line pr-4 align-middle text-arc-ink-2", className)}>{children}</td>;
}

export function Skeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2.5" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="relative h-9 overflow-hidden rounded-[8px] bg-arc-sunk"
          style={{ opacity: 1 - i * (0.5 / Math.max(rows, 1)) }}
        >
          <div
            className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent"
            style={{ animationDelay: `${i * 0.08}s` }}
          />
        </div>
      ))}
    </div>
  );
}

/** A label and a figure joined by a dotted leader, like a line on an itemised bill. */
export function LeaderRow({ label, value, sub }: { label: React.ReactNode; value: React.ReactNode; sub?: string }) {
  return (
    <div className="py-2 text-[13.5px]">
      <div className="flex items-baseline">
        <span className="shrink-0 text-arc-ink-3">{label}</span>
        <span className="leader" aria-hidden="true" />
        <span className="num shrink-0 text-right text-arc-ink">{value}</span>
      </div>
      {sub && <div className="mt-1 text-[12px] text-arc-ink-4">{sub}</div>}
    </div>
  );
}

export function ExplorerLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="link font-medium">
      {children}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Controls and charts
// ---------------------------------------------------------------------------

/** A segmented control for switching views or filters. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cn("seg", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className="seg-item"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** A horizontal meter, 0 to 1, with an optional target marker. */
export function Meter({
  value,
  target,
  tone = "accent",
  className,
}: {
  value: number;
  target?: number;
  tone?: "accent" | "up" | "warn" | "down";
  className?: string;
}) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={cn("relative h-1.5 w-full rounded-full bg-arc-sunk", className)} aria-hidden="true">
      <div
        className={cn(
          "absolute inset-y-0 left-0 rounded-full",
          tone === "accent" && "bg-arc-accent",
          tone === "up" && "bg-arc-up",
          tone === "warn" && "bg-arc-warn",
          tone === "down" && "bg-arc-down"
        )}
        style={{ width: `${v * 100}%` }}
      />
      {target !== undefined && (
        <span
          className="absolute -top-1 h-3.5 w-px bg-arc-ink-3"
          style={{ left: `${Math.max(0, Math.min(1, target)) * 100}%` }}
        />
      )}
    </div>
  );
}

/**
 * A ranked list with proportional bars behind each row: the dashboard's "top items" view.
 * Values must be non-negative; the largest fills the row.
 */
export function BarList({
  items,
  className,
}: {
  items: readonly { key: string; label: React.ReactNode; value: number; display: React.ReactNode; sub?: React.ReactNode }[];
  className?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 0);
  return (
    <ul className={cn("space-y-1.5", className)}>
      {items.map((item) => (
        <li key={item.key} className="relative flex h-9 items-center justify-between gap-4 overflow-hidden rounded-[8px] px-3">
          <span
            className="absolute inset-y-0 left-0 rounded-[8px] bg-arc-accent-soft"
            style={{ width: max > 0 ? `${Math.max(2, (item.value / max) * 100)}%` : "0%" }}
            aria-hidden="true"
          />
          <span className="relative flex min-w-0 items-center gap-2 truncate text-[13.5px] font-medium text-arc-ink">
            {item.label}
            {item.sub && <span className="truncate text-[12.5px] font-normal text-arc-ink-4">{item.sub}</span>}
          </span>
          <span className="num relative shrink-0 text-[13.5px] text-arc-ink-2">{item.display}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * A vertical bar chart drawn in HTML. Hovering or focusing a bar shows its label and value in the
 * readout above the chart. The highlighted index (by default the last) is set in full green.
 */
export function BarChart({
  data,
  height = 160,
  format = (v) => String(v),
  highlight,
  axisLabels,
  emptyLabel = "No data to show",
  className,
}: {
  data: readonly { label: string; value: number }[];
  height?: number;
  format?: (v: number) => string;
  highlight?: number;
  /** Labels for the left, middle and right of the x axis. */
  axisLabels?: [string, string, string];
  emptyLabel?: string;
  className?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 0);
  const lit = highlight ?? data.length - 1;
  const active = hover ?? lit;
  const n = Math.max(data.length, 1);
  const gap = n > 40 ? 1 : 3;

  if (max === 0) {
    return (
      <div
        className={cn("flex items-center justify-center rounded-[12px] border border-dashed border-arc-line-strong bg-arc-canvas text-[13px] text-arc-ink-4", className)}
        style={{ height }}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-3 flex items-baseline justify-between gap-3 text-[12.5px]" aria-live="polite">
        <span className="text-arc-ink-3">{data[active]?.label}</span>
        <span className="num font-medium text-arc-ink">{format(data[active]?.value ?? 0)}</span>
      </div>
      <div className="relative" style={{ height }}>
        {[0.25, 0.5, 0.75].map((f) => (
          <span key={f} className="absolute inset-x-0 border-t border-dashed border-arc-line" style={{ bottom: `${f * 100}%` }} aria-hidden="true" />
        ))}
        <div className="absolute inset-0 flex items-end" style={{ gap }} onMouseLeave={() => setHover(null)}>
          {data.map((d, i) => {
            const h = d.value > 0 ? Math.max(2, (d.value / max) * 100) : 0;
            const on = i === active;
            return (
              <button
                key={`${d.label}-${i}`}
                type="button"
                aria-label={`${d.label}: ${format(d.value)}`}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="group relative flex h-full min-w-0 flex-1 cursor-default items-end outline-none"
              >
                <span
                  className={cn(
                    "w-full rounded-t-[3px] transition-colors duration-150",
                    on ? "bg-arc-accent" : "bg-arc-accent/20 group-hover:bg-arc-accent/40"
                  )}
                  style={{ height: `${h}%` }}
                />
              </button>
            );
          })}
        </div>
      </div>
      {axisLabels && (
        <div className="mt-2 flex justify-between text-[11.5px] text-arc-ink-4">
          {axisLabels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/** A stacked horizontal bar showing how a total splits across parts, with a legend. */
export function SplitBar({
  parts,
  format = (v) => String(v),
  className,
}: {
  parts: readonly { key: string; label: string; value: number }[];
  format?: (v: number) => string;
  className?: string;
}) {
  const total = parts.reduce((s, p) => s + Math.max(0, p.value), 0);
  const shades = ["bg-arc-accent", "bg-arc-accent/75", "bg-arc-accent/55", "bg-arc-accent/40", "bg-arc-accent/25", "bg-arc-ink-3", "bg-arc-ink-4", "bg-arc-line-strong"];
  return (
    <div className={className}>
      <div className="flex h-2.5 w-full gap-[2px] overflow-hidden rounded-full bg-arc-sunk" aria-hidden="true">
        {total > 0 &&
          parts.map((p, i) =>
            p.value > 0 ? (
              <span key={p.key} className={cn("h-full first:rounded-l-full last:rounded-r-full", shades[i % shades.length])} style={{ width: `${(p.value / total) * 100}%` }} />
            ) : null
          )}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-4">
        {parts.map((p, i) => (
          <li key={p.key} className="flex min-w-0 items-center gap-2 text-[12.5px]">
            <span className={cn("size-2 shrink-0 rounded-[3px]", shades[i % shades.length])} aria-hidden="true" />
            <span className="truncate text-arc-ink-2">{p.label}</span>
            <span className="num ml-auto shrink-0 text-arc-ink-3">{total > 0 ? `${((p.value / total) * 100).toFixed(0)}%` : format(0)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
