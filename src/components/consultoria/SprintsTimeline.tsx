import { Calendar, Check, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Sprint } from "@/hooks/useClientProjectData";

interface SprintsTimelineProps {
  sprints: Sprint[];
  onChange?: (sprints: Sprint[]) => void;
}

export const SprintsTimeline = ({ sprints, onChange }: SprintsTimelineProps) => {
  const activeSprint = sprints.find(s => s.status === "ativo");
  const activeIndex = sprints.findIndex(s => s.status === "ativo");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-white">Sprints</h3>
      </div>

      {/* Timeline horizontal */}
      <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm p-6">
        <div className="relative flex items-center justify-between mb-8">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 h-0.5 bg-gray-700 top-4" />
          
          {/* Progress line */}
          <div 
            className="absolute left-0 h-0.5 bg-primary top-4 transition-all"
            style={{ 
              width: `${activeIndex >= 0 ? ((activeIndex + 0.5) / sprints.length) * 100 : 0}%` 
            }}
          />

          {sprints.map((sprint, index) => (
            <div key={sprint.id} className="relative flex flex-col items-center z-10 flex-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all text-sm font-semibold",
                  sprint.status === "ativo" && "bg-primary border-primary scale-125 shadow-lg shadow-primary/30 text-primary-foreground",
                  sprint.status === "concluido" && "bg-primary border-primary text-primary-foreground",
                  sprint.status === "planejado" && "bg-gray-800 border-gray-600 text-gray-400"
                )}
              >
                {index + 1}
              </div>
              <span className="text-xs text-white/60 mt-2 px-2 py-0.5 border border-gray-600 rounded whitespace-nowrap">
                {sprint.start}
              </span>
              <span className="text-xs text-white/40 whitespace-nowrap">
                {sprint.name}
              </span>
            </div>
          ))}

          {/* Add Sprint Button */}
          <div className="relative flex flex-col items-center z-10">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-full border-2 border-dashed border-gray-600 bg-transparent hover:bg-gray-800 hover:border-primary"
            >
              <Plus className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
        </div>

        {/* Active Sprint Card */}
        {activeSprint && (
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-white">{activeSprint.name}</h4>
                <Badge className="bg-primary/20 text-primary border-0">Atual</Badge>
              </div>
              <span className="text-sm text-white/60">
                {activeSprint.start} - {activeSprint.end}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
              <span>Tarefas: 8 de 12</span>
              <span>•</span>
              <span>4 restantes</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Progresso</span>
                <span className="text-primary">66%</span>
              </div>
              <Progress value={66} className="h-2" />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
