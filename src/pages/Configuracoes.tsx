import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Loader2, Save, Key, Webhook } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Configuracoes() {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    n8n_reportei_webhook: "",
    n8n_pipedrive_webhook: "",
    reportei_update_frequency: 6,
  });

  useEffect(() => {
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
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar suas configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" />
              <CardTitle>Webhooks n8n</CardTitle>
            </div>
            <CardDescription>
              Configure os webhooks do n8n para integração em tempo real com Reportei e Pipedrive
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
                  <Label htmlFor="reportei-webhook">Webhook Reportei (n8n)</Label>
                  <Input
                    id="reportei-webhook"
                    type="url"
                    placeholder="https://seu-n8n.app.n8n.cloud/webhook/reportei"
                    value={settings.n8n_reportei_webhook}
                    onChange={(e) =>
                      setSettings({ ...settings, n8n_reportei_webhook: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    URL do webhook n8n que receberá dados do Reportei
                  </p>
                </div>

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

                <div className="space-y-2">
                  <Label htmlFor="update-frequency">
                    Frequência de atualização Reportei (horas)
                  </Label>
                  <Input
                    id="update-frequency"
                    type="number"
                    min="1"
                    max="24"
                    value={settings.reportei_update_frequency}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        reportei_update_frequency: parseInt(e.target.value) || 6,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Configure a cada quantas horas o n8n deve buscar dados do Reportei
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
                        Salvar Configurações
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle>Informações Importantes</CardTitle>
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

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Como configurar:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Copie seu User ID acima</li>
                <li>No n8n, configure os webhooks nos workflows de Reportei e Pipedrive</li>
                <li>Cole as URLs dos webhooks aqui</li>
                <li>No n8n, use seu User ID no body dos requests para a edge function</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
