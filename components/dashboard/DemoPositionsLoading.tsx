import { DatabaseZap, Cpu, Globe, Link } from "lucide-react";
import { useEffect, useState } from "react";

export function DemoPositionsLoading() {
  const [step, setStep] = useState(0);

  const steps = [
    "Initializing mock environment...",
    "Deploying smart contracts to Sepolia...",
    "Funding demo wallets with test tokens...",
    "Opening Aave V4 long positions...",
    "Simulating market conditions...",
    "Finalizing cross-chain state...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < steps.length - 1 ? s + 1 : s));
    }, 2000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="relative flex flex-col items-center justify-center p-16 text-center rounded-xl border border-[#36423b]/30 bg-[#101410]/50 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1b231d]/50 to-transparent" />
      <div className="absolute -top-24 -left-24 size-64 bg-[#36423b]/10 blur-[100px] rounded-full" />
      <div className="absolute -bottom-24 -right-24 size-64 bg-blue-500/10 blur-[100px] rounded-full" />

      {/* Animated icon central */}
      <div className="relative flex items-center justify-center size-32 mb-8">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#36423b]/40 animate-[spin_10s_linear_infinite]" />

        {/* Middle fast rotating ring */}
        <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-[#f6f8f3] border-l-[#f6f8f3] animate-[spin_3s_linear_infinite]" />

        {/* Inner solid ring */}
        <div className="absolute inset-8 rounded-full border border-[#36423b]/60 bg-[#1b231d]/80 shadow-[0_0_30px_rgba(199,243,107,0.2)] flex items-center justify-center">
          <DatabaseZap className="size-6 text-[#f6f8f3] animate-pulse" />
        </div>

        {/* Floating particles/icons */}
        <div
          className="absolute top-0 right-2 size-6 bg-[#101410] rounded-full border border-[#36423b] flex items-center justify-center animate-bounce shadow-[0_0_10px_rgba(199,243,107,0.3)]"
          style={{ animationDelay: "100ms" }}
        >
          <Globe className="size-3 text-[#36423b]" />
        </div>
        <div
          className="absolute bottom-2 left-0 size-6 bg-[#101410] rounded-full border border-[#36423b] flex items-center justify-center animate-bounce shadow-[0_0_10px_rgba(199,243,107,0.3)]"
          style={{ animationDelay: "300ms" }}
        >
          <Cpu className="size-3 text-[#36423b]" />
        </div>
        <div
          className="absolute bottom-4 right-0 size-6 bg-[#101410] rounded-full border border-[#36423b] flex items-center justify-center animate-bounce shadow-[0_0_10px_rgba(199,243,107,0.3)]"
          style={{ animationDelay: "700ms" }}
        >
          <Link className="size-3 text-[#36423b]" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <h3 className="text-xl font-bold text-white mb-4 tracking-wide flex items-center gap-2 justify-center">
          <span className="size-2 bg-blue-400 rounded-full animate-ping" />
          Provisioning Environment
        </h3>

        {/* Step text animation */}
        <div className="h-6 overflow-hidden relative w-full text-center">
          {steps.map((text, i) => (
            <p
              key={i}
              className={`absolute inset-0 w-full text-sm font-mono transition-all duration-500 ease-out ${
                i === step
                  ? "opacity-100 translate-y-0 text-blue-300"
                  : i < step
                    ? "opacity-0 -translate-y-4 text-[#36423b]"
                    : "opacity-0 translate-y-4 text-[#36423b]"
              }`}
            >
              {text}
            </p>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-6 w-full h-1 bg-[#1b231d] rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-400 transition-all duration-1000 ease-in-out"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
