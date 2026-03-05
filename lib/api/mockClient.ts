import {
  defaultConfig,
  historyEntries,
  makeSnapshot,
  mockWallet,
  rescueRunTemplates,
  setupDefaults,
} from "@/lib/mocks/data";
import { buildScenarioSnapshot } from "@/lib/mocks/scenarios";
import type {
  AppSnapshot,
  MockScenarioId,
  ProtectionConfig,
  RescueLogEntry,
  RescuePhaseState,
  SetupDefaults,
  WalletSession,
} from "@/lib/domain/types";

function wait(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

function randomHash(): string {
  const chars = "abcdef0123456789";
  let value = "0x";

  for (let i = 0; i < 40; i += 1) {
    value += chars[Math.floor(Math.random() * chars.length)];
  }

  return value;
}

type RunTemplateKey = keyof typeof rescueRunTemplates;

interface RescueRunSession {
  phases: RescuePhaseState[];
  cursor: number;
}

const rescueSessions = new Map<string, RescueRunSession>();

let snapshotCache: AppSnapshot = buildScenarioSnapshot("normal");
let historyCache: RescueLogEntry[] = [...historyEntries];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function getPortfolioSnapshot(scenario: MockScenarioId = "normal"): Promise<AppSnapshot> {
  await wait(180);

  if (scenario !== "normal") {
    snapshotCache = buildScenarioSnapshot(scenario);
    return clone(snapshotCache);
  }

  snapshotCache = {
    ...snapshotCache,
    lastCheckSecondsAgo: Math.floor(Math.random() * 20) + 4,
    dataUpdatedAt: new Date().toISOString(),
  };

  return clone(snapshotCache);
}

export async function getSetupDefaults(): Promise<SetupDefaults> {
  await wait(120);
  return clone(setupDefaults);
}

export async function deployProtection(
  config: ProtectionConfig,
): Promise<{ workflowId: string; donVerified: boolean; status: "deployed" }> {
  await wait(700);

  const workflowId = `wf-${Math.random().toString(16).slice(2, 10)}`;
  snapshotCache = {
    ...snapshotCache,
    threshold: config.threshold,
    protectionStatus: {
      active: true,
      strategyLabel: "Custom",
      workflowId,
    },
  };

  return {
    workflowId,
    donVerified: true,
    status: "deployed",
  };
}

export async function updateProtection(
  config: ProtectionConfig,
): Promise<{ status: "updated"; diff: string[] }> {
  await wait(320);

  const diff: string[] = [];

  if (snapshotCache.threshold !== config.threshold) {
    diff.push(`Threshold ${snapshotCache.threshold} -> ${config.threshold}`);
  }

  snapshotCache = {
    ...snapshotCache,
    threshold: config.threshold,
  };

  return { status: "updated", diff };
}

function phaseTemplateForScenario(scenario: MockScenarioId): RunTemplateKey {
  switch (scenario) {
    case "sim-fail":
      return "simFail";
    case "ccip-delayed":
      return "ccipDelayed";
    case "ccip-failed":
      return "ccipFailed";
    case "partial":
      return "partial";
    default:
      return "success";
  }
}

function makeRunPhases(templateKey: RunTemplateKey): RescuePhaseState[] {
  return rescueRunTemplates[templateKey].map((phase) => ({
    ...phase,
    startedAt: new Date().toISOString(),
  }));
}

export async function triggerDeterministicRescue(
  scenario: MockScenarioId = "normal",
): Promise<{ runId: string }> {
  await wait(160);

  const runId = `run-${Math.random().toString(16).slice(2, 8)}`;
  const phases = makeRunPhases(phaseTemplateForScenario(scenario));

  rescueSessions.set(runId, {
    phases,
    cursor: 0,
  });

  return { runId };
}

export async function getRescueRun(runId: string): Promise<RescuePhaseState> {
  await wait(200);

  const session = rescueSessions.get(runId);

  if (!session) {
    return {
      phase: "failed",
      startedAt: new Date().toISOString(),
      progress: 1,
      status: "failed",
      message: "Rescue run not found.",
    };
  }

  const phase = session.phases[Math.min(session.cursor, session.phases.length - 1)];

  if (session.cursor < session.phases.length - 1) {
    session.cursor += 1;
  }

  return clone(phase);
}

export async function getRescueHistory(): Promise<RescueLogEntry[]> {
  await wait(120);
  return clone(historyCache);
}

export async function getRescueHistoryEntry(id: string): Promise<RescueLogEntry> {
  await wait(80);
  const entry = historyCache.find((item) => item.id === id);

  if (!entry) {
    throw new Error("Rescue entry not found");
  }

  return clone(entry);
}

export async function connectWallet(): Promise<WalletSession> {
  await wait(90);
  return clone(mockWallet);
}

export async function disconnectWallet(): Promise<void> {
  await wait(40);
}

export async function appendMockHistoryEntry(entry: Omit<RescueLogEntry, "id">): Promise<RescueLogEntry> {
  await wait(60);

  const nextEntry: RescueLogEntry = {
    ...entry,
    id: `rescue-${Date.now()}`,
    txHash: entry.txHash || randomHash(),
  };

  historyCache = [nextEntry, ...historyCache];

  return clone(nextEntry);
}

export function applySuccessfulRescueSnapshot(workflowId: string): AppSnapshot {
  const recovered = makeSnapshot(
    snapshotCache.positions.map((position) => {
      if (position.id === "pos-aave-arb" || position.id === "pos-morpho-base") {
        return { ...position, healthFactor: 1.31 };
      }

      if (position.isRescueSource) {
        return { ...position, healthFactor: Math.max(1.76, position.healthFactor - 0.12) };
      }

      return position;
    }),
    {
      threshold: defaultConfig.threshold,
      protectionStatus: {
        active: true,
        strategyLabel: "Balanced",
        workflowId,
      },
      budget: {
        ...snapshotCache.budget,
        usedTodayUsd: Number((snapshotCache.budget.usedTodayUsd + 16.6).toFixed(2)),
        rescuesToday: snapshotCache.budget.rescuesToday + 2,
        totalRescues: snapshotCache.budget.totalRescues + 2,
        totalSpendUsd: Number((snapshotCache.budget.totalSpendUsd + 16.6).toFixed(2)),
      },
      lastCheckSecondsAgo: 2,
    },
  );

  snapshotCache = recovered;

  return clone(snapshotCache);
}

export function applySnapshot(snapshot: AppSnapshot): void {
  snapshotCache = clone(snapshot);
}
