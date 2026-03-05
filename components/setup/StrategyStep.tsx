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
        <span className="flex size-5 items-center justify-center rounded-full bg-[#c7f36b]/20 text-[10px] font-bold text-[#ccd7cf] ring-1 ring-[#c7f36b]/30">
          1
        </span>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#c7f36b]">
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
                "card text-left transition-all duration-150 p-4 hover:border-[#c7f36b]",
                selected &&
                  "border-[#c7f36b]/40 bg-[#c7f36b]/5 shadow-[0_0_16px_-10px_rgba(199,243,107,0.42)]",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-white">
                  {preset.label}
                </p>
                {selected ? (
                  <CheckCircle2 className="size-4 shrink-0 text-[#ccd7cf]" />
                ) : (
                  <div className="size-4 shrink-0 rounded-full border border-[#2d3932]" />
                )}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#a9b2ab]">
                {preset.description}
              </p>
              <p className="mt-3 text-[11px] text-[#8c9890]">
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
