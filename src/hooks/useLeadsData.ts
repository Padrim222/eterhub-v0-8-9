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

// Dados de exemplo (DEMO)
const mockIcps: ICP[] = [
  { id: "1", name: "ICP 1 - Empresários", color: "#3b82f6", position: 0 },
  { id: "2", name: "ICP 2 - Profissionais Liberais", color: "#10b981", position: 1 },
  { id: "3", name: "ICP 3 - Investidores", color: "#f59e0b", position: 2 },
];

const mockLeads: Lead[] = [
  {
    id: "1",
    icp_id: "1",
    name: "Maria Silva",
    email: "maria.silva@email.com",
    phone: "(11) 98765-4321",
    source_channel: "Instagram",
    income: 15000,
    qualification_score: 85,
    engagement_score: 92,
    lead_score: 88.5,
    is_qualified: true,
    position: 0,
  },
  {
    id: "2",
    icp_id: "1",
    name: "João Santos",
    email: "joao.santos@email.com",
    phone: "(11) 91234-5678",
    source_channel: "Facebook",
    income: 12000,
    qualification_score: 78,
    engagement_score: 85,
    lead_score: 81.5,
    is_qualified: true,
    position: 1,
  },
  {
    id: "3",
    icp_id: "2",
    name: "Ana Paula Costa",
    email: "ana.costa@email.com",
    phone: "(21) 99876-5432",
    source_channel: "Instagram",
    income: 20000,
    qualification_score: 95,
    engagement_score: 88,
    lead_score: 91.5,
    is_qualified: true,
    position: 0,
  },
  {
    id: "4",
    icp_id: "2",
    name: "Carlos Eduardo",
    email: "carlos.edu@email.com",
    phone: "(21) 98765-1234",
    source_channel: "LinkedIn",
    income: 18000,
    qualification_score: 65,
    engagement_score: 70,
    lead_score: 67.5,
    is_qualified: false,
    position: 1,
  },
  {
    id: "5",
    icp_id: "3",
    name: "Fernanda Lima",
    email: "fernanda.lima@email.com",
    phone: "(11) 97654-3210",
    source_channel: "Instagram",
    income: 25000,
    qualification_score: 90,
    engagement_score: 95,
    lead_score: 92.5,
    is_qualified: true,
    position: 0,
  },
  {
    id: "6",
    icp_id: "3",
    name: "Ricardo Mendes",
    email: "ricardo.mendes@email.com",
    phone: "(11) 96543-2109",
    source_channel: "WhatsApp",
    income: 22000,
    qualification_score: 88,
    engagement_score: 82,
    lead_score: 85,
    is_qualified: true,
    position: 1,
  },
];

export const useLeadsData = () => {
  const [icps, setIcps] = useState<ICP[]>(mockIcps);
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [metrics, setMetrics] = useState<LeadsMetrics>({
    totalLeads: mockLeads.length,
    totalQualified: mockLeads.filter(l => l.is_qualified).length,
    qualificationRate: (mockLeads.filter(l => l.is_qualified).length / mockLeads.length) * 100,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsLoading(false);
        return;
      }

      // Carregar ICPs
      const { data: icpsData, error: icpsError } = await supabase
        .from("icps" as any)
        .select("*")
        .order("position");

      if (icpsError) {
        console.log("Usando dados demo para ICPs");
        setIsLoading(false);
        return;
      }

      // Carregar Leads
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads" as any)
        .select("*")
        .order("position");

      if (leadsError) {
        console.log("Usando dados demo para Leads");
        setIsLoading(false);
        return;
      }

      // Se houver dados do banco, usar eles
      if (icpsData && icpsData.length > 0) {
        setIcps((icpsData || []) as unknown as ICP[]);
      }
      
      if (leadsData && leadsData.length > 0) {
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
      }
    } catch (error: any) {
      console.log("Usando dados demo devido a erro:", error.message);
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