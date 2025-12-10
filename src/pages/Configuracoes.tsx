import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Loader2, Save, Key, Webhook, RefreshCw, CheckCircle, XCircle, Instagram } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Configuracoes() {
  const { toast } = useToast();
  const { userProfile, refetch: refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [reporteiApiKey, setReporteiApiKey] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");
  
  const [settings, setSettings] = useState({
    n8n_reportei_webhook: "",
    n8n_pipedrive_webhook: "",
    reportei_update_frequency: 6,
  });

  useEffect(() => {
    if (userProfile) {
      setReporteiApiKey(userProfile.reportei_api_key || "");
      setInstagramUsername(userProfile.instagram_username || "");
    }
    loadSettings();
  }, [userProfile]);

  const loadSettings = async () => {
    if (!userProfile?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error }: any = await (supabase as any)
        .from("user_settings")
        .select("*")
        .eq("user_id", userProfile.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          n8n_reportei_webhook: data.n8n_reportei_webhook || "",
          n8n_pipedrive_webhook: data.n8n_pipedrive_webhook || "",
          reportei_update_frequency: data.reportei_update_frequency || 6,
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveReportei = async () => {
    if (!userProfile?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          reportei_api_key: reporteiApiKey.trim() || null,
          instagram_username: instagramUsername.trim() || null,
        })
        .eq('id', userProfile.id);

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "Chave Reportei e Instagram atualizados com sucesso.",
      });

      refreshProfile?.();
    } catch (error) {
      console.error("Error saving Reportei settings:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar suas configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncReportei = async () => {
    if (!reporteiApiKey.trim()) {
      toast({
        title: "Chave não configurada",
        description: "Por favor, configure sua chave Reportei primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatus('idle');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Sessão expirada');
      }

      const { data, error } = await supabase.functions.invoke('fetch-reportei-data', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setSyncStatus('success');
      toast({
        title: "Sincronização concluída",
        description: data?.message || `${data?.posts_synced || 0} posts sincronizados.`,
      });

      refreshProfile?.();
    } catch (error: any) {
      console.error("Sync error:", error);
      setSyncStatus('error');
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível sincronizar com a Reportei.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async () => {
    if (!userProfile?.id) return;

    setIsSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("user_settings")
        .upsert({
          user_id: userProfile.id,
          n8n_reportei_webhook: settings.n8n_reportei_webhook || null,
          n8n_pipedrive_webhook: settings.n8n_pipedrive_webhook || null,
          reportei_update_frequency: settings.reportei_update_frequency,
        }, {
          onConflict: "user_id"
        });

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar suas configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageLayout title="Configurações" showTitle>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Reportei Integration Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle>Integração Reportei</CardTitle>
            </div>
            <CardDescription>
              Configure sua chave API da Reportei para sincronizar métricas do Instagram
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="instagram-username" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  @ do Instagram
                </Label>
                <Input
                  id="instagram-username"
                  type="text"
                  placeholder="@seuusuario"
                  value={instagramUsername}
                  onChange={(e) => setInstagramUsername(e.target.value.replace('@', ''))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportei-key">Chave API Reportei</Label>
                <Input
                  id="reportei-key"
                  type="text"
                  placeholder="HEWC39Iu0ImogbkVoB8ExThpB0HOdRYmFKHBcdo7"
                  value={reporteiApiKey}
                  onChange={(e) => setReporteiApiKey(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Encontre sua chave em{" "}
              <a 
                href="https://app.reportei.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                app.reportei.com
              </a>
              {" "}→ Dashboard → Copie o código da URL de compartilhamento
            </p>

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSaveReportei} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleSyncReportei} 
                disabled={isSyncing || !reporteiApiKey.trim()}
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : syncStatus === 'success' ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Sincronizado
                  </>
                ) : syncStatus === 'error' ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                    Tentar novamente
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sincronizar agora
                  </>
                )}
              </Button>
            </div>

            {userProfile?.last_sync_at && (
              <p className="text-xs text-muted-foreground">
                Última sincronização: {new Date(userProfile.last_sync_at).toLocaleString('pt-BR')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Webhooks Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" />
              <CardTitle>Webhooks n8n (Avançado)</CardTitle>
            </div>
            <CardDescription>
              Configure os webhooks do n8n para integração em tempo real com Pipedrive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="pipedrive-webhook">Webhook Pipedrive (n8n)</Label>
                  <Input
                    id="pipedrive-webhook"
                    type="url"
                    placeholder="https://seu-n8n.app.n8n.cloud/webhook/pipedrive"
                    value={settings.n8n_pipedrive_webhook}
                    onChange={(e) =>
                      setSettings({ ...settings, n8n_pipedrive_webhook: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    URL do webhook n8n que receberá dados do Pipedrive
                  </p>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Webhooks
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle>Informações da Conta</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Seu User ID</h4>
              <code className="text-xs bg-background px-2 py-1 rounded block break-all">
                {userProfile?.id || "Carregando..."}
              </code>
              <p className="text-xs text-muted-foreground">
                Use este ID nos workflows do n8n para identificar suas métricas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
