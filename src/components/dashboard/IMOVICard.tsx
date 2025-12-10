import { Card } from "@/components/ui/card";
import { Bell, TrendingUp, Menu } from "lucide-react";

interface IMOVICardProps {
  imoviHistory?: Array<{ month: string; value: number; highlighted?: boolean; label?: string }>;
  currentImovi?: number;
}

export const IMOVICard = ({ imoviHistory, currentImovi = 0 }: IMOVICardProps) => {
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

  const maxValue = Math.max(...months.map(m => m.value));

  return (
    <Card className="bg-[#E8E8E8] border-black/5 p-6 rounded-3xl hover:border-primary/30 transition-all relative overflow-hidden col-span-full lg:col-span-2">
      {/* Action Icons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors">
          <Menu className="w-4 h-4 text-black" />
        </button>
        <button className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors">
          <TrendingUp className="w-4 h-4 text-black" />
        </button>
        <button className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors">
          <Bell className="w-4 h-4 text-black" />
        </button>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h3 className="text-black text-lg font-semibold">IMOVI</h3>
        <p className="text-black/60 text-xs">Índice de Movimento e Influência</p>
      </div>

      <div className="flex gap-6">
        {/* Chart Area */}
        <div className="flex-1">
          <div className="flex items-end justify-between h-64 gap-4">
            {months.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                {/* Bar */}
                <div className="w-full flex flex-col items-center justify-end h-full pb-8">
                  {item.value > 0 && (
                    <div className="relative w-full flex flex-col items-center">
                      {/* Label Above Bar */}
                      {item.label && !item.highlighted && (
                        <div className="mb-2 bg-black text-white text-[10px] px-2 py-0.5 rounded">
                          {item.label}
                        </div>
                      )}
                      
                      {/* Bar with Stripes */}
                      <div 
                        className={`w-full rounded-t-lg relative overflow-hidden transition-all ${
                          item.highlighted 
                            ? 'bg-primary shadow-[0_0_30px_rgba(120,255,100,0.6)]' 
                            : 'bg-gradient-to-b from-black/20 to-black/10'
                        }`}
                        style={{ height: `${(item.value / maxValue) * 200}px` }}
                      >
                        <svg viewBox="0 0 100 100" className="w-full h-full opacity-40">
                          <defs>
                            <pattern 
                              id={`stripes-${index}`} 
                              patternUnits="userSpaceOnUse" 
                              width="6" 
                              height="6" 
                              patternTransform="rotate(45)"
                            >
                              <line 
                                x1="0" 
                                y1="0" 
                                x2="0" 
                                y2="6" 
                                stroke={item.highlighted ? "white" : "black"} 
                                strokeWidth="1.5"
                              />
                            </pattern>
                          </defs>
                          <rect width="100" height="100" fill={`url(#stripes-${index})`}/>
                        </svg>

                        {/* Value Label Inside Highlighted Bar */}
                        {item.highlighted && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-black text-xl font-bold">{item.value}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Month Label */}
                <span className="text-black/60 text-[10px] mt-2">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* IMOVI Score Card */}
        <div className="w-36 bg-white rounded-2xl p-4 shadow-lg flex flex-col items-center justify-center">
          <p className="text-black/40 text-[10px] mb-2">ÍNDICE IMOVI</p>
          <div className="text-black text-5xl font-bold mb-4">{currentImovi}</div>
          
          <div className="space-y-2 w-full">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-black/60">63% Growth</span>
              <TrendingUp className="w-3 h-3 text-primary" />
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-black/60">36% Leads</span>
              <TrendingUp className="w-3 h-3 text-primary" />
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-black/60">40% Engaj</span>
              <TrendingUp className="w-3 h-3 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
