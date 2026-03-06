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
bun run dev
```

Open `http://localhost:3000`.

## API Client Generation

```bash
bun run api:generate
```

Optional environment variables:

- `NEXT_PUBLIC_API_BASE_URL`: runtime base URL used by the generated Axios client.
- `ORVAL_INPUT`: OpenAPI spec URL used by Orval during generation. Defaults to `https://api-finance-os-dev.nysm.work/swagger/json`.

## Build and Lint

```bash
bun run lint
bun run build
```

## Route Map

- `/` Landing page
- `/dashboard` Dashboard
- `/setup` Setup protection workflow
- `/history` Rescue history and audit details

## Notes

- Data source is fully local (`lib/mocks/*`, `lib/api/mockClient.ts`).
- No blockchain, RPC, or wallet provider dependency is required.
- Rescue flow behavior is deterministic by scenario.
