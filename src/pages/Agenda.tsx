import { useState, useEffect } from "react";
import { MainNavigation } from "@/components/layout/MainNavigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const mockEventos = [
  { id: 1, date: "2025-10-15", title: "Post Instagram - Lançamento", type: "post" },
  { id: 2, date: "2025-10-18", title: "Webinar - Marketing Digital", type: "webinar" },
  { id: 3, date: "2025-10-22", title: "Story - Bastidores", type: "story" },
];

const Agenda = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

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
          <h1 className="text-4xl font-bold">Agenda</h1>
          <Button className="bg-primary text-black hover:bg-primary/90 rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </div>

        <Card className="bg-black border-gray-800 rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold capitalize">{monthName}</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                className="border-gray-800 bg-black hover:bg-gray-800 rounded-full"
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="border-gray-800 bg-black hover:bg-gray-800 rounded-full"
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
              <div key={dia} className="text-center text-gray-400 text-sm font-medium py-2">
                {dia}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, i) => (
              <div
                key={i}
                className="aspect-square border border-gray-800 rounded-lg p-2 hover:bg-gray-900/50 transition-colors cursor-pointer"
              >
                <span className="text-gray-400 text-sm">{((i % 31) + 1)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-black border-gray-800 rounded-3xl p-6">
          <h2 className="text-xl font-bold mb-6">Próximos Eventos</h2>
          <div className="space-y-4">
            {mockEventos.map((evento) => (
              <div key={evento.id} className="flex items-center gap-4 p-4 border border-gray-800 rounded-xl hover:bg-gray-900/50 transition-colors">
                <div className="w-16 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {new Date(evento.date).getDate()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(evento.date).toLocaleDateString('pt-BR', { month: 'short' })}
                  </p>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">{evento.title}</h3>
                  <p className="text-gray-400 text-sm capitalize">{evento.type}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Agenda;
