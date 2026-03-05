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
  onConnect: (args: { connector: ReturnType<typeof injected> }) => void;
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
    <header className="sticky top-0 z-20 border-b border-[#2d3932] bg-[#0b0f0d]/90 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Treasury */}
        <div className="flex items-center gap-3"></div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#37453e] bg-[#131815] px-2.5 py-1 text-xs font-medium text-[#ccd7cf] tracking-wide">
            <Activity className="size-3 text-[#b5e86f]" />
            CCIP Online
          </span>

          {isConnected ? (
            <>
              <Button
                variant="default"
                size="sm"
                className="h-8 rounded-lg px-3"
                onClick={onFund}
                disabled={isFunding}
              >
                {isFunding ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Droplets className="size-3.5" />
                )}
                Fund Token
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg"
                onClick={onDisconnect}
              >
                <CreditCard className="size-3.5" />
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="h-8 rounded-lg bg-[#c7f36b] px-3 text-[#172010] hover:bg-[#b5e86f] shadow-sm"
              onClick={() => onConnect({ connector: injected() })}
            >
              Connect Wallet
            </Button>
          )}

          <button
            type="button"
            className="hidden size-8 items-center justify-center rounded-lg border border-[#2d3932] bg-[#131815] text-[#a9b2ab] transition hover:text-white md:inline-flex"
          >
            <ArrowLeftRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="flex gap-1.5 overflow-x-auto border-t border-[#2d3932] px-3 py-2 md:hidden">
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
                  ? "border-[#c7f36b]/40 bg-[#c7f36b]/10 text-[#b5e86f]"
                  : "border-[#2d3932] bg-[#131815] text-[#a9b2ab] hover:text-[#e7ece6]",
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
