import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { workflow_id, user_id } = await req.json();

        if (!workflow_id) {
            throw new Error('Workflow ID is required');
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 1. Fetch Workflow Data
        const { data: workflow, error: fetchError } = await supabase
            .from('workflows')
            .select('*')
            .eq('id', workflow_id)
            .single();

        if (fetchError || !workflow) {
            throw new Error('Workflow not found: ' + fetchError?.message);
        }

        // 2. Create Execution Record
        const { data: execution, error: createError } = await supabase
            .from('workflow_executions')
            .insert([
                {
                    workflow_id,
                    status: 'running',
                    logs: [{ message: 'Execution started', timestamp: new Date().toISOString() }]
                }
            ])
            .select()
            .single();

        if (createError) throw createError;

        // 3. Parse and Validate Workflow
        const nodes = workflow.nodes as any[];
        const edges = workflow.edges as any[];

        // 4. Simulate Execution (Linear)
        const logs: any[] = [];
        const executionContext: Record<string, any> = {};

        logs.push({ timestamp: new Date(), message: 'Starting execution...' });

        // Fetch Brand Identity if needed
        let brandIdentity = null;
        if (user_id) {
            const { data: identityData } = await supabase
                .from('brand_identities')
                .select('*')
                .eq('user_id', user_id)
                .limit(1)
                .maybeSingle();
            if (identityData) brandIdentity = identityData;
        }

        // Topological sort or simple linear iteration if assumes chain
        // For MVP, we iterate edges to find next node
        let currentNodeId = nodes.find((n: any) => n.type === 'trigger')?.id;

        while (currentNodeId) {
            const node = nodes.find((n: any) => n.id === currentNodeId);
            if (!node) break;

            logs.push({ timestamp: new Date(), message: `Executing node: ${node.data.label} (${node.type})` });

            if (node.type === 'trigger') {
                executionContext[node.id] = { triggered: true, timestamp: new Date() };
                logs.push({ timestamp: new Date(), message: `Trigger fired.` });
            } else if (node.type === 'prompt') {
                executionContext[node.id] = node.data.prompt;
                logs.push({ timestamp: new Date(), message: `Prompt processed: "${node.data.prompt?.substring(0, 20)}..."` });
            } else if (node.type === 'agent') {
                const inputData = Object.values(executionContext).pop(); // Simple: take last output

                let systemPrompt = node.data.systemPrompt || 'You are a helpful assistant.';
                const agentRole = node.data.agentRole || 'generic';

                // SPECIAL LOGIC: Personalizer Agent
                if (agentRole === 'personalizer' && brandIdentity) {
                    logs.push({ timestamp: new Date(), message: `Applying Brand Identity: ${brandIdentity.name}` });
                    const identityContext = `
                  \n\n--- BRAND IDENTITY (MANUAL DO MOVIMENTO) ---
                  Name: ${brandIdentity.name}
                  Tone of Voice: ${brandIdentity.tone_of_voice || 'Neutral'}
                  Key Terms: ${brandIdentity.key_terms?.join(', ') || 'None'}
                  Beliefs: ${brandIdentity.beliefs || 'None'}
                  Avoid Terms: ${brandIdentity.avoid_terms?.join(', ') || 'None'}
                  --------------------------------------------
                  `;
                    systemPrompt += identityContext;
                }

                // Mock AI Call
                const mockResponse = `[${node.data.model || 'AI'}] Response to: "${inputData}"\nBased on system prompt: "${systemPrompt.substring(0, 30)}..."`;

                executionContext[node.id] = mockResponse;
                logs.push({ timestamp: new Date(), message: `Agent generated response.` });

                // Add random delay to simulate AI processing
                await new Promise(r => setTimeout(r, 1000));
            } else if (node.type === 'output') {
                const finalResult = Object.values(executionContext).pop();
                logs.push({ timestamp: new Date(), message: `FINAL RESULT: ${finalResult}` });

                // Update the Execution Record with success
                await supabase
                    .from('workflow_executions')
                    .update({
                        status: 'completed',
                        logs: logs as any,
                        completed_at: new Date().toISOString()
                    })
                    .eq('id', execution.id);

                return new Response(
                    JSON.stringify({ success: true, executionId: execution.id, logs, result: finalResult }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            // Find next node
            const edge = edges.find((e: any) => e.source === currentNodeId);
            currentNodeId = edge ? edge.target : null;
        }

        return new Response(JSON.stringify({ success: true, executionId: execution.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Error executing workflow:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
