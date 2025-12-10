import { cn } from "@/lib/utils";
import { BarChart3, Lightbulb, Search, FileText, PenTool, CheckCircle } from "lucide-react";
import type { ProductionStage, ProductionStatus } from "@/hooks/useEterflow";

interface ProductionLineProps {
  currentStage: ProductionStage;
  status: ProductionStatus;
  onStageClick?: (stage: ProductionStage) => void;
}

const stages: { id: ProductionStage; label: string; icon: React.ElementType }[] = [
  { id: "analysis", label: "Análise", icon: BarChart3 },
  { id: "ideation", label: "Ideação", icon: Lightbulb },
  { id: "research", label: "Pesquisa", icon: Search },
  { id: "narrative", label: "Narrativa", icon: FileText },
  { id: "writing", label: "Escrita", icon: PenTool },
];

const stageOrder: Record<ProductionStage, number> = {
  analysis: 0,
  ideation: 1,
  research: 2,
  narrative: 3,
  writing: 4,
  completed: 5,
};

export function ProductionLine({ currentStage, status, onStageClick }: ProductionLineProps) {
  const currentIndex = stageOrder[currentStage];

  const getStageStatus = (stageId: ProductionStage) => {
    const stageIndex = stageOrder[stageId];
    
    if (currentStage === "completed") return "completed";
    if (stageIndex < currentIndex) return "completed";
    if (stageIndex === currentIndex) {
      if (status === "touchpoint") return "touchpoint";
      if (status === "in_progress") return "active";
      if (status === "completed") return "completed";
      return "active";
    }
    return "pending";
  };

  return (
    <div className="w-full bg-card-dark border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const stageStatus = getStageStatus(stage.id);
          const Icon = stage.icon;
          
          return (
            <div key={stage.id} className="flex items-center">
              {/* Stage node */}
              <button
                onClick={() => onStageClick?.(stage.id)}
                className={cn(
                  "relative flex flex-col items-center gap-2 transition-all",
                  stageStatus !== "pending" && "cursor-pointer"
                )}
                disabled={stageStatus === "pending"}
              >
                {/* Circle with icon */}
                <div
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all",
                    stageStatus === "completed" && "bg-primary/20 border-primary text-primary",
                    stageStatus === "active" && "bg-primary/10 border-primary text-primary animate-pulse",
                    stageStatus === "touchpoint" && "bg-yellow-500/20 border-yellow-500 text-yellow-400",
                    stageStatus === "pending" && "bg-gray-800 border-gray-600 text-gray-500"
                  )}
                >
                  {stageStatus === "completed" && currentStage !== stage.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-xs font-medium",
                    stageStatus === "completed" && "text-primary",
                    stageStatus === "active" && "text-primary",
                    stageStatus === "touchpoint" && "text-yellow-400",
                    stageStatus === "pending" && "text-gray-500"
                  )}
                >
                  {stage.label}
                </span>

                {/* Touchpoint indicator */}
                {stageStatus === "touchpoint" && (
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-yellow-500 text-black text-[10px] font-bold rounded-full">
                    !
                  </span>
                )}
              </button>

              {/* Connector line */}
              {index < stages.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-12 mx-2 transition-all",
                    stageOrder[stage.id] < currentIndex
                      ? "bg-primary"
                      : "bg-gray-700"
                  )}
                />
              )}
            </div>
          );
        })}

        {/* Final completed state */}
        {currentStage === "completed" && (
          <div className="flex items-center ml-2">
            <div className="h-0.5 w-8 bg-primary" />
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-green-500/20 border-2 border-green-500 text-green-400">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
