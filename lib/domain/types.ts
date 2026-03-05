export type Protocol = "aave-v4" | "compound-v3" | "morpho-v2";

export type Chain = "arbitrum-sepolia" | "base-sepolia" | "ethereum-sepolia";

export type RiskLevel = "safe" | "moderate" | "danger" | "critical";

export type PositionTokenType = "aToken" | "cToken" | "vault-share";

export type ApprovalStatus = "approved" | "needs-approval";

export interface Position {
  id: string;
  protocol: Protocol;
  chain: Chain;
  pair: string;
  action?: "long" | "short";
  collateralUsd: number;
  debtUsd: number;
  healthFactor: number;
  tokenType: PositionTokenType;
  approvalStatus: ApprovalStatus;
  isRescueSource: boolean;
}

export interface StrategyPreset {
  id: "defensive" | "balanced" | "aggressive";
  label: string;
  description: string;
  threshold: number;
  estRescuesPerMonth: number;
  estGasPerMonthEth: number;
}

export interface ProtectionConfig {
  threshold: number;
  perRescueCapEth: number;
  dailyCapEth: number;
  priorityQueue: Array<"same-chain" | "ccip-cross-chain">;
  emergencyOverride: boolean;
  recoveryBuffer: number;
}

export interface BudgetState {
  usedTodayUsd: number;
  capTodayUsd: number;
  rescuesToday: number;
  totalRescues: number;
  totalSpendUsd: number;
  estSavedUsd: number;
}

export type RescuePhase =
  | "idle"
  | "detect"
  | "evaluate"
  | "simulate"
  | "same_chain"
  | "ccip"
  | "complete"
  | "failed";

export type RescueRunStatus =
  | "running"
  | "complete"
  | "failed"
  | "ccip-delayed"
  | "ccip-failed"
  | "partial";

export interface RescuePhaseState {
  phase: RescuePhase;
  startedAt: string;
  progress: number;
  status: RescueRunStatus;
  message: string;
  metrics?: {
    gasEth?: number;
    slippagePct?: number;
    aggregateHF?: number;
    threshold?: number;
    queue?: readonly string[];
  };
}

export interface RescueRoute {
  protocol: Protocol;
  chain: Chain;
  amountUsd: number;
  token: string;
}

export interface RescueLogEntry {
  id: string;
  type: "same-chain" | "ccip-cross-chain";
  timestampUtc: string;
  source: RescueRoute;
  target: RescueRoute;
  amount: {
    token: string;
    quantity: number;
    usdValue: number;
  };
  gasEth: number;
  ccipFeeLink?: number;
  hfBefore: number;
  hfAfter: number;
  txHash: string;
  workflowId: string;
  status: "success" | "partial" | "failed" | "pending" | "escrow";
  blockNumber: number;
  reason?: string;
}

export interface QuantSignal {
  id: "volatility" | "open-interest" | "funding" | "spread";
  label: string;
  value: string;
  trend: "up" | "down" | "flat";
}

export interface AppSnapshot {
  positions: Position[];
  aggregateHF: number;
  threshold: number;
  protectionStatus: {
    active: boolean;
    strategyLabel: string | null;
    workflowId: string | null;
  };
  budget: BudgetState;
  quantSignals: QuantSignal[];
  lastCheckSecondsAgo: number;
  dataUpdatedAt: string;
}

export interface SetupDefaults {
  presets: StrategyPreset[];
  config: ProtectionConfig;
  coverage: number;
  approvals: Array<{
    label: string;
    tokenType: PositionTokenType;
    approved: boolean;
  }>;
  linkCost: number;
}

export interface WalletSession {
  address: string;
  linkBalance: number;
  network: string;
}

export type MockScenarioId =
  | "normal"
  | "all-safe"
  | "no-positions"
  | "stale-data"
  | "budget-exhausted"
  | "sim-fail"
  | "ccip-delayed"
  | "ccip-failed"
  | "partial";

export interface RescueRunState {
  runId: string;
  active: boolean;
  phase: RescuePhaseState;
  phases: RescuePhaseState[];
}

export interface AppState {
  wallet: WalletSession | null;
  snapshot: AppSnapshot | null;
  setupDefaults: SetupDefaults | null;
  protectionConfig: ProtectionConfig | null;
  history: RescueLogEntry[];
  selectedHistoryId: string | null;
  rescueRun: RescueRunState | null;
  scenario: MockScenarioId;
  loading: boolean;
  error: string | null;
}
