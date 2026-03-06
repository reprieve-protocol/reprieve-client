import type { ErrorType } from "@/src/services/custom-client";

export interface CreRegistrationData {
  hfThresholdBps?: number;
  budgetCapUsd?: number;
  queuePriority?: string;
  updatedAt?: string;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

export function normalizeCreRegistration(
  payload: unknown,
): CreRegistrationData | null {
  if (!payload || typeof payload !== "object") return null;

  const root = asRecord(payload);
  if (!root) return null;

  const candidates: unknown[] = [root];
  if (root.data !== undefined) candidates.push(root.data);
  if (root.registration !== undefined) candidates.push(root.registration);

  const rootData = asRecord(root.data);
  if (rootData) {
    if (rootData.registration !== undefined) {
      candidates.push(rootData.registration);
    }
    if (rootData.result !== undefined) {
      candidates.push(rootData.result);
    }
  }

  for (const candidate of candidates) {
    const record = asRecord(candidate);
    if (!record) continue;

    const normalized: CreRegistrationData = {
      hfThresholdBps:
        toNumber(record.hfThresholdBps) ?? toNumber(record.hf_threshold_bps),
      budgetCapUsd:
        toNumber(record.budgetCapUsd) ?? toNumber(record.budget_cap_usd),
      queuePriority:
        (record.queuePriority as string | undefined) ??
        (record.queue_priority as string | undefined),
      updatedAt:
        (record.updatedAt as string | undefined) ??
        (record.updated_at as string | undefined),
    };

    const hasKnownField =
      normalized.hfThresholdBps !== undefined ||
      normalized.budgetCapUsd !== undefined ||
      normalized.queuePriority !== undefined ||
      normalized.updatedAt !== undefined;

    if (hasKnownField) {
      return normalized;
    }
  }

  return null;
}

export function getResponseStatusCode(error: unknown): number | undefined {
  return (error as ErrorType<unknown> | null)?.response?.status;
}
