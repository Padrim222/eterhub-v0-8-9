import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const InstagramMetricsCard = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: posts } = await supabase
        .from('ig_posts')
        .select('*')
        .eq('user_id', session.user.id);

      if (posts && posts.length > 0) {
        const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
        const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
        const totalComments = posts.reduce((sum, p) => sum + (p.comments || 0), 0);
        const totalShares = posts.reduce((sum, p) => sum + (p.shares || 0), 0);
        const avgEngagement = posts.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / posts.length;

        setMetrics({
          totalPosts: posts.length,
          totalViews,
          totalLikes,
          totalComments,
          totalShares,
          avgEngagement: avgEngagement.toFixed(2),
        });
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-6">
        <Skeleton className="h-6 w-32 mb-4 bg-purple-500/20" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-16 bg-purple-500/20" />
          <Skeleton className="h-16 bg-purple-500/20" />
          <Skeleton className="h-16 bg-purple-500/20" />
          <Skeleton className="h-16 bg-purple-500/20" />
        </div>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-6">
        <h3 className="text-lg font-semibold mb-2 text-white">Instagram</h3>
        <p className="text-sm text-gray-400">Nenhum dado disponível. Faça o scraping primeiro.</p>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Instagram</h3>
        <TrendingUp className="w-5 h-5 text-purple-400" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Views */}
        <div className="bg-black/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Visualizações</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(metrics.totalViews)}</p>
        </div>

        {/* Likes */}
        <div className="bg-black/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-pink-400" />
            <span className="text-xs text-gray-400">Curtidas</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(metrics.totalLikes)}</p>
        </div>

        {/* Comments */}
        <div className="bg-black/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Comentários</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(metrics.totalComments)}</p>
        </div>

        {/* Engagement */}
        <div className="bg-black/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Engajamento</span>
          </div>
          <p className="text-2xl font-bold text-white">{metrics.avgEngagement}%</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-purple-500/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Total de Posts</span>
          <span className="font-semibold text-white">{metrics.totalPosts}</span>
        </div>
      </div>
    </Card>
  );
};
