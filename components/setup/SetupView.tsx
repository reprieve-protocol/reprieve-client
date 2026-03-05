"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { DeployStep } from "@/components/setup/DeployStep";
import { ParametersStep } from "@/components/setup/ParametersStep";
import { StrategyStep } from "@/components/setup/StrategyStep";
import { Slider } from "@/components/ui/slider";
import { useAppState } from "@/lib/state/app-context";
import {
  useCreRegistrationsControllerUpsertRegistration,
  useCreRegistrationsControllerGetRegistration,
  getCreRegistrationsControllerGetRegistrationQueryKey,
} from "@/src/services/queries";
import { UpsertUserCreRegistrationDtoWorkflowId } from "@/src/services/models/upsertUserCreRegistrationDtoWorkflowId";
import { UpsertUserCreRegistrationDtoQueuePriority } from "@/src/services/models/upsertUserCreRegistrationDtoQueuePriority";

interface CreRegistrationData {
  workflowId?: string;
  hfThresholdBps?: number;
  queuePriority?: string;
  budgetCapUsd?: number;
  updatedAt?: string;
}

const ETH_PRICE_API_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";

async function fetchEthUsdPrice(): Promise<number> {
  const response = await fetch(ETH_PRICE_API_URL, { cache: "no-store" });
  console.log("response: ", response);
  if (!response.ok) {
    throw new Error("Failed to fetch ETH price.");
  }

  const payload = (await response.json()) as {
    ethereum?: { usd?: number };
  };
  console.log("payload123: ", payload);
  const nextPrice = Number(payload?.ethereum?.usd);
  if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
    throw new Error("Invalid ETH price response.");
  }

  return nextPrice;
}

function normalizeCreRegistration(
  payload: unknown,
): CreRegistrationData | null {
  if (!payload || typeof payload !== "object") return null;

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

  const root = asRecord(payload);
  if (!root) return null;

  const candidates: unknown[] = [root];
  if (root.data !== undefined) candidates.push(root.data);
  if (root.registration !== undefined) candidates.push(root.registration);

  const rootData = asRecord(root.data);
  if (rootData) {
    if (rootData.registration !== undefined)
      candidates.push(rootData.registration);
    if (rootData.result !== undefined) candidates.push(rootData.result);
  }

  for (const candidate of candidates) {
    const record = asRecord(candidate);
    if (!record) continue;

    const normalized: CreRegistrationData = {
      workflowId:
        (record.workflowId as string | undefined) ??
        (record.workflow_id as string | undefined),
      hfThresholdBps:
        toNumber(record.hfThresholdBps) ?? toNumber(record.hf_threshold_bps),
      queuePriority:
        (record.queuePriority as string | undefined) ??
        (record.queue_priority as string | undefined),
      budgetCapUsd:
        toNumber(record.budgetCapUsd) ?? toNumber(record.budget_cap_usd),
      updatedAt:
        (record.updatedAt as string | undefined) ??
        (record.updated_at as string | undefined),
    };

    const hasKnownField =
      normalized.workflowId !== undefined ||
      normalized.hfThresholdBps !== undefined ||
      normalized.queuePriority !== undefined ||
      normalized.budgetCapUsd !== undefined ||
      normalized.updatedAt !== undefined;

    if (hasKnownField) return normalized;
  }

  return null;
}

