import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingModal } from "@/components/dashboard/OnboardingModal";
import { ReceitaTotalCard } from "@/components/dashboard/ReceitaTotalCard";
import { ConversaoFunilCard } from "@/components/dashboard/ConversaoFunilCard";
import { EngajamentoRedesCard } from "@/components/dashboard/EngajamentoRedesCard";
import { LancamentosCard } from "@/components/dashboard/LancamentosCard";
import { IMOVICard } from "@/components/dashboard/IMOVICard";
import { InsightsIACard } from "@/components/dashboard/InsightsIACard";
import { LeaderBanner } from "@/components/dashboard/LeaderBanner";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ChannelView } from "@/components/canais/ChannelView";
import Leads from "./Leads";
import Campanhas from "./Campanhas";

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
          <h1 className="text-4xl font-bold">HOME</h1>
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
                {/* First Row - 3 Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                </div>

                {/* Second Row - IMOVI and Lançamentos */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <IMOVICard 
                    imoviHistory={data.imoviHistory} 
                    currentImovi={data.currentImovi}
                  />
                  <LancamentosCard />
                </div>

                {/* Third Row - Insights IA and Leader Banner */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <InsightsIACard />
                  <LeaderBanner 
                    userProfile={userProfile}
                    onEdit={loadUserProfile}
                  />
                </div>
              </div>
            ) : activeFilter === "leads" ? (
              <Leads />
            ) : activeFilter === "campanhas" ? (
              <Campanhas />
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
