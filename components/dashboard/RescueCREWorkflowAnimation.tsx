"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Cog,
  Database,
  DollarSign,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { RescueSimulationDecision } from "@/lib/api/simulate-api-guard";

type InputNode = {
  id: "onchain" | "signals" | "price";
  title: string;
  subtitle?: string;
  badge: string;
  icon: LucideIcon;
  accent: string;
  dashed: boolean;
};

type WorkflowStep = {
  id: string;
  type: "input" | "compute" | "decision";
  target?: InputNode["id"];
  label: string;
};

const INPUT_NODES: InputNode[] = [
  {
    id: "onchain",
    title: "On-chain positions",
    subtitle: "Eth Sepolia  Base Sepolia",
    badge: "EVM Read",
    icon: Database,
    accent: "#b6f36f",
    dashed: false,
  },
  {
    id: "signals",
    title: "Off-chain market signals",
    subtitle: "(OI, funding, liquidity, ...)",
    badge: "HTTP GET",
    icon: Activity,
    accent: "#8de0ff",
    dashed: true,
  },
  {
    id: "price",
    title: "Chainlink price API",
    badge: "HTTP GET",
    icon: DollarSign,
    accent: "#ffd479",
    dashed: true,
  },
];

const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: "s1", type: "input", target: "onchain", label: "EVM Read" },
  { id: "s2", type: "input", target: "signals", label: "HTTP GET" },
  { id: "s3", type: "input", target: "price", label: "HTTP GET" },
  { id: "s4", type: "compute", label: "Risk Engine" },
  { id: "s5", type: "decision", label: "Safe (Lowest HF = ?)" },
];

type ConnectorVariant = "top-elbow" | "straight" | "bottom-elbow";

const CONNECTOR_GEOMETRY: Record<
  ConnectorVariant,
  {
    path: string;
    arrowY: number;
    labelX: number;
    labelY: number;
  }
> = {
  "top-elbow": {
    path: "M4 22 H84 Q96 22 96 34 V62 Q96 74 108 74 H192",
    arrowY: 74,
    labelX: 4,
    labelY: 8,
  },
  straight: {
    path: "M4 50 H192",
    arrowY: 50,
    labelX: 4,
    labelY: 34,
  },
  "bottom-elbow": {
    path: "M4 74 H118 Q130 74 130 62 V38 Q130 26 142 26 H192",
    arrowY: 26,
    labelX: 4,
    labelY: 58,
  },
};

const InputNodeCard: React.FC<{
  node: InputNode;
  isActive: boolean;
  isCurrent: boolean;
}> = ({ node, isActive, isCurrent }) => {
  const Icon = node.icon;

  return (
    <motion.div
      animate={{
        borderColor: isActive ? `${node.accent}44` : "rgba(255,255,255,0.08)",
        boxShadow: isCurrent
          ? `0 0 28px ${node.accent}40`
          : isActive
            ? `0 0 10px ${node.accent}24`
            : "none",
        y: isCurrent ? -1.5 : 0,
      }}
      transition={{ duration: 0.35 }}
      className="h-full rounded-2xl border bg-[#0b120f]/90 p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className="rounded-md border px-2 py-0.5 text-[9px] font-bold tracking-widest"
          style={{
            color: node.accent,
            borderColor: `${node.accent}50`,
            background: `${node.accent}14`,
          }}
        >
          {node.badge}
        </span>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg border"
          style={{
            borderColor: isActive
              ? `${node.accent}55`
              : "rgba(255,255,255,0.12)",
            background: isActive
              ? `${node.accent}12`
              : "rgba(255,255,255,0.02)",
          }}
        >
          <Icon
            size={16}
            style={{ color: isActive ? node.accent : "rgba(214,225,218,0.48)" }}
          />
        </div>
      </div>

      <p
        className="text-[14px] font-semibold leading-tight"
        style={{ color: isActive ? "#e7efe9" : "#91a59b" }}
      >
        {node.title}
      </p>
      {node.subtitle ? (
        <p className="mt-1 text-[11px] text-[#8fa197]">{node.subtitle}</p>
      ) : null}
    </motion.div>
  );
};

