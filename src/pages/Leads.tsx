import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download, Bell, Users } from "lucide-react";
import { LeadsMetrics } from "@/components/leads/LeadsMetrics";
import { ICPColumn } from "@/components/leads/ICPColumn";
import { PipedriveIntegrationCard } from "@/components/leads/PipedriveIntegrationCard";
import { useLeadsData } from "@/hooks/useLeadsData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Leads = () => {
  const { icps, leads, metrics, isLoading, refetch } = useLeadsData();
  const [notificationCount] = useState(0);
  const { toast } = useToast();

  // Calculate Pipedrive sync stats
  const pipedriveStats = useMemo(() => {
    const pipedriveLeads = leads.filter(l => (l as any).pipedrive_person_id);
    const lastSync = pipedriveLeads
      .map(l => (l as any).pipedrive_last_sync)
      .filter(Boolean)
      .sort()
      .pop();
    return {
      totalSynced: pipedriveLeads.length,
      lastSyncAt: lastSync || null,
    };
  }, [leads]);

  const handleAddICP = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Erro", description: "Você precisa estar logado", variant: "destructive" });
        return;
      }

      const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const { error } = await (supabase as any)
        .from("icps")
        .insert([{ 
          user_id: session.user.id, 
          name: `ICP ${icps.length + 1}`, 
          color: randomColor,
          position: icps.length 
        }]);

      if (error) throw error;

      toast({ title: "Sucesso", description: "ICP criado com sucesso" });
      refetch();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  // Empty state when no ICPs exist
  if (!isLoading && icps.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header com Insights */}
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl font-semibold text-white">
                  INSIGHTS - Gerencie seus Leads
                </CardTitle>
              </div>
              <div className="relative">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Bell className="w-5 h-5 text-white" />
                </Button>
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Métricas Gerais */}
        <LeadsMetrics metrics={metrics} isLoading={isLoading} />

        {/* Empty State Card */}
        <Card className="bg-gray-900 border-gray-800 rounded-3xl p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white">Nenhum lead encontrado</h3>
            <p className="text-white/60 max-w-md">
              Crie categorias de ICP (Perfil de Cliente Ideal) para começar a organizar e qualificar seus leads.
            </p>
            <div className="flex gap-3 mt-4">
              <Button className="bg-primary hover:bg-primary/90" onClick={handleAddICP}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro ICP
              </Button>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Importar CSV
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Insights */}
      <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl font-semibold text-white">
                INSIGHTS - Gerencie seus Leads
              </CardTitle>
            </div>
            <div className="relative">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="w-5 h-5 text-white" />
              </Button>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas Gerais */}
      <LeadsMetrics metrics={metrics} isLoading={isLoading} />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Ranking dos Leads</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importar CSV
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddICP}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar ICP
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Lead
          </Button>
        </div>
      </div>

      {/* Colunas de ICP - Estilo Trello */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {icps.map((icp) => (
          <ICPColumn
            key={icp.id}
            icp={icp}
            leads={leads.filter((lead) => lead.icp_id === icp.id)}
          />
        ))}
      </div>

      {/* Pipedrive Integration */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Integrações</h2>
        <div className="max-w-xl">
          <PipedriveIntegrationCard 
            lastSyncAt={pipedriveStats.lastSyncAt}
            totalSynced={pipedriveStats.totalSynced}
          />
        </div>
      </div>
    </div>
  );
};

export default Leads;
