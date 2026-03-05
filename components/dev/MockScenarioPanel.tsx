"use client";

import { Beaker } from "lucide-react";
import { SCENARIO_LABELS } from "@/lib/domain/constants";
import type { MockScenarioId } from "@/lib/domain/types";
import { useAppState } from "@/lib/state/app-context";

const scenarioIds = Object.keys(SCENARIO_LABELS) as MockScenarioId[];

export function MockScenarioPanel() {
  const {
    state: { scenario },
    setScenario,
  } = useAppState();

  return (
    <section className="fo-panel border-dashed p-3">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-[#d8e1d9]">
        <Beaker className="size-3.5" />
        Mock Scenario Panel (dev)
      </div>
      <div className="flex flex-wrap gap-2">
        {scenarioIds.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => void setScenario(id)}
            className={`rounded-full border px-2.5 py-1 text-xs transition ${
              scenario === id
                ? "border-[#c7f36b] bg-[#252f29] text-[#edf2eb]"
                : "border-[#69776f] bg-[#222a25] text-[#d3ddd5] hover:bg-[#252f29]"
            }`}
          >
            {SCENARIO_LABELS[id]}
          </button>
        ))}
      </div>
    </section>
  );
}