const Connector: React.FC<{
  variant: ConnectorVariant;
  label?: string;
  dashed: boolean;
  color: string;
}> = ({ variant, label, dashed, color }) => {
  const geometry = CONNECTOR_GEOMETRY[variant];

  return (
    <div className="relative h-[96px] w-[90%]">
      <svg
        viewBox="0 0 200 96"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        {label ? (
          <text
            x={geometry.labelX}
            y={geometry.labelY}
            fill={color}
            fontSize="10"
            fontWeight="600"
            letterSpacing="0.08em"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          >
            {label}
          </text>
        ) : null}
        <path
          d={geometry.path}
          fill="none"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={geometry.path}
          fill="none"
          stroke={color}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={dashed ? "9 8" : undefined}
          style={{ filter: `drop-shadow(0 0 7px ${color})` }}
        />
        <motion.path
          d={geometry.path}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="0.18 0.82"
          style={{ filter: `drop-shadow(0 0 10px ${color})` }}
          animate={{ strokeDashoffset: [0, -1] }}
          transition={{
            duration: 2.1,
            ease: "linear",
            repeat: Infinity,
          }}
        />
        <motion.path
          d={geometry.path}
          fill="none"
          stroke="#f5ffe0"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="0.1 0.9"
          style={{ filter: `drop-shadow(0 0 7px ${color})` }}
          animate={{ strokeDashoffset: [0, -1] }}
          transition={{
            duration: 2.1,
            ease: "linear",
            repeat: Infinity,
          }}
        />
        <motion.polygon
          points={`198,${geometry.arrowY} 186,${geometry.arrowY - 6} 186,${geometry.arrowY + 6}`}
          fill={color}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: 1.05,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      </svg>
    </div>
  );
};

const RiskEngineCard: React.FC<{ isComputing: boolean; isLit: boolean }> = ({
  isComputing,
  isLit,
}) => (
  <motion.div
    animate={{
      borderColor: isLit ? "rgba(182,243,111,0.52)" : "rgba(255,255,255,0.08)",
      boxShadow: isComputing
        ? "0 0 38px rgba(182,243,111,0.25)"
        : isLit
          ? "0 0 14px rgba(182,243,111,0.2)"
          : "none",
    }}
    transition={{ duration: 0.35 }}
    className="relative flex h-full min-h-[292px] flex-col rounded-[28px] border bg-[#0a120f] p-5"
  >
    {/* Header row: badge + icon */}
    <div className="mb-3 flex items-center justify-between gap-2">
      <span
        className="rounded-md border px-2 py-0.5 text-[9px] font-bold tracking-widest"
        style={{
          color: "#b6f36f",
          borderColor: "rgba(182,243,111,0.32)",
          background: "rgba(182,243,111,0.08)",
        }}
      >
        COMPUTE
      </span>
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg border"
        style={{
          borderColor: isLit
            ? "rgba(182,243,111,0.45)"
            : "rgba(255,255,255,0.12)",
          background: isLit
            ? "rgba(182,243,111,0.10)"
            : "rgba(255,255,255,0.02)",
        }}
      >
        <motion.div
          animate={isComputing ? { rotate: 360 } : { rotate: 0 }}
          transition={{
            duration: 5.2,
            ease: "linear",
            repeat: isComputing ? Infinity : 0,
          }}
        >
          <Cog
            size={16}
            style={{ color: isLit ? "#b6f36f" : "rgba(214,225,218,0.48)" }}
          />
        </motion.div>
      </div>
    </div>

    {/* Title */}
    <p
      className="text-[14px] font-semibold leading-tight"
      style={{ color: isLit ? "#e7efe9" : "#91a59b" }}
    >
      Risk Engine
    </p>
    <p className="mt-1 text-[11px] text-[#8fa197]">CRE risk computation</p>

    {/* Center glow icon */}
    <div className="relative flex flex-1 items-center justify-center">
      {isComputing && (
        <motion.span
          animate={{ scale: [1, 1.7], opacity: [0.35, 0] }}
          transition={{ duration: 1.3, repeat: Infinity }}
          className="absolute h-16 w-16 rounded-full"
          style={{ background: "rgba(182,243,111,0.22)" }}
        />
      )}
      <motion.div
        animate={isComputing ? { rotate: 360 } : { rotate: 0 }}
        transition={{
          duration: 5.2,
          ease: "linear",
          repeat: isComputing ? Infinity : 0,
        }}
        className="rounded-full border border-dashed p-5"
        style={{ borderColor: isLit ? "rgba(182,243,111,0.38)" : "#2a3530" }}
      >
        <Cog size={30} style={{ color: isLit ? "#b6f36f" : "#3d4f47" }} />
      </motion.div>
    </div>
  </motion.div>
);

