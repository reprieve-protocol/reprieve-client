"use client";

import Link from "next/link";
import { RescueActionWorkflowAnimation } from "@/components/dashboard/RescueActionWorkflowAnimation";
import { RescueCREWorkflowAnimation } from "@/components/dashboard/RescueCREWorkflowAnimation";
import {
  buildSimulateApiGuardParams,
  getRescueSimulationDecision,
  getIsRescueFromSimulation,
  getSimulateApiGuardPayload,
} from "@/lib/api/simulate-api-guard";
import {
  getResponseStatusCode,
  normalizeCreRegistration,
} from "@/lib/cre-registration";
import {
  getCreRegistrationsControllerGetRegistrationQueryKey,
  useCreRegistrationsControllerGetRegistration,
  usePositionsControllerSimulateApiGuard,
  useCreRegistrationsControllerGetRescueStep,
} from "@/src/services/queries";

type RescueStepResponse = {
  rescueStep?: {
    currentStep?: number | null;
  } | null;
};

export function RescueStepLogger({
  address,
  lowestHealthFactor,
  currentEthPriceWad,
  simulationRunId,
  simulateEthPriceDrop,
}: {
  address: string;
  lowestHealthFactor?: number | null;
  currentEthPriceWad?: string | null;
  simulationRunId?: number;
  simulateEthPriceDrop?: boolean;
}) {
  const {
    data: creRegistration,
    error: creRegistrationError,
    isLoading: isLoadingCreRegistration,
  } = useCreRegistrationsControllerGetRegistration(address, {
    query: {
      enabled: !!address,
      queryKey: getCreRegistrationsControllerGetRegistrationQueryKey(address),
      retry: (failureCount, error) => {
        const statusCode = getResponseStatusCode(error);
        if (statusCode === 404) return false;
        return failureCount < 2;
      },
    },
  });
  const hasCreRegistration = Boolean(normalizeCreRegistration(creRegistration));
  const creRegistrationStatusCode = getResponseStatusCode(creRegistrationError);
  const creRegistrationMissing = creRegistrationStatusCode === 404;

  const { data: rescueStepData } = useCreRegistrationsControllerGetRescueStep(
    address,
    {
      query: {
        refetchInterval: 3000,
        enabled: !!address && hasCreRegistration,
      },
    },
  );
  console.log("rescueStepData: ", rescueStepData);
  const rescueStep = (rescueStepData as RescueStepResponse | undefined)
    ?.rescueStep;
  const currentRescueStep = rescueStep?.currentStep;

  const simulateApiGuardParams = buildSimulateApiGuardParams({
    currentEthPriceWad,
    simulateEthPriceDrop,
  });

  const { data: rescueSimulationData } = usePositionsControllerSimulateApiGuard(
    address,
    simulateApiGuardParams,
    {
      query: {
        enabled: !!address && hasCreRegistration,
        refetchInterval: 5000,
      },
    },
  );
  console.log("rescueSimulationData: ", rescueSimulationData);
  const rescueSimulation = getSimulateApiGuardPayload(rescueSimulationData);
  const rescueDecision = getRescueSimulationDecision(rescueSimulationData);
  const isRescue = getIsRescueFromSimulation(rescueSimulationData);
  const rescueCollateralAmount = rescueSimulation?.plan?.collateralAmount;
  const showRescueActionWorkflow =
    rescueDecision === "RESCUE_SAME_CHAIN" ||
    rescueDecision === "RESCUE_CROSS_CHAIN";
  const normalizedRescueStep =
    typeof currentRescueStep === "number" && !Number.isNaN(currentRescueStep)
      ? Math.max(currentRescueStep - 1, 0)
      : 0;
  const actionWorkflowKey =
    simulateEthPriceDrop && simulationRunId
      ? `simulation-${simulationRunId}-${rescueDecision ?? "pending"}`
      : `live-${rescueDecision ?? "pending"}-${normalizedRescueStep}`;

  if (isLoadingCreRegistration && address) {
    return (
      <div className="rounded-2xl border border-[#2d3932] bg-[#0b120f]/90 px-4 py-5 text-sm text-[#a9b2ab]">
        Checking CRE protection status...
      </div>
    );
  }

  if (creRegistrationMissing || !hasCreRegistration) {
    return (
      <div className="rounded-2xl border border-dashed border-[#2d3932] bg-[#0b120f]/90 px-4 py-5">
        <p className="text-sm font-medium text-orange-300">
          CRE protection is not enabled.
        </p>
        <p className="mt-1 text-sm text-[#a9b2ab]">
          Create a new CRE workflow to get protected and unlock the Protection
          flow.
        </p>
        <Link
          href="/setup"
          className="mt-3 inline-flex items-center rounded-lg border border-[#c7f36b]/30 bg-[#c7f36b]/10 px-3 py-1.5 text-sm font-medium text-[#c7f36b] transition hover:bg-[#c7f36b]/15"
        >
          Create CRE Workflow
        </Link>
      </div>
    );
  }

  return (
    <>
      <RescueCREWorkflowAnimation
        isRescue={isRescue}
        decision={rescueDecision}
        lowestHealthFactor={lowestHealthFactor}
      />

      {showRescueActionWorkflow && (
        <RescueActionWorkflowAnimation
          key={actionWorkflowKey}
          autoPlaySequence={Boolean(simulateEthPriceDrop && simulationRunId)}
          decision={rescueDecision}
          currentStep={simulateEthPriceDrop ? null : normalizedRescueStep}
          collateralAmount={rescueCollateralAmount}
        />
      )}
    </>
  );
}
