<aside>
🚨

**The rescue engine, visible.** Where the CRE workflow comes alive — Detect → Evaluate → Simulate → Rescue — all rendered in real-time as the market drops and positions get saved. The most technically dense screen, but told as a story: urgency → intelligence → action → relief.

</aside>

---

## Page Purpose

This is **not a screen users navigate to** — it's an overlay that activates automatically when CRE triggers a rescue. The dashboard transforms: price chart drops, HF gauge drains, CRE execution panel expands stage-by-stage, and rescue animations play across chains. The user watches automation do what no human could do fast enough.

The core loop: **Price drops → HF breaches → CRE activates → Detect → Evaluate → Simulate → Rescue (same-chain + CCIP) → HF restored.**

**Personas served:** DeFi Dave (watches in awe, verifies later), Conservative Carl (sees it working, trusts it more)

**Design north star:** _"You didn't open an app. You didn't click a button. You didn't even know it happened — until the rescue log proved it did."_

---

## Layout Overview

Two phases, one continuous take. **Phase 1: The Trigger** — dashboard with CRE execution panel overlay. **Phase 2: The Rescue** — split-screen showing two chains with CCIP bridge animation.

### Phase 1 — The Trigger (Dashboard + CRE Overlay)

```jsx
┌──────────────────────────────────────────────────────────┐
│  🏦 Reprieve       🛡️ Protection: ACTIVE 🟢             │
│  ⛓️ Chainlink Data Feeds · Live                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ETH/USD                              AGGREGATE HF       │
│  $2,450 ──────────╲                   1.18 → 1.12 →     │
│  $2,380 ───────────╲──╲               1.08 → 1.03 🔴    │
│  $2,310 ────────────────╲──           ← BELOW 1.10      │
│                                                          │
│  ⚠️ ALERT: Aggregate HF 1.03 < threshold 1.10           │
│                                                          │
│  ⛓️ CRE WORKFLOW · EXECUTING                             │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 🔍 DETECT                                    ✅     │ │
│  │  Positions: Aave 1.10, Compound 2.00, Morpho 1.50  │ │
│  │  Prices: Chainlink Data Feeds (DON verified)        │ │
│  │  Quant: vol ↑ 47%, OI shift, funding -0.03%        │ │
│  │  Aggregate HF: 1.03                                 │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │ 🚨 EVALUATE                                  ✅     │ │
│  │  1.03 < 1.10 → BREACH CONFIRMED                    │ │
│  │  Budget: $12.40 / $50.00 remaining                  │ │
│  │  Queue: #2 Compound Arb → #5 Compound Base → CCIP  │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │ 🧪 TENDERLY PRE-SIM                           ✅     │ │
│  │  Simulated → success · Gas: 0.003 ETH              │ │
│  └─────────────────────────────────────────────────────┘ │
│  → Proceeding to RESCUE...                               │
└──────────────────────────────────────────────────────────┘
```

### Phase 2 — The Rescue (Split-Screen, Two Chains)

```jsx
┌────────────────────────┬─────────────────────────────────┐
│  ARBITRUM SEPOLIA      │  BASE SEPOLIA                   │
│                        │                                  │
│  Step 1: Same-chain    │                                  │
│  Compound V3 (HF 2.0) │  Morpho V2 (HF 1.10 🔴)        │
│  → withdraw LINK       │  → needs rescue                 │
│  → repay AAVE debt     │                                  │
│  ✅ HF: 1.10 → 1.31   │                                  │
│                        │                                  │
│  Step 2: Cross-chain   │                                  │
│  ┌──────────────┐  ⛓️ CCIP  ┌──────────────┐            │
│  │ Withdraw     │══════════▶│ Receive      │            │
│  │ from Compound│  Bridge   │ → repay debt │            │
│  └──────────────┘          └──────────────┘            │
│                        │                                  │
│  🔒 rescueInProgress   │  ✅ HF: 1.10 → 1.31            │
│  🛡️ RescueEscrow.sol  │  📨 CCIPReceiver.sol            │
│  (failsafe)            │  (cross-chain receiver)         │
└────────────────────────┴─────────────────────────────────┘
```

