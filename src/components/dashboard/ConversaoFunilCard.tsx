import { Card } from "@/components/ui/card";
import { Bell, TrendingUp } from "lucide-react";

interface ConversaoFunilCardProps {
  totalEngagement?: number;
  previousEngagement?: number;
  avgEngagementRate?: number;
  previousEngagementRate?: number;
}

export const ConversaoFunilCard = ({ 
  totalEngagement,
  previousEngagement,
  avgEngagementRate,
  previousEngagementRate
}: ConversaoFunilCardProps) => {
  return (
    <Card className="bg-[#E8E8E8] border-black/5 p-6 rounded-3xl hover:border-primary/30 transition-all relative overflow-hidden">
      {/* Action Icons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors">
          <Bell className="w-4 h-4 text-black" />
        </button>
        <button className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors">
          <TrendingUp className="w-4 h-4 text-black" />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-black text-sm font-medium mb-2">Conversão</h3>
      <p className="text-black/60 text-xs mb-6">& Funil</p>

      {/* Content */}
      <div className="flex items-end justify-between">
        {/* Left Side - Stats */}
        <div>
          <p className="text-black text-3xl font-bold mb-1">36</p>
          <p className="text-black/60 text-xs leading-tight">Campanhas<br/>ativas totais</p>
        </div>

        {/* Right Side - Charts */}
        <div className="flex gap-3 items-end">
          {/* Negative Badge */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-2">
              <span className="text-white text-sm font-bold">-40%</span>
            </div>
            {/* Striped Bar - Gray */}
            <div className="w-12 h-20 rounded-lg bg-gradient-to-b from-black/20 to-black/10 relative overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
                <defs>
                  <pattern id="stripes-gray" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="8" stroke="black" strokeWidth="1.5"/>
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#stripes-gray)"/>
              </svg>
            </div>
          </div>

          {/* Positive Badge */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-2">
              <span className="text-black text-sm font-bold">+35%</span>
            </div>
            {/* Striped Bar - Green Neon */}
            <div className="w-12 h-32 rounded-lg bg-primary relative overflow-hidden shadow-[0_0_20px_rgba(120,255,100,0.4)]">
              <svg viewBox="0 0 100 100" className="w-full h-full opacity-40">
                <defs>
                  <pattern id="stripes-green" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="8" stroke="white" strokeWidth="2"/>
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#stripes-green)"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
