import { Bell, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const ReceitaTotalCard = () => {
  const currentRevenue = 320.0;
  const targetRevenue = 500;
  const percentage = (currentRevenue / targetRevenue) * 100;

  return (
    <Card className="bg-black border border-gray-800 rounded-3xl p-6 hover:border-gray-700 transition-all">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-white/60 text-sm font-medium">Receita Total</h3>
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

      <div className="mb-3">
        <span className="text-white/40 text-2xl font-light">R$</span>
        <span className="text-white text-6xl font-bold ml-2">{currentRevenue}K</span>
      </div>

      <div className="flex justify-end mb-4">
        <span className="text-white/40 text-sm">Meta: {targetRevenue}k</span>
      </div>

      <div className="relative h-12 bg-gray-800/50 rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-gradient-to-r from-[#00FF00] to-[#00DD00] rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
        <div
          className="absolute right-0 h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.1)_4px,rgba(255,255,255,0.1)_8px)]"
          style={{ width: `${100 - percentage}%` }}
        />
      </div>
    </Card>
  );
};
