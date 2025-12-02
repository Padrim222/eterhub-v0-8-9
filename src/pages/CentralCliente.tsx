import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectOverview } from "@/components/consultoria/ProjectOverview";
import { Card } from "@/components/ui/card";
import { Eye, FolderKanban, Package, History } from "lucide-react";

const CentralCliente = () => {
  const [activeTab, setActiveTab] = useState("visao-geral");

  return (
    <PageLayout showTitle={false}>
      <div className="space-y-6">
        {/* Título Grande - Padrão da Plataforma */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Central do Cliente</h1>
        </div>

        {/* Tabs com Underline - Padrão da Plataforma */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b border-gray-800 rounded-none h-auto p-0 w-full justify-start">
            <TabsTrigger 
              value="visao-geral"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger 
              value="projetos"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3 flex items-center gap-2"
            >
              <FolderKanban className="w-4 h-4" />
              Projetos
            </TabsTrigger>
            <TabsTrigger 
              value="entregas"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3 flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Entregas
            </TabsTrigger>
            <TabsTrigger 
              value="historico"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3 flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="mt-6">
            <ProjectOverview />
          </TabsContent>

          <TabsContent value="projetos" className="mt-6">
            <Card className="bg-gray-900 border-gray-800 p-8">
              <p className="text-white/60">Gerenciamento de projetos em desenvolvimento...</p>
            </Card>
          </TabsContent>

          <TabsContent value="entregas" className="mt-6">
            <Card className="bg-gray-900 border-gray-800 p-8">
              <p className="text-white/60">Controle de entregas em desenvolvimento...</p>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="mt-6">
            <Card className="bg-gray-900 border-gray-800 p-8">
              <p className="text-white/60">Histórico de atividades em desenvolvimento...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default CentralCliente;
