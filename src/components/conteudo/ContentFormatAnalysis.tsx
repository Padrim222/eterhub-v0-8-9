import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Image as ImageIcon, Layers, TrendingUp, Eye, Heart } from "lucide-react";
import type { InstagramPost } from "@/hooks/useInstagramPosts";

interface ContentFormatAnalysisProps {
  posts: InstagramPost[];
}

export const ContentFormatAnalysis = ({ posts }: ContentFormatAnalysisProps) => {
  const getFormatStats = () => {
    const formats = {
      VIDEO: { label: "Reels", icon: Play, color: "text-purple-500", posts: [] as InstagramPost[] },
      CAROUSEL_ALBUM: { label: "Carrossel", icon: Layers, color: "text-blue-500", posts: [] as InstagramPost[] },
      IMAGE: { label: "Post", icon: ImageIcon, color: "text-green-500", posts: [] as InstagramPost[] },
    };

    posts.forEach(post => {
      const type = post.post_type as keyof typeof formats;
      if (formats[type]) {
        formats[type].posts.push(post);
      }
    });

    return Object.entries(formats).map(([key, data]) => {
      const formatPosts = data.posts;
      const totalPosts = formatPosts.length;
      const totalViews = formatPosts.reduce((sum, p) => sum + (p.views || 0), 0);
      const totalLikes = formatPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
      const avgEngagement = totalPosts > 0
        ? formatPosts.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / totalPosts
        : 0;

      return {
        type: key,
        label: data.label,
        icon: data.icon,
        color: data.color,
        totalPosts,
        totalViews,
        totalLikes,
        avgEngagement,
      };
    }).filter(stat => stat.totalPosts > 0);
  };

  const formatStats = getFormatStats();
  const bestPerforming = [...formatStats].sort((a, b) => b.avgEngagement - a.avgEngagement)[0];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card className="bg-background border-border rounded-3xl p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Análise por Formato</h3>
          <Badge variant="secondary">
            <TrendingUp className="w-3 h-3 mr-1" />
            Melhor: {bestPerforming?.label}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {formatStats.map((stat) => {
            const Icon = stat.icon;
            const isBest = stat.type === bestPerforming?.type;

            return (
              <Card
                key={stat.type}
                className={`bg-muted/50 border-border p-4 ${
                  isBest ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 bg-background rounded-lg ${stat.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold">{stat.label}</span>
                    </div>
                    {isBest && (
                      <Badge variant="default" className="text-xs">
                        Top
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Posts</span>
                      <span className="font-bold">{stat.totalPosts}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        <span>Views</span>
                      </div>
                      <span className="font-bold">{formatNumber(stat.totalViews)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Heart className="w-3 h-3" />
                        <span>Likes</span>
                      </div>
                      <span className="font-bold">{formatNumber(stat.totalLikes)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Eng. Médio</span>
                      <span className="text-lg font-bold text-primary">
                        {stat.avgEngagement.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {formatStats.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado disponível para análise
          </div>
        )}
      </div>
    </Card>
  );
};
