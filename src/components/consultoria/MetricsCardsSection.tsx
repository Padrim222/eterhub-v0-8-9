import { Card } from "@/components/ui/card";
import type { AlinhamentoData, PlanejamentoData, Entrega } from "@/hooks/useClientProjectData";

interface MetricsCardsSectionProps {
  alinhamento: AlinhamentoData;
  planejamento: PlanejamentoData;
  entregas?: Entrega[];
}

export const MetricsCardsSection = ({ alinhamento, planejamento, entregas = [] }: MetricsCardsSectionProps) => {
  // Calculate status from initiatives
  const completedIniciativas = planejamento.iniciativas.filter(i => i.status === "concluido").length;
  const totalIniciativas = planejamento.iniciativas.length;
  const progressPercentage = totalIniciativas > 0 ? Math.round((completedIniciativas / totalIniciativas) * 100) : 0;
  
  // Calculate Meta Anual progress from entregas
  const completedEntregas = entregas.filter(e => e.status === "aprovado").length;
  const totalEntregas = entregas.length;
  const metaAnualProgress = totalEntregas > 0 ? Math.round((completedEntregas / totalEntregas) * 100) : 0;

  // Calculate Meta Trimestral progress from initiatives that are in progress or completed
  const activeIniciativas = planejamento.iniciativas.filter(i => i.status === "em_andamento" || i.status === "concluido").length;
  const metaTrimestralProgress = totalIniciativas > 0 ? Math.round((activeIniciativas / totalIniciativas) * 100) : 0;

  // Calculate week-over-week change (simulated based on recent progress)
  const weekChange = metaAnualProgress > 0 ? `+${Math.min(metaAnualProgress, 15)}%` : "0%";
  
  const getStatusLabel = () => {
    if (progressPercentage >= 80) return "Concluído";
    if (progressPercentage >= 50) return "Em Progresso";
    if (progressPercentage > 0) return "Iniciado";
    return "Não Iniciado";
  };

  const isOnTrack = progressPercentage >= 40;

  // Custom progress bar with circle indicator
  const ProgressWithIndicator = ({ value, className }: { value: number; className?: string }) => (
    <div className={`relative w-full h-2 bg-gray-700 rounded-full ${className || ""}`}>
      <div 
        className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
      <div 
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-white shadow-md transition-all"
        style={{ left: `calc(${Math.min(value, 100)}% - 6px)` }}
      />
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Status Geral */}
      <Card className="bg-card-dark border-gray-700 p-4">
        <span className="text-sm text-white/60">Status Geral</span>
        <div className="mt-2 mb-3">
          <span className="text-2xl font-bold text-white">{getStatusLabel()}</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-primary text-sm font-medium">{progressPercentage}%</span>
          <ProgressWithIndicator value={progressPercentage} className="flex-1" />
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-0.5 rounded-full ${isOnTrack ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
            {isOnTrack ? "No Prazo" : "Atrasado"}
          </span>
          <span className="text-primary text-xs font-medium">{weekChange}</span>
        </div>
      </Card>

      {/* Meta Anual */}
      <Card className="bg-card-dark border-gray-700 p-4">
        <span className="text-sm text-white/60">Meta Anual</span>
        <div className="mt-2 mb-3">
          <span className="text-xl font-bold text-white truncate block">
            {alinhamento.metaAnual || "Não definida"}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-primary text-sm font-medium">{metaAnualProgress}%</span>
          <ProgressWithIndicator value={metaAnualProgress} className="flex-1" />
        </div>
        <span className="text-xs text-white/60">{completedEntregas} de {totalEntregas} entregas concluídas</span>
      </Card>

      {/* Meta Trimestral */}
      <Card className="bg-card-dark border-gray-700 p-4">
        <span className="text-sm text-white/60">Meta Trimestral</span>
        <div className="mt-2 mb-3">
          <span className="text-xl font-bold text-white truncate block">
            {planejamento.metaTrimestral || "Q4 2025"}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-primary text-sm font-medium">{metaTrimestralProgress}%</span>
          <ProgressWithIndicator value={metaTrimestralProgress} className="flex-1" />
        </div>
        <span className="text-xs text-white/60">{activeIniciativas} de {totalIniciativas} iniciativas ativas</span>
      </Card>

      {/* Indicadores-Chave */}
      <Card className="bg-card-dark border-gray-700 p-4">
        <span className="text-sm text-white/60 mb-3 block">Indicadores-Chave</span>
        <div className="space-y-3">
          {planejamento.indicadores.slice(0, 3).map((ind) => {
            const value = ind.meta && ind.atual ? (parseFloat(ind.atual) / parseFloat(ind.meta)) * 100 : 0;
            return (
              <div key={ind.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60 truncate">{ind.name}</span>
                  <span className="text-white">{ind.atual || "0"}/{ind.meta || "0"}</span>
                </div>
                <ProgressWithIndicator value={value} className="h-1.5" />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
