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
    const { user_id, research_map_id, format_defined } = await req.json();

    if (!user_id || !research_map_id) {
      return new Response(
        JSON.stringify({ error: "user_id and research_map_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch the research map
    const { data: researchMap, error: researchError } = await supabase
      .from("research_maps")
      .select("*")
      .eq("id", research_map_id)
      .eq("user_id", user_id)
      .single();

    if (researchError || !researchMap) {
      console.error("Error fetching research map:", researchError);
      return new Response(
        JSON.stringify({ error: "Research map not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get resource format if exists
    let resourceFormat = null;
    if (format_defined) {
      const { data: format } = await supabase
        .from("resource_formats")
        .select("*")
        .eq("id", format_defined)
        .single();
      resourceFormat = format;
    }

    const formatName = resourceFormat?.name || format_defined || "Reels 60 segundos";

    const systemPrompt = `Você é um Agente de IA Arquiteto de Narrativas, mestre em estruturar histórias que capturam a atenção e persuadem. Você entende a psicologia humana por trás do engajamento e sabe como construir o esqueleto de um roteiro que funciona.

## Premissas Universais da Psicologia Humana (Diretrizes Inegociáveis):

1. **Princípio da Curiosidade (Information Gap):** Sempre crie uma lacuna de informação no início.
2. **Princípio da Prova Social:** Use dados, cases e testemunhos para validar afirmações.
3. **Princípio do Contraste:** Apresente o "antes e depois", "problema e solução", "mito e verdade".
4. **Princípio da Especificidade:** Números e detalhes são mais críveis e memoráveis.
5. **Princípio da Emoção sobre a Lógica:** Conecte-se emocionalmente antes de persuadir logicamente.

IMPORTANTE: Você DEVE responder APENAS com um JSON válido, sem texto adicional antes ou depois.`;

    const userPrompt = `Crie um esqueleto de roteiro estratégico para o tema: "${researchMap.theme_title}"

## Formato Definido
${formatName}

## Mapa de Conteúdo (Insumos da Pesquisa)
${JSON.stringify(researchMap.map_data, null, 2)}

## Instruções

1. Analise o mapa de conteúdo e selecione os insumos mais poderosos para cada etapa AIDA
2. Construa o esqueleto bloco a bloco, definindo objetivo e conteúdo central para cada bloco
3. Sugira 3 variações de ângulo narrativo (Jornalístico, Pessoal/Vulnerável, Provocativo)

Responda APENAS com este JSON (sem markdown, sem texto extra):
{
  "theme_title": "${researchMap.theme_title}",
  "format": "${formatName}",
  "blocks": [
    {
      "stage": "ATENÇÃO",
      "block_number": 1,
      "objective": "Criar lacuna de informação, gerar curiosidade imediata",
      "content_central": "Insumo específico do mapa a ser usado",
      "psychological_principle": "Curiosidade, Contraste",
      "suggested_duration": "0-10s ou Slide 1"
    },
    {
      "stage": "INTERESSE",
      "block_number": 2,
      "objective": "Aprofundar o problema, gerar conexão emocional",
      "content_central": "Insumo específico do mapa a ser usado",
      "psychological_principle": "Emoção, Prova Social",
      "suggested_duration": "10-30s ou Slides 2-4"
    },
    {
      "stage": "DESEJO",
      "block_number": 3,
      "objective": "Apresentar a solução/insight central de forma clara e desejável",
      "content_central": "Insumo específico do mapa a ser usado",
      "psychological_principle": "Prova Social, Especificidade",
      "suggested_duration": "30-50s ou Slides 5-8"
    },
    {
      "stage": "AÇÃO",
      "block_number": 4,
      "objective": "Direcionar para ação específica de baixo atrito",
      "content_central": "CTA claro e específico",
      "psychological_principle": "Urgência, Reciprocidade",
      "suggested_duration": "50-60s ou Slides 9-10"
    }
  ],
  "angle_variations": [
    {
      "angle": "Jornalístico",
      "tone": "Factual, direto, informativo",
      "application": "Como o roteiro seria apresentado neste tom"
    },
    {
      "angle": "Pessoal/Vulnerável",
      "tone": "Íntimo, confessional, baseado em experiência",
      "application": "Como o roteiro seria apresentado neste tom"
    },
    {
      "angle": "Provocativo",
      "tone": "Desafiador, contraintuitivo, polêmico",
      "application": "Como o roteiro seria apresentado neste tom"
    }
  ],
  "validation_notes": "Pontos que devem ser validados no touchpoint antes de prosseguir"
}`;

    console.log("Calling Lovable AI for narrative building...");

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
    let skeletonData;
    try {
      const cleanedContent = content.replace(/```json\n?|\n?```/g, "").trim();
      skeletonData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, content);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", raw: content }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create narrative skeleton
    const { data: skeleton, error: insertError } = await supabase
      .from("narrative_skeletons")
      .insert({
        user_id,
        research_map_id,
        resource_format_id: format_defined || null,
        format_defined: formatName,
        skeleton_structure: skeletonData,
        angle_suggestions: skeletonData.angle_variations || [],
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating narrative skeleton:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save narrative skeleton" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update playbook stage
    const { data: playbook } = await supabase
      .from("playbooks")
      .select("id")
      .eq("id", researchMap.playbook_id)
      .single();

    if (playbook) {
      await supabase
        .from("playbooks")
        .update({
          current_stage: "narrative",
          status: "touchpoint",
          updated_at: new Date().toISOString(),
        })
        .eq("id", playbook.id)
        .eq("user_id", user_id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        narrative_skeleton_id: skeleton.id, 
        skeleton_structure: skeletonData 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in build-narrative:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
