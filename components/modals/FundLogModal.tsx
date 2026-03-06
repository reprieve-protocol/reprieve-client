"use client";

import { useEffect, useState } from "react";
import {
  X,
  Droplets,
  DatabaseZap,
  Cpu,
  Globe,
  Link2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Wallet,
  Hash,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FundLogOperation {
  blockNumber?: string;
  mintedAmountRaw?: string;
  targetBalanceRaw?: string;
  fundedWei?: string;
  requestedWei?: string;
  adjustedByCap?: boolean;
  faucetRemainingBeforeWei?: string;
  targetBalanceWei?: string;
  action?: string;
  label?: string;
  type?: string;
  chain?: string;
  token?: string;
  reason?: string;
  txHash?: string;
}

export interface FundLogResponse {
  runId?: number;
  error?: string;
  status?: string;
  operationCount?: number;
  demoWalletAddress?: string;
  nativeFundingCapsWei?: Record<string, string>;
  nativeFundingTotalsWei?: Record<string, string>;
  operations?: FundLogOperation[];
}

interface FundLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  fundLog: FundLogResponse | null;
}

const FUNDING_STEPS = [
  "Preparing funding plan...",
  "Broadcasting transactions...",
  "Waiting block confirmations...",
  "Finalizing wallet balances...",
] as const;

const CHAIN_EXPLORERS: Record<string, string> = {
  "ethereum-sepolia": "https://sepolia.etherscan.io/tx/",
  "base-sepolia": "https://sepolia.basescan.org/tx/",
};

function getExplorerUrl(chain?: string, txHash?: string): string | null {
  if (!chain || !txHash) return null;
  const baseUrl = CHAIN_EXPLORERS[chain];
  if (!baseUrl) return null;
  return `${baseUrl}${txHash}`;
}

