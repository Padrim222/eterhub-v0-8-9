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
      // Get all activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("client_activities")
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
      const activitiesWithUsers = (activitiesData || []).map(activity => {
        const user = usersData?.find(u => u.id === activity.user_id);
        return {
          ...activity,
          user_email: user?.email || "Desconhecido",
          user_nome: user?.nome || "Sem nome"
        };
      });

      setActivities(activitiesWithUsers);
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
