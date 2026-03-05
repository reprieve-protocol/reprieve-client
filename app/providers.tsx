"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppStateProvider } from "@/lib/state/app-context";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      }),
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppStateProvider>{children}</AppStateProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
