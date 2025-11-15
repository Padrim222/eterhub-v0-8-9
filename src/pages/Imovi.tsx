import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingModal } from "@/components/dashboard/OnboardingModal";
import { MQLCard } from "@/components/dashboard/MQLCard";
import { LeadsQuantityCard } from "@/components/dashboard/LeadsQuantityCard";
import { ConversionRateCard } from "@/components/dashboard/ConversionRateCard";
import { SalesNumberCard } from "@/components/dashboard/SalesNumberCard";
import { QualificationRateCard } from "@/components/dashboard/QualificationRateCard";
import { IMOVICard } from "@/components/dashboard/IMOVICard";
import { InsightsIACard } from "@/components/dashboard/InsightsIACard";
import { LeaderBanner } from "@/components/dashboard/LeaderBanner";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ChannelView } from "@/components/canais/ChannelView";
import Leads from "./Leads";
import Campanhas from "./Campanhas";

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
              <div className="space-y-4 md:space-y-6">
                {/* First Row - 5 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                  <MQLCard 
                    mqlPercentage={25.5}
                    previousPercentage={22.3}
                  />
                  <LeadsQuantityCard 
                    totalLeads={150}
                    previousLeads={132}
                  />
                  <ConversionRateCard 
                    conversionRate={12.8}
                    previousRate={11.2}
                  />
                  <SalesNumberCard 
                    totalSales={42}
                    previousSales={38}
                  />
                  <QualificationRateCard 
                    qualificationRate={68.5}
                    previousRate={65.1}
                  />
                </div>

                {/* Second Row - IMOVI Card */}
                <div className="grid grid-cols-1">
                  <IMOVICard 
                    imoviHistory={data.imoviHistory} 
                    currentImovi={data.currentImovi}
                  />
                </div>

                {/* Third Row - Insights IA */}
                <div className="grid grid-cols-1">
                  <InsightsIACard />
                </div>

                {/* Fourth Row - Informativos ETER */}
                <div className="grid grid-cols-1">
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
