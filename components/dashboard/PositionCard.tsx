import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { classifyRiskLevel, formatUsd } from "@/lib/domain/calculations";
import {
  PROTOCOL_ACCENTS,
  PROTOCOL_LABELS,
  RISK_CLASSNAMES,
} from "@/lib/domain/constants";
import type { Position, RescueRunState } from "@/lib/domain/types";
import { ChainBadge } from "@/components/common/ChainBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProtocolIcon } from "@/components/common/ProtocolIcon";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

function approvalLabel(status: Position["approvalStatus"]) {
  return status === "approved" ? "Approved" : "Needs approval";
}

export function PositionCard({
  position,
  rescueRun,
  isSelected,
  onSelect,
  strategyLabel,
  strategyOptions,
  onStrategyChange,
}: {
  position: Position;
  rescueRun: RescueRunState | null;
  isSelected: boolean;
  onSelect: () => void;
  strategyLabel: string;
  strategyOptions: string[];
  onStrategyChange: (nextStrategy: string) => void;
}) {
  console.log("position: ", position);
  const risk = classifyRiskLevel(position.healthFactor);
  const isActiveRescue =
    rescueRun?.active &&
    (rescueRun.phase.phase === "same_chain" ||
      rescueRun.phase.phase === "ccip") &&
    (position.id === "pos-aave-arb" ||
      position.id === "pos-morpho-base" ||
      position.isRescueSource);

  const hfColor =
    risk === "critical"
      ? "text-red-400"
      : risk === "danger"
        ? "text-orange-400"
        : risk === "moderate"
          ? "text-amber-400"
          : "text-[#94b4d8]";

  const cardBorder = isActiveRescue
    ? "border-[#5a7a9f]/40 shadow-[0_0_32px_-8px_rgba(59,130,246,0.3)]"
    : RISK_CLASSNAMES[risk];

  return (
    <article
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "card p-4 transition-all duration-200 hover:border-[#5a7a9f] cursor-pointer",
        cardBorder,
        isActiveRescue && "bg-[#5a7a9f]/5",
        isSelected &&
          "!border-[#94b4d8] ring-2 ring-[#5a7a9f]/50 shadow-[0_0_0_1px_rgba(125,211,252,0.45),0_0_36px_-10px_rgba(56,189,248,0.65)]",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide",
            PROTOCOL_ACCENTS[position.protocol],
          )}
        >
          <ProtocolIcon protocol={position.protocol} className="size-3.5" />
          {PROTOCOL_LABELS[position.protocol]}
        </span>
        <div className="flex items-center gap-1.5">
          {isSelected ? (
            <span className="rounded-md border border-[#5a7a9f]/40 bg-[#5a7a9f]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#94b4d8]">
              Selected
            </span>
          ) : null}
          <ChainBadge chain={position.chain} />
        </div>
      </div>

      {/* Pair & Action */}
      <div className="mt-2 flex items-center gap-2">
        <p className="text-sm font-medium text-[#94b4d8]">{position.pair}</p>
        {position.action && (
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
              position.action === "long"
                ? "border border-[#94b4d8]/40 bg-[#94b4d8]/15 text-[#94b4d8]"
                : "border border-red-500/40 bg-red-500/15 text-red-300",
            )}
          >
            {position.action}
          </span>
        )}
      </div>

      {/* Health Factor */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-[#5a7a9f]">Health Factor</span>
        <span className={cn("text-2xl font-bold tabular-nums", hfColor)}>
          {position.healthFactor.toFixed(2)}
        </span>
      </div>

      {/* Progress bar for HF */}
      <div className="mt-2">
        <Progress
          value={
            risk === "critical"
              ? 15
              : risk === "danger"
                ? 35
                : risk === "moderate"
                  ? 55
                  : 80
          }
          className={cn(
            "h-1.5",
            risk === "critical" &&
              "**:data-[slot=progress-indicator]:bg-red-500",
            risk === "danger" &&
              "**:data-[slot=progress-indicator]:bg-orange-500",
            risk === "moderate" &&
              "**:data-[slot=progress-indicator]:bg-amber-500",
            risk === "safe" &&
              "**:data-[slot=progress-indicator]:bg-[#94b4d8]",
          )}
        />
      </div>

      {/* Collateral / Debt */}
      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div className="card-inset px-3 py-2">
          <p className="text-[#4a6a8f]">Collateral</p>
          <p className="mt-0.5 font-medium text-[#c5daf5]">
            {formatUsd(position.collateralUsd)}
          </p>
        </div>
        <div className="card-inset px-3 py-2">
          <p className="text-[#4a6a8f]">Debt</p>
          <p className="mt-0.5 font-medium text-[#c5daf5]">
            {formatUsd(position.debtUsd)}
          </p>
        </div>
      </div>

      {/* Footer badges */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <StatusBadge
          label={approvalLabel(position.approvalStatus)}
          tone={position.approvalStatus === "approved" ? "success" : "warning"}
        />
        {position.isRescueSource ? (
          <StatusBadge label="Rescue source" tone="info" />
        ) : null}
        {risk === "critical" ? (
          <AlertTriangle className="size-3.5 text-red-400" />
        ) : null}
        {risk === "safe" ? (
          <CheckCircle2 className="size-3.5 text-[#94b4d8]" />
        ) : null}
        {isActiveRescue ? (
          <Loader2 className="size-3.5 animate-spin text-[#7a9abf]" />
        ) : null}
      </div>
    </article>
  );
}
