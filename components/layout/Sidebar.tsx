"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, LucideIcon } from "lucide-react";
import { APP_NAME } from "@/lib/domain/constants";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  navItems: NavItem[];
}

export function Sidebar({ navItems }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 border-r border-[#162840] bg-[#080f1e] md:flex md:flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-4 border-b border-[#162840]">
        <div className="flex size-7 items-center justify-center rounded-lg bg-[#5a7a9f]/15 ring-1 ring-[#5a7a9f]/30">
          <ShieldCheck className="size-4 text-[#7a9abf]" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-white">
          {APP_NAME}
        </span>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-[#0f1e38] text-[#e8f0fb] shadow-[inset_2px_0_0_#5a7a9f]"
                  : "text-[#6b8cb0] hover:bg-[#0f1e38] hover:text-[#c5daf5]",
              )}
            >
              <Icon className="size-[15px] shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom status */}
      <div className="border-t border-[#162840] p-3">
        <div className="rounded-lg border border-[#112236] bg-[#080f1e]/70 flex items-center gap-2 px-3 py-2">
          <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#5a7a9f]/20 text-[10px] font-semibold text-[#94b4d8]">
            N
          </div>
          <span className="text-[11px] text-[#5a7a9f]">
            Base Mainnet · CRE Active
          </span>
        </div>
      </div>
    </aside>
  );
}