export function SetupView() {
  const router = useRouter();
  const {
    state: { loading, error, setupDefaults, protectionConfig, snapshot },
    setProtectionConfig,
    applyPreset,
    deploy,
    triggeredPositionsCount,
    coverage,
    rescuesPerDayEstimate,
  } = useAppState();

  const [deploying, setDeploying] = useState(false);
  const [updatingCre, setUpdatingCre] = useState(false);
  const [editingCre, setEditingCre] = useState(false);
  const [creUpdateMessage, setCreUpdateMessage] = useState<string | null>(null);
  const [ethUsdPrice, setEthUsdPrice] = useState<number | null>(null);
  const [ethUsdPriceError, setEthUsdPriceError] = useState<string | null>(null);

  const [address, setAddress] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setAddress(localStorage.getItem("demoWalletAddress") ?? "");
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadEthPrice = async () => {
      try {
        const nextPrice = await fetchEthUsdPrice();

        if (!active) return;
        setEthUsdPrice(nextPrice);
        setEthUsdPriceError(null);
      } catch {
        if (!active) return;
        setEthUsdPriceError("Unable to fetch ETH price.");
      }
    };

    void loadEthPrice();

    return () => {
      active = false;
    };
  }, []);

  const {
    data: creRegistration,
    error: creRegistrationError,
    refetch: refetchCreRegistration,
  } = useCreRegistrationsControllerGetRegistration(address, {
    query: {
      queryKey: getCreRegistrationsControllerGetRegistrationQueryKey(address),
      retry: (failureCount, error) => {
        const statusCode = (error as { response?: { status?: number } } | null)
          ?.response?.status;
        if (statusCode === 404) return false;
        return failureCount < 2;
      },
    },
  });

  const creRegistrationStatusCode = (
    creRegistrationError as { response?: { status?: number } } | null
  )?.response?.status;
  const creRegistrationMissing = creRegistrationStatusCode === 404;
  const creData = useMemo(
    () =>
      creRegistrationMissing ? null : normalizeCreRegistration(creRegistration),
    [creRegistration, creRegistrationMissing],
  );
  const hasCreRegistration = Boolean(creData);

  const { mutateAsync: upsertCreRegistration } =
    useCreRegistrationsControllerUpsertRegistration();

  const selectedPresetId = useMemo(() => {
    if (!setupDefaults || !protectionConfig) return "balanced";
    const matched = setupDefaults.presets.find(
      (preset) =>
        Math.abs(preset.threshold - protectionConfig.threshold) < 0.001,
    );
    return matched?.id ?? "balanced";
  }, [protectionConfig, setupDefaults]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-sm text-[#a9b2ab]">
        <span className="size-4 animate-spin rounded-full border-2 border-[#2d3932] border-t-[#c7f36b]" />
        Loading setup...
      </div>
    );
  }

  if (error) return <p className="text-sm text-red-400">{error}</p>;

  if (!setupDefaults || !protectionConfig || !snapshot) {
    return (
      <p className="text-sm text-[#a9b2ab]">Setup defaults unavailable.</p>
    );
  }

  const syncCreRegistration = async (action: "create" | "update") => {
    if (!address || !protectionConfig) return;

    const isCrossChainFirst =
      protectionConfig.priorityQueue[0] === "ccip-cross-chain";
    let latestEthUsdPrice = ethUsdPrice;

    try {
      const parsedPrice = await fetchEthUsdPrice();

      latestEthUsdPrice = parsedPrice;
      setEthUsdPrice(parsedPrice);
      setEthUsdPriceError(null);
    } catch {
      setEthUsdPriceError("Unable to fetch ETH price.");
      throw new Error("Unable to fetch ETH price.");
    }

    await upsertCreRegistration({
      address,
      data: {
        workflowId:
          UpsertUserCreRegistrationDtoWorkflowId.CHAINLINK_API_GUARD_V1,
        hfThresholdBps: Math.round(protectionConfig.threshold * 10_000),
        queuePriority: isCrossChainFirst
          ? UpsertUserCreRegistrationDtoQueuePriority.CROSS_CHAIN_FIRST
          : UpsertUserCreRegistrationDtoQueuePriority.SAME_CHAIN_FIRST,
        budgetCapUsd: Math.round(
          protectionConfig.dailyCapEth * (latestEthUsdPrice ?? 0),
        ),
        source: `reprieve-fe:${action}`,
        updatedBy: address,
      },
    });

    await refetchCreRegistration();
  };

  async function onConfirmUpdateCre() {
    setUpdatingCre(true);
    setCreUpdateMessage(null);
    try {
      await syncCreRegistration("update");
      setCreUpdateMessage("CRE updated.");
      setEditingCre(false);
    } catch {
      setCreUpdateMessage("Failed to update CRE.");
    } finally {
      setUpdatingCre(false);
    }
  }

  async function onDeploy() {
    setDeploying(true);
    try {
      await syncCreRegistration(hasCreRegistration ? "update" : "create");
      await deploy();
      router.push("/");
    } finally {
      setDeploying(false);
    }
  }

  return (
    <>
      <div className="space-y-5 animate-fade-up">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Protection Setup
            </h1>
            <p className="mt-0.5 text-sm text-[#a9b2ab]">
              Deploy your personal CRE workflow in three steps.
            </p>
          </div>
          <span className="tag">
            <span className="size-1.5 rounded-full bg-[#b5e86f]" />
            Wizard Mode
          </span>
        </div>

        {address && (
          <section className="card p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#c7f36b]">
                CRE Workflow Registration
              </p>
              <span className="tag">
                <span
                  className={`size-1.5 rounded-full ${
                    hasCreRegistration ? "bg-[#b5e86f]" : "bg-amber-400"
                  }`}
                />
                {hasCreRegistration ? "Registered" : "Not Registered"}
              </span>
            </div>

            {hasCreRegistration ? (
              <>
                <div className="grid gap-2 sm:grid-cols-2 text-sm">
                  {creData?.hfThresholdBps !== undefined && (
                    <div className="card-inset px-3 py-2">
                      <p className="text-[10px] uppercase tracking-widest text-[#c7f36b]">
                        HF Threshold
                      </p>
                      <p className="mt-0.5 text-xs text-white">
                        {(creData.hfThresholdBps / 10_000).toFixed(2)}
                        <span className="ml-1 text-[#a9b2ab]">
                          ({creData.hfThresholdBps} bps)
                        </span>
                      </p>
                    </div>
                  )}
                  {creData?.budgetCapUsd !== undefined && (
                    <div className="card-inset px-3 py-2">
                      <p className="text-[10px] uppercase tracking-widest text-[#c7f36b]">
                        Budget Cap
                      </p>
                      <p className="mt-0.5 text-xs text-white">
                        ${creData.budgetCapUsd.toLocaleString()} USD
                      </p>
                    </div>
                  )}
                  {creData?.updatedAt && (
                    <div className="card-inset px-3 py-2 sm:col-span-2">
                      <p className="text-[10px] uppercase tracking-widest text-[#c7f36b]">
                        Last Updated
                      </p>
                      <p className="mt-0.5 text-xs text-[#b5e86f]">
                        {new Date(creData.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCre(true);
                      setCreUpdateMessage(null);
                    }}
                    disabled={deploying || updatingCre}
                    className="inline-flex items-center justify-center rounded-lg border border-[#c7f36b]/30 bg-[#c7f36b]/10 px-3 py-1.5 text-xs font-semibold text-[#b5e86f] transition hover:bg-[#c7f36b]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Update CRE
                  </button>
                </div>
              </>
            ) : (
              <p className="text-xs text-[#a9b2ab]">
                No CRE workflow registered yet. Configure below and deploy to
                create one.
              </p>
            )}

            {creUpdateMessage && (
              <p className="text-xs text-[#b5e86f]">{creUpdateMessage}</p>
            )}
          </section>
        )}

        {!hasCreRegistration && (
          <>
            <StrategyStep
              presets={setupDefaults.presets}
              selectedPresetId={selectedPresetId}
              onSelect={applyPreset}
            />

            <ParametersStep
              config={protectionConfig}
              onChange={setProtectionConfig}
              triggeredCount={triggeredPositionsCount}
              positions={snapshot.positions}
            />

            <DeployStep
              setupDefaults={setupDefaults}
              coverage={coverage}
              deploying={deploying}
              onDeploy={() => void onDeploy()}
              isActive={snapshot.protectionStatus.active}
              rescuesPerDayEstimate={rescuesPerDayEstimate}
            />
          </>
        )}
      </div>

      {editingCre && hasCreRegistration && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!updatingCre) {
              setEditingCre(false);
              setCreUpdateMessage(null);
            }
          }}
        >
          <section
            className="flex w-full max-w-5xl max-h-[90vh] flex-col overflow-hidden rounded-xl border border-[#2d3932] bg-[#131815] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#2d3932] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Update CRE Configuration
                </h2>
                <p className="text-xs text-[#a9b2ab]">
                  Adjust options and confirm to update this CRE.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingCre(false);
                  setCreUpdateMessage(null);
                }}
                disabled={updatingCre}
                className="rounded-lg p-2 text-[#a9b2ab] transition hover:bg-[#2d3932] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-5">
              <div className="card-inset p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-[#b5e86f]">
                    HF Threshold
                  </p>
                  <p className="text-sm font-bold tabular-nums text-white">
                    {protectionConfig.threshold.toFixed(2)}
                  </p>
                </div>
                <Slider
                  min={1.05}
                  max={2}
                  step={0.01}
                  value={[protectionConfig.threshold]}
                  onValueChange={(vals) =>
                    setProtectionConfig({
                      ...protectionConfig,
                      threshold: vals[0],
                    })
                  }
                  className="w-full"
                />
              </div>

              <div className="card-inset p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-[#b5e86f]">
                    Daily Cap
                  </p>
                  <p className="text-sm font-bold tabular-nums text-white">
                    {protectionConfig.dailyCapEth.toFixed(2)} ETH
                  </p>
                </div>
                <Slider
                  min={0.05}
                  max={1}
                  step={0.01}
                  value={[protectionConfig.dailyCapEth]}
                  onValueChange={(vals) =>
                    setProtectionConfig({
                      ...protectionConfig,
                      dailyCapEth: vals[0],
                    })
                  }
                  className="w-full"
                />
                <p className="text-[11px] text-[#a9b2ab]">
                  {ethUsdPrice !== null
                    ? `Budget cap sent to CRE: $${Math.round(
                        protectionConfig.dailyCapEth * ethUsdPrice,
                      ).toLocaleString()} (ETH: $${ethUsdPrice.toLocaleString()})`
                    : "Budget cap sent to CRE: waiting for ETH/USD price..."}
                </p>
                {ethUsdPriceError && (
                  <p className="text-[11px] text-amber-300">
                    {ethUsdPriceError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#2d3932] px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  setEditingCre(false);
                  setCreUpdateMessage(null);
                }}
                disabled={updatingCre}
                className="inline-flex items-center justify-center rounded-lg border border-[#8c9890] bg-[#191f1b] px-3 py-1.5 text-xs font-semibold text-[#dde6de] transition hover:bg-[#252f29] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void onConfirmUpdateCre()}
                disabled={updatingCre || deploying}
                className="inline-flex items-center justify-center rounded-lg border border-[#c7f36b]/30 bg-[#c7f36b]/10 px-3 py-1.5 text-xs font-semibold text-[#b5e86f] transition hover:bg-[#c7f36b]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingCre ? "Updating CRE..." : "Confirm Update"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
