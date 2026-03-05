import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Reprieve · Cross-Protocol Protection",
  description:
    "Reprieve monitors Aave, Compound, and Morpho positions with deterministic mock rescue flows powered by CRE-style logic.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
