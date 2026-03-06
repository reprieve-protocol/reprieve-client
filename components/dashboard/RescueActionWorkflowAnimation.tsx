"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark,
  Link2,
  ArrowRightLeft,
  TrendingUp,
  Check,
  ChevronRight,
  Zap,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { formatEther } from "viem";
import type { RescueSimulationDecision } from "@/lib/api/simulate-api-guard";

const DEFAULT_RESCUE_AMOUNT_LABEL = "1 ETH";
type RescueWorkflowVariant = "same-chain" | "cross-chain";

type WorkflowStage = {
  id: number;
  label: string;
  sublabel: string;
  color: string;
  icon: LucideIcon;
  detail: string;
  badge: string;
  badgeColor: string;
};

type WorkflowConnector = {
  label: string;
  dashed: boolean;
  color: string;
  nextColor: string;
};

type WorkflowMetric = {
  label: string;
  value: string;
  sub: string;
  color: string;
};

type WorkflowConfig = {
  stages: WorkflowStage[];
  connectors: WorkflowConnector[];
  completeDetail: string;
  metrics: WorkflowMetric[];
};

function formatRescueAmountLabel(collateralAmount?: string) {
  if (!collateralAmount) {
    return DEFAULT_RESCUE_AMOUNT_LABEL;
  }

  try {
    const amount = Number(formatEther(BigInt(collateralAmount)));

    if (!Number.isFinite(amount) || amount <= 0) {
      return DEFAULT_RESCUE_AMOUNT_LABEL;
    }

    return `${amount.toLocaleString("en-US", {
      minimumFractionDigits: amount >= 10 ? 2 : 0,
      maximumFractionDigits: 4,
    })} ETH`;
  } catch {
    return DEFAULT_RESCUE_AMOUNT_LABEL;
  }
}

function getWorkflowConfig(
  variant: RescueWorkflowVariant,
  rescueAmountLabel: string,
): WorkflowConfig {
  if (variant === "same-chain") {
    return {
      stages: [
        {
          id: 0,
          label: "ETH Sepolia",
          sublabel: "AAVE",
          color: "#2d3932",
          icon: Landmark,
          detail: `Reprieve selects a healthy same-chain source position and frees ${rescueAmountLabel} without needing a bridge hop. The rescue stays local for the fastest path to safety.`,
          badge: "SOURCE",
          badgeColor: "#2d3932",
        },
        {
          id: 1,
          label: "ETH Sepolia",
          sublabel: "Protected Position",
          color: "#b5e86f",
          icon: TrendingUp,
          detail: `${rescueAmountLabel} is routed directly into the at-risk position on the same chain. The health factor is restored locally and the rescue completes without CCIP.`,
          badge: "DESTINATION",
          badgeColor: "#b5e86f",
        },
      ],
      connectors: [
        {
          label: `direct rescue ${rescueAmountLabel}`,
          dashed: false,
          color: "#2d3932",
          nextColor: "#b5e86f",
        },
      ],
      completeDetail: `${rescueAmountLabel} moved directly on the source chain and restored the position without a cross-chain bridge.`,
      metrics: [
        {
          label: "Source",
          value: "AAVE",
          sub: "ETH Sepolia",
          color: "#2d3932",
        },
        {
          label: "Path",
          value: "Same Chain",
          sub: "No bridge hop",
          color: "#c7f36b",
        },
        {
          label: "Target",
          value: "Protected",
          sub: "ETH Sepolia",
          color: "#b5e86f",
        },
      ],
    };
  }

  return {
    stages: [
      {
        id: 0,
        label: "ETH Sepolia",
        sublabel: "AAVE",
        color: "#2d3932",
        icon: Landmark,
        detail:
          "The user's leveraged position lives on AAVE (ETH Sepolia). Reprieve detects the health factor is approaching the liquidation threshold and triggers the rescue workflow.",
        badge: "SOURCE",
        badgeColor: "#2d3932",
      },
      {
        id: 1,
        label: "ETH Sepolia",
        sublabel: "CCIP",
        color: "#c7f36b",
        icon: Link2,
        detail: `Reprieve withdraws ${rescueAmountLabel} collateral from AAVE and hands it to the Chainlink CCIP router on ETH Sepolia. The asset is locked and a cross-chain message is dispatched.`,
        badge: "CCIP OUT",
        badgeColor: "#c7f36b",
      },
      {
        id: 2,
        label: "Base Sepolia",
        sublabel: "CCIP",
        color: "#c7f36b",
        icon: ArrowRightLeft,
        detail: `Chainlink CCIP delivers ${rescueAmountLabel} on Base Sepolia. The off-chain CRE workflow orchestrates the bridge and validates delivery before proceeding to the deposit step.`,
        badge: "CCIP IN",
        badgeColor: "#c7f36b",
      },
      {
        id: 3,
        label: "Base Sepolia",
        sublabel: "Compound",
        color: "#b5e86f",
        icon: TrendingUp,
        detail: `${rescueAmountLabel} is deposited into Compound on Base Sepolia, reopening the position on a safer, cheaper chain. The rescue is complete - assets are secured cross-chain.`,
        badge: "DESTINATION",
        badgeColor: "#b5e86f",
      },
    ],
    connectors: [
      {
        label: `withdraw ${rescueAmountLabel}`,
        dashed: false,
        color: "#2d3932",
        nextColor: "#c7f36b",
      },
      {
        label: `bridge ${rescueAmountLabel}`,
        dashed: true,
        color: "#c7f36b",
        nextColor: "#c7f36b",
      },
      {
        label: `deposit ${rescueAmountLabel}`,
        dashed: false,
        color: "#c7f36b",
        nextColor: "#b5e86f",
      },
    ],
    completeDetail: `${rescueAmountLabel} withdrawn from AAVE on ETH Sepolia, bridged via Chainlink CCIP, and deposited into Compound on Base Sepolia. Position secured cross-chain.`,
    metrics: [
      {
        label: "Source",
        value: "AAVE",
        sub: "ETH Sepolia",
        color: "#2d3932",
      },
      {
        label: "Bridge",
        value: "CCIP",
        sub: "Chainlink",
        color: "#c7f36b",
      },
      {
        label: "Target",
        value: "Compound",
        sub: "Base Sepolia",
        color: "#b5e86f",
      },
    ],
  };
}

