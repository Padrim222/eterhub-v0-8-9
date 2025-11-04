import { Bell, ArrowUpRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReceitaTotalCardProps {
  totalViews: number;
  previousViews: number;
}

export const ReceitaTotalCard = ({ totalViews, previousViews }: ReceitaTotalCardProps) => {
  const targetViews = 100000;
  const percentage = Math.min((totalViews / targetViews) * 100, 100);
  
  const calculateTrend = () => {
    if (previousViews === 0) return { type: 'neutral', change: 0 };
    const change = ((totalViews - previousViews) / previousViews) * 100;
    if (change > 5) return { type: 'up', change };
    if (change < -5) return { type: 'down', change };
    return { type: 'neutral', change };
  };

  const trend = calculateTrend();
  
  const getTrendIcon = () => {
    if (trend.type === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend.type === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend.type === 'up') return 'text-green-500';
    if (trend.type === 'down') return 'text-red-500';
    return 'text-yellow-500';
  };

  return (
    <Card className="bg-card-dark border-border rounded-3xl p-6 hover:border-primary/30 transition-all">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-muted-foreground text-sm font-medium">Receita Total</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-2 border-border rounded-full hover:bg-accent transition-all"
          >
            <Bell className="w-4 h-4 text-card-dark-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-2 border-border rounded-full hover:bg-accent transition-all"
          >
            <ArrowUpRight className="w-4 h-4 text-card-dark-foreground" />
          </Button>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-3">
        <div>
          <span className="text-card-dark-foreground text-6xl font-bold">{(totalViews / 1000).toFixed(1)}K</span>
          <span className="text-muted-foreground text-sm ml-2">visualizações</span>
        </div>
        <div className={`flex items-center gap-1 ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="text-sm font-medium">{Math.abs(trend.change).toFixed(1)}%</span>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <span className="text-muted-foreground text-sm">Meta: {(targetViews / 1000).toFixed(0)}k</span>
      </div>

      <div className="relative h-12 bg-muted/20 rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
        <div
          className="absolute right-0 h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.05)_4px,rgba(255,255,255,0.05)_8px)]"
          style={{ width: `${100 - percentage}%` }}
        />
      </div>
    </Card>
  );
};
