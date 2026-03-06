"use client";

import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import Image from "next/image";
import { Activity, Shield } from "lucide-react";
import { ORACLE_PRICE_TOKENS, fetchOraclePrice } from "@/lib/oracle-prices";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OraclePricesSectionProps {
  isEthPriceShockEnabled?: boolean;
  isEthPriceShockPending?: boolean;
  onStartEthPriceShock?: () => void;
  onResetEthPriceShock?: () => void;
  simulatedEthPriceUsd?: number | null;
}

function formatTickerPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1000 ? 2 : 0,
    maximumFractionDigits: value < 1000 ? 2 : 0,
  }).format(value);
}

export function OraclePricesSection({
  isEthPriceShockEnabled = false,
  isEthPriceShockPending = false,
  onStartEthPriceShock,
  onResetEthPriceShock,
  simulatedEthPriceUsd = null,
}: OraclePricesSectionProps) {
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const priceQueries = useQueries({
    queries: ORACLE_PRICE_TOKENS.map((token) => ({
      queryKey: ["oracle-prices", token.chainKey, token.asset ?? token.id],
      queryFn: () => fetchOraclePrice(token),
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    })),
  });

  const isLoading = priceQueries.some((query) => query.isLoading);
  const tickerItems = ORACLE_PRICE_TOKENS.map((token, index) => {
    const price = priceQueries[index]?.data;

    return {
      id: price?.id ?? token.id,
      symbol: price?.symbol ?? token.symbol,
      logoSrc: price?.logoSrc ?? token.logoSrc,
      priceUsd:
        isEthPriceShockEnabled &&
        token.symbol === "ETH" &&
        simulatedEthPriceUsd !== null
          ? simulatedEthPriceUsd
          : (price?.priceUsd ?? token.fallbackPriceUsd),
    };
  });

  const repeatedTickerItems = Array.from(
    { length: 6 },
    () => tickerItems,
  ).flat();
  const marqueeItems = [...repeatedTickerItems, ...repeatedTickerItems];

  return (
    <section className="overflow-hidden rounded-xl border border-[#2d3932] ">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#202923] bg-[#0e1411] px-4 py-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#c7f36b]">
            Market Inputs
          </p>
          <p className="mt-1 text-sm text-[#8c9890]">
            Run the CRE workflow against a simulated 40% ETH drawdown.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isEthPriceShockEnabled && simulatedEthPriceUsd !== null ? (
            <span className="rounded-full border border-[#8e3b43]/60 bg-[#2a1418] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[#ff9aa5]">
              Simulated ETH {formatTickerPrice(simulatedEthPriceUsd)}
            </span>
          ) : null}

          {!isEthPriceShockEnabled && onStartEthPriceShock ? (
            <button
              type="button"
              onClick={() => setIsInstructionOpen(true)}
              disabled={isEthPriceShockPending}
              className={`rounded-full border border-[#c7f36b]/40 bg-[#c7f36b]/10 px-3 py-1.5 text-xs font-medium text-[#d6f57f] transition hover:bg-[#c7f36b]/15 ${isEthPriceShockPending ? "cursor-wait opacity-70" : ""}`}
            >
              {isEthPriceShockPending
                ? "Syncing price..."
                : "Simulate CRE Workflow Run"}
            </button>
          ) : null}

          {isEthPriceShockEnabled && onResetEthPriceShock ? (
            <button
              type="button"
              onClick={onResetEthPriceShock}
              className="rounded-full border border-[#ff7b86]/60 bg-[#39181d] px-3 py-1.5 text-xs font-medium text-[#ffd5d9] transition hover:bg-[#431c23]"
            >
              Reset Price Simulation
            </button>
          ) : null}
        </div>
      </div>

      <div className="ticker-marquee relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-[linear-gradient(90deg,#0b0f0d_0%,rgba(11,15,13,0)_100%)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-[linear-gradient(270deg,#0b0f0d_0%,rgba(11,15,13,0)_100%)]" />

        <div className="ticker-track flex w-max">
          {marqueeItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="flex shrink-0 items-center gap-3 border-r border-white/6 px-4 py-2.5"
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#131815]">
                <Image
                  src={item.logoSrc}
                  alt={item.symbol}
                  width={24}
                  height={24}
                  unoptimized
                  className="h-6 w-6 object-contain"
                />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold tracking-tight text-[#f4f7f2]">
                  {item.symbol}
                </span>
                <span className="text-sm font-semibold text-[#d9e2d2]">
                  {formatTickerPrice(item.priceUsd)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="pointer-events-none absolute inset-y-0 right-3 z-20 flex items-center">
            <span className="rounded-full border border-[#37453e] bg-[#131815]/90 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-[#8c9890]">
              Updating
            </span>
          </div>
        ) : null}
      </div>

      <Dialog open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
        <DialogContent className="p-0">
          <DialogHeader className="border-b border-[#243029] px-5 py-4 text-left">
            <div className="flex items-start gap-3 pr-10">
              <div className="mt-0.5 flex size-12 min-w-[48px] min-h-[48px] items-center justify-center rounded-xl border border-[#ff7b86]/20 bg-[#3a191f]">
                <Shield className="size-5 text-[#ff9aa5]" strokeWidth={2.2} />
              </div>
              <div>
                <DialogTitle>Simulate CRE Workflow Run</DialogTitle>
                <DialogDescription className="mt-1">
                  This demo artificially drops ETH by 40% to trigger the CRE
                  protection flow and visualize how the workflow reacts.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto px-5 py-5">
            <div className="rounded-xl border border-[#2b352f] bg-[#0d1210] p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#c7f36b]">
                What This Does
              </p>
              <div className="mt-3 space-y-2 text-sm text-[#cbd5ce]">
                <p>
                  It sends simulated ETH price overrides into both
                  `risk-snapshot` and `simulate-api-guard`.
                </p>
                <p>
                  It is only for visualization. No real market price is changed
                  and no real rescue is executed by this popup.
                </p>
                <p>
                  The dashboard then shows how the CRE trigger, decisioning
                  flow, and rescue animation respond to the stressed market.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-[#2b352f] bg-[#111713] p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <Activity className="size-4 text-[#c7f36b]" />
                  Trigger Condition
                </div>
                <p className="mt-2 text-sm text-[#9aa79f]">
                  Simulated ETH dump of 40% across Sepolia feeds to push health
                  factors lower.
                </p>
              </div>

              <div className="rounded-xl border border-[#2b352f] bg-[#111713] p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <Shield className="size-4 text-[#ff9aa5]" strokeWidth={2.2} />
                  Visual Output
                </div>
                <p className="mt-2 text-sm text-[#9aa79f]">
                  CRE workflow panels update so the user can see detection,
                  simulation, and rescue planning behavior.
                </p>
              </div>
            </div>

            <DialogFooter className="px-0 pb-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInstructionOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsInstructionOpen(false);
                  onStartEthPriceShock?.();
                }}
              >
                Start Simulation
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
