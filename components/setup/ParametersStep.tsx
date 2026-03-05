import { estimateRescuesPerDay } from "@/lib/domain/calculations";
import type { Position, ProtectionConfig } from "@/lib/domain/types";
import { Slider } from "@/components/ui/slider";

function FieldLabel({ title, caption }: { title: string; caption: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#94b4d8]">{title}</p>
      <p className="mt-0.5 text-[11px] text-[#5a7a9f]">{caption}</p>
    </div>
  );
}

export function ParametersStep({
  config,
  onChange,
  triggeredCount,
  positions,
}: {
  config: ProtectionConfig;
  onChange: (next: ProtectionConfig) => void;
  triggeredCount: number;
  positions: Position[];
}) {
  const rescuesPerDay = estimateRescuesPerDay(
    config.dailyCapEth,
    config.perRescueCapEth,
  );

  return (
    <section className="card p-5 space-y-5">
      <div className="flex items-center gap-2">
        <span className="flex size-5 items-center justify-center rounded-full bg-[#5a7a9f]/20 text-[10px] font-bold text-[#7a9abf] ring-1 ring-[#5a7a9f]/30">
          2
        </span>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#5a7a9f]">
          Parameters
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* HF Threshold */}
        <div className="space-y-3">
          <FieldLabel title="HF Threshold" caption="Range 1.05 – 2.00" />
          <Slider
            min={1.05}
            max={2}
            step={0.01}
            value={[config.threshold]}
            onValueChange={(vals) =>
              onChange({ ...config, threshold: vals[0] })
            }
            className="w-full"
          />
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold tabular-nums text-white">
              {config.threshold.toFixed(2)}
            </p>
            <p className="text-xs text-[#6b8cb0]">
              {triggeredCount} positions triggered
            </p>
          </div>
        </div>

        {/* Per-Rescue Cap */}
        <div className="space-y-3">
          <FieldLabel title="Per-Rescue Cap" caption="Max gas per rescue" />
          <Slider
            min={0.01}
            max={0.2}
            step={0.01}
            value={[config.perRescueCapEth]}
            onValueChange={(vals) =>
              onChange({ ...config, perRescueCapEth: vals[0] })
            }
            className="w-full"
          />
          <p className="text-lg font-bold tabular-nums text-white">
            {config.perRescueCapEth.toFixed(2)}{" "}
            <span className="text-sm font-normal text-[#6b8cb0]">ETH</span>
          </p>
        </div>

        {/* Daily Cap */}
        <div className="space-y-3">
          <FieldLabel title="Daily Cap" caption="Max total gas/day" />
          <Slider
            min={0.05}
            max={1}
            step={0.01}
            value={[config.dailyCapEth]}
            onValueChange={(vals) =>
              onChange({ ...config, dailyCapEth: vals[0] })
            }
            className="w-full"
          />
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold tabular-nums text-white">
              {config.dailyCapEth.toFixed(2)}{" "}
              <span className="text-sm font-normal text-[#6b8cb0]">ETH</span>
            </p>
            <p className="text-xs text-[#6b8cb0]">≈ {rescuesPerDay}/day</p>
          </div>
        </div>

        {/* Emergency Override */}
        <div className="space-y-3">
          <FieldLabel
            title="Emergency Override"
            caption="Force rescue when any HF < 1.10"
          />
          <button
            type="button"
            onClick={() =>
              onChange({
                ...config,
                emergencyOverride: !config.emergencyOverride,
              })
            }
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
              config.emergencyOverride
                ? "bg-[#94b4d8]/10 text-[#94b4d8] ring-1 ring-[#94b4d8]/30"
                : "bg-[#0c1628] text-[#6b8cb0] ring-1 ring-[#162840] hover:ring-[#5a7a9f]"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${config.emergencyOverride ? "bg-[#94b4d8]" : "bg-[#4a6a8f]"}`}
            />
            {config.emergencyOverride ? "Enabled" : "Disabled"}
          </button>
        </div>
      </div>

      {/* Info boxes */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card-inset p-3 text-xs text-[#6b8cb0]">
          <p className="font-semibold text-[#94b4d8]">Priority queue</p>
          <ol className="mt-1.5 space-y-0.5 list-decimal list-inside">
            <li>Same-chain first</li>
            <li>CCIP cross-chain escalation</li>
          </ol>
        </div>
        <div className="card-inset p-3 text-xs text-[#6b8cb0]">
          <p className="font-semibold text-[#94b4d8]">Live preview</p>
          <p className="mt-1.5">
            {positions.filter((p) => p.healthFactor < config.threshold).length}{" "}
            of {positions.length} positions targeted
          </p>
        </div>
      </div>
    </section>
  );
}
