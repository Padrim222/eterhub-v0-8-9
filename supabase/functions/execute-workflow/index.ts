import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

import { generatePerformancePrompt } from "./agents/agent-1-observer.ts";
import { generateIdeationPrompt } from "./agents/agent-2-ideation.ts";
import { generateResearchPrompt } from "./agents/agent-3-research.ts";
import { generateArchitectPrompt } from "./agents/agent-4-architect.ts";
import { generateWriterPrompt } from "./agents/agent-5-writer.ts";

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
                const inputData = Object.values(executionContext).pop() || "No input";

                let systemPrompt = "You are a helpful assistant.";
                const agentRole = node.data.agentRole || 'generic';
                let contextData = node.data.contextData || "";

                // --- AGENT ROUTING ---
                switch (agentRole) {
                    case 'observer': // Agent 1
                        logs.push({ timestamp: new Date(), message: `[Observer] Starting Performance Analysis...` });
                        systemPrompt = generatePerformancePrompt(inputData);
                        break;

                    case 'strategist': // Agent 2 (Ideation)
                        logs.push({ timestamp: new Date(), message: `[Strategist] Starting Ideation & Trends...` });
                        systemPrompt = generateIdeationPrompt(inputData, contextData);
                        break;

                    case 'researcher': // Agent 3
                        logs.push({ timestamp: new Date(), message: `[Researcher] Starting Deep Research...` });
                        systemPrompt = generateResearchPrompt(inputData);
                        break;

                    case 'architect': // Agent 4
                        logs.push({ timestamp: new Date(), message: `[Architect] Structuring Narrative...` });
                        // Simple parsing if contextData is JSON, otherwise pass as is
                        let contentMap = contextData;
                        let format = "Generic";
                        try {
                            const parsed = JSON.parse(contextData);
                            if (parsed.contentMap) contentMap = parsed.contentMap;
                            if (parsed.format) format = parsed.format;
                        } catch (e) { }
                        systemPrompt = generateArchitectPrompt(inputData, contentMap, format);
                        break;

                    case 'copywriter': // Agent 5 (Writer)
                    case 'personalizer':
                        logs.push({ timestamp: new Date(), message: `[Writer] Drafting Final Content...` });
                        let scriptSkeleton = inputData;
                        let toneGuide = "Neutral";
                        if (brandIdentity) {
                            toneGuide = `Name: ${brandIdentity.name}\nTone: ${brandIdentity.tone_of_voice}\nKey Terms: ${brandIdentity.key_terms?.join(', ')}`;
                        }
                        systemPrompt = generateWriterPrompt(inputData, scriptSkeleton, toneGuide);
                        break;

                    default:
                        systemPrompt = `You are a helpful assistant. Role: ${agentRole}. Task: ${inputData}`;
                }


                // Real AI Call
                let finalOutput = "";
                const openAiKey = Deno.env.get('OPENAI_API_KEY');
                const baseUrl = Deno.env.get('OPENAI_BASE_URL') || "https://api.openai.com/v1";
                const model = Deno.env.get('OPENAI_MODEL') || "gpt-4o-mini";

                if (openAiKey) {
                    try {
                        logs.push({ timestamp: new Date(), message: `[${agentRole}] Calling AI Model... (${model})` });

                        const response = await fetch(`${baseUrl}/chat/completions`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${openAiKey}`,
                                "HTTP-Referer": "https://eterhub.app",
                                "X-Title": "EterHub Agent"
                            },
                            body: JSON.stringify({
                                model: model,
                                messages: [
                                    { role: "system", content: systemPrompt },
                                    { role: "user", content: inputData || "Proceed." }
                                ],
                                temperature: 0.7
                            })
                        });

                        if (!response.ok) {
                            const errText = await response.text();
                            throw new Error(`AI Provider API error: ${errText}`);
                        }

                        const data = await response.json();
                        finalOutput = data.choices[0].message.content;

                        logs.push({ timestamp: new Date(), message: `[${agentRole}] AI Response received.` });
                    } catch (aiError: any) {
                        logs.push({ timestamp: new Date(), message: `ERROR calling AI: ${aiError.message}. Falling back to mock.` });
                        finalOutput = `[Error: ${aiError.message}] \n\n (Mock Fallback) \n` +
                            `### ${agentRole.toUpperCase()} OUTPUT\n` +
                            `(Simulated content based on input...)`;
                    }
                } else {
                    logs.push({ timestamp: new Date(), message: `WARNING: OPENAI_API_KEY not set. Using simulation.` });
                    finalOutput = `[Simulation] Agent ${agentRole} processed inputs.`;
                }

                // Store output for next node
                executionContext[node.id] = finalOutput;

                // Add variable delay based on complexity (only for mock feeling or rate limit safety)
                if (!openAiKey) {
                    const delay = agentRole === 'researcher' ? 2000 : 1000;
                    await new Promise(r => setTimeout(r, delay));
                }
            } else if (node.type === 'output') {
                const finalResult = Object.values(executionContext).pop();
                logs.push({ timestamp: new Date(), message: `FINAL RESULT: ${finalResult} ` });

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
});
