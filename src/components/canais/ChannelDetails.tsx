import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Eye, Heart, MessageCircle, Bookmark, TrendingUp, Users, BarChart3 } from "lucide-react";
import { PostsGrid } from "@/components/conteudo/PostsGrid";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";
import { PerformanceOverviewCard } from "@/components/redes-sociais/PerformanceOverviewCard";
import { EngagementTrendsCard } from "@/components/redes-sociais/EngagementTrendsCard";
import { ContentTypeAnalysisCard } from "@/components/redes-sociais/ContentTypeAnalysisCard";

interface Channel {
  id: string;
  name: string;
  username: string;
  platform: string;
  followers: number;
  totalPosts: number;
  avgEngagement: number;
}

interface ChannelDetailsProps {
  channel: Channel;
  onBack: () => void;
}

export const ChannelDetails = ({ channel, onBack }: ChannelDetailsProps) => {
  const { posts, isLoading, error } = useInstagramPosts();
  const [contentTab, setContentTab] = useState("all");

  const filteredPosts = posts.filter(post => {
    if (contentTab === "all") return true;
    if (contentTab === "reels") return post.post_type === "VIDEO" || post.post_type === "CAROUSEL_ALBUM";
    if (contentTab === "posts") return post.post_type === "IMAGE";
    if (contentTab === "stories") return post.post_type === "STORY";
    return true;
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
  const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.comments || 0), 0);
  const totalSaves = posts.reduce((sum, post) => sum + (post.saves || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{channel.name}</h1>
          <p className="text-muted-foreground">{channel.username}</p>
        </div>
      </div>

      {/* Métricas Gerais do Canal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-background border-border rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Visualizações</h3>
          </div>
          <p className="text-3xl font-bold">{formatNumber(totalViews)}</p>
        </Card>

        <Card className="bg-background border-border rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Curtidas</h3>
          </div>
          <p className="text-3xl font-bold">{formatNumber(totalLikes)}</p>
        </Card>

        <Card className="bg-background border-border rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Comentários</h3>
          </div>
          <p className="text-3xl font-bold">{formatNumber(totalComments)}</p>
        </Card>

        <Card className="bg-background border-border rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Bookmark className="w-5 h-5 text-yellow-500" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Salvos</h3>
          </div>
          <p className="text-3xl font-bold">{formatNumber(totalSaves)}</p>
        </Card>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EngagementTrendsCard />
        <ContentTypeAnalysisCard />
      </div>

      {/* Posts do Canal */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Conteúdo</h2>
        
        <Tabs value={contentTab} onValueChange={setContentTab}>
          <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 w-full justify-start">
            <TabsTrigger 
              value="all" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Todos
            </TabsTrigger>
            <TabsTrigger 
              value="reels" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Reels
            </TabsTrigger>
            <TabsTrigger 
              value="posts" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="stories" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Stories
            </TabsTrigger>
          </TabsList>

          <TabsContent value={contentTab} className="mt-6">
            <PostsGrid posts={filteredPosts} isLoading={isLoading} error={error} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
