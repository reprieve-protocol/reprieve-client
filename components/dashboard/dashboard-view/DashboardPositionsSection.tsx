"use client";

import { useMemo, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { DemoPositionsLoading } from "@/components/dashboard/DemoPositionsLoading";
import { PositionCard } from "@/components/dashboard/PositionCard";
import { Button } from "@/components/ui/button";
import { STRATEGY_PRESETS } from "@/lib/domain/constants";
import {
  type AppSnapshot,
  type Position,
  type RescueRunState,
} from "@/lib/domain/types";

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
          <span className="text-xs text-[#8c9890]">
            {positions.length} detected
          </span>
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
        <div className="relative overflow-hidden rounded-[28px] border border-[#2d3932] bg-[radial-gradient(circle_at_top,rgba(199,243,107,0.13),transparent_38%),linear-gradient(180deg,rgba(15,21,17,0.98),rgba(10,15,12,0.98))] px-6 py-12 text-center shadow-[0_24px_70px_-42px_rgba(0,0,0,0.9)]">
          <div className="absolute left-1/2 top-0 h-28 w-28 -translate-x-1/2 rounded-full bg-[#c7f36b]/10 blur-3xl" />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#344238] bg-[#131a15] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d9ef9d]">
              Demo bootstrap
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                No positions found
              </h3>
              <p className="mx-auto max-w-xl text-base leading-7 text-[#b7c1ba] md:text-lg">
                For easy test, generate a demo account. We&apos;ll fund it and
                bootstrap random positions for you.
              </p>
            </div>
            <Button
              size="lg"
              className="h-14 rounded-2xl bg-[#c7f36b] px-8 text-base font-semibold text-[#172010] shadow-[0_18px_40px_-20px_rgba(199,243,107,0.7)] hover:bg-[#d6f57f]"
              onClick={() => void onCreatePosition()}
              disabled={isCreatingPosition || isWaitingForCreatedPosition}
            >
              {isCreatingPosition || isWaitingForCreatedPosition
                ? "Generating demo account..."
                : "Generate Demo Account"}
            </Button>
            <p className="text-sm text-[#8f9b92]">
              Funding and position bootstrap start automatically after the demo
              wallet is ready.
            </p>
          </div>
        </div>
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
