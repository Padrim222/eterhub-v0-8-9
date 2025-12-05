import { Users, FileText, FolderKanban, Activity, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminStats } from "@/hooks/useAdminStats";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminDashboard() {
  const { stats, isLoading } = useAdminStats();

  const statCards = [
    { title: "Total de Usuários", value: stats.totalUsers, icon: Users, color: "text-blue-400" },
    { title: "Usuários Ativos", value: stats.activeUsers, icon: UserCheck, color: "text-green-400" },
    { title: "Usuários Inativos", value: stats.inactiveUsers, icon: UserX, color: "text-red-400" },
    { title: "Posts Importados", value: stats.totalPosts, icon: FileText, color: "text-purple-400" },
    { title: "Projetos Criados", value: stats.totalProjects, icon: FolderKanban, color: "text-yellow-400" },
    { title: "Atividades Registradas", value: stats.totalActivities, icon: Activity, color: "text-cyan-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Resumo do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Taxa de Onboarding</span>
              <span className="text-foreground font-medium">
                {stats.totalUsers > 0 
                  ? `${Math.round((stats.usersWithOnboarding / stats.totalUsers) * 100)}%`
                  : "0%"
                }
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Média de Posts/Usuário</span>
              <span className="text-foreground font-medium">
                {stats.totalUsers > 0 
                  ? (stats.totalPosts / stats.totalUsers).toFixed(1)
                  : "0"
                }
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Média de Projetos/Usuário</span>
              <span className="text-foreground font-medium">
                {stats.totalUsers > 0 
                  ? (stats.totalProjects / stats.totalUsers).toFixed(1)
                  : "0"
                }
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Usuários com Onboarding</span>
              <span className="text-foreground font-medium">
                {stats.usersWithOnboarding} / {stats.totalUsers}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 py-2 border-b border-border">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">Banco de Dados</span>
              <span className="ml-auto text-green-400 text-sm">Operacional</span>
            </div>
            <div className="flex items-center gap-3 py-2 border-b border-border">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">Autenticação</span>
              <span className="ml-auto text-green-400 text-sm">Operacional</span>
            </div>
            <div className="flex items-center gap-3 py-2 border-b border-border">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">Edge Functions</span>
              <span className="ml-auto text-green-400 text-sm">Operacional</span>
            </div>
            <div className="flex items-center gap-3 py-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">Scraping Instagram</span>
              <span className="ml-auto text-green-400 text-sm">Ativo</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
