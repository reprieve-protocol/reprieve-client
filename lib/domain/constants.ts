import type {
  Chain,
  MockScenarioId,
  Protocol,
  RiskLevel,
  StrategyPreset,
} from "@/lib/domain/types";

export const APP_NAME = "Reprieve";

export const BRAND = {
  background: "#0b0f0d",
  primary: "#c7f36b",
  success: "#7fdc73",
  warning: "#f3b347",
  danger: "#ff6178",
  text: "#f1f4ef",
} as const;

export const CHAIN_LABELS: Record<Chain, string> = {
  "arbitrum-sepolia": "Arbitrum Sepolia",
  "base-sepolia": "Base Sepolia",
  "ethereum-sepolia": "Sepolia",
};

export const CHAIN_ACCENTS: Record<Chain, string> = {
  "arbitrum-sepolia": "bg-blue-500/15 text-blue-200 border-blue-400/40",
  "base-sepolia": "bg-indigo-500/15 text-indigo-200 border-indigo-400/40",
  "ethereum-sepolia": "bg-slate-500/15 text-slate-200 border-slate-400/40",
};

export const PROTOCOL_LABELS: Record<Protocol, string> = {
  "aave-v4": "AAVE V4",
  "compound-v3": "Compound V3",
  "morpho-v2": "Morpho V2",
};

export const PROTOCOL_ACCENTS: Record<Protocol, string> = {
  "aave-v4": "bg-[#1e2f1d] text-sky-300 border-sky-500/35",
  "compound-v3": "bg-[#3a2a14] text-orange-300 border-orange-500/45",
  "morpho-v2": "bg-[#0d3526] text-emerald-300 border-emerald-500/45",
};

export const PROTOCOL_SHORT_LABELS: Record<Protocol, string> = {
  "aave-v4": "AAVE",
  "compound-v3": "Compound",
  "morpho-v2": "Morpho",
};

export const PROTOCOL_ICONS: Record<Protocol, string> = {
  "aave-v4": "/aave.png",
  "compound-v3": "/compound.png",
  "morpho-v2": "/Morpho.png",
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  safe: "Safe",
  moderate: "Moderate",
  danger: "Danger",
  critical: "Critical",
};

export const RISK_CLASSNAMES: Record<RiskLevel, string> = {
  safe: "border-emerald-500/45 bg-emerald-500/5",
  moderate: "border-amber-500/45 bg-amber-500/5",
  danger: "border-orange-500/45 bg-orange-500/8",
  critical: "border-red-500/45 bg-red-500/8",
};

export const STRATEGY_PRESETS: StrategyPreset[] = [
  {
    id: "defensive",
    label: "Defensive",
    description: "HF < 1.10 · Conservative · Low gas",
    threshold: 1.1,
    estRescuesPerMonth: 2,
    estGasPerMonthEth: 0.04,
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "HF < 1.30 · Recommended · Stable buffer",
    threshold: 1.3,
    estRescuesPerMonth: 5,
    estGasPerMonthEth: 0.09,
  },
  {
    id: "aggressive",
    label: "Aggressive",
    description: "HF < 1.50 · Early trigger · Max safety",
    threshold: 1.5,
    estRescuesPerMonth: 9,
    estGasPerMonthEth: 0.16,
  },
];

export const SCENARIO_LABELS: Record<MockScenarioId, string> = {
  normal: "Normal",
  "all-safe": "All Safe",
  "no-positions": "No Positions",
  "stale-data": "Stale Data",
  "budget-exhausted": "Budget Exhausted",
  "sim-fail": "Simulation Fail",
  "ccip-delayed": "CCIP Delayed",
  "ccip-failed": "CCIP Failed (Escrow)",
  partial: "Partial Rescue",
};

export const CRE_CHECK_INTERVAL_MS = 8000;

export const RESCUE_PHASE_INTERVAL_MS = 1100;

export const ETH_USD_PRICE = 2400;

export const LINK_USD_PRICE = 12;

export const STORAGE_KEY = "reprieve-v1-state";
