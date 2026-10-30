import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/lib/site";

/**
 * The closing band: the last claim on open black, then the skyline backdrop
 * (`/images/closing-backdrop.jpg`) in a wide strip beneath it, cropped to the band where the lit
 * columns stand so they fill the width and end on the horizon.
 */
export function Closing() {
  return (
    <section className="relative isolate overflow-hidden bg-arc-night">
      <div className="beam absolute inset-x-0 top-0 z-10" aria-hidden="true" />

      <div className="page relative z-10 pt-24 md:pt-32">
        <div className="max-w-[640px]">
          <h2 className="display text-[clamp(38px,5vw,64px)] text-white">
            Know what you paid, <em>whatever the hour.</em>
          </h2>
          <p className="mt-6 max-w-[52ch] text-[15.5px] leading-[1.65] text-white/60 md:text-[16.5px]">
            Arcter is live on Solana, with an audit being conducted. Check out the app, follow the build on X, and reach out with questions or feedback.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={SITE.appHref} className="btn btn-primary btn-lg">
              Open the app
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a href={SITE.xUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-lg">
              Follow on X
            </a>
          </div>
        </div>
      </div>

      <div className="relative -mt-6 aspect-[32/9] min-h-[240px] w-full md:-mt-10" aria-hidden="true">
        <Image
          src="/images/closing-backdrop.jpg"
          alt=""
          fill
          quality={85}
          sizes="100vw"
          className="object-cover object-[50%_36%]"
        />
        <div className="absolute inset-x-0 top-0 h-1/5 bg-gradient-to-b from-arc-night to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-arc-night to-transparent" />
      </div>
    </section>
  );
}
