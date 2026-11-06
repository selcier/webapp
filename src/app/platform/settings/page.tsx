"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, UserRound } from "lucide-react";
import { useSession } from "@/components/platform/PlatformProviders";
import { RequireAuth } from "@/components/platform/PlatformShell";
import { useAsync } from "@/components/platform/usePlatformData";
import { Badge, Button, Field, Input, Notice, PageHead, Sheet, Skeleton } from "@/components/platform/ui";
import { getMyAttestations, upsertProfile } from "@/lib/platform/queries";
import { fmtDate, friendlyError } from "@/lib/platform/format";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  return (
    <div>
      <PageHead code="ARC · 06 · Account" title="Profile and access" description="Set a display name and see which roles this wallet holds. Market access depends on these roles and on each issuer's rules." />
      <div className="mt-6">
        <RequireAuth title="Sign in to open your account">
          <Settings />
        </RequireAuth>
      </div>
    </div>
  );
}

const ROLES = ["TRADER", "LP", "MAKER", "RELAYER"] as const;

const ROLE_HINTS: Record<(typeof ROLES)[number], string> = {
  TRADER: "Needed on permissioned markets",
  LP: "Needed to deposit into a vault",
  MAKER: "For approved firms that answer quote requests",
  RELAYER: "Reserved for software acting for others",
};

const SECTIONS = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "eligibility", label: "Access", icon: ShieldCheck },
] as const;

const readOnlyField = "cursor-default border-arc-line bg-arc-canvas shadow-none text-arc-ink-3 focus:border-arc-line";

function Settings() {
  const { api, userId, walletAddress, email, profile, refreshProfile } = useSession();
  const attestations = useAsync(() => getMyAttestations(api), [api, userId]);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(profile?.display_name ?? "");
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setError(null);
    setMsg(null);
    try {
      await upsertProfile(api, { display_name: displayName || null, wallet_address: walletAddress, email });
      await refreshProfile();
      setMsg("Profile saved.");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
      <nav aria-label="Account sections" className="hidden lg:sticky lg:top-24 lg:block">
        <ul className="space-y-1">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="flex h-9 items-center gap-2.5 rounded-[8px] px-3 text-[13.5px] text-arc-ink-3 transition-colors hover:bg-arc-sunk hover:text-arc-ink"
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
        <div id="profile" className="scroll-mt-24">
          <Sheet
            label="Profile"
            meta={
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="size-3.5" aria-hidden="true" />
                visible only to you
              </span>
            }
          >
            <form onSubmit={save}>
              <div className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2">
                <Field
                  label="Display name"
                  hint="The Ledger shows addresses, never names."
                  className="sm:col-span-2"
                >
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Optional" />
                </Field>
                <Field label="Wallet">
                  <Input value={walletAddress ?? ""} readOnly className={cn("font-mono text-[13px]", readOnlyField)} />
                </Field>
                <Field label="Email">
                  <Input value={email ?? ""} readOnly className={readOnlyField} />
                </Field>
                <Field label="Account ID" className="sm:col-span-2">
                  <Input value={userId ?? ""} readOnly className={cn("font-mono text-[12px]", readOnlyField)} />
                </Field>
              </div>
              {(msg || error) && (
                <div className="mt-5 space-y-3">
                  {msg && <Notice>{msg}</Notice>}
                  {error && <Notice tone="error">{error}</Notice>}
                </div>
              )}
              <div className="-mx-5 -mb-5 mt-6 flex items-center justify-end gap-3 border-t border-arc-line bg-arc-canvas px-5 py-3.5">
                <Button type="submit" disabled={saving} className="btn-sm">
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </form>
          </Sheet>
        </div>

        <div id="eligibility" className="scroll-mt-24">
          <Sheet
            label="Access"
            meta={
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                no personal data on-chain
              </span>
            }
          >
            <p className="mb-5 max-w-[68ch] text-[13.5px] leading-relaxed text-arc-ink-2">
              A KYC provider checks identity, sanctions and residency, and the outcome appears here as a role. The
              on-chain record holds only that role, a jurisdiction class and an expiry date. US persons and residents of excluded jurisdictions are not eligible.
            </p>
            {attestations.loading && !attestations.data ? (
              <Skeleton rows={4} />
            ) : (
              <ul className="divide-hair overflow-hidden rounded-[12px] border border-arc-line">
                {ROLES.map((role) => {
                  const a = attestations.data?.find(
                    (x) => x.role === role && x.status === "active" && new Date(x.expires_at) > new Date()
                  );
                  return (
                    <li key={role} className="flex items-center justify-between gap-4 px-4 py-3.5">
                      <div className="min-w-0">
                        <div className="font-mono text-[13px] font-medium text-arc-ink">{role}</div>
                        <div className="mt-1 truncate text-[12.5px] text-arc-ink-3">
                          {a ? (
                            <>
                              <span className="font-mono">{a.jurisdiction_class ?? "?"}</span>
                              <span className="text-arc-ink-4"> · </span>class{" "}
                              <span className="font-mono">{a.investor_class ?? "?"}</span>
                              <span className="text-arc-ink-4"> · </span>expires{" "}
                              <span className="font-mono">{fmtDate(a.expires_at)}</span>
                            </>
                          ) : (
                            ROLE_HINTS[role]
                          )}
                        </div>
                      </div>
                      <Badge tone={a ? "up" : "muted"}>{a ? "Valid" : "None yet"}</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-5 text-[12px] leading-relaxed text-arc-ink-3">
              The arcter-access program keeps one Attestation PDA per wallet. Redeeming
              vault shares needs no attestation. To ask about onboarding, write to hello@arcter.xyz.
            </p>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
