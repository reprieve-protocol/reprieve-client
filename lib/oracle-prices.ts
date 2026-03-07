import { customClient } from "@/src/services/custom-client";
import { getPositionsControllerGetOraclePriceUrl } from "@/src/services/queries";
import type { PositionsControllerGetOraclePriceChainKey } from "@/src/services/models";

export type OraclePriceSource = "oracle" | "fallback" | "demo";

export interface OraclePriceTokenConfig {
  id: string;
  symbol: string;
  chainKey: PositionsControllerGetOraclePriceChainKey;
  asset?: string;
  fallbackPriceUsd: number;
  tickerChangePct: number;
  demoOnly?: boolean;
  logoSrc: string;
  surfaceTint: string;
  glowTint: string;
}

export interface OraclePriceItem {
  id: string;
  symbol: string;
  chainKey: PositionsControllerGetOraclePriceChainKey;
  logoSrc: string;
  surfaceTint: string;
  glowTint: string;
  asset: string | null;
  oracleAddress: string | null;
  priceUsd: number;
  priceWad: string | null;
  updatedAtIso: string | null;
  tickerChangePct: number;
  source: OraclePriceSource;
}

interface OraclePriceApiResponse {
  chainKey?: string;
  asset?: string;
  oracleAddress?: string;
  priceWad?: string;
  priceUsd?: number | string;
  updatedAtIso?: string;
}

const DEMO_UPDATED_AT_ISO = "2026-03-06T00:00:00.000Z";

export const ORACLE_PRICE_TOKENS: OraclePriceTokenConfig[] = [
  {
    id: "fake-eth-ethereum-sepolia",
    symbol: "ETH",
    chainKey: "ethereum-sepolia",
    asset: "0x4c87EA388AdE37f6A556146B4fF6ff2A12192968",
    fallbackPriceUsd: 1800,
    tickerChangePct: 2.14,
    logoSrc: "/tokens/ethereum-eth.svg",
    surfaceTint: "rgba(98, 126, 234, 0.16)",
    glowTint: "rgba(98, 126, 234, 0.32)",
  },
  {
    id: "fake-bnb-short-demo",
    symbol: "BNB",
    chainKey: "base-sepolia",
    fallbackPriceUsd: 612.4,
    tickerChangePct: -1.08,
    demoOnly: true,
    logoSrc: "/tokens/bnb.svg",
    surfaceTint: "rgba(240, 185, 11, 0.14)",
    glowTint: "rgba(240, 185, 11, 0.26)",
  },
  {
    id: "fake-cbbtc-short-demo",
    symbol: "BTC",
    chainKey: "base-sepolia",
    fallbackPriceUsd: 91325.18,
    tickerChangePct: 1.26,
    demoOnly: true,
    logoSrc: "/tokens/images.png",
    surfaceTint: "rgba(247, 147, 26, 0.14)",
    glowTint: "rgba(247, 147, 26, 0.26)",
  },
];

function normalizePriceUsd(
  value: OraclePriceApiResponse["priceUsd"],
): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function buildFallbackPrice(
  token: OraclePriceTokenConfig,
  source: OraclePriceSource,
): OraclePriceItem {
  return {
    id: token.id,
    symbol: token.symbol,
    chainKey: token.chainKey,
    logoSrc: token.logoSrc,
    surfaceTint: token.surfaceTint,
    glowTint: token.glowTint,
    asset: token.asset ?? null,
    oracleAddress: null,
    priceUsd: token.fallbackPriceUsd,
    priceWad: null,
    updatedAtIso: DEMO_UPDATED_AT_ISO,
    tickerChangePct: token.tickerChangePct,
    source,
  };
}

export async function fetchOraclePrice(
  token: OraclePriceTokenConfig,
): Promise<OraclePriceItem> {
  if (token.demoOnly || !token.asset) {
    return buildFallbackPrice(token, "demo");
  }

  try {
    const response = await customClient<OraclePriceApiResponse>(
      getPositionsControllerGetOraclePriceUrl({
        chainKey: token.chainKey,
        asset: token.asset,
      }),
      { method: "GET" },
    );

    const priceUsd = normalizePriceUsd(response?.priceUsd);
    if (priceUsd === null) {
      return buildFallbackPrice(token, "fallback");
    }

    return {
      id: token.id,
      symbol: token.symbol,
      chainKey: token.chainKey,
      logoSrc: token.logoSrc,
      surfaceTint: token.surfaceTint,
      glowTint: token.glowTint,
      asset: response?.asset ?? token.asset,
      oracleAddress: response?.oracleAddress ?? null,
      priceUsd,
      priceWad: response?.priceWad ?? null,
      updatedAtIso: response?.updatedAtIso ?? DEMO_UPDATED_AT_ISO,
      tickerChangePct: token.tickerChangePct,
      source: "oracle",
    };
  } catch {
    return buildFallbackPrice(token, "fallback");
  }
}
