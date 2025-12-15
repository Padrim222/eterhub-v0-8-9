import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/PageLayout";
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
import { InstagramImportCard } from "@/components/dashboard/InstagramImportCard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useLeadsData } from "@/hooks/useLeadsData";
import { ChannelView } from "@/components/canais/ChannelView";
import { LeadsView } from "@/components/dashboard/LeadsView";
import { CampanhasView } from "@/components/dashboard/CampanhasView";

const Imovi = () => {
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

      if (profile && !(profile as any).onboarding_completed) {
        setShowOnboarding(true);
      }
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const data = useDashboardData();
  const { metrics: leadsMetrics, isLoading: leadsLoading } = useLeadsData();
  const { isLoading, error, totalPosts } = data;

  // Check if user has Instagram data
  const hasInstagramData = totalPosts > 0 || (userProfile?.instagram_posts_count ?? 0) > 0;

  // Calculate metrics from real data
  const mqlPercentage = leadsMetrics.qualificationRate || 0;
  const totalLeads = leadsMetrics.totalLeads || 0;
  const totalQualified = leadsMetrics.totalQualified || 0;

  // Conversion rate based on qualified leads that converted (TODO: needs sales data)
  const conversionRate = 0;

  // Sales number (TODO: needs sales table)
  const totalSales = 0;

  // Qualification rate
  const qualificationRate = leadsMetrics.qualificationRate || 0;

  return (
    <PageLayout showTitle={false}>
      <div className="space-y-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">IMOV</h1>
        </div>

        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="mb-8">
          <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 w-full justify-start">
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

        {isLoading || leadsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 bg-muted" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-destructive py-8">
            Erro ao carregar dados do dashboard
          </div>
        ) : (
          <>
            {activeFilter === "canais" ? (
              <ChannelView />
            ) : activeFilter === "geral" ? (
              <div className="space-y-4 md:space-y-6">
                {/* Show Instagram Import Card if no data */}
                {!hasInstagramData && (
                  <InstagramImportCard
                    userProfile={userProfile}
                    onProfileUpdate={loadUserProfile}
                  />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                  <MQLCard
                    mqlPercentage={mqlPercentage}
                    previousPercentage={0}
                  />
                  <LeadsQuantityCard
                    totalLeads={totalLeads}
                    previousLeads={0}
                  />
                  <ConversionRateCard
                    conversionRate={conversionRate}
                    previousRate={0}
                  />
                  <SalesNumberCard
                    totalSales={totalSales}
                    previousSales={0}
                  />
                  <QualificationRateCard
                    qualificationRate={qualificationRate}
                    previousRate={0}
                  />
                </div>

                <div className="grid grid-cols-1">
                  <IMOVICard
                    imoviHistory={data.imoviHistory}
                    currentImovi={data.currentImovi}
                    growthPercent={data.growthPercent}
                    leadsPercent={data.leadsPercent}
                    engagementPercent={data.engagementPercent}
                  />
                </div>

                <div className="grid grid-cols-1">
                  <InsightsIACard />
                </div>

                <div className="grid grid-cols-1">
                  <LeaderBanner
                    userProfile={userProfile}
                    onEdit={loadUserProfile}
                  />
                </div>
              </div>
            ) : activeFilter === "leads" ? (
              <LeadsView />
            ) : activeFilter === "campanhas" ? (
              <CampanhasView />
            ) : null}
          </>
        )}

        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={() => setShowOnboarding(false)}
        />
      </div>
    </PageLayout>
  );
};

export default Imovi;
