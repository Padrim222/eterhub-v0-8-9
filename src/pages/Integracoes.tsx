import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Instagram, 
  Link2, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Settings,
  BarChart3,
  Mail,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface IntegrationStatus {
  instagram: {
    connected: boolean;
    username?: string;
    lastSync?: string;
  };
  pipedrive: {
    connected: boolean;
    domain?: string;
    lastSync?: string;
  };
}

export default function Integracoes() {
  const [status, setStatus] = useState<IntegrationStatus>({
    instagram: { connected: false },
    pipedrive: { connected: false }
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  
  // Form states
  const [reporteiKey, setReporteiKey] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");
  const [pipedriveToken, setPipedriveToken] = useState("");
  const [pipedriveDomain, setPipedriveDomain] = useState("");
  
  const [instagramDialogOpen, setInstagramDialogOpen] = useState(false);
  const [pipedriveDialogOpen, setPipedriveDialogOpen] = useState(false);

  useEffect(() => {
    loadIntegrationStatus();
  }, []);

  const loadIntegrationStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: user } = await supabase
        .from("users")
        .select("instagram_username, reportei_api_key, last_sync_at, pipedrive_api_token, pipedrive_company_domain, crm_last_sync_at")
        .eq("id", session.user.id)
        .maybeSingle();

      if (user) {
        setStatus({
          instagram: {
            connected: !!user.reportei_api_key && !!user.instagram_username,
            username: user.instagram_username || undefined,
            lastSync: user.last_sync_at || undefined
          },
          pipedrive: {
            connected: !!user.pipedrive_api_token,
            domain: user.pipedrive_company_domain || undefined,
            lastSync: user.crm_last_sync_at || undefined
          }
        });
        
        setInstagramUsername(user.instagram_username || "");
        setReporteiKey(user.reportei_api_key || "");
        setPipedriveToken(user.pipedrive_api_token || "");
        setPipedriveDomain(user.pipedrive_company_domain || "");
      }
    } catch (error) {
      console.error("Error loading integration status:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveInstagramIntegration = async () => {
    try {
      setSyncing("instagram-save");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("users")
        .update({
          instagram_username: instagramUsername.replace("@", ""),
          reportei_api_key: reporteiKey
        })
        .eq("id", session.user.id);

      if (error) throw error;

      toast.success("Integração Instagram salva com sucesso!");
      setInstagramDialogOpen(false);
      loadIntegrationStatus();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar integração");
    } finally {
      setSyncing(null);
    }
  };

  const syncInstagram = async () => {
    try {
      setSyncing("instagram");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { data, error } = await supabase.functions.invoke("fetch-reportei-data", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;

      toast.success(`Sincronização concluída! ${data.postsImported || 0} posts importados.`);
      loadIntegrationStatus();
    } catch (error: any) {
      toast.error(error.message || "Erro ao sincronizar");
    } finally {
      setSyncing(null);
    }
  };

  const savePipedriveIntegration = async () => {
    try {
      setSyncing("pipedrive-save");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("users")
        .update({
          pipedrive_api_token: pipedriveToken,
          pipedrive_company_domain: pipedriveDomain
        })
        .eq("id", session.user.id);

      if (error) throw error;

      toast.success("Integração Pipedrive salva com sucesso!");
      setPipedriveDialogOpen(false);
      loadIntegrationStatus();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar integração");
    } finally {
      setSyncing(null);
    }
  };

  const syncPipedrive = async () => {
    try {
      setSyncing("pipedrive");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { data, error } = await supabase.functions.invoke("fetch-pipedrive-data", {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;

      toast.success(`Sincronização concluída! ${data.leadsImported || 0} leads, ${data.dealsImported || 0} deals importados.`);
      loadIntegrationStatus();
    } catch (error: any) {
      toast.error(error.message || "Erro ao sincronizar");
    } finally {
      setSyncing(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Nunca";
    return new Date(dateStr).toLocaleString("pt-BR");
  };

  if (loading) {
    return (
      <PageLayout title="Integrações">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Integrações">
      <div className="space-y-6">
        <p className="text-white/60">
          Conecte suas ferramentas para sincronizar dados automaticamente com o ETER.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instagram / Reportei Card */}
          <Card className="bg-card-dark border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Instagram</h3>
                  <p className="text-white/60 text-sm">via Reportei</p>
                </div>
              </div>
              <Badge 
                variant={status.instagram.connected ? "default" : "secondary"}
                className={status.instagram.connected ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
              >
                {status.instagram.connected ? (
                  <><CheckCircle className="w-3 h-3 mr-1" /> Conectado</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" /> Não configurado</>
                )}
              </Badge>
            </div>

            {status.instagram.connected && (
              <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
                <p className="text-white/80 text-sm">
                  <span className="text-white/60">Conta:</span> @{status.instagram.username}
                </p>
                <p className="text-white/80 text-sm">
                  <span className="text-white/60">Última sincronização:</span> {formatDate(status.instagram.lastSync)}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Dialog open={instagramDialogOpen} onOpenChange={setInstagramDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Configurar Instagram</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label className="text-white">Usuário do Instagram</Label>
                      <Input
                        value={instagramUsername}
                        onChange={(e) => setInstagramUsername(e.target.value)}
                        placeholder="@seuusuario"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Chave API Reportei</Label>
                      <Input
                        value={reporteiKey}
                        onChange={(e) => setReporteiKey(e.target.value)}
                        placeholder="Sua chave do Reportei"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                      <p className="text-xs text-white/50">
                        Encontre sua chave em: Reportei → Compartilhar Dashboard → Copiar Token
                      </p>
                    </div>
                    <Button 
                      onClick={saveInstagramIntegration} 
                      className="w-full"
                      disabled={syncing === "instagram-save"}
                    >
                      {syncing === "instagram-save" ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                      ) : (
                        "Salvar"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {status.instagram.connected && (
                <Button 
                  onClick={syncInstagram}
                  disabled={syncing === "instagram"}
                >
                  {syncing === "instagram" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </Card>

          {/* Pipedrive CRM Card */}
          <Card className="bg-card-dark border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Pipedrive CRM</h3>
                  <p className="text-white/60 text-sm">Leads e Vendas</p>
                </div>
              </div>
              <Badge 
                variant={status.pipedrive.connected ? "default" : "secondary"}
                className={status.pipedrive.connected ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
              >
                {status.pipedrive.connected ? (
                  <><CheckCircle className="w-3 h-3 mr-1" /> Conectado</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" /> Não configurado</>
                )}
              </Badge>
            </div>

            {status.pipedrive.connected && (
              <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
                <p className="text-white/80 text-sm">
                  <span className="text-white/60">Domínio:</span> {status.pipedrive.domain}
                </p>
                <p className="text-white/80 text-sm">
                  <span className="text-white/60">Última sincronização:</span> {formatDate(status.pipedrive.lastSync)}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Dialog open={pipedriveDialogOpen} onOpenChange={setPipedriveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Configurar Pipedrive</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label className="text-white">Domínio da Empresa</Label>
                      <Input
                        value={pipedriveDomain}
                        onChange={(e) => setPipedriveDomain(e.target.value)}
                        placeholder="suaempresa"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                      <p className="text-xs text-white/50">
                        Ex: Se sua URL é suaempresa.pipedrive.com, digite "suaempresa"
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">API Token</Label>
                      <Input
                        value={pipedriveToken}
                        onChange={(e) => setPipedriveToken(e.target.value)}
                        placeholder="Seu token da API"
                        type="password"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                      <p className="text-xs text-white/50">
                        Encontre em: Pipedrive → Configurações → Preferências Pessoais → API
                      </p>
                    </div>
                    <Button 
                      onClick={savePipedriveIntegration} 
                      className="w-full"
                      disabled={syncing === "pipedrive-save"}
                    >
                      {syncing === "pipedrive-save" ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                      ) : (
                        "Salvar"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {status.pipedrive.connected && (
                <Button 
                  onClick={syncPipedrive}
                  disabled={syncing === "pipedrive"}
                >
                  {syncing === "pipedrive" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </Card>

          {/* Google Analytics - Coming Soon */}
          <Card className="bg-card-dark border-gray-700 p-6 opacity-60">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Google Analytics</h3>
                  <p className="text-white/60 text-sm">Tráfego do Site</p>
                </div>
              </div>
              <Badge variant="secondary">Em breve</Badge>
            </div>
            <p className="text-white/50 text-sm">
              Integração com Google Analytics para métricas de tráfego e conversão do site.
            </p>
          </Card>

          {/* RD Station - Coming Soon */}
          <Card className="bg-card-dark border-gray-700 p-6 opacity-60">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">RD Station</h3>
                  <p className="text-white/60 text-sm">Marketing Automation</p>
                </div>
              </div>
              <Badge variant="secondary">Em breve</Badge>
            </div>
            <p className="text-white/50 text-sm">
              Integração com RD Station para automação de marketing e nutrição de leads.
            </p>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
