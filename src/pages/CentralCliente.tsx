import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectOverview } from "@/components/consultoria/ProjectOverview";
import { Card } from "@/components/ui/card";
import { Eye, FolderKanban, Package, History } from "lucide-react";

const CentralCliente = () => {
  const [activeTab, setActiveTab] = useState("visao-geral");

  return (
    <PageLayout title="Central do Cliente">
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-card border border-border/50 p-1 h-auto flex-wrap">
            <TabsTrigger 
              value="visao-geral"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger 
              value="projetos"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex items-center gap-2"
            >
              <FolderKanban className="w-4 h-4" />
              Projetos
            </TabsTrigger>
            <TabsTrigger 
              value="entregas"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Entregas
            </TabsTrigger>
            <TabsTrigger 
              value="historico"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="mt-6">
            <ProjectOverview />
          </TabsContent>

          <TabsContent value="projetos" className="mt-6">
            <Card className="bg-card border-border/50 p-8">
              <p className="text-muted-foreground">Gerenciamento de projetos em desenvolvimento...</p>
            </Card>
          </TabsContent>

          <TabsContent value="entregas" className="mt-6">
            <Card className="bg-card border-border/50 p-8">
              <p className="text-muted-foreground">Controle de entregas em desenvolvimento...</p>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="mt-6">
            <Card className="bg-card border-border/50 p-8">
              <p className="text-muted-foreground">Histórico de atividades em desenvolvimento...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default CentralCliente;
