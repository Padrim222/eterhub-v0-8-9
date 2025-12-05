import { TrendingUp, Target, Calendar, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { AlinhamentoData, PlanejamentoData, Iniciativa } from "@/hooks/useClientProjectData";

interface MetricsCardsSectionProps {
  alinhamento: AlinhamentoData;
  planejamento: PlanejamentoData;
}

export const MetricsCardsSection = ({ alinhamento, planejamento }: MetricsCardsSectionProps) => {
  // Calculate status from initiatives
  const completedIniciativas = planejamento.iniciativas.filter(i => i.status === "concluido").length;
  const totalIniciativas = planejamento.iniciativas.length;
  const progressPercentage = totalIniciativas > 0 ? Math.round((completedIniciativas / totalIniciativas) * 100) : 0;
  
  const getStatusLabel = () => {
    if (progressPercentage >= 80) return "Concluído";
    if (progressPercentage >= 50) return "Em Progresso";
    if (progressPercentage > 0) return "Iniciado";
    return "Não Iniciado";
  };

  const isOnTrack = progressPercentage >= 40; // Simplified check

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Status Geral */}
      <Card className="bg-gray-900 border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm text-white/60">Status Geral</span>
          </div>
          <Badge variant={isOnTrack ? "default" : "destructive"} className="text-xs">
            {isOnTrack ? "No Prazo" : "Atrasado"}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-white">{getStatusLabel()}</span>
            <span className="text-primary text-sm font-medium">+12%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <span className="text-xs text-white/60">{progressPercentage}% concluído</span>
        </div>
      </Card>

      {/* Meta Anual */}
      <Card className="bg-gray-900 border-gray-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm text-white/60">Meta Anual</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="text-xl font-bold text-white truncate">
              {alinhamento.metaAnual || "Não definida"}
            </span>
          </div>
          <Progress value={80} className="h-2" />
          <span className="text-xs text-white/60">80% do objetivo</span>
        </div>
      </Card>

      {/* Meta Trimestral */}
      <Card className="bg-gray-900 border-gray-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm text-white/60">Meta Trimestral</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="text-xl font-bold text-white truncate">
              {planejamento.metaTrimestral || "Q4 2025"}
            </span>
          </div>
          <Progress value={45} className="h-2" />
          <span className="text-xs text-white/60">45% concluído</span>
        </div>
      </Card>

      {/* Indicadores-Chave */}
      <Card className="bg-gray-900 border-gray-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm text-white/60">Indicadores-Chave</span>
        </div>
        <div className="space-y-2">
          {planejamento.indicadores.slice(0, 3).map((ind) => (
            <div key={ind.id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/60 truncate">{ind.name}</span>
                <span className="text-white">{ind.atual || "0"}/{ind.meta || "0"}</span>
              </div>
              <Progress 
                value={ind.meta && ind.atual ? (parseFloat(ind.atual) / parseFloat(ind.meta)) * 100 : 0} 
                className="h-1.5" 
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
