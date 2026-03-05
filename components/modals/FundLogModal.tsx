"use client";

import {
  X,
  Droplets,
  CheckCircle2,
  XCircle,
  Info,
  ExternalLink,
  Wallet,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FundLogOperation {
  action?: string;
  label?: string;
  type?: string;
  chain?: string;
  reason?: string;
  txHash?: string;
}

export interface FundLogResponse {
  error?: string;
  status?: string;
  operationCount?: number;
  demoWalletAddress?: string;
  operations?: FundLogOperation[];
}

interface FundLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  fundLog: FundLogResponse | null;
}

export function FundLogModal({ isOpen, onClose, fundLog }: FundLogModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-xl border border-[#2d3932] bg-[#131815] shadow-2xl flex flex-col max-h-[85vh]">
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
            <div className="flex flex-col items-center justify-center h-full text-[#a9b2ab] gap-4 py-16">
              <Loader2 className="size-8 animate-spin text-[#b5e86f]" />
              <p className="text-sm font-medium animate-pulse">
                Executing funding operations on-chain...
              </p>
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
              {/* Summary Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-lg border border-[#2d3932] bg-[#0b0f0d] p-3">
                  <p className="text-[10px] font-medium uppercase text-[#c7f36b] mb-1">
                    Status
                  </p>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#b5e86f]" />
                    <span className="text-sm font-semibold text-[#b5e86f] capitalize">
                      {fundLog.status}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-[#2d3932] bg-[#0b0f0d] p-3">
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
                      {fundLog.demoWalletAddress?.slice(0, 8)}...
                      {fundLog.demoWalletAddress?.slice(-6)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Operations List */}
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

                    const getExplorerUrl = (chain: string, txHash: string) => {
                      if (chain === "ethereum-sepolia")
                        return `https://sepolia.etherscan.io/tx/${txHash}`;
                      if (chain === "base-sepolia")
                        return `https://sepolia.basescan.org/tx/${txHash}`;
                      return "#";
                    };

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
                                  {op.label || ""}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#2d3932] text-[#ccd7cf] uppercase tracking-wider font-semibold">
                                  {op.type || ""}
                                </span>
                              </div>
                              <p className="text-xs text-[#c7f36b] font-mono">
                                {op.chain || ""}
                              </p>
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

                        {op.txHash && op.chain && (
                          <div className="ml-7">
                            <a
                              href={getExplorerUrl(op.chain, op.txHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#ccd7cf] hover:text-[#b5e86f] hover:underline"
                            >
                              View Transaction{" "}
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
