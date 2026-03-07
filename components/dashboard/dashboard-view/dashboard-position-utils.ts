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

interface MockPositionTemplate {
  protocol: Position["protocol"];
  chain: Position["chain"];
  pair: string;
  tokenType: Position["tokenType"];
  collateralUsdRange: [number, number];
  debtRatioRange: [number, number];
  healthFactorRange: [number, number];
}

const MOCK_SHORT_POSITION_TEMPLATES: MockPositionTemplate[] = [
  {
    protocol: "morpho-v2",
    chain: "base-sepolia",
    pair: "BNB / USDC",
    tokenType: "vault-share",
    collateralUsdRange: [12000, 19000],
    debtRatioRange: [0.44, 0.57],
    healthFactorRange: [1.95, 2.4],
  },
  {
    protocol: "compound-v3",
    chain: "arbitrum-sepolia",
    pair: "WETH / USDC",
    tokenType: "cToken",
    collateralUsdRange: [18000, 26000],
    debtRatioRange: [0.33, 0.46],
    healthFactorRange: [2.2, 2.7],
  },
  {
    protocol: "aave-v4",
    chain: "ethereum-sepolia",
    pair: "BTC / USDC",
    tokenType: "aToken",
    collateralUsdRange: [26000, 36000],
    debtRatioRange: [0.27, 0.38],
    healthFactorRange: [2.8, 3.4],
  },
  {
    protocol: "morpho-v2",
    chain: "base-sepolia",
    pair: "LINK / USDC",
    tokenType: "vault-share",
    collateralUsdRange: [9000, 16000],
    debtRatioRange: [0.36, 0.52],
    healthFactorRange: [1.8, 2.35],
  },
  {
    protocol: "compound-v3",
    chain: "base-sepolia",
    pair: "ETH / USDC",
    tokenType: "cToken",
    collateralUsdRange: [14000, 23000],
    debtRatioRange: [0.31, 0.44],
    healthFactorRange: [2.15, 2.75],
  },
];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function roundToTwoDecimals(value: number): number {
  return Number(value.toFixed(2));
}

function shuffle<T>(items: readonly T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function createRandomMockPosition(
  template: MockPositionTemplate,
  index: number,
  seed: string,
): Position {
  const collateralUsd = roundToTwoDecimals(
    randomBetween(
      template.collateralUsdRange[0],
      template.collateralUsdRange[1],
    ),
  );
  const debtUsd = roundToTwoDecimals(
    collateralUsd *
      randomBetween(template.debtRatioRange[0], template.debtRatioRange[1]),
  );

  return {
    id: `pos-mock-${seed}-${index}`,
    protocol: template.protocol,
    chain: template.chain,
    pair: template.pair,
    action: "short",
    collateralUsd,
    debtUsd,
    healthFactor: roundToTwoDecimals(
      randomBetween(
        template.healthFactorRange[0],
        template.healthFactorRange[1],
      ),
    ),
    tokenType: template.tokenType,
    approvalStatus: "approved",
    isRescueSource: false,
  };
}

export function getMockShortPositions(): Position[] {
  const seed = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  return shuffle(MOCK_SHORT_POSITION_TEMPLATES)
    .slice(0, 3)
    .map((template, index) => createRandomMockPosition(template, index, seed));
}

export function isMockShortPosition(value: unknown): value is Position {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Position>;

  return (
    typeof candidate.id === "string" &&
    candidate.id.startsWith("pos-mock-") &&
    (candidate.protocol === "aave-v4" ||
      candidate.protocol === "compound-v3" ||
      candidate.protocol === "morpho-v2") &&
    (candidate.chain === "arbitrum-sepolia" ||
      candidate.chain === "base-sepolia" ||
      candidate.chain === "ethereum-sepolia") &&
    typeof candidate.pair === "string" &&
    candidate.action === "short" &&
    isFiniteNumber(candidate.collateralUsd) &&
    isFiniteNumber(candidate.debtUsd) &&
    isFiniteNumber(candidate.healthFactor) &&
    (candidate.tokenType === "aToken" ||
      candidate.tokenType === "cToken" ||
      candidate.tokenType === "vault-share") &&
    candidate.approvalStatus === "approved" &&
    candidate.isRescueSource === false
  );
}

export function isMockShortPositionList(value: unknown): value is Position[] {
  return (
    Array.isArray(value) && value.every((entry) => isMockShortPosition(entry))
  );
}

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

function mapApiPosition(
  apiPosition: ApiPosition,
  ethPriceUsd: number,
): Position {
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
  mockShortPositions: Position[] = [],
): Position[] {
  const response = positionsData as { positions?: ApiPosition[] } | undefined;
  const apiPositions = response?.positions ?? [];
  const mappedApiPositions = apiPositions.map((apiPosition) =>
    mapApiPosition(apiPosition, ethPriceUsd),
  );

  if (apiPositions.length > 1) {
    return [...mappedApiPositions, ...mockShortPositions];
  }

  return mappedApiPositions;
}

export function hasDashboardPositions(positionsData: unknown): boolean {
  const response = positionsData as { positions?: unknown[] } | undefined;
  return Array.isArray(response?.positions) && response.positions.length > 0;
}

export function getDashboardPositionCount(positionsData: unknown): number {
  const response = positionsData as { positions?: unknown[] } | undefined;
  return Array.isArray(response?.positions) ? response.positions.length : 0;
}
