import { Loader2, LayoutDashboard, Users, FileText, FolderKanban, Activity, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminContentTab } from "@/components/admin/AdminContentTab";
import { AdminProjectsTab } from "@/components/admin/AdminProjectsTab";
import { AdminActivitiesTab } from "@/components/admin/AdminActivitiesTab";
import { AdminSettingsTab } from "@/components/admin/AdminSettingsTab";
import { PageLayout } from "@/components/layout/PageLayout";

export default function Admin() {
  const { isAdmin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via useAdminAuth hook
  }

  return (
    <PageLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie usuários, conteúdo e configurações do sistema
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="bg-muted grid grid-cols-6 w-full max-w-4xl">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="conteudo" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Conteúdo</span>
            </TabsTrigger>
            <TabsTrigger value="projetos" className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4" />
              <span className="hidden sm:inline">Projetos</span>
            </TabsTrigger>
            <TabsTrigger value="atividades" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Atividades</span>
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="dashboard">
              <AdminDashboard />
            </TabsContent>
            <TabsContent value="usuarios">
              <AdminUsersTab />
            </TabsContent>
            <TabsContent value="conteudo">
              <AdminContentTab />
            </TabsContent>
            <TabsContent value="projetos">
              <AdminProjectsTab />
            </TabsContent>
            <TabsContent value="atividades">
              <AdminActivitiesTab />
            </TabsContent>
            <TabsContent value="configuracoes">
              <AdminSettingsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </PageLayout>
  );
}
