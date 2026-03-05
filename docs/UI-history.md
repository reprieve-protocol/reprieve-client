<aside>
📝

**The receipt book.** Where every rescue action is proven — on-chain, immutable, queryable. Not a dashboard of opinions. A ledger of mathematical facts. Inspired by block explorer clarity, but contextualized: you see _what happened, why, and what it cost_ — not raw transaction data.

</aside>

---

## Page Purpose

This is the **verification layer** — the page users visit after a rescue (or anytime) to audit every action Reprieve has taken on their behalf. Every entry links to an on-chain transaction. Every field is sourced from `RescueLog.sol`. The CRE workflow execution is verifiable by the DON.

The core loop: **Open history → See rescue entries → Click any entry → Verify on-chain → Trust earned.**

**Personas served:** DeFi Dave (primary — wants mathematical proof), Conservative Carl (checks weekly to confirm protection is working)

**Design north star:** _"Centralized bots are a black box. This is a glass box."_

---

## Layout Overview

The history page is a **clean, monospace-accented log view** — dark theme, structured entries, every field verifiable. Left side: rescue entry list (scrollable). Right side: expanded detail panel for the selected entry. Budget summary at the top. Pre/post HF comparison is the emotional payoff of each entry.

```jsx
┌──────────────────────────────────────────────────────────┐
│  📝 RESCUE HISTORY          ⛓️ On-chain · RescueLog.sol  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  BUDGET SUMMARY                                          │
│  Today: $16.60 / $50.00 daily cap · 2 rescues executed   │
│  All-time: 7 rescues · $42.10 total spend                │
│                                                          │
│  RESCUE LOG                         DETAIL PANEL         │
│  ┌─────────────────────────────┐   ┌──────────────────┐  │
│  │ #2 · Cross-chain (CCIP)    │◀──│ Rescue #2        │  │
│  │  14:32:11 UTC · Base       │   │                  │  │
│  │  Compound → Morpho         │   │ Type: CCIP       │  │
│  │  $3,000 WETH               │   │ Source: Compound │  │
│  │  HF: 1.10 → 1.31 🟢       │   │  V3 (Arb Sep)   │  │
│  ├─────────────────────────────┤   │ Target: Morpho   │  │
│  │ #1 · Same-chain            │   │  V2 (Base Sep)  │  │
│  │  14:32:07 UTC · Arb        │   │ Amount: $3,000   │  │
│  │  Compound → AAVE           │   │  WETH            │  │
│  │  $4,200 USDC               │   │ Gas: 0.004 ETH   │  │
│  │  HF: 1.10 → 1.31 🟢       │   │ CCIP: 0.1 LINK   │  │
│  └─────────────────────────────┘   │ HF: 1.10 → 1.31 │  │
│                                    │                  │  │
│                                    │ Tx: 0x2b8e…4f7a │  │
│                                    │ [Verify ↗]       │  │
│                                    │ CRE: wf-0x9a1…  │  │
│                                    │ [DON Proof ↗]    │  │
│                                    └──────────────────┘  │
│                                                          │
│  ⛓️ Every entry from RescueLog.sol · Immutable · Anyone  │
│     can read · DON verified                              │
└──────────────────────────────────────────────────────────┘
```

> _Reference: Block explorer transaction detail views for structure; DeFi Saver history panel for context-aware field labeling._

---

## Sections & Components

### 1. Top Bar

| **Element**       | **Description**             | **Behavior**                                                                                                     |
| ----------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Page Title        | 📝 RESCUE HISTORY           | Static. Left-aligned. Monospace accent.                                                                          |
| On-chain Badge    | ⛓️ On-chain · RescueLog.sol | Always visible. Communicates: this data is immutable, not from a backend database. Hover shows contract address. |
| Back to Dashboard | ← Dashboard link            | Returns to main dashboard. Protection status badge visible in header for continuity.                             |

### 2. Budget Summary Bar

| **Element**        | **Description**                                     | **Behavior**                                                                      |
| ------------------ | --------------------------------------------------- | --------------------------------------------------------------------------------- |
| Daily Spend        | "$16.60 / $50.00 daily cap"                         | Progress bar. Green when < 50%, yellow 50–80%, red > 80%. Resets at midnight UTC. |
| Daily Rescue Count | "2 rescues executed today"                          | Simple counter. Resets daily.                                                     |
| All-Time Stats     | Total rescues · Total spend · Estimated value saved | "7 rescues · $42.10 spent · ~$18,400 saved from liquidation" — the ROI story      |

