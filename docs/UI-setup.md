<aside>
🛡️

**The protection wizard.** Where you pick a rescue strategy, configure your thresholds, and deploy a personal CRE workflow — in under two minutes. Inspired by [DeFi Saver](https://defisaver.com/)'s automation setup, but powered by Chainlink CRE with on-chain verification.

</aside>

---

## Page Purpose

This is a step-by-step wizard that transforms a passive dashboard viewer into an actively protected user. Three steps: **Strategy → Parameters → Deploy.** Each step builds confidence — the user understands what they're buying before they pay.

The core loop: **Choose strategy → Set thresholds → Pay LINK → CRE deployed → Return to dashboard with protection active.**

**Personas served:** DeFi Dave (picks Balanced or Aggressive), Conservative Carl (picks Defensive, default values)

**Design north star:** _"If setup takes more than two minutes, we've failed."_

---

## Layout Overview

The setup flow is a **three-step wizard** — clean cards, left-to-right progression, no scrolling needed. Each step has a clear label, visual feedback, and a "why this matters" tooltip. The LINK payment and CRE deployment are the climax — DON verification badge appears as the trust seal.

```jsx
┌──────────────────────────────────────────────────────────┐
│  🛡️ SETUP REPRIEVE PROTECTION              Step 1 of 3  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  STEP 1: STRATEGY         STEP 2: PARAMETERS             │
│  ┌──────────────────┐     ┌──────────────────────────┐   │
│  │ ● Defensive       │     │ HF Threshold:   [1.10]  │   │
│  │   HF < 1.10       │     │ Budget/rescue:  [0.05]  │   │
│  │   Conservative    │     │ Budget/day:     [0.20]  │   │
│  │                   │     │ Priority:               │   │
│  │ ○ Balanced        │     │  1. Same-chain first    │   │
│  │   HF < 1.30       │     │  2. CCIP cross-chain    │   │
│  │   Recommended     │     │                          │   │
│  │                   │     │ Emergency override:      │   │
│  │ ○ Aggressive      │     │  Any single HF < 1.10   │   │
│  │   HF < 1.50       │     │  → force rescue          │   │
│  └──────────────────┘     └──────────────────────────┘   │
│                                                          │
│  STEP 3: DEPLOY CRE                                      │
│  ┌──────────────────────────────────────────────────┐    │
│  │  Coverage: 78% (for a 20% market drop)            │    │
│  │  Cost: 0.5 LINK (one-time deployment)             │    │
│  │  ⛓️ Config + budget stored in CRE (DON verified)  │    │
│  │                                                    │    │
│  │  Token Approvals:                                  │    │
│  │  ✅ aTokens (AAVE)  ✅ cTokens (Compound)          │    │
│  │  ✅ vault shares (Morpho)                           │    │
│  │                                                    │    │
│  │  [  Deploy Protection — Pay 0.5 LINK  ]            │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ✅ CRE Deployed · Unified workflow · Bot-triggered      │
└──────────────────────────────────────────────────────────┘
```

---

## Sections & Components

### Step 1 · Strategy Selection

| **Element**     | **Description**                                                         | **Behavior**                                                                                                                                   |
| --------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Defensive Card  | HF threshold < 1.10 · Triggers close to liquidation · Minimal gas spend | Best for Conservative Carl — set-and-forget, rarely triggers. Tooltip: "Rescues only when you're very close to liquidation. Lowest gas costs." |
| Balanced Card   | HF threshold < 1.30 · Recommended · Good buffer                         | Default selection. Blue "Recommended" badge. Tooltip: "Gives you a comfortable buffer above liquidation. Most users choose this."              |
| Aggressive Card | HF threshold < 1.50 · Maximum protection · Higher gas spend             | For DeFi Dave who wants maximum safety. Tooltip: "Triggers early. More rescues, more gas, but maximum protection."                             |

Each card shows: threshold value, estimated rescues/month (based on historical vol), estimated monthly gas cost.

### Step 2 · Parameter Configuration

| **Element**             | **Description**                               | **Behavior**                                                                                                                                                                                   |
| ----------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HF Threshold Slider     | Range: 1.05 – 2.00 · Pre-filled from strategy | Slider with numeric input. Live preview: shows which positions would currently trigger at this threshold                                                                                       |
| Budget Cap — Per Rescue | Default: 0.05 ETH · Max gas per single rescue | Slider. Tooltip: "If a rescue would cost more than this, CRE aborts and waits for cheaper conditions."                                                                                         |
| Budget Cap — Daily      | Default: 0.2 ETH · Max total gas per day      | Slider. Progress bar shows how many rescues this allows at current gas prices                                                                                                                  |
| Priority Queue          | 1. Same-chain first 2. CCIP cross-chain       | Drag-to-reorder (advanced). Default: same-chain-first (optimal for gas). Tooltip: "Same-chain rescues are faster and cheaper. Cross-chain via CCIP only when needed."                          |
| Emergency Override      | Any single protocol HF < 1.10 → force rescue  | Toggle (on by default). Ignores aggregate HF when any individual position is critically low. Tooltip: "Even if your aggregate looks fine, one position at 1.08 is dangerous. This catches it." |
| Recovery Buffer         | Rescue targets HF = threshold × 1.10          | Read-only display. Shows: "Rescue will bring HF to 1.43" (for threshold 1.30). Prevents immediate re-trigger.                                                                                  |

### Step 3 · Deploy CRE

| **Element**           | **Description**                     | **Behavior**                                                                                 |
| --------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------- |
| Coverage Calculator   | "78% covered for a 20% market drop" | Based on current collateral distribution vs rescue capacity. Updates live as params change   |
| LINK Cost             | 0.5 LINK deployment fee             | One-time cost. Shows USD equivalent at current LINK price                                    |
| Token Approval Status | Checklist of ERC20 approvals needed | ✅ if approved, ⚠️ if pending. "Approve All" button for batch approval. Pre-approved in demo |
| Deploy Button         | "Deploy Protection — Pay 0.5 LINK"  | Click → LINK payment tx → CRE deployment progress bar → ✅ success → DON verification badge  |
| CRE Confirmation      | Workflow ID + "DON Verified" badge  | Shows after successful deploy. Links to CRE Registry for on-chain verification               |

---

## Setup Narration — Voice & Subtitle

This is how the setup flow is **presented and spoken about** in the demo video (Scene 3) and in product walkthroughs.

### Step 1 — Picking a Strategy

| **Moment**        | **Voice**                                                                                                                                  | **Subtitle**                                              | **On Screen**                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Wizard opens      | _"Setup. Three steps. Under two minutes. First — pick a rescue strategy. Each strategy creates one dedicated CRE workflow, just for you."_ | `3 steps · < 2 min · 1 strategy = 1 CRE workflow · Yours` | Setup wizard slides in from right. Three strategy cards appear. Step indicator: "Step 1 of 3".                             |
| Defensive         | _"Defensive triggers at 1.10 — close to liquidation. Minimal gas spend. Good if you keep conservative positions and rarely need rescue."_  | `Defensive · HF < 1.10 · Minimal gas · Rare triggers`     | Defensive card highlights. Estimated: ~2 rescues/month, ~0.04 ETH/month gas.                                               |
| Balanced selected | _"Balanced is the sweet spot — triggers at 1.30. Gives you a comfortable buffer. This is what most users choose. Let's go with this."_     | `Balanced · HF < 1.30 · Recommended · Best buffer`        | Balanced card glows blue with "Recommended" badge. Selected with a click. Checkmark animates. Estimated: ~5 rescues/month. |

### Step 2 — Configuring Parameters

| **Moment**         | **Voice**                                                                                                                                                                                  | **Subtitle**                                                         | **On Screen**                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Parameters appear  | _"Configure your parameters. Health factor threshold — 1.30, pre-filled from Balanced. You can adjust it. Slide right for more protection, left for less."_                                | `HF threshold: 1.30 · Adjustable · More ← → Less`                    | Parameter panel slides in. HF slider at 1.30. Live preview below: "At 1.30, positions #1 and #6 would currently trigger rescue." |
| Budget caps        | _"Budget caps. Per rescue: 0.05 ETH maximum gas. Per day: 0.2 ETH. This is the most you will spend — ever. If a rescue costs more, CRE waits for cheaper conditions."_                     | `Budget: 0.05 ETH/rescue · 0.2 ETH/day · Hard cap · CRE respects it` | Two budget sliders animate. Per-rescue: 0.05 ETH. Daily: 0.2 ETH. "≈ 4 rescues/day at current gas" label.                        |
| Priority queue     | _"Priority queue: same-chain rescues first — faster, cheaper. Cross-chain via Chainlink CCIP only when same-chain sources are exhausted. Smart default."_                                  | `Priority: Same-chain first → CCIP escalation · Fastest + cheapest`  | Priority list: "1. Same-chain" and "2. CCIP cross-chain" with drag handles. Arrow connects them. CCIP badge glows blue.          |
| Emergency override | _"Emergency override — on by default. If any single position drops below 1.10, CRE forces rescue immediately. Even if your aggregate looks fine. Because one position at 1.08 is a bomb."_ | `Emergency: any single HF < 1.10 → force rescue · Always on`         | Toggle switch: ON (green). "Any single HF < 1.10 → FORCE" label. Brief red flash on the 1.10 number.                             |

### Step 3 — Deploying to CRE

| **Moment**            | **Voice**                                                                                                                                                                                                                                                          | **Subtitle**                                                                         | **On Screen**                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Coverage calculator   | _"Coverage calculator. With your current collateral distribution, you are 78 percent covered for a 20 percent market crash. Meaning — Reprieve can rescue most of your positions in a severe drawdown. The more rescue sources you have, the higher this number."_ | `Coverage: 78% for 20% crash · More rescue sources = higher coverage`                | Coverage gauge animates to 78%. "For a 20% market drop" label. Color: green at 78%. Breakdown: source positions vs endangered positions.                                 |
| Token approvals       | _"Token approvals. Reprieve needs permission to move your position tokens — aTokens from Aave, cTokens from Compound, vault shares from Morpho. Without approval, rescue fails at execution time. Pre-approved for this demo."_                                    | `Token approvals: aTokens ✅ · cTokens ✅ · vault shares ✅ · Required for rescue`   | Approval checklist: three items, all ✅. Brief flash: "Pre-approved for demo" badge (1s, then fades). Warning icon for any unapproved token.                             |
| LINK payment + deploy | _"Pay half a LINK. One-time deployment cost. Your CRE workflow goes live — config, budget, strategy, all stored right inside the CRE. Verifiable by the Decentralized Oracle Network. No centralized server. No admin key. No trust required."_                    | `0.5 LINK · One-time · Config in CRE · DON verified · No trust`                      | "Deploy Protection — Pay 0.5 LINK" button tapped. LINK payment animation → progress bar fills → ✅ "CRE Deployed". DON multi-node icon pulses blue. Workflow ID appears. |
| Confirmation          | _"One unified workflow: detect, rescue, log — all in one CRE execution. Triggered by any external bot. The CRE validates everything internally. Your positions are now protected. Twenty-four seven. Across every chain."_                                         | `Unified: Detect → Rescue → Log · Bot-triggered · CRE validates · 24/7 · All chains` | Workflow diagram: Detect → Rescue → Log (compact inline). "Bot-triggered" label. "24/7" badge pulses. Transitions back to dashboard with "🛡️ Protection: ACTIVE 🟢".     |

---

## States & Edge Cases

| **State**                | **Trigger**                      | **UI Behavior**                                                                                                                    | **Voice (if shown in demo)**                                                                                                      |
| ------------------------ | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 🟢 Deploy Success        | CRE deployment tx confirmed      | Green confetti. Workflow ID. DON badge. Auto-redirect to dashboard after 3s.                                                       | _"Protected. Your CRE is live. Let's go back to the dashboard."_                                                                  |
| 🔴 Deploy Failed         | Insufficient LINK or tx reverted | Red alert: "Deployment failed — insufficient LINK" or "Transaction reverted". Retry button.                                        | _"Not enough LINK. Top up your wallet and try again."_                                                                            |
| ⚠️ Unapproved Tokens     | User skipped token approval      | Warning banner on deploy step: "⚠️ 2 tokens not approved — rescue will fail for Aave and Morpho positions." Approve button inline. | _"Warning — unapproved tokens. Without approval, CRE cannot withdraw collateral for rescue. Approve now or risk failed rescues."_ |
| 🔵 Edit Existing         | User already has active CRE      | Wizard pre-fills current config. "Update Strategy" button instead of "Deploy". Shows diff of changes.                              | _"Updating your existing strategy. Current threshold 1.30 — changing to 1.20. Review the diff and confirm."_                      |
| 🟡 Insufficient Coverage | Coverage calculator < 30%        | Orange warning: "Low coverage — only 22% for a 20% drop. Consider adding more collateral to safe positions."                       | _"Low coverage. You have limited rescue sources. Consider depositing more into your safe positions before enabling protection."_  |

---

## Navigation From This Page

- **Back** → Dashboard
- **Deploy Success** → Auto-redirect to Dashboard (protection now active)
- **"Learn More about CRE"** → External link to Chainlink CRE docs

---

## Data Dependencies

| **Data**                             | **Source**                      | **Refresh**                            |
| ------------------------------------ | ------------------------------- | -------------------------------------- |
| Current positions (for live preview) | Protocol adapters               | On page load                           |
| LINK balance                         | Wallet                          | On page load + after payment           |
| Token approval status                | ERC20 contracts                 | On page load + after approval tx       |
| Coverage calculation                 | Position data + strategy params | Live (updates as user adjusts sliders) |
| Gas estimates                        | Network conditions              | Every 30s                              |

---

## References

- **JTBD:** [Reprieve — Jobs to be Done](https://www.notion.so/Reprieve-Jobs-to-be-Done-9cc0c8daa3d94c5e84971317eb403693?pvs=21) — Story 2 (Protect) + Flow 1 (Setup & Configure)
- **Demo Script:** [Reprieve — Demo Script](https://www.notion.so/Reprieve-Demo-Script-d3ed17f9b91640319be9d9886a03eafe?pvs=21) — Scene 3 (Setup Protection)
- **Default Params:** [Reprieve — Default Parameters](https://www.notion.so/Reprieve-Default-Parameters-64a3f3b6f502418b9fe1645b501072b9?pvs=21) — threshold, budget, priority defaults
- **TAPL Reference:** [Jobs to be Done](https://www.notion.so/Jobs-to-be-Done-1022f7d57f4b42738639641a80649dc5?pvs=21) — CRE UI flows for setup patterns
