import { CircleCheckBig, Loader2, ShieldCheck } from "lucide-react";
import { BudgetBar } from "@/components/common/BudgetBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatLink, formatUsd } from "@/lib/domain/calculations";
import { LINK_USD_PRICE } from "@/lib/domain/constants";
import type { SetupDefaults } from "@/lib/domain/types";

export function DeployStep({
  setupDefaults,
  coverage,
  deploying,
  onDeploy,
  isActive,
  rescuesPerDayEstimate,
}: {
  setupDefaults: SetupDefaults;
  coverage: number;
  deploying: boolean;
  onDeploy: () => void;
  isActive: boolean;
  rescuesPerDayEstimate: number;
}) {
  const linkUsd = setupDefaults.linkCost * LINK_USD_PRICE;

  return (
    <section className="card p-5 space-y-5">
      <div className="flex items-center gap-2">
        <span className="flex size-5 items-center justify-center rounded-full bg-[#5a7a9f]/20 text-[10px] font-bold text-[#7a9abf] ring-1 ring-[#5a7a9f]/30">
          3
        </span>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#5a7a9f]">
          Deploy CRE
        </h2>
      </div>

      {/* Stats grid */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="card-inset p-4">
          <p className="text-[11px] text-[#5a7a9f]">Coverage estimate</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-white">
            {coverage}%
          </p>
          <p className="mt-0.5 text-xs text-[#6b8cb0]">
            for a 20% market drawdown
          </p>
          <div className="mt-3">
            <BudgetBar used={coverage} cap={100} label="Coverage" />
          </div>
        </div>

        <div className="card-inset p-4">
          <p className="text-[11px] text-[#5a7a9f]">One-time deployment</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-white">
            {formatLink(setupDefaults.linkCost)}
          </p>
          <p className="mt-0.5 text-xs text-[#6b8cb0]">
            {formatUsd(linkUsd)} at LINK oracle price
          </p>
          <p className="mt-2 text-xs text-[#6b8cb0]">
            Capacity: ~{rescuesPerDayEstimate} rescues/day
          </p>
        </div>
      </div>

      {/* Token approvals */}
      <div className="card-inset p-4 space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-widest text-[#5a7a9f]">
          Token approvals
        </p>
        {setupDefaults.approvals.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <span className="text-[#94b4d8]">{item.label}</span>
            {item.approved ? (
              <StatusBadge label="Approved" tone="success" />
            ) : (
              <StatusBadge label="Needs approval" tone="warning" />
            )}
          </div>
        ))}
      </div>

      {/* Deploy button */}
      <button
        type="button"
        onClick={onDeploy}
        disabled={deploying}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5a7a9f] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#5a7a9f]/20 transition hover:bg-[#7a9abf] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {deploying ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ShieldCheck className="size-4" />
        )}
        {isActive
          ? "Update Protection"
          : `Deploy Protection — Pay ${setupDefaults.linkCost} LINK`}
      </button>

      {/* Active confirmation */}
      {isActive ? (
        <div className="flex items-start gap-3 rounded-xl border border-[#94b4d8]/25 bg-[#94b4d8]/8 p-4 text-sm text-[#94b4d8]">
          <CircleCheckBig className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">CRE active</p>
            <p className="mt-0.5 text-xs text-[#94b4d8]/70">
              Deployed and DON-verified. Unified workflow is active.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
