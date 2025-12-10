import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProductionLine } from "@/components/etherflow/ProductionLine";
import { AgentChat } from "@/components/etherflow/AgentChat";
import { ProductionHistory } from "@/components/etherflow/ProductionHistory";
import { ThemesSelector } from "@/components/etherflow/ThemesSelector";
import { NarrativeEditor } from "@/components/etherflow/NarrativeEditor";
import { ContentPreview } from "@/components/etherflow/ContentPreview";
import { ResearchMapView } from "@/components/etherflow/ResearchMapView";
import { useEtherflow } from "@/hooks/useEtherflow";
import { Play, RotateCcw, Settings } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Etherflow = () => {
  const {
    production,
    messages,
    isLoading,
    startAnalysis,
    startResearch,
    writeContent,
    resetProduction,
    loadProduction,
  } = useEtherflow();

  const [clientContext, setClientContext] = useState("");
  const [toneOfVoice, setToneOfVoice] = useState("");

  // Find latest data from messages
  const latestThemesMessage = [...messages].reverse().find(
    (m) => m.stage === "ideation" && m.data && Array.isArray(m.data)
  );
  const themesData = latestThemesMessage?.data as typeof production.themes | undefined;

  const latestResearchMessage = [...messages].reverse().find(
    (m) => m.stage === "research" && m.data
  );
  const researchData = latestResearchMessage?.data;

  const latestNarrativeMessage = [...messages].reverse().find(
    (m) => m.stage === "narrative" && m.data
  );
  const narrativeData = latestNarrativeMessage?.data as {
    theme_title: string;
    format: string;
    blocks: Array<{
      stage: string;
      block_number: number;
      objective: string;
      content_central: string;
      psychological_principle: string;
      suggested_duration: string;
    }>;
    angle_variations: Array<{ angle: string; tone: string; application: string }>;
    validation_notes?: string;
  } | undefined;

  const latestContentMessage = [...messages].reverse().find(
    (m) => m.stage === "writing" && m.data
  );
  const contentData = latestContentMessage?.data;

  const handleStartProduction = () => {
    startAnalysis(clientContext || undefined);
  };

  const handleSelectTheme = (index: number) => {
    startResearch(index);
  };

  const handleApproveNarrative = (selectedAngle: string) => {
    writeContent(selectedAngle, toneOfVoice || undefined);
  };

  return (
    <PageLayout title="Etherflow">
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60">
              Linha de produção de conteúdo otimizado com IA
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-gray-900 border-gray-700">
                <SheetHeader>
                  <SheetTitle className="text-white">Configurações da Produção</SheetTitle>
                  <SheetDescription className="text-white/60">
                    Configure o contexto e tom de voz para a produção
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  <div>
                    <label className="text-sm text-white/70 block mb-2">
                      Contexto do Cliente
                    </label>
                    <Textarea
                      value={clientContext}
                      onChange={(e) => setClientContext(e.target.value)}
                      placeholder="Descreva a empresa, público-alvo e mensagem central..."
                      className="bg-gray-800 border-gray-700 text-white min-h-[120px]"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/70 block mb-2">
                      Guia de Tom de Voz
                    </label>
                    <Textarea
                      value={toneOfVoice}
                      onChange={(e) => setToneOfVoice(e.target.value)}
                      placeholder="Descreva o tom de voz, estilo de escrita, vocabulário..."
                      className="bg-gray-800 border-gray-700 text-white min-h-[120px]"
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button
              variant="outline"
              size="sm"
              onClick={resetProduction}
              disabled={isLoading}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar
            </Button>

            <Button
              onClick={handleStartProduction}
              disabled={isLoading || production.status === "in_progress"}
            >
              <Play className="w-4 h-4 mr-2" />
              {production.status === "pending" ? "Iniciar Produção" : "Continuar"}
            </Button>
          </div>
        </div>

        {/* Production Line Visualization */}
        <ProductionLine
          currentStage={production.current_stage}
          status={production.status}
        />

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat area - 2 columns */}
          <div className="lg:col-span-2 h-[600px]">
            <AgentChat
              messages={messages}
              isLoading={isLoading}
              currentStage={production.current_stage}
              onSelectTheme={handleSelectTheme}
              onValidateNarrative={handleApproveNarrative}
              themes={themesData || production.themes}
            />
          </div>

          {/* Side panel - 1 column */}
          <div className="space-y-6">
            {/* Show different panels based on stage */}
            {production.current_stage === "ideation" && production.status === "touchpoint" && (
              <ThemesSelector
                themes={themesData || production.themes}
                onSelect={handleSelectTheme}
                selectedIndex={production.selected_theme_index}
                isLoading={isLoading}
              />
            )}

            {production.current_stage === "research" && researchData && (
              <ResearchMapView data={researchData as Parameters<typeof ResearchMapView>[0]["data"]} />
            )}

            {production.current_stage === "narrative" && narrativeData && (
              <NarrativeEditor
                skeleton={narrativeData}
                onApprove={handleApproveNarrative}
                isLoading={isLoading}
              />
            )}

            {production.current_stage === "completed" && contentData && (
              <ContentPreview content={contentData as Parameters<typeof ContentPreview>[0]["content"]} />
            )}

            {/* Production History */}
            <ProductionHistory
              onSelectProduction={loadProduction}
              currentProductionId={production.playbook_id}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Etherflow;
