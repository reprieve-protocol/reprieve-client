import type { PositionsControllerSimulateApiGuardParams } from "@/src/services/models";

export const SIMULATE_API_GUARD_PARAMS: PositionsControllerSimulateApiGuardParams =
  {
    executionChainKey: "ethereum-sepolia",
    maxAgeSec: 600,
    forceCrossChain: false,
    allowCrossChain: true,
  };

type UnknownRecord = Record<string, unknown>;

export type SimulateApiGuardPayload = {
  isRescue?: boolean;
  decision?: string;
  reason?: string;
  plan?: {
    collateralAmount?: string;
  };
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
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

export function getIsRescueFromSimulation(response: unknown): boolean {
  const payload = getSimulateApiGuardPayload(response);

  if (!payload) {
    return false;
  }

  if (typeof payload.isRescue === "boolean") {
    return payload.isRescue;
  }

  if (payload.plan) {
    return true;
  }

  return isRecord(response) && "data" in response && response.data != null;
}
