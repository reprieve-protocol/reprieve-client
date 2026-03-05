import React from "react";
import { Shield } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex h-full min-h-64 flex-col items-center justify-center p-10 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#5a7a9f]/10 ring-1 ring-[#5a7a9f]/20">
        <Shield className="size-5 text-[#7a9abf]" />
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#6b8cb0]">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
