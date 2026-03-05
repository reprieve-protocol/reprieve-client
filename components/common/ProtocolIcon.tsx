import Image from "next/image";
import { PROTOCOL_ICONS } from "@/lib/domain/constants";
import type { Protocol } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

export function ProtocolIcon({
  protocol,
  className,
}: {
  protocol: Protocol;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full shrink-0",
        className,
      )}
    >
      <Image
        src={PROTOCOL_ICONS[protocol]}
        alt={protocol}
        fill
        className="object-contain"
      />
    </div>
  );
}
