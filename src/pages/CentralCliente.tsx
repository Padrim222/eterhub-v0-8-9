import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectOverview } from "@/components/consultoria/ProjectOverview";
import { ProjetosTab } from "@/components/consultoria/ProjetosTab";
import { EntregasTab } from "@/components/consultoria/EntregasTab";
import { HistoricoTab } from "@/components/consultoria/HistoricoTab";
import { Eye, FolderKanban, Package, History, Loader2 } from "lucide-react";
import { useClientProjectData } from "@/hooks/useClientProjectData";

const CentralCliente = () => {
  const [activeTab, setActiveTab] = useState("visao-geral");
  const { data, setData, isLoading, isSaving, saveData } = useClientProjectData();

  const handleSave = async () => {
    await saveData(data);
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
      <div className="space-y-6">
        {/* Header com título à esquerda e tabs à direita */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-4xl font-bold tracking-tight">Central do Cliente</h1>
            
            <TabsList className="bg-gray-900/50 border border-gray-800 rounded-xl p-1 h-auto">
              <TabsTrigger 
                value="visao-geral"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger 
                value="projetos"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 flex items-center gap-2"
              >
                <FolderKanban className="w-4 h-4" />
                <span className="hidden sm:inline">Projetos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="entregas"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Entregas</span>
              </TabsTrigger>
              <TabsTrigger 
                value="historico"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Histórico</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="visao-geral" className="mt-0">
            <ProjectOverview />
          </TabsContent>

          <TabsContent value="projetos" className="mt-0">
            <ProjetosTab 
              data={data} 
              setData={setData} 
              onSave={handleSave} 
              isSaving={isSaving} 
            />
          </TabsContent>

          <TabsContent value="entregas" className="mt-0">
            <EntregasTab 
              data={data} 
              setData={setData} 
              onSave={handleSave} 
              isSaving={isSaving} 
            />
          </TabsContent>

          <TabsContent value="historico" className="mt-0">
            <HistoricoTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default CentralCliente;
