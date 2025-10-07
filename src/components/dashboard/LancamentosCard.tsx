import { Bell, ArrowUpRight, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, ResponsiveContainer } from "recharts";

export const LancamentosCard = () => {
  const months = ["Julho", "Agosto", "Setembro", "Outubro", "Novembro"];
  const currentMonth = "Setembro";

  const lancamentosData = [
    { month: "Jul", leads: 200 },
    { month: "Ago", leads: 350 },
    { month: "Set", leads: 640 },
    { month: "Out", leads: 500 },
    { month: "Nov", leads: 400 },
  ];

  return (
    <Card className="bg-black border border-gray-800 rounded-3xl p-6 hover:border-gray-700 transition-all">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-white text-sm font-medium">Lançamentos</h3>
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

      {/* Badges de meses */}
      <div className="flex flex-wrap gap-2 mb-4">
        {months.map((mes) => (
          <span
            key={mes}
            className={`px-3 py-1 rounded-full text-xs transition-all ${
              mes === currentMonth
                ? "bg-[#00FF00] text-black font-bold"
                : "bg-gray-800 text-white/60 hover:bg-gray-700"
            }`}
          >
            {mes}
          </span>
        ))}
      </div>

      {/* Gráfico de área */}
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={lancamentosData}>
          <defs>
            <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00FF00" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#00FF00" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" stroke="#666" tick={{ fill: "#666", fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="leads"
            stroke="#00FF00"
            strokeWidth={3}
            fill="url(#colorLeads)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Indicador de valor */}
      <div className="inline-flex items-baseline bg-black border border-gray-700 rounded-lg p-3 mt-4">
        <span className="text-white text-2xl font-bold">640</span>
        <span className="text-[#00FF00] text-sm ml-2 font-medium">Leads</span>
      </div>

      <Button
        variant="outline"
        className="w-full mt-4 py-3 border border-gray-700 rounded-lg text-white/60 text-sm hover:bg-gray-800 hover:text-white transition-all"
      >
        Mais Informações
        <ChevronDown className="w-4 h-4 ml-2" />
      </Button>
    </Card>
  );
};