---

## Sections & Components

### 1. Price Drop Visualization

| **Element**    | **Description**                                             | **Behavior**                                                                                                                                           |
| -------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Price Chart    | ETH/USD line chart dropping in real-time                    | Line descends visibly. Red color intensifies as price drops further. Chainlink Data Feeds badge stays visible — prices are verifiable                  |
| HF Gauge Drain | Aggregate HF number ticking down: 1.18 → 1.12 → 1.08 → 1.03 | Color transitions: green → yellow → orange → red. Each tick is dramatic — the viewer feels the danger. Threshold line (1.10) glows as HF approaches it |
| Alert Banner   | "⚠️ ALERT: Aggregate HF 1.03 < threshold 1.10"              | Flashes red. Audio: alert tone. The moment CRE activates — this is the pivot                                                                           |

### 2. CRE Execution Panel (Overlay)

Three stages expand sequentially — each one completing before the next begins.

| **Stage**           | **Elements Shown**                                                                                                                           | **Behavior**                                                                                                                                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔍 DETECT           | Position reads (protocol, chain, HF), Chainlink Data Feeds badge, off-chain quant signals (vol, OI, funding, spreads), computed aggregate HF | Expands first. Each data point animates in. Chainlink badge pulses when Data Feeds are read. Quant signals appear as small cards: "vol ↑ 47%", "OI shift", "funding -0.03%". Aggregate HF: 1.03 (red). ✅ check when complete |
| 🚨 EVALUATE         | Threshold comparison (1.03 < 1.10), budget check ($12.40 / $50 remaining), priority queue (ordered source list)                              | Expands second. "BREACH CONFIRMED" flashes red. Budget bar shows remaining capacity. Priority queue builds: 1. Compound Arb (same-chain, HF 2.0), 2. Compound Base (same-chain, HF 2.0), then CCIP escalation. ✅ check       |
| 🧪 TENDERLY PRE-SIM | Simulation status, gas estimate, slippage check                                                                                              | Expands third. "Simulating..." spinner → ✅ success. Gas: 0.003 ETH. Slippage: 0.12%. "Proceeding to RESCUE..." text appears. Brief pause — building anticipation                                                             |

### 3. Same-Chain Rescue Animation

| **Element** | **Description**                      | **Behavior**                                                                                                                             |
| ----------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Source Card | Compound V3 (Arb Sepolia, HF 2.0 🟢) | Withdrawal animation: collateral amount flows out of card. HF slightly decreases (still safe). "Source reserve: max 80% withdrawal" note |
| Target Card | AAVE V4 (Arb Sepolia, HF 1.10 🔴)    | Repay animation: debt reduced. HF ticks up: 1.10 → 1.31 🟢. Green flash: "✅ Position #1 rescued"                                        |
| Flow Arrow  | Animated arrow from source → target  | Shows collateral moving on same chain. Label: "Same-chain rescue · RescueExecutor.sol"                                                   |

### 4. CCIP Cross-Chain Rescue Animation

| **Element**        | **Description**                              | **Behavior**                                                                                                                                                 |
| ------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Source Chain Panel | Arbitrum Sepolia — Compound V3 withdrawal    | Left side of split screen. Withdrawal animates. "🔒 rescueInProgress = true" badge appears. RescueEscrow.sol card glows (failsafe ready)                     |
| CCIP Bridge        | Blue animated arrow spanning both chains     | Center of split screen. CCIP logo. "Bridging..." status. Arrow pulses blue as transfer is in flight. This is the visual centerpiece — give it breathing room |
| Target Chain Panel | Base Sepolia — Morpho V2 receives + repays   | Right side. CCIPReceiver.sol receives funds. Debt repaid. HF ticks up: 1.10 → 1.31 🟢. Green explosion: "✅ RESCUED"                                         |
| Escrow Failsafe    | RescueEscrow.sol highlighted on source chain | Shield icon. Brief mention: "If CCIP fails, funds held safely here." Shown for 2–3s, not dwelled on                                                          |

