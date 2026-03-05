<aside>
🎨

**Reprieve Brand Guide** — product positioning, messaging, and visual identity for the cross-protocol stop-loss powered by Chainlink. The [Reprieve — Partner Overview](https://www.notion.so/Reprieve-Partner-Overview-917638aac44e4740b06016639b3bebfc?pvs=21) is the external expression of this guide — both pages share the same narrative arc, tagline, and voice.

</aside>

---

## 🏦 Product Description

### One-Liner

> **Reprieve — cross-protocol stop-loss that protects DeFi positions across multiple venues, automatically.**

### Elevator Pitch (30 seconds)

Liquidation is a cross-protocol problem treated as a single-protocol problem. Your Aave position gets liquidated while your Compound position has spare collateral sitting idle — no existing tool connects them.

**Reprieve** monitors health factors across **Aave, Compound, and Morpho** simultaneously. When aggregate risk crosses your threshold, it executes a coordinated rescue — withdrawing collateral from the safest position first, same-chain priority, cross-chain via **CCIP** as escalation. Every rescue is pre-validated through **Tenderly simulation** and logged immutably on-chain.

Powered by **Chainlink CRE × Data Feeds × CCIP**. Trustless. Verifiable. Automatic.

### Extended Description

In January 2026, **$429 million was liquidated on Aave alone** in a single week — the vast majority triggered by manual misses. DeFi users with positions across multiple protocols and chains have no unified protection. Alerts arrive too late. Manual monitoring doesn't scale.

**Reprieve changes this.** Each user deploys a personal **CRE workflow** that acts as an always-on guardian:

- **Detects** — reads positions from Aave V3/V4, Compound V3, and Morpho V2; fetches prices from Chainlink Data Feeds; incorporates off-chain quant signals (volatility, open interest, funding rates) for richer risk models — all verifiable by the DON
- **Evaluates** — computes aggregate health factor, checks budget caps, builds a priority queue, and pre-simulates the rescue via Tenderly
- **Rescues** — executes same-chain withdrawals first; escalates to cross-chain collateral rescue via CCIP when needed; holds funds in RescueEscrow if the bridge fails — no funds lost in transit
- **Logs** — writes an immutable on-chain audit trail of every action: protocol, amount, chains, gas, timestamp

One workflow. One execution. **Set it and forget it.**

---

## 🎯 Brand Positioning

### Tagline

> **Trustless. Verifiable. Automatic.**

### Alternative Taglines

- _"Your positions protect themselves."_
- _"Proof, not trust."_
- _"Detect. Rescue. Log. Automatic."_
- _"Protected by Chainlink."_

### Brand Voice

| **Attribute**                | **Description**                                                             | **Example**                                                                    |
| ---------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Confident**                | We state facts, not promises. The proofs speak.                             | _"Every rescue is verified on-chain. By anyone. Anytime."_                     |
| **Technical but accessible** | Deep DeFi expertise delivered in clear, direct language.                    | _"Same-chain first. CCIP cross-chain when needed."_                            |
| **Urgent but calm**          | We acknowledge the crisis (liquidation risk) but project control.           | _"$429M liquidated. Your CRE was already watching."_                           |
| **No hype**                  | No "revolutionary" or "game-changing." Let the architecture do the talking. | _"One workflow handles detection, rescue, and logging in a single execution."_ |

### Target Audience

- **Primary:** DeFi power users with >$10K in leveraged positions across 2+ protocols/chains who currently rely on manual alerts or notification-only bots
- **Secondary:** Yield farmers running looping strategies, protocol treasuries, and cross-chain leverage traders

### Core Narrative Arc (Storytelling Framework: Interpolation)

1. **Pain** — $429M liquidated in one week. Positions across 3 protocols, 2 chains. No one watching. By the time you see the alert, liquidation already happened.
2. **DIY** — Manual monitoring, notification bots, single-protocol tools (DeFi Saver, Gelato) — none connect your positions cross-chain or cross-protocol.
3. **Product** — Reprieve: one CRE workflow per user that detects, rescues, and logs — autonomously, verifiably, across chains. Set it and forget it.

---

## 🖼️ Logo Description

### Primary Logo Concept: _"The Shield Circuit"_

<aside>
🛡️

**Visual concept:** A **shield silhouette** constructed from **circuit-board traces** and **chain links**, symbolizing the fusion of protection and blockchain infrastructure.

</aside>

**Shape:** A clean, geometric shield — angular rather than heraldic, modern rather than medieval. The outline is formed by thin, precise lines that evoke both a protective barrier and a circuit pathway.

**Internal elements:**

- **Two chain links** cross diagonally inside the shield, representing **cross-chain connectivity** (CCIP) and the Chainlink ecosystem
- The chain links intersect at the center, forming a subtle **"X" or node point** — the moment of rescue, where collateral moves from one chain to another
- Fine **circuit traces** branch outward from the intersection toward the shield edges, representing the CRE workflow reaching across protocols (Aave, Compound, Morpho)

**Typography:** The word **"REPRIEVE"** sits below or beside the shield mark in a clean, modern sans-serif typeface (similar to Inter or DM Sans). Letterspacing is generous — confident, not cramped. All capitals or small caps.

### Color Palette

| **Color**             | **Hex**   | **Role**                                                                                                                       |
| --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| ⛓️ **Chainlink Blue** | `#375BD2` | Primary brand color — represents the Chainlink ecosystem, trust, and verification. Used in the shield outline and chain links. |
| 🛡️ **Deep Navy**      | `#0A1628` | Background and depth — represents the always-on, dark-mode-native DeFi environment.                                            |
| ✅ **Rescue Green**   | `#22C55E` | Accent for success states — "Protected", "Rescued", "HF Restored". Used sparingly for confirmed actions.                       |
| 🚨 **Alert Amber**    | `#F59E0B` | Warning states — health factor dropping, threshold approaching. Creates urgency in UI and marketing.                           |
| ⚪ **Clean White**    | `#F8FAFC` | Text and high-contrast elements on dark backgrounds.                                                                           |

### Logo Variants

1. **Full lockup** — Shield mark + "REPRIEVE" wordmark + optional "Powered by Chainlink" sub-badge
2. **Shield mark only** — For favicons, app icons, social avatars, and compact placements
3. **Wordmark only** — For inline text contexts where the shield is too small to read
4. **Dark mode** (primary) — Blue shield on deep navy background
5. **Light mode** — Navy shield on white background

### Design Principles

- **Geometric precision** — no organic curves or hand-drawn elements. Reprieve is an engineered system, and the logo should feel engineered.
- **Chainlink-native** — the blue palette and chain-link motif immediately signal ecosystem alignment without copying the Chainlink logo
- **Scalable** — the shield mark must read clearly at 16×16px (favicon) and at billboard scale
- **No gradients in the mark** — flat color for maximum versatility across print, screen, and embroidery

### Logo Don'ts

- ❌ Do not use rounded or heraldic shield shapes — keep it angular and modern
- ❌ Do not add 3D effects, drop shadows, or glows to the logo mark
- ❌ Do not rotate or skew the shield
- ❌ Do not place the logo on busy backgrounds without a clear zone
- ❌ Do not substitute brand colors for off-palette colors

---

## 📐 Visual Identity Elements

### Iconography Style

Product icons use a **thin-line, monochrome** style with occasional Chainlink Blue accents:

- 🔍 **Detect** — magnifying glass with circuit trace
- 🚨 **Evaluate** — alert triangle with checkmark
- 🛡️ **Rescue** — shield with directional arrow
- 📝 **Log** — document with chain link
- ⛓️ **Cross-chain** — two chain links bridging a gap

### Key Visual Motifs

1. **The rescue arc** — a visual curve from red (danger) through amber (detection) to green (rescued). Used in charts, progress indicators, and marketing materials.
2. **Split-chain view** — two panels representing two chains, connected by a CCIP bridge animation. The signature visual of the demo video.
3. **Health factor gauge** — a radial gauge that transitions green → yellow → orange → red. The most recognizable UI element.

---

## 💬 Key Messaging

### For Hackathon Judges

> Reprieve is the first cross-protocol stop-loss system powered by Chainlink CRE. It monitors health factors across Aave, Compound, and Morpho in a single workflow, executes coordinated rescue via CCIP, and logs every action immutably on-chain. No existing DeFi tool combines cross-chain rescue, off-chain quant signals, and verifiable execution in one system.

### For DeFi Users

> Your positions protect themselves. Reprieve watches your health factors across every protocol and chain — and when risk crosses your threshold, it rescues automatically. Same-chain first, cross-chain when needed. You don't open an app. You don't click a button. You just get a rescue log proving it happened.

### For Technical Audience

> Per-user CRE workflow: CronTrigger-driven, unified Detect → Evaluate → Rescue → Log. Hybrid computation (off-chain quant + on-chain Data Feeds) for richer risk models. Same-chain-first priority queue with CCIP cross-chain escalation. Tenderly pre-simulation. RescueEscrow failsafe. On-chain audit trail via RescueLog.sol.

### The One Line That Sells It

> _"You didn't open an app. You didn't click a button. You didn't even know it happened — until the rescue log proved it did."_

---

## 📎 References

- [Reprieve](https://www.notion.so/Reprieve-b86efc329f5f453fbbc1106def76e98e?pvs=21) — project hub
- [Reprieve — Demo Script](https://www.notion.so/Reprieve-Demo-Script-d3ed17f9b91640319be9d9886a03eafe?pvs=21) — video script and storytelling arc
- [Reprieve — Architecture](https://www.notion.so/Reprieve-Architecture-4bffd8ba9f0849f49ee3d505e4896197?pvs=21) — technical details
- [Reprieve](https://www.notion.so/Reprieve-835d095176514174b7df9e9789a0f32a?pvs=21) — Idea Pool entry (scoring + competitive landscape)
- [Reprieve — Partner Overview](https://www.notion.so/Reprieve-Partner-Overview-917638aac44e4740b06016639b3bebfc?pvs=21) — external-facing version of this brand guide (aligned: same narrative arc, tagline, and Detect → Evaluate → Rescue → Log framing)
- [TAPL — Partner Overview](https://www.notion.so/TAPL-Partner-Overview-3b795f905317472689a8e1e67584c141?pvs=21) — branding reference from sister project