function formatChainLabel(chain?: string): string {
  if (!chain) return "Unknown chain";
  return chain
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function shortHex(value?: string, start = 8, end = 6): string {
  if (!value) return "-";
  if (value.length <= start + end) return value;
  return `${value.slice(0, start)}...${value.slice(-end)}`;
}

function formatUnitsString(
  rawValue?: string,
  decimals = 18,
  precision = 4,
): string {
  if (!rawValue) return "-";
  try {
    const value = BigInt(rawValue);
    const base = BigInt(10) ** BigInt(decimals);
    const whole = value / base;
    const fraction = value % base;
    const trimmedFraction = fraction
      .toString()
      .padStart(decimals, "0")
      .slice(0, precision)
      .replace(/0+$/, "");
    return trimmedFraction.length > 0
      ? `${whole.toLocaleString()}.${trimmedFraction}`
      : whole.toLocaleString();
  } catch {
    return rawValue;
  }
}

export function FundLogModal({ isOpen, onClose, fundLog }: FundLogModalProps) {
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (!isOpen || fundLog) return;

    const interval = window.setInterval(() => {
      setLoadingStep((step) =>
        step < FUNDING_STEPS.length - 1 ? step + 1 : step,
      );
    }, 1200);

    return () => window.clearInterval(interval);
  }, [fundLog, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-[#2d3932] bg-[#131815] shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#2d3932] px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#b5e86f]/10 border border-[#b5e86f]/20">
              <Droplets className="size-4 text-[#b5e86f]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Funding Operations
              </h3>
              <p className="text-xs text-[#c7f36b]">
                Demo wallet top-up details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#a9b2ab] hover:bg-[#2d3932] hover:text-white transition"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto min-h-[150px] flex-1">
          {!fundLog ? (
            <div className="relative flex flex-col items-center justify-center h-full text-[#a9b2ab] gap-5 py-16 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#1b231d]/40 to-transparent" />
              <div className="absolute -top-20 -left-20 size-52 rounded-full bg-[#36423b]/10 blur-[90px]" />
              <div className="absolute -bottom-20 -right-20 size-52 rounded-full bg-[#b5e86f]/10 blur-[90px]" />

              <div className="relative flex items-center justify-center size-28">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#36423b]/40 animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-[#b5e86f] border-l-[#b5e86f] animate-[spin_2.5s_linear_infinite]" />
                <div className="absolute inset-8 rounded-full border border-[#36423b]/70 bg-[#1b231d]/80 shadow-[0_0_30px_rgba(181,232,111,0.2)] flex items-center justify-center">
                  <DatabaseZap className="size-5 text-[#b5e86f] animate-pulse" />
                </div>

                <div
                  className="absolute top-1 right-3 size-6 bg-[#101410] rounded-full border border-[#36423b] flex items-center justify-center animate-bounce"
                  style={{ animationDelay: "120ms" }}
                >
                  <Globe className="size-3 text-[#9fb4a6]" />
                </div>
                <div
                  className="absolute bottom-3 left-1 size-6 bg-[#101410] rounded-full border border-[#36423b] flex items-center justify-center animate-bounce"
                  style={{ animationDelay: "280ms" }}
                >
                  <Cpu className="size-3 text-[#9fb4a6]" />
                </div>
                <div
                  className="absolute bottom-4 right-1 size-6 bg-[#101410] rounded-full border border-[#36423b] flex items-center justify-center animate-bounce"
                  style={{ animationDelay: "620ms" }}
                >
                  <Link2 className="size-3 text-[#9fb4a6]" />
                </div>
              </div>

              <div className="relative z-10 w-full max-w-sm text-center">
                <p className="text-sm font-medium text-[#d8e3db]">
                  Executing funding operations on-chain
                </p>
                <p className="mt-1 text-xs text-[#8fa195]">
                  This usually takes about 1 minute. Please keep this window
                  open while the transactions are being confirmed.
                </p>
                <div className="mt-2 h-5 overflow-hidden relative">
                  {FUNDING_STEPS.map((text, index) => (
                    <p
                      key={text}
                      className={cn(
                        "absolute inset-0 w-full text-xs font-mono transition-all duration-400 ease-out",
                        index === loadingStep
                          ? "opacity-100 translate-y-0 text-[#b5e86f]"
                          : index < loadingStep
                            ? "opacity-0 -translate-y-4 text-[#5d6c62]"
                            : "opacity-0 translate-y-4 text-[#5d6c62]",
                      )}
                    >
                      {text}
                    </p>
                  ))}
                </div>

                <div className="mt-4 h-1 w-full rounded-full bg-[#1b231d] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#c7f36b_0%,#b5e86f_100%)] transition-all duration-700 ease-out"
                    style={{
                      width: `${((loadingStep + 1) / FUNDING_STEPS.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : fundLog?.error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-400 gap-3 py-10">
              <XCircle className="size-10" />
              <p className="text-sm font-medium">Failed to fund wallet</p>
              <pre className="mt-2 text-[10px] bg-red-500/10 p-3 rounded-lg border border-red-500/20 max-w-full overflow-x-auto">
                {fundLog.error}
              </pre>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-lg border border-[#2d3932] bg-[#0b0f0d] p-3 space-y-1">
                  <p className="text-[10px] font-medium uppercase text-[#c7f36b] mb-1">
                    Status
                  </p>
                  <div className="flex items-center gap-1.5">
                    {fundLog.status === "success" ? (
                      <CheckCircle2 className="size-3.5 text-[#b5e86f]" />
                    ) : (
                      <XCircle className="size-3.5 text-rose-400" />
                    )}
                    <span
                      className={cn(
                        "text-sm font-semibold capitalize",
                        fundLog.status === "success"
                          ? "text-[#b5e86f]"
                          : "text-rose-400",
                      )}
                    >
                      {fundLog.status}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-[#2d3932] bg-[#0b0f0d] p-3 space-y-1">
                  <p className="text-[10px] font-medium uppercase text-[#c7f36b] mb-1">
                    Run ID
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Hash className="size-3.5 text-[#ccd7cf]" />
                    <p className="text-sm font-semibold text-white">
                      {fundLog.runId ?? "-"}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-[#2d3932] bg-[#0b0f0d] p-3 space-y-1">
                  <p className="text-[10px] font-medium uppercase text-[#c7f36b] mb-1">
                    Operations
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {fundLog.operationCount}
                  </p>
                </div>
                <div className="rounded-lg border border-[#2d3932] bg-[#0b0f0d] p-3 md:col-span-2">
                  <p className="text-[10px] font-medium uppercase text-[#c7f36b] mb-1">
                    Target Wallet
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Wallet className="size-3.5 text-[#ccd7cf]" />
                    <span className="text-sm font-mono text-[#e7ece6]">
                      {shortHex(fundLog.demoWalletAddress, 10, 8)}
                    </span>
                  </div>
                </div>
              </div>

              {((fundLog.nativeFundingCapsWei &&
                Object.keys(fundLog.nativeFundingCapsWei).length > 0) ||
                (fundLog.nativeFundingTotalsWei &&
                  Object.keys(fundLog.nativeFundingTotalsWei).length > 0)) && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#c7f36b] border-b border-[#2d3932] pb-2">
                    Native Funding Overview
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {Array.from(
                      new Set([
                        ...Object.keys(fundLog.nativeFundingCapsWei ?? {}),
                        ...Object.keys(fundLog.nativeFundingTotalsWei ?? {}),
                      ]),
                    ).map((chain) => {
                      const cap = fundLog.nativeFundingCapsWei?.[chain];
                      const total = fundLog.nativeFundingTotalsWei?.[chain];
                      return (
                        <div
                          key={chain}
                          className="rounded-lg border border-[#2d3932] bg-[#0b0f0d] p-3"
                        >
                          <p className="text-[11px] font-semibold text-[#c7f36b]">
                            {formatChainLabel(chain)}
                          </p>
                          <p className="mt-1 text-xs text-[#a9b2ab]">
                            Funded:{" "}
                            <span className="text-[#e7ece6]">
                              {formatUnitsString(total, 18, 6)} ETH
                            </span>
                          </p>
                          <p className="mt-0.5 text-xs text-[#a9b2ab]">
                            Cap:{" "}
                            <span className="text-[#e7ece6]">
                              {formatUnitsString(cap, 18, 6)} ETH
                            </span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#c7f36b] border-b border-[#2d3932] pb-2">
                  Operation Details
                </h4>
                <div className="grid gap-3">
                  {(fundLog.operations || []).map((op, i) => {
                    const isSuccess =
                      op.action === "minted" || op.action === "funded";
                    const isSkipped = op.action === "skipped";
                    const isBlocked =
                      op.action === "blocked" || op.action === "failed";
                    const explorerUrl = getExplorerUrl(op.chain, op.txHash);

                    return (
                      <div
                        key={i}
                        className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-[#2d3932] bg-[#0b0f0d]/60 transition hover:bg-[#131815]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {isSuccess && (
                                <CheckCircle2 className="size-4 text-[#b5e86f]" />
                              )}
                              {isSkipped && (
                                <Info className="size-4 text-[#c7f36b]" />
                              )}
                              {isBlocked && (
                                <XCircle className="size-4 text-rose-400" />
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-white">
                                  {op.label || "Operation"}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#2d3932] text-[#ccd7cf] uppercase tracking-wider font-semibold">
                                  {op.type || "unknown"}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                <p className="text-[#c7f36b] font-mono">
                                  {formatChainLabel(op.chain)}
                                </p>
                                {op.blockNumber && (
                                  <p className="text-[#a9b2ab]">
                                    Block:{" "}
                                    <span className="text-[#e7ece6]">
                                      {Number(op.blockNumber).toLocaleString()}
                                    </span>
                                  </p>
                                )}
                                {op.type === "native-fund" &&
                                  op.adjustedByCap && (
                                    <span className="rounded-md bg-amber-300/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                                      Cap Applied
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md",
                              isSuccess && "bg-[#b5e86f]/10 text-[#b5e86f]",
                              isSkipped && "bg-[#2d3932] text-[#ccd7cf]",
                              isBlocked && "bg-rose-500/10 text-rose-400",
                            )}
                          >
                            {op.action || ""}
                          </span>
                        </div>

                        {op.reason && (
                          <div className="ml-7 text-xs text-rose-400/90 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                            {op.reason}
                          </div>
                        )}

                        {op.type === "native-fund" && (
                          <div className="ml-7 grid gap-1 text-[11px] text-[#a9b2ab]">
                            {op.requestedWei && (
                              <p>
                                Requested:{" "}
                                <span className="text-[#dde6de]">
                                  {formatUnitsString(op.requestedWei, 18, 6)}{" "}
                                  ETH
                                </span>
                              </p>
                            )}
                            {op.faucetRemainingBeforeWei && (
                              <p>
                                Faucet remaining before:{" "}
                                <span className="text-[#dde6de]">
                                  {formatUnitsString(
                                    op.faucetRemainingBeforeWei,
                                    18,
                                    6,
                                  )}{" "}
                                  ETH
                                </span>
                              </p>
                            )}
                          </div>
                        )}

                        {explorerUrl && (
                          <div className="ml-7">
                            <a
                              href={explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#ccd7cf] hover:text-[#b5e86f] hover:underline"
                            >
                              View transaction ({shortHex(op.txHash, 10, 8)}){" "}
                              <ExternalLink className="size-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
