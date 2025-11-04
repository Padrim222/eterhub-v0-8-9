import { Bell, ArrowUpRight, ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { useCampaignsData, PeriodFilter } from "@/hooks/useCampaignsData";
import { Badge } from "@/components/ui/badge";

export const LancamentosCard = () => {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("month");
  const { averageLine, isLoading } = useCampaignsData(periodFilter);

  // Calcular média atual e anterior para comparação
  const currentAverage = averageLine.length > 0
    ? averageLine.reduce((sum, point) => sum + point.average, 0) / averageLine.length
    : 0;

  const halfPoint = Math.floor(averageLine.length / 2);
  const firstHalfAverage = averageLine.length > 0
    ? averageLine.slice(0, halfPoint).reduce((sum, point) => sum + point.average, 0) / halfPoint
    : 0;
  const secondHalfAverage = averageLine.length > 0
    ? averageLine.slice(halfPoint).reduce((sum, point) => sum + point.average, 0) / (averageLine.length - halfPoint)
    : 0;

  const percentChange = firstHalfAverage > 0
    ? ((secondHalfAverage - firstHalfAverage) / firstHalfAverage) * 100
    : 0;

  const isIncreasing = percentChange > 0;

  const periods = [
    { label: "Semana", value: "week" as PeriodFilter },
    { label: "Mês", value: "month" as PeriodFilter },
    { label: "Ano", value: "year" as PeriodFilter },
  ];

  return (
    <Card className="bg-black border border-gray-800 rounded-3xl p-6 hover:border-gray-700 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-white text-sm font-medium">Média de Leads</h3>
          <Badge variant="outline" className="text-xs">
            DEMO
          </Badge>
        </div>
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

      {/* Filtros de período */}
      <div className="flex flex-wrap gap-2 mb-4">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => setPeriodFilter(period.value)}
            className={`px-3 py-1 rounded-full text-xs transition-all ${
              period.value === periodFilter
                ? "bg-white text-black font-bold"
                : "bg-gray-800 text-white/60 hover:bg-gray-700"
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Gráfico de linha branca */}
      {isLoading ? (
        <div className="h-[200px] flex items-center justify-center">
          <p className="text-white/40">Carregando...</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={averageLine}>
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.3)" 
              tick={{ fill: "#666", fontSize: 12 }} 
            />
            <Line
              type="monotone"
              dataKey="average"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth={3}
              dot={{ fill: "rgba(255,255,255,0.9)", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Indicador de valor com variação */}
      <div className="flex items-center justify-between mt-4">
        <div className="inline-flex items-baseline bg-black border border-gray-700 rounded-lg p-3">
          <span className="text-white text-2xl font-bold">
            {Math.round(currentAverage)}
          </span>
          <span className="text-white/70 text-sm ml-2 font-medium">Leads/média</span>
        </div>

        {/* Indicador de tendência */}
        {percentChange !== 0 && (
          <div className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
            isIncreasing ? "bg-green-500/10" : "bg-red-500/10"
          }`}>
            {isIncreasing ? (
              <TrendingUp className={`w-4 h-4 text-green-500`} />
            ) : (
              <TrendingDown className={`w-4 h-4 text-red-500`} />
            )}
            <span className={`text-sm font-semibold ${
              isIncreasing ? "text-green-500" : "text-red-500"
            }`}>
              {Math.abs(percentChange).toFixed(1)}%
            </span>
          </div>
        )}
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
