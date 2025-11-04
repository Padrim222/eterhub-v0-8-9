import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, subWeeks, subMonths, startOfWeek, startOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";

export interface Campaign {
  id: string;
  name: string;
  color: string;
  data: CampaignDataPoint[];
}

export interface CampaignDataPoint {
  date: string;
  leads: number;
}

export interface AverageDataPoint {
  date: string;
  average: number;
}

export type PeriodFilter = "week" | "month" | "year";

// Mock data generator
const generateMockData = (periodFilter: PeriodFilter) => {
  const { startDate, endDate } = getDateRange(periodFilter);
  let intervals: Date[];

  switch (periodFilter) {
    case "week":
      intervals = eachDayOfInterval({ start: startDate, end: endDate });
      return intervals.map(date => ({
        date: format(date, "dd/MM"),
        leads: Math.floor(Math.random() * 15 + 5)
      }));
    
    case "month":
      intervals = eachDayOfInterval({ start: startDate, end: endDate });
      return intervals.map(date => ({
        date: format(date, "dd/MM"),
        leads: Math.floor(Math.random() * 20 + 10)
      }));
    
    case "year":
      intervals = eachMonthOfInterval({ start: startDate, end: endDate });
      return intervals.map(date => ({
        date: format(date, "MMM/yy"),
        leads: Math.floor(Math.random() * 200 + 100)
      }));
    
    default:
      return [];
  }
};

const getDateRange = (period: PeriodFilter) => {
  const today = new Date();
  let startDate: Date;
  
  switch (period) {
    case "week":
      startDate = subWeeks(today, 1);
      break;
    case "month":
      startDate = subMonths(today, 1);
      break;
    case "year":
      startDate = subMonths(today, 12);
      break;
    default:
      startDate = subMonths(today, 1);
  }
  
  return { startDate, endDate: today };
};

const mockCampaigns: Campaign[] = [
  {
    id: "campaign-1",
    name: "Campanha 1",
    color: "#ef4444",
    data: []
  },
  {
    id: "campaign-2",
    name: "Campanha 2",
    color: "#22c55e",
    data: []
  },
  {
    id: "campaign-3",
    name: "Campanha 3",
    color: "#f59e0b",
    data: []
  }
];

export const useCampaignsData = (periodFilter: PeriodFilter = "month") => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [averageLine, setAverageLine] = useState<AverageDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, [periodFilter]);


  const aggregateDataByPeriod = (data: any[], period: PeriodFilter) => {
    if (!data.length) return [];

    const { startDate, endDate } = getDateRange(period);
    let intervals: Date[];

    switch (period) {
      case "week":
        intervals = eachDayOfInterval({ start: startDate, end: endDate });
        return intervals.map(date => {
          const dateStr = format(date, "yyyy-MM-dd");
          const dayData = data.filter(d => d.date === dateStr);
          return {
            date: format(date, "dd/MM"),
            leads: dayData.reduce((sum, d) => sum + d.leads_count, 0)
          };
        });
      
      case "month":
        intervals = eachDayOfInterval({ start: startDate, end: endDate });
        return intervals.map(date => {
          const dateStr = format(date, "yyyy-MM-dd");
          const dayData = data.filter(d => d.date === dateStr);
          return {
            date: format(date, "dd/MM"),
            leads: dayData.reduce((sum, d) => sum + d.leads_count, 0)
          };
        });
      
      case "year":
        intervals = eachMonthOfInterval({ start: startDate, end: endDate });
        return intervals.map(date => {
          const monthStart = format(date, "yyyy-MM");
          const monthData = data.filter(d => d.date.startsWith(monthStart));
          return {
            date: format(date, "MMM/yy"),
            leads: monthData.reduce((sum, d) => sum + d.leads_count, 0)
          };
        });
      
      default:
        return [];
    }
  };

  const calculateAverage = (campaignsData: Campaign[]): AverageDataPoint[] => {
    if (!campaignsData.length) return [];

    const allDates = new Set<string>();
    campaignsData.forEach(campaign => {
      campaign.data.forEach(point => allDates.add(point.date));
    });

    return Array.from(allDates).sort().map(date => {
      const totalLeads = campaignsData.reduce((sum, campaign) => {
        const point = campaign.data.find(p => p.date === date);
        return sum + (point?.leads || 0);
      }, 0);
      
      return {
        date,
        average: totalLeads / campaignsData.length
      };
    });
  };

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Use mock data if no session or if database has no campaigns
      if (!session) {
        const mockCampaignsWithData = mockCampaigns.map(campaign => ({
          ...campaign,
          data: generateMockData(periodFilter)
        }));
        setCampaigns(mockCampaignsWithData);
        setAverageLine(calculateAverage(mockCampaignsWithData));
        setIsLoading(false);
        return;
      }

      const { startDate } = getDateRange(periodFilter);
      const startDateStr = format(startDate, "yyyy-MM-dd");

      // Fetch campaigns
      const { data: campaignsData, error: campaignsError } = await (supabase as any)
        .from("campaigns")
        .select("*")
        .eq("user_id", session.user.id);

      if (campaignsError) throw campaignsError;

      // If no campaigns in database, use mock data
      if (!campaignsData || campaignsData.length === 0) {
        const mockCampaignsWithData = mockCampaigns.map(campaign => ({
          ...campaign,
          data: generateMockData(periodFilter)
        }));
        setCampaigns(mockCampaignsWithData);
        setAverageLine(calculateAverage(mockCampaignsWithData));
        setIsLoading(false);
        return;
      }

      // Fetch campaign data for each campaign
      const campaignsWithData = await Promise.all(
        ((campaignsData as any[]) || []).map(async (campaign: any) => {
          const { data: dataPoints, error: dataError } = await (supabase as any)
            .from("campaign_data")
            .select("*")
            .eq("campaign_id", campaign.id)
            .gte("date", startDateStr)
            .order("date", { ascending: true });

          if (dataError) throw dataError;

          return {
            id: campaign.id,
            name: campaign.name,
            color: campaign.color,
            data: aggregateDataByPeriod((dataPoints as any[]) || [], periodFilter)
          };
        })
      );

      setCampaigns(campaignsWithData);
      setAverageLine(calculateAverage(campaignsWithData));
    } catch (error) {
      console.error("Error loading campaigns:", error);
      // Fallback to mock data on error
      const mockCampaignsWithData = mockCampaigns.map(campaign => ({
        ...campaign,
        data: generateMockData(periodFilter)
      }));
      setCampaigns(mockCampaignsWithData);
      setAverageLine(calculateAverage(mockCampaignsWithData));
    } finally {
      setIsLoading(false);
    }
  };

  const addCampaign = async (name: string, color: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await (supabase as any)
        .from("campaigns")
        .insert([{ user_id: session.user.id, name, color }])
        .select()
        .single();

      if (error) throw error;

      await loadCampaigns();
    } catch (error) {
      console.error("Error adding campaign:", error);
    }
  };

  return {
    campaigns,
    averageLine,
    isLoading,
    addCampaign,
    reload: loadCampaigns
  };
};
