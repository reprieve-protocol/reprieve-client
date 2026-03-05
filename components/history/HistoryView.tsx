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
      <p className="text-sm text-[#a9b2ab]">Loading detail panel...</p>
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
      <div className="flex items-center gap-3 text-sm text-[#a9b2ab]">
        <span className="size-4 animate-spin rounded-full border-2 border-[#2d3932] border-t-[#c7f36b]" />
        Loading rescue history...
      </div>
    );
  }

  if (error) return <p className="text-sm text-red-400">{error}</p>;

  if (!snapshot)
    return <p className="text-sm text-[#a9b2ab]">No snapshot found.</p>;

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
          <p className="mt-0.5 text-sm text-[#a9b2ab]">
            Audit-ready immutable execution records
          </p>
        </div>
        <span className="tag">On-chain style logs</span>
      </div>

      {/* Budget summary */}
      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Budget Summary</p>
          <p className="text-xs text-[#a9b2ab]">
            {snapshot.budget.rescuesToday} rescues today
          </p>
        </div>
        <BudgetBar
          used={snapshot.budget.usedTodayUsd}
          cap={snapshot.budget.capTodayUsd}
          label="Today"
        />
        <p className="mt-3 text-xs text-[#c7f36b]">
          All-time:{" "}
          <span className="text-[#b5e86f]">
            {snapshot.budget.totalRescues} rescues
          </span>
          {" · "}
          <span className="text-[#b5e86f]">
            ${snapshot.budget.totalSpendUsd.toFixed(2)} spent
          </span>
          {" · "}
          <span className="text-[#b5e86f]">
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
