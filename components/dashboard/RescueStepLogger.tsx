"use client";

import Link from "next/link";
import { RescueActionWorkflowAnimation } from "@/components/dashboard/RescueActionWorkflowAnimation";
import { RescueCREWorkflowAnimation } from "@/components/dashboard/RescueCREWorkflowAnimation";
import {
  getResponseStatusCode,
  normalizeCreRegistration,
} from "@/lib/cre-registration";
import {
  getCreRegistrationsControllerGetRegistrationQueryKey,
  useCreRegistrationsControllerGetRegistration,
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
}: {
  address: string;
  lowestHealthFactor?: number | null;
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
  const rescueStep = (rescueStepData as RescueStepResponse | undefined)
    ?.rescueStep;
  const currentRescueStep = rescueStep?.currentStep;

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
        isRescue={Boolean(rescueStepData)}
        lowestHealthFactor={lowestHealthFactor}
      />

      {currentRescueStep && (
        <RescueActionWorkflowAnimation currentStep={currentRescueStep} />
      )}
    </>
  );
}
