import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import type { InstagramPost } from "@/hooks/useInstagramPosts";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PostCardProps {
  post: InstagramPost;
}

export const PostCard = ({ post }: PostCardProps) => {
  const formatNumber = (num: number | null) => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const publishedDate = post.published_at 
    ? formatDistanceToNow(new Date(post.published_at), { 
        addSuffix: true, 
        locale: ptBR 
      })
    : "Data desconhecida";

  return (
    <Card className="bg-gradient-to-br from-background to-muted/20 border-muted rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02]">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Badge variant="secondary" className="text-xs">
              {post.post_type || "Reel"}
            </Badge>
            <p className="text-xs text-muted-foreground">{publishedDate}</p>
          </div>
          {post.post_url && (
            <a
              href={post.post_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Ver post →
            </a>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Views */}
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Eye className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Visualizações</p>
              <p className="text-lg font-bold">{formatNumber(post.views)}</p>
            </div>
          </div>

          {/* Likes */}
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Heart className="w-4 h-4 text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">Curtidas</p>
              <p className="text-lg font-bold">{formatNumber(post.likes)}</p>
            </div>
          </div>

          {/* Comments */}
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <MessageCircle className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Comentários</p>
              <p className="text-lg font-bold">{formatNumber(post.comments)}</p>
            </div>
          </div>

          {/* Saves */}
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Bookmark className="w-4 h-4 text-yellow-500" />
            <div>
              <p className="text-xs text-muted-foreground">Salvos</p>
              <p className="text-lg font-bold">{formatNumber(post.saves)}</p>
            </div>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
          <span className="text-sm font-medium">Taxa de Engajamento</span>
          <span className="text-lg font-bold text-primary">
            {post.engagement_rate?.toFixed(2) || "0.00"}%
          </span>
        </div>
      </div>
    </Card>
  );
};
