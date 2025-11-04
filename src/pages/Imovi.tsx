import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingModal } from "@/components/dashboard/OnboardingModal";
import { IMOVICard } from "@/components/dashboard/IMOVICard";
import { ReceitaTotalCard } from "@/components/dashboard/ReceitaTotalCard";
import { ConversaoFunilCard } from "@/components/dashboard/ConversaoFunilCard";
import { EngajamentoRedesCard } from "@/components/dashboard/EngajamentoRedesCard";
import { LancamentosCard } from "@/components/dashboard/LancamentosCard";
import { LeaderCard } from "@/components/dashboard/LeaderCard";
import { InstagramImportCard } from "@/components/dashboard/InstagramImportCard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { TopPerformingPostsCard } from "@/components/redes-sociais/TopPerformingPostsCard";
import { ContentTypeAnalysisCard } from "@/components/redes-sociais/ContentTypeAnalysisCard";
import { PerformanceOverviewCard } from "@/components/redes-sociais/PerformanceOverviewCard";
import { EngagementTrendsCard } from "@/components/redes-sociais/EngagementTrendsCard";
import { InsightsIACard } from "@/components/dashboard/InsightsIACard";
import { LayoutGrid, List, Search as SearchIcon, SlidersHorizontal, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PostsGrid } from "@/components/conteudo/PostsGrid";
import { PostsTable } from "@/components/conteudo/PostsTable";
import { InstagramMetrics } from "@/components/conteudo/InstagramMetrics";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";
import { Card } from "@/components/ui/card";

const mockConcorrentes = [
  {
    id: 1,
    name: "@concorrente1",
    followers: 125000,
    engagement: 4.2,
    posts: 850,
    trend: "up",
    avatar: "/leader-default.png"
  },
  {
    id: 2,
    name: "@concorrente2",
    followers: 98000,
    engagement: 3.8,
    posts: 620,
    trend: "down",
    avatar: "/leader-default.png"
  },
];

const Imovi = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState("todos");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [contentTab, setContentTab] = useState("all");
  const { posts, isLoading: postsLoading } = useInstagramPosts();

  const filteredPosts = useMemo(() => {
    if (contentTab === "all") return posts;
    return posts.filter(post => {
      if (contentTab === "reels") return post.post_type === "VIDEO" || post.post_type === "CAROUSEL_ALBUM";
      if (contentTab === "posts") return post.post_type === "IMAGE";
      if (contentTab === "stories") return post.post_type === "STORY";
      return true;
    });
  }, [posts, contentTab]);

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
        navigate('/auth');
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
              value="comunicacao" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3"
            >
              Comunicação
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
            {activeFilter === "redes-sociais" || activeFilter === "comunicacao" ? (
              <div className="space-y-8">
                {/* Performance Overview */}
                <PerformanceOverviewCard />

                {/* Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EngagementTrendsCard />
                  <ContentTypeAnalysisCard />
                </div>

                {/* Top Posts */}
                <TopPerformingPostsCard />

                {/* Conteúdo Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Conteúdo</h2>
                    <Button className="bg-primary text-black hover:bg-primary/90 rounded-full">
                      <Plus className="w-4 h-4 mr-2" />
                      New Content
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 max-w-md">
                      <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search content..."
                          className="pl-10 bg-black border-gray-800 text-white placeholder:text-gray-500 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-gray-800 bg-black text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                      </Button>
                      <div className="flex items-center gap-1 bg-black border border-gray-800 rounded-xl p-1">
                        <Button
                          variant={viewMode === "grid" ? "default" : "ghost"}
                          size="icon"
                          onClick={() => setViewMode("grid")}
                          className={viewMode === "grid" ? "bg-gray-800" : "text-gray-400 hover:text-white hover:bg-gray-800"}
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={viewMode === "list" ? "default" : "ghost"}
                          size="icon"
                          onClick={() => setViewMode("list")}
                          className={viewMode === "list" ? "bg-gray-800" : "text-gray-400 hover:text-white hover:bg-gray-800"}
                        >
                          <List className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <InstagramMetrics posts={posts} />

                  <Tabs value={contentTab} onValueChange={setContentTab}>
                    <TabsList className="bg-transparent border-b border-gray-800 rounded-none h-auto p-0 w-full justify-start mb-6">
                      <TabsTrigger 
                        value="all" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3"
                      >
                        All
                      </TabsTrigger>
                      <TabsTrigger 
                        value="reels" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3"
                      >
                        Reels
                      </TabsTrigger>
                      <TabsTrigger 
                        value="posts" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3"
                      >
                        Posts
                      </TabsTrigger>
                      <TabsTrigger 
                        value="stories" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3"
                      >
                        Stories
                      </TabsTrigger>
                    </TabsList>

                    {viewMode === "grid" ? (
                      <PostsGrid posts={filteredPosts} isLoading={postsLoading} error={null} />
                    ) : (
                      <PostsTable posts={filteredPosts} />
                    )}
                  </Tabs>
                </div>

                {/* Concorrentes Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Concorrentes</h2>
                    <Button className="bg-primary text-black hover:bg-primary/90 rounded-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Concorrente
                    </Button>
                  </div>

                  <div className="mb-6">
                    <div className="relative max-w-md">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Buscar concorrentes..."
                        className="pl-10 bg-black border-gray-800 text-white placeholder:text-gray-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockConcorrentes.map((concorrente) => (
                      <Card key={concorrente.id} className="bg-black border-gray-800 rounded-3xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={concorrente.avatar} 
                              alt={concorrente.name}
                              className="w-12 h-12 rounded-full"
                            />
                            <div>
                              <h3 className="text-white font-semibold">{concorrente.name}</h3>
                              <p className="text-gray-400 text-sm">{concorrente.followers.toLocaleString()} seguidores</p>
                            </div>
                          </div>
                          {concorrente.trend === "up" ? (
                            <TrendingUp className="w-5 h-5 text-green-500" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-500" />
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div>
                            <p className="text-gray-400 text-sm">Engajamento</p>
                            <p className="text-white text-xl font-bold">{concorrente.engagement}%</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Posts</p>
                            <p className="text-white text-xl font-bold">{concorrente.posts}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeFilter === "todos" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <LeaderCard 
                  userProfile={userProfile} 
                  onProfileUpdate={loadUserProfile}
                />
                <IMOVICard 
                  imoviHistory={data.imoviHistory} 
                  currentImovi={data.currentImovi}
                />
                <ReceitaTotalCard 
                  totalViews={data.totalReach}
                  previousViews={data.previousPeriodData.totalReach}
                />
                <LancamentosCard />
                <InsightsIACard />
                <InstagramImportCard 
                  userProfile={userProfile}
                  onProfileUpdate={loadUserProfile}
                />
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
