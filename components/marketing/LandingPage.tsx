import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  Gauge,
  Shield,
  Sparkles,
  Waypoints,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LightRays from "@/components/marketing/LightRays";

const metrics = [
  { label: "Protocols", value: "3", detail: "Aave, Compound, Morpho" },
  {
    label: "Execution model",
    value: "1 CRE",
    detail: "One workflow per user strategy",
  },
  {
    label: "Rescue path",
    value: "Same-chain first",
    detail: "CCIP escalation only when needed",
  },
];

const workflowSteps = [
  {
    title: "Detect",
    description:
      "Scheduled CRE checks monitor positions, read Chainlink Data Feeds, and collect off-chain risk inputs before liquidation risk is visible in the UI.",
    icon: Gauge,
  },
  {
    title: "Evaluate",
    description:
      "The workflow computes aggregate health, checks budget caps, ranks venues by rescue priority, and prepares the exact action plan.",
    icon: DatabaseZap,
  },
  {
    title: "Simulate",
    description:
      "Tenderly-style preflight simulation validates the rescue before execution so bad routes fail early instead of wasting budget mid-incident.",
    icon: Clock3,
  },
  {
    title: "Rescue + Log",
    description:
      "If same-chain liquidity is insufficient, CCIP routes collateral across chains and the workflow writes an immutable on-chain rescue record.",
    icon: Waypoints,
  },
];

const capabilityCards = [
  {
    title: "Cross-protocol risk view",
    copy: "Reprieve merges positions from multiple lending venues into a single health view instead of forcing users to monitor each protocol separately.",
  },
  {
    title: "Autonomous CRE execution",
    copy: "Each user strategy is encoded into a dedicated CRE workflow so monitoring, decisioning, and execution do not depend on a centralized bot.",
  },
  {
    title: "Verified rescue trail",
    copy: "Every rescue action produces a durable audit record with chain, protocol, amount, and execution context for downstream review.",
  },
];

const protocols = [
  { name: "Aave", image: "/aave.png" },
  { name: "Compound", image: "/compound.png" },
  { name: "Morpho", image: "/Morpho.png" },
];

