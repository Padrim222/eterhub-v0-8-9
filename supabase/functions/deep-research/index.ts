import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
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

    const systemPrompt = `Você é um Agente de IA especialista em Pesquisa Profunda. Sua habilidade é mergulhar em um tema e emergir com um arsenal de informações ricas e diversas, prontas para serem transformadas em conteúdo de alto impacto. Você vai além do superficial, buscando dados, histórias e insights que ninguém mais encontrou.

Sua missão é construir um dossiê completo de insumos que servirá de matéria-prima para a criação de roteiros.

IMPORTANTE: Você DEVE responder APENAS com um JSON válido, sem texto adicional antes ou depois.`;

    const userPrompt = `Realize uma pesquisa profunda sobre o tema: "${themeTitle}"

## Contexto do Cliente
${playbook.client_context || "Empresa focada em crescimento digital e engajamento nas redes sociais."}

## Instruções de Pesquisa

1. Execute uma pesquisa exaustiva considerando:
   - Fontes Acadêmicas: Estudos, artigos científicos, dados de pesquisa
   - Fontes de Mercado: Relatórios, dados de mercado, tendências
   - Fontes de Mídia: Notícias, artigos, revistas especializadas
   - Fontes Sociais: Opiniões, polêmicas, dúvidas e crenças do público

2. Colete ativamente:
   - 2-5 estatísticas impactantes com fontes
   - 2 cases de sucesso ou fracasso relevantes
   - Histórias, metáforas e analogias
   - Tendências culturais relacionadas
   - Principais objeções e crenças limitantes do público

Responda APENAS com este JSON (sem markdown, sem texto extra):
{
  "theme_title": "${themeTitle}",
  "numerical_data": [
    {
      "statistic": "Descrição da estatística",
      "source": "Fonte/referência",
      "impact_level": "high/medium/low"
    }
  ],
  "cases": [
    {
      "type": "success/failure",
      "title": "Título do case",
      "description": "Descrição detalhada",
      "main_lesson": "Principal lição"
    }
  ],
  "narratives_metaphors": [
    {
      "type": "story/metaphor/analogy/curiosity",
      "content": "Descrição da narrativa ou metáfora"
    }
  ],
  "social_voice": {
    "main_controversy": "Principal polêmica/debate nas redes",
    "limiting_beliefs": ["Crença limitante 1", "Crença limitante 2"],
    "frequent_questions": ["Pergunta frequente 1", "Pergunta frequente 2"]
  },
  "antagonists": [
    {
      "objection": "Descrição da objeção",
      "counter_argument": "Possível contra-argumento"
    }
  ],
  "cultural_trends": ["Tendência 1", "Tendência 2"],
  "central_message_connection": "Como este tema pode reforçar a mensagem central da marca"
}`;

    console.log("Calling Lovable AI for deep research...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
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
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
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
