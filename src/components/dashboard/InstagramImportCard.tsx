import { useState, useEffect } from "react";
import { Instagram, Download, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InstagramImportCardProps {
  userProfile: any;
  onProfileUpdate: () => void;
}

export const InstagramImportCard = ({ userProfile, onProfileUpdate }: InstagramImportCardProps) => {
  const [instagramUsername, setInstagramUsername] = useState(userProfile?.instagram_username || "");
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setInstagramUsername(userProfile?.instagram_username || "");
  }, [userProfile]);

  const handleSaveUsername = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from('users')
        .update({ instagram_username: instagramUsername })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Instagram atualizado!",
        description: "Seu @ do Instagram foi salvo com sucesso.",
      });

      onProfileUpdate();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleImportData = async () => {
    if (!instagramUsername) {
      toast({
        title: "Atenção",
        description: "Por favor, insira seu @ do Instagram primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportStatus('importing');
    setProgress(0);
    setErrorMessage("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Save username first if needed
      if (userProfile?.instagram_username !== instagramUsername) {
        await supabase
          .from('users')
          .update({ instagram_username: instagramUsername })
          .eq('id', user.id);
      }

      // Simulate progress while waiting for API
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 85));
      }, 1000);

      // Get session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão não encontrada");

      // Call edge function with authorization header
      const { data, error } = await supabase.functions.invoke('scrape-instagram', {
        body: { username: instagramUsername },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      clearInterval(progressInterval);

      if (error) {
        console.error('Import error:', error);
        throw new Error(error.message || 'Erro ao importar dados');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setProgress(100);
      setImportStatus('success');

      toast({
        title: "Importação concluída!",
        description: `${data?.postsCount || 0} posts importados com sucesso.`,
      });

      // Delay before refreshing to show success state
      setTimeout(() => {
        onProfileUpdate();
      }, 1500);

    } catch (error: any) {
      console.error('Import error details:', error);
      setImportStatus('error');
      setErrorMessage(error.message || 'Erro desconhecido ao importar');
      
      toast({
        title: "Erro ao importar",
        description: error.message || 'Erro desconhecido ao importar',
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const getStatusIcon = () => {
    switch (importStatus) {
      case 'importing':
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Instagram className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <Card className="bg-black border border-gray-800 rounded-3xl p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {getStatusIcon()}
          <h3 className="text-white font-semibold text-lg">Conectar Instagram</h3>
        </div>
        <p className="text-white/60 text-sm">
          {importStatus === 'idle' && "Conecte seu Instagram para importar seus dados e métricas"}
          {importStatus === 'importing' && "Importando dados do Instagram... Isso pode levar alguns minutos."}
          {importStatus === 'success' && "Dados importados com sucesso!"}
          {importStatus === 'error' && errorMessage}
        </p>
      </div>

      {importStatus === 'importing' && (
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
          <p className="text-white/40 text-xs mt-2 text-center">{progress}% concluído</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="instagram-username" className="text-white/80 text-sm">
            @ do Instagram
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="instagram-username"
              value={instagramUsername}
              onChange={(e) => setInstagramUsername(e.target.value.replace('@', ''))}
              placeholder="seu_usuario"
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 rounded-xl"
              disabled={isImporting}
            />
            <Button
              onClick={handleSaveUsername}
              variant="outline"
              className="border-gray-700 text-white/80 hover:bg-gray-800/50 hover:text-white rounded-xl"
              disabled={isImporting}
            >
              Salvar
            </Button>
          </div>
        </div>

        <Button
          onClick={handleImportData}
          disabled={isImporting || !instagramUsername}
          className="w-full bg-primary text-black hover:bg-primary/90 rounded-xl py-6 text-base font-semibold"
        >
          {isImporting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              IMPORTAR DADOS DO INSTAGRAM
            </>
          )}
        </Button>

        {userProfile?.instagram_username && (
          <p className="text-center text-gray-400 text-xs">
            Conectado: @{userProfile.instagram_username}
            {userProfile?.last_sync_at && (
              <span className="block mt-1">
                Última sincronização: {new Date(userProfile.last_sync_at).toLocaleString('pt-BR')}
              </span>
            )}
          </p>
        )}

        <div className="text-white/40 text-xs space-y-1 mt-4 border-t border-gray-800 pt-4">
          <p className="font-medium text-white/60">Como funciona:</p>
          <p>1. Digite seu @ do Instagram (sem o @)</p>
          <p>2. Clique em "Salvar" para vincular a conta</p>
          <p>3. Clique em "Importar" para buscar seus posts e métricas</p>
          <p className="mt-2 text-white/50">A importação pode levar de 1 a 5 minutos dependendo da quantidade de posts.</p>
        </div>
      </div>
    </Card>
  );
};
