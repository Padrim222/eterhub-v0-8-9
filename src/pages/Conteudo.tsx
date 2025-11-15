import { useState, useEffect, useMemo } from "react";
import { Bell, Search, Plus, Filter, Grid3x3, List } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppNavigation } from "@/components/layout/AppNavigation";
import eterLogo from "@/assets/eter-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";
import { PostsGrid } from "@/components/conteudo/PostsGrid";
import { PostsTable } from "@/components/conteudo/PostsTable";
import { InstagramMetrics } from "@/components/conteudo/InstagramMetrics";
import { N8nWebhookCard } from "@/components/dashboard/N8nWebhookCard";

const Conteudo = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("todos");
  const { posts, isLoading, error } = useInstagramPosts();

  const filteredPosts = useMemo(() => {
    if (activeTab === "todos") return posts;
    
    return posts.filter((post) => {
      const type = post.post_type?.toLowerCase() || "";
      
      if (activeTab === "reels") {
        return type.includes("reel");
      }
      if (activeTab === "stories") {
        return type.includes("story");
      }
      if (activeTab === "posts") {
        return !type.includes("reel") && !type.includes("story");
      }
      return true;
    });
  }, [posts, activeTab]);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profile) {
      setUserProfile(profile);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-5xl font-bold tracking-tight">Conteúdo</h1>
            <Button className="bg-primary hover:bg-primary/90 text-black font-medium rounded-full px-6">
              <Plus className="w-4 h-4 mr-2" />
              Novo Conteúdo
            </Button>
          </div>
          
          {/* N8n Webhook Integration */}
          <div className="mb-8">
            <N8nWebhookCard />
          </div>
          
          {/* Search and Filters */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar conteúdo..."
                  className="pl-10 bg-black border-gray-700 rounded-full text-white placeholder:text-gray-500 focus:border-gray-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 border border-gray-700 rounded-full hover:bg-gray-800"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
              
              <div className="flex items-center gap-1 border border-gray-700 rounded-full p-1 bg-black">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`px-3 rounded-full ${viewMode === "grid" ? "bg-gray-800" : ""}`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`px-3 rounded-full ${viewMode === "list" ? "bg-primary text-black" : ""}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Instagram Metrics */}
          <InstagramMetrics posts={posts} />
        </div>

        {/* Tabs and Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-6 bg-black border-b border-gray-800 rounded-none h-auto p-0 gap-8">
            <TabsTrigger 
              value="todos" 
              className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-4 px-0 text-white/60 hover:text-white"
            >
              Todos ({posts.length})
            </TabsTrigger>
            <TabsTrigger 
              value="reels"
              className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-4 px-0 text-white/60 hover:text-white"
            >
              Reels ({posts.filter(p => p.post_type?.toLowerCase().includes("reel")).length})
            </TabsTrigger>
            <TabsTrigger 
              value="posts"
              className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-4 px-0 text-white/60 hover:text-white"
            >
              Posts ({posts.filter(p => !p.post_type?.toLowerCase().includes("reel") && !p.post_type?.toLowerCase().includes("story")).length})
            </TabsTrigger>
            <TabsTrigger 
              value="stories"
              className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-4 px-0 text-white/60 hover:text-white"
            >
              Stories ({posts.filter(p => p.post_type?.toLowerCase().includes("story")).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {viewMode === "grid" ? (
              <PostsGrid posts={filteredPosts} isLoading={isLoading} error={error} />
            ) : (
              <PostsTable posts={filteredPosts} />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Conteudo;
