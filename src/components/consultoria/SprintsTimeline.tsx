
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Sprint } from "@/hooks/useClientProjectData";

interface SprintsTimelineProps {
  sprints: Sprint[];
  onChange?: (sprints: Sprint[]) => void;
}

export const SprintsTimeline = ({ sprints, onChange }: SprintsTimelineProps) => {
  const activeSprint = sprints.find(s => s.status === "ativo");
  const activeIndex = sprints.findIndex(s => s.status === "ativo");

  // Mock task data - could be expanded in Sprint interface later
  const totalTasks = 12;
  const completedTasks = 8;
  const remainingTasks = totalTasks - completedTasks;
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Sprints</h3>

      <Card className="bg-black border-gray-800 p-6">
        {/* Timeline horizontal */}
        <div className="relative flex items-center justify-between mb-6">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 h-0.5 bg-gray-700 top-6" />
          
          {/* Progress line */}
          <div 
            className="absolute left-0 h-0.5 bg-primary top-6 transition-all"
            style={{ 
              width: `${activeIndex >= 0 ? ((activeIndex + 0.5) / (sprints.length + 1)) * 100 : 0}%` 
            }}
          />

          {sprints.map((sprint, index) => (
            <div key={sprint.id} className="relative flex flex-col items-center z-10 flex-1">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all text-lg font-bold",
                  sprint.status !== "planejado" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-gray-800 border-2 border-gray-600 text-gray-400"
                )}
              >
                {index + 1}
              </div>
              <span className={cn(
                "text-xs mt-3 px-3 py-1 rounded border whitespace-nowrap",
                sprint.status === "ativo"
                  ? "border-primary text-primary"
                  : "border-gray-600 text-white/60"
              )}>
                {sprint.start}
              </span>
            </div>
          ))}

          {/* Botão adicionar sprint */}
          <div className="relative flex flex-col items-center z-10">
            <button
              onClick={() => {
                if (onChange) {
                  const newSprint: Sprint = {
                    id: `sprint-${sprints.length + 1}`,
                    name: `Sprint ${sprints.length + 1}`,
                    start: "DD/MM",
                    end: "DD/MM",
                    status: "planejado"
                  };
                  onChange([...sprints, newSprint]);
                }
              }}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-800 border-2 border-dashed border-gray-600 text-gray-400 hover:border-primary hover:text-primary transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
            <span className="text-xs mt-3 px-3 py-1 text-white/40">
              Adicionar
            </span>
          </div>
        </div>

        {/* Active Sprint Card - Horizontal Compact */}
        {activeSprint && (
          <div className="flex items-center justify-between gap-4 bg-gray-800/70 rounded-xl px-4 py-3 border border-gray-700">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white">Sprints {activeIndex + 1}</span>
              <Badge className="bg-primary text-black font-medium">Atual</Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <span className="text-white/80">Tarefas {completedTasks} de {totalTasks}</span>
              <span className="text-primary">{remainingTasks} restantes</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-sm">Progresso</span>
              <Progress value={progressPercent} className="w-40 h-3" />
              <span className="text-white text-sm font-medium">{progressPercent}%</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
