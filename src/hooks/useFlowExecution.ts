import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFlowExecution = () => {
    const { toast } = useToast();
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionLogs, setExecutionLogs] = useState<any[]>([]);

    const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');

    const runWorkflow = async (workflowId: string) => {
        setIsExecuting(true);
        setExecutionStatus('running');
        setExecutionLogs([]);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // 1. Trigger the execution via Edge Function
            const { data, error } = await supabase.functions.invoke('execute-workflow', {
                body: { workflow_id: workflowId, user_id: user.id }
            });

            if (error) throw error;

            console.log('Execution started:', data);
            toast({
                title: "Execução Iniciada",
                description: "O fluxo está sendo processado...",
            });

            // 2. Poll for logs (Simple implementation for now)
            if (data.executionId) {
                pollExecutionLogs(data.executionId);
            }

        } catch (error: any) {
            console.error('Error executing workflow:', error);
            toast({
                title: "Erro na execução",
                description: error.message,
                variant: "destructive",
            });
            setIsExecuting(false);
            setExecutionStatus('failed');
        }
    };

    const pollExecutionLogs = async (executionId: string) => {
        const interval = setInterval(async () => {
            const { data, error } = await supabase
                .from('workflow_executions')
                .select('status, logs')
                .eq('id', executionId)
                .single();

            if (data) {
                setExecutionLogs(data.logs as any[] || []);
                if (data.status === 'completed' || data.status === 'failed') {
                    clearInterval(interval);
                    setIsExecuting(false);
                    setExecutionStatus(data.status);
                    toast({
                        title: data.status === 'completed' ? "Execução Concluída" : "Falha na Execução",
                        description: "Verifique os logs para mais detalhes.",
                        variant: data.status === 'completed' ? "default" : "destructive",
                    });
                }
            } else if (error) {
                console.error('Error polling logs:', error);
            }
        }, 1500); // Poll every 1.5 seconds
    };

    return {
        runWorkflow,
        isExecuting,
        executionLogs,
        executionStatus
    };
};
