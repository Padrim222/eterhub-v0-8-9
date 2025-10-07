import { useState, useEffect } from "react";
import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import eterLogo from "@/assets/eter-logo.png";
import { AppNavigation } from "@/components/layout/AppNavigation";
import { OnboardingModal } from "@/components/dashboard/OnboardingModal";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Novos componentes do dashboard
import { ReceitaTotalCard } from "@/components/dashboard/ReceitaTotalCard";
import { ConversaoFunilCard } from "@/components/dashboard/ConversaoFunilCard";
import { EngajamentoRedesCard } from "@/components/dashboard/EngajamentoRedesCard";
import { IMOVICard } from "@/components/dashboard/IMOVICard";
import { LancamentosCard } from "@/components/dashboard/LancamentosCard";
import { InsightsIACard } from "@/components/dashboard/InsightsIACard";
import { LeaderCard } from "@/components/dashboard/LeaderCard";
import { ScrapingCard } from "@/components/dashboard/ScrapingCard";
import { InstagramMetricsCard } from "@/components/dashboard/InstagramMetricsCard";

const Dashboard = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();

  const loadUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      setUserProfile(profile);
    }
    
    return profile;
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/");
        return;
      }

      const profile = await loadUserProfile();

      // Verifica se precisa fazer onboarding
      if (profile && !profile.onboarding_completed) {
        setShowOnboarding(true);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Buscar dados reais do Supabase
  const { 
    imoviHistory,
    currentImovi,
    isLoading,
    error 
  } = useDashboardData();

  return (
    <div className="min-h-screen bg-black text-white">
      <OnboardingModal 
        isOpen={showOnboarding} 
        onComplete={() => setShowOnboarding(false)}
      />

      {/* Header */}
      <header className="border-b border-gray-800 px-8 py-4">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-8">
            <img src={eterLogo} alt="ETER" className="h-10 w-auto" />
            <AppNavigation />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-gray-700 hover:bg-gray-800"
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-gray-700 hover:bg-gray-800"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Avatar className="border-2 border-gray-700 h-10 w-10">
              <AvatarImage src={userProfile?.avatar_url || "/leader-default.png"} />
              <AvatarFallback>{userProfile?.nome?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-8 max-w-[1600px] mx-auto">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-12 w-64 bg-gray-800" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-96 rounded-3xl bg-gray-800" />
              <Skeleton className="h-96 rounded-3xl bg-gray-800" />
              <Skeleton className="h-96 rounded-3xl bg-gray-800" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-4"
                onClick={() => window.location.reload()}
              >
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && (
          <>
            {/* Title and Tabs */}
            <div className="mb-8">
              <h1 className="text-5xl font-bold mb-8 tracking-tight">Dashboard</h1>
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-8 border-b border-gray-800 pb-4">
                  <button className="border-b-2 border-primary font-semibold text-white pb-2">
                    Todos
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors pb-2">
                    Redes Sociais
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors pb-2">
                    Finanças
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors pb-2">
                    Conversão
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors pb-2">
                    Webinários
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-sm">
                    Semanal ✕
                  </span>
                  <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-sm">
                    Última 1 hora ✕
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full border border-gray-700 hover:bg-gray-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>

            {/* Grid Row 1: 5 Cards - Scraping + Instagram + 3 Cards principais */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
              <ScrapingCard />
              <InstagramMetricsCard />
              <ReceitaTotalCard />
              <ConversaoFunilCard />
              <EngajamentoRedesCard />
            </div>

            {/* Grid Row 2: IMOVI (2 cols) + Lançamentos (1 col) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <IMOVICard 
                  imoviHistory={imoviHistory} 
                  currentImovi={currentImovi} 
                />
              </div>
              <LancamentosCard />
            </div>

            {/* Grid Row 3: Insights IA (2 cols) + Líder (1 col) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <InsightsIACard />
              </div>
              <LeaderCard 
                userProfile={userProfile} 
                onProfileUpdate={loadUserProfile}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
