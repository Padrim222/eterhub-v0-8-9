import { useState, useEffect } from "react";
import { MainNavigation } from "@/components/layout/MainNavigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const mockProdutos = [
  { id: 1, name: "Curso Online", price: "R$ 997", sales: 45, revenue: "R$ 44.865" },
  { id: 2, name: "Mentoria 1:1", price: "R$ 2.500", sales: 12, revenue: "R$ 30.000" },
  { id: 3, name: "E-book", price: "R$ 97", sales: 128, revenue: "R$ 12.416" },
];

const Vendas = () => {
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
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 bg-black sticky top-0 z-50">
        <div className="flex items-center justify-between px-8 py-4">
          <img src="/src/assets/eter-logo.png" alt="Eter" className="h-8" />
          <MainNavigation />
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
            <Bell className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
            <Avatar>
              <AvatarImage src={userProfile?.avatar_url} />
              <AvatarFallback className="bg-primary text-black">
                {userProfile?.full_name?.[0] || userProfile?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Vendas</h1>
          <Button className="bg-primary text-black hover:bg-primary/90 rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black border-gray-800 rounded-3xl p-6">
            <p className="text-gray-400 text-sm mb-2">Receita Total</p>
            <p className="text-4xl font-bold text-white">R$ 87.2K</p>
          </Card>

          <Card className="bg-black border-gray-800 rounded-3xl p-6">
            <p className="text-gray-400 text-sm mb-2">Total de Vendas</p>
            <p className="text-4xl font-bold text-white">185</p>
          </Card>

          <Card className="bg-black border-gray-800 rounded-3xl p-6">
            <p className="text-gray-400 text-sm mb-2">Ticket Médio</p>
            <p className="text-4xl font-bold text-white">R$ 471</p>
          </Card>
        </div>

        <Card className="bg-black border-gray-800 rounded-3xl p-6">
          <h2 className="text-xl font-bold mb-6">Produtos</h2>
          <div className="space-y-4">
            {mockProdutos.map((produto) => (
              <div key={produto.id} className="flex items-center justify-between p-4 border border-gray-800 rounded-xl hover:bg-gray-900/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{produto.name}</h3>
                    <p className="text-gray-400 text-sm">{produto.price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Vendas</p>
                    <p className="text-white font-medium">{produto.sales}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Receita</p>
                    <p className="text-white font-medium">{produto.revenue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Vendas;
