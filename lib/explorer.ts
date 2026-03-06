import type { Chain } from "@/lib/domain/types";

const CHAIN_SLUG_EXPLORERS: Record<Chain, string> = {
  "arbitrum-sepolia": "https://sepolia.arbiscan.io/tx/",
  "base-sepolia": "https://sepolia.basescan.org/tx/",
  "ethereum-sepolia": "https://sepolia.etherscan.io/tx/",
};

const CHAIN_ID_EXPLORERS: Record<number, string> = {
  11155111: "https://sepolia.etherscan.io/tx/",
  84532: "https://sepolia.basescan.org/tx/",
  421614: "https://sepolia.arbiscan.io/tx/",
};

export function getTxExplorerUrl(
  chain: Chain | number | null | undefined,
  txHash: string | null | undefined,
): string | null {
  if (!chain || !txHash) return null;

  const baseUrl =
    typeof chain === "number"
      ? CHAIN_ID_EXPLORERS[chain]
      : CHAIN_SLUG_EXPLORERS[chain];

  if (!baseUrl) return null;

  return `${baseUrl}${txHash}`;
}
