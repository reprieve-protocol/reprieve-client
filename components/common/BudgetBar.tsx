import { cn } from "@/lib/utils";

export function BudgetBar({
  used,
  cap,
  label,
}: {
  used: number;
  cap: number;
  label?: string;
}) {
  const percentage =
    cap <= 0 ? 0 : Math.min(100, Math.round((used / cap) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#6b8cb0]">{label ?? "Budget"}</span>
        <span className="font-medium text-[#94b4d8]">
          ${used.toFixed(2)} / ${cap.toFixed(2)}
        </span>
      </div>
      <div className="progress-track">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            percentage < 50 && "bg-[#94b4d8]",
            percentage >= 50 && percentage < 80 && "bg-amber-500",
            percentage >= 80 && "bg-red-500",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-[11px] text-[#4a6a8f]">
        {percentage}% of daily cap used
      </p>
    </div>
  );
}
