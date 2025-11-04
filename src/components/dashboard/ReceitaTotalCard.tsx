import { Card } from "@/components/ui/card";
import { Bell, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ReceitaTotalCardProps {
  totalViews: number;
  previousViews?: number;
}

export const ReceitaTotalCard = ({ totalViews, previousViews = 0 }: ReceitaTotalCardProps) => {
  const revenue = 320.0;
  const goal = 500;
  const progressPercentage = (revenue / goal) * 100;

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
      <h3 className="text-white text-sm font-medium mb-8">Receita Total</h3>

      {/* Value */}
      <div className="mb-2">
        <span className="text-white/60 text-sm font-medium">R$</span>
        <span className="text-white text-5xl font-bold ml-1">{revenue.toFixed(1)}K</span>
      </div>

      {/* Goal */}
      <p className="text-white/40 text-xs mb-6">Meta: {goal}k</p>

      {/* Progress Bar - Green Neon */}
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary rounded-full shadow-[0_0_20px_rgba(120,255,100,0.6)]"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Striped Pattern Background */}
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <pattern id="stripes" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="10" stroke="white" strokeWidth="2"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#stripes)"/>
        </svg>
      </div>
    </Card>
  );
};
