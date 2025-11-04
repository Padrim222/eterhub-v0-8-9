import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Bell, TrendingUp, ChevronDown } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis } from "recharts";

export const LancamentosCard = () => {
  const [periodFilter, setPeriodFilter] = useState<"week" | "month" | "year">("month");

  const data = [
    { month: "Jul", value: 450 },
    { month: "Ago", value: 520 },
    { month: "Set", value: 640 },
    { month: "Out", value: 580 },
    { month: "Nov", value: 610 },
  ];

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
      <h3 className="text-white text-sm font-medium mb-8">Lançamentos</h3>

      {/* Area Chart */}
      <div className="h-48 mb-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(120, 83%, 58%)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(120, 83%, 58%)" stopOpacity={0.1}/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <XAxis 
              dataKey="month" 
              stroke="rgba(255,255,255,0.2)" 
              tick={{ fill: '#666', fontSize: 11 }}
              axisLine={false}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="hsl(120, 83%, 58%)" 
              strokeWidth={2}
              fill="url(#colorValue)" 
              filter="url(#glow)"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Highlighted Point */}
        <div className="absolute top-8 right-16">
          <div className="bg-primary text-black px-3 py-1 rounded-lg text-sm font-bold shadow-[0_0_20px_rgba(120,255,100,0.6)]">
            640 <span className="text-xs font-normal">Leads</span>
          </div>
        </div>
      </div>

      {/* Month Labels */}
      <div className="flex justify-between text-white/40 text-xs mb-4 px-2">
        <span className="bg-white/5 px-2 py-1 rounded">Setembro</span>
        <span>06 Set</span>
      </div>

      {/* More Info Button */}
      <button className="w-full bg-white/5 hover:bg-white/10 text-white/60 py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors">
        Mais Informações
        <ChevronDown className="w-3 h-3" />
      </button>
    </Card>
  );
};
