import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ICP {
  id: string;
  name: string;
  color: string;
  position: number;
}

interface Lead {
  id: string;
  icp_id: string | null;
  name: string;
  email?: string;
  phone?: string;
  source_channel?: string;
  income?: number;
  qualification_score: number;
  engagement_score: number;
  lead_score: number;
  is_qualified: boolean;
  position: number;
}

interface LeadsMetrics {
  totalLeads: number;
  totalQualified: number;
  qualificationRate: number;
}

export const useLeadsData = () => {
  const [icps, setIcps] = useState<ICP[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<LeadsMetrics>({
    totalLeads: 0,
    totalQualified: 0,
    qualificationRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return;
      }

      // Carregar ICPs
      const { data: icpsData, error: icpsError } = await supabase
        .from("icps" as any)
        .select("*")
        .order("position");

      if (icpsError) throw icpsError;

      // Carregar Leads
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads" as any)
        .select("*")
        .order("position");

      if (leadsError) throw leadsError;

      setIcps((icpsData || []) as unknown as ICP[]);
      setLeads((leadsData || []) as unknown as Lead[]);

      // Calcular métricas
      const totalLeads = leadsData?.length || 0;
      const totalQualified = leadsData?.filter((l: any) => l.is_qualified).length || 0;
      const qualificationRate = totalLeads > 0 ? (totalQualified / totalLeads) * 100 : 0;

      setMetrics({
        totalLeads,
        totalQualified,
        qualificationRate,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    icps,
    leads,
    metrics,
    isLoading,
    refetch: loadData,
  };
};