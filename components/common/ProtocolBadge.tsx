import { PROTOCOL_LABELS } from "@/lib/domain/constants";
import type { Protocol } from "@/lib/domain/types";
import { ProtocolIcon } from "@/components/common/ProtocolIcon";

export function ProtocolBadge({ protocol }: { protocol: Protocol }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#0c1628] px-2 py-0.5 text-[11px] font-medium text-[#6b8cb0] ring-1 ring-[#192e4c]">
      <ProtocolIcon protocol={protocol} className="size-3.5" />
      {PROTOCOL_LABELS[protocol]}
    </span>
  );
}
