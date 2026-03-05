import { computeAggregateHF } from "@/lib/domain/calculations";
import { LINK_USD_PRICE, STRATEGY_PRESETS } from "@/lib/domain/constants";
import type {
  AppSnapshot,
  Position,
  ProtectionConfig,
  QuantSignal,
  RescueLogEntry,
  SetupDefaults,
  WalletSession,
} from "@/lib/domain/types";

export const mockWallet: WalletSession = {
  address: "0x8B92...4f7A",
  linkBalance: 14.26,
  network: "Arbitrum Sepolia",
};

export const basePositions: Position[] = [
  {
    id: "pos-aave-arb",
    protocol: "aave-v4",
    chain: "arbitrum-sepolia",
    pair: "ETH/USDC",
    collateralUsd: 1000,
    debtUsd: 720,
    healthFactor: 1.1,
    tokenType: "aToken",
    approvalStatus: "approved",
    isRescueSource: false,
  },
  {
    id: "pos-compound-arb",
    protocol: "compound-v3",
    chain: "arbitrum-sepolia",
    pair: "LINK/USDC",
    collateralUsd: 7300,
    debtUsd: 2200,
    healthFactor: 2,
    tokenType: "cToken",
    approvalStatus: "approved",
    isRescueSource: true,
  },
  {
    id: "pos-morpho-arb",
    protocol: "morpho-v2",
    chain: "arbitrum-sepolia",
    pair: "USDC/ETH",
    collateralUsd: 4100,
    debtUsd: 2700,
    healthFactor: 1.5,
    tokenType: "vault-share",
    approvalStatus: "approved",
    isRescueSource: false,
  },
  {
    id: "pos-aave-base",
    protocol: "aave-v4",
    chain: "base-sepolia",
    pair: "LINK/USDC",
    collateralUsd: 3550,
    debtUsd: 2100,
    healthFactor: 1.5,
    tokenType: "aToken",
    approvalStatus: "approved",
    isRescueSource: false,
  },
  {
    id: "pos-compound-base",
    protocol: "compound-v3",
    chain: "base-sepolia",
    pair: "ETH/USDC",
    collateralUsd: 6900,
    debtUsd: 2300,
    healthFactor: 2,
    tokenType: "cToken",
    approvalStatus: "approved",
    isRescueSource: true,
  },
  {
    id: "pos-morpho-base",
    protocol: "morpho-v2",
    chain: "base-sepolia",
    pair: "ETH/LINK",
    collateralUsd: 950,
    debtUsd: 670,
    healthFactor: 1.1,
    tokenType: "vault-share",
    approvalStatus: "approved",
    isRescueSource: false,
  },
];

export const healthyPositions: Position[] = basePositions.map((position) => ({
  ...position,
  healthFactor: position.isRescueSource ? 2 : 1.63,
}));

export const quantSignals: QuantSignal[] = [
  { id: "volatility", label: "Vol", value: "47%", trend: "up" },
  { id: "open-interest", label: "OI", value: "Shift", trend: "up" },
  { id: "funding", label: "Funding", value: "-0.03%", trend: "down" },
  { id: "spread", label: "CEX/DEX", value: "0.12%", trend: "flat" },
];

export const defaultConfig: ProtectionConfig = {
  threshold: 1.3,
  perRescueCapEth: 0.05,
  dailyCapEth: 0.2,
  priorityQueue: ["same-chain", "ccip-cross-chain"],
  emergencyOverride: true,
  recoveryBuffer: 1.1,
};

