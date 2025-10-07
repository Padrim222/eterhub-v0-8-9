import { useState, useEffect } from "react";
import { Bell, Search, Plus, Filter, Grid3x3, List } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppNavigation } from "@/components/layout/AppNavigation";
import eterLogo from "@/assets/eter-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";
import { PostsGrid } from "@/components/conteudo/PostsGrid";

const Conteudo = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [userProfile, setUserProfile] = useState<any>(null);
  const { posts, isLoading, error } = useInstagramPosts();

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
      .single();

    if (profile) {
      setUserProfile(profile);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/30 px-6 py-4">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <img src={eterLogo} alt="ETER" className="h-10 w-auto" />
            <AppNavigation />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full border border-border/40 hover:bg-muted/30">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full border border-border/40 hover:bg-muted/30">
              <Bell className="w-5 h-5" />
            </Button>
            <Avatar className="border-2 border-border/40">
              <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.nome} />
              <AvatarFallback>{userProfile?.nome?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6 pb-12 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-5xl font-bold tracking-tight">Conteúdo</h1>
            
            <Button className="gap-2">
              <Plus className="w-5 h-5" />
              Novo Conteúdo
            </Button>
          </div>

          {/* Filters and Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 max-w-md">
              <Input
                type="search"
                placeholder="Buscar conteúdo..."
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </Button>

              <div className="flex items-center gap-1 border border-border/40 rounded-md p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-8 border-b border-border/30">
            <button className="pb-3 border-b-2 border-primary font-semibold text-foreground">
              Todos
            </button>
            <button className="pb-3 text-muted-foreground hover:text-foreground transition-colors">
              Reels
            </button>
            <button className="pb-3 text-muted-foreground hover:text-foreground transition-colors">
              Posts
            </button>
            <button className="pb-3 text-muted-foreground hover:text-foreground transition-colors">
              Stories
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        <PostsGrid posts={posts} isLoading={isLoading} error={error} />
      </main>
    </div>
  );
};

export default Conteudo;
