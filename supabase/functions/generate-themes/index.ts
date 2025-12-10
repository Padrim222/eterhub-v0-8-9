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
    const { user_id, analysis_id, client_context, playbook_id } = await req.json();

    if (!user_id || !analysis_id) {
      return new Response(
        JSON.stringify({ error: "user_id and analysis_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch the analysis data
    const { data: analysis, error: analysisError } = await supabase
      .from("content_analyses")
      .select("*")
      .eq("id", analysis_id)
      .eq("user_id", user_id)
      .single();

    if (analysisError || !analysis) {
      console.error("Error fetching analysis:", analysisError);
      return new Response(
        JSON.stringify({ error: "Analysis not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the prompt for the Ideation Agent
    const systemPrompt = `Você é um Agente de IA Estrategista de Conteúdo Viral. Sua especialidade é farejar tendências e identificar assuntos com altíssimo potencial de conversa antes que se tornem mainstream. Você pensa fora da caixa, conectando pontos entre diferentes culturas e nichos para gerar ideias de conteúdo que furam a bolha.

Sua missão é gerar 10 novas ideias de temas para conteúdo que sejam originais, relevantes para o público e com alta probabilidade de viralizar.

IMPORTANTE: Você DEVE responder APENAS com um JSON válido, sem texto adicional antes ou depois.`;

    const userPrompt = `Com base na análise de performance abaixo, gere 10 temas de conteúdo inovadores.

## Contexto do Cliente
${client_context || "Empresa focada em crescimento digital e engajamento nas redes sociais."}

## Padrões de Sucesso Identificados (da Análise)
${JSON.stringify(analysis.success_patterns || [], null, 2)}

## Top Posts Identificados
${JSON.stringify(analysis.top_posts || [], null, 2)}

## Recomendações da Análise
${JSON.stringify(analysis.recommendations || [], null, 2)}

## Instruções
1. Realize um mapeamento mental de territórios de conversa considerando:
   - Assuntos Polêmicos: Debates emergentes no nicho ou áreas adjacentes
   - Crenças Desafiadas: Conteúdos que questionam uma verdade estabelecida
   - Conexões Inesperadas: Cruzamento de ideias de campos aparentemente não relacionados
   - Alto Potencial de Conversa: Assuntos que geram comentários e compartilhamentos

2. Filtre os territórios que:
   - Se conectam com os padrões de sucesso validados
   - São relevantes para o público-alvo
   - Respeitam os formatos que melhor performam

3. Para cada tema, forneça:
   - Título magnético
   - Justificativa estratégica (por que tem alto potencial)
   - Formato sugerido (Reels, Carrossel, etc.) com justificativa

Responda APENAS com este JSON (sem markdown, sem texto extra):
{
  "themes": [
    {
      "rank": 1,
      "title": "Título do tema",
      "justification": "Por que este tema tem alto potencial de viralização",
      "suggested_format": "Reels 60s",
      "format_justification": "Por que este formato é ideal"
    }
  ]
}`;

    console.log("Calling Lovable AI for theme generation...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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
    let themes;
    try {
      const cleanedContent = content.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanedContent);
      themes = parsed.themes || parsed;
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, content);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", raw: content }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update or create playbook with themes
    if (playbook_id) {
      const { error: updateError } = await supabase
        .from("playbooks")
        .update({
          themes,
          success_patterns_input: analysis.success_patterns,
          client_context,
          analysis_id,
          current_stage: "ideation",
          status: "touchpoint",
          updated_at: new Date().toISOString(),
        })
        .eq("id", playbook_id)
        .eq("user_id", user_id);

      if (updateError) {
        console.error("Error updating playbook:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update playbook" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, playbook_id, themes }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Create new playbook
      const { data: newPlaybook, error: insertError } = await supabase
        .from("playbooks")
        .insert({
          user_id,
          name: `Produção ${new Date().toLocaleDateString("pt-BR")}`,
          slug: `producao-${Date.now()}`,
          themes,
          success_patterns_input: analysis.success_patterns,
          client_context,
          analysis_id,
          current_stage: "ideation",
          status: "touchpoint",
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating playbook:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to create playbook" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, playbook_id: newPlaybook.id, themes }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in generate-themes:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
