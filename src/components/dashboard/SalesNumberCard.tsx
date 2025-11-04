import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ShoppingCart } from "lucide-react";

interface SalesNumberCardProps {
  totalSales: number;
  previousSales?: number;
}

export const SalesNumberCard = ({ totalSales, previousSales = 0 }: SalesNumberCardProps) => {
  const percentChange = previousSales > 0 
    ? ((totalSales - previousSales) / previousSales) * 100 
    : 0;
  const isIncreasing = percentChange > 0;

  return (
    <Card className="bg-card-dark border-border p-6 rounded-3xl hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Número de Vendas</h3>
        <ShoppingCart className="w-5 h-5 text-primary" />
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-bold text-foreground">{totalSales}</span>
        <span className="text-lg text-muted-foreground">vendas</span>
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
