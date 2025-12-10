import { Card } from "@/components/ui/card";
import { Film, Image, Clock } from "lucide-react";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export const ContentTypeAnalysisCard = () => {
  const { posts, isLoading } = useInstagramPosts();

  if (isLoading || posts.length === 0) return null;

  // Agrupar por tipo de conteúdo
  const reels = posts.filter(p => p.post_type === 'reel');
  const regularPosts = posts.filter(p => p.post_type === 'post');
  const stories = posts.filter(p => p.post_type === 'story');

  // Calcular métricas por tipo
  const calculateAverage = (arr: any[], field: string) => {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, p) => sum + (p[field] || 0), 0) / arr.length;
  };

  const contentTypes = [
    {
      name: "Reels",
      count: reels.length,
      icon: Film,
      color: "hsl(var(--primary))",
      avgViews: calculateAverage(reels, 'views'),
      avgEngagement: calculateAverage(reels, 'engagement_rate'),
    },
    {
      name: "Posts",
      count: regularPosts.length,
      icon: Image,
      color: "hsl(var(--chart-2))",
      avgViews: calculateAverage(regularPosts, 'views'),
      avgEngagement: calculateAverage(regularPosts, 'engagement_rate'),
    },
    {
      name: "Stories",
      count: stories.length,
      icon: Clock,
      color: "hsl(var(--chart-3))",
      avgViews: calculateAverage(stories, 'views'),
      avgEngagement: calculateAverage(stories, 'engagement_rate'),
    },
  ];

  const chartData = contentTypes.filter(ct => ct.count > 0).map(ct => ({
    name: ct.name,
    value: ct.count,
  }));

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  return (
    <Card className="bg-card-dark border-border/50 rounded-3xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Análise por Tipo de Conteúdo</h2>
        <p className="text-sm text-muted-foreground mt-1">Performance comparativa entre formatos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza */}
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => {
                  const type = contentTypes.find(ct => ct.name === entry.name);
                  return <Cell key={`cell-${index}`} fill={type?.color || '#888'} />;
                })}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Métricas por tipo */}
        <div className="space-y-3">
          {contentTypes.filter(ct => ct.count > 0).map((type, index) => {
            const Icon = type.icon;
            return (
              <div
                key={index}
                className="bg-card-darker border border-border/30 rounded-2xl p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: `${type.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: type.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{type.name}</h3>
                    <p className="text-xs text-muted-foreground">{type.count} publicações</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Média de Views</p>
                    <p className="text-lg font-bold text-foreground">{formatNumber(type.avgViews)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Engajamento Médio</p>
                    <p className="text-lg font-bold text-foreground">{type.avgEngagement.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
