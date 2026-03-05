"use client";

import dynamic from "next/dynamic";
import { EmptyState } from "@/components/common/EmptyState";
import { BudgetBar } from "@/components/common/BudgetBar";
import { RescueList } from "@/components/history/RescueList";
import { useAppState } from "@/lib/state/app-context";

const RescueDetailPanel = dynamic(
  () =>
    import("@/components/history/RescueDetailPanel").then(
      (mod) => mod.RescueDetailPanel,
    ),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-[#6b8cb0]">Loading detail panel...</p>
    ),
  },
);

export function HistoryView() {
  const {
    state: { loading, error, snapshot, history, selectedHistoryId },
    selectHistory,
  } = useAppState();

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-sm text-[#6b8cb0]">
        <span className="size-4 animate-spin rounded-full border-2 border-[#162840] border-t-[#5a7a9f]" />
        Loading rescue history...
      </div>
    );
  }

  if (error) return <p className="text-sm text-red-400">{error}</p>;

  if (!snapshot)
    return <p className="text-sm text-[#6b8cb0]">No snapshot found.</p>;

  const selectedEntry =
    history.find((entry) => entry.id === selectedHistoryId) ??
    history[0] ??
    null;

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Rescue History
          </h1>
          <p className="mt-0.5 text-sm text-[#6b8cb0]">
            Audit-ready immutable execution records
          </p>
        </div>
        <span className="tag">On-chain style logs</span>
      </div>

      {/* Budget summary */}
      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Budget Summary</p>
          <p className="text-xs text-[#6b8cb0]">
            {snapshot.budget.rescuesToday} rescues today
          </p>
        </div>
        <BudgetBar
          used={snapshot.budget.usedTodayUsd}
          cap={snapshot.budget.capTodayUsd}
          label="Today"
        />
        <p className="mt-3 text-xs text-[#5a7a9f]">
          All-time:{" "}
          <span className="text-[#94b4d8]">
            {snapshot.budget.totalRescues} rescues
          </span>
          {" · "}
          <span className="text-[#94b4d8]">
            ${snapshot.budget.totalSpendUsd.toFixed(2)} spent
          </span>
          {" · "}
          <span className="text-[#94b4d8]">
            ~${snapshot.budget.estSavedUsd.toFixed(0)} saved
          </span>
        </p>
      </section>

      {/* List or empty state */}
      {history.length === 0 ? (
        <EmptyState
          title="No rescues yet"
          description="Your CRE is watching. Every future rescue action will appear here with deterministic proof fields."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <RescueList
            entries={history}
            selectedId={selectedEntry?.id ?? null}
            onSelect={selectHistory}
          />
          <RescueDetailPanel entry={selectedEntry} />
        </div>
      )}
    </div>
  );
}
