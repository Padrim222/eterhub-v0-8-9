import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `## Agente de Análise de Performance (Data-Driven Insights Agent)

**Persona:** Você é um Agente de IA especialista em Análise de Dados de Social Media, com foco em Growth Hacking. Sua missão é transformar dados brutos em inteligência acionável, identificando os padrões ocultos que levam ao conteúdo de alta performance.

**Objetivo Final:** Gerar um relatório de inteligência de conteúdo que revele os padrões universais dos conteúdos de maior performance, fornecendo um guia claro sobre o que replicar para maximizar o engajamento e a geração de leads.

**Processo:**

1. **Análise de Métricas:**
   - Calcule a Taxa de Engajamento: ((Curtidas + Comentarios + Salvamentos + Compartilhamentos) / Alcance) * 100
   - Identifique os Top 10 posts por performance

2. **Score de Sucesso (0-100):**
   - Compartilhamentos (Peso: 40%)
   - Novos Seguidores (Peso: 25%)
   - Leads Gerados (Peso: 20%)
   - Taxa de Engajamento (Peso: 15%)

3. **Análise de Padrões:**
   - Estrutura do Roteiro (Gancho, Desenvolvimento, CTA)
   - Formato do Gancho (Pergunta, Polêmica, Afirmação Contraintuitiva)
   - Temas Abordados
   - Estilo de Escrita e Tom de Voz
   - Uso de Elementos (Dados, Storytelling, Cases)

**Restrições:**
- Análise 100% baseada nos dados fornecidos
- Correlações lógicas e bem fundamentadas
- Output direto e sem jargões excessivos

**Formato de Resposta (JSON):**
{
  "metrics_summary": {
    "total_posts": number,
    "avg_reach": number,
    "avg_engagement_rate": number,
    "avg_shares": number,
    "avg_new_followers": number,
    "avg_leads": number
  },
  "top_posts": [
    {
      "rank": number,
      "post_id": string,
      "success_score": number,
      "main_theme": string,
      "engagement_rate": number
    }
  ],
  "success_patterns": [
    {
      "pattern_type": "structure" | "theme" | "format" | "language",
      "description": string,
      "frequency": string
    }
  ],
  "recommendations": [
    {
      "action": "replicate" | "avoid" | "test",
      "description": string,
      "priority": "high" | "medium" | "low"
    }
  ],
  "insights_summary": string
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { user_id, posts_data, leads_data, analysis_type = 'performance' } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar posts do usuário se não fornecidos
    let postsToAnalyze = posts_data;
    if (!postsToAnalyze || postsToAnalyze.length === 0) {
      console.log('Fetching posts from database for user:', user_id);
      const { data: dbPosts, error: postsError } = await supabase
        .from('ig_posts')
        .select('*')
        .eq('user_id', user_id)
        .order('published_at', { ascending: false })
        .limit(100);

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw new Error(`Failed to fetch posts: ${postsError.message}`);
      }
      postsToAnalyze = dbPosts || [];
    }

    // Buscar leads do usuário se não fornecidos
    let leadsToAnalyze = leads_data;
    if (!leadsToAnalyze) {
      const { data: dbLeads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(500);

      if (!leadsError) {
        leadsToAnalyze = dbLeads || [];
      }
    }

    if (!postsToAnalyze || postsToAnalyze.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No posts found to analyze',
          message: 'Importe suas métricas do Instagram primeiro'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing ${postsToAnalyze.length} posts for user ${user_id}`);

    // Criar registro de análise pendente
    const { data: analysisRecord, error: insertError } = await supabase
      .from('content_analyses')
      .insert({
        user_id,
        analysis_type,
        input_data: { 
          posts_count: postsToAnalyze.length, 
          leads_count: leadsToAnalyze?.length || 0 
        },
        status: 'processing'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating analysis record:', insertError);
      throw new Error(`Failed to create analysis record: ${insertError.message}`);
    }

    // Preparar dados para o prompt
    const formattedPosts = postsToAnalyze.map((post: any) => ({
      id: post.id,
      caption: post.caption?.substring(0, 500),
      post_type: post.post_type,
      likes: post.likes || 0,
      comments: post.comments || 0,
      saves: post.saves || 0,
      shares: post.shares || 0,
      views: post.views || 0,
      engagement_rate: post.engagement_rate || 0,
      published_at: post.published_at
    }));

    const userPrompt = `Analise os seguintes dados de performance de conteúdo do Instagram:

**DADOS DOS POSTS (${formattedPosts.length} posts):**
${JSON.stringify(formattedPosts, null, 2)}

**DADOS DE LEADS (${leadsToAnalyze?.length || 0} leads):**
${leadsToAnalyze ? JSON.stringify(leadsToAnalyze.slice(0, 50).map((l: any) => ({ 
  created_at: l.created_at, 
  source: l.source_channel,
  qualified: l.is_qualified
})), null, 2) : 'Nenhum dado de leads disponível'}

Por favor, gere a análise completa conforme o formato JSON especificado.`;

    // Chamar Lovable AI
    console.log('Calling Lovable AI for analysis...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        await supabase
          .from('content_analyses')
          .update({ status: 'failed', error_message: 'Rate limit exceeded' })
          .eq('id', analysisRecord.id);
          
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        await supabase
          .from('content_analyses')
          .update({ status: 'failed', error_message: 'Payment required' })
          .eq('id', analysisRecord.id);
          
        return new Response(
          JSON.stringify({ error: 'Payment required, please add funds to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysisContent = aiData.choices?.[0]?.message?.content;
    const tokensUsed = aiData.usage?.total_tokens || 0;

    if (!analysisContent) {
      throw new Error('No analysis content received from AI');
    }

    console.log('AI analysis received, parsing...');
    
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysisContent);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      parsedAnalysis = {
        insights_summary: analysisContent,
        metrics_summary: {},
        top_posts: [],
        success_patterns: [],
        recommendations: []
      };
    }

    const processingTime = Date.now() - startTime;

    // Atualizar registro com resultados
    const { error: updateError } = await supabase
      .from('content_analyses')
      .update({
        status: 'completed',
        analysis_result: parsedAnalysis,
        metrics_summary: parsedAnalysis.metrics_summary || {},
        top_posts: parsedAnalysis.top_posts || [],
        success_patterns: parsedAnalysis.success_patterns || [],
        recommendations: parsedAnalysis.recommendations || [],
        tokens_used: tokensUsed,
        processing_time_ms: processingTime
      })
      .eq('id', analysisRecord.id);

    if (updateError) {
      console.error('Error updating analysis record:', updateError);
    }

    console.log(`Analysis completed in ${processingTime}ms, tokens used: ${tokensUsed}`);

    return new Response(
      JSON.stringify({
        success: true,
        analysis_id: analysisRecord.id,
        analysis: parsedAnalysis,
        tokens_used: tokensUsed,
        processing_time_ms: processingTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-metrics function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
