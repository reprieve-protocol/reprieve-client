"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

type ToastTone = "success" | "danger" | "info";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  pushToast: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastViewport({
  toasts,
  dismissToast,
}: {
  toasts: ToastItem[];
  dismissToast: (id: number) => void;
}) {
  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto animate-fade-up rounded-2xl border px-4 py-3 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.9)] backdrop-blur-md",
            toast.tone === "success" &&
              "border-emerald-400/25 bg-[#131a15]/95 text-emerald-100",
            toast.tone === "danger" &&
              "border-red-400/25 bg-[#1a1315]/95 text-red-100",
            toast.tone === "info" &&
              "border-[#c7f36b]/25 bg-[#141915]/95 text-[#eff7dc]",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description ? (
                <p className="mt-1 text-xs text-white/70">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="text-xs text-white/50 transition-colors hover:text-white"
              onClick={() => dismissToast(toast.id)}
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(1);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = nextIdRef.current++;

      setToasts((current) => [...current, { ...toast, id }]);

      window.setTimeout(() => {
        dismissToast(id);
      }, 2600);
    },
    [dismissToast],
  );

  const value = useMemo<ToastContextValue>(
    () => ({ pushToast }),
    [pushToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
