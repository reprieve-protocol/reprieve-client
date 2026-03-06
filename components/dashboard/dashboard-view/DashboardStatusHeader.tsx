"use client";

import { AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProtocolIcon } from "@/components/common/ProtocolIcon";
import { DashboardPageTitle } from "@/components/dashboard/dashboard-view/DashboardPageTitle";

export function DashboardStatusHeader({ isStale }: { isStale: boolean }) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <DashboardPageTitle />

        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            <div className="size-7 rounded-full border-2 border-[#0b0f0d] bg-[#0b0f0d] p-0.5 ring-1 ring-[#c7f36b]">
              <ProtocolIcon protocol="aave-v4" className="size-full" />
            </div>
            <div className="size-7 rounded-full border-2 border-[#0b0f0d] bg-[#0b0f0d] p-0.5 ring-1 ring-[#c7f36b]">
              <ProtocolIcon protocol="compound-v3" className="size-full" />
            </div>
            <div className="size-7 rounded-full border-2 border-[#0b0f0d] bg-[#0b0f0d] p-0.5 ring-1 ring-[#c7f36b]">
              <ProtocolIcon protocol="morpho-v2" className="size-full" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="tag">
              <span className="size-1.5 rounded-full bg-[#b5e86f]" />
              System Operational
            </span>
            <StatusBadge label="Data Feeds · DON Verified" tone="info" pulse />
            {isStale ? <StatusBadge label="Stale data" tone="warning" /> : null}
          </div>
        </div>
      </div>

      {isStale ? (
        <div className="card-inset flex items-start gap-3 p-4 text-sm text-amber-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
          <span>
            Data may be stale. Last update was more than 30 minutes ago. Rescue
            triggers are held for safety.
          </span>
        </div>
      ) : null}
    </>
  );
}
