import { Save, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AlinhamentoCard } from "./AlinhamentoCard";
import { ExpectativasCard } from "./ExpectativasCard";
import { AcessoRapidoCard } from "./AcessoRapidoCard";
import { PlanejamentoTrimestralCard } from "./PlanejamentoTrimestralCard";
import { RetrospectivaTrimestralCard } from "./RetrospectivaTrimestralCard";
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
    <div className="relative h-full">
      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="space-y-4 p-4 pb-24">
          <AlinhamentoCard 
            data={data.alinhamento} 
            onChange={(alinhamento) => setData({ ...data, alinhamento })} 
          />
          <ExpectativasCard 
            data={data.expectativas} 
            onChange={(expectativas) => setData({ ...data, expectativas })} 
          />
          <AcessoRapidoCard 
            data={data.links} 
            onChange={(links) => setData({ ...data, links })} 
          />
          <PlanejamentoTrimestralCard 
            data={data.planejamento} 
            onChange={(planejamento) => setData({ ...data, planejamento })} 
          />
          <RetrospectivaTrimestralCard 
            data={data.retrospectiva} 
            onChange={(retrospectiva) => setData({ ...data, retrospectiva })} 
          />
        </div>
      </ScrollArea>

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
