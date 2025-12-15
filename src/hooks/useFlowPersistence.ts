import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Node, Edge } from '@xyflow/react';

export const useFlowPersistence = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const saveWorkflow = async (name: string, nodes: Node[], edges: Edge[], workflowId?: string) => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const payload = {
                name,
                nodes: JSON.parse(JSON.stringify(nodes)), // Ensure clean JSON
                edges: JSON.parse(JSON.stringify(edges)),
                user_id: user.id,
                updated_at: new Date().toISOString(),
            };

            let error;
            if (workflowId) {
                // Using type assertion for tables not in types.ts
                const { error: updateError } = await (supabase
                    .from('workflows' as any) as any)
                    .update(payload)
                    .eq('id', workflowId);
                error = updateError;
            } else {
                // Using type assertion for tables not in types.ts
                const { error: insertError } = await (supabase
                    .from('workflows' as any) as any)
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            toast({
                title: "Sucesso",
                description: "Fluxo salvo com sucesso!",
            });
            return true;
        } catch (error: any) {
            console.error('Error saving workflow:', error);
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive",
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const loadWorkflows = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Using type assertion for tables not in types.ts
            const { data, error } = await (supabase
                .from('workflows' as any) as any)
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error: any) {
            console.error('Error loading workflows:', error);
            toast({
                title: "Erro ao carregar",
                description: error.message,
                variant: "destructive",
            });
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    return {
        saveWorkflow,
        loadWorkflows,
        isLoading
    };
};