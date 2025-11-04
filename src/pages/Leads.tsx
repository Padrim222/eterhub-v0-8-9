import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download, Bell } from "lucide-react";
import { LeadsMetrics } from "@/components/leads/LeadsMetrics";
import { ICPColumn } from "@/components/leads/ICPColumn";
import { useLeadsData } from "@/hooks/useLeadsData";

const Leads = () => {
  const { icps, leads, metrics, isLoading } = useLeadsData();
  const [notificationCount] = useState(2);

  return (
    <div className="space-y-6">
      {/* Header com Insights */}
      <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl font-semibold text-white">
                INSIGHTS - Compre 5 tokens do Eter Flow
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                DEMO
              </Badge>
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
    </div>
  );
};

export default Leads;