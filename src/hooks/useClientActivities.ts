import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface Activity {
  id: string;
  tipo: "projeto" | "entrega" | "reuniao" | "comentario" | "alteracao";
  titulo: string;
  descricao: string | null;
  data: string;
  metadata: Record<string, unknown>;
}

export const useClientActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('client_activities')
        .select('*')
        .eq('user_id', session.user.id)
        .order('data', { ascending: false })
        .limit(50);

      if (error) throw error;

      setActivities(data?.map(item => ({
        id: item.id,
        tipo: item.tipo as Activity['tipo'],
        titulo: item.titulo,
        descricao: item.descricao,
        data: item.data,
        metadata: (item.metadata as Record<string, unknown>) || {},
      })) || []);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      toast.error('Erro ao carregar histórico');
    } finally {
      setIsLoading(false);
    }
  };

  const addActivity = async (activity: Omit<Activity, 'id'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Sessão não encontrada');
        return false;
      }

      const { error } = await supabase
        .from('client_activities')
        .insert([{
          user_id: session.user.id,
          tipo: activity.tipo,
          titulo: activity.titulo,
          descricao: activity.descricao,
          data: activity.data,
          metadata: activity.metadata as unknown as Json,
        }]);

      if (error) throw error;

      await loadActivities();
      return true;
    } catch (error) {
      console.error('Erro ao adicionar atividade:', error);
      return false;
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  return {
    activities,
    isLoading,
    addActivity,
    refetch: loadActivities,
  };
};
