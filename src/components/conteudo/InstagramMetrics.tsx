import { Card } from "@/components/ui/card";
import { Instagram, TrendingUp, Eye, Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import type { InstagramPost } from "@/hooks/useInstagramPosts";

interface InstagramMetricsProps {
  posts: InstagramPost[];
}

export const InstagramMetrics = ({ posts }: InstagramMetricsProps) => {
  // Calculate totals
  const totalPosts = posts.length;
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.comments || 0), 0);
  const totalSaves = posts.reduce((sum, p) => sum + (p.saves || 0), 0);
  const totalShares = posts.reduce((sum, p) => sum + (p.shares || 0), 0);

  // Calculate averages
  const avgViews = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;
  const avgLikes = totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0;
  const avgComments = totalPosts > 0 ? Math.round(totalComments / totalPosts) : 0;
  const avgEngagement = totalPosts > 0 
    ? posts.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / totalPosts
    : 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const metrics = [
    {
      label: "Total de Posts",
      value: totalPosts,
      icon: Instagram,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Visualizações Totais",
      value: formatNumber(totalViews),
      subtitle: `Média: ${formatNumber(avgViews)}`,
      icon: Eye,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Curtidas Totais",
      value: formatNumber(totalLikes),
      subtitle: `Média: ${formatNumber(avgLikes)}`,
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Comentários Totais",
      value: formatNumber(totalComments),
      subtitle: `Média: ${formatNumber(avgComments)}`,
      icon: MessageCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Salvos Totais",
      value: formatNumber(totalSaves),
      icon: Bookmark,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Compartilhamentos",
      value: formatNumber(totalShares),
      icon: Share2,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      label: "Engajamento Médio",
      value: `${avgEngagement.toFixed(2)}%`,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  if (totalPosts === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Métricas do Instagram</h2>
        <span className="text-sm text-gray-400">Baseado em {totalPosts} post{totalPosts !== 1 ? 's' : ''}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card
              key={index}
              className="bg-black rounded-3xl p-6 border border-gray-800 hover:border-gray-700 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-gray-900 ${metric.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">{metric.label}</p>
                <p className="text-2xl font-bold text-white">{metric.value}</p>
                {metric.subtitle && (
                  <p className="text-xs text-gray-500">{metric.subtitle}</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
