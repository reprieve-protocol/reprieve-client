"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { DemoPositionsLoading } from "@/components/dashboard/DemoPositionsLoading";
import { PositionCard } from "@/components/dashboard/PositionCard";
import { Button } from "@/components/ui/button";
import { STRATEGY_PRESETS } from "@/lib/domain/constants";
import { type AppSnapshot, type Position, type RescueRunState } from "@/lib/domain/types";

export function DashboardPositionsSection({
  positions,
  snapshot,
  rescueRun,
  createPositionError,
  demoWalletAddress,
  isCreatingPosition,
  isRefreshingPositions,
  isWaitingForCreatedPosition,
  onCreatePosition,
  onRefreshPositions,
}: {
  positions: Position[];
  snapshot: AppSnapshot;
  rescueRun: RescueRunState | null;
  createPositionError: string | null;
  demoWalletAddress: string;
  isCreatingPosition: boolean;
  isRefreshingPositions: boolean;
  isWaitingForCreatedPosition: boolean;
  onCreatePosition: () => Promise<void>;
  onRefreshPositions: () => Promise<void>;
}) {
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

  const activeSelectedPositionId = positions.some(
    (position) => position.id === selectedPositionId,
  )
    ? selectedPositionId
    : (positions[0]?.id ?? null);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-widest text-[#c7f36b]">
          Positions
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8c9890]">{positions.length} detected</span>
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-lg border-[#2d3932] bg-[#131815] px-3 text-xs text-[#ccd7cf] hover:bg-[#191f1b] hover:text-white"
            onClick={() => void onRefreshPositions()}
            disabled={
              isRefreshingPositions ||
              isCreatingPosition ||
              isWaitingForCreatedPosition ||
              !demoWalletAddress
            }
          >
            <RefreshCcw
              className={`size-3.5 ${isRefreshingPositions ? "animate-spin" : ""}`}
            />
            {isRefreshingPositions ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {createPositionError ? (
        <p className="text-xs text-red-400">{createPositionError}</p>
      ) : null}

      {isCreatingPosition || isWaitingForCreatedPosition ? (
        <DemoPositionsLoading />
      ) : positions.length === 0 ? (
        <EmptyState
          title="No positions detected"
          description="Connect a wallet with active positions on Aave, Compound, or Morpho. Reprieve auto-scans across chains."
          action={
            <div className="flex max-w-md flex-col items-center gap-2">
              <Button
                size="sm"
                className="h-10 rounded-lg bg-[#c7f36b] px-4 text-sm font-medium text-[#172010] shadow-sm hover:bg-[#b5e86f]"
                onClick={() => void onCreatePosition()}
                disabled={isCreatingPosition || isWaitingForCreatedPosition}
              >
                {isCreatingPosition || isWaitingForCreatedPosition
                  ? "Creating position..."
                  : "Create New Position"}
              </Button>
              <p className="flex items-center gap-1.5 text-center text-xs text-amber-300/90">
                <AlertTriangle className="size-3.5 shrink-0 text-amber-300/90" />
                Run `Fund Token` in the top bar before creating a new position.
              </p>
            </div>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {positions.map((position) => (
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
  );
}
