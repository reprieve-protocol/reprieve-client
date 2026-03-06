import { formatUsd } from "@/lib/domain/calculations";
import type { ProtectionConfig } from "@/lib/domain/types";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UpsertUserCreRegistrationDtoQueuePriority,
  type UpsertUserCreRegistrationDtoQueuePriority as QueuePriority,
} from "@/src/services/models/upsertUserCreRegistrationDtoQueuePriority";

function FieldLabel({ title, caption }: { title: string; caption: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#b5e86f]">{title}</p>
      <p className="mt-0.5 text-[11px] text-[#c7f36b]">{caption}</p>
    </div>
  );
}

export function ParametersStep({
  config,
  onChange,
  budgetCapUsd,
  onBudgetCapUsdChange,
  queuePriority,
  onQueuePriorityChange,
}: {
  config: ProtectionConfig;
  onChange: (next: ProtectionConfig) => void;
  budgetCapUsd: number;
  onBudgetCapUsdChange: (next: number) => void;
  queuePriority: QueuePriority;
  onQueuePriorityChange: (next: QueuePriority) => void;
}) {
  const cappedDailyCapUsd = Math.min(20_000, Math.max(1_000, budgetCapUsd));

  return (
    <section className="card p-5 space-y-5">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#c7f36b]">
          Parameters
        </h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* HF Threshold */}
        <div className="space-y-3">
          <FieldLabel
            title="HF Threshold"
            caption="Trigger rescue when health factor falls below this value."
          />
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
          <p className="text-lg font-bold tabular-nums text-white">
            {config.threshold.toFixed(2)}
          </p>
          <p className="text-[11px] text-[#a9b2ab]">Range 1.05 - 2.00</p>
        </div>

        {/* Daily Cap */}
        <div className="space-y-3">
          <FieldLabel title="Daily Cap" caption="Max total budget/day (USD)" />
          <Slider
            min={1_000}
            max={20_000}
            step={500}
            value={[cappedDailyCapUsd]}
            onValueChange={(vals) => onBudgetCapUsdChange(vals[0])}
            className="w-full"
          />
          <p className="text-lg font-bold tabular-nums text-white">
            {formatUsd(cappedDailyCapUsd)}
          </p>
        </div>

        <div className="space-y-3">
          <FieldLabel
            title="Queue Priority"
            caption="Choose which route CRE should prefer first."
          />
          <Select
            value={queuePriority}
            onValueChange={(value) => onQueuePriorityChange(value as QueuePriority)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select queue priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value={UpsertUserCreRegistrationDtoQueuePriority.SAME_CHAIN_FIRST}
              >
                Same-chain first
              </SelectItem>
              <SelectItem
                value={
                  UpsertUserCreRegistrationDtoQueuePriority.CROSS_CHAIN_FIRST
                }
              >
                Cross-chain first
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[11px] text-[#a9b2ab]">
            {queuePriority ===
            UpsertUserCreRegistrationDtoQueuePriority.SAME_CHAIN_FIRST
              ? "Prefer same-chain execution before cross-chain routes."
              : "Prefer cross-chain execution before same-chain routes."}
          </p>
        </div>
      </div>
    </section>
  );
}
