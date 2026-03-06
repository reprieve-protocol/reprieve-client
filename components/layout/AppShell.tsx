"use client";

import { useMemo, useState } from "react";
import { LayoutDashboard, ScrollText, ShieldCheck } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import {
  getResponseStatusCode,
  normalizeCreRegistration,
} from "@/lib/cre-registration";
import { useDemoWallet } from "@/lib/state/demo-wallet-context";
import {
  useDemoWalletsControllerFund,
  useCreRegistrationsControllerGetRegistration,
  getCreRegistrationsControllerGetRegistrationQueryKey,
} from "@/src/services/queries";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import {
  FundLogModal,
  FundLogResponse,
} from "@/components/modals/FundLogModal";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/onchain-logs",
    label: "On-chain Audit Logs",
    icon: ScrollText,
    requiresConnection: true,
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { demoWalletAddress } = useDemoWallet();

  const [isFundLogOpen, setIsFundLogOpen] = useState(false);
  const [fundLog, setFundLog] = useState<FundLogResponse | null>(null);

  const { mutateAsync: fundDemoWallet, isPending: isFunding } =
    useDemoWalletsControllerFund();

  const handleFund = async () => {
    try {
      if (!demoWalletAddress) {
        alert("No demo wallet found. Please wait until it is generated.");
        return;
      }
      setIsFundLogOpen(true);
      setFundLog(null);
      const res = await fundDemoWallet({
        demoWalletAddress,
        data: {
          ethereumSepoliaGasEth: "0.003",
          baseSepoliaGasEth: "0.0001",
          ethereumSepoliaWethTarget: "80",
          ethereumSepoliaUsdcTarget: "90000",
          baseSepoliaWethTarget: "50",
          baseSepoliaUsdcTarget: "90000",
        },
      });
      setFundLog(res as unknown as FundLogResponse);
    } catch (error) {
      console.error(error);
      setFundLog({ error: String(error) });
    }
  };

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

  return (
    <div className="min-h-screen text-[#f1f4ef]">
      <Sidebar navItems={visibleNavItems} />

      <div className="md:pl-64">
        <Header
          navItems={visibleNavItems}
          isConnected={isConnected}
          address={address}
          isFunding={isFunding}
          onFund={handleFund}
          onConnect={connect}
          onDisconnect={() => disconnect()}
        />

        <main className="px-4 py-6 md:px-6 md:py-7">{children}</main>
      </div>

      <FundLogModal
        isOpen={isFundLogOpen}
        onClose={() => setIsFundLogOpen(false)}
        fundLog={fundLog}
      />
    </div>
  );
}
