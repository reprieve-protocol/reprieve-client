import { ETH_USD_PRICE } from "@/lib/domain/constants";
import { type Position } from "@/lib/domain/types";

interface ApiPosition {
  id: number;
  chainId: number;
  protocol: string;
  collateralAmountRaw: string;
  debtAmountRaw: string;
  healthFactorWad: string;
}

const MOCK_SHORT_POSITIONS: Position[] = [
  {
    id: "pos-mock-morpho-short-1",
    protocol: "morpho-v2",
    chain: "base-sepolia",
    pair: "BNB / USDC",
    action: "short",
    collateralUsd: 15400,
    debtUsd: 7850.5,
    healthFactor: 2.18,
    tokenType: "vault-share",
    approvalStatus: "approved",
    isRescueSource: false,
  },
  {
    id: "pos-mock-morpho-short-2",
    protocol: "morpho-v2",
    chain: "base-sepolia",
    pair: "WETH / USDC",
    action: "short",
    collateralUsd: 22120,
    debtUsd: 9040.25,
    healthFactor: 2.46,
    tokenType: "vault-share",
    approvalStatus: "approved",
    isRescueSource: false,
  },
  {
    id: "pos-mock-morpho-short-3",
    protocol: "morpho-v2",
    chain: "base-sepolia",
    pair: "cbBTC / USDC",
    action: "short",
    collateralUsd: 30950,
    debtUsd: 10120.8,
    healthFactor: 3.05,
    tokenType: "vault-share",
    approvalStatus: "approved",
    isRescueSource: false,
  },
];

function mapProtocol(protocol: string): Position["protocol"] {
  if (protocol === "AAVE") {
    return "aave-v4";
  }

  if (protocol === "COMPOUND") {
    return "compound-v3";
  }

  return "morpho-v2";
}

function mapChain(chainId: number): Position["chain"] {
  if (chainId === 11155111) {
    return "ethereum-sepolia";
  }

  if (chainId === 421614) {
    return "arbitrum-sepolia";
  }

  return "base-sepolia";
}

function mapHealthFactor(healthFactorWad: string): number {
  if (!healthFactorWad) {
    return 99.99;
  }

  const factor = Number(BigInt(healthFactorWad)) / 1e18;
  return factor > 1000 ? 99.99 : factor;
}

function mapApiPosition(apiPosition: ApiPosition, ethPriceUsd: number): Position {
  return {
    id: `pos-${apiPosition.id}`,
    protocol: mapProtocol(apiPosition.protocol),
    chain: mapChain(apiPosition.chainId),
    pair: "ETH / USDC",
    action: "long",
    collateralUsd:
      (Number(BigInt(apiPosition.collateralAmountRaw)) / 1e18) * ethPriceUsd,
    debtUsd: Number(BigInt(apiPosition.debtAmountRaw)) / 1e6,
    healthFactor: mapHealthFactor(apiPosition.healthFactorWad),
    tokenType: "aToken",
    approvalStatus: "approved",
    isRescueSource: false,
  };
}

export function buildDashboardPositions(
  positionsData: unknown,
  ethPriceUsd = ETH_USD_PRICE,
): Position[] {
  const response = positionsData as { positions?: ApiPosition[] } | undefined;
  const apiPositions = response?.positions ?? [];

  if (apiPositions.length === 0) {
    return [];
  }

  return [
    ...apiPositions.map((apiPosition) => mapApiPosition(apiPosition, ethPriceUsd)),
    ...MOCK_SHORT_POSITIONS,
  ];
}

export function hasDashboardPositions(positionsData: unknown): boolean {
  const response = positionsData as { positions?: unknown[] } | undefined;
  return Array.isArray(response?.positions) && response.positions.length > 0;
}