### 5. Rescue Complete — Dashboard Restored

| **Element**             | **Description**                            | **Behavior**                                                              |
| ----------------------- | ------------------------------------------ | ------------------------------------------------------------------------- |
| All Cards Green         | Every position HF restored above safe zone | Cards transition from red/yellow → green. Aggregate HF: 1.37 🟢. Relief   |
| Protection Still Active | "🛡️ Protection: ACTIVE 🟢" badge           | CRE is still watching. Ready for the next drop. Budget: $16.60 / $50 used |
| Rescue Log Link         | "View Rescue Log →" link                   | Navigates to Rescue History page for verification                         |

---

## Rescue Narration — Voice & Subtitle

### Phase 1 — The Trigger

| **Moment**     | **Voice**                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | **Subtitle**                                                                                                                      | **On Screen**                                                                                                                                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Price drops    | _"Market drops. ETH falls 8 percent. Watch the aggregate health factor — 1.18, 1.12, 1.08, 1.03. Below your threshold. Your positions are in danger."_                                                                                                                                                                                                                                                                                                                      | `ETH -8% · Aggregate HF: 1.18 → 1.03 · Below 1.10 threshold`                                                                      | Price chart dropping. HF gauge draining: green → yellow → orange → red. Alert flashes: "⚠️ HF 1.03 < 1.10".                                                                                                                 |
| CRE activates  | _"Your CRE activates. No human intervention. No button to press. No app to open. The bot triggers. The CRE takes over."_                                                                                                                                                                                                                                                                                                                                                    | `CRE activates · No human · No button · Bot triggers → CRE executes`                                                              | "⛓️ CRE WORKFLOW ACTIVATING" banner burns in. Workflow execution panel begins expanding.                                                                                                                                    |
| Detect stage   | _"Detect. CRE reads your positions from all three protocols — Aave, Compound, Morpho — across both chains. Fetches prices from Chainlink Data Feeds. The same feeds, read inside the CRE workflow, verifiable by the Decentralized Oracle Network. Then off-chain quant signals: volatility up 47 percent. Open interest shifting. Funding rates negative. These signals enrich the risk model beyond what any on-chain-only tool can see. Aggregate health factor: 1.03."_ | `🔍 Detect · 3 protocols · 2 chains · Data Feeds (DON verified) · Off-chain quant: vol ↑47%, OI shift, funding -0.03% · HF: 1.03` | DETECT stage expands. Position reads animate one by one. Chainlink Data Feeds badge pulses blue. Off-chain signal cards appear: "vol ↑ 47%", "OI shift", "funding -0.03%". Aggregate HF computation → 1.03 (red). ✅ check. |
| Evaluate stage | _"Evaluate. 1.03 is below your 1.10 threshold — breach confirmed. Budget check: 12.40 spent out of 50 daily cap — plenty of room. Priority queue builds: Compound on Arbitrum is same-chain and safest — health factor 2.0. Goes first. If that is not enough, Compound on Base. And if same-chain sources are exhausted — CCIP cross-chain."_                                                                                                                              | `🚨 Evaluate · Breach confirmed · Budget OK ($12.40/$50) · Queue: Compound Arb → Compound Base → CCIP`                            | EVALUATE stage expands. Threshold comparison: 1.03 < 1.10 → red flash → "BREACH CONFIRMED". Budget bar: $12.40 used / $50 cap. Priority queue builds: numbered list with protocol + chain + HF for each source. ✅ check.   |
| Tenderly sim   | _"Tenderly pre-simulation. Before touching a single dollar, CRE simulates the entire rescue transaction. Gas estimate: 0.003 ETH. Slippage: 0.12 percent. Simulation passes. Proceeding to rescue."_                                                                                                                                                                                                                                                                        | `🧪 Tenderly sim · Gas: 0.003 ETH · Slippage: 0.12% · Pass ✅ → Rescue`                                                           | TENDERLY stage expands. Simulation spinner → ✅ success. Gas and slippage numbers appear. "Proceeding to RESCUE..." text. Brief dramatic pause.                                                                             |
| Unified moment | _"All of this — detect, evaluate, simulate — happened in one CRE execution. One workflow. No separate contracts. No centralized server. Trustless. Verifiable. And it took seconds."_                                                                                                                                                                                                                                                                                       | `One CRE execution · One workflow · Trustless · Verifiable · Seconds`                                                             | All three stages glow green simultaneously. "1 Unified Workflow" badge. DON verification icon. Transition to rescue phase.                                                                                                  |

