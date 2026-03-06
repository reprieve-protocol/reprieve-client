import type {
  PositionsControllerGetRiskSnapshotParams,
  PositionsControllerSimulateApiGuardParams,
} from "@/src/services/models";

const MAX_AGE_SEC = 600;
const ETH_PRICE_DROP_NUMERATOR = BigInt(60);
const ETH_PRICE_DROP_DENOMINATOR = BigInt(100);
const FALLBACK_DROPPED_ETH_PRICE_WAD = "1200000000000000000000";

export const ETH_PRICE_OVERRIDE_ASSETS = {
  ethereumSepolia: "0x4c87EA388AdE37f6A556146B4fF6ff2A12192968",
  baseSepolia: "0xEDD391FDa28993287Df301485ABF72865dee5050",
} as const;

export const SIMULATE_API_GUARD_BASE_PARAMS: PositionsControllerSimulateApiGuardParams =
  {
    executionChainKey: "ethereum-sepolia",
    maxAgeSec: MAX_AGE_SEC,
    forceCrossChain: false,
    allowCrossChain: true,
  };

export const SIMULATE_API_GUARD_PARAMS = SIMULATE_API_GUARD_BASE_PARAMS;

type UnknownRecord = Record<string, unknown>;

export type RescueSimulationDecision =
  | "NO_ACTION"
  | "RESCUE_SAME_CHAIN"
  | "RESCUE_CROSS_CHAIN";

export type SimulateApiGuardPayload = {
  isRescue?: boolean;
  decision?: RescueSimulationDecision | string;
  reason?: string;
  plan?: {
    collateralAmount?: string;
  };
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function parsePositiveBigInt(value?: string | null): bigint | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = BigInt(value);
    return parsed > BigInt(0) ? parsed : null;
  } catch {
    return null;
  }
}

function getDroppedEthPriceWad(currentEthPriceWad?: string | null): string {
  const normalizedCurrentPrice = parsePositiveBigInt(currentEthPriceWad);

  if (!normalizedCurrentPrice) {
    return FALLBACK_DROPPED_ETH_PRICE_WAD;
  }

  return (
    (normalizedCurrentPrice * ETH_PRICE_DROP_NUMERATOR) /
    ETH_PRICE_DROP_DENOMINATOR
  ).toString();
}

export function buildEthPriceDropOverrides(currentEthPriceWad?: string | null): {
  "ethereum-sepolia": Record<string, string>;
  "base-sepolia": Record<string, string>;
} {
  const droppedPriceWad = getDroppedEthPriceWad(currentEthPriceWad);

  return {
    "ethereum-sepolia": {
      [ETH_PRICE_OVERRIDE_ASSETS.ethereumSepolia]: droppedPriceWad,
    },
    "base-sepolia": {
      [ETH_PRICE_OVERRIDE_ASSETS.baseSepolia]: droppedPriceWad,
    },
  };
}

export function buildRiskSnapshotParams({
  currentEthPriceWad,
  simulateEthPriceDrop = false,
}: {
  currentEthPriceWad?: string | null;
  simulateEthPriceDrop?: boolean;
} = {}): PositionsControllerGetRiskSnapshotParams {
  if (!simulateEthPriceDrop) {
    return { maxAgeSec: MAX_AGE_SEC };
  }

  return {
    maxAgeSec: MAX_AGE_SEC,
    ...buildEthPriceDropOverrides(currentEthPriceWad),
  };
}

export function buildSimulateApiGuardParams({
  currentEthPriceWad,
  simulateEthPriceDrop = false,
}: {
  currentEthPriceWad?: string | null;
  simulateEthPriceDrop?: boolean;
} = {}): PositionsControllerSimulateApiGuardParams {
  if (!simulateEthPriceDrop) {
    return SIMULATE_API_GUARD_BASE_PARAMS;
  }

  return {
    ...SIMULATE_API_GUARD_BASE_PARAMS,
    ...buildEthPriceDropOverrides(currentEthPriceWad),
  };
}

function normalizePayload(value: unknown): SimulateApiGuardPayload | null {
  if (!isRecord(value)) {
    return null;
  }

  const hasKnownKeys =
    "isRescue" in value ||
    "decision" in value ||
    "reason" in value ||
    "plan" in value;

  if (!hasKnownKeys) {
    return null;
  }

  const plan = isRecord(value.plan) ? value.plan : null;

  return {
    isRescue: typeof value.isRescue === "boolean" ? value.isRescue : undefined,
    decision: typeof value.decision === "string" ? value.decision : undefined,
    reason: typeof value.reason === "string" ? value.reason : undefined,
    plan: plan
      ? {
          collateralAmount:
            typeof plan.collateralAmount === "string"
              ? plan.collateralAmount
              : undefined,
        }
      : undefined,
  };
}

export function getSimulateApiGuardPayload(
  response: unknown,
): SimulateApiGuardPayload | null {
  const directPayload = normalizePayload(response);
  if (directPayload) {
    return directPayload;
  }

  if (!isRecord(response) || !("data" in response) || response.data == null) {
    return null;
  }

  return normalizePayload(response.data);
}

export function getRescueSimulationDecision(
  response: unknown,
): RescueSimulationDecision | string | undefined {
  return getSimulateApiGuardPayload(response)?.decision;
}

export function getIsRescueFromSimulation(response: unknown): boolean {
  const payload = getSimulateApiGuardPayload(response);

  if (!payload) {
    return false;
  }

  if (payload.decision === "NO_ACTION") {
    return false;
  }

  if (
    payload.decision === "RESCUE_SAME_CHAIN" ||
    payload.decision === "RESCUE_CROSS_CHAIN"
  ) {
    return true;
  }

  if (typeof payload.isRescue === "boolean") {
    return payload.isRescue;
  }

  if (payload.plan) {
    return true;
  }

  return false;
}
