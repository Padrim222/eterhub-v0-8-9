import { useState, useEffect } from "react";
import { Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const mockLeads = [
  { id: 1, name: "João Silva", score: 85, status: "Quente", trend: "up", value: "R$ 15.000" },
  { id: 2, name: "Maria Santos", score: 72, status: "Morno", trend: "neutral", value: "R$ 8.500" },
  { id: 3, name: "Pedro Costa", score: 45, status: "Frio", trend: "down", value: "R$ 3.200" },
];

const Movqls = () => {
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
      }
    };
    loadUserProfile();
  }, []);

  return (
    <div className="space-y-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">MOVQL's</h1>
        <Button className="bg-primary text-black hover:bg-primary/90 rounded-full">
          <Plus className="w-4 h-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-black border-gray-800 rounded-3xl p-6">
          <p className="text-gray-400 text-sm mb-2">Total de Leads</p>
          <p className="text-4xl font-bold text-white mb-2">248</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-500 text-sm">+12%</span>
          </div>
        </Card>

        <Card className="bg-black border-gray-800 rounded-3xl p-6">
          <p className="text-gray-400 text-sm mb-2">Taxa de Conversão</p>
          <p className="text-4xl font-bold text-white mb-2">32%</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-500 text-sm">+5%</span>
          </div>
        </Card>

        <Card className="bg-black border-gray-800 rounded-3xl p-6">
          <p className="text-gray-400 text-sm mb-2">Valor Total Pipeline</p>
          <p className="text-4xl font-bold text-white mb-2">R$ 485K</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-500 text-sm">+18%</span>
          </div>
        </Card>
      </div>

      <Card className="bg-black border-gray-800 rounded-3xl p-6">
        <h2 className="text-xl font-bold mb-6">Leads Qualificados</h2>
        <div className="space-y-4">
          {mockLeads.map((lead) => (
            <div key={lead.id} className="flex items-center justify-between p-4 border border-gray-800 rounded-xl hover:bg-gray-900/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {lead.name[0]}
                </div>
                <div>
                  <h3 className="text-white font-medium">{lead.name}</h3>
                  <p className="text-gray-400 text-sm">Score MOVQL: {lead.score}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-white font-medium">{lead.value}</p>
                  <p className="text-gray-400 text-sm">{lead.status}</p>
                </div>
                {lead.trend === "up" && <TrendingUp className="w-5 h-5 text-green-500" />}
                {lead.trend === "down" && <TrendingDown className="w-5 h-5 text-red-500" />}
                {lead.trend === "neutral" && <Minus className="w-5 h-5 text-yellow-500" />}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Movqls;
