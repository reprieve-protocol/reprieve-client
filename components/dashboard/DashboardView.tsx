"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@/components/common/EmptyState";
import { RescueOverlay } from "@/components/rescue/RescueOverlay";
import {
  usePositionsControllerGetRiskSnapshot,
  getPositionsControllerGetRiskSnapshotQueryKey,
  useDemoWalletsControllerBootstrapPositions,
} from "@/src/services/queries";
import { useAppState } from "@/lib/state/app-context";
import { type Position } from "@/lib/domain/types";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { Button } from "@/components/ui/button";
import { RescueStepLogger } from "@/components/dashboard/RescueStepLogger";
import { OraclePricesSection } from "@/components/dashboard/OraclePricesSection";
import { DashboardPageTitle } from "@/components/dashboard/dashboard-view/DashboardPageTitle";
import { DashboardPortfolioSummary } from "@/components/dashboard/dashboard-view/DashboardPortfolioSummary";
import { DashboardPositionsSection } from "@/components/dashboard/dashboard-view/DashboardPositionsSection";
import { DashboardStatusHeader } from "@/components/dashboard/dashboard-view/DashboardStatusHeader";
import {
  buildDashboardPositions,
  hasDashboardPositions,
} from "@/components/dashboard/dashboard-view/dashboard-position-utils";
import { useDemoWallet } from "@/lib/state/demo-wallet-context";

const DASHBOARD_LOADING_MESSAGES = [
  "Syncing wallet exposure across protocols",
  "Pulling the latest oracle and risk snapshot",
  "Preparing rescue workflow and position health",
] as const;

