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
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-[#8ca8ca]">
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
                ? "border-[#5a7a9f] bg-[#13243a] text-[#d6e6ff]"
                : "border-[#3a5a7f] bg-[#112236] text-[#89a3c5] hover:bg-[#13243a]"
            }`}
          >
            {SCENARIO_LABELS[id]}
          </button>
        ))}
      </div>
    </section>
  );
}
