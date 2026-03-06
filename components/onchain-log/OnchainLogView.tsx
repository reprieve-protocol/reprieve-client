"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDemoWallet } from "@/lib/state/demo-wallet-context";
import { cn } from "@/lib/utils";
import { useRescuesControllerListRescues } from "@/src/services/queries";
import {
  formatChainLabel,
  formatDateTime,
  formatHash,
  formatMode,
  formatRelative,
  getStatusLabel,
  getStatusTone,
  PAGE_SIZE,
  RescueListResponse,
  RescueStatus,
  STATUS_FILTERS,
  SummaryCard,
} from "./onchain-log-utils";

export function OnchainLogView() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | RescueStatus>("all");
  const { demoWalletAddress } = useDemoWallet();

  const listQuery = useRescuesControllerListRescues(
    {
      page,
      limit: PAGE_SIZE,
      status: statusFilter === "all" ? undefined : statusFilter,
      user: demoWalletAddress,
    },
    {
      query: {
        enabled: !!demoWalletAddress,
        refetchInterval: (query) => {
          const data = query.state.data as RescueListResponse | undefined;
          return data?.items.some((item) => item.status === "in_progress")
            ? 5000
            : false;
        },
      },
    },
  );

  const listResponse = listQuery.data as RescueListResponse | undefined;
  const rescues = useMemo(() => listResponse?.items ?? [], [listResponse]);
  const totalPages = Math.max(
    1,
    Math.ceil((listResponse?.total ?? 0) / (listResponse?.limit ?? PAGE_SIZE)),
  );

  const summary = useMemo(() => {
    const completed = rescues.filter(
      (item) => item.status === "completed",
    ).length;
    const pending = rescues.filter(
      (item) => item.status === "in_progress",
    ).length;
    const crossChain = rescues.filter((item) => item.destinationChainId).length;

    return { completed, pending, crossChain };
  }, [rescues]);

  return (
    <div className="space-y-6 animate-fade-up">
      <section className="relative overflow-hidden rounded-[28px] border border-[#313c35] bg-[radial-gradient(circle_at_top_left,rgba(199,243,107,0.09),transparent_32%),linear-gradient(180deg,rgba(19,24,21,0.98),rgba(13,16,14,0.98))] p-5 shadow-[0_24px_64px_-44px_rgba(0,0,0,0.92)] md:p-6">
        <div className="absolute inset-y-0 right-0 hidden w-[28%] bg-[linear-gradient(120deg,transparent,rgba(199,243,107,0.035))] md:block" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <div className="tag">Immutable rescue telemetry</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Rescue executions
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#9ba69e]">
              Browse rescue runs for the connected wallet. Open an execution in
              its own page when you need the full event detail and payloads.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as "all" | RescueStatus);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => {
                void listQuery.refetch();
              }}
            >
              <RefreshCw
                className={cn(
                  "size-3.5",
                  listQuery.isFetching && "animate-spin",
                )}
              />
              Refresh
            </Button>
          </div>
        </div>

        <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
          <SummaryCard
            icon="indexed"
            label="Indexed executions"
            value={`${listResponse?.total ?? 0}`}
            meta={`Page ${listResponse?.page ?? page} of ${totalPages}`}
          />
          <SummaryCard
            icon="pending"
            label="Pending now"
            value={`${summary.pending}`}
            meta="Auto-refresh while rescues are active"
          />
          <SummaryCard
            icon="routes"
            label="Cross-chain routes"
            value={`${summary.crossChain}`}
            meta={`${summary.completed} completed in current result set`}
          />
        </div>
      </section>

      {listQuery.isLoading ? (
        <div className="flex items-center gap-3 text-sm text-[#a9b2ab]">
          <span className="size-4 animate-spin rounded-full border-2 border-[#2d3932] border-t-[#c7f36b]" />
          Loading onchain rescue logs...
        </div>
      ) : listQuery.error ? (
        <div className="card p-5 text-sm text-red-400">
          Failed to load rescue logs.
        </div>
      ) : rescues.length === 0 ? (
        <EmptyState
          title="No rescue executions found"
          description="When a rescue is triggered, the execution record will appear here. Detail opens on a dedicated page after you select an execution."
        />
      ) : (
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#273029] px-5 py-4">
            <div>
              <p className="text-base font-semibold text-white">
                Rescue executions
              </p>
              <p className="mt-1 text-xs text-[#8c9890]">
                {listResponse?.total ?? 0} indexed records. Click a row to open
                the dedicated detail page.
              </p>
            </div>
            <StatusBadge
              label={`${rescues.length} rows`}
              tone="neutral"
              pulse={listQuery.isFetching}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-[#202822] bg-[#121714]/80 text-[11px] uppercase tracking-[0.22em] text-[#7f8a82]">
                <tr>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Execution</th>
                  <th className="px-5 py-3 font-medium">Wallet</th>
                  <th className="px-5 py-3 font-medium">Route</th>
                  <th className="px-5 py-3 font-medium">Mode</th>
                  <th className="px-5 py-3 font-medium">Last event</th>
                  <th className="px-5 py-3 text-right font-medium">Open</th>
                </tr>
              </thead>
              <tbody>
                {rescues.map((rescue) => (
                  <tr
                    key={rescue.execId}
                    className="cursor-pointer border-b border-[#1d241f] align-middle transition-colors hover:bg-[#171d19]/90"
                    onClick={() => router.push(`/onchain-log/${rescue.execId}`)}
                  >
                    <td className="px-5 py-4 align-middle">
                      <StatusBadge
                        label={getStatusLabel(rescue.status)}
                        tone={getStatusTone(rescue.status)}
                        pulse={rescue.status === "in_progress"}
                      />
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs text-white">
                          {formatHash(rescue.execId, 10, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <span className="font-mono text-xs text-[#cdd6ce]">
                        {formatHash(rescue.userAddress, 8, 6)}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="text-sm text-[#dfe7df]">
                        {formatChainLabel(rescue.sourceChainId)} {"->"}{" "}
                        {formatChainLabel(rescue.destinationChainId)}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle text-sm text-[#dfe7df]">
                      {formatMode(rescue.mode)}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="text-[#dfe7df]">
                          {formatDateTime(rescue.lastEventAt)}
                        </span>
                        <span className="text-[#6f7a73]">
                          {formatRelative(rescue.lastEventAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-[#dfe7df]"
                        onClick={(event) => {
                          event.stopPropagation();
                          router.push(`/onchain-log/${rescue.execId}`);
                        }}
                      >
                        Open
                        <ExternalLink className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#273029] px-5 py-4">
            <p className="text-xs text-[#8c9890]">
              Showing page {listResponse?.page ?? page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft className="size-3.5" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                Next
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
