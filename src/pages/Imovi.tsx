import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainNavigation } from "@/components/layout/MainNavigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingModal } from "@/components/dashboard/OnboardingModal";
import { IMOVICard } from "@/components/dashboard/IMOVICard";
import { ReceitaTotalCard } from "@/components/dashboard/ReceitaTotalCard";
import { ConversaoFunilCard } from "@/components/dashboard/ConversaoFunilCard";
import { EngajamentoRedesCard } from "@/components/dashboard/EngajamentoRedesCard";
import { LancamentosCard } from "@/components/dashboard/LancamentosCard";
import { useDashboardData } from "@/hooks/useDashboardData";

const Imovi = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState("todos");

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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        setUserProfile(profile);

        if (profile && !(profile as any).onboarding_completed) {
          setShowOnboarding(true);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const data = useDashboardData();
  const { isLoading, error } = data;

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
          <h1 className="text-4xl font-bold">IMOV</h1>
        </div>

        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="mb-8">
          <TabsList className="bg-transparent border-b border-gray-800 rounded-none h-auto p-0 w-full justify-start">
            <TabsTrigger 
              value="todos" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3"
            >
              Todos
            </TabsTrigger>
            <TabsTrigger 
              value="redes-sociais" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3"
            >
              Redes Sociais
            </TabsTrigger>
            <TabsTrigger 
              value="financas" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3"
            >
              Finanças
            </TabsTrigger>
            <TabsTrigger 
              value="conversao" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3"
            >
              Conversão
            </TabsTrigger>
            <TabsTrigger 
              value="webinarios" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3"
            >
              Webinários
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 bg-gray-800" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-8">
            Erro ao carregar dados do dashboard
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <IMOVICard 
              imoviHistory={data.imoviHistory} 
              currentImovi={data.currentImovi}
            />
            <ReceitaTotalCard 
              totalViews={data.totalReach}
              previousViews={data.previousPeriodData.totalReach}
            />
            <ConversaoFunilCard 
              totalEngagement={data.totalEngagement}
              previousEngagement={data.previousPeriodData.totalEngagement}
              avgEngagementRate={data.avgEngagementRate}
              previousEngagementRate={data.previousPeriodData.avgEngagementRate}
            />
            <EngajamentoRedesCard 
              totalLikes={data.totalLikes}
              previousLikes={data.previousPeriodData.totalLikes}
              totalComments={data.totalComments}
              previousComments={data.previousPeriodData.totalComments}
              totalSaves={data.totalSaves}
              previousSaves={data.previousPeriodData.totalSaves}
            />
            <LancamentosCard />
          </div>
        )}
      </main>

      <OnboardingModal 
        isOpen={showOnboarding} 
        onComplete={() => setShowOnboarding(false)}
      />
    </div>
  );
};

export default Imovi;
