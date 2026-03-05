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
} from "lucide-react";

// ─── Workflow nodes (matching the diagram) ────────────────────────────────────
const STAGES = [
  {
    id: 0,
    label: "ETH Sepolia",
    sublabel: "AAVE",
    color: "#162840",
    icon: Landmark,
    detail:
      "The user's leveraged position lives on AAVE (ETH Sepolia). Reprieve detects the health factor is approaching the liquidation threshold and triggers the rescue workflow.",
    badge: "SOURCE",
    badgeColor: "#162840",
  },
  {
    id: 1,
    label: "ETH Sepolia",
    sublabel: "CCIP",
    color: "#5a7a9f",
    icon: Link2,
    detail:
      "Reprieve withdraws 1 ETH collateral from AAVE and hands it to the Chainlink CCIP router on ETH Sepolia. The asset is locked and a cross-chain message is dispatched.",
    badge: "CCIP OUT",
    badgeColor: "#5a7a9f",
  },
  {
    id: 2,
    label: "Base Sepolia",
    sublabel: "CCIP",
    color: "#5a7a9f",
    icon: ArrowRightLeft,
    detail:
      "Chainlink CCIP delivers 1 ETH on Base Sepolia. The off-chain CRE workflow orchestrates the bridge and validates delivery before proceeding to the deposit step.",
    badge: "CCIP IN",
    badgeColor: "#5a7a9f",
  },
  {
    id: 3,
    label: "Base Sepolia",
    sublabel: "Compound",
    color: "#94b4d8",
    icon: TrendingUp,
    detail:
      "1 ETH is deposited into Compound on Base Sepolia, reopening the position on a safer, cheaper chain. The rescue is complete — assets are secured cross-chain.",
    badge: "DESTINATION",
    badgeColor: "#94b4d8",
  },
] as const;

// ─── Connectors between nodes ─────────────────────────────────────────────────
const CONNECTORS = [
  {
    label: "withdraw 1 ETH",
    dashed: false,
    color: "#162840",
    nextColor: "#5a7a9f",
  },
  {
    label: "bridge 1 ETH",
    dashed: true, // CCIP cross-chain bridge
    color: "#5a7a9f",
    nextColor: "#5a7a9f",
  },
  {
    label: "deposit 1 ETH",
    dashed: false,
    color: "#5a7a9f",
    nextColor: "#94b4d8",
  },
] as const;

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
  stage: (typeof STAGES)[number];
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
            style={{ color: isActive ? stage.color : "#2a3a4a" }}
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
          style={{ color: isActive ? "#dee6f5" : "#2a3a4a" }}
        >
          {stage.label}
        </div>
        <div
          className="text-[10px] font-semibold leading-tight mt-0.5"
          style={{ color: isActive ? stage.color : "#192e4c" }}
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
      style={{ color: active ? color : "#2a3a4a" }}
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
          borderLeft: `7px solid ${active ? nextColor : "#13243a"}`,
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

// ─── Main component ───────────────────────────────────────────────────────────
export const CreWorkflowAnimation: React.FC = () => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const TOTAL = STAGES.length;

  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => setStep((p) => (p + 1) % (TOTAL + 1)), 2600);
    return () => clearInterval(t);
  }, [isPlaying, TOTAL]);

  const activeStep = step % (TOTAL + 1);
  const currentStage = activeStep < TOTAL ? STAGES[activeStep] : null;
  const progressPct = (activeStep / TOTAL) * 100;

  return (
    <div className="w-full relative rounded-2xl overflow-hidden border border-white/5 bg-[#080f1e]">
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
          <span className="text-[11px] text-[#4a6a8f] font-mono tracking-wider">
            chainlink-cre / rescue-workflow.ts
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: isPlaying ? "#94b4d8" : "#2a3a4a" }}
          />
          <span
            className="text-[10px] font-mono"
            style={{ color: isPlaying ? "#94b4d8" : "#3a5a7f" }}
          >
            {isPlaying ? "LIVE" : "PAUSED"}
          </span>
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="ml-1 px-2 py-0.5 text-[10px] font-bold rounded border transition-colors cursor-pointer"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              color: "#5a7a9f",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            {isPlaying ? "PAUSE" : "PLAY"}
          </button>
        </div>
      </div>

      {/* Pipeline diagram */}
      <div className="px-6 pt-8 pb-4 overflow-x-auto">
        <div className="flex items-start justify-between min-w-max mx-auto">
          {STAGES.map((stage, idx) => {
            const isActive = activeStep > idx || activeStep === idx;
            const isCurrent = activeStep === idx;
            const isComplete = activeStep > idx;
            const conn = CONNECTORS[idx];

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
                    active={activeStep > idx}
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
                  <span className="text-[10px] text-[#4a6a8f]">
                    {currentStage.badge}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed text-[#7a9abf]">
                  {currentStage.detail}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-1 text-[10px] text-[#3a5a7f] font-mono">
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
                <Zap size={16} style={{ color: "#94b4d8" }} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#94b4d8] mb-1">
                  Rescue Complete ✓
                </p>
                <p className="text-[12px] text-[#5a7a9f]">
                  1 ETH withdrawn from AAVE on ETH Sepolia, bridged via
                  Chainlink CCIP, and deposited into Compound on Base Sepolia.
                  Position secured cross-chain.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Metrics footer */}
      <div className="border-t border-white/5 grid grid-cols-3 divide-x divide-white/5">
        {[
          {
            label: "Source",
            value: "AAVE",
            sub: "ETH Sepolia",
            color: "#162840",
          },
          {
            label: "Bridge",
            value: "CCIP",
            sub: "Chainlink",
            color: "#5a7a9f",
          },
          {
            label: "Target",
            value: "Compound",
            sub: "Base Sepolia",
            color: "#94b4d8",
          },
        ].map((m) => (
          <div key={m.label} className="px-4 py-3 text-center">
            <div className="text-[9px] uppercase tracking-widest text-[#2a3a4a] mb-1">
              {m.label}
            </div>
            <div className="text-[13px] font-bold" style={{ color: m.color }}>
              {m.value}
            </div>
            <div className="text-[9px] text-[#3a5a7f] mt-0.5">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full bg-white/5">
        <motion.div
          className="h-full"
          style={{
            background:
              "linear-gradient(90deg, #162840, #5a7a9f, #5a7a9f, #94b4d8)",
          }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};
