"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, ArrowRight, BadgeCheck, Layers, Percent, ReceiptText, Wallet } from "lucide-react";
import { useSession } from "@/components/platform/PlatformProviders";
import { RequireAuth } from "@/components/platform/PlatformShell";
import { useAsync, useNow } from "@/components/platform/usePlatformData";
import {
  Badge,
  EmptyState,
  Notice,
  PageHead,
  Segmented,
  Sheet,
  Skeleton,
  StatBand,
  StatCard,
  Table,
  Td,
  Th,
} from "@/components/platform/ui";
import { getMyAttestations, getWalletFills } from "@/lib/platform/queries";
import { fmtAgo, fmtBps, fmtCompact, fmtDate, shortAddress } from "@/lib/platform/format";
import { QUOTE_SYMBOL, marketBySymbol } from "@/lib/platform/markets";
import { cn } from "@/lib/utils";
import { TokenLogo } from "@/components/platform/TokenLogo";

export default function PortfolioPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <PageHead
        code="ARC · 04 · Holdings"
        title="Your wallet's trades and access"
        description="Trades and role status recorded for your wallet. Arcter is self-custodial, so your tokens and vault shares stay in your own wallet."
      />
      <RequireAuth title="Sign in to see your holdings">
        <Portfolio />
      </RequireAuth>
    </div>
  );
}

const ROLES = ["TRADER", "LP", "MAKER", "RELAYER"] as const;

type SideFilter = "all" | "buy" | "sell";
const SIDE_OPTIONS = [
  { value: "all", label: "Any side" },
  { value: "buy", label: "Bought" },
  { value: "sell", label: "Sold" },
] as const satisfies readonly { value: SideFilter; label: string }[];

