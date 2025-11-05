import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, MessageCircle, Share2, Bookmark, Play, Image as ImageIcon, Layers } from "lucide-react";
import type { InstagramPost } from "@/hooks/useInstagramPosts";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PostDetailModalProps {
  post: InstagramPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PostDetailModal = ({ post, isOpen, onClose }: PostDetailModalProps) => {
  if (!post) return null;

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
        return { icon: Play, label: "Reels", color: "text-purple-500" };
      case "CAROUSEL_ALBUM":
        return { icon: Layers, label: "Carrossel", color: "text-blue-500" };
      case "IMAGE":
        return { icon: ImageIcon, label: "Post", color: "text-green-500" };
      default:
        return { icon: ImageIcon, label: "Post", color: "text-gray-500" };
    }
  };

  const postTypeInfo = getPostTypeInfo(post.post_type);
  const PostTypeIcon = postTypeInfo.icon;

  // Extrair o shortcode da URL do Instagram para fazer o embed
  const getInstagramEmbedUrl = (url: string | null) => {
    if (!url) return null;
    const match = url.match(/instagram\.com\/(p|reel|reels)\/([^/?]+)/);
    if (match) {
      const shortcode = match[2];
      return `https://www.instagram.com/p/${shortcode}/embed`;
    }
    return null;
  };

  const embedUrl = getInstagramEmbedUrl(post.post_url);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-muted rounded-lg ${postTypeInfo.color}`}>
              <PostTypeIcon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{postTypeInfo.label}</DialogTitle>
              <p className="text-sm text-muted-foreground">{publishedDate}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          {/* Preview do Post */}
          <div className="space-y-4">
            <div className="aspect-[9/16] lg:aspect-square bg-muted rounded-2xl overflow-hidden">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  scrolling="no"
                  allowTransparency
                  allow="encrypted-media"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <PostTypeIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Preview não disponível</p>
                    {post.post_url && (
                      <a
                        href={post.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm mt-2 inline-block"
                      >
                        Ver no Instagram →
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Métricas do Post */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Métricas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <p className="text-sm text-muted-foreground">Visualizações</p>
                  </div>
                  <p className="text-2xl font-bold">{formatNumber(post.views)}</p>
                </div>

                <div className="p-4 bg-muted rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-muted-foreground">Curtidas</p>
                  </div>
                  <p className="text-2xl font-bold">{formatNumber(post.likes)}</p>
                </div>

                <div className="p-4 bg-muted rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    <p className="text-sm text-muted-foreground">Comentários</p>
                  </div>
                  <p className="text-2xl font-bold">{formatNumber(post.comments)}</p>
                </div>

                <div className="p-4 bg-muted rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Bookmark className="w-4 h-4 text-yellow-500" />
                    <p className="text-sm text-muted-foreground">Salvos</p>
                  </div>
                  <p className="text-2xl font-bold">{formatNumber(post.saves)}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taxa de Engajamento</span>
                <span className="text-2xl font-bold text-primary">
                  {post.engagement_rate?.toFixed(2) || "0.00"}%
                </span>
              </div>
            </div>

            {post.post_url && (
              <a
                href={post.post_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3 px-4 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium"
              >
                Abrir no Instagram
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
