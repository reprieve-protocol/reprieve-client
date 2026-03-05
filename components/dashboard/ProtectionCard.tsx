import Link from "next/link";
import { ArrowRight, Settings, ShieldCheck, Zap } from "lucide-react";
import { BudgetBar } from "@/components/common/BudgetBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { AppSnapshot } from "@/lib/domain/types";

export function ProtectionCard({
  snapshot,
  onTriggerRescue,
  rescueDisabled,
}: {
  snapshot: AppSnapshot;
  onTriggerRescue: () => void;
  rescueDisabled?: boolean;
}) {
  return (
    <section className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-widest text-[#c7f36b]">
          Protection Status
        </p>
        {snapshot.protectionStatus.active ? (
          <StatusBadge label="ACTIVE" tone="success" />
        ) : (
          <StatusBadge label="NOT ACTIVE" tone="danger" pulse />
        )}
      </div>

      {/* Workflow info */}
      <div className="mt-4 space-y-1.5">
        <p className="text-sm font-medium text-white">
          {snapshot.protectionStatus.active
            ? `Workflow ${snapshot.protectionStatus.workflowId ?? "n/a"}`
            : "No workflow deployed"}
        </p>
        <p className="text-xs text-[#c7f36b]">
          Last CRE check: {snapshot.lastCheckSecondsAgo}s ago
        </p>
      </div>

      {/* Budget bar */}
      <div className="mt-4 card-inset p-3">
        <BudgetBar
          used={snapshot.budget.usedTodayUsd}
          cap={snapshot.budget.capTodayUsd}
          label="Daily spend"
        />
      </div>

      {/* Actions */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href="/setup"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#2d3932] bg-[#191f1b] px-3 py-2.5 text-xs font-medium text-[#b5e86f] transition hover:bg-[#222a25] hover:border-[#c7f36b] hover:text-white"
        >
          <Settings className="size-3.5" />
          {snapshot.protectionStatus.active ? "Edit Strategy" : "Setup Now"}
        </Link>
        <button
          type="button"
          onClick={onTriggerRescue}
          disabled={rescueDisabled}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#2d3932] bg-[#191f1b] px-3 py-2.5 text-xs font-medium text-[#b5e86f] transition hover:bg-[#222a25] hover:border-[#c7f36b] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Zap className="size-3.5" />
          Simulate Rescue
        </button>
      </div>

      {/* Audit link */}
      <Link
        href="/history"
        className="mt-3 inline-flex items-center gap-1 text-xs text-[#c7f36b] hover:text-[#b5e86f] transition-colors"
      >
        View Rescue Log
        <ArrowRight className="size-3" />
      </Link>
    </section>
  );
}
