import { Bell, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const ConversaoFunilCard = () => {
  return (
    <Card className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-6 hover:shadow-xl transition-all">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-black/60 text-sm mb-1 font-medium">Conversão</h3>
          <h3 className="text-black/60 text-sm font-medium">& Funil</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-2 border border-gray-300 rounded-full hover:bg-gray-300 transition-all"
          >
            <Bell className="w-4 h-4 text-black" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-2 border border-gray-300 rounded-full hover:bg-gray-300 transition-all"
          >
            <ArrowUpRight className="w-4 h-4 text-black" />
          </Button>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-7xl font-bold text-black leading-none">36</div>
        <div className="text-black/60 text-sm mt-2 leading-tight">
          Campanhas<br />ativas totais
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <div className="relative flex-1 bg-black rounded-2xl p-4 overflow-hidden">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(255,255,255,0.05)_6px,rgba(255,255,255,0.05)_12px)]" />
          <div className="relative flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-white" />
            <span className="text-white font-bold text-lg">40%</span>
          </div>
          <div className="text-white/60 text-xs text-center">ROI</div>
        </div>

        <div className="relative flex-1 bg-[#00FF00] rounded-2xl p-4 overflow-hidden">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(0,0,0,0.05)_6px,rgba(0,0,0,0.05)_12px)]" />
          <div className="relative flex items-center justify-center gap-1 mb-1">
            <TrendingDown className="w-4 h-4 text-black" />
            <span className="text-black font-bold text-lg">35%</span>
          </div>
          <div className="text-black/60 text-xs text-center">CAC</div>
        </div>
      </div>
    </Card>
  );
};
