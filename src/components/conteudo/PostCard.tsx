import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, MessageCircle, Bookmark, Play, Image as ImageIcon, Layers } from "lucide-react";
import type { InstagramPost } from "@/hooks/useInstagramPosts";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PostCardProps {
  post: InstagramPost;
  onClick?: () => void;
}

export const PostCard = ({ post, onClick }: PostCardProps) => {
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

  const getPostTypeInfo = (type: string | null) => {
    switch (type) {
      case "VIDEO":
        return { icon: Play, label: "Reels", color: "bg-purple-500/10 text-purple-500" };
      case "CAROUSEL_ALBUM":
        return { icon: Layers, label: "Carrossel", color: "bg-blue-500/10 text-blue-500" };
      case "IMAGE":
        return { icon: ImageIcon, label: "Post", color: "bg-green-500/10 text-green-500" };
      default:
        return { icon: ImageIcon, label: "Post", color: "bg-muted text-muted-foreground" };
    }
  };

  const postTypeInfo = getPostTypeInfo(post.post_type);
  const PostTypeIcon = postTypeInfo.icon;

  return (
    <Card 
      className="bg-background border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
      onClick={onClick}
    >
      <div className="space-y-0">
        {/* Thumbnail com tipo de post */}
        <div className="relative aspect-square bg-muted">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`p-6 rounded-full ${postTypeInfo.color}`}>
              <PostTypeIcon className="w-12 h-12" />
            </div>
          </div>
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              {postTypeInfo.label}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-primary/20">
              {post.engagement_rate?.toFixed(1) || "0.0"}%
            </Badge>
          </div>
        </div>

        {/* Métricas */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{publishedDate}</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <Eye className="w-4 h-4 mx-auto mb-1 text-blue-500" />
              <p className="text-xs font-semibold">{formatNumber(post.views)}</p>
            </div>
            <div className="text-center">
              <Heart className="w-4 h-4 mx-auto mb-1 text-red-500" />
              <p className="text-xs font-semibold">{formatNumber(post.likes)}</p>
            </div>
            <div className="text-center">
              <MessageCircle className="w-4 h-4 mx-auto mb-1 text-green-500" />
              <p className="text-xs font-semibold">{formatNumber(post.comments)}</p>
            </div>
            <div className="text-center">
              <Bookmark className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
              <p className="text-xs font-semibold">{formatNumber(post.saves)}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
