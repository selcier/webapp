import { cn } from "@/lib/utils";

/**
 * The frame for every homepage section. The headline leads on the left with the lede beside it on wide
 * screens, then the content. A brightening hairline opens each section. "night" adds the blueprint
 * grid for the bands that should feel like a different room.
 */
export function Section({
  id,
  title,
  lede,
  tone = "canvas",
  align = "left",
  aside,
  children,
}: {
  id: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  tone?: "canvas" | "paper" | "night";
  align?: "left" | "center";
  /** Optional content placed to the right of the heading on wide screens. */
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  const center = align === "center";
  return (
    <section
      id={id}
      className={cn(
        "relative isolate scroll-mt-16 overflow-hidden py-24 md:py-36",
        tone === "canvas" && "bg-arc-canvas",
        tone === "paper" && "bg-arc-night-2",
        tone === "night" && "bg-arc-night"
      )}
    >
      <div className="beam absolute inset-x-0 top-0" aria-hidden="true" />
      {tone === "night" && (
        <div className="grid-lines absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
      )}
      <div className="page relative">
        <div
          className={cn(
            "grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end lg:gap-16",
            center && "lg:grid-cols-1 lg:justify-items-center"
          )}
        >
          <h2
            className={cn(
              "h-section max-w-[18ch] text-[clamp(38px,5.4vw,68px)] text-arc-ink",
              center && "mx-auto text-center"
            )}
          >
            {title}
          </h2>
          {(lede || aside) && (
            <div className={cn("flex flex-col gap-6", center && "items-center text-center")}>
              {lede && (
                <p className="max-w-[52ch] text-[16px] leading-[1.65] text-arc-ink-3 md:text-[17px]">{lede}</p>
              )}
              {aside && <div className="shrink-0">{aside}</div>}
            </div>
          )}
        </div>
        <div className="mt-14 md:mt-20">{children}</div>
      </div>
    </section>
  );
}
