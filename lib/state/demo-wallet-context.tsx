"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useDemoWalletsControllerGenerate } from "@/src/services/queries";

interface DemoWalletContextValue {
  demoWalletAddress: string;
  isResolvingDemoWallet: boolean;
}

const DemoWalletContext = createContext<DemoWalletContextValue | null>(null);

function readStorageItem(key: string): string {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(key) ?? "";
}

function clearDemoWalletQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  demoWalletAddress: string,
) {
  if (!demoWalletAddress) {
    return;
  }

  const matchesDemoWalletQuery = (queryKey: readonly unknown[]) => {
    const resource = queryKey[0];

    if (typeof resource !== "string") {
      return false;
    }

    return (
      resource.includes(`/v1/users/${demoWalletAddress}/`) ||
      resource.includes(`/v1/positions/${demoWalletAddress}/`) ||
      resource.includes(`/v1/demo-wallets/${demoWalletAddress}/`)
    );
  };

  void queryClient.cancelQueries({
    predicate: (query) => matchesDemoWalletQuery(query.queryKey),
  });
  queryClient.removeQueries({
    predicate: (query) => matchesDemoWalletQuery(query.queryKey),
  });
}

function invalidateDemoWalletQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  demoWalletAddress: string,
) {
  if (!demoWalletAddress) {
    return;
  }

  void queryClient.invalidateQueries({
    predicate: (query) => {
      const resource = query.queryKey[0];

      return (
        typeof resource === "string" &&
        (resource.includes(`/v1/users/${demoWalletAddress}/`) ||
          resource.includes(`/v1/positions/${demoWalletAddress}/`) ||
          resource.includes(`/v1/demo-wallets/${demoWalletAddress}/`))
      );
    },
  });
}

export function DemoWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { mutateAsync: generateDemoWallet } = useDemoWalletsControllerGenerate();

  const [demoWalletAddress, setDemoWalletAddress] = useState("");
  const [isResolvingDemoWallet, setIsResolvingDemoWallet] = useState(false);
  const lastSyncedWalletAddressRef = useRef<string | null>(null);

  useEffect(() => {
    if (isConnecting || isReconnecting) {
      setIsResolvingDemoWallet(true);
      return;
    }

    if (!isConnected || !address) {
      const previousDemoWalletAddress =
        demoWalletAddress || readStorageItem("demoWalletAddress");

      clearDemoWalletQueries(queryClient, previousDemoWalletAddress);
      window.localStorage.removeItem("wallet-address");
      window.localStorage.removeItem("demoWalletAddress");
      setDemoWalletAddress("");
      setIsResolvingDemoWallet(false);
      lastSyncedWalletAddressRef.current = null;
      return;
    }

    const storedWalletAddress = readStorageItem("wallet-address");
    const storedDemoWalletAddress = readStorageItem("demoWalletAddress");
    const isFirstHydration = lastSyncedWalletAddressRef.current === null;

    if (
      isFirstHydration &&
      storedWalletAddress === address &&
      storedDemoWalletAddress
    ) {
      setDemoWalletAddress(storedDemoWalletAddress);
      setIsResolvingDemoWallet(false);
      lastSyncedWalletAddressRef.current = address;
      return;
    }

    if (
      lastSyncedWalletAddressRef.current === address &&
      demoWalletAddress &&
      storedWalletAddress === address
    ) {
      setIsResolvingDemoWallet(false);
      return;
    }

    let isDisposed = false;
    const previousDemoWalletAddress = demoWalletAddress || storedDemoWalletAddress;

    const syncDemoWallet = async () => {
      setIsResolvingDemoWallet(true);
      setDemoWalletAddress("");
      clearDemoWalletQueries(queryClient, previousDemoWalletAddress);
      window.localStorage.setItem("wallet-address", address);
      window.localStorage.removeItem("demoWalletAddress");

      try {
        const response = (await generateDemoWallet({
          data: { realUserAddress: address },
        })) as {
          data?: { demoWalletAddress?: string };
          demoWalletAddress?: string;
        };

        const nextDemoWalletAddress =
          response.demoWalletAddress ?? response.data?.demoWalletAddress ?? "";

        if (!nextDemoWalletAddress) {
          throw new Error("Demo wallet address missing from generate response.");
        }

        if (isDisposed) {
          return;
        }

        window.localStorage.setItem("demoWalletAddress", nextDemoWalletAddress);
        setDemoWalletAddress(nextDemoWalletAddress);
        lastSyncedWalletAddressRef.current = address;
        invalidateDemoWalletQueries(queryClient, nextDemoWalletAddress);
      } catch (error) {
        console.error("Failed to generate demo wallet:", error);

        if (isDisposed) {
          return;
        }

        setDemoWalletAddress("");
        lastSyncedWalletAddressRef.current = address;
      } finally {
        if (!isDisposed) {
          setIsResolvingDemoWallet(false);
        }
      }
    };

    void syncDemoWallet();

    return () => {
      isDisposed = true;
    };
  }, [
    address,
    demoWalletAddress,
    generateDemoWallet,
    isConnected,
    isConnecting,
    isReconnecting,
    queryClient,
  ]);

  const value = useMemo<DemoWalletContextValue>(
    () => ({
      demoWalletAddress,
      isResolvingDemoWallet,
    }),
    [demoWalletAddress, isResolvingDemoWallet],
  );

  return (
    <DemoWalletContext.Provider value={value}>
      {children}
    </DemoWalletContext.Provider>
  );
}

export function useDemoWallet() {
  const context = useContext(DemoWalletContext);

  if (!context) {
    throw new Error("useDemoWallet must be used within DemoWalletProvider");
  }

  return context;
}
