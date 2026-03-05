<aside>
🏦

**Reprieve — cross-protocol stop-loss that protects positions across multiple DeFi venues automatically**

</aside>

**Idea Pool:** [Reprieve](https://www.notion.so/Reprieve-835d095176514174b7df9e9789a0f32a?pvs=21) · **Sprint:** 4 days · **Based on:** Traditional stop-loss + [Gelato Automation](https://www.gelato.network/) + [DeFi Saver](https://defisaver.com/)

---

### Overview

- **User selects a rescue strategy** (1 strategy = 1 CRE per user) → configures params (HF threshold, priority queue, budget cap) → pays LINK to deploy CRE · per-token ERC20 approval for position tokens (aTokens, cTokens, vault shares) · pre-approved in demo; demo video briefly mentions users need to approve
- **Per-user CRE workflow** — each user's CRE has customizable trigger logic and HF computation per strategy · triggered by `CronTrigger` (scheduled health checks — preemptive, fires well before liquidation threshold) + `HTTPTrigger` available for manual/external initiation · CRE verifies conditions using Chainlink Data Feeds + off-chain quant data before executing · ⚠️ Protection is **preemptive**: user sets HF threshold (e.g. 1.3) above liquidation level (1.0) — CRE rescues early, not after liquidation starts
- **Chainlink Data Feeds** — CRE reads prices inside its workflow (verifiable by DON) for health factor computation and rescue decisions
- **Rescue Executor** fires on confirmed breach → priority queue → same-chain-first rescue, CCIP cross-chain as escalation · `RescueEscrow.sol` holds funds if CCIP fails
- **Tenderly simulation** pre-validates rescue tx (best-effort; abort on fail in demo)
- **On-chain rescue log** — immutable audit trail of every action written by CRE WF3
- **Demo always runs the max path** — cross-chain CCIP rescue forced to showcase all Chainlink touchpoints (CRE × Data Feeds × CCIP)

### Why CRE fits (Chainlink Runtime Environment)

- **Hybrid computation (quant + on-chain)** — incorporate richer off-chain signals (volatility, volume, OI, funding, CEX/DEX spreads, risk models) while keeping execution verifiable
- **Trustless automation** — the same CRE workflow that evaluates conditions can also execute the rescue, without a centralized bot operator
- **Preemptive protection** — scheduled CronTrigger checks health factors continuously, rescues well before liquidation threshold is reached (user sets buffer, e.g. HF 1.3 vs liquidation at 1.0)
- **Composable end-to-end** — CRE orchestrates Data Feeds + CCIP + on-chain contracts as one coherent safety system
- **Auditability** — all key actions are logged on-chain for user verification

### Acceptance Criteria

- [x] **Product scope decision (demo)** — _liquidation protection only_ (stop-loss / reprieve), not general portfolio rebalancing ✅
- [x] **Approval UX decision (demo)** — per-token ERC20 approval; native tokens not supported; demo pre-approves upfront (not shown in demo video/script, but briefly mentioned ~1–2s that users need to approve to use) ✅
- [x] **Token scope decision** — ERC20 position tokens (aTokens, cTokens, vault shares); users approve these to our protocol ✅
- [x] **Adapter pattern (dev scope)** — demo uses mock lending market adapters; mainnet uses real ABIs/APIs from Aave V3/V4, Compound V3, Morpho V2 with same adapter structure ✅
- [x] **Position discovery** — app auto-scans existing positions from external lending protocols; no manual import ✅
- [x] **CRE config model** — app generates a customized CRE workflow with user config embedded, deploys to CRE (off-chain execution — outputs written on-chain via Forwarder contract) · DON internals out of demo scope ✅
- [ ] Dashboard renders positions from Aave + Compound + Morpho with live health factors
- [ ] Setup flow: user picks a rescue strategy (each strategy = 1 CRE) → configures params (HF threshold, budget cap, priority queue) → signs tx to pay LINK (CRE deploy + operation fee) → UI requests fund approval if needed
- [ ] Per-user CRE computes aggregate risk score when triggered (customizable logic per strategy)
- [ ] Rescue triggers when aggregate HF < user threshold — priority queue determines protocol order
- [ ] Budget guard enforces per-rescue + per-day gas/spend cap
- [ ] CCIP cross-chain collateral rescue executes on Arbitrum Sepolia ↔ Base Sepolia
- [ ] On-chain rescue log written for every rescue action (protocol, amount, chains, gas, timestamp)
- [ ] Per-user CRE: 1 workflow per user (1 user can have multiple CREs, 1 per strategy), `CronTrigger`-driven, unified flow handles detection → rescue → logging · Protection is **preemptive** — triggers before liquidation, not in reaction to it
- [ ] Same-chain-first rescue logic in priority queue — CCIP only when no same-chain source available
- [ ] `RescueEscrow.sol` — holds funds on source chain if CCIP fails, user can claim or protocol retries
- [ ] Cross-chain lock: `rescueInProgress[user]` blocks concurrent rescues while CCIP in flight
- [ ] User protection coverage calculator in setup UI — shows required reserve vs current delegated capacity
- [ ] Tenderly pre-simulation integrated — best-effort simulate → execute on success; abort with clear reason on failure _(confirmed feasible)_ · ⚠️ runs inside CRE; cross-chain visibility limited to current chain — needs testing
- [ ] Demo script dry run (4:30 max)

### References

- [Concrete Protocol](https://docs.concrete.xyz/Overview/how-it-works/) · ERC-4626 vaults · liquidation protection
- [DeFi Saver](https://defisaver.com/) · automated protection on Aave/Compound (single-chain)
- [Gelato Network](https://www.gelato.network/) · flexible on-chain automation
- [InstaDapp](https://instadapp.io/) · multi-protocol dashboard
- [Tenderly](https://tenderly.co/) · monitoring, simulation, alerting
- [Aave Historical Liquidations](https://aave.com/blog/historical-liquidations) · $429M liquidated Jan 31–Feb 5, 2026

### Code

- **Repo:** _TBD_
- **Stack:** `Chainlink CRE` · `Data Feeds` · `CCIP` · `EVM`
- **Chains:** Arbitrum Sepolia · Base Sepolia
- **Protocols:** Aave V3/V4 · Compound V3 · Morpho V2 · **Dev scope:** mock adapters (demo) → real ABI adapters (mainnet)
- **Key modules:** Health factor aggregator, Multi-signal trigger, Priority action queue (same-chain-first), Budget guard, Rescue executor, Rescue escrow
- **CRE Contracts:** `HealthMonitor.sol` · `RescueExecutor.sol` · `RescueLog.sol` · `Forwarder.sol` _(receives CRE reports via `writeReport()`, calls target contracts)_ · _(PriceWatcher removed — price checked inside CRE workflow)_
- **Supporting Contracts:** `RescueEscrow.sol` · `CCIPReceiver.sol` _(RescueConfig + BudgetGuard removed — config/budget stored in user's CRE workflow, still verifiable)_ · CRE writes on-chain via `runtime.report()` → `writeReport()` → `Forwarder.sol` → target contract · DON internals out of demo scope
- **CRE Docs:** [CRE Overview](https://chain.link/chainlink-runtime-environment) · [CRE SDK](https://docs.chain.link/cre/llms-full-ts.txt)
- **Tenderly:** Confirmed feasible — best-effort pre-flight simulation

---

### Project Tracker

[Reprieve Tracker](https://www.notion.so/6367c115aeb3412485f619079fff965a?pvs=21)

[Reprieve — Partner Overview](https://www.notion.so/Reprieve-Partner-Overview-917638aac44e4740b06016639b3bebfc?pvs=21)

[UI · Dashboard — Monitor & Risk](https://www.notion.so/UI-Dashboard-Monitor-Risk-7b3986a23a5d486eac9e5072083a9ca4?pvs=21)

[UI · Setup — Strategy & Deploy](https://www.notion.so/UI-Setup-Strategy-Deploy-e5bead2b875d4814982a25962a216fd8?pvs=21)

[UI · Rescue — CRE Execution & CCIP](https://www.notion.so/UI-Rescue-CRE-Execution-CCIP-858ea63396194737899d55a7746ddb2a?pvs=21)

[UI · History — Rescue Log & Audit](https://www.notion.so/UI-History-Rescue-Log-Audit-5ded95525a33411b8b0668fba3c6986b?pvs=21)

[Reprieve — Branding](https://www.notion.so/Reprieve-Branding-94d2ff3964ae4ed79c32ffbe789b8511?pvs=21)

[Reprieve — Sprint Backlog (4 Days · 10 Tasks)](https://www.notion.so/Reprieve-Sprint-Backlog-4-Days-10-Tasks-619abf4f0d804d96a6b19bf4e8ad5344?pvs=21)
