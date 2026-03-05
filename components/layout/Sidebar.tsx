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
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 border-r border-[#2d3932] bg-[#0b0f0d] md:flex md:flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-4 border-b border-[#2d3932]">
        <div className="flex size-7 items-center justify-center rounded-lg bg-[#c7f36b]/15 ring-1 ring-[#c7f36b]/30">
          <ShieldCheck className="size-4 text-[#ccd7cf]" />
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
                  ? "bg-[#191f1b] text-[#f7faf4] shadow-[inset_2px_0_0_#c7f36b]"
                  : "text-[#a9b2ab] hover:bg-[#191f1b] hover:text-[#e7ece6]",
              )}
            >
              <Icon className="size-[15px] shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom status */}
      <div className="border-t border-[#2d3932] p-3">
        <div className="rounded-lg border border-[#222a25] bg-[#0b0f0d]/70 flex items-center gap-2 px-3 py-2">
          <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#c7f36b]/20 text-[10px] font-semibold text-[#b5e86f]">
            N
          </div>
          <span className="text-[11px] text-[#c7f36b]">
            Base Mainnet · CRE Active
          </span>
        </div>
      </div>
    </aside>
  );
}