### 3. Rescue Entry List (Left Panel)

Each rescue renders as a compact card in a scrollable list. Most recent first.

| **Element**   | **Description**                              | **Behavior**                                                                                |
| ------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Rescue Number | Sequential: #1, #2, #3…                      | Matches on-chain log index. Click selects entry → detail panel populates                    |
| Type Badge    | "Same-chain" or "Cross-chain (CCIP)"         | Color-coded: same-chain = blue, CCIP = purple with bridge icon                              |
| Timestamp     | UTC time from on-chain log                   | e.g. "14:32:07 UTC". Hover shows block number                                               |
| Route Summary | "Compound → AAVE" (source → target protocol) | Protocol icons + names. Chain badge if cross-chain                                          |
| Amount        | "$4,200 USDC" or "$3,000 WETH"               | Token icon + USD value + token symbol                                                       |
| HF Change     | "HF: 1.10 → 1.31 🟢"                         | Pre → post health factor. Color: red start → green end. The emotional payoff — did it work? |

**Entry color states:**

- **Green left-border** — rescue successful, HF restored above threshold
- **Orange left-border** — rescue partial (HF improved but still below threshold, fall-through to next source)
- **Red left-border** — rescue failed (simulation failed, CCIP failed → funds in escrow)
- **Purple left-border** — cross-chain (CCIP) rescue

### 4. Detail Panel (Right Panel)

Expanded view of the selected rescue entry. Every field maps to an on-chain log field.

| **Element**       | **Description**                             | **Behavior**                                                                                                                                         |
| ----------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rescue Type       | Same-chain or CCIP cross-chain              | Full label with chain names: "Same-chain (Arbitrum Sepolia)" or "Cross-chain: Arb Sepolia → Base Sepolia"                                            |
| Source Protocol   | Protocol + chain + position details         | e.g. "Compound V3 (Arbitrum Sepolia) · HF before: 2.00 · Withdrew: $4,200 USDC"                                                                      |
| Target Protocol   | Protocol + chain + debt repaid              | e.g. "AAVE V4 (Arbitrum Sepolia) · Debt repaid: $4,200 USDC"                                                                                         |
| Amount Moved      | Token + USD value                           | Exact amount withdrawn from source and applied to target                                                                                             |
| Gas Cost          | ETH amount                                  | e.g. "0.002 ETH (~$4.80)". Counted against daily budget                                                                                              |
| CCIP Fee          | LINK amount (only for cross-chain)          | e.g. "0.1 LINK (~$1.20)". Only shown for CCIP rescues                                                                                                |
| HF Before → After | Pre/post health factor comparison           | Large, bold display. Red number → green number with animated arrow. **This is the emotional center of the detail panel.** Shows: "1.10 🔴 → 1.31 🟢" |
| Transaction Hash  | Truncated tx hash with copy + external link | Click "Verify on-chain ↗" opens block explorer. Monospace font. Copy button.                                                                         |
| CRE Workflow ID   | Workflow execution reference                | Click "DON Proof ↗" opens CRE Registry verification. DON multi-node icon.                                                                            |
| Timestamp         | Full UTC timestamp + block number           | "14:32:07 UTC · Block #48,291,033"                                                                                                                   |

---

## History Narration — Voice & Subtitle

This is how the rescue history is **presented and spoken about** in the demo video (Scene 6) and in product walkthroughs. Every element has a voice line and subtitle — fully scripted, not noted.

### Opening — The Log Appears

| **Moment**         | **Voice**                                                                                                                                                                                                    | **Subtitle**                                                           | **On Screen**                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| History page opens | _"Every action — on-chain. RescueLog.sol. Not a backend database. Not a CSV export. An immutable, on-chain record that anyone can read. This is what trustless looks like."_                                 | `RescueLog.sol · On-chain · Immutable · Anyone can read · Trustless`   | Rescue History page emerges. ⛓️ badge glows. "On-chain · RescueLog.sol" header prominent. Log entries fade in one by one.                                |
| Budget summary     | _"Budget summary. Today: $16.60 spent out of your $50 daily cap. Two rescues executed. All-time: 7 rescues, $42.10 total spend. And roughly $18,400 saved from liquidation. That is the ROI of automation."_ | `Today: $16.60/$50 · 2 rescues · All-time: 7 rescues · ~$18,400 saved` | Budget summary bar animates. Daily progress bar fills to 33%. All-time stats counter ticks up. "~$18,400 saved" number pulses green — the payoff metric. |

