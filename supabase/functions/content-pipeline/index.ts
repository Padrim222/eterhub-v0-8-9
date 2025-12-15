import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OpenRouter API Configuration
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Model Configuration per Agent
interface AgentConfig {
    model: string;
    displayName: string;
    temperature?: number;
    maxTokens?: number;
}

const AGENT_MODELS: Record<string, AgentConfig> = {
    'analysis': {
        model: 'openai/gpt-4o-mini',
        displayName: 'GPT-4o Mini',
        temperature: 0.3,
        maxTokens: 4096
    },
    'ideation': {
        model: 'openai/gpt-4o-mini',
        displayName: 'GPT-4o Mini',
        temperature: 0.8,
        maxTokens: 4096
    },
    'research': {
        model: 'openai/gpt-4o-mini',
        displayName: 'GPT-4o Mini',
        temperature: 0.5,
        maxTokens: 4096
    },
    'narrative': {
        model: 'anthropic/claude-3-haiku',
        displayName: 'Claude 3 Haiku',
        temperature: 0.6,
        maxTokens: 4096
    },
    'writing': {
        model: 'openai/gpt-4o-mini',
        displayName: 'GPT-4o Mini',
        temperature: 0.7,
        maxTokens: 4096
    }
};

const FALLBACK_MODEL: AgentConfig = {
    model: 'openai/gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    temperature: 0.7,
    maxTokens: 4096
};

// Simplified prompt generators
function getSystemPrompt(stageId: string, context: string, brandIdentity: any): string {
    const brandName = brandIdentity?.name || 'Cliente';
    const brandAudience = brandIdentity?.audience || 'Público geral';
    const brandMessage = brandIdentity?.message || 'Mensagem central';
    const brandTone = brandIdentity?.tone_of_voice || 'Profissional e envolvente';

    const prompts: Record<string, string> = {
        'analysis': `Você é um Analista de Performance de Social Media. Sua missão é analisar dados e identificar padrões de sucesso.

CONTEXTO: ${context || 'Dados de performance disponíveis.'}

TAREFA: Gere um relatório de inteligência de conteúdo identificando:
1. Os padrões dos 10 conteúdos de maior performance
2. Os gatilhos psicológicos mais efetivos (Emotional Arousal, Social Currency, Narrative Tension, etc.)
3. Recomendações acionáveis

Use formato Markdown com tabelas e listas.`,

        'ideation': `Você é um Estrategista de Conteúdo Viral especialista em identificar assuntos com alto potencial de viralização.

CLIENTE: ${brandName}
PÚBLICO: ${brandAudience}
MENSAGEM CENTRAL: ${brandMessage}
CONTEXTO ANTERIOR: ${context || 'Padrões de sucesso identificados.'}

TAREFA: Gere 10 temas de conteúdo viral com:
1. Título provocador
2. Justificativa estratégica
3. Gatilhos psicológicos que ativa
4. Score de potencial (0-10)

Use formato Markdown estruturado.`,

        'research': `Você é um Pesquisador Profundo especialista em coletar insumos para conteúdo de alto impacto.

TEMA: ${context || 'Tema a pesquisar'}

TAREFA: Crie um Mapa de Conteúdo com:
1. Dados numéricos de impacto (2-5 estatísticas)
2. Cases relevantes (2-3 exemplos)
3. Narrativas e metáforas
4. Objeções e medos do público
5. Conexão com gatilhos psicológicos

Use formato Markdown estruturado.`,

        'narrative': `Você é um Arquiteto de Narrativas especialista em estruturar histórias persuasivas.

TEMA: ${context || 'Tema aprovado'}
FORMATO: Carrossel de 8 slides ou Reels de 90 segundos

TAREFA: Crie um Esqueleto de Roteiro com:
1. Estrutura AIDA (Atenção, Interesse, Desejo, Ação)
2. Mapa de picos emocionais
3. Gatilho psicológico para cada bloco
4. Variações de ângulo narrativo

Use formato Markdown estruturado com tabelas.`,

        'writing': `Você é um Copywriter de Elite especialista em criar textos que geram ação.

TOM DE VOZ: ${brandTone}
CONTEXTO/ESQUELETO: ${context || 'Esqueleto do roteiro'}

TAREFA: Escreva o texto final do conteúdo:
1. Bloco 1: Hook (gancho magnético)
2. Bloco 2: Contextualização
3. Bloco 3: Identificação
4. Bloco 4: Solução/Insight
5. Bloco 5: CTA

Ao final, inclua STYLE CHECKER com notas de 0-10 para:
- Clareza
- Impacto do Gancho
- Fluidez
- Conexão Emocional
- Aderência ao Tom
- Força do CTA

Use formato Markdown.`
    };

    return prompts[stageId] || prompts['analysis'];
}

