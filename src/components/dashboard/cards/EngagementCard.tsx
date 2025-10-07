import { Instagram, Youtube } from "lucide-react";
import { MetricCard } from "../MetricCard";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const engagementData = [
  { name: "Instagram", value: 70, color: "#38EE38" },
  { name: "Youtube", value: 30, color: "#6B7280" },
];

export const EngagementCard = () => {
  return (
    <MetricCard 
      title={
        <div className="flex items-center gap-2">
          <Instagram className="w-5 h-5 text-primary" />
          <span>Engajamento<br/>Instagram</span>
        </div>
      }
      variant="dark"
    >
      <div className="flex items-center justify-center mb-4">
        <ResponsiveContainer width="100%" height={120}>
          <PieChart>
            <Pie
              data={engagementData}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={0}
              dataKey="value"
              strokeWidth={0}
            >
              {engagementData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="space-y-2.5">
        <div className="flex items-center gap-2.5">
          <Instagram className="w-4 h-4 text-primary" />
          <span className="text-sm text-card-dark-foreground font-medium">Instagram: 70%</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Youtube className="w-4 h-4 text-muted" />
          <span className="text-sm text-card-dark-foreground/60 font-medium">Youtube: 30%</span>
        </div>
      </div>
    </MetricCard>
  );
};
