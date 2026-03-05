"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowLeftRight,
  CreditCard,
  Loader2,
  Droplets,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { injected } from "wagmi/connectors";
import { Connector } from "wagmi";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface HeaderProps {
  navItems: NavItem[];
  isConnected: boolean;
  address?: `0x${string}`;
  isFunding: boolean;
  onFund: () => void;
  onConnect: (args: { connector: Connector }) => void;
  onDisconnect: () => void;
}

export function Header({
  navItems,
  isConnected,
  address,
  isFunding,
  onFund,
  onConnect,
  onDisconnect,
}: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-[#162840] bg-[#080f1e]/90 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Treasury */}
        <div className="flex items-center gap-3"></div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#192e4c] bg-[#0c1628] px-2.5 py-1 text-xs font-medium text-[#7a9abf] tracking-wide">
            <Activity className="size-3 text-[#94b4d8]" />
            CCIP Online
          </span>

          {isConnected ? (
            <>
              <Button
                size="sm"
                className="h-8 rounded-lg bg-[#94b4d8]/10 text-[#94b4d8] hover:bg-[#94b4d8]/20 border border-[#94b4d8]/20 flex items-center whitespace-nowrap"
                onClick={onFund}
                disabled={isFunding}
              >
                {isFunding ? (
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                ) : (
                  <Droplets className="size-3.5 mr-1.5" />
                )}
                Fund Token
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 rounded-lg border border-[#162840] bg-[#0c1628] text-[#94b4d8] hover:bg-[#112236] hover:text-white"
                onClick={onDisconnect}
              >
                <CreditCard className="size-3.5 mr-1.5" />
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="h-8 rounded-lg bg-[#5a7a9f] px-3 text-white hover:bg-[#7a9abf] shadow-sm"
              onClick={() => onConnect({ connector: injected() })}
            >
              Connect Wallet
            </Button>
          )}

          <button
            type="button"
            className="hidden size-8 items-center justify-center rounded-lg border border-[#162840] bg-[#0c1628] text-[#6b8cb0] transition hover:text-white md:inline-flex"
          >
            <ArrowLeftRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="flex gap-1.5 overflow-x-auto border-t border-[#162840] px-3 py-2 md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition",
                active
                  ? "border-[#5a7a9f]/40 bg-[#5a7a9f]/10 text-[#94b4d8]"
                  : "border-[#162840] bg-[#0c1628] text-[#6b8cb0] hover:text-[#c5daf5]",
              )}
            >
              <Icon className="size-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
