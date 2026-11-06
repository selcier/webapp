"use client";

import { useMemo, useState } from "react";
import { Crosshair, Inbox, Layers, Percent, ShieldCheck, TrendingUp, TriangleAlert, Vault } from "lucide-react";
import { useSession } from "@/components/platform/PlatformProviders";
import { useNow, useVenue } from "@/components/platform/usePlatformData";
import {
  Badge,
  EmptyState,
  Meter,
  Notice,
  PageHead,
  Segmented,
  Sheet,
  Skeleton,
  SplitBar,
  StatBand,
  StatCard,
  Table,
  Td,
  Th,
  sessionTone,
} from "@/components/platform/ui";
import { fmtCompact, fmtMoney } from "@/lib/platform/format";
import { FEES, QUOTE_SYMBOL, REGIMES, TIERS, currentSession } from "@/lib/platform/markets";
import { cn } from "@/lib/utils";
import { TokenLogo } from "@/components/platform/TokenLogo";

type TierFilter = "all" | "1" | "2" | "3";
const TIER_OPTIONS = [
  { value: "all", label: "All tiers" },
  { value: "1", label: "Tier A" },
  { value: "2", label: "Tier B" },
  { value: "3", label: "Tier C" },
] as const satisfies readonly { value: TierFilter; label: string }[];

const LP_SHARE = 100 - FEES.spreadShareBps / 100;

const EXPLAINERS = [
  {
    label: "How vaults earn",
    icon: TrendingUp,
    tone: "text-arc-up",
    body: `A fill against a vault leaves spread behind. The venue keeps ${FEES.spreadShareBps / 100}%, and the rest lifts share value. There are no token emissions.`,
  },
  {
    label: "Risks you take",
    icon: TriangleAlert,
    tone: "text-arc-warn",
    body: "Inventory in the token you chose, price gaps between the Friday close and the Monday open that the x3.0 CLOSED spread is set to cover, and issuer powers over every equity token, including pause, freeze and permanent delegate. Issuers can freeze or move tokens. The programs have not completed an audit.",
  },
  {
    label: "What the design leaves out",
    icon: ShieldCheck,
    tone: "text-arc-accent-ink",
    body: "No borrowing and no liquidation. Each market has its own vault, so a loss in one listing stays there. Arcter places no permission check on redemption, but an issuer freeze or pause can hold back the token leg while the USDC side continues.",
  },
];

