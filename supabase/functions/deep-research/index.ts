import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, playbook_id, theme_index, theme_title } = await req.json();

    if (!user_id || !playbook_id || theme_index === undefined) {
      return new Response(
        JSON.stringify({ error: "user_id, playbook_id, and theme_index are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch the playbook
    const { data: playbook, error: playbookError } = await supabase
      .from("playbooks")
      .select("*")
      .eq("id", playbook_id)
      .eq("user_id", user_id)
      .single();

    if (playbookError || !playbook) {
      console.error("Error fetching playbook:", playbookError);
      return new Response(
        JSON.stringify({ error: "Playbook not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const selectedTheme = playbook.themes?.[theme_index] || { title: theme_title };
    const themeTitle = selectedTheme.title || theme_title;

    const systemPrompt = `Você é um Agente de IA especialista em Pesquisa Profunda com acesso à internet em tempo real. Sua habilidade é mergulhar em um tema e emergir com um arsenal de informações ricas, REAIS e verificáveis, prontas para serem transformadas em conteúdo de alto impacto.

IMPORTANTE: 
- Você DEVE buscar informações REAIS e ATUAIS da internet
- SEMPRE inclua fontes com URLs quando disponíveis
- Cite estatísticas reais de institutos de pesquisa, estudos acadêmicos, relatórios de mercado
- Traga cases reais de empresas e pessoas conhecidas
- Você DEVE responder APENAS com um JSON válido, sem texto adicional antes ou depois`;

    const userPrompt = `Realize uma pesquisa profunda NA INTERNET sobre o tema: "${themeTitle}"

## Contexto do Cliente
${playbook.client_context || "Empresa focada em crescimento digital e engajamento nas redes sociais."}

## Instruções de Pesquisa

Busque informações REAIS e ATUAIS sobre este tema, incluindo:

1. **Dados Numéricos Reais** (com fontes verificáveis):
   - Estatísticas de institutos como IBGE, Statista, HubSpot, Hootsuite
   - Dados de pesquisas recentes (2023-2024)
   - Métricas de mercado verificáveis

2. **Cases Reais**:
   - Histórias de sucesso ou fracasso de empresas/pessoas conhecidas
   - Exemplos do Brasil e do mundo

3. **Tendências Atuais**:
   - O que está sendo discutido nas redes sociais AGORA
   - Debates e polêmicas recentes sobre o tema

4. **Insights de Especialistas**:
   - Opiniões de líderes de mercado
   - Conteúdos de influenciadores reconhecidos

Responda APENAS com este JSON (sem markdown, sem texto extra):
{
  "theme_title": "${themeTitle}",
  "research_date": "${new Date().toISOString().split('T')[0]}",
  "numerical_data": [
    {
      "statistic": "Descrição da estatística REAL",
      "value": "Valor numérico",
      "source": "Nome da fonte",
      "source_url": "URL da fonte (se disponível)",
      "year": "Ano do dado",
      "impact_level": "high/medium/low"
    }
  ],
  "cases": [
    {
      "type": "success/failure",
      "company_or_person": "Nome real da empresa/pessoa",
      "title": "Título do case",
      "description": "Descrição detalhada do que aconteceu",
      "main_lesson": "Principal lição",
      "source_url": "URL da fonte (se disponível)"
    }
  ],
  "narratives_metaphors": [
    {
      "type": "story/metaphor/analogy/curiosity",
      "content": "Descrição da narrativa ou metáfora"
    }
  ],
  "social_voice": {
    "main_controversy": "Principal polêmica/debate ATUAL nas redes",
    "trending_hashtags": ["#hashtag1", "#hashtag2"],
    "limiting_beliefs": ["Crença limitante 1", "Crença limitante 2"],
    "frequent_questions": ["Pergunta frequente 1", "Pergunta frequente 2"]
  },
  "antagonists": [
    {
      "objection": "Descrição da objeção comum",
      "counter_argument": "Contra-argumento baseado em dados"
    }
  ],
  "expert_quotes": [
    {
      "expert_name": "Nome do especialista",
      "title": "Cargo/Título",
      "quote": "Citação relevante",
      "source_url": "URL da fonte"
    }
  ],
  "cultural_trends": ["Tendência atual 1", "Tendência atual 2"],
  "central_message_connection": "Como este tema pode reforçar a mensagem central da marca"
}`;

    console.log("Calling OpenRouter with Perplexity for deep research...");

    // Use OpenRouter with Perplexity model for real internet search
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://eter.company",
        "X-Title": "Eterflow Deep Research",
      },
      body: JSON.stringify({
        model: "perplexity/sonar-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("OpenRouter API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service error", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response:", aiData);
      return new Response(
        JSON.stringify({ error: "No content generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response
    let mapData;
    try {
      const cleanedContent = content.replace(/```json\n?|\n?```/g, "").trim();
      mapData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, content);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", raw: content }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create research map
    const { data: researchMap, error: insertError } = await supabase
      .from("research_maps")
      .insert({
        user_id,
        playbook_id,
        theme_title: themeTitle,
        source_context: playbook.client_context,
        map_data: mapData,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating research map:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save research map" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update playbook stage
    await supabase
      .from("playbooks")
      .update({
        current_stage: "research",
        status: "in_progress",
        updated_at: new Date().toISOString(),
      })
      .eq("id", playbook_id)
      .eq("user_id", user_id);

    console.log("Deep research completed successfully with Perplexity");

    return new Response(
      JSON.stringify({ 
        success: true, 
        research_map_id: researchMap.id, 
        map_data: mapData 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in deep-research:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
