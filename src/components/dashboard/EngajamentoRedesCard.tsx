import { Bell, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Label, ResponsiveContainer } from "recharts";

export const EngajamentoRedesCard = () => {
  const data = [
    { name: "Instagram", value: 70, color: "#00FF00" },
    { name: "Youtube", value: 30, color: "#666666" },
  ];

  return (
    <Card className="bg-black border border-gray-800 rounded-3xl p-6 hover:border-gray-700 transition-all">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-white text-sm font-medium leading-tight">
          Engajamento<br />das Redes
        </h3>
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

      <div className="flex justify-center items-center mb-6">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <Label
                value="70"
                position="center"
                className="text-3xl font-bold"
                fill="white"
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#00FF00]" />
          <span className="text-white text-sm">Instagram</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-gray-600" />
          <span className="text-white text-sm">Youtube</span>
        </div>
      </div>
    </Card>
  );
};
