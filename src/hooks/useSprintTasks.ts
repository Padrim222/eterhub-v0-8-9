import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SprintTask {
  id: string;
  user_id: string;
  sprint_id: string;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  position: number;
  created_at: string;
  updated_at: string;
}

export interface SprintTaskStats {
  total: number;
  completed: number;
  remaining: number;
  progressPercent: number;
}

export const useSprintTasks = (sprintId: string | null) => {
  const [tasks, setTasks] = useState<SprintTask[]>([]);
  const [stats, setStats] = useState<SprintTaskStats>({
    total: 0,
    completed: 0,
    remaining: 0,
    progressPercent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (sprintId) {
      loadTasks();
    } else {
      setTasks([]);
      setStats({ total: 0, completed: 0, remaining: 0, progressPercent: 0 });
      setIsLoading(false);
    }
  }, [sprintId]);

  const loadTasks = async () => {
    if (!sprintId) return;

    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('sprint_tasks')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('sprint_id', sprintId)
        .order('position');

      if (error) throw error;

      const fetchedTasks = data || [];
      setTasks(fetchedTasks);

      // Calculate stats
      const total = fetchedTasks.length;
      const completed = fetchedTasks.filter(t => t.status === 'completed').length;
      const remaining = total - completed;
      const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

      setStats({ total, completed, remaining, progressPercent });
    } catch (error: any) {
      console.error('Erro ao carregar tarefas do sprint:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as tarefas do sprint.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (name: string, description?: string) => {
    if (!sprintId) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('sprint_tasks')
        .insert([{
          user_id: session.user.id,
          sprint_id: sprintId,
          name,
          description,
          position: tasks.length,
        }]);

      if (error) throw error;

      await loadTasks();
      toast({
        title: 'Tarefa adicionada',
        description: 'A tarefa foi adicionada com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao adicionar tarefa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a tarefa.',
        variant: 'destructive',
      });
    }
  };

  const updateTaskStatus = async (taskId: string, status: SprintTask['status']) => {
    try {
      const { error } = await supabase
        .from('sprint_tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;

      await loadTasks();
    } catch (error: any) {
      console.error('Erro ao atualizar status da tarefa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status da tarefa.',
        variant: 'destructive',
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('sprint_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      await loadTasks();
      toast({
        title: 'Tarefa removida',
        description: 'A tarefa foi removida com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao remover tarefa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a tarefa.',
        variant: 'destructive',
      });
    }
  };

  return {
    tasks,
    stats,
    isLoading,
    addTask,
    updateTaskStatus,
    deleteTask,
    refetch: loadTasks,
  };
};
