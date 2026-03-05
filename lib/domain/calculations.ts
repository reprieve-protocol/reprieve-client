import { ETH_USD_PRICE } from "@/lib/domain/constants";
import type {
  BudgetState,
  Chain,
  Position,
  ProtectionConfig,
  RiskLevel,
} from "@/lib/domain/types";

export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function computeAggregateHF(positions: Position[]): number {
  if (positions.length === 0) {
    return 0;
  }

  const totalCollateral = positions.reduce((acc, position) => acc + position.collateralUsd, 0);

  if (totalCollateral === 0) {
    return 0;
  }

  const weightedHF = positions.reduce((acc, position) => {
    const weight = position.collateralUsd / totalCollateral;
    return acc + position.healthFactor * weight;
  }, 0);

  return round(weightedHF, 2);
}

export function classifyRiskLevel(healthFactor: number): RiskLevel {
  if (healthFactor >= 1.5) {
    return "safe";
  }

  if (healthFactor >= 1.2) {
    return "moderate";
  }

  if (healthFactor >= 1.05) {
    return "danger";
  }

  return "critical";
}

export function buildPriorityQueue(
  positions: Position[],
  targetChain: Chain,
  config: ProtectionConfig,
): Position[] {
  const safePositions = positions
    .filter((position) => position.isRescueSource)
    .sort((a, b) => b.healthFactor - a.healthFactor);

  if (config.priorityQueue[0] === "same-chain") {
    return [
      ...safePositions.filter((position) => position.chain === targetChain),
      ...safePositions.filter((position) => position.chain !== targetChain),
    ];
  }

  return safePositions;
}

export function positionsTriggeredAtThreshold(
  positions: Position[],
  threshold: number,
  emergencyOverride: boolean,
): Position[] {
  return positions.filter((position) => {
    if (emergencyOverride && position.healthFactor < 1.1) {
      return true;
    }

    return position.healthFactor < threshold;
  });
}

export function computeCoverage(
  positions: Position[],
  config: ProtectionConfig,
): number {
  if (positions.length === 0) {
    return 0;
  }

  const endangered = positions.filter(
    (position) => position.healthFactor < config.threshold || position.healthFactor < 1.1,
  );

  if (endangered.length === 0) {
    return 100;
  }

  const rescueCapacity = positions
    .filter((position) => position.isRescueSource)
    .reduce((acc, position) => acc + position.collateralUsd * 0.8, 0);

  const requiredCoverage = endangered.reduce(
    (acc, position) => acc + Math.max(position.debtUsd * 0.25, position.debtUsd * 0.1),
    0,
  );

  if (requiredCoverage === 0) {
    return 100;
  }

  const rawCoverage = (rescueCapacity / requiredCoverage) * 100;
  return Math.max(0, Math.min(100, round(rawCoverage, 0)));
}

export function estimateRescuesPerDay(dailyCapEth: number, perRescueEth: number): number {
  if (perRescueEth <= 0) {
    return 0;
  }

  return Math.max(0, Math.floor(dailyCapEth / perRescueEth));
}

export function canExecuteRescue(
  budget: BudgetState,
  config: ProtectionConfig,
  estimatedGasEth: number,
): { ok: boolean; reason?: string } {
  if (estimatedGasEth > config.perRescueCapEth) {
    return { ok: false, reason: "Per-rescue gas cap exceeded" };
  }

  const projectedUsd = budget.usedTodayUsd + estimatedGasEth * ETH_USD_PRICE;

  if (projectedUsd > budget.capTodayUsd) {
    return { ok: false, reason: "Daily budget exhausted" };
  }

  return { ok: true };
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatEth(value: number): string {
  return `${round(value, 3)} ETH`;
}

export function formatLink(value: number): string {
  return `${round(value, 2)} LINK`;
}
