import { CheckCircle2 } from "lucide-react";
import type { StrategyPreset } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

export function StrategyStep({
  presets,
  selectedPresetId,
  onSelect,
}: {
  presets: StrategyPreset[];
  selectedPresetId: StrategyPreset["id"];
  onSelect: (preset: StrategyPreset) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex size-5 items-center justify-center rounded-full bg-[#5a7a9f]/20 text-[10px] font-bold text-[#7a9abf] ring-1 ring-[#5a7a9f]/30">
          1
        </span>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#5a7a9f]">
          Strategy
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {presets.map((preset) => {
          const selected = preset.id === selectedPresetId;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              className={cn(
                "card text-left transition-all duration-150 p-4 hover:border-[#5a7a9f]",
                selected &&
                  "border-[#5a7a9f]/40 bg-[#5a7a9f]/5 shadow-[0_0_20px_-8px_rgba(59,130,246,0.3)]",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-white">
                  {preset.label}
                </p>
                {selected ? (
                  <CheckCircle2 className="size-4 shrink-0 text-[#7a9abf]" />
                ) : (
                  <div className="size-4 shrink-0 rounded-full border border-[#162840]" />
                )}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#6b8cb0]">
                {preset.description}
              </p>
              <p className="mt-3 text-[11px] text-[#4a6a8f]">
                ~{preset.estRescuesPerMonth} rescues/mo ·{" "}
                {preset.estGasPerMonthEth.toFixed(2)} ETH/mo
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
