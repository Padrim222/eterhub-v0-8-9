import { Card } from "@/components/ui/card";
import { TrendingUp, Calendar } from "lucide-react";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export const EngagementTrendsCard = () => {
  const { posts, isLoading } = useInstagramPosts();

  if (isLoading || posts.length === 0) return null;

  // Agrupar posts por dia dos últimos 30 dias
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 29 - i));
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const dayPosts = posts.filter(p => {
      if (!p.published_at) return false;
      const postDate = format(startOfDay(new Date(p.published_at)), 'yyyy-MM-dd');
      return postDate === dateStr;
    });

    const avgEngagement = dayPosts.length > 0
      ? dayPosts.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / dayPosts.length
      : 0;

    const totalViews = dayPosts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = dayPosts.reduce((sum, p) => sum + (p.likes || 0), 0);

    return {
      date: format(date, 'dd/MMM', { locale: ptBR }),
      fullDate: dateStr,
      engagement: parseFloat(avgEngagement.toFixed(2)),
      views: totalViews,
      likes: totalLikes,
      posts: dayPosts.length,
    };
  });

  // Calcular tendência geral
  const recentData = last30Days.slice(-7);
  const previousData = last30Days.slice(-14, -7);
  
  const recentAvg = recentData.reduce((sum, d) => sum + d.engagement, 0) / recentData.length;
  const previousAvg = previousData.reduce((sum, d) => sum + d.engagement, 0) / previousData.length;
  const trend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

  return (
    <Card className="bg-card-dark border-border/50 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-xl">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Tendências de Engajamento</h2>
            <p className="text-sm text-muted-foreground">Últimos 30 dias</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${trend >= 0 ? 'bg-primary/10' : 'bg-destructive/10'}`}>
          <TrendingUp className={`w-4 h-4 ${trend >= 0 ? 'text-primary' : 'text-destructive'} ${trend < 0 ? 'rotate-180' : ''}`} />
          <span className={`text-sm font-semibold ${trend >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={last30Days}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card-darker))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
              color: 'hsl(var(--foreground))',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend
            wrapperStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Line
            type="monotone"
            dataKey="engagement"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            activeDot={{ r: 6 }}
            name="Taxa de Engajamento (%)"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-card-darker border border-border/30 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Engajamento Médio</p>
          <p className="text-lg font-bold text-foreground">{recentAvg.toFixed(2)}%</p>
        </div>
        <div className="bg-card-darker border border-border/30 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Posts (7 dias)</p>
          <p className="text-lg font-bold text-foreground">{recentData.reduce((sum, d) => sum + d.posts, 0)}</p>
        </div>
        <div className="bg-card-darker border border-border/30 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Melhor Dia</p>
          <p className="text-lg font-bold text-foreground">
            {last30Days.reduce((max, d) => d.engagement > max.engagement ? d : max, last30Days[0]).date}
          </p>
        </div>
      </div>
    </Card>
  );
};