const DecisionCard: React.FC<{
  active: boolean;
  isRescue?: boolean;
  decision?: RescueSimulationDecision | string | null;
  lowestHealthFactor?: number | null;
}> = ({ active, isRescue = false, decision = null, lowestHealthFactor }) => {
  const lowestHealthFactorLabel =
    lowestHealthFactor !== null && lowestHealthFactor !== undefined
      ? lowestHealthFactor.toFixed(2)
      : "?";
  const rescueActionLabel =
    decision === "RESCUE_SAME_CHAIN"
      ? "Action: Rescue Same Chain - Collateral Top-up"
      : decision === "RESCUE_CROSS_CHAIN"
        ? "Action: Rescue Cross Chain - Collateral Top-up"
        : "Action: Rescue - Collateral Top-up";

  return (
    <motion.div
      animate={{
        borderColor: active
          ? "rgba(182,243,111,0.52)"
          : "rgba(255,255,255,0.08)",
        boxShadow: active ? "0 0 32px rgba(182,243,111,0.22)" : "none",
        y: active ? -1.5 : 0,
      }}
      transition={{ duration: 0.35 }}
      className="h-full rounded-2xl border bg-[#0b120f]/90 p-4 "
    >
      {/* Header row: badge + icon */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className="rounded-md border px-2 py-0.5 text-[9px] font-bold tracking-widest"
          style={{
            color: "#b6f36f",
            borderColor: "rgba(182,243,111,0.32)",
            background: "rgba(182,243,111,0.08)",
          }}
        >
          DECISION
        </span>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg border"
          style={{
            borderColor: active
              ? "rgba(182,243,111,0.55)"
              : "rgba(255,255,255,0.12)",
            background: active
              ? "rgba(182,243,111,0.12)"
              : "rgba(255,255,255,0.02)",
          }}
        >
          <ShieldCheck
            size={16}
            style={{ color: active ? "#b6f36f" : "rgba(214,225,218,0.48)" }}
          />
        </div>
      </div>

      {/* Title & subtitle */}
      {isRescue ? (
        <p
          className="text-[14px] font-semibold leading-tight"
          style={{ color: active ? "#e7efe9" : "#91a59b" }}
        >
          {rescueActionLabel}
        </p>
      ) : (
        <div
          className="rounded-2xl border p-3"
          style={{
            borderColor: active
              ? "rgba(182,243,111,0.28)"
              : "rgba(182,243,111,0.12)",
            background: active
              ? "linear-gradient(180deg, rgba(182,243,111,0.12), rgba(182,243,111,0.04))"
              : "linear-gradient(180deg, rgba(182,243,111,0.06), rgba(182,243,111,0.02))",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.16em]"
                style={{ color: active ? "#b6f36f" : "#6f8a7c" }}
              >
                Status
              </p>
              <p
                className="mt-1 text-[18px] font-semibold leading-tight"
                style={{ color: active ? "#f2ffe4" : "#c9d7d0" }}
              >
                Safe
              </p>
            </div>
            <div
              className="rounded-xl border px-3 py-2 text-right"
              style={{
                borderColor: active
                  ? "rgba(182,243,111,0.34)"
                  : "rgba(182,243,111,0.16)",
                background: active
                  ? "rgba(182,243,111,0.12)"
                  : "rgba(182,243,111,0.05)",
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8fa197]">
                Lowest HF
              </p>
              <p
                className="mt-1 text-[18px] font-bold tabular-nums"
                style={{ color: active ? "#b6f36f" : "#d8e6de" }}
              >
                {lowestHealthFactorLabel}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <span
              className="inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{
                color: active ? "#f2ffe4" : "#b8c7bf",
                borderColor: active
                  ? "rgba(182,243,111,0.36)"
                  : "rgba(182,243,111,0.16)",
                background: active
                  ? "rgba(182,243,111,0.16)"
                  : "rgba(182,243,111,0.06)",
                boxShadow: active ? "0 0 18px rgba(182,243,111,0.16)" : "none",
              }}
            >
              No Action
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

type RescueCREWorkflowAnimationProps = {
  isRescue?: boolean;
  decision?: RescueSimulationDecision | string | null;
  lowestHealthFactor?: number | null;
};

export const RescueCREWorkflowAnimation: React.FC<
  RescueCREWorkflowAnimationProps
> = ({ isRescue = false, decision = null, lowestHealthFactor = null }) => {
  const [step, setStep] = useState(0);
  const totalSteps = WORKFLOW_STEPS.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % totalSteps);
    }, 2400);

    return () => clearInterval(timer);
  }, [totalSteps]);

  const currentStep = WORKFLOW_STEPS[step];

  const inputIndexById = useMemo(
    () =>
      INPUT_NODES.reduce(
        (acc, node, index) => {
          acc[node.id] = index;
          return acc;
        },
        {} as Record<InputNode["id"], number>,
      ),
    [],
  );

  const currentInputIndex =
    currentStep.type === "input" && currentStep.target
      ? inputIndexById[currentStep.target]
      : -1;

  const allInputsActive =
    currentStep.type === "compute" || currentStep.type === "decision";

  const progressPct = ((step + 1) / totalSteps) * 100;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/5 bg-[#070d0a]">
      <div className="overflow-x-auto px-6 pb-4 pt-8">
        <div className="mx-auto grid min-w-[1220px] grid-cols-[320px_210px_350px_210px_320px] grid-rows-3 items-center gap-y-4">
          {INPUT_NODES.map((node, idx) => {
            const isCurrent =
              currentStep.type === "input" && currentStep.target === node.id;
            const isActive = allInputsActive || idx <= currentInputIndex;
            const connectorVariant: ConnectorVariant =
              idx === 0 ? "top-elbow" : idx === 1 ? "straight" : "bottom-elbow";

            return (
              <div key={node.id} className="contents">
                <div
                  className="self-stretch"
                  style={{ gridColumn: 1, gridRow: idx + 1 }}
                >
                  <InputNodeCard
                    node={node}
                    isActive={isActive}
                    isCurrent={isCurrent}
                  />
                </div>
                <div
                  className="self-center"
                  style={{ gridColumn: 2, gridRow: idx + 1 }}
                >
                  <Connector
                    variant={connectorVariant}
                    label={node.badge}
                    dashed={node.dashed}
                    color={node.accent}
                  />
                </div>
              </div>
            );
          })}

          <div
            className="row-span-3"
            style={{ gridColumn: 3, gridRow: "1 / span 3" }}
          >
            <RiskEngineCard
              isComputing={currentStep.type === "compute"}
              isLit={
                currentStep.type === "compute" ||
                currentStep.type === "decision"
              }
            />
          </div>

          <div className="self-center" style={{ gridColumn: 4, gridRow: 2 }}>
            <Connector variant="straight" dashed={false} color="#b6f36f" />
          </div>

          <div
            className="row-span-3"
            style={{
              gridColumn: 5,
              gridRow: "1 / span 3",
            }}
          >
            <DecisionCard
              active={currentStep.type === "decision"}
              isRescue={isRescue}
              decision={decision}
              lowestHealthFactor={lowestHealthFactor}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
