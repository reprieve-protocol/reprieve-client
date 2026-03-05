import { computeAggregateHF } from "@/lib/domain/calculations";
import type { AppSnapshot, MockScenarioId, Position } from "@/lib/domain/types";
import { basePositions, makeSnapshot } from "@/lib/mocks/data";

function withHF(positions: Position[], positionId: string, nextHF: number): Position[] {
  return positions.map((position) =>
    position.id === positionId ? { ...position, healthFactor: nextHF } : position,
  );
}

export function buildScenarioSnapshot(scenario: MockScenarioId): AppSnapshot {
  const now = new Date();

  if (scenario === "no-positions") {
    return makeSnapshot([], {
      aggregateHF: 0,
      lastCheckSecondsAgo: 9,
    });
  }

  if (scenario === "all-safe") {
    const positions = basePositions.map((position) => ({
      ...position,
      healthFactor: position.isRescueSource ? 2 : 1.62,
    }));

    return makeSnapshot(positions, {
      aggregateHF: computeAggregateHF(positions),
      lastCheckSecondsAgo: 5,
    });
  }

  if (scenario === "stale-data") {
    return makeSnapshot(basePositions, {
      lastCheckSecondsAgo: 1900,
      dataUpdatedAt: new Date(now.getTime() - 1000 * 60 * 35).toISOString(),
    });
  }

  if (scenario === "budget-exhausted") {
    return makeSnapshot(basePositions, {
      budget: {
        usedTodayUsd: 50,
        capTodayUsd: 50,
        rescuesToday: 5,
        totalRescues: 12,
        totalSpendUsd: 113.9,
        estSavedUsd: 25800,
      },
    });
  }

  if (scenario === "sim-fail") {
    const positions = withHF(basePositions, "pos-aave-arb", 1.03);
    return makeSnapshot(positions, {
      aggregateHF: computeAggregateHF(positions),
      lastCheckSecondsAgo: 4,
    });
  }

  if (scenario === "ccip-delayed") {
    const positions = withHF(withHF(basePositions, "pos-aave-arb", 1.07), "pos-morpho-base", 1.04);
    return makeSnapshot(positions, {
      aggregateHF: computeAggregateHF(positions),
      lastCheckSecondsAgo: 3,
    });
  }

  if (scenario === "ccip-failed") {
    const positions = withHF(withHF(basePositions, "pos-aave-arb", 1.06), "pos-morpho-base", 1.02);
    return makeSnapshot(positions, {
      aggregateHF: computeAggregateHF(positions),
      lastCheckSecondsAgo: 3,
    });
  }

  if (scenario === "partial") {
    const positions = withHF(withHF(basePositions, "pos-aave-arb", 1.08), "pos-morpho-base", 1.05);
    return makeSnapshot(positions, {
      aggregateHF: computeAggregateHF(positions),
      lastCheckSecondsAgo: 4,
    });
  }

  return makeSnapshot(basePositions);
}
