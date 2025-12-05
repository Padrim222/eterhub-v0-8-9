import { Rocket, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Iniciativa } from "@/hooks/useClientProjectData";

interface IniciativasSectionProps {
  iniciativas: Iniciativa[];
  onChange?: (iniciativas: Iniciativa[]) => void;
}

const statusConfig = {
  pendente: { label: "Atrasado", className: "border border-red-500 text-red-400 bg-transparent" },
  em_andamento: { label: "Em dia", className: "border border-green-500 text-green-400 bg-transparent" },
  concluido: { label: "Concluído", className: "bg-green-500 text-black" },
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
            <Card key={ini.id} className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white truncate">{ini.name}</h4>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[ini.status].className}`}>
                  <Clock className="w-3 h-3" />
                  {statusConfig[ini.status].label}
                </span>
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