function SwapCta({ label = "Get a quote" }: { label?: string }) {
  return (
    <Link href="/platform/swap" className="btn btn-primary btn-sm">
      {label}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

function Portfolio() {
  const { api, db, userId, walletAddress } = useSession();
  const fills = useAsync(
    () => (walletAddress ? getWalletFills(db, walletAddress) : Promise.resolve([])),
    [db, walletAddress]
  );
  const attestations = useAsync(() => getMyAttestations(api), [api, userId]);
  const now = useNow();
  const [side, setSide] = useState<SideFilter>("all");

  const fillRows = useMemo(() => fills.data ?? [], [fills.data]);
  const shown = useMemo(() => (side === "all" ? fillRows : fillRows.filter((f) => f.side === side)), [fillRows, side]);

  const activeRoles = ROLES.map((role) => ({
    role,
    attestation: attestations.data?.find(
      (x) => x.role === role && x.status === "active" && new Date(x.expires_at) > new Date()
    ),
  }));
  const activeCount = activeRoles.filter((r) => r.attestation).length;

  const fillsReady = !(fills.loading && !fills.data);
  const attestationsReady = !(attestations.loading && !attestations.data);
  const totalNotional = fillRows.reduce((s, f) => s + (Number(f.notional) || 0), 0);
  const avgOverMid =
    fillRows.length > 0
      ? fillRows.reduce((s, f) => s + f.half_spread_bps + f.fee_bps, 0) / fillRows.length
      : null;

  return (
    <div className="space-y-6">
      <Notice>
        Signed in as <span className="font-mono">{shortAddress(walletAddress)}</span>. This page shows the trades and role
        status recorded for this address. Token balances and vault shares are held in your wallet.
      </Notice>

      {/* KPIs: only figures the data service returns. Holdings value and LP positions are read from the wallet itself. */}
      {fillsReady && attestationsReady ? (
        <StatBand>
          <StatCard
            label="Trades"
            value={String(fillRows.length)}
            hint={fillRows.length === 50 ? "most recent 50" : "for this address"}
            icon={<ReceiptText />}
          />
          <StatCard
            label="Total traded"
            value={fmtCompact(totalNotional)}
            hint={`${QUOTE_SYMBOL}, trades listed here`}
            icon={<ArrowLeftRight />}
          />
          <StatCard
            label="Average cost over mid"
            value={avgOverMid === null ? "n/a" : fmtBps(avgOverMid)}
            hint="half-spread and fee combined"
            icon={<Percent />}
          />
          <StatCard
            label="Active attestations"
            value={`${activeCount} of ${ROLES.length}`}
            hint={activeCount > 0 ? activeRoles.filter((r) => r.attestation).map((r) => r.role).join(" · ") : "none on record"}
            accent={activeCount > 0 ? "accent" : undefined}
            icon={<BadgeCheck />}
          />
        </StatBand>
      ) : (
        <div className="panel p-5">
          <Skeleton rows={2} />
        </div>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
        <Sheet label="Balances" meta="tokens, vault shares">
          <EmptyState
            icon={<Wallet />}
            title="Balances are in your wallet"
            body="Arcter is self-custodial. Your token balances and vault shares sit in your wallet, and your wallet is the place to check them."
            action={<SwapCta />}
          />
        </Sheet>

        <Sheet label="Vault shares" meta="share value, spread earned">
          <EmptyState
            icon={<Layers />}
            title="This wallet holds no vault shares"
            body="Shares are plain SPL tokens, so they can move between wallets, and they redeem pro rata in USDC and tokens. The LP attestation gates entry at deposit only and cannot restrict a transfer."
            action={
              <Link href="/platform/liquidity" className="btn btn-secondary btn-sm">
                See the vaults
              </Link>
            }
          />
        </Sheet>
      </div>

      <Sheet
        label="Your trades"
        meta={
          fillRows.length > 0 ? (
            <Segmented label="Side filter for trades" options={SIDE_OPTIONS} value={side} onChange={setSide} />
          ) : (
            "stored for this address"
          )
        }
      >
        {!fillsReady ? (
          <Skeleton rows={5} />
        ) : fillRows.length === 0 ? (
          <EmptyState
            icon={<ReceiptText />}
            title="No trades for this address"
            body="Each fill appears here with its oracle mid, half-spread, skew and fee."
            action={<SwapCta />}
          />
        ) : (
          <>
            <Table minWidth={720}>
              <thead>
                <tr>
                  <Th>Market</Th>
                  <Th>Side</Th>
                  <Th className="text-right">Size ({QUOTE_SYMBOL})</Th>
                  <Th>Filled by</Th>
                  <Th className="text-right">Cost over mid</Th>
                  <Th className="text-right">Time</Th>
                </tr>
              </thead>
              <tbody>
                {shown.map((f) => {
                  const sym = f.markets?.symbol ?? "?";
                  const name = marketBySymbol[sym]?.name;
                  return (
                    <tr key={f.id}>
                      <Td>
                        <span className="flex items-center gap-3">
                          <TokenLogo symbol={sym} size={32} />
                          <span className="min-w-0">
                            <span className="block font-medium text-arc-ink">{sym}</span>
                            {name && <span className="block truncate text-[12.5px] text-arc-ink-4">{name}</span>}
                          </span>
                        </span>
                      </Td>
                      <Td>
                        <Badge tone={f.side === "buy" ? "up" : "down"}>{f.side === "buy" ? "Buy" : "Sell"}</Badge>
                      </Td>
                      <Td className="text-right text-arc-ink">
                        {fmtCompact(f.notional)}
                        <span className="text-arc-ink-4"> {QUOTE_SYMBOL}</span>
                      </Td>
                      <Td>
                        <Badge tone={f.venue === "vault" ? "muted" : "accent"}>{f.venue === "vault" ? "Vault" : "RFQ"}</Badge>
                      </Td>
                      <Td className="text-right text-arc-ink-2">{fmtBps(f.half_spread_bps + f.fee_bps)}</Td>
                      <Td className="whitespace-nowrap text-right font-mono text-[12.5px] text-arc-ink-3">
                        <time dateTime={f.executed_at} title={fmtDate(f.executed_at)}>
                          {fmtAgo(Math.max(0, (now - new Date(f.executed_at).getTime()) / 60_000))}
                        </time>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            {shown.length === 0 && (
              <p className="py-6 text-center text-[13.5px] text-arc-ink-3">
                Nothing {side === "buy" ? "bought" : "sold"} by this address.
              </p>
            )}
            <p className="mt-4 text-[12.5px] leading-relaxed text-arc-ink-3">
              Rows use the same cost breakdown as the Ledger.
            </p>
          </>
        )}
      </Sheet>

      <Sheet label="Role status" meta={attestationsReady ? `${activeCount} of ${ROLES.length} valid` : undefined}>
        {!attestationsReady ? (
          <Skeleton rows={4} />
        ) : (
          <ul className="-mx-5 -mt-5 divide-y divide-arc-line border-b border-arc-line">
            {activeRoles.map(({ role, attestation: a }) => (
              <li key={role} className="flex min-h-[52px] items-center justify-between gap-4 px-5 py-2.5">
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={cn("h-3 w-[3px] shrink-0 rounded-[1px]", a ? "bg-arc-ink" : "bg-arc-ink-4")}
                  />
                  <span className="font-mono text-[12.5px] text-arc-ink">{role}</span>
                </span>
                <span className="flex items-center gap-3">
                  {a && (
                    <span className="font-mono text-[12px] text-arc-ink-4">
                      expires {fmtDate(a.expires_at)}
                    </span>
                  )}
                  <Badge tone={a ? "up" : "muted"}>{a ? "Valid" : "None yet"}</Badge>
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-[13.5px] leading-relaxed text-arc-ink-3">
            A permissioned market asks for TRADER, a vault deposit asks for LP, and a maker quote asks for MAKER. Your
            status is on the Account page. Redeeming vault shares needs no role, though an issuer freeze or pause can
            hold back the token leg.
          </p>
          <Link href="/platform/settings" className="btn btn-secondary btn-sm shrink-0">
            Go to Account
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </Sheet>
    </div>
  );
}
