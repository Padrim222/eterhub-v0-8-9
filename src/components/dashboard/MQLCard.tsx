import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MQLCardProps {
  mqlPercentage: number;
  previousPercentage?: number;
}

export const MQLCard = ({ mqlPercentage, previousPercentage = 0 }: MQLCardProps) => {
  const percentChange = previousPercentage > 0 
    ? ((mqlPercentage - previousPercentage) / previousPercentage) * 100 
    : 0;
  const isIncreasing = percentChange > 0;

  return (
    <Card className="bg-card-dark border-border p-6 rounded-3xl hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">MQL</h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
          Taxa
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-bold text-foreground">{mqlPercentage.toFixed(1)}</span>
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
