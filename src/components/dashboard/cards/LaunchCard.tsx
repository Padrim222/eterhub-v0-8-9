import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { MetricCard } from "../MetricCard";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const launchData = [
  { month: "Julho", leads: 200 },
  { month: "Agosto", leads: 350 },
  { month: "Setembro", leads: 640, highlighted: true },
  { month: "Outubro", leads: 400 },
  { month: "Novembro", leads: 300 },
];

export const LaunchCard = () => {
  const [expandedInfo, setExpandedInfo] = useState(false);

  return (
    <MetricCard title="Lançamentos" variant="dark">
      <div className="mb-2">
        <span className="text-2xl md:text-3xl font-bold text-primary">640 </span>
        <span className="text-xs text-muted-foreground">Leads</span>
      </div>
      
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={launchData}>
          <Line 
            type="monotone" 
            dataKey="leads" 
            stroke="#38EE38" 
            strokeWidth={2}
            dot={{ fill: '#38EE38', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 flex-wrap gap-1">
        {launchData.map((item, idx) => (
          <span 
            key={idx} 
            className={item.highlighted 
              ? "text-primary font-bold bg-primary/10 border border-primary rounded px-2 py-0.5" 
              : ""
            }
          >
            {item.month}
          </span>
        ))}
      </div>
      
      <button 
        onClick={() => setExpandedInfo(!expandedInfo)}
        className="mt-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
      >
        Mais Informações
        <ChevronDown className={`w-4 h-4 transition-transform ${expandedInfo ? 'rotate-180' : ''}`} />
      </button>
    </MetricCard>
  );
};
