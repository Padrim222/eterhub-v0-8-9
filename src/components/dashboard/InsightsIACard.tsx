import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const InsightsIACard = () => {
  const hasInsights = false; // Você pode conectar isso ao estado real

  return (
    <Card className="bg-black border border-gray-800 rounded-3xl p-6 hover:border-gray-700 transition-all">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-white text-lg font-semibold mb-1">Insights IA</h3>
          <p className="text-white/60 text-xs">Impulsione seu Movimento com nossa IA</p>
        </div>
        <Button className="bg-[#00FF00] text-black hover:bg-[#00DD00] rounded-full px-6 py-2 font-semibold transition-all">
          <Sparkles className="w-4 h-4 mr-2" />
          Gerar Insights
        </Button>
      </div>

      {!hasInsights && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Sparkles className="w-12 h-12 text-white/20 mb-4" />
          <p className="text-white/40 text-sm max-w-md">
            Nenhum insight gerado ainda. Clique em "Gerar Insights" para obter<br />
            recomendações personalizadas baseadas nos seus dados.
          </p>
        </div>
      )}
    </Card>
  );
};
