import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apifyApiKey = Deno.env.get('APIFY_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Não autenticado');
    }

    console.log('Iniciando scraping para usuário:', user.id);

    // Get user profile with instagram username
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('instagram_username')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.instagram_username) {
      throw new Error('Username do Instagram não configurado');
    }

    console.log('Iniciando scraping do perfil:', profile.instagram_username);

    // Start Apify Instagram scraper actor
    const actorRunResponse = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs?token=${apifyApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernames: [profile.instagram_username],
          resultsLimit: 50,
          addParentData: true,
        }),
      }
    );

    if (!actorRunResponse.ok) {
      const errorText = await actorRunResponse.text();
      console.error('Erro ao iniciar Apify actor:', errorText);
      throw new Error(`Falha ao iniciar scraping: ${errorText}`);
    }

    const runData = await actorRunResponse.json();
    const runId = runData.data.id;
    
    console.log('Apify run iniciado:', runId);

    // Wait for the run to finish (poll status)
    let status = 'RUNNING';
    let attempts = 0;
    const maxAttempts = 30; // 5 minutos máximo (10 segundos * 30)

    while (status === 'RUNNING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      
      const statusResponse = await fetch(
        `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs/${runId}?token=${apifyApiKey}`
      );
      
      const statusData = await statusResponse.json();
      status = statusData.data.status;
      attempts++;
      
      console.log(`Status do scraping (tentativa ${attempts}):`, status);
    }

    if (status !== 'SUCCEEDED') {
      throw new Error(`Scraping não completou com sucesso. Status: ${status}`);
    }

    // Get the results
    const resultsResponse = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs/${runId}/dataset/items?token=${apifyApiKey}`
    );

    if (!resultsResponse.ok) {
      throw new Error('Falha ao obter resultados do scraping');
    }

    const results = await resultsResponse.json();
    console.log('Resultados obtidos:', results.length, 'items');

    if (!results || results.length === 0) {
      throw new Error('Nenhum dado foi retornado do scraping');
    }

    const profileData = results[0]; // Profile info
    const posts = results.filter((item: any) => item.type === 'Post');

    console.log('Posts encontrados:', posts.length);

    // Store posts in database
    const postsToInsert = posts.map((post: any) => ({
      user_id: user.id,
      post_url: post.url,
      post_type: post.type,
      views: post.videoViewCount || 0,
      likes: post.likesCount || 0,
      comments: post.commentsCount || 0,
      published_at: post.timestamp ? new Date(post.timestamp).toISOString() : new Date().toISOString(),
      engagement_rate: calculateEngagementRate(
        post.videoViewCount || 0,
        post.likesCount || 0,
        post.commentsCount || 0,
        0
      ),
    }));

    // Insert posts (upsert to avoid duplicates)
    const { error: insertError } = await supabase
      .from('ig_posts')
      .upsert(postsToInsert, { 
        onConflict: 'post_url',
        ignoreDuplicates: true 
      });

    if (insertError) {
      console.error('Erro ao inserir posts:', insertError);
      throw insertError;
    }

    console.log('Posts inseridos com sucesso');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Scraping concluído com sucesso!',
        stats: {
          totalPosts: posts.length,
          profileData: {
            username: profileData.username,
            followersCount: profileData.followersCount,
            followsCount: profileData.followsCount,
            postsCount: profileData.postsCount,
          },
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro no scraping:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function calculateEngagementRate(
  views: number,
  likes: number,
  comments: number,
  saves: number
): number {
  if (views === 0) return 0;
  return ((likes + comments + saves) / views) * 100;
}
