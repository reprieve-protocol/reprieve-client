"use client";

import { Wallet } from "lucide-react";
import { formatUsd } from "@/lib/domain/calculations";
import { cn } from "@/lib/utils";

function shortAddress(value?: string | null): string {
  if (!value) {
    return "Wallet syncing";
  }

  if (value.length <= 14) {
    return value;
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function DashboardPortfolioSummary({
  totalCollateralUsd,
  totalDebtUsd,
  walletAddress,
}: {
  totalCollateralUsd: number;
  totalDebtUsd: number;
  walletAddress?: string | null;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-[#c7f36b]">
            Current User Portfolio
          </p>
          <p className="mt-1 text-sm text-[#8c9890]">
            Live exposure for the wallet currently connected to Reprieve.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-[#3c4a42] bg-[#121815]/90 px-3 py-2 text-xs text-[#d8e3db] shadow-[0_10px_30px_-22px_rgba(0,0,0,0.9)]">
          <span className="flex size-7 items-center justify-center rounded-full bg-[#c7f36b]/12 ring-1 ring-[#c7f36b]/20">
            <Wallet className="size-3.5 text-[#d6f57f]" />
          </span>
          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#d8e3db]">
              Your wallet
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div
          className={cn(
            "card relative overflow-hidden border-[#c7f36b]/40 p-6",
            "shadow-[0_26px_44px_-34px_rgba(0,0,0,0.86)]",
          )}
        >
          <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-[linear-gradient(180deg,#d6f57f_0%,#7fdc73_100%)]" />
          <div className="absolute -left-8 top-4 h-24 w-24 rounded-full bg-[#c7f36b]/10 blur-3xl" />
          <p className="relative text-[11px] font-medium uppercase tracking-[0.2em] text-[#97a48f]">
            Your Total Collateral
          </p>
          <p className="relative mt-3 text-4xl font-bold tabular-nums tracking-tight text-[#eef3ea]">
            {formatUsd(totalCollateralUsd)}
          </p>
          <p className="relative mt-3 text-xs text-[#8c9890]">
            Capital currently backing this user&apos;s active positions.
          </p>
        </div>

        <div
          className={cn(
            "card relative overflow-hidden border-red-500/30 p-6",
            "shadow-[0_26px_44px_-34px_rgba(0,0,0,0.86)]",
          )}
        >
          <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-[linear-gradient(180deg,#ff8b95_0%,#ff6178_100%)]" />
          <div className="absolute -right-6 top-3 h-24 w-24 rounded-full bg-red-500/10 blur-3xl" />
          <p className="relative text-[11px] font-medium uppercase tracking-[0.2em] text-[#97a48f]">
            Your Total Debt
          </p>
          <p className="relative mt-3 text-4xl font-bold tabular-nums tracking-tight text-[#ff7b86]">
            {formatUsd(totalDebtUsd)}
          </p>
          <p className="relative mt-3 text-xs text-[#8c9890]">
            Outstanding borrow exposure for the current wallet.
          </p>
        </div>
      </div>
    </section>
  );
}
