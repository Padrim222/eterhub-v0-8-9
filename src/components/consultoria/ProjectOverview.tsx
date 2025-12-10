import { Save, Loader2 } from "lucide-react";
import eterLogo from "@/assets/eter-logo.png";
import { Button } from "@/components/ui/button";
import { AlinhamentoCard } from "./AlinhamentoCard";
import { MetricsCardsSection } from "./MetricsCardsSection";
import { IniciativasSection } from "./IniciativasSection";
import { AtividadesTable } from "./AtividadesTable";
import { SprintsTimeline } from "./SprintsTimeline";
import { RetrospectivaTrimestralCard } from "./RetrospectivaTrimestralCard";
import { ArquivosLinksSection } from "./ArquivosLinksSection";
import { useClientProjectData } from "@/hooks/useClientProjectData";

export const ProjectOverview = () => {
  const { data, setData, isLoading, isSaving, saveData } = useClientProjectData();

  const handleSave = async () => {
    await saveData(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-220px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Logo Eter Hub como plano de fundo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img 
          src={eterLogo} 
          alt="" 
          className="h-64 opacity-10"
        />
      </div>

      <div className="space-y-6 pb-24 relative z-10">
        {/* 1. Alinhamento - Card simples */}
        <AlinhamentoCard
          data={data.alinhamento} 
          onChange={(alinhamento) => setData({ ...data, alinhamento })} 
        />
        
        {/* 2. Cards de Métricas - Grid 4 colunas */}
        <MetricsCardsSection 
          alinhamento={data.alinhamento}
          planejamento={data.planejamento}
          entregas={data.entregas}
        />
        
        {/* 3. Iniciativas do Trimestre - 3 cards */}
        <IniciativasSection 
          iniciativas={data.planejamento.iniciativas}
          onChange={(iniciativas) => setData({ 
            ...data, 
            planejamento: { ...data.planejamento, iniciativas } 
          })}
        />
        
        {/* 4. Atividades - Tabela */}
        <AtividadesTable 
          entregas={data.entregas}
          onChange={(entregas) => setData({ ...data, entregas })}
        />
        
        {/* 5. Sprints - Timeline visual */}
        <SprintsTimeline 
          sprints={data.planejamento.sprints}
          onChange={(sprints) => setData({ 
            ...data, 
            planejamento: { ...data.planejamento, sprints } 
          })}
        />
        
        {/* 6. Retrospectiva - Grid 3 colunas */}
        <RetrospectivaTrimestralCard 
          data={data.retrospectiva}
          onChange={(retrospectiva) => setData({ ...data, retrospectiva })}
        />
        
        {/* 8. Arquivos & Links - Lista */}
        <ArquivosLinksSection 
          data={data.links}
          onChange={(links) => setData({ ...data, links })}
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="fixed bottom-6 right-6 shadow-lg shadow-primary/30 bg-primary hover:bg-primary/90 text-primary-foreground z-50"
        size="lg"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </>
        )}
      </Button>
    </div>
  );
};