function DashboardLoadingState({
  badge,
  title,
  message,
}: {
  badge: string;
  title: string;
  message: string;
}) {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <DashboardPageTitle />
        <div className="inline-flex items-center gap-2 rounded-full border border-[#314235] bg-[#111a15]/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[#c7f36b]">
          <span className="size-2 rounded-full bg-[#c7f36b] animate-pulse" />
          {badge}
        </div>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-[#253128] bg-[radial-gradient(circle_at_top,_rgba(199,243,107,0.16),_transparent_38%),linear-gradient(180deg,_rgba(18,26,21,0.98),_rgba(12,18,14,0.98))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#c7f36b]">
                {title}
              </p>
              <div className="h-8 w-56 max-w-full animate-pulse rounded-full bg-[#1b251e]" />
              <p className="min-h-5 text-sm text-[#a9b2ab]" aria-live="polite">
                {message}
              </p>
            </div>

            <div className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-[#314235] bg-[#0f1712]">
              <span className="absolute inset-0 rounded-full border-2 border-transparent border-r-[#86a94d] border-t-[#c7f36b] animate-spin" />
              <span className="size-2.5 rounded-full bg-[#c7f36b] shadow-[0_0_24px_rgba(199,243,107,0.55)]" />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#27332b] bg-[#111914]/80 p-4"
              >
                <div className="mb-4 h-3 w-20 animate-pulse rounded-full bg-[#202b23]" />
                <div className="h-8 w-28 animate-pulse rounded-full bg-[#27352b]" />
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#1b251e]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#2d3932] via-[#c7f36b] to-[#2d3932] animate-pulse"
                    style={{
                      width: `${58 + index * 12}%`,
                      animationDelay: `${index * 180}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-[24px] border border-[#27332b] bg-[#0f1712]/90 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="h-4 w-36 animate-pulse rounded-full bg-[#202b23]" />
                <div className="h-8 w-24 animate-pulse rounded-full bg-[#18211b]" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-2xl border border-[#1c261f] bg-[#121a15] px-4 py-3"
                  >
                    <div className="space-y-2">
                      <div className="h-3 w-28 animate-pulse rounded-full bg-[#202b23]" />
                      <div className="h-3 w-20 animate-pulse rounded-full bg-[#1a231d]" />
                    </div>
                    <div className="h-6 w-16 animate-pulse rounded-full bg-[#27352b]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#27332b] bg-[#101712]/90 p-4">
              <div className="mb-4 h-4 w-32 animate-pulse rounded-full bg-[#202b23]" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-[#c7f36b] animate-pulse" />
                      <div className="h-3 w-24 animate-pulse rounded-full bg-[#202b23]" />
                    </div>
                    <div className="h-2 w-full animate-pulse rounded-full bg-[#18211b]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function DashboardView() {
  const queryClient = useQueryClient();
  const { isConnected, isConnecting, isReconnecting, address } = useAccount();
  const { demoWalletAddress, isResolvingDemoWallet } = useDemoWallet();

  const { connect } = useConnect();
  const {
    state: { loading, error, snapshot, rescueRun },
  } = useAppState();

  const {
    data: positionsData,
    isLoading: isLoadingPositions,
    refetch: refetchPositions,
  } = usePositionsControllerGetRiskSnapshot(
    demoWalletAddress,
    { maxAgeSec: 600 },
    {
      query: {
        refetchInterval: 5000,
        enabled: !!demoWalletAddress,
        queryKey: getPositionsControllerGetRiskSnapshotQueryKey(
          demoWalletAddress,
          { maxAgeSec: 600 },
        ),
      },
    },
  );

  const { mutateAsync: bootstrapPositions, isPending: isCreatingPosition } =
    useDemoWalletsControllerBootstrapPositions();
  const [isWaitingForCreatedPosition, setIsWaitingForCreatedPosition] =
    useState(false);
  const [isRefreshingPositions, setIsRefreshingPositions] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [createPositionError, setCreatePositionError] = useState<string | null>(
    null,
  );

  const hasAnyPositions = useMemo(
    () => hasDashboardPositions(positionsData),
    [positionsData],
  );
  const shouldPollForCreatedPosition =
    isWaitingForCreatedPosition && !hasAnyPositions;

  useEffect(() => {
    if (!shouldPollForCreatedPosition) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refetchPositions().then((result) => {
        const polledData = result.data as { positions?: unknown[] } | undefined;
        const polledHasPositions =
          Array.isArray(polledData?.positions) &&
          polledData.positions.length > 0;
        if (polledHasPositions) {
          setIsWaitingForCreatedPosition(false);
        }
      });
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [shouldPollForCreatedPosition, refetchPositions]);

  useEffect(() => {
    if (!loading && !isLoadingPositions) {
      setLoadingMessageIndex(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setLoadingMessageIndex(
        (current) => (current + 1) % DASHBOARD_LOADING_MESSAGES.length,
      );
    }, 1800);

    return () => window.clearInterval(intervalId);
  }, [loading, isLoadingPositions]);

  const onCreatePosition = async () => {
    if (!demoWalletAddress) {
      setCreatePositionError(
        "Demo wallet not ready yet. Reconnect wallet and try again.",
      );
      return;
    }

    setCreatePositionError(null);
    setIsWaitingForCreatedPosition(true);

    try {
      await bootstrapPositions({
        demoWalletAddress,
        data: {
          rescueMode: "TOP_UP",
          force: false,
          minBorrowUsd: 1000,
        },
      });

      await queryClient.invalidateQueries({
        queryKey: getPositionsControllerGetRiskSnapshotQueryKey(
          demoWalletAddress,
          { maxAgeSec: 600 },
        ),
      });
      const refetchResult = await refetchPositions();
      const latestData = refetchResult.data as
        | { positions?: unknown[] }
        | undefined;
      const latestHasPositions =
        Array.isArray(latestData?.positions) && latestData.positions.length > 0;
      if (latestHasPositions) {
        setIsWaitingForCreatedPosition(false);
      }
    } catch (error) {
      console.error("Failed to bootstrap positions:", error);
      setCreatePositionError(
        "Failed to create new position. Please try again.",
      );
      setIsWaitingForCreatedPosition(false);
    }
  };

  const onRefreshPositions = async () => {
    if (!demoWalletAddress) return;

    setIsRefreshingPositions(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: getPositionsControllerGetRiskSnapshotQueryKey(
          demoWalletAddress,
          { maxAgeSec: 600 },
        ),
      });
      await refetchPositions();
    } finally {
      setIsRefreshingPositions(false);
    }
  };

  const displayPositions: Position[] = useMemo(() => {
    return buildDashboardPositions(positionsData);
  }, [positionsData]);

  const totalCollateralUsd = useMemo(
    () => displayPositions.reduce((acc, pos) => acc + pos.collateralUsd, 0),
    [displayPositions],
  );

  const totalDebtUsd = useMemo(
    () => displayPositions.reduce((acc, pos) => acc + pos.debtUsd, 0),
    [displayPositions],
  );
  const lowestHealthFactor = useMemo(() => {
    if (displayPositions.length === 0) {
      return null;
    }

    return Math.min(
      ...displayPositions.map((position) => position.healthFactor),
    );
  }, [displayPositions]);
  const isResolvingWalletConnection = isConnecting || isReconnecting;

  if (isResolvingWalletConnection) {
    return (
      <DashboardLoadingState
        badge="Connecting wallet"
        title="Restoring session"
        message="Checking your connected wallet and restoring the last active session."
      />
    );
  }

  if (!isConnected) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <DashboardPageTitle />
        </div>

        <section>
          <EmptyState
            title="Wallet Not Connected"
            description="Connect a wallet with active positions on Aave, Compound, or Morpho. Reprieve auto-scans across chains."
            action={
              <Button
                size="sm"
                className="h-10 rounded-lg bg-[#c7f36b] px-4 text-sm font-medium text-[#172010] hover:bg-[#ccd7cf] shadow-sm"
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

  if (isResolvingDemoWallet) {
    return (
      <DashboardLoadingState
        badge="Preparing demo wallet"
        title="Generating workspace"
        message="Creating a fresh managed demo wallet and reloading every dependent dashboard API."
      />
    );
  }

  if (loading || isLoadingPositions) {
    return (
      <DashboardLoadingState
        badge="Building live dashboard"
        title="Initializing"
        message={DASHBOARD_LOADING_MESSAGES[loadingMessageIndex]}
      />
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

  return (
    <div className="space-y-6 animate-fade-up">
      <OraclePricesSection />
      <DashboardStatusHeader isStale={isStale} />
      <DashboardPortfolioSummary
        totalCollateralUsd={totalCollateralUsd}
        totalDebtUsd={totalDebtUsd}
        walletAddress={demoWalletAddress || address || null}
      />

      {/* CRE Workflow Animation */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-widest text-[#c7f36b]">
            CRE Workflow
          </p>
        </div>
        <RescueStepLogger
          address={demoWalletAddress}
          lowestHealthFactor={lowestHealthFactor}
        />
      </section>

      {/* Main grid */}
      <div className="space-y-3">
        {/* Positions column */}
        <DashboardPositionsSection
          positions={displayPositions}
          snapshot={snapshot}
          rescueRun={rescueRun}
          createPositionError={createPositionError}
          demoWalletAddress={demoWalletAddress}
          isCreatingPosition={isCreatingPosition}
          isRefreshingPositions={isRefreshingPositions}
          isWaitingForCreatedPosition={shouldPollForCreatedPosition}
          onCreatePosition={onCreatePosition}
          onRefreshPositions={onRefreshPositions}
        />
      </div>

      <RescueOverlay />
    </div>
  );
}
