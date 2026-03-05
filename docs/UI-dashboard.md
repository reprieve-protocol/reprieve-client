<aside>
📊

**The command center.** Where you see every position, every protocol, every chain — one aggregate risk score. Inspired by [DeFi Saver](https://defisaver.com/)'s dashboard clarity, but multi-protocol, multi-chain, and Chainlink-verified.

</aside>

---

## Page Purpose

This is the first screen users see and the page they return to after every action. Everything about risk lives here — individual health factors, aggregate score, protection status, and Chainlink Data Feeds verification badge.

The core loop: **See positions → Read aggregate HF → Understand risk → Take action (or let CRE handle it).**

**Personas served:** DeFi Dave (primary — multi-protocol farmer), Conservative Carl (secondary — safety-first lender)

**Design north star:** _"One number tells me if I'm safe. Everything else is detail."_

---

## Layout Overview

The dashboard is a **dark-themed DeFi interface** — clean, professional, data-dense but not cluttered. Positions from three protocols render as cards on the left. The aggregate health factor gauge dominates the right. Chainlink Data Feeds badge is always visible — trust is ambient, not hidden.

```jsx
┌──────────────────────────────────────────────────────────┐
│  🏦 Reprieve            ⛓️ Chainlink Data Feeds · Live   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  POSITIONS                              AGGREGATE HF     │
│  ┌─────────────────────────────────┐   ┌──────────────┐ │
│  │ AAVE V4 (Arb Sepolia)          │   │              │ │
│  │ ETH/USDC · HF: 1.10 🔴         │   │    1.18      │ │
│  │ Collateral: $1,000              │   │    🟡        │ │
│  ├─────────────────────────────────┤   │              │ │
│  │ Compound V3 (Arb Sepolia)      │   │  ████████░░  │ │
│  │ LINK/USDC · HF: 2.00 🟢        │   │  threshold:  │ │
│  ├─────────────────────────────────┤   │  1.10 ───    │ │
│  │ Morpho V2 (Arb Sepolia)        │   └──────────────┘ │
│  │ USDC/ETH · HF: 1.50 🟡         │                     │
│  ├─────────────────────────────────┤   🛡️ Protection:    │
│  │ AAVE V4 (Base Sepolia)         │     NOT ACTIVE      │
│  │ LINK/USDC · HF: 1.50 🟡        │   ┌──────────────┐ │
│  ├─────────────────────────────────┤   │ Setup Now →  │ │
│  │ Compound V3 (Base Sepolia)     │   └──────────────┘ │
│  │ ETH/USDC · HF: 2.00 🟢         │                     │
│  ├─────────────────────────────────┤   BUDGET            │
│  │ Morpho V2 (Base Sepolia)       │   $0.00 / $50.00   │
│  │ ETH/LINK · HF: 1.10 🔴         │   daily cap         │
│  └─────────────────────────────────┘                     │
│                                                          │
│  ⛓️ Prices: Chainlink Data Feeds (verifiable by DON)    │
└──────────────────────────────────────────────────────────┘
```

> _Reference: DeFi Saver dashboard for multi-protocol position clarity, adapted for Reprieve's cross-chain rescue context._

---

## Sections & Components

### 1. Top Bar

| **Element**     | **Description**                      | **Behavior**                                                                                                   |
| --------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Logo + Brand    | 🏦 Reprieve logo, left-aligned       | Click returns to dashboard from any sub-page                                                                   |
| Chainlink Badge | ⛓️ Chainlink Data Feeds · Live       | Always visible. Pulses blue on each price refresh. Hover shows last update timestamp + DON verification status |
| Wallet          | Connected wallet address (truncated) | Click opens wallet details + disconnect option                                                                 |

### 2. Position Cards (Left Panel)

Each position renders as a card. Six cards total in the demo — three protocols × two chains.

| **Element**      | **Description**                       | **Behavior**                                                                                                     |
| ---------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Protocol + Chain | e.g. "AAVE V4 (Arb Sepolia)"          | Protocol icon + chain badge. Chain color-coded: Arbitrum = blue, Base = purple                                   |
| Pair             | Collateral/Debt pair, e.g. "ETH/USDC" | Shows token icons                                                                                                |
| Health Factor    | Individual HF with color indicator    | 🟢 ≥ 1.5 safe · 🟡 1.2–1.5 moderate · 🟠 1.05–1.2 danger · 🔴 < 1.05 critical. Updates on each CRE trigger cycle |
| Collateral Value | USD value of collateral               | Computed from Chainlink Data Feeds prices                                                                        |
| Debt Value       | USD value of outstanding debt         | Same price source                                                                                                |
| Position Token   | aToken / cToken / vault share type    | Shows approval status: ✅ approved or ⚠️ needs approval                                                          |

**Card color states:**

- **Green border** — HF ≥ 1.5, safe zone, potential rescue source
- **Yellow border** — HF 1.2–1.5, moderate risk, rebalance candidate
- **Orange border** — HF 1.05–1.2, danger zone, approaching threshold
- **Red border + pulse** — HF < 1.05, critical — CRE should be rescuing this
- **Gold shimmer** — actively being rescued right now (CRE in progress)

### 3. Aggregate Health Factor Gauge (Right Panel)

The gauge is the **emotional center** of the dashboard — one number that answers "Am I safe?"

| **Element**         | **Description**                                        | **Behavior**                                                                               |
| ------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Aggregate HF Number | Large, bold number (e.g. 1.18)                         | Weighted average across all positions. Color matches risk level. Updates on each CRE cycle |
| Risk Gauge Bar      | Horizontal bar showing HF relative to threshold        | Green fill = safe buffer. Shrinks as HF drops. Red zone marks threshold line               |
| Threshold Line      | Dashed line at user's configured threshold (e.g. 1.10) | If aggregate HF crosses below this, CRE triggers rescue                                    |
| Quant Signal Badges | Small badges: vol, OI, funding rate status             | Show the off-chain quant signals feeding into aggregate HF computation. Hover for details  |

### 4. Protection Status Card (Right Panel)

| **Element**         | **Description**                  | **Behavior**                                                                                       |
| ------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------- |
| Status Badge        | 🛡️ ACTIVE 🟢 or 🛡️ NOT ACTIVE 🔴 | When active: shows strategy name + CRE workflow ID. When inactive: pulses red with "Setup Now" CTA |
| Budget Tracker      | $X.XX / $50.00 daily cap         | Progress bar. Resets at midnight UTC. Shows per-rescue cap too on hover                            |
| Last Check          | "Last CRE check: 42s ago"        | Countdown to next CronTrigger cycle. Reassures user that monitoring is live                        |
| Setup / Edit Button | "Setup Now" or "Edit Strategy"   | Navigates to Setup page                                                                            |

---

## Dashboard Narration — Voice & Subtitle

This is how the dashboard is **presented and spoken about** in the demo video (Scene 2) and in product walkthroughs. Every element has a voice line and subtitle — not just a note.

### Opening — The Dashboard Appears

| **Moment**      | **Voice**                                                                                                                                                                                                                     | **Subtitle**                                                               | **On Screen**                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard loads | _"This is Reprieve. One dashboard — every position, every protocol, every chain. Aave, Compound, Morpho. Two chains. Six positions. All live."_                                                                               | `One dashboard · Aave + Compound + Morpho · 2 chains · 6 positions · Live` | Dashboard emerges from dark. Six position cards animate in one by one — three Arbitrum (blue badge), three Base (purple badge). HF numbers tick live. |
| Chainlink badge | _"Prices come direct from Chainlink Data Feeds — the same oracle infrastructure securing billions in DeFi. Every health factor you see is computed from verifiable, DON-signed price data. Not an approximation. The truth."_ | `Chainlink Data Feeds · DON-signed · Verifiable on-chain`                  | Zoom on ⛓️ Chainlink Data Feeds badge. Blue pulse. Price feed indicators glow. "Verifiable by DON" text fades in below badge.                         |

### Position Cards — Reading the Risk

| **Moment**          | **Voice**                                                                                                                                                                                    | **Subtitle**                                                     | **On Screen**                                                                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Red positions       | _"Two positions in the red zone. AAVE on Arbitrum — health factor 1.10. Morpho on Base — also 1.10. One bad candle and these get liquidated. The protocol takes your collateral. You lose."_ | `2 positions 🔴 · HF 1.10 · One bad candle = liquidation`        | Camera pans to Position #1 (AAVE, Arb, HF 1.10 🔴) — red border pulses. Then Position #6 (Morpho, Base, HF 1.10 🔴) — same red pulse. Both flash urgently. |
| Safe positions      | _"But you also have safe positions. Compound on Arbitrum — health factor 2.0. Compound on Base — 2.0. These are your rescue sources. They have collateral to spare."_                        | `2 positions 🟢 · HF 2.0 · Rescue sources — collateral to spare` | Pan to Position #2 and #5 (Compound, both chains, HF 2.0 🟢) — green borders glow warm. "Rescue source" label animates next to each.                       |
| Rebalance positions | _"And two in the middle — Morpho on Arbitrum, AAVE on Base. Health factor 1.5. Not critical, but not safe. Rebalance candidates."_                                                           | `2 positions 🟡 · HF 1.5 · Rebalance zone`                       | Positions #3 and #4 highlighted — yellow borders. "Rebalance" label.                                                                                       |

### Aggregate Health Factor — The One Number

| **Moment**     | **Voice**                                                                                                                                                                                                                                                                       | **Subtitle**                                                                   | **On Screen**                                                                                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Aggregate HF   | _"Your aggregate health factor — 1.18. That is a weighted average across all six positions, computed using Chainlink Data Feeds plus off-chain quant signals. Volatility. Open interest. Funding rates. CEX-DEX spreads. Not just on-chain numbers — a complete risk picture."_ | `Aggregate HF: 1.18 · Chainlink + off-chain quant · Vol, OI, funding, spreads` | Aggregate HF gauge zooms in. Number 1.18 pulses yellow. Quant signal badges animate in one by one: "vol", "OI", "funding", "spreads" — each connected by a glowing line to the aggregate number. |
| Threshold line | _"Your threshold is 1.10. The gauge shows how much buffer you have. Right now — close. An 8 percent ETH drop pushes you below. And then Reprieve takes over."_                                                                                                                  | `Threshold: 1.10 · Buffer: thin · 8% ETH drop = CRE activates`                 | Threshold dashed line marked at 1.10. Gauge bar shows thin green buffer between 1.18 and 1.10. Dotted arrow shows 8% drop → below line. Red zone glows below threshold.                          |

### Protection Status — The Call to Action

| **Moment**     | **Voice**                                                                                                                                                                                  | **Subtitle**                                                        | **On Screen**                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Protection off | _"Right now, protection is off. No automation. If you close this browser tab, nobody is watching your six positions. Nobody is computing your aggregate risk. Nobody is ready to rescue."_ | `Protection: OFF · No automation · Close the tab = no one watching` | "🛡️ Protection: NOT ACTIVE" pulses red. Browser tab icon briefly flickers — visual of "closing the tab." Empty, vulnerable feeling.  |
| CTA            | _"Let's change that."_                                                                                                                                                                     | `Let's change that.`                                                | "Setup Now →" button glows blue. Cursor moves toward it. The entire dashboard dims slightly except the button — it is the next step. |

---

## States & Edge Cases

| **State**                  | **Trigger**                     | **UI Behavior**                                                                                                               | **Voice (if shown in demo)**                                                                                                        |
| -------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 🟢 All Safe                | All HFs ≥ 1.5                   | All cards green. Aggregate gauge full. Protection badge calm green.                                                           | _"Everything green. Your positions are healthy. Reprieve is watching — but there's nothing to rescue."_                             |
| 🔴 Breach Active           | Aggregate HF < threshold        | Aggregate gauge turns red. Alert banner: "⚠️ CRE ACTIVATING". Cards involved pulse gold.                                      | _"Breach. Aggregate health factor below threshold. Your CRE workflow is activating — rescue in progress."_                          |
| 🟡 Rescue In Progress      | CRE executing rescue            | Active rescue overlay. Source card shows withdrawal animation. Target card shows repay animation. CCIP bridge if cross-chain. | _"Rescue executing. Collateral moving from your safest source to the endangered position. Watch the health factors recover."_       |
| ⚪ No Positions            | New user, no lending positions  | Empty state: "No positions detected. Connect a wallet with active lending positions on Aave, Compound, or Morpho."            | _"Connect your wallet. Reprieve auto-scans your positions across all supported protocols. No manual import needed."_                |
| 🔵 Protection Active, Idle | CRE deployed, no breach         | Shield badge green. "Last check: Xs ago" counter. Budget tracker shows remaining capacity.                                    | _"Protection active. CRE checked 12 seconds ago. Budget: 94 percent remaining. All quiet."_                                         |
| 🟠 Stale Data              | All protocol reads > 30 min old | Warning banner: "⚠️ Data may be stale — last update 32 min ago." HF numbers shown with ⚠️ icon.                               | _"Stale data warning. Protocol reads are older than 30 minutes. CRE skips rescue triggers on outdated information — safety first."_ |

---

## Navigation From This Page

- **Setup Now / Edit Strategy** → Setup page
- **Position card click** → Expanded position detail (protocol page link)
- **Rescue History link** → Rescue History & Verification page
- **Wallet badge** → Wallet connect / disconnect

---

## Data Dependencies

| **Data**                   | **Source**                                          | **Refresh**                        |
| -------------------------- | --------------------------------------------------- | ---------------------------------- |
| Positions + individual HFs | Protocol adapters (Aave V4, Compound V3, Morpho V2) | On each CRE trigger cycle          |
| Prices (ETH, LINK, USDC)   | Chainlink Data Feeds (inside CRE workflow)          | Verifiable on-chain, per CRE cycle |
| Off-chain quant signals    | External APIs (vol, OI, funding, spreads)           | Per CRE cycle                      |
| Aggregate HF               | CRE computation (weighted avg + quant)              | Per CRE cycle                      |
| Protection status          | CRE Registry (workflow active/inactive)             | On deploy/undeploy                 |
| Budget spend               | CRE workflow config                                 | After each rescue action           |

---

## References

- **JTBD:** [Reprieve — Jobs to be Done](https://www.notion.so/Reprieve-Jobs-to-be-Done-9cc0c8daa3d94c5e84971317eb403693?pvs=21) — Stories 1 (Monitor) & 2 (Protect)
- **Demo Script:** [Reprieve — Demo Script](https://www.notion.so/Reprieve-Demo-Script-d3ed17f9b91640319be9d9886a03eafe?pvs=21) — Scene 2 (Dashboard)
- **Architecture:** [Reprieve — Architecture](https://www.notion.so/Reprieve-Architecture-4bffd8ba9f0849f49ee3d505e4896197?pvs=21) — position reading + HF computation
- **TAPL Reference:** [UI · Main Page — Grid & Tap](https://www.notion.so/UI-Main-Page-Grid-Tap-d1d2bc1a3d2b4d1bb5af6df1fe765b83?pvs=21) — layout inspiration
