import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Upload, Download, Bell, Users, Loader2 } from "lucide-react";
import { LeadsMetrics } from "@/components/leads/LeadsMetrics";
import { ICPColumn } from "@/components/leads/ICPColumn";
import { useLeadsData } from "@/hooks/useLeadsData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Leads = () => {
  const { icps, leads, metrics, isLoading, refetch } = useLeadsData();
  const [notificationCount] = useState(0);
  const { toast } = useToast();
  
  // Lead dialog state
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [leadFormData, setLeadFormData] = useState({
    name: "",
    email: "",
    phone: "",
    source_channel: "",
    icp_id: "",
  });

  const handleAddLead = async () => {
    if (!leadFormData.name.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório", variant: "destructive" });
      return;
    }

    try {
      setIsAddingLead(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Erro", description: "Você precisa estar logado", variant: "destructive" });
        return;
      }

      const { error } = await (supabase as any)
        .from("leads")
        .insert([{
          user_id: session.user.id,
          name: leadFormData.name,
          email: leadFormData.email || null,
          phone: leadFormData.phone || null,
          source_channel: leadFormData.source_channel || null,
          icp_id: leadFormData.icp_id || null,
          position: leads.length,
        }]);

      if (error) throw error;

      toast({ title: "Sucesso", description: "Lead criado com sucesso" });
      setIsLeadDialogOpen(false);
      setLeadFormData({ name: "", email: "", phone: "", source_channel: "", icp_id: "" });
      refetch();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setIsAddingLead(false);
    }
  };

  const handleDeleteICP = async (icpId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Erro", description: "Você precisa estar logado", variant: "destructive" });
        return;
      }

      // First, remove icp_id from leads associated with this ICP
      await (supabase as any)
        .from("leads")
        .update({ icp_id: null })
        .eq("icp_id", icpId);

      // Then delete the ICP
      const { error } = await (supabase as any)
        .from("icps")
        .delete()
        .eq("id", icpId);

      if (error) throw error;

      toast({ title: "Sucesso", description: "ICP excluído com sucesso" });
      refetch();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

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

  const handleDeleteLead = async (leadId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("leads")
        .delete()
        .eq("id", leadId);

      if (error) throw error;

      toast({ title: "Sucesso", description: "Lead excluído com sucesso" });
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
          <Dialog open={isLeadDialogOpen} onOpenChange={setIsLeadDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Novo Lead</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-white">Nome *</Label>
                  <Input
                    value={leadFormData.name}
                    onChange={(e) => setLeadFormData({ ...leadFormData, name: e.target.value })}
                    placeholder="Nome do lead"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Email</Label>
                  <Input
                    value={leadFormData.email}
                    onChange={(e) => setLeadFormData({ ...leadFormData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Telefone</Label>
                  <Input
                    value={leadFormData.phone}
                    onChange={(e) => setLeadFormData({ ...leadFormData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Canal de Origem</Label>
                  <Input
                    value={leadFormData.source_channel}
                    onChange={(e) => setLeadFormData({ ...leadFormData, source_channel: e.target.value })}
                    placeholder="Instagram, LinkedIn, etc."
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                {icps.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-white">ICP</Label>
                    <Select
                      value={leadFormData.icp_id}
                      onValueChange={(value) => setLeadFormData({ ...leadFormData, icp_id: value })}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Selecione um ICP" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {icps.map((icp) => (
                          <SelectItem key={icp.id} value={icp.id} className="text-white">
                            {icp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button onClick={handleAddLead} className="w-full" disabled={isAddingLead}>
                  {isAddingLead && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Criar Lead
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Colunas de ICP - Estilo Trello */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {icps.map((icp) => (
          <ICPColumn
            key={icp.id}
            icp={icp}
            leads={leads.filter((lead) => lead.icp_id === icp.id)}
            onDelete={() => handleDeleteICP(icp.id)}
            onDeleteLead={handleDeleteLead}
          />
        ))}
      </div>
    </div>
  );
};

export default Leads;
