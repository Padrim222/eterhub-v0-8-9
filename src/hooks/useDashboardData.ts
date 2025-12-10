import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateImovi } from '@/utils/imoviCalculations';

interface Post {
  id: string;
  views: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  engagement_rate: number;
  published_at: string;
}

interface DashboardData {
  posts: Post[];
  totalPosts: number;
  totalEngagement: number;
  totalReach: number;
  totalLikes: number;
  totalComments: number;
  totalSaves: number;
  avgEngagementRate: number;
  previousPeriodData: {
    totalReach: number;
    totalEngagement: number;
    totalLikes: number;
    totalComments: number;
    totalSaves: number;
    avgEngagementRate: number;
  };
  imoviHistory: Array<{ month: string; value: number; highlighted?: boolean; label?: string }>;
  movqlData: Array<{ month: string; leads: number; highlighted?: boolean }>;
  currentImovi: number;
  isLoading: boolean;
  error: string | null;
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    posts: [],
    totalPosts: 0,
    totalEngagement: 0,
    totalReach: 0,
    totalLikes: 0,
    totalComments: 0,
    totalSaves: 0,
    avgEngagementRate: 0,
    previousPeriodData: {
      totalReach: 0,
      totalEngagement: 0,
      totalLikes: 0,
      totalComments: 0,
      totalSaves: 0,
      avgEngagementRate: 0,
    },
    imoviHistory: [],
    movqlData: [], // Will be populated from database
    currentImovi: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));

        // Buscar sessão do usuário
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Usuário não autenticado');
        }

        // Buscar posts dos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: posts, error: postsError } = await supabase
          .from('ig_posts')
          .select('*')
          .eq('user_id', session.user.id)
          .gte('published_at', thirtyDaysAgo.toISOString())
          .order('published_at', { ascending: false });

        if (postsError) throw postsError;

        const fetchedPosts = posts || [];

        // Calcular métricas totais (últimos 30 dias)
        const totalPosts = fetchedPosts.length;
        const totalEngagement = fetchedPosts.reduce(
          (sum, post) => sum + (post.likes + post.comments + post.saves),
          0
        );
        const totalReach = fetchedPosts.reduce((sum, post) => sum + post.views, 0);
        const totalLikes = fetchedPosts.reduce((sum, post) => sum + post.likes, 0);
        const totalComments = fetchedPosts.reduce((sum, post) => sum + post.comments, 0);
        const totalSaves = fetchedPosts.reduce((sum, post) => sum + post.saves, 0);
        const avgEngagementRate = fetchedPosts.length > 0
          ? fetchedPosts.reduce((sum, post) => sum + (post.engagement_rate || 0), 0) / fetchedPosts.length
          : 0;

        // Buscar posts dos 30 dias anteriores para comparação
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const { data: previousPosts } = await supabase
          .from('ig_posts')
          .select('*')
          .eq('user_id', session.user.id)
          .gte('published_at', sixtyDaysAgo.toISOString())
          .lt('published_at', thirtyDaysAgo.toISOString())
          .order('published_at', { ascending: false });

        const previousPostsData = previousPosts || [];
        const previousTotalEngagement = previousPostsData.reduce(
          (sum, post) => sum + (post.likes + post.comments + post.saves),
          0
        );
        const previousTotalReach = previousPostsData.reduce((sum, post) => sum + post.views, 0);
        const previousTotalLikes = previousPostsData.reduce((sum, post) => sum + post.likes, 0);
        const previousTotalComments = previousPostsData.reduce((sum, post) => sum + post.comments, 0);
        const previousTotalSaves = previousPostsData.reduce((sum, post) => sum + post.saves, 0);
        const previousAvgEngagementRate = previousPostsData.length > 0
          ? previousPostsData.reduce((sum, post) => sum + (post.engagement_rate || 0), 0) / previousPostsData.length
          : 0;

        // Calcular IMOVI atual (baseado nos últimos 7 dias)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentPosts = fetchedPosts.filter(
          post => new Date(post.published_at) >= sevenDaysAgo
        );

        const avgViews = recentPosts.reduce((sum, p) => sum + p.views, 0) / (recentPosts.length || 1);
        const avgRetention = recentPosts.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / (recentPosts.length || 1);
        const totalInteractions = recentPosts.reduce(
          (sum, p) => sum + (p.likes + p.comments + p.saves),
          0
        );

        // Agrupar posts por mês para histórico IMOVI
        const monthlyData = new Map<string, Post[]>();
        fetchedPosts.forEach(post => {
          const date = new Date(post.published_at);
          const monthKey = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
          const capitalizedMonth = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);

          if (!monthlyData.has(capitalizedMonth)) {
            monthlyData.set(capitalizedMonth, []);
          }
          monthlyData.get(capitalizedMonth)?.push(post);
        });

        // Calcular IMOVI por mês
        const imoviHistory = Array.from(monthlyData.entries()).map(([month, monthPosts]) => {
          const avgViews = monthPosts.reduce((sum, p) => sum + p.views, 0) / monthPosts.length;
          const avgRetention = monthPosts.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / monthPosts.length;
          const totalInteractions = monthPosts.reduce(
            (sum, p) => sum + (p.likes + p.comments + p.saves),
            0
          );

          const imovi = calculateImovi({
            views: Math.round(avgViews),
            retention: avgRetention,
            interactions: totalInteractions,
            movql: 0,
          });

          return {
            month,
            value: imovi.score,
            highlighted: false,
          }
        });

        // Fetch MOVQL metrics from database
        const { data: movqlMetrics, error: movqlError } = await supabase
          .from('movql_metrics')
          .select('*')
          .eq('user_id', session.user.id)
          .order('month_year', { ascending: true });

        if (movqlError) {
          console.error('Erro ao carregar métricas MOVQL:', movqlError);
        }

        // Process MOVQL data for last 5 months
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const today = new Date();
        const movqlDataProcessed = [];

        for (let i = 4; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthName = monthNames[date.getMonth()];

          const metric = movqlMetrics?.find(m => m.month_year === monthYear);
          movqlDataProcessed.push({
            month: monthName,
            leads: metric?.leads_count || 0,
            highlighted: i === 0, // Highlight current month
          });
        }

        // Calculate total MOVQL for current period (last 7 days)
        const currentMonthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const currentMovqlMetric = movqlMetrics?.find(m => m.month_year === currentMonthYear);
        const currentMovqlCount = currentMovqlMetric?.leads_count || 0;

        // Recalculate current IMOVI with real MOVQL data
        const currentImoviData = calculateImovi({
          views: Math.round(avgViews),
          retention: avgRetention,
          interactions: totalInteractions,
          movql: currentMovqlCount,
        });
        const currentImovi = currentImoviData.score;

        // Garantir array de 8 meses (preencher vazios se necessário)
        const months = ['Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const imoviHistoryComplete = months.map(month => {
          const existing = imoviHistory.find(h => h.month === month);
          return existing || { month, value: 0, highlighted: false };
        });

        // Marcar o mês mais recente como highlighted
        if (imoviHistoryComplete.length > 0) {
          const lastNonZeroIndex = imoviHistoryComplete.reduce(
            (idx, item, i) => (item.value > 0 ? i : idx),
            -1
          );
          if (lastNonZeroIndex >= 0) {
            imoviHistoryComplete[lastNonZeroIndex].highlighted = true;
          }
        }

        setData({
          posts: fetchedPosts,
          totalPosts,
          totalEngagement,
          totalReach,
          totalLikes,
          totalComments,
          totalSaves,
          avgEngagementRate,
          previousPeriodData: {
            totalReach: previousTotalReach,
            totalEngagement: previousTotalEngagement,
            totalLikes: previousTotalLikes,
            totalComments: previousTotalComments,
            totalSaves: previousTotalSaves,
            avgEngagementRate: previousAvgEngagementRate,
          },
          imoviHistory: imoviHistoryComplete,
          movqlData: movqlDataProcessed,
          currentImovi,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Erro ao carregar dados',
        }));
      }
    };

    fetchDashboardData();
  }, []);

  return data;
};
