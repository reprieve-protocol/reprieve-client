"use client";

import { useEffect, useMemo, useState } from "react";
import { waitForTransactionReceipt } from "@wagmi/core";
import { Check, Copy, X } from "lucide-react";
import { erc20Abi, parseUnits } from "viem";
import { ParametersStep } from "@/components/setup/ParametersStep";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  getResponseStatusCode,
  normalizeCreRegistration,
} from "@/lib/cre-registration";
import { useDemoWallet } from "@/lib/state/demo-wallet-context";
import { useAppState } from "@/lib/state/app-context";
import { config as wagmiConfig } from "@/lib/wagmi";
import {
  useCreRegistrationsControllerUpsertRegistration,
  useCreRegistrationsControllerGetRegistration,
  getCreRegistrationsControllerGetRegistrationQueryKey,
} from "@/src/services/queries";
import { UpsertUserCreRegistrationDtoWorkflowId } from "@/src/services/models/upsertUserCreRegistrationDtoWorkflowId";
import { UpsertUserCreRegistrationDtoQueuePriority } from "@/src/services/models/upsertUserCreRegistrationDtoQueuePriority";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import { sepolia } from "wagmi/chains";

const CRE_DEPLOY_FEE_LINK = "0.5";
const LINK_TOKEN_ADDRESS =
  "0x779877a7b0d9e8603169ddbd7836e478b4624789" as const;
const CRE_FEE_RECEIVER = "0x28b94B571f8F3FEB444075B65054FFba4e10D49a" as const;
const CRE_DEPLOY_FEE_AMOUNT = parseUnits(CRE_DEPLOY_FEE_LINK, 18);
const DEFAULT_QUEUE_PRIORITY =
  UpsertUserCreRegistrationDtoQueuePriority.SAME_CHAIN_FIRST;

type CreateCreStage = "fee" | "register" | null;

function formatQueuePriority(
  value: string | undefined,
): "Same-chain first" | "Cross-chain first" {
  return value === UpsertUserCreRegistrationDtoQueuePriority.CROSS_CHAIN_FIRST
    ? "Cross-chain first"
    : "Same-chain first";
}

