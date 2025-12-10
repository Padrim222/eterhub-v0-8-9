import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Helper to normalize format type to valid enum value
function normalizeFormatType(formatInput: string): string {
  const lower = formatInput.toLowerCase();
  // Valid values: 'reels', 'carrossel', 'stories', 'post_estatico', 'live', 'outros'
  if (lower.includes("reel") || lower.includes("video")) return "reels";
  if (lower.includes("carrossel") || lower.includes("carousel")) return "carrossel";
  if (lower.includes("stories") || lower.includes("story")) return "stories";
  if (lower.includes("post") || lower.includes("image") || lower.includes("static")) return "post_estatico";
  if (lower.includes("live")) return "live";
  return "outros";
}

// Helper to get or create a default resource format
async function getOrCreateDefaultFormat(
  supabase: SupabaseClient,
  userId: string,
  formatType: string,
  playbookId: string | null
): Promise<string> {
  const formatName = formatType || "Reels 60s";
  const normalizedType = normalizeFormatType(formatName);

  console.log(`Looking for format: ${formatName} -> normalized to: ${normalizedType}`);

  // Try to find existing format for this user
  const { data: existing } = await supabase
    .from("resource_formats")
    .select("id")
    .eq("user_id", userId)
    .eq("format_type", normalizedType)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    console.log(`Found existing format: ${existing.id}`);
    return existing.id;
  }

  // Need a valid playbook_id - find any active one or create placeholder
  let validPlaybookId = playbookId;
  
  if (!validPlaybookId) {
    const { data: anyPlaybook } = await supabase
      .from("playbooks")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    
    if (anyPlaybook?.id) {
      validPlaybookId = anyPlaybook.id;
    } else {
      // Create a placeholder playbook
      const { data: newPlaybook, error: playbookError } = await supabase
        .from("playbooks")
        .insert({
          user_id: userId,
          name: "Default Formats",
          slug: `default-formats-${Date.now()}`,
          status: "completed",
        })
        .select("id")
        .single();
      
      if (playbookError) {
        console.error("Error creating playbook:", playbookError);
        throw new Error("Failed to create default playbook");
      }
      
      validPlaybookId = newPlaybook?.id;
    }
  }

  if (!validPlaybookId) {
    throw new Error("Could not create or find a valid playbook for resource format");
  }

  // Create new default format with valid enum value
  const { data: newFormat, error: insertError } = await supabase
    .from("resource_formats")
    .insert({
      user_id: userId,
      playbook_id: validPlaybookId,
      name: formatName,
      format_type: normalizedType, // Must be one of: reels, carrossel, stories, post_estatico, live, outros
      duration_or_slides: normalizedType === "reels" ? "60s" : normalizedType === "carrossel" ? "10 slides" : "1 imagem",
      style_rules: {},
      is_active: true,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Error creating default format:", insertError);
    throw new Error(`Failed to create default resource format: ${insertError.message}`);
  }

  console.log(`Created default resource_format: ${newFormat.id} for format: ${formatName} (type: ${normalizedType})`);
  return newFormat.id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, narrative_skeleton_id, tone_of_voice_guide, selected_angle } = await req.json();

    if (!user_id || !narrative_skeleton_id) {
      return new Response(
        JSON.stringify({ error: "user_id and narrative_skeleton_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch the narrative skeleton
    const { data: skeleton, error: skeletonError } = await supabase
      .from("narrative_skeletons")
      .select("*, research_maps(*)")
      .eq("id", narrative_skeleton_id)
      .eq("user_id", user_id)
      .single();

    if (skeletonError || !skeleton) {
      console.error("Error fetching skeleton:", skeletonError);
      return new Response(
        JSON.stringify({ error: "Narrative skeleton not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update selected angle
    if (selected_angle) {
      await supabase
        .from("narrative_skeletons")
        .update({ angle_selected: selected_angle })
        .eq("id", narrative_skeleton_id);
    }

    const skeletonStructure = skeleton.skeleton_structure;
    const themeTitle = skeletonStructure?.theme_title || skeleton.research_maps?.theme_title || "Tema";
    const angleToUse = selected_angle || skeleton.angle_suggestions?.[0]?.angle || "Jornalístico";
    const formatType = skeleton.format_defined || skeletonStructure?.format || "Reels";

    // Get or create resource_format_id
    let resourceFormatId = skeleton.resource_format_id;
    if (!resourceFormatId) {
      console.log("No resource_format_id found, creating default...");
      const playbookId = skeleton.research_maps?.playbook_id || null;
      resourceFormatId = await getOrCreateDefaultFormat(supabase, user_id, formatType, playbookId);
      
      // Update the skeleton with the new resource_format_id
      await supabase
        .from("narrative_skeletons")
        .update({ resource_format_id: resourceFormatId })
        .eq("id", narrative_skeleton_id);
    }

    const systemPrompt = `Você é um Agente de IA Mestre da Escrita, um copywriter e roteirista de elite. Sua habilidade é transformar esqueletos lógicos em textos vivos, pulsantes e impossíveis de serem ignorados. Você domina múltiplos estilos literários e sabe como tecer palavras para gerar emoção, clareza e ação.

## Guia de Tom de Voz
${tone_of_voice_guide || "Tom profissional mas acessível, com autoridade e empatia. Use linguagem direta, evite jargões excessivos. Seja específico e use dados quando possível."}

## Ângulo Narrativo Selecionado
${angleToUse}

IMPORTANTE: Você DEVE responder APENAS com um JSON válido, sem texto adicional antes ou depois.`;

    const userPrompt = `Escreva o texto final do roteiro baseado no esqueleto abaixo.

## Tema
${themeTitle}

## Esqueleto do Roteiro (Estrutura AIDA)
${JSON.stringify(skeletonStructure, null, 2)}

## Instruções

1. Siga a estrutura do esqueleto e escreva o texto final para cada bloco
2. Use técnicas de escrita criativa:
   - Figuras de linguagem (metáforas, analogias, personificações)
   - Ritmo e cadência variados
   - Palavras sensoriais
3. Garanta que o texto crie desejo implícito pela solução
4. Faça uma autoavaliação (Style Checker) pontuando de 0-10 cada critério

Responda APENAS com este JSON (sem markdown, sem texto extra):
{
  "theme_title": "${themeTitle}",
  "format": "${formatType}",
  "full_script": {
    "hook": {
      "text": "Texto completo do gancho/abertura",
      "duration": "0-10s"
    },
    "interest": {
      "text": "Texto completo do desenvolvimento do interesse",
      "duration": "10-30s"
    },
    "desire": {
      "text": "Texto completo da geração de desejo",
      "duration": "30-50s"
    },
    "action": {
      "text": "Texto completo do CTA",
      "duration": "50-60s"
    }
  },
  "complete_text": "Texto completo do roteiro, concatenando todos os blocos de forma fluida",
  "style_checker": {
    "clarity": {
      "score": 8,
      "justification": "Justificativa da nota"
    },
    "hook_impact": {
      "score": 9,
      "justification": "Justificativa da nota"
    },
    "fluidity": {
      "score": 8,
      "justification": "Justificativa da nota"
    },
    "emotional_connection": {
      "score": 7,
      "justification": "Justificativa da nota"
    },
    "tone_adherence": {
      "score": 8,
      "justification": "Justificativa da nota"
    },
    "cta_strength": {
      "score": 8,
      "justification": "Justificativa da nota"
    },
    "average_score": 8.0,
    "status": "Aprovado"
  },
  "caption_suggestion": "Sugestão de legenda para acompanhar o conteúdo",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
}`;

    console.log("Calling Lovable AI for content writing...");

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
    let contentData;
    try {
      const cleanedContent = content.replace(/```json\n?|\n?```/g, "").trim();
      contentData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, content);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", raw: content }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine status based on style checker score
    const styleScore = contentData.style_checker?.average_score || 0;
    const productionStatus = styleScore >= 7 ? "approved" : "needs_revision";

    // Create content record
    const { data: newContent, error: insertError } = await supabase
      .from("contents")
      .insert({
        user_id,
        narrative_skeleton_id,
        resource_format_id: resourceFormatId,
        title: contentData.theme_title || themeTitle,
        text_content: contentData.complete_text,
        content_type: contentData.format || formatType,
        style_checker_score: styleScore,
        style_checker_details: contentData.style_checker,
        production_status: productionStatus,
        metadata: {
          full_script: contentData.full_script,
          caption_suggestion: contentData.caption_suggestion,
          hashtags: contentData.hashtags,
          angle_used: angleToUse,
        },
        is_canonical: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating content:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save content", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update playbook stage to completed
    const researchMap = skeleton.research_maps;
    if (researchMap?.playbook_id) {
      await supabase
        .from("playbooks")
        .update({
          current_stage: "completed",
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", researchMap.playbook_id)
        .eq("user_id", user_id);
    }

    console.log("Content created successfully:", newContent.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        content_id: newContent.id,
        content_data: contentData,
        style_score: styleScore,
        status: productionStatus
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in write-content:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});