export function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-[#07110d] text-[#f1f4ef]">
      <section className="relative isolate border-b border-white/8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(199,243,107,0.2),_transparent_28%),linear-gradient(180deg,rgba(7,17,13,0.15),rgba(7,17,13,0.88)_72%,#07110d_100%)]" />
        <LightRays
          raysOrigin="top-center"
          raysColor="#dffff1"
          raysSpeed={0.85}
          lightSpread={0.72}
          rayLength={2.8}
          followMouse
          mouseInfluence={0.07}
          noiseAmount={0.02}
          distortion={0.03}
          className="opacity-80"
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d3ff8a]/70 to-transparent" />
        <div className="absolute left-[8%] top-28 size-64 rounded-full bg-[#c7f36b]/10 blur-3xl" />
        <div className="absolute right-[10%] top-20 size-72 rounded-full bg-[#7de6dd]/10 blur-3xl" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-20 pt-6 lg:px-10">
          <header className="flex items-center justify-between gap-4 rounded-full border border-white/10 bg-[#0c1712]/60 px-5 py-3 backdrop-blur-xl">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo_notext.png"
                alt="Reprieve"
                width={72}
                height={72}
                className="h-16 w-16 rounded-2xl border border-white/8 bg-[#0f1914]/90 object-contain p-1.5"
                unoptimized
              />
              <div>
                <div className="text-sm font-semibold tracking-[0.24em] text-[#dff6c2] uppercase">
                  Reprieve
                </div>
                <p className="text-xs text-[#9fb0a4]">
                  Cross-protocol liquidation protection
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-6 text-sm text-[#b2c0b7] md:flex">
              <a href="#how-it-works" className="transition hover:text-white">
                How it works
              </a>
              <a href="#cre-workflow" className="transition hover:text-white">
                CRE workflow
              </a>
              <a href="#coverage" className="transition hover:text-white">
                Coverage
              </a>
            </nav>

            <div className="flex items-center gap-2">
              <Button
                asChild
                size="sm"
                className="shadow-[0_14px_40px_-22px_rgba(199,243,107,0.9)]"
              >
                <Link href="/dashboard">
                  Open dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </header>

          <div className="grid flex-1 items-center gap-16 py-16 xl:grid-cols-[1.15fr_0.85fr] xl:py-24">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#dfff8a]/20 bg-[#dfff8a]/8 px-3 py-1 text-xs font-medium tracking-[0.2em] text-[#d9ff8a] uppercase">
                <Sparkles className="size-3.5" />
                Powered by Chainlink CRE x Data Feeds x CCIP
              </div>

              <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                Stop liquidation risk before it compounds across chains.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#b7c4bc] sm:text-xl">
                Reprieve is a professional monitoring and rescue interface for
                DeFi users with exposure across Aave, Compound, and Morpho. A
                per-user CRE workflow watches position health, simulates rescue
                actions, routes capital with same-chain priority, and records
                the proof on-chain.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full px-6 text-sm"
                >
                  <Link href="/dashboard">
                    Launch product demo
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-8 rounded-[3rem] bg-[radial-gradient(circle,_rgba(199,243,107,0.14),_transparent_62%)] blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,26,21,0.96),rgba(8,15,12,0.98))] p-6 shadow-[0_32px_100px_-40px_rgba(0,0,0,0.85)]">
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#9fb59f]">
                      Live rescue posture
                    </p>
                    <h2 className="mt-2 max-w-3xl text-2xl font-semibold text-white sm:text-3xl">
                      One workflow handling detection to proof.
                    </h2>
                  </div>
                  <div className="inline-flex w-fit self-start rounded-full border border-[#dfff8a]/25 bg-[#dfff8a]/8 px-4 py-2 text-sm font-medium text-[#dfff8a] sm:self-end">
                    CRE Active
                  </div>
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-white/8 bg-black/20 p-5">
                  <div className="flex items-center justify-between text-sm text-[#b7c4bc]">
                    <span>Aggregate health factor</span>
                    <span className="font-semibold text-[#dfff8a]">1.31</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full w-[71%] rounded-full bg-[linear-gradient(90deg,#dfff8a,#74dfd4)]" />
                  </div>

                  <div className="mt-6 space-y-3">
                    {[
                      ["Aave Arbitrum", "At risk", "1.08", "bg-[#f4b565]"],
                      ["Morpho Arbitrum", "Stable", "1.82", "bg-[#7de6dd]"],
                      [
                        "Compound Base",
                        "Reserve source",
                        "2.14",
                        "bg-[#dfff8a]",
                      ],
                    ].map(([name, status, hf, color]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-white">{name}</p>
                          <p className="text-sm text-[#93a69b]">{status}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`size-2 rounded-full ${color}`} />
                          <span className="font-mono text-sm text-[#d8e3dc]">
                            HF {hf}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    "Cron-triggered health checks",
                    "Priority queue for same-chain rescue",
                    "CCIP escalation path",
                    "Immutable on-chain execution log",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-[#b2c0b7]"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#dfff8a]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-10"
      >
        <div>
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#dfff8a]">
              Product overview
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">
              Reprieve turns fragmented DeFi monitoring into a single rescue
              system.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#a9b6ae]">
              The project focuses on preemptive liquidation protection. Users
              configure a personal rescue strategy, define health and budget
              thresholds, and let a CRE workflow handle monitoring and
              execution. The interface then surfaces live state, rescue
              readiness, and the final audit trail.
            </p>
          </div>

          <div className="mt-12 grid gap-6 xl:grid-cols-3">
            {capabilityCards.map((card) => (
              <article
                key={card.title}
                className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(17,26,22,0.92),rgba(10,16,13,0.96))] p-8"
              >
                <div className="inline-flex rounded-2xl border border-[#dfff8a]/15 bg-[#dfff8a]/8 p-3">
                  <Shield className="size-5 text-[#dfff8a]" />
                </div>
                <h3 className="mt-6 max-w-xs text-3xl font-semibold leading-tight text-white">
                  {card.title}
                </h3>
                <p className="mt-5 max-w-md text-base leading-8 text-[#9fb0a5]">
                  {card.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="cre-workflow"
        className="border-y border-white/8 bg-[linear-gradient(180deg,rgba(12,20,16,0.94),rgba(7,12,10,0.96))]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#dfff8a]">
              CRE workflow
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">
              How the CRE workflow works on this project
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#adbbb3]">
              Reprieve uses a per-user Chainlink Runtime Environment workflow as
              the coordination layer. It is not just sending alerts. It
              continuously checks risk, decides the rescue path, validates the
              execution, and records the result as a verifiable log.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-4">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.title}
                  className="relative rounded-[2rem] border border-white/8 bg-white/[0.03] p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="inline-flex rounded-2xl border border-white/10 bg-[#121c17] p-3">
                      <Icon className="size-5 text-[#dfff8a]" />
                    </div>
                    <span className="font-mono text-sm text-[#81958a]">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[#a4b4aa]">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-12 rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(223,255,138,0.08),rgba(125,230,221,0.05)_45%,rgba(255,255,255,0.02))] p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-[#dfff8a]">
                  Execution policy
                </p>
                <h3 className="mt-3 text-3xl font-semibold text-white">
                  Same-chain first, cross-chain only when necessary.
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "CronTrigger runs health checks before liquidation thresholds are reached.",
                  "Data Feeds provide price inputs, while off-chain quant signals enrich the risk model.",
                  "Priority queues determine which protocol should fund the rescue first.",
                  "CCIP and rescue escrow act as the fallback path when liquidity must move across chains.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/8 bg-black/15 p-4 text-sm leading-7 text-[#b3c1b9]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="coverage" className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#dfff8a]">
              Coverage
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">
              Built for multi-venue, multi-chain rescue operations.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#a8b5ad]">
              The frontend presents the product as a clear operator surface:
              setup for strategy deployment, dashboard monitoring for health and
              budget posture, and on-chain logs for post-incident verification.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {protocols.map((protocol) => (
              <article
                key={protocol.name}
                className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,22,18,0.95),rgba(9,14,12,0.98))] p-6 text-center"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-white/8 bg-white/[0.04]">
                  <Image
                    src={protocol.image}
                    alt={protocol.name}
                    width={52}
                    height={52}
                    className="h-12 w-12 object-contain"
                    unoptimized
                  />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">
                  {protocol.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#9aac9f]">
                  Position state is represented as part of a unified rescue
                  decision instead of an isolated protocol alert.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/8 pb-20 pt-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(17,27,22,0.96),rgba(10,16,13,0.98))] p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-[#dfff8a]">
                  Demo routes
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">
                  Explore the landing page, then move directly into the product
                  surfaces.
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#a8b5ad]">
                  The current implementation is a demo-ready frontend with mock
                  data and deterministic rescue flows. It is designed to explain
                  the product clearly while preserving access to the monitoring,
                  setup, and audit experiences.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button asChild size="lg" className="h-12 rounded-full px-6">
                  <Link href="/dashboard">
                    Open dashboard
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
