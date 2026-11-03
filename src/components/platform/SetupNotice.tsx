import Link from "next/link";
import { Logo } from "@/components/Logo";

export function SetupNotice({ missing }: { missing: string[] }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-arc-canvas px-4 py-16">
      <div className="dot-field pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="card-stage relative w-full max-w-xl animate-rise overflow-hidden">
        <div className="card-head">
          <Logo size={26} />
          <span className="tag border-arc-warn/25 bg-arc-warn/[0.07] text-arc-warn">
            Setup
          </span>
        </div>

        <div className="p-6 md:p-8">
          <h1 className="h-section text-[32px] text-arc-ink md:text-[36px]">A few environment keys are missing</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-arc-ink-2">
            Sign-in runs on Privy and data on Supabase. Add each key listed here to{" "}
            <code className="font-mono text-[13.5px] text-arc-accent-ink">.env.local</code>, run{" "}
            <code className="font-mono text-[13.5px] text-arc-accent-ink">supabase/schema.sql</code> and then{" "}
            <code className="font-mono text-[13.5px] text-arc-accent-ink">supabase/seed.sql</code>, and restart the dev server.
          </p>

          <ul className="mt-6 divide-hair overflow-hidden rounded-[12px] border border-arc-line bg-arc-canvas font-mono text-[13px] text-arc-ink">
            {missing.map((m) => (
              <li key={m} className="flex items-center gap-3 px-4 py-2.5">
                <span className="size-1.5 shrink-0 rounded-full bg-arc-warn" aria-hidden="true" />
                <span className="min-w-0 break-all">{m}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-[13.5px] leading-relaxed text-arc-ink-3">
            <code className="font-mono text-arc-ink-2">supabase/README.md</code> has the full procedure. Or{" "}
            <Link href="/" className="link">
              return to the home page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
