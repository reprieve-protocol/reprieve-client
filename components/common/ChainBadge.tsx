import { CHAIN_LABELS } from "@/lib/domain/constants";
import type { Chain } from "@/lib/domain/types";

export function ChainBadge({ chain }: { chain: Chain }) {
  return (
    <span className="inline-flex items-center rounded-md bg-[#131815] px-2 py-0.5 text-[11px] font-medium text-[#a9b2ab] ring-1 ring-[#37453e]">
      {CHAIN_LABELS[chain]}
    </span>
  );
}
