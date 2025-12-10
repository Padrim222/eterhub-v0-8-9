import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Eye, Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";

export const PerformanceOverviewCard = () => {
  const { posts, isLoading } = useInstagramPosts();

  if (isLoading || posts.length === 0) return null;

  // Calcular métricas totais
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.comments || 0), 0);
  const totalSaves = posts.reduce((sum, p) => sum + (p.saves || 0), 0);
  const totalShares = posts.reduce((sum, p) => sum + (p.shares || 0), 0);
  const avgEngagement = posts.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / posts.length;

  // Calcular crescimento (últimos 7 dias vs 7 dias anteriores)
  const now = new Date();
  const last7Days = posts.filter(p => {
    const publishedDate = new Date(p.published_at || '');
    const diffDays = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });
  
  const previous7Days = posts.filter(p => {
    const publishedDate = new Date(p.published_at || '');
    const diffDays = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 7 && diffDays <= 14;
  });

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const currentPeriodViews = last7Days.reduce((sum, p) => sum + (p.views || 0), 0);
  const previousPeriodViews = previous7Days.reduce((sum, p) => sum + (p.views || 0), 0);
  const viewsGrowth = calculateGrowth(currentPeriodViews, previousPeriodViews);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const metrics = [
    {
      label: "Visualizações Totais",
      value: formatNumber(totalViews),
      icon: Eye,
      color: "text-primary",
      bgColor: "bg-primary/10",
      growth: viewsGrowth,
    },
    {
      label: "Curtidas Totais",
      value: formatNumber(totalLikes),
      icon: Heart,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      label: "Comentários",
      value: formatNumber(totalComments),
      icon: MessageCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Salvamentos",
      value: formatNumber(totalSaves),
      icon: Bookmark,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Compartilhamentos",
      value: formatNumber(totalShares),
      icon: Share2,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Taxa de Engajamento",
      value: `${avgEngagement.toFixed(2)}%`,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <Card className="bg-card-dark border-border/50 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Visão Geral de Performance</h2>
          <p className="text-sm text-muted-foreground mt-1">Métricas consolidadas de todos os seus posts</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
          <span className="text-xs font-semibold text-primary">{posts.length} posts analisados</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="bg-card-darker border border-border/30 rounded-2xl p-4 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`${metric.bgColor} p-2 rounded-xl`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                {metric.growth !== undefined && (
                  <div className={`flex items-center gap-1 text-xs font-semibold ${metric.growth >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {metric.growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(metric.growth).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
              <div className="text-xs text-muted-foreground">{metric.label}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
