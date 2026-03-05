"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, ReceiptText, ShieldCheck } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import {
  useDemoWalletsControllerGenerate,
  useDemoWalletsControllerFund,
} from "@/src/services/queries";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import {
  FundLogModal,
  FundLogResponse,
} from "@/components/modals/FundLogModal";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/setup", label: "Protection", icon: ShieldCheck },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const [isFundLogOpen, setIsFundLogOpen] = useState(false);
  const [fundLog, setFundLog] = useState<FundLogResponse | null>(null);

  const { mutateAsync: fundDemoWallet, isPending: isFunding } =
    useDemoWalletsControllerFund();

  const handleFund = async () => {
    try {
      const demoWalletAddress = localStorage.getItem("demoWalletAddress");
      if (!demoWalletAddress) {
        alert("No demo wallet found. Please wait until it is generated.");
        return;
      }
      setIsFundLogOpen(true);
      setFundLog(null);
      const res = await fundDemoWallet({
        demoWalletAddress,
        data: {
          ethereumSepoliaGasEth: "0.0002",
          baseSepoliaGasEth: "0.0002",
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

  const { mutate: generateDemoWallet } = useDemoWalletsControllerGenerate({
    mutation: {
      onSuccess: (res: unknown) => {
        const responseData = res as {
          data?: { demoWalletAddress?: string };
          demoWalletAddress?: string;
        };
        const demoAddress =
          responseData?.demoWalletAddress ||
          responseData?.data?.demoWalletAddress;
        if (demoAddress) {
          localStorage.setItem("demoWalletAddress", demoAddress);
        }
      },
      onError: (error) => {
        console.error("Failed to generate demo wallet:", error);
      },
    },
  });

  useEffect(() => {
    if (address) {
      localStorage.setItem("wallet-address", address);
      generateDemoWallet({ data: { realUserAddress: address } });
    } else {
      localStorage.removeItem("wallet-address");
      localStorage.removeItem("demoWalletAddress");
    }
  }, [address, generateDemoWallet]);

  return (
    <div className="min-h-screen text-[#ffffff]">
      <Sidebar navItems={navItems} />

      <div className="md:pl-56">
        <Header
          navItems={navItems}
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
