import { CHAIN_LABELS } from "@/lib/domain/constants";
import type { Chain } from "@/lib/domain/types";

export function ChainBadge({ chain }: { chain: Chain }) {
  return (
    <span className="inline-flex items-center rounded-md bg-[#0c1628] px-2 py-0.5 text-[11px] font-medium text-[#6b8cb0] ring-1 ring-[#192e4c]">
      {CHAIN_LABELS[chain]}
    </span>
  );
}
