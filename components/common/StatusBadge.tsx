import { cn } from "@/lib/utils";

export function StatusBadge({
  label,
  tone = "neutral",
  pulse = false,
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide",
        tone === "neutral" &&
          "bg-[#0f1e38] text-[#6b8cb0] ring-1 ring-[#192e4c]",
        tone === "success" &&
          "bg-[#94b4d8]/10 text-[#94b4d8] ring-1 ring-[#94b4d8]/25",
        tone === "warning" &&
          "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/25",
        tone === "danger" &&
          "bg-red-500/10 text-red-400 ring-1 ring-red-500/25",
        tone === "info" &&
          "bg-[#5a7a9f]/10 text-[#7a9abf] ring-1 ring-[#5a7a9f]/25",
        pulse && "animate-pulse",
      )}
    >
      {label}
    </span>
  );
}
