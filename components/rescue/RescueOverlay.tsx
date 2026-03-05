"use client";

import { useMemo } from "react";
import { Activity, ArrowRight, Clock3, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CHAIN_LABELS } from "@/lib/domain/constants";
import { useAppState } from "@/lib/state/app-context";
import { cn } from "@/lib/utils";

function phaseTone(status: string): "info" | "success" | "warning" | "danger" {
  if (status === "complete") return "success";
  if (status === "failed" || status === "ccip-failed") return "danger";
  if (status === "ccip-delayed" || status === "partial") return "warning";
  return "info";
}

export function RescueOverlay() {
  const {
    state: { rescueRun },
    dismissRescueRun,
  } = useAppState();

  const show = Boolean(rescueRun && rescueRun.phases.length > 0);

  const finished =
    rescueRun?.phase.phase === "complete" ||
    rescueRun?.phase.phase === "failed";

  const title = useMemo(() => {
    if (!rescueRun) return "";
    if (rescueRun.phase.phase === "complete") return "Rescue Completed";
    if (rescueRun.phase.phase === "failed") return "Rescue Halted";
    return "CRE Workflow Executing";
  }, [rescueRun]);

  if (!show || !rescueRun) return null;

  const progress = Math.round(rescueRun.phase.progress * 100);
  const progressColor =
    rescueRun.phase.status === "failed" ||
    rescueRun.phase.status === "ccip-failed"
      ? "bg-red-500"
      : rescueRun.phase.status === "partial" ||
          rescueRun.phase.status === "ccip-delayed"
        ? "bg-amber-500"
        : "bg-[#5a7a9f]";

  return (
    <div className="fixed inset-0 z-50 bg-[#080f1e]/85 p-4 backdrop-blur-md md:p-10">
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#162840] bg-[#080f1e] shadow-2xl">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#162840] px-6 py-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-[#5a7a9f]">
              Detect · Evaluate · Simulate · Rescue
            </p>
            <h2 className="mt-1 text-lg font-semibold text-white">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge
              label={rescueRun.phase.status.toUpperCase()}
              tone={phaseTone(rescueRun.phase.status)}
              pulse
            />
            {finished ? (
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-[#6b8cb0] hover:bg-[#0f1e38] hover:text-white"
                onClick={dismissRescueRun}
              >
                <X className="size-4" />
              </Button>
            ) : null}
          </div>
        </header>

        <div className="grid h-full gap-5 overflow-auto p-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: progress + phases */}
          <section className="space-y-4">
            {/* Progress panel */}
            <div className="card-inset p-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-medium text-[#94b4d8]">
                  Workflow progress
                </span>
                <span className="tabular-nums text-[#6b8cb0]">{progress}%</span>
              </div>
              <div className="progress-track">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    progressColor,
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-[#6b8cb0]">
                {rescueRun.phase.message}
              </p>
            </div>

            {/* Phase list */}
            <div className="space-y-2">
              {rescueRun.phases.map((phase, index) => (
                <article
                  key={`${phase.phase}-${index}`}
                  className={cn(
                    "rounded-xl border p-3.5",
                    phase.status === "failed" || phase.status === "ccip-failed"
                      ? "border-red-500/25 bg-red-500/5"
                      : phase.status === "partial" ||
                          phase.status === "ccip-delayed"
                        ? "border-amber-500/25 bg-amber-500/5"
                        : "card-inset",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium capitalize text-white">
                      {phase.phase.replace("_", " ")}
                    </p>
                    <StatusBadge
                      label={phase.status}
                      tone={phaseTone(phase.status)}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-[#6b8cb0]">
                    {phase.message}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Right: chain map */}
          <section className="space-y-4">
            <div className="card-inset p-4">
              <p className="text-sm font-semibold text-white">
                Split-chain rescue map
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[#162840] bg-[#080f1e] p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-[#5a7a9f]">
                    Source
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-white">
                    {CHAIN_LABELS["arbitrum-sepolia"]}
                  </p>
                  <p className="mt-0.5 text-xs text-[#5a7a9f]">
                    Compound withdrawal
                  </p>
                </div>
                <div className="rounded-lg border border-[#162840] bg-[#080f1e] p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-[#5a7a9f]">
                    Target
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-white">
                    {CHAIN_LABELS["base-sepolia"]}
                  </p>
                  <p className="mt-0.5 text-xs text-[#5a7a9f]">
                    Morpho debt repay
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-[#162840] bg-[#080f1e] p-2.5 text-xs text-[#6b8cb0]">
                <Activity className="size-3.5 animate-pulse text-[#7a9abf]" />
                CCIP bridge
                <ArrowRight className="size-3.5" />
                Cross-chain lock active
              </div>
            </div>

            {rescueRun.phase.status === "ccip-delayed" ? (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-4 text-sm text-amber-300">
                <div className="mb-2 flex items-center gap-2 font-medium">
                  <Clock3 className="size-4" />
                  CCIP delayed
                </div>
                <p className="text-xs text-amber-400/80">
                  Transfer is still in flight. <code>rescueInProgress</code>{" "}
                  lock remains enabled until confirmation.
                </p>
              </div>
            ) : null}

            {rescueRun.phase.status === "ccip-failed" ? (
              <div className="rounded-xl border border-red-500/25 bg-red-500/8 p-4 text-sm text-red-300">
                <div className="mb-2 flex items-center gap-2 font-medium">
                  <ShieldAlert className="size-4" />
                  Escrow failsafe active
                </div>
                <p className="text-xs text-red-400/80">
                  CCIP failed. Funds held in RescueEscrow on source chain. Claim
                  or retry available.
                </p>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