### Rescue Entries — Reading the Proof

| **Moment**             | **Voice**                                                                                                                                                                                                                                                      | **Subtitle**                                                                                                        | **On Screen**                                                                                                                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry #1 — Same-chain  | _"Rescue one. Same-chain. Compound V3 to AAVE V4, both on Arbitrum Sepolia. CRE withdrew $4,200 USDC from Compound — your safest source, health factor 2.0 — and repaid your AAVE debt. Gas: 0.002 ETH. Health factor: 1.10 to 1.31. Position saved."_         | `#1 Same-chain · Compound → AAVE (Arb) · $4,200 USDC · Gas: 0.002 ETH · HF: 1.10 → 1.31 ✅`                         | Entry #1 card highlights. Detail panel populates field by field — source, target, amount, gas, HF change. HF comparison animates: red 1.10 → green 1.31. Transaction hash appears in monospace.       |
| Entry #2 — Cross-chain | _"Rescue two. Cross-chain. Compound V3 on Arbitrum — bridged via Chainlink CCIP to Base Sepolia — repaid Morpho V2 debt. $3,000 WETH. Gas: 0.004 ETH. CCIP fee: 0.1 LINK. Health factor: 1.10 to 1.31. Two chains. One CRE workflow. Both positions rescued."_ | `#2 Cross-chain (CCIP) · Compound Arb → Morpho Base · $3,000 WETH · Gas: 0.004 ETH + 0.1 LINK · HF: 1.10 → 1.31 ✅` | Entry #2 card highlights — purple CCIP badge. Detail panel: cross-chain route diagram (Arb → Base). CCIP fee line item. HF comparison: 1.10 → 1.31. Both entries now visible with green left-borders. |

### Verification — Proving It

| **Moment**               | **Voice**                                                                                                                                                                                                                                                     | **Subtitle**                                                                     | **On Screen**                                                                                                                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Transaction verification | _"Click any transaction — verify it yourself. This hash links to the on-chain rescue log. Every field you see here exists on-chain: protocol, amount, source chain, target chain, gas cost, timestamp. Immutable. Permanent."_                                | `Click any Tx · Verify on-chain ↗ · Every field on-chain · Immutable`            | Cursor clicks "Verify on-chain ↗" link on Entry #2. Tx hash glows. Block explorer preview shows the RescueLog event. Fields highlighted: protocol, amount, chains, gas, timestamp.                           |
| DON verification         | _"And the CRE execution itself — verifiable by the Decentralized Oracle Network. Multiple nodes. BFT consensus. Not one server deciding your fate. A network of independent validators confirming: this rescue was legitimate. This is what replaces trust."_ | `CRE execution · DON verified · Multiple nodes · BFT consensus · Replaces trust` | "DON Proof ↗" link glows. DON multi-node icon pulses — 5 nodes connected. BFT consensus badge. "Verified by DON" stamp appears on the entry. Each node icon lights up in sequence — consensus visualization. |

### Emotional Close — The Automation Promise

| **Moment**          | **Voice**                                                                                                                                                                                                                                         | **Subtitle**                                                         | **On Screen**                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Return to dashboard | _"Dashboard restored. Every position green. Aggregate health factor: 1.37. All three protocols safe. Both chains safe. And Reprieve is still active — watching, ready for the next drop."_                                                        | `All green 🟢 · Aggregate HF: 1.37 · Still active · Always watching` | Navigate back to dashboard. All HF gauges green. Aggregate: 1.37 🟢. "🛡️ Protection: ACTIVE" glowing green. Budget: $16.60 / $50 used. Calm after the storm. |
| Automation promise  | _"You didn't open an app. You didn't click a button. You didn't even know it happened — until the rescue log proved it did. That is the difference between alerts and automation. Between notifications and execution. Between trust and proof."_ | `No app · No button · No action needed · Just proof`                 | Screen dims slightly. Rescue log card glows center: "Proof. Not trust." Three words. Clean, confident. Hold 2s in silence. The silence IS the confidence.    |

---

## States & Edge Cases

