import { Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Iniciativa } from "@/hooks/useClientProjectData";

interface IniciativasSectionProps {
  iniciativas: Iniciativa[];
  onChange?: (iniciativas: Iniciativa[]) => void;
}

const statusConfig = {
  pendente: { label: "Pendente", variant: "secondary" as const },
  em_andamento: { label: "Em Andamento", variant: "default" as const },
  concluido: { label: "Concluído", variant: "outline" as const },
};

export const IniciativasSection = ({ iniciativas, onChange }: IniciativasSectionProps) => {
  // Get first 3 initiatives
  const displayedIniciativas = iniciativas.slice(0, 3);

  // Calculate progress for each initiative (simulated - could be enhanced with subtasks)
  const getProgress = (ini: Iniciativa) => {
    if (ini.status === "concluido") return 100;
    if (ini.status === "em_andamento") return 50;
    return 0;
  };

  const getSteps = (ini: Iniciativa) => {
    if (ini.status === "concluido") return { completed: 4, total: 4 };
    if (ini.status === "em_andamento") return { completed: 2, total: 4 };
    return { completed: 0, total: 4 };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Rocket className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-white">Iniciativas do Trimestre</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayedIniciativas.map((ini) => {
          const steps = getSteps(ini);
          const progress = getProgress(ini);
          
          return (
            <Card key={ini.id} className="bg-gray-900 border-gray-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white truncate">{ini.name}</h4>
                <Badge 
                  variant={statusConfig[ini.status].variant}
                  className={
                    ini.status === "concluido" 
                      ? "bg-primary/20 text-primary border-primary/30" 
                      : ini.status === "em_andamento"
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      : ""
                  }
                >
                  {statusConfig[ini.status].label}
                </Badge>
              </div>
              <p className="text-sm text-white/60 mb-3">
                {steps.completed} de {steps.total} etapas concluídas
              </p>
              <Progress value={progress} className="h-2" />
            </Card>
          );
        })}
      </div>
    </div>
  );
};
