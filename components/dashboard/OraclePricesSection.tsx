"use client";

import { useQueries } from "@tanstack/react-query";
import Image from "next/image";
import { ORACLE_PRICE_TOKENS, fetchOraclePrice } from "@/lib/oracle-prices";

function formatTickerPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1000 ? 2 : 0,
    maximumFractionDigits: value < 1000 ? 2 : 0,
  }).format(value);
}

export function OraclePricesSection() {
  const priceQueries = useQueries({
    queries: ORACLE_PRICE_TOKENS.map((token) => ({
      queryKey: ["oracle-prices", token.chainKey, token.asset ?? token.id],
      queryFn: () => fetchOraclePrice(token),
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    })),
  });

  const isLoading = priceQueries.some((query) => query.isLoading);
  const tickerItems = ORACLE_PRICE_TOKENS.map((token, index) => {
    const price = priceQueries[index]?.data;

    return {
      id: price?.id ?? token.id,
      symbol: price?.symbol ?? token.symbol,
      logoSrc: price?.logoSrc ?? token.logoSrc,
      priceUsd: price?.priceUsd ?? token.fallbackPriceUsd,
    };
  });

  const repeatedTickerItems = Array.from({ length: 6 }, () => tickerItems).flat();
  const marqueeItems = [...repeatedTickerItems, ...repeatedTickerItems];

  return (
    <section className="overflow-hidden rounded-xl border border-[#2d3932] ">
      <div className="ticker-marquee relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-[linear-gradient(90deg,#0b0f0d_0%,rgba(11,15,13,0)_100%)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-[linear-gradient(270deg,#0b0f0d_0%,rgba(11,15,13,0)_100%)]" />

        <div className="ticker-track flex w-max">
          {marqueeItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="flex shrink-0 items-center gap-3 border-r border-white/6 px-4 py-2.5"
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#131815]">
                <Image
                  src={item.logoSrc}
                  alt={item.symbol}
                  width={24}
                  height={24}
                  unoptimized
                  className="h-6 w-6 object-contain"
                />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold tracking-tight text-[#f4f7f2]">
                  {item.symbol}
                </span>
                <span className="text-sm font-semibold text-[#d9e2d2]">
                  {formatTickerPrice(item.priceUsd)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="pointer-events-none absolute inset-y-0 right-3 z-20 flex items-center">
            <span className="rounded-full border border-[#37453e] bg-[#131815]/90 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-[#8c9890]">
              Updating
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
