import { Copy, ExternalLink, Link2 } from "lucide-react";
import { formatEth, formatLink, formatUsd } from "@/lib/domain/calculations";
import { CHAIN_LABELS, PROTOCOL_LABELS } from "@/lib/domain/constants";
import type { RescueLogEntry } from "@/lib/domain/types";
import { StatusBadge } from "@/components/common/StatusBadge";

function ActionButton({
  onClick,
  href,
  children,
}: {
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
}) {
  const cls =
    "inline-flex items-center gap-1.5 rounded-lg border border-[#162840] bg-[#0c1628] px-2.5 py-1.5 text-xs font-medium text-[#6b8cb0] transition hover:bg-[#0f1e38] hover:text-white";

  if (href) {
    return (
      <a className={cls} href={href} onClick={(e) => e.preventDefault()}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick}>
      {children}
    </button>
  );
}

export function RescueDetailPanel({ entry }: { entry: RescueLogEntry | null }) {
  if (!entry) {
    return (
      <div className="card flex min-h-48 items-center justify-center border-dashed p-6 text-sm text-[#4a6a8f]">
        Select a rescue entry to inspect protocol route, cost, and proof links.
      </div>
    );
  }

  return (
    <div className="card p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-white">Rescue Detail</h2>
        <StatusBadge
          label={entry.status.toUpperCase()}
          tone={
            entry.status === "success"
              ? "success"
              : entry.status === "failed"
                ? "danger"
                : "warning"
          }
        />
      </div>

      {/* Route */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-[#5a7a9f]">
          Route
        </p>
        <p className="mt-2 text-sm text-[#94b4d8]">
          {PROTOCOL_LABELS[entry.source.protocol]} (
          {CHAIN_LABELS[entry.source.chain]})
          <span className="mx-2 text-[#4a6a8f]">→</span>
          {PROTOCOL_LABELS[entry.target.protocol]} (
          {CHAIN_LABELS[entry.target.chain]})
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-inset p-3">
          <p className="text-[11px] text-[#5a7a9f]">Amount moved</p>
          <p className="mt-1 text-sm font-medium text-white">
            {entry.amount.quantity} {entry.amount.token}
          </p>
          <p className="text-xs text-[#6b8cb0]">
            {formatUsd(entry.amount.usdValue)}
          </p>
        </div>
        <div className="card-inset p-3">
          <p className="text-[11px] text-[#5a7a9f]">Gas</p>
          <p className="mt-1 text-sm font-medium text-white">
            {formatEth(entry.gasEth)}
          </p>
          {entry.ccipFeeLink ? (
            <p className="text-xs text-[#6b8cb0]">
              CCIP: {formatLink(entry.ccipFeeLink)}
            </p>
          ) : null}
        </div>
      </div>

      {/* HF improvement */}
      <div className="card-inset p-4">
        <p className="text-[11px] text-[#5a7a9f]">HF Before → After</p>
        <p className="mt-2 text-2xl font-bold tabular-nums">
          <span className="text-amber-400">{entry.hfBefore.toFixed(2)}</span>
          <span className="mx-3 text-[#4a6a8f] text-base">→</span>
          <span className="text-[#94b4d8]">{entry.hfAfter.toFixed(2)}</span>
        </p>
      </div>

      {/* Tx Hash */}
      <div className="card-inset p-4 space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-widest text-[#5a7a9f]">
          Tx Hash
        </p>
        <p className="break-all font-mono text-xs text-[#94b4d8] leading-relaxed">
          {entry.txHash}
        </p>
        <div className="flex items-center gap-2 pt-1">
          <ActionButton
            onClick={() => navigator.clipboard.writeText(entry.txHash)}
          >
            <Copy className="size-3" />
            Copy
          </ActionButton>
          <ActionButton href="#">
            <ExternalLink className="size-3" />
            Verify on-chain
          </ActionButton>
        </div>
      </div>

      {/* Workflow ID */}
      <div className="card-inset p-4 space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-widest text-[#5a7a9f]">
          CRE Workflow ID
        </p>
        <p className="font-mono text-xs text-[#94b4d8]">{entry.workflowId}</p>
        <div className="pt-1">
          <ActionButton href="#">
            <Link2 className="size-3" />
            DON Proof
          </ActionButton>
        </div>
      </div>

      {entry.reason ? (
        <p className="text-xs text-amber-400">Reason: {entry.reason}</p>
      ) : null}
    </div>
  );
}
