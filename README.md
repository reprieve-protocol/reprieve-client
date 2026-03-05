# Reprieve Frontend V1 (Mock Product App)

Performance-first Next.js frontend for Reprieve with deterministic rescue simulation and full mock data flows.

## Implemented Scope

- Dashboard: multi-protocol positions, aggregate HF, risk states, protection card, budget tracker.
- Setup Wizard: strategy presets, parameter controls, coverage preview, deploy/update flow.
- Rescue Overlay: deterministic Detect → Evaluate → Simulate → Same-chain → CCIP timeline.
- History: rescue entries, detail panel, proof fields, budget summary.
- Dev Scenario Panel (non-production): edge-case snapshots and rescue behaviors.
- Simulated wallet connect/disconnect.
- Local storage persistence for selected scenario, protection state, and config.

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Build and Lint

```bash
npm run lint
npm run build
```

## Route Map

- `/` Dashboard
- `/setup` Setup protection workflow
- `/history` Rescue history and audit details

## Notes

- Data source is fully local (`lib/mocks/*`, `lib/api/mockClient.ts`).
- No blockchain, RPC, or wallet provider dependency is required.
- Rescue flow behavior is deterministic by scenario.
