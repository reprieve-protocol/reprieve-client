"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, DatabaseZap } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PositionCard } from "@/components/dashboard/PositionCard";
import { ProtocolIcon } from "@/components/common/ProtocolIcon";
import { RescueOverlay } from "@/components/rescue/RescueOverlay";

import { STRATEGY_PRESETS, ETH_USD_PRICE } from "@/lib/domain/constants";
import { useAppState } from "@/lib/state/app-context";
import { type Position } from "@/lib/domain/types";
import { formatUsd } from "@/lib/domain/calculations";
import {
  usePositionsControllerGetRiskSnapshot,
  getPositionsControllerGetRiskSnapshotQueryKey,
} from "@/src/services/queries";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { Button } from "@/components/ui/button";
import { CreWorkflowAnimation } from "@/components/dashboard/CREWorkflowAnimation";

export function DashboardView() {
  const { isConnected } = useAccount();
  const demoWalletAddress =
    typeof window !== "undefined"
      ? (localStorage.getItem("demoWalletAddress") ?? "")
      : "";

  const { connect } = useConnect();
  const {
    state: { loading, error, snapshot, rescueRun },
  } = useAppState();

  const { data: positionsData, isLoading: isLoadingPositions } =
    usePositionsControllerGetRiskSnapshot(
      demoWalletAddress,
      { maxAgeSec: 600 },
      {
        query: {
          enabled: !!demoWalletAddress,
          queryKey: getPositionsControllerGetRiskSnapshotQueryKey(
            demoWalletAddress,
            { maxAgeSec: 600 },
          ),
        },
      },
    );

  const displayPositions: Position[] = useMemo(() => {
    const defaultData = positionsData as {
      positions?: Array<{
        id: number;
        userAddress: string;
        chainId: number;
        protocol: string;
        adapterAddress: string;
        collateralAsset: string;
        debtAsset: string;
        collateralAmountRaw: string;
        debtAmountRaw: string;
        healthFactorWad: string;
        ltvBps: number;
        maxLtvBps: number;
        liquidationThresholdBps: number;
        syncedAt: string;
        createdAt: string;
        updatedAt: string;
      }>;
    };

    const apiPositionsRaw = defaultData?.positions ?? [];
    console.log("apiPositionsRaw123: ", apiPositionsRaw);

    if (!apiPositionsRaw.length) {
      return [];
    }
    const realPositions = apiPositionsRaw.map((apiPos) => {
      const protocol =
        apiPos.protocol === "AAVE"
          ? ("aave-v4" as const)
          : apiPos.protocol === "COMPOUND"
            ? ("compound-v3" as const)
            : ("morpho-v2" as const);

      const chain =
        apiPos.chainId === 11155111
          ? ("ethereum-sepolia" as const)
          : apiPos.chainId === 421614
            ? ("arbitrum-sepolia" as const)
            : ("base-sepolia" as const);

      let healthFactor = 99.99;
      if (apiPos.healthFactorWad) {
        const factor = Number(BigInt(apiPos.healthFactorWad)) / 1e18;
        if (factor > 1000)
          healthFactor = 99.99; // infinite or very large
        else healthFactor = factor;
        console.log("factor: ", factor);
      }

      const collateralUsd =
        (Number(BigInt(apiPos.collateralAmountRaw)) / 1e18) * ETH_USD_PRICE;
      const debtUsd = Number(BigInt(apiPos.debtAmountRaw)) / 1e6; // assuming USDC 6 decimals

      return {
        id: `pos-${apiPos.id}`,
        protocol,
        chain,
        pair: "ETH / USDC", // Fixed based on collateral/debt tokens for demo
        action: "long" as const,
        collateralUsd,
        debtUsd,
        healthFactor,
        tokenType: "aToken" as const,
        approvalStatus: "approved" as const,
        isRescueSource: false,
      };
    });

    const mockShortPositions: Position[] = [
      {
        id: "pos-mock-morpho-short-1",
        protocol: "morpho-v2",
        chain: "base-sepolia",
        pair: "BNB / USDC",
        action: "short",
        collateralUsd: 15400,
        debtUsd: 7850.5,
        healthFactor: 2.18,
        tokenType: "vault-share",
        approvalStatus: "approved",
        isRescueSource: false,
      },
      {
        id: "pos-mock-morpho-short-2",
        protocol: "morpho-v2",
        chain: "base-sepolia",
        pair: "WETH / USDC",
        action: "short",
        collateralUsd: 22120,
        debtUsd: 9040.25,
        healthFactor: 2.46,
        tokenType: "vault-share",
        approvalStatus: "approved",
        isRescueSource: false,
      },
      {
        id: "pos-mock-morpho-short-3",
        protocol: "morpho-v2",
        chain: "base-sepolia",
        pair: "cbBTC / USDC",
        action: "short",
        collateralUsd: 30950,
        debtUsd: 10120.8,
        healthFactor: 3.05,
        tokenType: "vault-share",
        approvalStatus: "approved",
        isRescueSource: false,
      },
    ];

    return [...realPositions, ...mockShortPositions];
  }, [positionsData]);

  const totalCollateralUsd = useMemo(
    () => displayPositions.reduce((acc, pos) => acc + pos.collateralUsd, 0),
    [displayPositions],
  );

  const totalDebtUsd = useMemo(
    () => displayPositions.reduce((acc, pos) => acc + pos.debtUsd, 0),
    [displayPositions],
  );

  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(
    null,
  );
  const [positionStrategies, setPositionStrategies] = useState<
    Record<string, string>
  >({});
  const strategyOptions = useMemo(
    () => [...STRATEGY_PRESETS.map((preset) => preset.label), "Custom"],
    [],
  );

  if (!isConnected) {
    return (
      <div className="space-y-6 animate-fade-up">
        {/* Page header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Dashboard
            </h1>
            <p className="mt-0.5 text-sm text-[#a9b2ab]">
              Cross-protocol risk command center
            </p>
          </div>
        </div>

        <section>
          <EmptyState
            title="Wallet Not Connected"
            description="Connect a wallet with active positions on Aave, Compound, or Morpho. Reprieve auto-scans across chains."
            action={
              <Button
                size="sm"
                className="h-10 rounded-lg bg-[#c7f36b] px-4 text-sm font-medium text-white hover:bg-[#ccd7cf] shadow-sm"
                onClick={() => connect({ connector: injected() })}
              >
                Connect Wallet
              </Button>
            }
          />
        </section>
      </div>
    );
  }

  if (loading || isLoadingPositions) {
    return (
      <div className="flex items-center gap-3 text-sm text-[#a9b2ab]">
        <span className="size-4 animate-spin rounded-full border-2 border-[#2d3932] border-t-[#c7f36b]" />
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  if (!snapshot) {
    return (
      <p className="text-sm text-[#a9b2ab]">No snapshot data available.</p>
    );
  }

  const isStale = snapshot.lastCheckSecondsAgo > 1800;
  const activeSelectedPositionId = displayPositions.some(
    (position) => position.id === selectedPositionId,
  )
    ? selectedPositionId
    : (displayPositions[0]?.id ?? null);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-0.5 text-sm text-[#a9b2ab]">
            Cross-protocol risk command center
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            <div className="size-7 rounded-full border-2 border-[#0b0f0d] bg-[#0b0f0d] p-0.5 ring-1 ring-[#c7f36b]">
              <ProtocolIcon protocol="aave-v4" className="size-full" />
            </div>
            <div className="size-7 rounded-full border-2 border-[#0b0f0d] bg-[#0b0f0d] p-0.5 ring-1 ring-[#c7f36b]">
              <ProtocolIcon protocol="compound-v3" className="size-full" />
            </div>
            <div className="size-7 rounded-full border-2 border-[#0b0f0d] bg-[#0b0f0d] p-0.5 ring-1 ring-[#c7f36b]">
              <ProtocolIcon protocol="morpho-v2" className="size-full" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="tag">
              <span className="size-1.5 rounded-full bg-[#b5e86f]" />
              System Operational
            </span>
            <StatusBadge label="Data Feeds · DON Verified" tone="info" pulse />
            {isStale ? <StatusBadge label="Stale data" tone="warning" /> : null}
          </div>
        </div>
      </div>

      {/* Stale warning */}
      {isStale ? (
        <div className="card-inset flex items-start gap-3 p-4 text-sm text-amber-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
          <span>
            Data may be stale. Last update was more than 30 minutes ago. Rescue
            triggers are held for safety.
          </span>
        </div>
      ) : null}

      {/* Portfolio Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-5 border-[#c7f36b]">
          <p className="text-sm font-medium text-[#a9b2ab]">Total Collateral</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-[#e7ece6]">
            {formatUsd(totalCollateralUsd)}
          </p>
        </div>
        <div className="card p-5 border-[#c7f36b]">
          <p className="text-sm font-medium text-[#a9b2ab]">Total Debt</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-red-400">
            {formatUsd(totalDebtUsd)}
          </p>
        </div>
      </div>

      {/* CRE Workflow Animation */}
      <CreWorkflowAnimation />

      {/* Main grid */}
      <div className="space-y-3">
        {/* Positions column */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-widest text-[#c7f36b]">
              Positions
            </p>
            <span className="text-xs text-[#8c9890]">
              {displayPositions.length} detected
            </span>
          </div>

          {displayPositions.length === 0 ? (
            <EmptyState
              title="No positions detected"
              description="Connect a wallet with active positions on Aave, Compound, or Morpho. Reprieve auto-scans across chains."
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {displayPositions.map((position) => (
                <PositionCard
                  key={position.id}
                  position={position}
                  isSelected={position.id === activeSelectedPositionId}
                  rescueRun={rescueRun}
                  onSelect={() => setSelectedPositionId(position.id)}
                  strategyLabel={
                    positionStrategies[position.id] ??
                    snapshot.protectionStatus.strategyLabel ??
                    "Balanced"
                  }
                  strategyOptions={strategyOptions}
                  onStrategyChange={(nextStrategy) =>
                    setPositionStrategies((previous) => ({
                      ...previous,
                      [position.id]: nextStrategy,
                    }))
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer proof banner */}
      <div className="card-inset flex items-start gap-3 p-4 text-xs text-[#a9b2ab]">
        <DatabaseZap className="mt-0.5 size-4 shrink-0 text-[#ccd7cf]" />
        <div>
          <p className="font-semibold text-[#b5e86f]">Proof, not trust</p>
          <p className="mt-0.5">
            Every rescue action is written to immutable logs and verifiable by
            workflow ID and transaction hash.
          </p>
        </div>
      </div>

      <RescueOverlay />
    </div>
  );
}
