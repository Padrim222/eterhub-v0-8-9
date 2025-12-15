import { Card } from "@/components/ui/card";
import { Bell, TrendingUp, TrendingDown, Menu } from "lucide-react";

interface IMOVICardProps {
  imoviHistory?: Array<{ month: string; value: number; highlighted?: boolean; label?: string }>;
  currentImovi?: number;
  growthPercent?: number;
  leadsPercent?: number;
  engagementPercent?: number;
}

export const IMOVICard = ({
  imoviHistory,
  currentImovi = 0,
  growthPercent = 0,
  leadsPercent = 0,
  engagementPercent = 0
}: IMOVICardProps) => {
  // Use provided history or generate empty months
  const getDefaultMonths = () => {
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const now = new Date();
    const currentMonth = now.getMonth();

    // Show last 8 months including current
    const months = [];
    for (let i = 7; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      months.push({
        month: monthNames[monthIndex],
        value: 0,
        highlighted: i === 0
      });
    }
    return months;
  };

  const months = imoviHistory && imoviHistory.length > 0 ? imoviHistory : getDefaultMonths();

  const maxValue = Math.max(...months.map(m => m.value), 1);

  // Determine trend icons based on values
  const GrowthIcon = growthPercent >= 0 ? TrendingUp : TrendingDown;
  const LeadsIcon = leadsPercent >= 0 ? TrendingUp : TrendingDown;
  const EngagementIcon = engagementPercent >= 0 ? TrendingUp : TrendingDown;

  return (
    <Card className="bg-card border-border/50 p-6 rounded-3xl hover:border-primary/30 transition-all relative overflow-hidden col-span-full lg:col-span-2 shadow-lg">
      {/* Action Icons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors">
          <Menu className="w-4 h-4 text-foreground" />
        </button>
        <button className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors">
          <TrendingUp className="w-4 h-4 text-foreground" />
        </button>
        <button className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors">
          <Bell className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h3 className="text-foreground text-lg font-semibold">IMOVI</h3>
        <p className="text-muted-foreground text-xs">Índice de Movimento e Influência</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Chart Area */}
        <div className="flex-1">
          <div className="flex items-end justify-between h-64 gap-2 md:gap-4">
            {months.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                {/* Bar */}
                <div className="w-full flex flex-col items-center justify-end h-full pb-2 md:pb-8">
                  {item.value > 0 && (
                    <div className="relative w-full flex flex-col items-center group">
                      {/* Label Above Bar */}
                      {item.label && !item.highlighted && (
                        <div className="mb-2 bg-popover text-popover-foreground text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.label}
                        </div>
                      )}

                      {/* Bar with Stripes */}
                      <div
                        className={`w-full rounded-t-lg relative overflow-hidden transition-all duration-500 ease-out hover:brightness-110 ${item.highlighted
                            ? 'bg-primary shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                            : 'bg-muted/30 hover:bg-muted/50'
                          }`}
                        style={{ height: `${Math.max((item.value / maxValue) * 200, 20)}px` }}
                      >
                        {/* Optional: Add stripe pattern via CSS or SVG if desired, kept simple for modern look */}
                        {item.highlighted && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        )}

                        {/* Value Label Inside Highlighted Bar */}
                        {item.highlighted && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-primary-foreground text-sm md:text-xl font-bold">{item.value}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Month Label */}
                <span className={`text-[10px] mt-2 ${item.highlighted ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* IMOVI Score Card */}
        <div className="w-full md:w-36 bg-card-darker border border-border/50 rounded-2xl p-4 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

          <p className="text-muted-foreground text-[10px] mb-2 relative z-10">ÍNDICE IMOVI</p>
          <div className="text-foreground text-5xl font-bold mb-4 relative z-10">{currentImovi}</div>

          <div className="space-y-2 w-full relative z-10">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">{Math.abs(growthPercent)}% Growth</span>
              <GrowthIcon className={`w-3 h-3 ${growthPercent >= 0 ? 'text-primary' : 'text-destructive'}`} />
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">{Math.abs(leadsPercent)}% Leads</span>
              <LeadsIcon className={`w-3 h-3 ${leadsPercent >= 0 ? 'text-primary' : 'text-destructive'}`} />
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">{Math.abs(engagementPercent)}% Engaj</span>
              <EngagementIcon className={`w-3 h-3 ${engagementPercent >= 0 ? 'text-primary' : 'text-destructive'}`} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