| **State**               | **Trigger**                                        | **UI Behavior**                                                                                                                                                         | **Voice (if shown in demo)**                                                                                                                      |
| ----------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🟢 All Successful       | All rescue entries completed                       | All entries have green left-borders. Budget bar healthy. "All rescues verified ✅" badge.                                                                               | _"Every rescue successful. Every transaction verified. Every dollar accounted for."_                                                              |
| 🔴 Rescue Failed        | Simulation failed or execution reverted            | Entry has red left-border. Detail panel shows: "❌ FAILED — Reason: Tenderly simulation failed (insufficient liquidity)". Gas was not spent (aborted before execution). | _"Rescue attempted but aborted. Tenderly simulation caught insufficient liquidity before execution. No funds spent. The safety net worked."_      |
| 🟠 Partial Rescue       | Source #1 insufficient, fell through to #2         | Entry shows two sub-entries: "Step 1: Source #1 (partial)" + "Step 2: Source #2 (completed)". Combined HF improvement shown.                                            | _"First source was not enough. CRE fell through to source two. Both combined — position rescued."_                                                |
| 🔒 Escrow Active        | CCIP failed, funds in RescueEscrow                 | Entry has orange left-border. "🔒 Funds in escrow" badge. "Claim" button or "Retry" button. Escrow contract address shown.                                              | _"CCIP transfer failed. Funds held safely in RescueEscrow on the source chain. Claim them anytime or let the protocol retry."_                    |
| ⏳ Pending Confirmation | Rescue executed but on-chain log not confirmed yet | Entry has gray left-border. "⏳ Pending confirmation" badge. Tx hash shown but "Verify" link disabled until confirmed. HF change shows estimated values.                | _"Rescue executed. Waiting for on-chain confirmation. The log entry will be finalized once the transaction is included in a block."_              |
| 📭 Empty History        | No rescues have been executed yet                  | Empty state: "No rescues yet. Your CRE is watching — when it acts, every action will appear here with full on-chain proof." Illustration: shield + empty log.           | _"No rescues yet. That is good news — your positions are healthy. When Reprieve acts, every action appears here. On-chain. Verified. Permanent."_ |
| 💰 Budget Impact        | User wants to understand spend                     | Budget breakdown: per-rescue costs stacked. "$16.60 across 2 rescues today" with cost per rescue visible. Daily cap progress bar.                                       | _"Budget breakdown. Two rescues today. Total spend: sixteen sixty out of fifty. Plenty of capacity remaining."_                                   |

---

## Navigation From This Page

- **← Dashboard** → Return to main dashboard
- **Verify on-chain ↗** → Block explorer (tx hash)
- **DON Proof ↗** → CRE Registry verification
- **Escrow Claim** → RescueEscrow.sol interaction (if applicable)

---

## Data Dependencies

| **Data**                 | **Source**                                  | **Refresh**                                       |
| ------------------------ | ------------------------------------------- | ------------------------------------------------- |
| Rescue log entries       | `RescueLog.sol` (on-chain)                  | After each rescue action · Immutable once written |
| HF before/after          | Stored in rescue log event                  | Per rescue                                        |
| Budget spend             | CRE workflow config + rescue log gas fields | After each rescue · Daily reset at midnight UTC   |
| CRE workflow execution   | CRE Registry                                | Per execution · Verifiable by DON                 |
| Escrow status            | `RescueEscrow.sol` (on-chain)               | Real-time (for failed CCIP rescues)               |
| Transaction confirmation | Block explorer / RPC                        | Real-time (pending → confirmed)                   |

---

## References

- **JTBD:** [Reprieve — Jobs to be Done](https://www.notion.so/Reprieve-Jobs-to-be-Done-9cc0c8daa3d94c5e84971317eb403693?pvs=21) — Story 4 (Verify) + Flow 4 (Verify & Audit)
- **Demo Script:** [Reprieve — Demo Script](https://www.notion.so/Reprieve-Demo-Script-d3ed17f9b91640319be9d9886a03eafe?pvs=21) — Scene 6 (Verified & Logged)
- **Architecture:** [Reprieve — Architecture](https://www.notion.so/Reprieve-Architecture-4bffd8ba9f0849f49ee3d505e4896197?pvs=21) — RescueLog.sol + on-chain audit trail
- **TAPL Reference:** [UI · Main Page — Grid & Tap](https://www.notion.so/UI-Main-Page-Grid-Tap-d1d2bc1a3d2b4d1bb5af6df1fe765b83?pvs=21) — layout and voice+subtitle format reference
- **Contracts:** `RescueLog.sol` (audit trail) · `RescueEscrow.sol` (failsafe) · CRE Registry (workflow verification)
