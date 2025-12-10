import { useState } from "react";
import { Download, Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export const ScrapingCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleScraping = async () => {
    setIsLoading(true);
    setStatus('loading');
    setProgress(0);

    // Simular progresso
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 800);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-instagram', {
        method: 'POST',
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      if (data.success) {
        setStatus('success');
        toast({
          title: "✨ Scraping concluído!",
          description: `${data.stats.totalPosts} posts foram importados do seu perfil do Instagram.`,
        });
        
        // Reload the page after 2 seconds to show new data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('Erro ao fazer scraping:', error);
      clearInterval(progressInterval);
      setProgress(0);
      setStatus('error');
      toast({
        title: "❌ Erro no scraping",
        description: error.message || "Não foi possível completar o scraping. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setStatus('idle');
        setProgress(0);
      }, 3000);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 rounded-3xl p-6 hover:shadow-xl transition-all overflow-hidden relative">
      {/* Animated background gradient */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse" />
      )}
      
      <div className="relative flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-primary/10 rounded-full relative">
          {status === 'loading' && (
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
          )}
          {status === 'loading' && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
          {status === 'success' && (
            <div className="animate-scale-in">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          )}
          {status === 'error' && (
            <div className="animate-scale-in">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          )}
          {status === 'idle' && (
            <div className="relative">
              <Download className="w-8 h-8 text-primary" />
              <Sparkles className="w-4 h-4 text-primary/60 absolute -top-1 -right-1" />
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {status === 'loading' && "Importando dados..."}
            {status === 'success' && "Dados importados!"}
            {status === 'error' && "Erro na importação"}
            {status === 'idle' && "Atualizar Dados do Instagram"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {status === 'loading' && "Buscando métricas e posts recentes..."}
            {status === 'success' && "Seus dados foram atualizados com sucesso"}
            {status === 'error' && "Ocorreu um erro durante a importação"}
            {status === 'idle' && "Importe as métricas mais recentes do seu perfil"}
          </p>
        </div>

        {/* Progress bar */}
        {status === 'loading' && (
          <div className="w-full space-y-2 animate-fade-in">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">{progress}%</p>
          </div>
        )}

        <Button
          onClick={handleScraping}
          disabled={isLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Importar Dados
            </>
          )}
        </Button>

        {status === 'success' && (
          <p className="text-sm text-green-600 dark:text-green-400 animate-fade-in">
            ✓ Dados importados com sucesso!
          </p>
        )}
        
        {status === 'error' && (
          <p className="text-sm text-red-600 dark:text-red-400 animate-fade-in">
            ✗ Erro ao importar dados. Tente novamente.
          </p>
        )}
      </div>
    </Card>
  );
};