### Phase 2 — The Rescue

| **Moment**         | **Voice**                                                                                                                                                                                                                                                                                                            | **Subtitle**                                                                            | **On Screen**                                                                                                                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Same-chain rescue  | _"Rescue begins. Priority queue says: same-chain first. CRE withdraws LINK collateral from Compound on Arbitrum — health factor 2.0, the safest source. Repays AAVE V4 debt on the same chain. Health factor: 1.10 to 1.31. First position stabilized. No bridge needed. Fast. Cheap."_                              | `Same-chain first · Compound → AAVE (Arb) · HF: 1.10 → 1.31 ✅ · Fast + cheap`          | Arbitrum panel: Compound card → withdrawal animation → arrow → AAVE card → repay → HF ticks up green: 1.10 → 1.31. ✅ "Position #1 rescued". Source reserve note: "80% max withdrawal".                            |
| Escalation needed  | _"But Morpho V2 is on Base Sepolia — still at risk. Health factor 1.10. Same-chain sources on Base are not sufficient. The CRE escalates to cross-chain rescue via Chainlink CCIP."_                                                                                                                                 | `Morpho on Base · HF 1.10 🔴 · Same-chain insufficient · Escalate → CCIP`               | "⚠️ Same-chain insufficient on Base" alert. Arrow points across to Base Sepolia panel. CCIP bridge icon ignites blue between chains.                                                                               |
| CCIP bridge        | _"CCIP message sent. Withdraw from Compound on Arbitrum — bridge the collateral to Base Sepolia — repay Morpho V2 debt. Cross-chain lock activates: rescueInProgress blocks any concurrent rescues while the transfer is in flight. One rescue at a time. No race conditions."_                                      | `CCIP: Arb → Base · Withdraw → Bridge → Repay · Cross-chain lock · No race conditions`  | Split screen: left chain sends, CCIP bridge animation (blue arrow spanning chains, pulsing), right chain waits. "🔒 rescueInProgress = true" badge on source chain. Transfer in flight — the dramatic centerpiece. |
| Escrow failsafe    | _"And if CCIP fails? RescueEscrow. Funds are held safely on the source chain. The user can claim them. Or the protocol retries. No funds lost in transit. Ever."_                                                                                                                                                    | `RescueEscrow.sol · Failsafe · Funds safe if CCIP fails · No loss`                      | RescueEscrow.sol card highlights on source chain. Shield icon. "No funds lost" text. Brief — 3s then moves on.                                                                                                     |
| Rescue lands       | _"Transfer lands. CCIPReceiver on Base confirms. Morpho debt repaid. Health factor: 1.10 to 1.31. Position rescued. Both chains. Both positions. One unified CRE workflow handled everything."_                                                                                                                      | `CCIPReceiver ✅ · Morpho repaid · HF: 1.10 → 1.31 · Both chains · 1 CRE`               | Base panel: CCIPReceiver.sol receives → debt repaid → HF ticks up: 1.10 → 1.31. Green explosion: "✅ RESCUED". Both panels glow green. "1 Unified CRE" badge center.                                               |
| Dashboard restored | _"Dashboard restored. Every position green. Aggregate health factor: 1.37. All three protocols safe. Both chains safe. And Reprieve is still active — watching, ready for the next drop. You didn't open an app. You didn't click a button. You didn't even know it happened — until the rescue log proved it did."_ | `All green 🟢 · Aggregate HF: 1.37 · Still active · Always watching · Proof, not trust` | Dashboard returns. All HF gauges green. Aggregate: 1.37 🟢. "🛡️ Protection: ACTIVE" glowing green. Budget: $16.60 / $50 used. Screen dims slightly → rescue log card glows: "Proof. Not trust."                    |

