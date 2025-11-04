import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Fetching metrics for user:", user.id);

    // Fetch Instagram posts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: posts, error: postsError } = await supabase
      .from("ig_posts")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (postsError) {
      console.error("Error fetching posts:", postsError);
    }

    // Fetch leads
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (leadsError) {
      console.error("Error fetching leads:", leadsError);
    }

    // Fetch campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", user.id);

    if (campaignsError) {
      console.error("Error fetching campaigns:", campaignsError);
    }

    // Calculate metrics
    const postsCount = posts?.length || 0;
    const totalEngagement = posts?.reduce((sum, p) => sum + (p.likes_count || 0) + (p.comments_count || 0), 0) || 0;
    const avgEngagement = postsCount > 0 ? totalEngagement / postsCount : 0;
    const totalViews = posts?.reduce((sum, p) => sum + (p.plays_count || 0), 0) || 0;
    
    const leadsCount = leads?.length || 0;
    const qualifiedLeads = leads?.filter((l: any) => l.is_qualified).length || 0;
    const qualificationRate = leadsCount > 0 ? (qualifiedLeads / leadsCount) * 100 : 0;

    const campaignsCount = campaigns?.length || 0;

    // Prepare context for AI
    const metricsContext = `
Análise de Métricas do Usuário:

POSTS DO INSTAGRAM (últimos 30 dias):
- Total de posts: ${postsCount}
- Total de visualizações: ${totalViews.toLocaleString('pt-BR')}
- Total de engajamento (likes + comentários): ${totalEngagement.toLocaleString('pt-BR')}
- Engajamento médio por post: ${avgEngagement.toFixed(1)}

LEADS:
- Total de leads: ${leadsCount}
- Leads qualificados: ${qualifiedLeads}
- Taxa de qualificação: ${qualificationRate.toFixed(1)}%

CAMPANHAS:
- Total de campanhas ativas: ${campaignsCount}

Com base nestes dados, gere 3 insights acionáveis e práticos para melhorar o desempenho do usuário.
`;

    console.log("Calling Lovable AI with metrics:", metricsContext);

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em marketing digital e análise de métricas. Gere insights práticos e acionáveis em português do Brasil. Seja direto e objetivo, focando em ações concretas que o usuário pode tomar.",
          },
          {
            role: "user",
            content: metricsContext,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_insights",
              description: "Gera insights acionáveis baseados nas métricas do usuário",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Título curto do insight" },
                        description: { type: "string", description: "Descrição detalhada e acionável" },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                      },
                      required: ["title", "description", "priority"],
                      additionalProperties: false,
                    },
                    minItems: 3,
                    maxItems: 3,
                  },
                },
                required: ["insights"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_insights" } },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos esgotados. Adicione fundos ao seu workspace Lovable AI." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("AI response:", JSON.stringify(aiData));

    // Extract insights from tool call
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const insights = JSON.parse(toolCall.function.arguments).insights;

    return new Response(
      JSON.stringify({ insights }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-insights:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
