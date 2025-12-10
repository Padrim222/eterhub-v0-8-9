import { Card } from "@/components/ui/card";
import { Bell, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface EngajamentoRedesCardProps {
  totalLikes?: number;
  previousLikes?: number;
  totalComments?: number;
  previousComments?: number;
  totalSaves?: number;
  previousSaves?: number;
}

export const EngajamentoRedesCard = ({ 
  totalLikes,
  previousLikes,
  totalComments,
  previousComments,
  totalSaves,
  previousSaves
}: EngajamentoRedesCardProps) => {
  const data = [
    { name: 'Instagram', value: 70 },
    { name: 'Youtube', value: 30 },
  ];

  const COLORS = ['hsl(120, 83%, 58%)', 'hsl(0, 0%, 20%)'];

  return (
    <Card className="bg-black border-white/10 p-6 rounded-3xl hover:border-primary/30 transition-all relative overflow-hidden">
      {/* Action Icons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <Bell className="w-4 h-4 text-white" />
        </button>
        <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <TrendingUp className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-white text-sm font-medium mb-2">Engajamento</h3>
      <p className="text-white/60 text-xs mb-6">das Redes</p>

      {/* Donut Chart */}
      <div className="relative h-40 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Values */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-primary text-2xl font-bold">70</div>
            <div className="text-white/40 text-xs">30</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(120,255,100,0.6)]"></div>
          <span className="text-white text-xs">Instagram</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-muted"></div>
          <span className="text-white text-xs">Youtube</span>
        </div>
      </div>
    </Card>
  );
};
