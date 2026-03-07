"use client";

import { useMemo } from "react";
import { LayoutDashboard, ScrollText, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import {
  getResponseStatusCode,
  normalizeCreRegistration,
} from "@/lib/cre-registration";
import { useDemoWallet } from "@/lib/state/demo-wallet-context";
import {
  useCreRegistrationsControllerGetRegistration,
  getCreRegistrationsControllerGetRegistrationQueryKey,
} from "@/src/services/queries";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/onchain-logs",
    label: "On-chain Audit Logs",
    icon: ScrollText,
    requiresConnection: true,
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { demoWalletAddress } = useDemoWallet();

  const { data: creRegistration, error: creRegistrationError } =
    useCreRegistrationsControllerGetRegistration(demoWalletAddress, {
      query: {
        enabled: !!demoWalletAddress,
        queryKey:
          getCreRegistrationsControllerGetRegistrationQueryKey(
            demoWalletAddress,
          ),
        retry: (failureCount, error) => {
          const statusCode = getResponseStatusCode(error);
          if (statusCode === 404) return false;
          return failureCount < 2;
        },
      },
    });

  const hasCreRegistration = useMemo(() => {
    const statusCode = getResponseStatusCode(creRegistrationError);
    if (statusCode === 404) {
      return false;
    }

    return Boolean(normalizeCreRegistration(creRegistration));
  }, [creRegistration, creRegistrationError]);

  const visibleNavItems = useMemo(
    () =>
      (hasCreRegistration
        ? [
            ...navItems,
            { href: "/setup", label: "Protection", icon: ShieldCheck },
          ]
        : navItems
      ).filter((item) => !item.requiresConnection || isConnected),
    [hasCreRegistration, isConnected],
  );

  if (pathname === "/") {
    return children;
  }

  return (
    <div className="min-h-screen text-[#f1f4ef]">
      <Sidebar navItems={visibleNavItems} />

      <div className="md:pl-64">
        <Header
          navItems={visibleNavItems}
          isConnected={isConnected}
          address={demoWalletAddress}
          isDemoMode={Boolean(demoWalletAddress)}
          onConnect={connect}
          onDisconnect={() => disconnect()}
        />

        <main className="px-4 py-6 md:px-6 md:py-7">{children}</main>
      </div>
    </div>
  );
}
