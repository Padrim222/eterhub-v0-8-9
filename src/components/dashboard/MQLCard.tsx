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
    <Card className="bg-card-dark border-border p-4 md:p-6 rounded-2xl md:rounded-3xl hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-sm md:text-lg font-semibold text-foreground">MQL</h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
          Taxa
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-3 md:mb-4">
        <span className="text-3xl md:text-4xl font-bold text-foreground">{mqlPercentage.toFixed(1)}</span>
        <span className="text-xl md:text-2xl text-muted-foreground">%</span>
      </div>

      {percentChange !== 0 && (
        <div className={`flex items-center gap-1 ${
          isIncreasing ? "text-green-500" : "text-red-500"
        }`}>
          {isIncreasing ? (
            <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
          ) : (
            <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
          )}
          <span className="text-xs md:text-sm font-semibold">
            {Math.abs(percentChange).toFixed(1)}% vs anterior
          </span>
        </div>
      )}
    </Card>
  );
};
