"use client";

import type { ComponentType } from "react";
import { ArrowLeftRight, CircleDashed, Copy, ShieldEllipsis } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/state/toast-context";

export type RescueStatus =
  | "none"
  | "in_progress"
  | "completed"
  | "failed"
  | "partial"
  | "cancelled";

export interface RescueListItem {
  id: number;
  execId: string;
  userAddress: string;
  sourceChainId: number;
  mode: string;
  status: RescueStatus;
  ccipMessageId: string | null;
  sourceTxHash: string | null;
  destinationChainId: number | null;
  lastEventAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RescueListResponse {
  page: number;
  limit: number;
  total: number;
  items: RescueListItem[];
}

export interface RescueEvent {
  id: number;
  chainId: number;
  blockNumber: string;
  txHash: string;
  logIndex: number;
  contractAddress: string;
  eventName: string;
  execId: string;
  userAddress: string | null;
  messageId: string | null;
  payload: Record<string, string | number | null>;
  indexedAt: string;
}

export const PAGE_SIZE = 20;

export const STATUS_FILTERS: Array<{
  label: string;
  value: "all" | RescueStatus;
}> = [
  { label: "All statuses", value: "all" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
  { label: "Partial", value: "partial" },
  { label: "Cancelled", value: "cancelled" },
];

const SUMMARY_ICONS = {
  indexed: ShieldEllipsis,
  pending: CircleDashed,
  routes: ArrowLeftRight,
} satisfies Record<string, ComponentType<{ className?: string }>>;

const CHAIN_ID_LABELS: Record<number, string> = {
  11155111: "Ethereum Sepolia",
  84532: "Base Sepolia",
  421614: "Arbitrum Sepolia",
};

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "Pending";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatRelative(value: string | null | undefined) {
  if (!value) return "No events yet";

  const deltaMs = new Date(value).getTime() - Date.now();
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const minutes = Math.round(deltaMs / 60000);

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, "minute");
  }

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    return formatter.format(hours, "hour");
  }

  const days = Math.round(hours / 24);
  return formatter.format(days, "day");
}

export function formatHash(
  value: string | null | undefined,
  head = 8,
  tail = 6,
) {
  if (!value) return "N/A";
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

export function formatChainLabel(chainId: number | null | undefined) {
  if (!chainId) return "Pending";
  return CHAIN_ID_LABELS[chainId] ?? `Chain ${chainId}`;
}

export function formatMode(mode: string) {
  return mode
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function getStatusTone(status: RescueStatus) {
  if (status === "completed") return "success" as const;
  if (status === "failed") return "danger" as const;
  if (status === "partial") return "warning" as const;
  if (status === "in_progress") return "info" as const;
  return "neutral" as const;
}

export function getStatusLabel(status: RescueStatus) {
  return status.replace("_", " ");
}

export function getEventTone(eventName: string) {
  if (eventName.includes("Failed")) return "danger" as const;
  if (eventName.includes("Completed")) return "success" as const;
  if (eventName.includes("Initiated")) return "info" as const;
  return "neutral" as const;
}

export function SummaryCard({
  icon,
  label,
  value,
  meta,
}: {
  icon: keyof typeof SUMMARY_ICONS;
  label: string;
  value: string;
  meta: string;
}) {
  const Icon = SUMMARY_ICONS[icon];

  return (
    <div className="card-inset p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl border border-[#37453e] bg-[#171d19] text-[#c7f36b]">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#8c9890]">
            {label}
          </p>
          <p className="mt-1 text-lg font-semibold text-white">{value}</p>
          <p className="mt-1 text-xs text-[#8c9890]">{meta}</p>
        </div>
      </div>
    </div>
  );
}

export function CopyButton({
  value,
  label,
}: {
  value: string | null | undefined;
  label: string;
}) {
  const { pushToast } = useToast();

  return (
    <Button
      type="button"
      variant="outline"
      size="xs"
      className="h-7 rounded-lg"
      disabled={!value}
      onClick={async () => {
        if (!value) return;

        const normalizedLabel = label.replace(/^Copy\s+/i, "").toLowerCase();

        try {
          await navigator.clipboard.writeText(value);
          pushToast({
            title: `${normalizedLabel} copied`,
            description: "The value is now in your clipboard.",
            tone: "success",
          });
        } catch (error) {
          console.error("Failed to copy value:", error);
          pushToast({
            title: `Failed to copy ${normalizedLabel}`,
            description: "Clipboard access was denied or unavailable.",
            tone: "danger",
          });
        }
      }}
    >
      <Copy className="size-3" />
      {label}
    </Button>
  );
}
