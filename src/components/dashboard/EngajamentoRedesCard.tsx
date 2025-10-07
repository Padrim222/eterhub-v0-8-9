import { Bell, ArrowUpRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Label, ResponsiveContainer } from "recharts";

interface EngajamentoRedesCardProps {
  totalLikes: number;
  previousLikes: number;
  totalComments: number;
  previousComments: number;
  totalSaves: number;
  previousSaves: number;
}

export const EngajamentoRedesCard = ({
  totalLikes,
  previousLikes,
  totalComments,
  previousComments,
  totalSaves,
  previousSaves
}: EngajamentoRedesCardProps) => {
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { type: 'neutral', change: 0 };
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return { type: 'up', change };
    if (change < -5) return { type: 'down', change };
    return { type: 'neutral', change };
  };

  const likesTrend = calculateTrend(totalLikes, previousLikes);
  const commentsTrend = calculateTrend(totalComments, previousComments);
  const savesTrend = calculateTrend(totalSaves, previousSaves);

  const totalEngagement = totalLikes + totalComments + totalSaves;
  const likesPercentage = totalEngagement > 0 ? (totalLikes / totalEngagement) * 100 : 33;
  const commentsPercentage = totalEngagement > 0 ? (totalComments / totalEngagement) * 100 : 33;
  const savesPercentage = totalEngagement > 0 ? (totalSaves / totalEngagement) * 100 : 34;

  const data = [
    { name: "Curtidas", value: likesPercentage, color: "#00FF00", count: totalLikes },
    { name: "Comentários", value: commentsPercentage, color: "#FFD700", count: totalComments },
    { name: "Salvos", value: savesPercentage, color: "#FF6B6B", count: totalSaves },
  ];

  const getTrendIcon = (type: string) => {
    if (type === 'up') return <TrendingUp className="w-3 h-3" />;
    if (type === 'down') return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getTrendColor = (type: string) => {
    if (type === 'up') return 'text-green-500';
    if (type === 'down') return 'text-red-500';
    return 'text-yellow-500';
  };

  return (
    <Card className="bg-black border border-gray-800 rounded-3xl p-6 hover:border-gray-700 transition-all">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-white text-sm font-medium leading-tight">
          Engajamento<br />das Redes
        </h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-2 border border-gray-700 rounded-full hover:bg-gray-800 transition-all"
          >
            <Bell className="w-4 h-4 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-2 border border-gray-700 rounded-full hover:bg-gray-800 transition-all"
          >
            <ArrowUpRight className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>

      <div className="flex justify-center items-center mb-6">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <Label
                value="70"
                position="center"
                className="text-3xl font-bold"
                fill="white"
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#00FF00]" />
            <span className="text-white text-sm">Curtidas</span>
          </div>
          <div className={`flex items-center gap-1 ${getTrendColor(likesTrend.type)}`}>
            {getTrendIcon(likesTrend.type)}
            <span className="text-xs">{Math.abs(likesTrend.change).toFixed(0)}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#FFD700]" />
            <span className="text-white text-sm">Comentários</span>
          </div>
          <div className={`flex items-center gap-1 ${getTrendColor(commentsTrend.type)}`}>
            {getTrendIcon(commentsTrend.type)}
            <span className="text-xs">{Math.abs(commentsTrend.change).toFixed(0)}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#FF6B6B]" />
            <span className="text-white text-sm">Salvos</span>
          </div>
          <div className={`flex items-center gap-1 ${getTrendColor(savesTrend.type)}`}>
            {getTrendIcon(savesTrend.type)}
            <span className="text-xs">{Math.abs(savesTrend.change).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
