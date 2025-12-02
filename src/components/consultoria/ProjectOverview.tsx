import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlinhamentoCard } from "./AlinhamentoCard";
import { ExpectativasCard, Expectativa } from "./ExpectativasCard";
import { AcessoRapidoCard, LinkItem } from "./AcessoRapidoCard";
import { PlanejamentoTrimestralCard, PlanejamentoData } from "./PlanejamentoTrimestralCard";
import { RetrospectivaTrimestralCard, RetrospectiveData } from "./RetrospectivaTrimestralCard";

// Initial mock data
const initialAlinhamento = {
  porque: "",
  metaAnual: "",
};

const initialExpectativas: Expectativa[] = [
  { id: "1", name: "Payback", value: "", status: "pendente" as const },
  { id: "2", name: "Total Value", value: "", status: "pendente" as const },
  { id: "3", name: "Expectativas Qualitativas", value: "", status: "pendente" as const },
];

const initialLinks: LinkItem[] = [];

const initialPlanejamento: PlanejamentoData = {
  metaTrimestral: "",
  indicadores: [
    { id: "1", name: "Leads Qualificados", atual: "", meta: "" },
    { id: "2", name: "Taxa de Conversão", atual: "", meta: "" },
    { id: "3", name: "NPS", atual: "", meta: "" },
    { id: "4", name: "Receita", atual: "", meta: "" },
  ],
  iniciativas: [
    { id: "A1", name: "Iniciativa A1", completed: false, status: "pendente" },
    { id: "A2", name: "Iniciativa A2", completed: false, status: "pendente" },
    { id: "A3", name: "Iniciativa A3", completed: false, status: "pendente" },
    { id: "A4", name: "Iniciativa A4", completed: false, status: "pendente" },
    { id: "A5", name: "Iniciativa A5", completed: false, status: "pendente" },
    { id: "A6", name: "Iniciativa A6", completed: false, status: "pendente" },
  ],
  proximosPassos: [""],
  sprints: [
    { id: "1", name: "Sprint 1", start: "01/01", end: "14/01", status: "concluido" },
    { id: "2", name: "Sprint 2", start: "15/01", end: "28/01", status: "ativo" },
    { id: "3", name: "Sprint 3", start: "29/01", end: "11/02", status: "planejado" },
    { id: "4", name: "Sprint 4", start: "12/02", end: "25/02", status: "planejado" },
  ],
};

const initialRetrospectiva: RetrospectiveData = {
  keepDoing: [""],
  stopDoing: [""],
  startDoing: [""],
};

export const ProjectOverview = () => {
  const [alinhamento, setAlinhamento] = useState(initialAlinhamento);
  const [expectativas, setExpectativas] = useState(initialExpectativas);
  const [links, setLinks] = useState(initialLinks);
  const [planejamento, setPlanejamento] = useState(initialPlanejamento);
  const [retrospectiva, setRetrospectiva] = useState(initialRetrospectiva);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate save - will be replaced with Supabase integration
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast.success("Alterações salvas com sucesso!");
    setIsSaving(false);
  };

  return (
    <div className="relative h-full">
      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="space-y-4 p-4 pb-24">
          <AlinhamentoCard data={alinhamento} onChange={setAlinhamento} />
          <ExpectativasCard data={expectativas} onChange={setExpectativas} />
          <AcessoRapidoCard data={links} onChange={setLinks} />
          <PlanejamentoTrimestralCard data={planejamento} onChange={setPlanejamento} />
          <RetrospectivaTrimestralCard data={retrospectiva} onChange={setRetrospectiva} />
        </div>
      </ScrollArea>

      {/* Fixed Save Button */}
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
