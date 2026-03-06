"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Check,
  Copy,
  CreditCard,
  Droplets,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { injected } from "wagmi/connectors";

const FUNDING_PHASES = ["Funding", "Broadcasting", "Confirming"] as const;

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
  const [fundingPhase, setFundingPhase] = useState(0);
  const [copiedAddress, setCopiedAddress] = useState(false);

  useEffect(() => {
    if (!isFunding) return;

    const interval = window.setInterval(() => {
      setFundingPhase((phase) => (phase + 1) % FUNDING_PHASES.length);
    }, 900);

    return () => window.clearInterval(interval);
  }, [isFunding]);

  useEffect(() => {
    if (!copiedAddress) return;

    const timeoutId = window.setTimeout(() => {
      setCopiedAddress(false);
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [copiedAddress]);

  const handleFundClick = () => {
    setFundingPhase(0);
    onFund();
  };

  const handleCopyAddress = async () => {
    if (!address) return;

    await navigator.clipboard.writeText(address);
    setCopiedAddress(true);
  };

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
                className={cn(
                  "relative h-8 rounded-lg px-3 overflow-hidden",
                  isFunding &&
                    "shadow-[0_0_0_1px_rgba(23,32,16,0.18),0_12px_30px_-20px_rgba(23,32,16,0.75)]",
                )}
                onClick={handleFundClick}
                disabled={isFunding}
              >
                {isFunding && (
                  <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(199,243,107,0.16)_0%,rgba(165,205,99,0.04)_35%,rgba(199,243,107,0.16)_100%)] animate-pulse" />
                )}
                {isFunding ? (
                  <span className="relative flex size-4 items-center justify-center">
                    <span className="absolute inset-0 rounded-full border border-dashed border-[#172010]/60 animate-[spin_2s_linear_infinite]" />
                    <span className="absolute inset-[3px] rounded-full border border-transparent border-t-[#172010] border-l-[#172010] animate-[spin_1s_linear_infinite]" />
                    <span className="absolute -top-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-[#172010]/70 animate-ping" />
                    <span
                      className="absolute -right-1.5 top-1/2 size-1 -translate-y-1/2 rounded-full bg-[#172010]/70 animate-bounce"
                      style={{ animationDelay: "120ms" }}
                    />
                    <span
                      className="absolute -left-1.5 top-1/2 size-1 -translate-y-1/2 rounded-full bg-[#172010]/70 animate-bounce"
                      style={{ animationDelay: "280ms" }}
                    />
                    <Droplets className="size-2.5 text-[#172010] animate-pulse" />
                  </span>
                ) : (
                  <Droplets className="size-3.5" />
                )}
                {isFunding ? (
                  <span className="relative inline-flex min-w-[90px] items-center justify-start gap-1.5">
                    {FUNDING_PHASES[fundingPhase]}...
                  </span>
                ) : (
                  "Fund Token"
                )}
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
              <Button
                variant={copiedAddress ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 rounded-lg p-0"
                onClick={() => void handleCopyAddress()}
                aria-label={
                  copiedAddress
                    ? "Wallet address copied"
                    : "Copy wallet address"
                }
                title={
                  copiedAddress
                    ? "Wallet address copied"
                    : "Copy wallet address"
                }
              >
                {copiedAddress ? (
                  <Check className="size-3.5" />
                ) : (
                  <Copy className="size-3.5" />
                )}
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
