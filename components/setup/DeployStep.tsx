import { CircleCheckBig, Loader2, ShieldCheck } from "lucide-react";
import { BudgetBar } from "@/components/common/BudgetBar";
import { Button } from "@/components/ui/button";
import type { SetupDefaults } from "@/lib/domain/types";

export function DeployStep({
  setupDefaults,
  coverage,
  deploying,
  onDeploy,
  isActive,
}: {
  setupDefaults: SetupDefaults;
  coverage: number;
  deploying: boolean;
  onDeploy: () => void;
  isActive: boolean;
}) {
  return (
    <section className="card p-5 space-y-5">
      <div className="flex items-center gap-2">
        <span className="flex size-5 items-center justify-center rounded-full bg-[#c7f36b]/20 text-[10px] font-bold text-[#ccd7cf] ring-1 ring-[#c7f36b]/30">
          3
        </span>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#c7f36b]">
          Deploy CRE
        </h2>
      </div>

      {/* Stats grid */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="card-inset p-4">
          <p className="text-[11px] text-[#c7f36b]">Coverage estimate</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-white">
            {coverage}%
          </p>
          <p className="mt-0.5 text-xs text-[#a9b2ab]">
            for a 20% market drawdown
          </p>
          <div className="mt-3">
            <BudgetBar used={coverage} cap={100} label="Coverage" />
          </div>
        </div>
      </div>

      {/* Deploy button */}
      <Button
        type="button"
        size="lg"
        onClick={onDeploy}
        disabled={deploying}
        className="w-full rounded-xl text-sm font-semibold"
      >
        {deploying ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ShieldCheck className="size-4" />
        )}
        {isActive
          ? "Update Protection"
          : `Deploy Protection — Pay ${setupDefaults.linkCost} LINK`}
      </Button>

      {/* Active confirmation */}
      {isActive ? (
        <div className="flex items-start gap-3 rounded-xl border border-[#b5e86f]/25 bg-[#b5e86f]/8 p-4 text-sm text-[#b5e86f]">
          <CircleCheckBig className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">CRE active</p>
            <p className="mt-0.5 text-xs text-[#b5e86f]/70">
              Deployed and DON-verified. Unified workflow is active.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
