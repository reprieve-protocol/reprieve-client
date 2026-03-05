import { ChainBadge } from "@/components/common/ChainBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { RescueLogEntry } from "@/lib/domain/types";
import { PROTOCOL_SHORT_LABELS } from "@/lib/domain/constants";
import { cn } from "@/lib/utils";

export function RescueList({
  entries,
  selectedId,
  onSelect,
}: {
  entries: RescueLogEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="card max-h-[72vh] space-y-1.5 overflow-y-auto p-2">
      {entries.map((entry) => {
        const selected = entry.id === selectedId;

        return (
          <button
            type="button"
            key={entry.id}
            onClick={() => onSelect(entry.id)}
            className={cn(
              "w-full rounded-xl p-3.5 text-left transition-all duration-150",
              selected
                ? "bg-[#5a7a9f]/10 ring-1 ring-[#5a7a9f]/30"
                : "hover:bg-[#0f1e38]",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">
                #{entry.id.split("-").at(-1)}
              </p>
              <StatusBadge
                label={
                  entry.type === "ccip-cross-chain" ? "CCIP" : "Same-chain"
                }
                tone={entry.type === "ccip-cross-chain" ? "info" : "neutral"}
              />
            </div>

            <p className="mt-1.5 text-[11px] text-[#5a7a9f]">
              {new Date(entry.timestampUtc).toUTCString()}
            </p>

            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-[#94b4d8]">
              <span>{PROTOCOL_SHORT_LABELS[entry.source.protocol]}</span>
              <span className="text-[#4a6a8f]">→</span>
              <span>{PROTOCOL_SHORT_LABELS[entry.target.protocol]}</span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#6b8cb0]">
                HF {entry.hfBefore.toFixed(2)} →{" "}
                <span className="text-[#94b4d8]">
                  {entry.hfAfter.toFixed(2)}
                </span>
              </span>
              <ChainBadge chain={entry.source.chain} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
