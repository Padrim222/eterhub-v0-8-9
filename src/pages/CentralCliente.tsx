import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectOverview } from "@/components/consultoria/ProjectOverview";
import { ProjetosTab } from "@/components/consultoria/ProjetosTab";
import { EntregasTab } from "@/components/consultoria/EntregasTab";
import { HistoricoTab } from "@/components/consultoria/HistoricoTab";
import { IdentityConfig } from "@/components/eterflow/IdentityConfig";
import { Loader2 } from "lucide-react";
import { useClientProjectData, ClientProjectData } from "@/hooks/useClientProjectData";
import { useClientActivities } from "@/hooks/useClientActivities";

const CentralCliente = () => {
  const [activeTab, setActiveTab] = useState("visao-geral");
  const { data, setData, isLoading, isSaving, saveData } = useClientProjectData();
  const { addActivity, refetch: refetchActivities } = useClientActivities();

  const handleSave = async (updatedData: ClientProjectData) => {
    const success = await saveData(updatedData);
    if (success) {
      setData(updatedData);
    }
    return success;
  };

  const handleActivityLog = async (
    tipo: "projeto" | "entrega" | "alteracao",
    titulo: string,
    descricao?: string
  ) => {
    await addActivity({
      tipo,
      titulo,
      descricao: descricao || null,
      data: new Date().toISOString(),
      metadata: {},
    });
    refetchActivities();
  };

  if (isLoading) {
    return (
      <PageLayout showTitle={false}>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showTitle={false}>
      <div className="space-y-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Central do Cliente</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 w-full justify-start flex-wrap">
            <TabsTrigger
              value="visao-geral"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 md:px-6 py-3"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 md:px-6 py-3"
            >
              Manual do Movimento
            </TabsTrigger>
            <TabsTrigger
              value="projetos"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 md:px-6 py-3"
            >
              Projetos
            </TabsTrigger>
            <TabsTrigger
              value="entregas"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 md:px-6 py-3"
            >
              Entregas
            </TabsTrigger>
            <TabsTrigger
              value="historico"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 md:px-6 py-3"
            >
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="mt-6">
            <ProjectOverview />
          </TabsContent>

          <TabsContent value="manual" className="mt-6">
            <IdentityConfig />
          </TabsContent>

          <TabsContent value="projetos" className="mt-6">
            <ProjetosTab
              data={data}
              setData={setData}
              onSave={handleSave}
              isSaving={isSaving}
              onActivityLog={handleActivityLog}
            />
          </TabsContent>

          <TabsContent value="entregas" className="mt-6">
            <EntregasTab
              data={data}
              setData={setData}
              onSave={handleSave}
              isSaving={isSaving}
              onActivityLog={handleActivityLog}
            />
          </TabsContent>

          <TabsContent value="historico" className="mt-6">
            <HistoricoTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default CentralCliente;
