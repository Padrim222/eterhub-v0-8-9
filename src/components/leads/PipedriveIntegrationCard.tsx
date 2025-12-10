import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ExternalLink, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WEBHOOK_URL = "https://kzozelpatwzdrmtnsnte.supabase.co/functions/v1/receive-pipedrive-leads";

interface PipedriveIntegrationCardProps {
  lastSyncAt?: string | null;
  totalSynced?: number;
}

export const PipedriveIntegrationCard = ({ 
  lastSyncAt, 
  totalSynced = 0 
}: PipedriveIntegrationCardProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(WEBHOOK_URL);
      setCopied(true);
      toast({
        title: "URL copiada!",
        description: "Cole a URL nas configurações de webhook do Pipedrive.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a URL.",
        variant: "destructive",
      });
    }
  };

  const isConnected = !!lastSyncAt || totalSynced > 0;

  return (
    <Card className="bg-card-dark border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <img 
              src="https://www.pipedrive.com/favicon.ico" 
              alt="Pipedrive" 
              className="w-5 h-5"
            />
            Integração Pipedrive
          </CardTitle>
          <Badge 
            variant={isConnected ? "default" : "outline"}
            className={isConnected ? "bg-green-500 text-black" : "border-gray-500 text-gray-400"}
          >
            {isConnected ? "Conectado" : "Não configurado"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        {isConnected && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-primary" />
              <span className="text-white/70">
                Última sync: {lastSyncAt ? new Date(lastSyncAt).toLocaleString('pt-BR') : 'N/A'}
              </span>
            </div>
            <div className="text-white/70">
              {totalSynced} leads sincronizados
            </div>
          </div>
        )}

        {/* Webhook URL */}
        <div className="space-y-2">
          <label className="text-white/60 text-sm">URL do Webhook</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-900 text-white/80 text-xs p-3 rounded-lg overflow-x-auto">
              {WEBHOOK_URL}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyWebhook}
              className="border-gray-600 hover:bg-gray-800"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-white" />
              )}
            </Button>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-gray-900 rounded-lg p-4 space-y-3">
          <h4 className="text-white font-medium text-sm">Como configurar:</h4>
          <ol className="text-white/70 text-sm space-y-2 list-decimal list-inside">
            <li>Acesse <span className="text-primary">Configurações → Webhooks</span> no Pipedrive</li>
            <li>Clique em "Criar novo webhook"</li>
            <li>Cole a URL acima no campo de endpoint</li>
            <li>Adicione o header: <code className="text-primary bg-gray-800 px-1 rounded">X-Webhook-Secret</code> com seu secret</li>
            <li>Selecione eventos: Person created, Deal updated, Deal created</li>
            <li>Inclua <code className="text-primary bg-gray-800 px-1 rounded">user_id</code> no payload com seu ID de usuário</li>
          </ol>
        </div>

        {/* Action Button */}
        <Button
          variant="outline"
          className="w-full border-gray-600 hover:bg-gray-800 text-white"
          onClick={() => window.open('https://app.pipedrive.com/settings/webhooks', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Abrir Pipedrive Webhooks
        </Button>
      </CardContent>
    </Card>
  );
};
