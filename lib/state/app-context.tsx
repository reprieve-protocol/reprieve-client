"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import {
  appendMockHistoryEntry,
  applySnapshot,
  applySuccessfulRescueSnapshot,
  connectWallet,
  deployProtection,
  disconnectWallet,
  getPortfolioSnapshot,
  getRescueHistory,
  getRescueRun,
  getSetupDefaults,
  triggerDeterministicRescue,
  updateProtection,
} from "@/lib/api/mockClient";
import { computeCoverage, estimateRescuesPerDay, positionsTriggeredAtThreshold } from "@/lib/domain/calculations";
import { CRE_CHECK_INTERVAL_MS, STORAGE_KEY } from "@/lib/domain/constants";
import type {
  AppState,
  MockScenarioId,
  ProtectionConfig,
  RescueLogEntry,
  RescueRunState,
  StrategyPreset,
} from "@/lib/domain/types";

interface PersistedState {
  protectionConfig: ProtectionConfig | null;
  selectedScenario: MockScenarioId;
  selectedHistoryId: string | null;
  workflowId: string | null;
  protectionActive: boolean;
  strategyLabel: string | null;
}

type Action =
  | { type: "INIT_START" }
  | {
      type: "INIT_SUCCESS";
      payload: {
        snapshot: AppState["snapshot"];
        setupDefaults: AppState["setupDefaults"];
        protectionConfig: AppState["protectionConfig"];
        history: RescueLogEntry[];
      };
    }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_WALLET"; payload: AppState["wallet"] }
  | { type: "SET_SCENARIO"; payload: MockScenarioId }
  | { type: "SET_SNAPSHOT"; payload: AppState["snapshot"] }
  | { type: "SET_PROTECTION_CONFIG"; payload: ProtectionConfig }
  | { type: "SET_HISTORY"; payload: RescueLogEntry[] }
  | { type: "SET_SELECTED_HISTORY"; payload: string | null }
  | { type: "SET_RESCUE_RUN"; payload: RescueRunState | null }
  | {
      type: "SET_PROTECTION_STATUS";
      payload: {
        active: boolean;
        workflowId: string | null;
        strategyLabel: string | null;
      };
    };

