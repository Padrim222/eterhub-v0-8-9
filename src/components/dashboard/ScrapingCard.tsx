import { useState } from "react";
import { Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const ScrapingCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleScraping = async () => {
    setIsLoading(true);
    setStatus('loading');

    try {
      const { data, error } = await supabase.functions.invoke('scrape-instagram', {
        method: 'POST',
      });

      if (error) throw error;

      if (data.success) {
        setStatus('success');
        toast({
          title: "Scraping concluído!",
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
      setStatus('error');
      toast({
        title: "Erro no scraping",
        description: error.message || "Não foi possível completar o scraping. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 rounded-3xl p-6 hover:shadow-xl transition-all">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-primary/10 rounded-full">
          {status === 'loading' && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
          {status === 'success' && <CheckCircle className="w-8 h-8 text-green-500" />}
          {status === 'error' && <AlertCircle className="w-8 h-8 text-red-500" />}
          {status === 'idle' && <Download className="w-8 h-8 text-primary" />}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Atualizar Dados do Instagram
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Importe as métricas mais recentes do seu perfil do Instagram
          </p>
        </div>

        <Button
          onClick={handleScraping}
          disabled={isLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Importando dados...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Importar Dados
            </>
          )}
        </Button>

        {status === 'success' && (
          <p className="text-sm text-green-600 dark:text-green-400">
            ✓ Dados importados com sucesso!
          </p>
        )}
        
        {status === 'error' && (
          <p className="text-sm text-red-600 dark:text-red-400">
            ✗ Erro ao importar dados. Tente novamente.
          </p>
        )}
      </div>
    </Card>
  );
};