export default function LiquidityPage() {
  const { authenticated, login } = useSession();
  const venue = useVenue();
  const now = useNow();
  const session = currentSession(new Date(now));
  const markets = useMemo(() => venue.data?.markets ?? [], [venue.data]);
  const loading = venue.loading && !venue.data;
  const [tier, setTier] = useState<TierFilter>("all");

  const tvl = markets.reduce((acc, m) => acc + m.tvl, 0);
  const funded = markets.filter((m) => m.tvl > 0);
  const inBand = markets.filter((m) => Math.abs(m.inventoryRatioBps - 5000) <= TIERS[m.tier].inventoryBandBps).length;
  const shown = tier === "all" ? markets : markets.filter((m) => String(m.tier) === tier);
  const share = [...funded].sort((a, b) => b.tvl - a.tvl).map((m) => ({ key: m.symbol, label: m.symbol, value: m.tvl }));

  return (
    <div>
      <PageHead
        code="ARC · 03 · Vaults"
        title="One vault per market, paid from spread"
        description="A vault quotes around the oracle mid and earns spread on what it fills. Depositors take inventory risk in that market alone. Shares redeem pro rata in USDC and tokens."
      />

      <div className="mt-6">
        <Notice>
          Vault deposits require an{" "}
          <span className="font-mono">LP</span> attestation, issued to professional clients. Redemption
          pays out pro rata in kind, in USDC and tokens. An issuer freeze or pause can hold back the token leg.
        </Notice>
      </div>

      <StatBand className="mt-6">
        <StatCard label="Vault value" value={fmtCompact(tvl, QUOTE_SYMBOL)} hint="all listings" accent="accent" icon={<Vault />} />
        <StatCard
          label="Vaults listed"
          value={String(markets.length)}
          hint={`${funded.length} funded, ${markets.length - funded.length} empty`}
          icon={<Layers />}
        />
        <StatCard
          label="Depositor share"
          value={`${LP_SHARE}%`}
          hint={`${FEES.spreadShareBps / 100}% goes to the venue`}
          icon={<Percent />}
        />
        <StatCard
          label="Inside inventory band"
          value={`${inBand} of ${markets.length}`}
          hint="30% to 70% held in the token"
          icon={<Crosshair />}
        />
      </StatBand>

      <Sheet
        className="mt-6"
        label="Vault list"
        meta={
          <span className="flex items-center gap-2">
            Regime <Badge tone={sessionTone(session)}>{REGIMES[session].label}</Badge>
          </span>
        }
      >
        <div className="-mx-5 -mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-arc-line px-5 py-3">
          <Segmented label="Tier filter for vaults" options={TIER_OPTIONS} value={tier} onChange={setTier} />
          <span className="text-[12.5px] text-arc-ink-4">
            {shown.length} {shown.length === 1 ? "vault" : "vaults"} in view
          </span>
        </div>
        {loading ? (
          <div className="pt-5">
            <Skeleton rows={6} />
          </div>
        ) : shown.length === 0 ? (
          <div className="pt-5">
            <EmptyState icon={<Inbox />} title="No vaults in this tier" body="Choose a different tier." />
          </div>
        ) : (
          <Table minWidth={820}>
            <thead>
              <tr>
                <Th>Vault</Th>
                <Th>Tier</Th>
                <Th className="text-right">Vault value, {QUOTE_SYMBOL}</Th>
                <Th>Token share of inventory</Th>
                <Th className="text-right">Half-spread by tier, bps</Th>
                <Th className="text-right">Depositor share</Th>
                <Th className="text-right">
                  <span className="sr-only">Deposit</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {shown.map((m) => {
                const t = TIERS[m.tier];
                const pct = m.inventoryRatioBps / 100;
                // Warn as the vault nears the edge of its inventory band.
                const warn = Math.abs(m.inventoryRatioBps - 5000) > t.inventoryBandBps * 0.75;
                return (
                  <tr key={m.symbol}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <TokenLogo symbol={m.symbol} size={32} />
                        <div className="min-w-0">
                          <div className="font-medium text-arc-ink">{m.symbol}</div>
                          <div className="truncate text-[12.5px] text-arc-ink-4">{m.name}</div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <Badge tone={m.tier === 1 ? "accent" : "muted"}>{t.label}</Badge>
                    </Td>
                    <Td className="text-right text-arc-ink">{m.tvl > 0 ? fmtMoney(m.tvl) : <span className="text-arc-ink-4">0</span>}</Td>
                    <Td>
                      <div className="flex items-center gap-3">
                        <Meter value={pct / 100} target={0.5} tone={warn ? "warn" : "accent"} className="w-28" />
                        <span className={cn("text-[12.5px]", warn ? "text-arc-warn" : "text-arc-ink-2")}>
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </Td>
                    <Td className="text-right">{t.baseHalfSpreadBps}</Td>
                    <Td className="text-right text-arc-up">{LP_SHARE}%</Td>
                    <Td className="text-right">
                      {authenticated ? (
                        <button type="button" className="btn btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-40" disabled>
                          Deposit
                        </button>
                      ) : (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={login}>
                          Sign in
                        </button>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
        <p className="mt-5 text-[12px] leading-relaxed text-arc-ink-3">
          Deposits are valued at the guarded mid, so a halt pauses them. Withdrawals continue where safe, though issuer
          controls can hold back the token leg. The tick on each bar marks the 50% target.
        </p>
      </Sheet>

      <Sheet className="mt-6" label="Value split by vault" meta={<span className="num">{fmtCompact(tvl, QUOTE_SYMBOL)}</span>}>
        {loading ? (
          <Skeleton rows={2} />
        ) : share.length === 0 ? (
          <EmptyState icon={<Vault />} title="No funded vaults" />
        ) : (
          <SplitBar parts={share} format={(v) => fmtMoney(v)} />
        )}
      </Sheet>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3">
        {EXPLAINERS.map((c) => (
          <div key={c.label} className="panel p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-[10px] border border-arc-line bg-arc-paper">
                <c.icon className={cn("size-4", c.tone)} aria-hidden="true" />
              </span>
              <h3 className="text-[14px] font-medium text-arc-ink">{c.label}</h3>
            </div>
            <p className="mt-3 text-[13.5px] leading-relaxed text-arc-ink-2">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
