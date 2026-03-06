import { classifyRiskLevel, formatUsd } from "@/lib/domain/calculations";
import {
  PROTOCOL_ACCENTS,
  PROTOCOL_LABELS,
  RISK_CLASSNAMES,
} from "@/lib/domain/constants";
import type { Position, RescueRunState } from "@/lib/domain/types";
import { ChainBadge } from "@/components/common/ChainBadge";
import { ProtocolIcon } from "@/components/common/ProtocolIcon";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function PositionCard({
  position,
  rescueRun,
  onSelect,
}: {
  position: Position;
  rescueRun: RescueRunState | null;
  isSelected: boolean;
  onSelect: () => void;
  strategyLabel: string;
  strategyOptions: string[];
  onStrategyChange: (nextStrategy: string) => void;
}) {
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
          : "text-[#b5e86f]";

  const cardBorder = isActiveRescue
    ? "border-[#c7f36b]/40 shadow-[0_0_18px_-10px_rgba(199,243,107,0.35)]"
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
        "card p-4 transition-all duration-200 hover:border-[#c7f36b] cursor-pointer",
        cardBorder,
        isActiveRescue && "bg-[#c7f36b]/5",
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
          <ChainBadge chain={position.chain} />
        </div>
      </div>

      {/* Pair & Action */}
      <div className="mt-2 flex items-center gap-2">
        <p className="text-sm font-medium text-[#b5e86f]">{position.pair}</p>
        {position.action && (
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
              position.action === "long"
                ? "border border-[#b5e86f]/40 bg-[#b5e86f]/15 text-[#b5e86f]"
                : "border border-red-500/40 bg-red-500/15 text-red-300",
            )}
          >
            {position.action}
          </span>
        )}
      </div>

      {/* Health Factor */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-[#c7f36b]">Health Factor</span>
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
            risk === "safe" && "**:data-[slot=progress-indicator]:bg-[#b5e86f]",
          )}
        />
      </div>

      {/* Collateral / Debt */}
      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div className="card-inset px-3 py-2">
          <p className="text-[#8c9890]">Collateral</p>
          <p className="mt-0.5 font-medium text-[#e7ece6]">
            {formatUsd(position.collateralUsd)}
          </p>
        </div>
        <div className="card-inset px-3 py-2">
          <p className="text-[#8c9890]">Debt</p>
          <p className="mt-0.5 font-medium text-[#e7ece6]">
            {formatUsd(position.debtUsd)}
          </p>
        </div>
      </div>
    </article>
  );
}