---

## States & Edge Cases

| **State**              | **Trigger**                               | **UI Behavior**                                                                                                                                 | **Voice (if shown)**                                                                                                                              |
| ---------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🧪 Sim Fails           | Tenderly simulation returns failure       | TENDERLY stage shows ❌. "Simulation failed — insufficient liquidity on source." CRE aborts. Dashboard shows: "Rescue aborted — reason logged." | _"Simulation failed. CRE aborts before touching your funds. The reason is logged. Safety first — always."_                                        |
| 🌉 CCIP Delayed        | CCIP transfer taking longer than expected | Bridge animation continues. "Transfer in flight — estimated 2 min remaining." Cross-chain lock badge stays active. No timeout panic.            | _"CCIP transfer in flight. Cross-chain lock active — no concurrent rescues. Funds are safe. Just waiting for confirmation."_                      |
| 🔒 CCIP Failed         | CCIP transfer fails                       | Escrow activates. Source chain shows: "🛡️ Funds in RescueEscrow.sol — safe." Retry button. "RescueFailed" event emitted.                        | _"CCIP failed. But your funds are safe — held in RescueEscrow on the source chain. Claim them or let the protocol retry."_                        |
| 💰 Budget Exhausted    | Daily budget cap reached                  | CRE detects breach but shows: "⚠️ Budget cap reached ($50/$50). Rescue deferred until midnight UTC reset." Dashboard shows orange warning.      | _"Budget cap reached. CRE detected the breach but cannot execute — daily limit hit. Resets at midnight UTC. Consider increasing your daily cap."_ |
| 📉 Rapid Deterioration | HF drops >20% between consecutive reports | "🚨 URGENT RESCUE" event emitted. CRE bypasses normal cadence — immediate execution.                                                            | _"Rapid deterioration. Health factor dropped more than 20 percent since last check. Urgent rescue triggered immediately."_                        |
| 🔄 Fall-Through        | Source #1 has insufficient collateral     | Queue advances: "Source #1 insufficient → trying #2." Priority queue animation shows progression down the list.                                 | _"First source insufficient. Fall-through to source number two. The priority queue keeps going until your position is safe."_                     |

---

## Data Dependencies

| **Data**                     | **Source**                                  | **Refresh**                            |
| ---------------------------- | ------------------------------------------- | -------------------------------------- |
| Live prices + HF computation | Chainlink Data Feeds (inside CRE)           | Per CRE cycle (verifiable)             |
| Off-chain quant signals      | External APIs (vol, OI, funding, spreads)   | Per CRE cycle                          |
| Tenderly simulation          | Tenderly API (inside CRE)                   | On rescue trigger (best-effort)        |
| Rescue execution             | RescueExecutor.sol via ReprieveReceiver.sol | On confirmed breach                    |
| CCIP transfer status         | Chainlink CCIP                              | Real-time (Arb Sepolia ↔ Base Sepolia) |
| Rescue log                   | RescueLog.sol (on-chain)                    | After each rescue action               |

---

## References

- **JTBD:** [Reprieve — Jobs to be Done](https://www.notion.so/Reprieve-Jobs-to-be-Done-9cc0c8daa3d94c5e84971317eb403693?pvs=21) — Stories 3 (Rescue) + Flows 2–3
- **Demo Script:** [Reprieve — Demo Script](https://www.notion.so/Reprieve-Demo-Script-d3ed17f9b91640319be9d9886a03eafe?pvs=21) — Scenes 4 (Trigger) + 5 (Rescue)
- **Architecture:** [Reprieve — Architecture](https://www.notion.so/Reprieve-Architecture-4bffd8ba9f0849f49ee3d505e4896197?pvs=21) — CRE workflow execution + contract interactions
- **TAPL Reference:** [Jobs to be Done](https://www.notion.so/Jobs-to-be-Done-1022f7d57f4b42738639641a80649dc5?pvs=21) — CRE workflow UI flows
