import { Bell, ArrowUpRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ConversaoFunilCardProps {
  totalEngagement: number;
  previousEngagement: number;
  avgEngagementRate: number;
  previousEngagementRate: number;
}

export const ConversaoFunilCard = ({ 
  totalEngagement, 
  previousEngagement,
  avgEngagementRate,
  previousEngagementRate
}: ConversaoFunilCardProps) => {
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { type: 'neutral', change: 0 };
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return { type: 'up', change };
    if (change < -5) return { type: 'down', change };
    return { type: 'neutral', change };
  };

  const engagementTrend = calculateTrend(totalEngagement, previousEngagement);
  const rateTrend = calculateTrend(avgEngagementRate, previousEngagementRate);

  const getTrendIcon = (type: string) => {
    if (type === 'up') return <TrendingUp className="w-4 h-4" />;
    if (type === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = (type: string) => {
    if (type === 'up') return 'bg-green-500';
    if (type === 'down') return 'bg-red-500';
    return 'bg-yellow-500';
  };
  return (
    <Card className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-6 hover:shadow-xl transition-all">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-black/60 text-sm mb-1 font-medium">Conversão</h3>
          <h3 className="text-black/60 text-sm font-medium">& Funil</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-2 border border-gray-300 rounded-full hover:bg-gray-300 transition-all"
          >
            <Bell className="w-4 h-4 text-black" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-2 border border-gray-300 rounded-full hover:bg-gray-300 transition-all"
          >
            <ArrowUpRight className="w-4 h-4 text-black" />
          </Button>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-7xl font-bold text-black leading-none">
          {(totalEngagement / 1000).toFixed(1)}K
        </div>
        <div className="text-black/60 text-sm mt-2 leading-tight">
          Engajamento<br />total
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <div className={`relative flex-1 ${getTrendColor(engagementTrend.type)} rounded-2xl p-4 overflow-hidden`}>
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(255,255,255,0.1)_6px,rgba(255,255,255,0.1)_12px)]" />
          <div className="relative flex items-center justify-center gap-1 mb-1">
            {getTrendIcon(engagementTrend.type)}
            <span className="text-white font-bold text-lg">{Math.abs(engagementTrend.change).toFixed(1)}%</span>
          </div>
          <div className="text-white/80 text-xs text-center">GROWTH</div>
        </div>

        <div className={`relative flex-1 ${getTrendColor(rateTrend.type)} rounded-2xl p-4 overflow-hidden`}>
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(255,255,255,0.1)_6px,rgba(255,255,255,0.1)_12px)]" />
          <div className="relative flex items-center justify-center gap-1 mb-1">
            {getTrendIcon(rateTrend.type)}
            <span className="text-white font-bold text-lg">{avgEngagementRate.toFixed(1)}%</span>
          </div>
          <div className="text-white/80 text-xs text-center">TAXA</div>
        </div>
      </div>
    </Card>
  );
};
