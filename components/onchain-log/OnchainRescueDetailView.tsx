"use client";

import {
  ArrowLeft,
  Blocks,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { getTxExplorerUrl } from "@/lib/explorer";
import { cn } from "@/lib/utils";
import {
  useRescuesControllerGetRescue,
  useRescuesControllerGetRescueEvents,
} from "@/src/services/queries";
import {
  CopyButton,
  formatChainLabel,
  formatDateTime,
  formatHash,
  formatMode,
  getEventTone,
  getStatusLabel,
  getStatusTone,
  RescueEvent,
  RescueListItem,
} from "./onchain-log-utils";

export function OnchainRescueDetailView({ execId }: { execId: string }) {
  const detailQuery = useRescuesControllerGetRescue(execId, {
    query: {
      enabled: !!execId,
      refetchInterval: (query) => {
        const data = query.state.data as RescueListItem | undefined;
        return data?.status === "in_progress" ? 5000 : false;
      },
    },
  });

  const eventsQuery = useRescuesControllerGetRescueEvents(execId, {
    query: {
      enabled: !!execId,
      refetchInterval: (query) => {
        const detail = detailQuery.data as RescueListItem | undefined;
        if (detail?.status === "in_progress") return 5000;

        const data = query.state.data as RescueEvent[] | undefined;
        return data?.length ? false : 5000;
      },
    },
  });

  const rescue = detailQuery.data as RescueListItem | undefined;
  const rescueEvents = (eventsQuery.data as RescueEvent[] | undefined) ?? [];

  return (
    <div className="space-y-6 animate-fade-up">
      <section className="relative overflow-hidden rounded-[28px] border border-[#313c35] bg-[radial-gradient(circle_at_top_left,rgba(199,243,107,0.09),transparent_34%),linear-gradient(180deg,rgba(19,24,21,0.98),rgba(13,16,14,0.98))] p-5 shadow-[0_24px_64px_-44px_rgba(0,0,0,0.92)] md:p-6">
        <div className="absolute inset-y-0 right-0 hidden w-[32%] bg-[linear-gradient(120deg,transparent,rgba(199,243,107,0.035))] md:block" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <Link
              href="/onchain-log"
              className="inline-flex items-center gap-2 text-sm text-[#a9b2ab] transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Back to rescue executions
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Rescue details
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#9ba69e]">
              Full-width execution details, proof references, and ordered onchain
              event timeline for the selected rescue.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => {
              void detailQuery.refetch();
              void eventsQuery.refetch();
            }}
          >
            <RefreshCw
              className={cn(
                "size-3.5",
                (detailQuery.isFetching || eventsQuery.isFetching) &&
                  "animate-spin",
              )}
            />
            Refresh
          </Button>
        </div>
      </section>

      {detailQuery.isLoading ? (
        <div className="flex items-center gap-3 text-sm text-[#a9b2ab]">
          <span className="size-4 animate-spin rounded-full border-2 border-[#2d3932] border-t-[#c7f36b]" />
          Loading rescue details...
        </div>
      ) : detailQuery.error ? (
        <div className="card p-5 text-sm text-red-400">
          Failed to load rescue details.
        </div>
      ) : !rescue ? (
        <EmptyState
          title="Rescue execution not found"
          description="The selected execution may be unavailable or no longer indexed."
          action={
            <Button asChild variant="outline">
              <Link href="/onchain-log">Back to rescue executions</Link>
            </Button>
          }
        />
      ) : (
        <>
          <section className="card p-5">
            <div className="flex flex-col gap-4 border-b border-[#273029] pb-5 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-white">
                    Execution overview
                  </p>
                  <StatusBadge
                    label={getStatusLabel(rescue.status)}
                    tone={getStatusTone(rescue.status)}
                    pulse={rescue.status === "in_progress"}
                  />
                </div>
                <p className="break-all font-mono text-xs text-[#dfe7df]">
                  {rescue.execId}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#8c9890]">
                  <span className="rounded-full border border-[#2f3933] px-2.5 py-1 text-[#dfe7df]">
                    {formatChainLabel(rescue.sourceChainId)} {"->"}{" "}
                    {formatChainLabel(rescue.destinationChainId)}
                  </span>
                  <span className="rounded-full border border-[#2f3933] px-2.5 py-1">
                    {formatMode(rescue.mode)}
                  </span>
                </div>
              </div>

              <CopyButton value={rescue.execId} label="Copy execution ID" />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="card-inset p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#7f8a82]">
                  User wallet
                </p>
                <p className="mt-2 break-all font-mono text-xs text-white">
                  {rescue.userAddress}
                </p>
                <div className="mt-3">
                  <CopyButton value={rescue.userAddress} label="Copy wallet" />
                </div>
              </div>

              <div className="card-inset p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#7f8a82]">
                  Proof references
                </p>
                <div className="mt-2 space-y-2 text-xs text-[#dfe7df]">
                  <p className="font-mono">
                    Tx: {formatHash(rescue.sourceTxHash, 10, 8)}
                  </p>
                  <p className="font-mono">
                    CCIP: {formatHash(rescue.ccipMessageId, 10, 8)}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <CopyButton value={rescue.sourceTxHash} label="Copy tx" />
                  <CopyButton value={rescue.ccipMessageId} label="Copy CCIP" />
                </div>
              </div>

              <div className="card-inset p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#7f8a82]">
                  Timing
                </p>
                <div className="mt-2 space-y-3 text-sm text-white">
                  <div>
                    <p className="text-[#8c9890]">Created</p>
                    <p>{formatDateTime(rescue.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-[#8c9890]">Last event</p>
                    <p>{formatDateTime(rescue.lastEventAt)}</p>
                  </div>
                  <div>
                    <p className="text-[#8c9890]">Updated</p>
                    <p>{formatDateTime(rescue.updatedAt)}</p>
                  </div>
                </div>
              </div>

              <div className="card-inset p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#7f8a82]">
                  Feed status
                </p>
                <div className="mt-2 space-y-3">
                  <div>
                    <p className="text-sm text-white">{rescueEvents.length} events</p>
                    <p className="text-xs text-[#8c9890]">
                      Indexed entries currently attached to this execution
                    </p>
                  </div>
                  {(detailQuery.isFetching || eventsQuery.isFetching) &&
                  rescue.status === "in_progress" ? (
                    <div className="flex items-center gap-2 rounded-xl border border-[#354334] bg-[#1a221b] px-3 py-2 text-xs text-[#b5e86f]">
                      <CheckCircle2 className="size-3.5" />
                      Live polling active while rescue remains in progress.
                    </div>
                  ) : (
                    <p className="text-xs text-[#8c9890]">
                      Refresh manually or wait for auto-polling while the rescue
                      is active.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between gap-3 border-b border-[#273029] pb-4">
              <div>
                <p className="text-base font-semibold text-white">
                  Indexed log timeline
                </p>
                <p className="mt-1 text-xs text-[#8c9890]">
                  Ordered chain events and indexed payload fields for this
                  rescue execution
                </p>
              </div>
              <StatusBadge
                label={`${rescueEvents.length} events`}
                tone="neutral"
                pulse={eventsQuery.isFetching}
              />
            </div>

            <div className="mt-4">
              {eventsQuery.isLoading ? (
                <div className="card-inset flex items-center gap-3 p-4 text-sm text-[#a9b2ab]">
                  <span className="size-4 animate-spin rounded-full border-2 border-[#2d3932] border-t-[#c7f36b]" />
                  Loading indexed events...
                </div>
              ) : eventsQuery.error ? (
                <div className="card-inset p-4 text-sm text-red-400">
                  Failed to load rescue events.
                </div>
              ) : rescueEvents.length === 0 ? (
                <div className="card-inset p-4 text-sm text-[#8c9890]">
                  No indexed events found for this execution yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {rescueEvents.map((event) => {
                    const explorerUrl = getTxExplorerUrl(
                      event.chainId,
                      event.txHash,
                    );

                    return (
                      <div key={event.id} className="card-inset p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <Blocks className="size-4 text-[#c7f36b]" />
                              <p className="text-sm font-medium text-white">
                                {event.eventName}
                              </p>
                            </div>
                            <p className="mt-1 text-xs text-[#8c9890]">
                              Block {event.blockNumber} · Log #{event.logIndex}{" "}
                              · {formatChainLabel(event.chainId)}
                            </p>
                          </div>
                          <StatusBadge
                            label={formatDateTime(event.indexedAt)}
                            tone={getEventTone(event.eventName)}
                          />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[#8c9890]">
                          {explorerUrl ? (
                            <a
                              href={explorerUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center gap-1 rounded-full border border-[#39513d] px-2 py-1 leading-none text-[#c7f36b] transition hover:border-[#c7f36b]/50 hover:text-white"
                              onClick={(event) => event.stopPropagation()}
                            >
                              Tx {formatHash(event.txHash, 10, 8)}
                              <ExternalLink className="size-3 shrink-0 self-center" />
                            </a>
                          ) : (
                            <span className="rounded-full border border-[#2f3933] px-2 py-1">
                              Tx {formatHash(event.txHash, 10, 8)}
                            </span>
                          )}
                          {event.messageId ? (
                            <span className="rounded-full border border-[#2f3933] px-2 py-1">
                              CCIP {formatHash(event.messageId, 10, 8)}
                            </span>
                          ) : null}
                          <span className="rounded-full border border-[#2f3933] px-2 py-1">
                            Contract {formatHash(event.contractAddress, 8, 6)}
                          </span>
                        </div>

                        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                          {Object.entries(event.payload ?? {}).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="rounded-xl border border-[#29322d] bg-[#131815] px-3 py-2"
                              >
                                <p className="text-[10px] uppercase tracking-[0.16em] text-[#6f7a73]">
                                  {key}
                                </p>
                                <p className="mt-1 break-all font-mono text-xs text-[#dfe7df]">
                                  {String(value)}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
