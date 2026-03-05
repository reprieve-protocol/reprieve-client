import { classifyRiskLevel } from "@/lib/domain/calculations";
import type { QuantSignal } from "@/lib/domain/types";
import { StatusBadge } from "@/components/common/StatusBadge";

function badgeTone(signal: QuantSignal): "info" | "warning" {
  if (signal.id === "volatility" || signal.id === "funding") {
    return "warning";
  }
  return "info";
}

export function AggregateGauge({
  aggregateHF,
  threshold,
  quantSignals,
}: {
  aggregateHF: number;
  threshold: number;
  quantSignals: QuantSignal[];
}) {
  const maxHF = 2.2;
  const progress = Math.max(0, Math.min(100, (aggregateHF / maxHF) * 100));
  const thresholdPosition = Math.max(
    0,
    Math.min(100, (threshold / maxHF) * 100),
  );
  const risk = classifyRiskLevel(aggregateHF);
  const isBreach = aggregateHF < threshold;

  const barColor =
    risk === "safe"
      ? "bg-[#94b4d8]"
      : risk === "moderate"
        ? "bg-amber-500"
        : risk === "danger"
          ? "bg-orange-500"
          : "bg-red-500";

  return (
    <section className="card p-5">
      {/* Label */}
      <p className="text-[11px] font-medium uppercase tracking-widest text-[#5a7a9f]">
        Aggregate Health Factor
      </p>

      {/* Big number + status */}
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-5xl font-bold tabular-nums tracking-tight text-white">
          {aggregateHF.toFixed(2)}
        </p>
        <StatusBadge
          label={isBreach ? "BREACH" : "Within threshold"}
          tone={isBreach ? "danger" : "success"}
        />
      </div>

      {/* Progress bar */}
      <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-[#0c1628]">
        <div
          className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
        {/* Threshold marker */}
        <div
          className="absolute inset-y-0 w-px bg-white/40"
          style={{ left: `${thresholdPosition}%` }}
          aria-hidden
        />
      </div>

      {/* Scale labels */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-[#4a6a8f]">
        <span>0.00</span>
        <span className="text-[#6b8cb0]">Threshold {threshold.toFixed(2)}</span>
        <span>{maxHF.toFixed(1)}</span>
      </div>

      {/* Quant signals */}
      {quantSignals.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {quantSignals.map((signal) => (
            <StatusBadge
              key={signal.id}
              label={`${signal.label}: ${signal.value}`}
              tone={badgeTone(signal)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
