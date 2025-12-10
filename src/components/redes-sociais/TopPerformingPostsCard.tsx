import { Card } from "@/components/ui/card";
import { Trophy, Eye, Heart, TrendingUp, ExternalLink } from "lucide-react";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";
import { Badge } from "@/components/ui/badge";

export const TopPerformingPostsCard = () => {
  const { posts, isLoading } = useInstagramPosts();

  if (isLoading || posts.length === 0) return null;

  // Ordenar posts por engagement_rate
  const topPosts = [...posts]
    .sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0))
    .slice(0, 5);

  const formatNumber = (num: number | null) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Data desconhecida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getPostTypeBadge = (type: string | null) => {
    const badges: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      reel: { label: "Reel", variant: "default" },
      post: { label: "Post", variant: "secondary" },
      story: { label: "Story", variant: "outline" },
    };
    return badges[type || 'post'] || badges.post;
  };

  return (
    <Card className="bg-card-dark border-border/50 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-3 rounded-xl">
          <Trophy className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Top 5 Melhores Posts</h2>
          <p className="text-sm text-muted-foreground">Conteúdos com maior engajamento</p>
        </div>
      </div>

      <div className="space-y-3">
        {topPosts.map((post, index) => {
          const badge = getPostTypeBadge(post.post_type);
          return (
            <div
              key={post.id}
              className="bg-card-darker border border-border/30 rounded-2xl p-4 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-3">
                {/* Ranking Badge */}
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full flex-shrink-0">
                  <span className="text-sm font-bold text-primary">#{index + 1}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={badge.variant} className="text-xs">
                      {badge.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(post.published_at)}</span>
                  </div>


                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">{formatNumber(post.views)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-500" />
                      <span className="text-sm font-semibold text-foreground">{formatNumber(post.likes)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">{(post.engagement_rate || 0).toFixed(2)}%</span>
                    </div>
                  </div>

                  {/* Link to post */}
                  {post.post_url && (
                    <a
                      href={post.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Ver post
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
