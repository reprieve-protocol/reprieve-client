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
          "bg-[#191f1b] text-[#a9b2ab] ring-1 ring-[#37453e]",
        tone === "success" &&
          "bg-emerald-400/12 text-emerald-300 ring-1 ring-emerald-400/30",
        tone === "warning" &&
          "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/25",
        tone === "danger" &&
          "bg-red-500/10 text-red-400 ring-1 ring-red-500/25",
        tone === "info" &&
          "bg-[#c7f36b]/10 text-[#d4e6ac] ring-1 ring-[#c7f36b]/25",
        pulse && "animate-pulse",
      )}
    >
      {label}
    </span>
  );
}