const initialState: AppState = {
  wallet: null,
  snapshot: null,
  setupDefaults: null,
  protectionConfig: null,
  history: [],
  selectedHistoryId: null,
  rescueRun: null,
  scenario: "normal",
  loading: true,
  error: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "INIT_START":
      return { ...state, loading: true, error: null };
    case "INIT_SUCCESS":
      return {
        ...state,
        loading: false,
        error: null,
        snapshot: action.payload.snapshot,
        setupDefaults: action.payload.setupDefaults,
        protectionConfig: action.payload.protectionConfig,
        history: action.payload.history,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_WALLET":
      return { ...state, wallet: action.payload };
    case "SET_SCENARIO":
      return { ...state, scenario: action.payload };
    case "SET_SNAPSHOT":
      return { ...state, snapshot: action.payload };
    case "SET_PROTECTION_CONFIG":
      return { ...state, protectionConfig: action.payload };
    case "SET_HISTORY":
      return { ...state, history: action.payload };
    case "SET_SELECTED_HISTORY":
      return { ...state, selectedHistoryId: action.payload };
    case "SET_RESCUE_RUN":
      return { ...state, rescueRun: action.payload };
    case "SET_PROTECTION_STATUS":
      return state.snapshot
        ? {
            ...state,
            snapshot: {
              ...state.snapshot,
              protectionStatus: {
                active: action.payload.active,
                workflowId: action.payload.workflowId,
                strategyLabel: action.payload.strategyLabel,
              },
            },
          }
        : state;
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  initialize: () => Promise<void>;
  refreshSnapshot: () => Promise<void>;
  setScenario: (scenario: MockScenarioId) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  setProtectionConfig: (config: ProtectionConfig) => void;
  applyPreset: (preset: StrategyPreset) => void;
  deploy: () => Promise<void>;
  triggerRescue: () => Promise<void>;
  dismissRescueRun: () => void;
  selectHistory: (id: string) => void;
  triggeredPositionsCount: number;
  coverage: number;
  rescuesPerDayEstimate: number;
}

const AppContext = createContext<AppContextValue | null>(null);

function loadPersistedState(): PersistedState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function persistState(state: PersistedState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const pollingRef = useRef<number | null>(null);

  const initialize = useCallback(async () => {
    dispatch({ type: "INIT_START" });

    try {
      const persisted = loadPersistedState();
      const scenario = persisted?.selectedScenario ?? "normal";

      dispatch({ type: "SET_SCENARIO", payload: scenario });

      const [setupDefaults, snapshot, history] = await Promise.all([
        getSetupDefaults(),
        getPortfolioSnapshot(scenario),
        getRescueHistory(),
      ]);

      let hydratedSnapshot = snapshot;

      if (persisted?.workflowId || persisted?.protectionActive) {
        hydratedSnapshot = {
          ...snapshot,
          protectionStatus: {
            active: Boolean(persisted?.protectionActive),
            workflowId: persisted?.workflowId ?? null,
            strategyLabel: persisted?.strategyLabel ?? "Balanced",
          },
        };
      }

      applySnapshot(hydratedSnapshot);

      dispatch({
        type: "INIT_SUCCESS",
        payload: {
          snapshot: hydratedSnapshot,
          setupDefaults,
          protectionConfig: persisted?.protectionConfig ?? setupDefaults.config,
          history,
        },
      });

      if (persisted?.selectedHistoryId) {
        dispatch({ type: "SET_SELECTED_HISTORY", payload: persisted.selectedHistoryId });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to initialize app state";
      dispatch({ type: "SET_ERROR", payload: message });
    }
  }, []);

  const refreshSnapshot = useCallback(async () => {
    if (!state.snapshot) {
      return;
    }

    try {
      const snapshot = await getPortfolioSnapshot(state.scenario);

      const mergedSnapshot = {
        ...snapshot,
        protectionStatus: state.snapshot.protectionStatus,
      };

      dispatch({ type: "SET_SNAPSHOT", payload: mergedSnapshot });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to refresh snapshot";
      dispatch({ type: "SET_ERROR", payload: message });
    }
  }, [state.scenario, state.snapshot]);

  const setScenario = useCallback(async (scenario: MockScenarioId) => {
    dispatch({ type: "SET_SCENARIO", payload: scenario });

    try {
      const snapshot = await getPortfolioSnapshot(scenario);
      dispatch({ type: "SET_SNAPSHOT", payload: snapshot });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to set scenario";
      dispatch({ type: "SET_ERROR", payload: message });
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      const wallet = await connectWallet();
      dispatch({ type: "SET_WALLET", payload: wallet });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Wallet connect failed";
      dispatch({ type: "SET_ERROR", payload: message });
    }
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectWallet();
    dispatch({ type: "SET_WALLET", payload: null });
  }, []);

  const setProtectionConfig = useCallback((config: ProtectionConfig) => {
    dispatch({ type: "SET_PROTECTION_CONFIG", payload: config });
  }, []);

  const applyPreset = useCallback(
    (preset: StrategyPreset) => {
      if (!state.protectionConfig) {
        return;
      }

      dispatch({
        type: "SET_PROTECTION_CONFIG",
        payload: {
          ...state.protectionConfig,
          threshold: preset.threshold,
        },
      });
    },
    [state.protectionConfig],
  );

  const deploy = useCallback(async () => {
    if (!state.protectionConfig || !state.snapshot) {
      return;
    }

    try {
      const isAlreadyActive = state.snapshot.protectionStatus.active;

      if (isAlreadyActive) {
        await updateProtection(state.protectionConfig);

        dispatch({
          type: "SET_PROTECTION_STATUS",
          payload: {
            active: true,
            workflowId: state.snapshot.protectionStatus.workflowId,
            strategyLabel: "Balanced",
          },
        });
        return;
      }

      const result = await deployProtection(state.protectionConfig);

      dispatch({
        type: "SET_PROTECTION_STATUS",
        payload: {
          active: true,
          workflowId: result.workflowId,
          strategyLabel: "Balanced",
        },
      });

      const snapshot = await getPortfolioSnapshot(state.scenario);
      dispatch({
        type: "SET_SNAPSHOT",
        payload: {
          ...snapshot,
          protectionStatus: {
            active: true,
            workflowId: result.workflowId,
            strategyLabel: "Balanced",
          },
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Deploy failed";
      dispatch({ type: "SET_ERROR", payload: message });
    }
  }, [state.protectionConfig, state.scenario, state.snapshot]);

  const triggerRescue = useCallback(async () => {
    if (!state.snapshot) {
      return;
    }

    const run = await triggerDeterministicRescue(state.scenario);

    let current: RescueRunState = {
      runId: run.runId,
      active: true,
      phase: {
        phase: "idle",
        progress: 0,
        status: "running",
        startedAt: new Date().toISOString(),
        message: "Waiting for CRE trigger.",
      },
      phases: [],
    };

    dispatch({ type: "SET_RESCUE_RUN", payload: current });

    const timer = window.setInterval(async () => {
      const phase = await getRescueRun(run.runId);

      current = {
        ...current,
        phase,
        phases: [...current.phases, phase],
        active: phase.status === "running" || phase.status === "partial" || phase.status === "ccip-delayed",
      };

      dispatch({ type: "SET_RESCUE_RUN", payload: current });

      if (
        phase.phase === "complete" ||
        phase.phase === "failed" ||
        phase.status === "ccip-delayed" ||
        phase.status === "ccip-failed"
      ) {
        window.clearInterval(timer);

        if (phase.phase === "complete") {
          const workflowId = state.snapshot?.protectionStatus.workflowId ?? "wf-local-demo";
          const recoveredSnapshot = applySuccessfulRescueSnapshot(workflowId);
          dispatch({ type: "SET_SNAPSHOT", payload: recoveredSnapshot });

          const entryType = state.scenario === "partial" ? "partial" : "success";

          await appendMockHistoryEntry({
            type: state.scenario === "normal" ? "ccip-cross-chain" : "same-chain",
            timestampUtc: new Date().toISOString(),
            source: {
              protocol: "compound-v3",
              chain: "arbitrum-sepolia",
              amountUsd: 3000,
              token: "WETH",
            },
            target: {
              protocol: "morpho-v2",
              chain: "base-sepolia",
              amountUsd: 3000,
              token: "WETH",
            },
            amount: {
              token: "WETH",
              quantity: 1.25,
              usdValue: 3000,
            },
            gasEth: 0.004,
            ccipFeeLink: 0.1,
            hfBefore: 1.1,
            hfAfter: 1.31,
            txHash: "",
            workflowId,
            status: entryType,
            blockNumber: 48292000,
            reason:
              state.scenario === "partial"
                ? "Source #1 insufficient. Fall-through to source #2 completed rescue."
                : undefined,
          });

          const history = await getRescueHistory();
          dispatch({ type: "SET_HISTORY", payload: history });
        }

        if (phase.status === "ccip-failed") {
          await appendMockHistoryEntry({
            type: "ccip-cross-chain",
            timestampUtc: new Date().toISOString(),
            source: {
              protocol: "compound-v3",
              chain: "arbitrum-sepolia",
              amountUsd: 2200,
              token: "USDC",
            },
            target: {
              protocol: "morpho-v2",
              chain: "base-sepolia",
              amountUsd: 2200,
              token: "USDC",
            },
            amount: {
              token: "USDC",
              quantity: 2200,
              usdValue: 2200,
            },
            gasEth: 0.002,
            ccipFeeLink: 0.07,
            hfBefore: 1.04,
            hfAfter: 1.07,
            txHash: "",
            workflowId: state.snapshot?.protectionStatus.workflowId ?? "wf-local-demo",
            status: "escrow",
            blockNumber: 48292011,
            reason: "CCIP failed. Funds moved to RescueEscrow on source chain.",
          });

          const history = await getRescueHistory();
          dispatch({ type: "SET_HISTORY", payload: history });
        }
      }
    }, 1100);
  }, [state.scenario, state.snapshot]);

  const selectHistory = useCallback((id: string) => {
    dispatch({ type: "SET_SELECTED_HISTORY", payload: id });
  }, []);

  const dismissRescueRun = useCallback(() => {
    dispatch({ type: "SET_RESCUE_RUN", payload: null });
  }, []);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (pollingRef.current !== null) {
      window.clearInterval(pollingRef.current);
    }

    pollingRef.current = window.setInterval(() => {
      void refreshSnapshot();
    }, CRE_CHECK_INTERVAL_MS);

    return () => {
      if (pollingRef.current !== null) {
        window.clearInterval(pollingRef.current);
      }
    };
  }, [refreshSnapshot]);

  useEffect(() => {
    if (!state.snapshot) {
      return;
    }

    persistState({
      protectionConfig: state.protectionConfig,
      selectedScenario: state.scenario,
      selectedHistoryId: state.selectedHistoryId,
      workflowId: state.snapshot.protectionStatus.workflowId,
      protectionActive: state.snapshot.protectionStatus.active,
      strategyLabel: state.snapshot.protectionStatus.strategyLabel,
    });
  }, [state.protectionConfig, state.scenario, state.selectedHistoryId, state.snapshot]);

  const triggeredPositionsCount = useMemo(() => {
    if (!state.snapshot || !state.protectionConfig) {
      return 0;
    }

    return positionsTriggeredAtThreshold(
      state.snapshot.positions,
      state.protectionConfig.threshold,
      state.protectionConfig.emergencyOverride,
    ).length;
  }, [state.protectionConfig, state.snapshot]);

  const coverage = useMemo(() => {
    if (!state.snapshot || !state.protectionConfig) {
      return 0;
    }

    return computeCoverage(state.snapshot.positions, state.protectionConfig);
  }, [state.protectionConfig, state.snapshot]);

  const rescuesPerDayEstimate = useMemo(() => {
    if (!state.protectionConfig) {
      return 0;
    }

    return estimateRescuesPerDay(state.protectionConfig.dailyCapEth, state.protectionConfig.perRescueCapEth);
  }, [state.protectionConfig]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      initialize,
      refreshSnapshot,
      setScenario,
      connect,
      disconnect,
      setProtectionConfig,
      applyPreset,
      deploy,
      triggerRescue,
      dismissRescueRun,
      selectHistory,
      triggeredPositionsCount,
      coverage,
      rescuesPerDayEstimate,
    }),
    [
      state,
      initialize,
      refreshSnapshot,
      setScenario,
      connect,
      disconnect,
      setProtectionConfig,
      applyPreset,
      deploy,
      triggerRescue,
      dismissRescueRun,
      selectHistory,
      triggeredPositionsCount,
      coverage,
      rescuesPerDayEstimate,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState(): AppContextValue {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }

  return context;
}
