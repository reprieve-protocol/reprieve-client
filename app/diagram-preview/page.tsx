import { RescueCREWorkflowAnimation } from "@/components/dashboard/RescueCREWorkflowAnimation";

export default function DiagramPreviewPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Diagram Preview</h1>
        <p className="text-sm text-[#a9b2ab]">
          Visual QA page for risk-flow animation.
        </p>
      </div>
      <RescueCREWorkflowAnimation />
    </div>
  );
}