export function SetupView() {
  const {
    state: { loading, error, protectionConfig, snapshot },
    setProtectionConfig,
  } = useAppState();
  const { address: connectedAddress, chainId } = useAccount();
  const { demoWalletAddress: address, isResolvingDemoWallet } = useDemoWallet();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [updatingCre, setUpdatingCre] = useState(false);
  const [creatingCre, setCreatingCre] = useState(false);
  const [editingCre, setEditingCre] = useState(false);
  const [createCreStage, setCreateCreStage] = useState<CreateCreStage>(null);
  const [creUpdateMessage, setCreUpdateMessage] = useState<string | null>(null);
  const [copiedTokenAddress, setCopiedTokenAddress] = useState(false);
  const [budgetCapUsd, setBudgetCapUsd] = useState(20_000);
  const [queuePriority, setQueuePriority] =
    useState<UpsertUserCreRegistrationDtoQueuePriority>(DEFAULT_QUEUE_PRIORITY);
  const [confirmedFeeTxHash, setConfirmedFeeTxHash] = useState<
    `0x${string}` | null
  >(null);

  const {
    data: creRegistration,
    error: creRegistrationError,
    refetch: refetchCreRegistration,
  } = useCreRegistrationsControllerGetRegistration(address, {
    query: {
      queryKey: getCreRegistrationsControllerGetRegistrationQueryKey(address),
      retry: (failureCount, error) => {
        const statusCode = getResponseStatusCode(error);
        if (statusCode === 404) return false;
        return failureCount < 2;
      },
    },
  });

  const creRegistrationStatusCode = getResponseStatusCode(creRegistrationError);
  const creRegistrationMissing = creRegistrationStatusCode === 404;
  const creData = useMemo(
    () =>
      creRegistrationMissing ? null : normalizeCreRegistration(creRegistration),
    [creRegistration, creRegistrationMissing],
  );
  const hasCreRegistration = Boolean(creData);

  useEffect(() => {
    if (creData?.budgetCapUsd === undefined) return;
    const cappedBudget = Math.min(20_000, Math.max(1, creData.budgetCapUsd));
    setBudgetCapUsd(cappedBudget);
  }, [creData?.budgetCapUsd]);

  useEffect(() => {
    setQueuePriority(
      creData?.queuePriority ===
        UpsertUserCreRegistrationDtoQueuePriority.CROSS_CHAIN_FIRST
        ? UpsertUserCreRegistrationDtoQueuePriority.CROSS_CHAIN_FIRST
        : DEFAULT_QUEUE_PRIORITY,
    );
  }, [creData?.queuePriority]);

  const { mutateAsync: upsertCreRegistration } =
    useCreRegistrationsControllerUpsertRegistration();

  useEffect(() => {
    if (hasCreRegistration) {
      setConfirmedFeeTxHash(null);
      setCreateCreStage(null);
    }
  }, [hasCreRegistration]);

  useEffect(() => {
    if (!copiedTokenAddress) return;

    const timeoutId = window.setTimeout(() => {
      setCopiedTokenAddress(false);
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [copiedTokenAddress]);

  if (loading || (Boolean(connectedAddress) && isResolvingDemoWallet)) {
    return (
      <div className="flex items-center gap-3 text-sm text-[#a9b2ab]">
        <span className="size-4 animate-spin rounded-full border-2 border-[#2d3932] border-t-[#c7f36b]" />
        {isResolvingDemoWallet ? "Syncing demo wallet..." : "Loading setup..."}
      </div>
    );
  }

  if (error) return <p className="text-sm text-red-400">{error}</p>;

  if (!protectionConfig || !snapshot) {
    return (
      <p className="text-sm text-[#a9b2ab]">Setup defaults unavailable.</p>
    );
  }

  const syncCreRegistration = async (action: "create" | "update") => {
    if (!address || !protectionConfig) return;

    const cappedBudgetCapUsd = Math.round(
      Math.min(20_000, Math.max(1, budgetCapUsd)),
    );

    await upsertCreRegistration({
      address,
      data: {
        workflowId:
          UpsertUserCreRegistrationDtoWorkflowId.CHAINLINK_API_GUARD_V1,
        hfThresholdBps: Math.round(protectionConfig.threshold * 10_000),
        queuePriority,
        budgetCapUsd: cappedBudgetCapUsd,
        source: `reprieve-fe:${action}`,
        updatedBy: address,
      },
    });

    await refetchCreRegistration();
  };

  const payCreDeploymentFee = async () => {
    return;
    if (confirmedFeeTxHash) {
      return confirmedFeeTxHash;
    }

    if (!connectedAddress) {
      throw new Error("Connect your wallet to pay the LINK fee.");
    }

    if (chainId !== sepolia.id) {
      await switchChainAsync({ chainId: sepolia.id });
    }

    const hash = await writeContractAsync({
      address: LINK_TOKEN_ADDRESS,
      abi: erc20Abi,
      functionName: "transfer",
      args: [CRE_FEE_RECEIVER, CRE_DEPLOY_FEE_AMOUNT],
      chainId: sepolia.id,
    });

    const receipt = await waitForTransactionReceipt(wagmiConfig, {
      chainId: sepolia.id,
      hash,
    });

    if (receipt.status !== "success") {
      throw new Error("LINK fee transfer was not confirmed.");
    }

    setConfirmedFeeTxHash(hash);

    return hash;
  };

  const copyLinkTokenAddress = async () => {
    await navigator.clipboard.writeText(LINK_TOKEN_ADDRESS);
    setCopiedTokenAddress(true);
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

  async function onCreateCre() {
    setCreatingCre(true);
    setCreateCreStage("fee");
    setCreUpdateMessage(null);
    let feeHash = confirmedFeeTxHash;

    try {
      setCreUpdateMessage(
        "Confirm the Sepolia LINK fee transfer in your wallet.",
      );
      feeHash = await payCreDeploymentFee();
      setCreateCreStage("register");
      setCreUpdateMessage("Sepolia LINK fee confirmed. Creating CRE...");
      await syncCreRegistration("create");
      setCreUpdateMessage("Sepolia LINK fee confirmed. CRE created.");
      setConfirmedFeeTxHash(null);
    } catch (error) {
      console.error("Failed to create CRE:", error);
      setCreUpdateMessage(
        feeHash
          ? "LINK fee confirmed, but CRE creation failed. Retry Create CRE to reuse the confirmed fee."
          : "Failed to pay the LINK fee or create CRE.",
      );
    } finally {
      setCreateCreStage(null);
      setCreatingCre(false);
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
              Tune protection parameters, pay the on-chain LINK fee, then create
              your off-chain CRE workflow.
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
                  {creData?.queuePriority && (
                    <div className="card-inset px-3 py-2">
                      <p className="text-[10px] uppercase tracking-widest text-[#c7f36b]">
                        Queue Priority
                      </p>
                      <p className="mt-0.5 text-xs text-white">
                        {formatQueuePriority(creData.queuePriority)}
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
                    disabled={updatingCre || creatingCre}
                    className="inline-flex items-center justify-center rounded-lg border border-[#c7f36b]/30 bg-[#c7f36b]/10 px-3 py-1.5 text-xs font-semibold text-[#b5e86f] transition hover:bg-[#c7f36b]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Update CRE
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-white">
                  No CRE workflow registered yet.
                </p>
                <p className="text-xs text-[#a9b2ab]">
                  Complete these steps to create a new CRE workflow.
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-[#c7f36b]">
                  <li>Review and tune your protection parameters.</li>
                  <li>
                    Deposit 0.5 LINK as the on-chain fee to deploy CRE. Use the{" "}
                    Sepolia LINK token at{" "}
                    <span className="inline-flex max-w-full items-center gap-2 align-middle">
                      <code className="max-w-[min(56vw,520px)] overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-[#191f1b] px-2 py-1 font-mono text-[11px] text-[#f1f4ef] sm:text-xs">
                        {LINK_TOKEN_ADDRESS}
                      </code>
                      <Button
                        type="button"
                        variant={copiedTokenAddress ? "default" : "outline"}
                        size="xs"
                        onClick={() => void copyLinkTokenAddress()}
                        aria-label={
                          copiedTokenAddress
                            ? "LINK token address copied"
                            : "Copy LINK token address"
                        }
                        title={
                          copiedTokenAddress
                            ? "LINK token address copied"
                            : "Copy LINK token address"
                        }
                        className={
                          copiedTokenAddress
                            ? "shrink-0 min-w-[84px]"
                            : "shrink-0 min-w-[84px] border-[#3d4d43] bg-[#171d19] text-[#eef5df] hover:bg-[#202722]"
                        }
                      >
                        {copiedTokenAddress ? (
                          <>
                            <Check className="size-3.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" />
                            Copy
                          </>
                        )}
                      </Button>
                    </span>
                  </li>
                  <li>
                    Click <code>Create CRE</code> to submit and create the
                    off-chain workflow.
                  </li>
                </ol>
              </div>
            )}

            {creUpdateMessage && hasCreRegistration && (
              <p className="text-xs text-[#b5e86f]">{creUpdateMessage}</p>
            )}
          </section>
        )}

        {!hasCreRegistration && (
          <>
            <ParametersStep
              config={protectionConfig}
              onChange={setProtectionConfig}
              budgetCapUsd={budgetCapUsd}
              onBudgetCapUsdChange={setBudgetCapUsd}
              queuePriority={queuePriority}
              onQueuePriorityChange={setQueuePriority}
            />

            <section className="card p-4 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#c7f36b]">
                    Create CRE Workflow
                  </p>
                  <p className="mt-1 text-xs text-[#a9b2ab]">
                    Use the tuned protection parameters, confirm the 0.5 LINK
                    on-chain fee payment, then create your first off-chain CRE
                    workflow registration.
                  </p>
                </div>
                <span className="tag">Draft</span>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="card-inset px-3 py-2">
                  <p className="text-[10px] uppercase tracking-widest text-[#c7f36b]">
                    HF Threshold
                  </p>
                  <p className="mt-0.5 text-xs text-white">
                    {protectionConfig.threshold.toFixed(2)}
                  </p>
                </div>
                <div className="card-inset px-3 py-2">
                  <p className="text-[10px] uppercase tracking-widest text-[#c7f36b]">
                    Daily Cap
                  </p>
                  <p className="mt-0.5 text-xs text-white">
                    ${Math.round(budgetCapUsd).toLocaleString()} USD
                  </p>
                  <p className="text-[10px] text-[#a9b2ab]">
                    Max $20,000 / day
                  </p>
                </div>
                <div className="card-inset px-3 py-2">
                  <p className="text-[10px] uppercase tracking-widest text-[#c7f36b]">
                    Queue Priority
                  </p>
                  <p className="mt-0.5 text-xs text-white">
                    {formatQueuePriority(queuePriority)}
                  </p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="card-inset px-3 py-2">
                  <p className="text-[10px] uppercase tracking-widest text-[#c7f36b]">
                    LINK Token (Sepolia)
                  </p>
                  <p className="mt-0.5 text-xs text-white">
                    {CRE_DEPLOY_FEE_LINK} LINK
                  </p>
                  <p className="mt-1 text-[10px] text-[#a9b2ab] break-all">
                    {LINK_TOKEN_ADDRESS}
                  </p>
                </div>
                <div className="card-inset px-3 py-2">
                  <p className="text-[10px] uppercase tracking-widest text-[#c7f36b]">
                    Fee Receiver
                  </p>
                  <p className="mt-0.5 text-[10px] text-white break-all">
                    0x28b94B571f8F3FEB444075B65054FFba4e10D49a
                  </p>
                  <p className="mt-1 text-[10px] text-[#a9b2ab]">
                    Pay on-chain first, then create the off-chain CRE.
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-[#a9b2ab]">
                Budget cap sent to CRE: $
                {Math.round(budgetCapUsd).toLocaleString()} USD
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void onCreateCre()}
                  disabled={
                    creatingCre || updatingCre || !address || !connectedAddress
                  }
                  className="inline-flex items-center justify-center rounded-lg border border-[#c7f36b]/30 bg-[#c7f36b]/10 px-3 py-1.5 text-xs font-semibold text-[#b5e86f] transition hover:bg-[#c7f36b]/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingCre
                    ? createCreStage === "fee"
                      ? "Paying LINK Fee..."
                      : "Creating CRE..."
                    : "Create CRE Workflow"}
                </button>
                {creUpdateMessage && (
                  <p className="text-xs text-[#b5e86f]">{creUpdateMessage}</p>
                )}
              </div>
            </section>
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
                    Daily Cap (USD)
                  </p>
                  <p className="text-sm font-bold tabular-nums text-white">
                    ${Math.round(budgetCapUsd).toLocaleString()}
                  </p>
                </div>
                <Slider
                  min={1_000}
                  max={20_000}
                  step={500}
                  value={[budgetCapUsd]}
                  onValueChange={(vals) => setBudgetCapUsd(vals[0])}
                  className="w-full"
                />
                <p className="text-[11px] text-[#a9b2ab]">
                  Max allowed daily budget is $20,000.
                </p>
              </div>

              <div className="card-inset p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-[#b5e86f]">
                    Queue Priority
                  </p>
                  <p className="text-sm font-bold text-white">
                    {formatQueuePriority(queuePriority)}
                  </p>
                </div>
                <Select
                  value={queuePriority}
                  onValueChange={(value) =>
                    setQueuePriority(
                      value as UpsertUserCreRegistrationDtoQueuePriority,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select queue priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value={
                        UpsertUserCreRegistrationDtoQueuePriority.SAME_CHAIN_FIRST
                      }
                    >
                      Same-chain first
                    </SelectItem>
                    <SelectItem
                      value={
                        UpsertUserCreRegistrationDtoQueuePriority.CROSS_CHAIN_FIRST
                      }
                    >
                      Cross-chain first
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-[#a9b2ab]">
                  {queuePriority ===
                  UpsertUserCreRegistrationDtoQueuePriority.SAME_CHAIN_FIRST
                    ? "Prefer same-chain execution before cross-chain routes."
                    : "Prefer cross-chain execution before same-chain routes."}
                </p>
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
                disabled={updatingCre || creatingCre}
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
