import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingModal } from "@/components/dashboard/OnboardingModal";
import { IMOVICard } from "@/components/dashboard/IMOVICard";
import { ReceitaTotalCard } from "@/components/dashboard/ReceitaTotalCard";
import { ConversaoFunilCard } from "@/components/dashboard/ConversaoFunilCard";
import { EngajamentoRedesCard } from "@/components/dashboard/EngajamentoRedesCard";
import { LancamentosCard } from "@/components/dashboard/LancamentosCard";
import { LeaderBanner } from "@/components/dashboard/LeaderBanner";
import { useDashboardData } from "@/hooks/useDashboardData";
import { InsightsIACard } from "@/components/dashboard/InsightsIACard";
import { ChannelView } from "@/components/canais/ChannelView";
import { Card } from "@/components/ui/card";
import Leads from "./Leads";

const mockConcorrentes: never[] = [];

const Imovi = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState("geral");

  const loadUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        setUserProfile(profile);

        if (profile && !(profile as any).onboarding_completed) {
          setShowOnboarding(true);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const data = useDashboardData();
  const { isLoading, error } = data;

  return (
    <div className="space-y-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">IMOV</h1>
        </div>

        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="mb-8">
          <TabsList className="bg-transparent border-b border-gray-800 rounded-none h-auto p-0 w-full justify-start">
            <TabsTrigger 
              value="geral" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3"
            >
              Geral
            </TabsTrigger>
            <TabsTrigger 
              value="canais" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3"
            >
              Canais
            </TabsTrigger>
            <TabsTrigger 
              value="leads" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3"
            >
              Leads
            </TabsTrigger>
            <TabsTrigger 
              value="campanhas" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3"
            >
              Campanhas
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
          <>
            {activeFilter === "canais" ? (
              <ChannelView />
            ) : activeFilter === "geral" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Linha 1: Performance */}
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
                  
                  {/* Linha 2: Financeiro + Leads + Engajamento */}
                  <LancamentosCard />
                  <InsightsIACard />
                  <EngajamentoRedesCard 
                    totalLikes={data.totalLikes}
                    previousLikes={data.previousPeriodData.totalLikes}
                    totalComments={data.totalComments}
                    previousComments={data.previousPeriodData.totalComments}
                    totalSaves={data.totalSaves}
                    previousSaves={data.previousPeriodData.totalSaves}
                  />
                </div>

                {/* Banner do Líder no Rodapé */}
                <LeaderBanner 
                  userProfile={userProfile}
                  onEdit={loadUserProfile}
                />
              </div>
            ) : activeFilter === "leads" ? (
              <Leads />
            ) : activeFilter === "campanhas" ? (
              <div className="grid grid-cols-1 gap-6">
                <Card className="bg-black border-gray-800 rounded-3xl p-6">
                  <h2 className="text-2xl font-bold mb-4">Campanhas</h2>
                  <p className="text-white/60">Conteúdo em desenvolvimento...</p>
                </Card>
              </div>
            ) : null}
          </>
        )}

      <OnboardingModal 
        isOpen={showOnboarding} 
        onComplete={() => setShowOnboarding(false)}
      />
    </div>
  );
};

export default Imovi;
