import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, CheckCircle } from "lucide-react";

interface QualificationRateCardProps {
  qualificationRate: number;
  previousRate?: number;
}

export const QualificationRateCard = ({ qualificationRate, previousRate = 0 }: QualificationRateCardProps) => {
  const percentChange = previousRate > 0 
    ? ((qualificationRate - previousRate) / previousRate) * 100 
    : 0;
  const isIncreasing = percentChange > 0;

  return (
    <Card className="bg-card-dark border-border p-6 rounded-3xl hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Taxa de Qualificação</h3>
        <CheckCircle className="w-5 h-5 text-primary" />
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-bold text-foreground">{qualificationRate.toFixed(1)}</span>
        <span className="text-2xl text-muted-foreground">%</span>
      </div>

      {percentChange !== 0 && (
        <div className={`flex items-center gap-1 ${
          isIncreasing ? "text-green-500" : "text-red-500"
        }`}>
          {isIncreasing ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="text-sm font-semibold">
            {Math.abs(percentChange).toFixed(1)}% vs período anterior
          </span>
        </div>
      )}
    </Card>
  );
};
