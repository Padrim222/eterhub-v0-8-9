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
    <Card className="bg-card border-border rounded-3xl p-6 lg:p-8 hover:border-primary/30 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-card-foreground text-xl lg:text-2xl font-bold mb-1">IMOVI</h2>
          <p className="text-muted-foreground text-xs font-medium">Índice de Movimento e Influência</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-2 border-border rounded-full hover:bg-accent transition-all"
          >
            <Menu className="w-4 h-4 text-card-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-2 border-border rounded-full hover:bg-accent transition-all"
          >
            <ArrowUpRight className="w-4 h-4 text-card-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-2 border-border rounded-full hover:bg-accent transition-all"
          >
            <Bell className="w-4 h-4 text-card-foreground" />
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
                stroke="hsl(var(--muted))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                stroke="hsl(var(--muted))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {imoviHistory.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.highlighted ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Card lateral com score */}
        <div className="bg-card-dark rounded-2xl p-6 flex flex-col justify-center border border-border">
          <div className="text-muted-foreground text-xs mb-2 uppercase tracking-wide">
            ÍNDICE IMOVI
          </div>
          <div className="text-primary text-6xl font-bold mb-6 leading-none">
            {currentImovi}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-card-dark-foreground/80 text-sm">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>38% Growth</span>
            </div>
            <div className="flex items-center gap-2 text-card-dark-foreground/80 text-sm">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>45% Leads</span>
            </div>
            <div className="flex items-center gap-2 text-card-dark-foreground/80 text-sm">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>40% Engaj</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