export function makeSnapshot(
  positions: Position[] = basePositions,
  overrides?: Partial<AppSnapshot>,
): AppSnapshot {
  const aggregateHF = computeAggregateHF(positions);

  return {
    positions,
    aggregateHF,
    threshold: defaultConfig.threshold,
    protectionStatus: {
      active: false,
      strategyLabel: null,
      workflowId: null,
    },
    budget: {
      usedTodayUsd: 0,
      capTodayUsd: 50,
      rescuesToday: 0,
      totalRescues: 7,
      totalSpendUsd: 42.1,
      estSavedUsd: 18400,
    },
    quantSignals,
    lastCheckSecondsAgo: 12,
    dataUpdatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export const initialSnapshot = makeSnapshot(basePositions);

export const setupDefaults: SetupDefaults = {
  presets: STRATEGY_PRESETS,
  config: defaultConfig,
  coverage: 78,
  approvals: [
    { label: "aTokens (AAVE)", tokenType: "aToken", approved: true },
    { label: "cTokens (Compound)", tokenType: "cToken", approved: true },
    { label: "Vault shares (Morpho)", tokenType: "vault-share", approved: true },
  ],
  linkCost: 0.5,
};

export const historyEntries: RescueLogEntry[] = [
  {
    id: "rescue-2",
    type: "ccip-cross-chain",
    timestampUtc: "2026-03-04T14:32:11Z",
    source: {
      protocol: "compound-v3",
      chain: "arbitrum-sepolia",
      amountUsd: 3000,
      token: "WETH",
    },
    target: {
      protocol: "morpho-v2",
      chain: "base-sepolia",
      amountUsd: 3000,
      token: "WETH",
    },
    amount: {
      token: "WETH",
      quantity: 1.25,
      usdValue: 3000,
    },
    gasEth: 0.004,
    ccipFeeLink: 0.1,
    hfBefore: 1.1,
    hfAfter: 1.31,
    txHash: "0x2b8ef94a74b11a0df9b32f0ae9d0cda3c194f7a2",
    workflowId: "wf-0x9a1bc2d",
    status: "success",
    blockNumber: 48291033,
  },
  {
    id: "rescue-1",
    type: "same-chain",
    timestampUtc: "2026-03-04T14:32:07Z",
    source: {
      protocol: "compound-v3",
      chain: "arbitrum-sepolia",
      amountUsd: 4200,
      token: "USDC",
    },
    target: {
      protocol: "aave-v4",
      chain: "arbitrum-sepolia",
      amountUsd: 4200,
      token: "USDC",
    },
    amount: {
      token: "USDC",
      quantity: 4200,
      usdValue: 4200,
    },
    gasEth: 0.002,
    hfBefore: 1.1,
    hfAfter: 1.31,
    txHash: "0x13af45e98b8ac7f56df2f44e023bcc3fa11de230",
    workflowId: "wf-0x9a1bc2d",
    status: "success",
    blockNumber: 48290989,
  },
];

export const rescueRunTemplates = {
  success: [
    {
      phase: "detect",
      progress: 0.15,
      status: "running",
      message:
        "Reading positions across Aave, Compound, Morpho and fetching Chainlink Data Feeds.",
      metrics: { aggregateHF: 1.03, threshold: 1.1 },
    },
    {
      phase: "evaluate",
      progress: 0.35,
      status: "running",
      message: "Breach confirmed. Budget healthy. Queue built: Compound Arb -> Compound Base -> CCIP.",
      metrics: {
        aggregateHF: 1.03,
        threshold: 1.1,
        queue: ["Compound Arb", "Compound Base", "CCIP"],
      },
    },
    {
      phase: "simulate",
      progress: 0.55,
      status: "running",
      message: "Tenderly pre-simulation passed. Proceeding to same-chain rescue.",
      metrics: { gasEth: 0.003, slippagePct: 0.12 },
    },
    {
      phase: "same_chain",
      progress: 0.75,
      status: "running",
      message: "Same-chain rescue completed: Compound Arbitrum -> AAVE Arbitrum. HF 1.10 -> 1.31.",
    },
    {
      phase: "ccip",
      progress: 0.9,
      status: "running",
      message: "CCIP transfer landed on Base. Morpho debt repaid. HF 1.10 -> 1.31.",
    },
    {
      phase: "complete",
      progress: 1,
      status: "complete",
      message: "Rescue completed. Dashboard restored and proof logged on-chain.",
    },
  ],
  simFail: [
    {
      phase: "detect",
      progress: 0.2,
      status: "running",
      message: "Detecting breach with aggregate HF 1.02.",
    },
    {
      phase: "evaluate",
      progress: 0.45,
      status: "running",
      message: "Breach confirmed. Attempting simulation.",
    },
    {
      phase: "failed",
      progress: 1,
      status: "failed",
      message: "Simulation failed: insufficient source liquidity. Rescue aborted safely.",
    },
  ],
  ccipDelayed: [
    {
      phase: "detect",
      progress: 0.2,
      status: "running",
      message: "Detecting breach and assembling rescue queue.",
    },
    {
      phase: "evaluate",
      progress: 0.4,
      status: "running",
      message: "Breach confirmed. Same-chain rescue first.",
    },
    {
      phase: "simulate",
      progress: 0.6,
      status: "running",
      message: "Simulation passed.",
    },
    {
      phase: "same_chain",
      progress: 0.75,
      status: "running",
      message: "Same-chain rescue completed for Arbitrum leg.",
    },
    {
      phase: "ccip",
      progress: 0.9,
      status: "ccip-delayed",
      message: "CCIP transfer in flight. Cross-chain lock active. Estimated confirmation: 2 minutes.",
    },
  ],
  ccipFailed: [
    {
      phase: "detect",
      progress: 0.2,
      status: "running",
      message: "Detecting risk across chains.",
    },
    {
      phase: "evaluate",
      progress: 0.4,
      status: "running",
      message: "Queue includes CCIP escalation.",
    },
    {
      phase: "simulate",
      progress: 0.6,
      status: "running",
      message: "Simulation successful.",
    },
    {
      phase: "ccip",
      progress: 0.85,
      status: "ccip-failed",
      message: "CCIP failed. Funds are now held in RescueEscrow on source chain.",
    },
    {
      phase: "failed",
      progress: 1,
      status: "ccip-failed",
      message: "Rescue moved to escrow-safe state. Claim or retry available.",
    },
  ],
  partial: [
    {
      phase: "detect",
      progress: 0.2,
      status: "running",
      message: "Risk detected. Building same-chain-first queue.",
    },
    {
      phase: "evaluate",
      progress: 0.4,
      status: "running",
      message: "Source #1 insufficient. Fall-through enabled.",
    },
    {
      phase: "simulate",
      progress: 0.6,
      status: "running",
      message: "Simulation passed with partial step routing.",
    },
    {
      phase: "same_chain",
      progress: 0.8,
      status: "partial",
      message: "Partial rescue from source #1. Falling through to source #2.",
    },
    {
      phase: "complete",
      progress: 1,
      status: "partial",
      message: "Combined rescue completed with partial first leg and successful second leg.",
    },
  ],
} as const;

export function linkUsdValue(link: number): number {
  return Number((link * LINK_USD_PRICE).toFixed(2));
}
