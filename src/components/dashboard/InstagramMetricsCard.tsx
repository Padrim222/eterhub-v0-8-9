import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Eye, Heart, MessageCircle, Instagram } from "lucide-react";
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
      <Card className="bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#FD1D1D] p-[1px] rounded-3xl">
        <div className="bg-black rounded-3xl p-6">
          <Skeleton className="h-6 w-32 mb-4 bg-purple-500/20" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 bg-purple-500/20" />
            <Skeleton className="h-16 bg-purple-500/20" />
            <Skeleton className="h-16 bg-purple-500/20" />
            <Skeleton className="h-16 bg-purple-500/20" />
          </div>
        </div>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className="bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#FD1D1D] p-[1px] rounded-3xl">
        <div className="bg-black rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Instagram className="w-5 h-5 text-[#E1306C]" />
            <h3 className="text-lg font-semibold text-white">Instagram</h3>
          </div>
          <p className="text-sm text-gray-400">Nenhum dado disponível. Faça o scraping primeiro.</p>
        </div>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card className="bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#FD1D1D] p-[1px] rounded-3xl hover:shadow-lg hover:shadow-purple-500/20 transition-all">
      <div className="bg-black rounded-3xl p-6 h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Instagram className="w-5 h-5 text-[#E1306C]" />
            <h3 className="text-lg font-semibold text-white">Instagram</h3>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {metrics.totalPosts} posts
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Views */}
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Visualizações</span>
            </div>
            <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {formatNumber(metrics.totalViews)}
            </p>
          </div>

          {/* Engagement */}
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-pink-400" />
              <span className="text-xs text-gray-400">Engajamento</span>
            </div>
            <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {metrics.avgEngagement}%
            </p>
          </div>

          {/* Likes */}
          <div className="bg-gray-900/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <span className="text-xs text-gray-400">Curtidas</span>
            </div>
            <p className="text-lg font-bold text-white">{formatNumber(metrics.totalLikes)}</p>
          </div>

          {/* Comments */}
          <div className="bg-gray-900/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Comentários</span>
            </div>
            <p className="text-lg font-bold text-white">{formatNumber(metrics.totalComments)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
