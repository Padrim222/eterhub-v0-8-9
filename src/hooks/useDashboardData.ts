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
  // New metrics for breakdown
  growthPercent: number;
  leadsPercent: number;
  engagementPercent: number;
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
    movqlData: [],
    currentImovi: 0,
    growthPercent: 0,
    leadsPercent: 0,
    engagementPercent: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Usuário não autenticado');
        }

        // Fetch posts from last 240 days (8 months) for complete history
        const eightMonthsAgo = new Date();
        eightMonthsAgo.setDate(eightMonthsAgo.getDate() - 240);

        const { data: allPosts, error: postsError } = await supabase
          .from('ig_posts')
          .select('*')
          .eq('user_id', session.user.id)
          .gte('published_at', eightMonthsAgo.toISOString())
          .order('published_at', { ascending: false });

        if (postsError) throw postsError;

        const fetchedPosts = allPosts || [];

        // Filter posts for last 30 days metrics
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentPosts = fetchedPosts.filter(
          post => new Date(post.published_at) >= thirtyDaysAgo
        );

        // Calculate totals for recent period
        const totalPosts = recentPosts.length;
        const totalEngagement = recentPosts.reduce(
          (sum, post) => sum + ((post.likes || 0) + (post.comments || 0) + (post.saves || 0)),
          0
        );
        const totalReach = recentPosts.reduce((sum, post) => sum + (post.views || 0), 0);
        const totalLikes = recentPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
        const totalComments = recentPosts.reduce((sum, post) => sum + (post.comments || 0), 0);
        const totalSaves = recentPosts.reduce((sum, post) => sum + (post.saves || 0), 0);

        // Calculate average engagement rate (dynamic calculation if null)
        const avgEngagementRate = recentPosts.length > 0
          ? recentPosts.reduce((sum, post) => {
              // Calculate dynamically if engagement_rate is null
              const rate = post.engagement_rate ?? 
                (post.views > 0 ? ((post.likes + post.comments + post.saves) / post.views) * 100 : 0);
              return sum + rate;
            }, 0) / recentPosts.length
          : 0;

        // Previous period (30-60 days ago)
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const previousPosts = fetchedPosts.filter(
          post => {
            const date = new Date(post.published_at);
            return date >= sixtyDaysAgo && date < thirtyDaysAgo;
          }
        );

        const previousTotalEngagement = previousPosts.reduce(
          (sum, post) => sum + ((post.likes || 0) + (post.comments || 0) + (post.saves || 0)),
          0
        );
        const previousTotalReach = previousPosts.reduce((sum, post) => sum + (post.views || 0), 0);
        const previousTotalLikes = previousPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
        const previousTotalComments = previousPosts.reduce((sum, post) => sum + (post.comments || 0), 0);
        const previousTotalSaves = previousPosts.reduce((sum, post) => sum + (post.saves || 0), 0);
        const previousAvgEngagementRate = previousPosts.length > 0
          ? previousPosts.reduce((sum, post) => {
              const rate = post.engagement_rate ?? 
                (post.views > 0 ? ((post.likes + post.comments + post.saves) / post.views) * 100 : 0);
              return sum + rate;
            }, 0) / previousPosts.length
          : 0;

        // Calculate growth percentage (reach growth)
        let growthPercent = 0;
        if (previousTotalReach > 0) {
          growthPercent = ((totalReach - previousTotalReach) / previousTotalReach) * 100;
        } else if (totalReach > 0) {
          growthPercent = 100; // If no previous data but has current, show 100% growth
        }

        // Fetch leads data for leads percentage
        const { data: leadsData } = await supabase
          .from('leads')
          .select('is_qualified')
          .eq('user_id', session.user.id);

        const totalLeads = leadsData?.length || 0;
        const qualifiedLeads = leadsData?.filter(l => l.is_qualified).length || 0;
        const leadsPercent = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;

        // Engagement percentage (normalized to 0-100 scale)
        const engagementPercent = Math.min(avgEngagementRate * 10, 100); // Scale up since engagement rates are usually low

        // Generate dynamic month names for last 8 months
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const now = new Date();
        const currentMonth = now.getMonth();
        
        const dynamicMonths: string[] = [];
        for (let i = 7; i >= 0; i--) {
          const monthIndex = (currentMonth - i + 12) % 12;
          dynamicMonths.push(monthNames[monthIndex]);
        }

        // Group posts by month for IMOVI history
        const monthlyData = new Map<string, Post[]>();
        fetchedPosts.forEach(post => {
          if (!post.published_at) return;
          const date = new Date(post.published_at);
          const monthIndex = date.getMonth();
          const monthName = monthNames[monthIndex];

          if (!monthlyData.has(monthName)) {
            monthlyData.set(monthName, []);
          }
          monthlyData.get(monthName)?.push(post);
        });

        // Calculate IMOVI for each month in the dynamic range
        const imoviHistory = dynamicMonths.map((month, index) => {
          const monthPosts = monthlyData.get(month) || [];
          
          if (monthPosts.length === 0) {
            return { month, value: 0, highlighted: index === 7 };
          }

          const avgViews = monthPosts.reduce((sum, p) => sum + (p.views || 0), 0) / monthPosts.length;
          const avgRetention = monthPosts.reduce((sum, p) => {
            const rate = p.engagement_rate ?? 
              (p.views > 0 ? ((p.likes + p.comments + p.saves) / p.views) * 100 : 0);
            return sum + rate;
          }, 0) / monthPosts.length;
          const totalInteractions = monthPosts.reduce(
            (sum, p) => sum + ((p.likes || 0) + (p.comments || 0) + (p.saves || 0)),
            0
          );

          // Calculate IMOVI without MOVQL dependency for historical data
          const imovi = calculateImovi({
            views: Math.round(avgViews),
            retention: avgRetention,
            interactions: totalInteractions,
            movql: 0,
          });

          return {
            month,
            value: imovi.score,
            highlighted: index === 7, // Last month is highlighted
          };
        });

        // Fetch MOVQL metrics
        const { data: movqlMetrics } = await supabase
          .from('movql_metrics' as any)
          .select('*')
          .eq('user_id', session.user.id)
          .order('month_year', { ascending: true });

        const typedMovqlMetrics = (movqlMetrics || []) as unknown as Array<{ 
          month_year: string; 
          leads_count: number; 
          qualified_count: number 
        }>;

        // Process MOVQL data for display
        const fullMonthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const movqlDataProcessed = [];

        for (let i = 4; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthName = fullMonthNames[date.getMonth()];

          const metric = typedMovqlMetrics.find(m => m.month_year === monthYear);
          movqlDataProcessed.push({
            month: monthName,
            leads: metric?.leads_count || 0,
            highlighted: i === 0,
          });
        }

        // Calculate current IMOVI (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const weeklyPosts = recentPosts.filter(
          post => new Date(post.published_at) >= sevenDaysAgo
        );

        const weeklyAvgViews = weeklyPosts.length > 0
          ? weeklyPosts.reduce((sum, p) => sum + (p.views || 0), 0) / weeklyPosts.length
          : recentPosts.length > 0
            ? recentPosts.reduce((sum, p) => sum + (p.views || 0), 0) / recentPosts.length
            : 0;

        const weeklyAvgRetention = weeklyPosts.length > 0
          ? weeklyPosts.reduce((sum, p) => {
              const rate = p.engagement_rate ?? 
                (p.views > 0 ? ((p.likes + p.comments + p.saves) / p.views) * 100 : 0);
              return sum + rate;
            }, 0) / weeklyPosts.length
          : avgEngagementRate;

        const weeklyInteractions = weeklyPosts.length > 0
          ? weeklyPosts.reduce((sum, p) => sum + ((p.likes || 0) + (p.comments || 0) + (p.saves || 0)), 0)
          : totalEngagement;

        // Get current month MOVQL
        const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const currentMovqlMetric = typedMovqlMetrics.find(m => m.month_year === currentMonthYear);
        const currentMovqlCount = currentMovqlMetric?.leads_count || qualifiedLeads;

        // Calculate current IMOVI with all available data
        const currentImoviData = calculateImovi({
          views: Math.round(weeklyAvgViews),
          retention: weeklyAvgRetention,
          interactions: weeklyInteractions,
          movql: currentMovqlCount,
        });

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
          imoviHistory,
          movqlData: movqlDataProcessed,
          currentImovi: currentImoviData.score,
          growthPercent: Math.round(growthPercent),
          leadsPercent: Math.round(leadsPercent),
          engagementPercent: Math.round(engagementPercent),
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
