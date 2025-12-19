import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Activity {
  id: string;
  user_id: string;
  tipo: string;
  titulo: string;
  descricao: string | null;
  data: string | null;
  metadata: any;
  created_at: string | null;
  user_email?: string;
  user_nome?: string;
}

export function useAdminActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      // Get all activities - using type assertion for tables not in types.ts
      const { data: activitiesData, error: activitiesError } = await (supabase
        .from("client_activities" as any) as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (activitiesError) throw activitiesError;

      // Get all users for mapping
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, email, nome");

      if (usersError) throw usersError;

      // Map users to activities
      const activitiesWithUsers = (activitiesData || []).map((activity: any) => {
        const user = usersData?.find(u => u.id === activity.user_id);
        return {
          ...activity,
          user_email: user?.email || "Desconhecido",
          user_nome: user?.nome || "Sem nome"
        };
      });

      setActivities(activitiesWithUsers as Activity[]);
    } catch (error) {
      console.error("Error loading activities:", error);
      toast.error("Erro ao carregar atividades");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  return { activities, isLoading, loadActivities };
}