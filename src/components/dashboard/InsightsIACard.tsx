import { Sparkles, AlertCircle, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Insight {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export const InsightsIACard = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-insights");

      if (error) {
        console.error("Error generating insights:", error);
        toast({
          title: "Erro ao gerar insights",
          description: error.message || "Ocorreu um erro ao gerar os insights. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      if (data?.insights) {
        setInsights(data.insights);
        toast({
          title: "Insights gerados!",
          description: "Novos insights foram gerados com base nas suas métricas.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta Prioridade";
      case "medium":
        return "Média Prioridade";
      case "low":
        return "Baixa Prioridade";
      default:
        return priority;
    }
  };

  return (
    <Card className="bg-black border border-gray-800 rounded-3xl p-6 hover:border-gray-700 transition-all">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-white text-lg font-semibold mb-1">Insights IA</h3>
          <p className="text-white/60 text-xs">Impulsione seu Movimento com nossa IA</p>
        </div>
        <Button
          onClick={generateInsights}
          disabled={isLoading}
          className="bg-[#00FF00] text-black hover:bg-[#00DD00] rounded-full px-6 py-2 font-semibold transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? "Gerando..." : "Gerar Insights"}
        </Button>
      </div>

      {insights.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Sparkles className="w-12 h-12 text-white/20 mb-4" />
          <p className="text-white/40 text-sm max-w-md">
            Nenhum insight gerado ainda. Clique em "Gerar Insights" para obter<br />
            recomendações personalizadas baseadas nos seus dados.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF00] mb-4"></div>
          <p className="text-white/60 text-sm">Analisando suas métricas...</p>
        </div>
      )}

      {insights.length > 0 && !isLoading && (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#00FF00]" />
                  <h4 className="text-white font-semibold text-sm">{insight.title}</h4>
                </div>
                <Badge variant="outline" className={getPriorityColor(insight.priority)}>
                  {getPriorityLabel(insight.priority)}
                </Badge>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{insight.description}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