// ─── Moving Particle ──────────────────────────────────────────────────────────
const Particle: React.FC<{ color: string; delay?: number }> = ({
  color,
  delay = 0,
}) => (
  <motion.div
    initial={{ left: "0%", opacity: 0 }}
    animate={{ left: "105%", opacity: [0, 1, 1, 0] }}
    transition={{
      duration: 1.2,
      delay,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 0.8,
    }}
    className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full pointer-events-none"
    style={{ background: color, boxShadow: `0 0 8px 2px ${color}` }}
  />
);

// ─── Stage Node ───────────────────────────────────────────────────────────────
const StageNode: React.FC<{
  stage: WorkflowStage;
  isActive: boolean;
  isCurrent: boolean;
  isComplete: boolean;
}> = ({ stage, isActive, isCurrent, isComplete }) => {
  const Icon = stage.icon;
  return (
    <div className="flex flex-col items-center w-24 shrink-0 relative">
      {/* Top badge */}
      <motion.div
        animate={{ opacity: isActive ? 1 : 0.2 }}
        transition={{ duration: 0.4 }}
        className="mb-2.5 px-2 py-0.5 rounded text-[8px] font-bold tracking-widest whitespace-nowrap"
        style={{
          background: `${stage.badgeColor}18`,
          color: stage.badgeColor,
          border: `1px solid ${stage.badgeColor}30`,
        }}
      >
        {stage.badge}
      </motion.div>

      {/* Icon box */}
      <motion.div
        animate={{
          scale: isCurrent ? 1.12 : isComplete ? 1.04 : 1,
          borderColor: isActive ? `${stage.color}80` : "rgba(255,255,255,0.07)",
          boxShadow: isCurrent
            ? `0 0 22px ${stage.color}55`
            : isComplete
              ? `0 0 10px ${stage.color}30`
              : "none",
        }}
        transition={{ duration: 0.4 }}
        className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center relative"
        style={{
          background: isActive ? `${stage.color}15` : "rgba(255,255,255,0.03)",
        }}
      >
        {/* Spin dashed ring when current */}
        {isCurrent && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, ease: "linear", repeat: Infinity }}
            className="absolute inset-1 rounded-xl border border-dashed"
            style={{ borderColor: `${stage.color}55` }}
          />
        )}

        {isComplete ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
          >
            <Check size={20} style={{ color: stage.color }} />
          </motion.div>
        ) : (
          <Icon
            size={20}
            style={{ color: isActive ? stage.color : "#637267" }}
          />
        )}

        {/* Pulse bloom when current */}
        {isCurrent && (
          <motion.span
            animate={{ scale: [1, 1.8], opacity: [0.45, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl"
            style={{ background: `${stage.color}30` }}
          />
        )}
      </motion.div>

      {/* Chain + Protocol label */}
      <div className="mt-2.5 text-center">
        <div
          className="text-[11px] font-bold leading-tight"
          style={{ color: isActive ? "#f0f3ee" : "#637267" }}
        >
          {stage.label}
        </div>
        <div
          className="text-[10px] font-semibold leading-tight mt-0.5"
          style={{ color: isActive ? stage.color : "#37453e" }}
        >
          {stage.sublabel}
        </div>
      </div>
    </div>
  );
};

// ─── Connector (solid or dashed) ──────────────────────────────────────────────
const Connector: React.FC<{
  active: boolean;
  isCurrent: boolean;
  label: string;
  dashed: boolean;
  color: string;
  nextColor: string;
}> = ({ active, isCurrent, label, dashed, color, nextColor }) => (
  <div className="flex-1 flex flex-col items-center gap-1.5 self-center mt-[-36px] mx-1 min-w-0">
    {/* Label above */}
    <motion.span
      animate={{ opacity: active ? 1 : 0.2 }}
      transition={{ duration: 0.4 }}
      className="text-[9px] font-medium text-center whitespace-nowrap"
      style={{ color: active ? color : "#637267" }}
    >
      {label}
    </motion.span>

    {/* Line + arrowhead */}
    <div className="w-full relative flex items-center" style={{ height: 12 }}>
      {/* Track */}
      <div
        className="absolute inset-y-[5px] left-0 right-3 rounded-full"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />

      {/* Filled / dashed active line */}
      {active && (
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "calc(100% - 10px)" }}
          transition={{ duration: 0.55 }}
          className="absolute inset-y-[5px] left-0 rounded-full"
          style={
            dashed
              ? {
                  // Simulate dashed via repeating gradient
                  background: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 6px, transparent 6px, transparent 12px)`,
                  boxShadow: `0 0 6px ${color}66`,
                }
              : {
                  background: `linear-gradient(90deg, ${color}, ${nextColor})`,
                  boxShadow: `0 0 8px ${color}88`,
                }
          }
        />
      )}

      {/* Arrowhead */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-500"
        style={{
          width: 0,
          height: 0,
          borderTop: "4px solid transparent",
          borderBottom: "4px solid transparent",
          borderLeft: `7px solid ${active ? nextColor : "#252f29"}`,
          filter: active ? `drop-shadow(0 0 3px ${nextColor})` : "none",
        }}
      />

      {/* Travelling particles when current */}
      {isCurrent && (
        <>
          <Particle color={color} />
          <Particle color={nextColor} delay={0.6} />
        </>
      )}
    </div>
  </div>
);

type RescueActionWorkflowAnimationProps = {
  autoPlaySequence?: boolean;
  decision?: RescueSimulationDecision | string | null;
  currentStep?: number | null;
  collateralAmount?: string;
};

function clampStep(step: number, total: number) {
  return Math.min(Math.max(step, 0), total);
}

function getWorkflowVariant(
  decision?: RescueSimulationDecision | string | null,
): RescueWorkflowVariant {
  if (decision === "RESCUE_SAME_CHAIN") {
    return "same-chain";
  }

  return "cross-chain";
}

// ─── Main component ───────────────────────────────────────────────────────────
export const RescueActionWorkflowAnimation: React.FC<
  RescueActionWorkflowAnimationProps
> = ({
  autoPlaySequence = false,
  decision = null,
  currentStep = null,
  collateralAmount,
}) => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [rescueAmountLabel, setRescueAmountLabel] = useState(() =>
    formatRescueAmountLabel(collateralAmount),
  );
  const isControlled = currentStep !== null && currentStep !== undefined;
  const workflowVariant = getWorkflowVariant(decision);
  const workflow = getWorkflowConfig(workflowVariant, rescueAmountLabel);
  const { stages, connectors, metrics, completeDetail } = workflow;
  const TOTAL = stages.length;

  useEffect(() => {
    if (isControlled || !isPlaying) return;
    const t = setInterval(
      () =>
        setStep((previousStep) => {
          if (autoPlaySequence) {
            if (previousStep >= TOTAL) {
              return TOTAL;
            }

            return previousStep + 1;
          }

          return (previousStep + 1) % (TOTAL + 1);
        }),
      autoPlaySequence ? 1800 : 2600,
    );
    return () => clearInterval(t);
  }, [autoPlaySequence, isControlled, isPlaying, TOTAL]);

  useEffect(() => {
    setRescueAmountLabel(formatRescueAmountLabel(collateralAmount));
  }, [collateralAmount]);

  const activeStep = isControlled
    ? clampStep(currentStep, TOTAL)
    : step % (TOTAL + 1);
  const isPreviewStep = isControlled && activeStep === 0;
  const currentStage = activeStep < TOTAL ? stages[activeStep] : null;
  const progressPct = (activeStep / TOTAL) * 100;

  return (
    <div className="w-full relative rounded-2xl overflow-hidden border border-white/5 bg-[#0b0f0d]">
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b border-white/5"
        style={{ background: "rgba(55,91,210,0.05)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8c9890] font-mono tracking-wider">
              chainlink-cre / rescue-workflow.ts
            </span>
            <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.18em] text-[#8c9890]">
              {workflowVariant === "same-chain" ? "same-chain" : "cross-chain"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{
              background: isControlled || isPlaying ? "#b5e86f" : "#637267",
            }}
          />
          <span
            className="text-[10px] font-mono"
            style={{
              color: isControlled || isPlaying ? "#b5e86f" : "#69776f",
            }}
          >
            {isControlled ? "SYNCED" : isPlaying ? "LIVE" : "PAUSED"}
          </span>
          {!isControlled && !autoPlaySequence ? (
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="ml-1 px-2 py-0.5 text-[10px] font-bold rounded border transition-colors cursor-pointer"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                color: "#c7f36b",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              {isPlaying ? "PAUSE" : "PLAY"}
            </button>
          ) : null}
        </div>
      </div>

      {/* Pipeline diagram */}
      <div className="px-6 pt-8 pb-4 overflow-x-auto">
        <div className="flex items-start justify-between min-w-max mx-auto">
          {stages.map((stage, idx) => {
            const isActive =
              isPreviewStep || activeStep > idx || activeStep === idx;
            const isCurrent = activeStep === idx;
            const isComplete = activeStep > idx;
            const conn = connectors[idx];

            return (
              <React.Fragment key={stage.id}>
                <StageNode
                  stage={stage}
                  isActive={isActive}
                  isCurrent={isCurrent}
                  isComplete={isComplete}
                />
                {conn && (
                  <Connector
                    active={isPreviewStep || activeStep > idx}
                    isCurrent={activeStep === idx + 1}
                    label={conn.label}
                    dashed={conn.dashed}
                    color={conn.color}
                    nextColor={conn.nextColor}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      <div className="mx-5 mb-5 rounded-xl overflow-hidden border border-white/5">
        <AnimatePresence mode="wait">
          {currentStage ? (
            <motion.div
              key={currentStage.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="p-4 flex items-start gap-3.5"
              style={{ background: `${currentStage.color}09` }}
            >
              <div
                className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
                style={{
                  background: `${currentStage.color}20`,
                  border: `1px solid ${currentStage.color}35`,
                }}
              >
                {React.createElement(currentStage.icon, {
                  size: 16,
                  style: { color: currentStage.color },
                })}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: currentStage.color }}
                  >
                    {currentStage.label} · {currentStage.sublabel}
                  </span>
                  <ChevronRight
                    size={11}
                    style={{ color: currentStage.color }}
                  />
                  <span className="text-[10px] text-[#8c9890]">
                    {currentStage.badge}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed text-[#ccd7cf]">
                  {currentStage.detail}
                </p>
                {isControlled ? (
                  <p className="mt-2 text-[10px] font-mono text-[#8c9890]">
                    {`Simulated rescue amount: ${rescueAmountLabel}`}
                  </p>
                ) : null}
              </div>

              <div className="shrink-0 flex items-center gap-1 text-[10px] text-[#69776f] font-mono">
                <Clock size={10} />
                {activeStep + 1}/{TOTAL}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="p-4 flex items-center gap-3.5"
              style={{ background: "rgba(182,234,218,0.10)" }}
            >
              <div
                className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                style={{
                  background: "rgba(182,234,218,0.22)",
                  border: "1px solid rgba(182,234,218,0.35)",
                }}
              >
                <Zap size={16} style={{ color: "#b5e86f" }} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#b5e86f] mb-1">
                  Rescue Complete ✓
                </p>
                <p className="text-[12px] text-[#c7f36b]">{completeDetail}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Metrics footer */}
      <div className="border-t border-white/5 grid grid-cols-3 divide-x divide-white/5">
        {metrics.map((m) => (
          <div key={m.label} className="px-4 py-3 text-center">
            <div className="text-[9px] uppercase tracking-widest text-[#637267] mb-1">
              {m.label}
            </div>
            <div className="text-[13px] font-bold" style={{ color: m.color }}>
              {m.value}
            </div>
            <div className="text-[9px] text-[#69776f] mt-0.5">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full bg-white/5">
        <motion.div
          className="h-full"
          style={{
            background:
              workflowVariant === "same-chain"
                ? "linear-gradient(90deg, #2d3932, #b5e86f)"
                : "linear-gradient(90deg, #2d3932, #c7f36b, #c7f36b, #b5e86f)",
          }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};
