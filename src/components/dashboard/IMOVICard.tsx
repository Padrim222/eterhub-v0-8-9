import { Menu, ArrowUpRight, Bell, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

interface IMOVICardProps {
  imoviHistory: Array<{ month: string; value: number; highlighted?: boolean }>;
  currentImovi: number;
}

export const IMOVICard = ({ imoviHistory, currentImovi }: IMOVICardProps) => {
  return (
    <Card className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-6 lg:p-8 hover:shadow-xl transition-all">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-black text-xl lg:text-2xl font-bold mb-1">IMOVI</h2>
          <p className="text-black/60 text-xs font-medium">Índice de Movimento e Influência</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-2 border border-gray-300 rounded-full hover:bg-gray-300 transition-all"
          >
            <Menu className="w-4 h-4 text-black" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-2 border border-gray-300 rounded-full hover:bg-gray-300 transition-all"
          >
            <ArrowUpRight className="w-4 h-4 text-black" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-2 border border-gray-300 rounded-full hover:bg-gray-300 transition-all"
          >
            <Bell className="w-4 h-4 text-black" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de barras */}
        <div className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={imoviHistory}>
              <XAxis
                dataKey="month"
                stroke="#999"
                tick={{ fill: "#666", fontSize: 12 }}
                axisLine={{ stroke: "#ddd" }}
              />
              <YAxis
                stroke="#999"
                tick={{ fill: "#666", fontSize: 12 }}
                axisLine={{ stroke: "#ddd" }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {imoviHistory.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.highlighted ? "#00FF00" : "#e0e0e0"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Card lateral com score */}
        <div className="bg-black rounded-2xl p-6 flex flex-col justify-center">
          <div className="text-white/60 text-xs mb-2 uppercase tracking-wide">
            ÍNDICE IMOVI
          </div>
          <div className="text-[#00FF00] text-6xl font-bold mb-6 leading-none">
            {currentImovi}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <TrendingUp className="w-4 h-4 text-[#00FF00]" />
              <span>38% Growth</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <TrendingUp className="w-4 h-4 text-[#00FF00]" />
              <span>45% Leads</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <TrendingUp className="w-4 h-4 text-[#00FF00]" />
              <span>40% Engaj</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