async function callOpenRouter(
    model: string,
    systemPrompt: string,
    userMessage: string,
    temperature: number = 0.7,
    maxTokens: number = 4096
): Promise<string> {
    const apiKey = Deno.env.get('OPENROUTER_API_KEY');

    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY not configured');
    }

    console.log(`Calling OpenRouter with model: ${model}`);

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://eterhub.app',
            'X-Title': 'EterHub Content Pipeline'
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            temperature: temperature,
            max_tokens: maxTokens
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenRouter API error (${response.status}): ${errorText}`);
        throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response from OpenRouter');
    }

    return data.choices[0].message.content;
}

async function callLLM(
    agentId: string,
    systemPrompt: string,
    userMessage: string
): Promise<{ output: string; model: string; displayName: string }> {
    const config = AGENT_MODELS[agentId] || FALLBACK_MODEL;

    try {
        console.log(`[${agentId}] Calling OpenRouter with model: ${config.model}`);

        const output = await callOpenRouter(
            config.model,
            systemPrompt,
            userMessage,
            config.temperature,
            config.maxTokens
        );

        return {
            output,
            model: config.model,
            displayName: config.displayName
        };
    } catch (error: any) {
        console.error(`[${agentId}] Primary model failed: ${error.message}`);

        // Try fallback model
        if (config.model !== FALLBACK_MODEL.model) {
            console.log(`[${agentId}] Trying fallback model: ${FALLBACK_MODEL.model}`);

            try {
                const output = await callOpenRouter(
                    FALLBACK_MODEL.model,
                    systemPrompt,
                    userMessage,
                    FALLBACK_MODEL.temperature,
                    FALLBACK_MODEL.maxTokens
                );

                return {
                    output,
                    model: FALLBACK_MODEL.model,
                    displayName: `${FALLBACK_MODEL.displayName} (fallback)`
                };
            } catch (fallbackError: any) {
                throw new Error(`Both primary and fallback models failed: ${error.message} | ${fallbackError.message}`);
            }
        }

        throw error;
    }
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { action, stage_id, user_id, context, edited_output, metrics_data, brand_identity } = await req.json();

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        switch (action) {
            case 'run_stage': {
                if (!stage_id) {
                    throw new Error('stage_id is required');
                }

                const systemPrompt = getSystemPrompt(stage_id, context || '', brand_identity);
                const userMessage = 'Execute a tarefa descrita no prompt do sistema. Retorne em formato Markdown estruturado.';

                // Call OpenRouter
                const startTime = Date.now();
                const result = await callLLM(stage_id, systemPrompt, userMessage);
                const duration = Date.now() - startTime;

                console.log(`[${stage_id}] Completed in ${duration}ms using ${result.model}`);

                // Log execution (ignore errors)
                if (user_id) {
                    try {
                        await supabase.from('pipeline_logs').insert({
                            user_id,
                            stage_id,
                            llm_provider: 'openrouter',
                            llm_model: result.model,
                            input_context: context?.substring(0, 1000),
                            output: result.output?.substring(0, 10000),
                            duration_ms: duration,
                            created_at: new Date().toISOString()
                        });
                    } catch (logError) {
                        console.error('Failed to log:', logError);
                    }
                }

                return new Response(
                    JSON.stringify({
                        success: true,
                        stage_id,
                        output: result.output,
                        model: result.model,
                        llm: result.displayName,
                        provider: 'OpenRouter',
                        duration_ms: duration
                    }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            case 'approve_stage': {
                if (!stage_id || !user_id) {
                    throw new Error('stage_id and user_id are required');
                }

                const { error } = await supabase.from('pipeline_outputs').upsert({
                    user_id,
                    stage_id,
                    output: edited_output || context,
                    status: 'approved',
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,stage_id',
                    ignoreDuplicates: false
                });

                if (error) {
                    console.error('Failed to save approved output:', error);
                }

                return new Response(
                    JSON.stringify({ success: true, stage_id, status: 'approved' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            case 'get_pipeline_status': {
                const { data: outputs } = await supabase
                    .from('pipeline_outputs')
                    .select('*')
                    .eq('user_id', user_id)
                    .order('created_at', { ascending: true });

                return new Response(
                    JSON.stringify({ success: true, outputs: outputs || [] }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            case 'list_models': {
                return new Response(
                    JSON.stringify({
                        success: true,
                        models: AGENT_MODELS,
                        fallback: FALLBACK_MODEL
                    }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            default:
                throw new Error(`Unknown action: ${action}`);
        }

    } catch (error: any) {
        console.error('Pipeline error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
                hint: 'Make sure OPENROUTER_API_KEY is configured in Supabase Edge Functions secrets'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
    }
});
