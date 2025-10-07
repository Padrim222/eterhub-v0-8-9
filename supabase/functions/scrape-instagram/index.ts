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
    
    if (!apifyApiKey) {
      throw new Error('APIFY_API_KEY não configurada');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Não autenticado');
    }

    console.log('✅ Usuário autenticado:', user.id);

    // Get user profile with instagram username
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('instagram_username')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.instagram_username) {
      throw new Error('Username do Instagram não configurado. Configure seu @ no onboarding.');
    }

    const instagramUsername = profile.instagram_username.replace('@', '');
    console.log('📸 Iniciando scraping do perfil:', instagramUsername);

    // Start Apify Instagram scraper actor
    const actorRunResponse = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs?token=${apifyApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernames: [instagramUsername],
          resultsLimit: 30, // Últimos 30 posts
          addParentData: true,
        }),
      }
    );

    if (!actorRunResponse.ok) {
      const errorText = await actorRunResponse.text();
      console.error('❌ Erro ao iniciar Apify actor:', errorText);
      throw new Error(`Falha ao iniciar scraping: ${errorText}`);
    }

    const runData = await actorRunResponse.json();
    const runId = runData.data.id;
    
    console.log('🚀 Apify run iniciado:', runId);

    // Wait for the run to finish (poll status)
    let status = 'RUNNING';
    let attempts = 0;
    const maxAttempts = 30; // 5 minutos máximo (10 segundos * 30)

    while (status === 'RUNNING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      
      // ✅ URL CORRIGIDA: Usar /actor-runs/ ao invés de /acts/.../runs/
      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyApiKey}`
      );
      
      if (!statusResponse.ok) {
        console.error('❌ Erro ao verificar status:', await statusResponse.text());
        break;
      }
      
      const statusData = await statusResponse.json();
      status = statusData.data.status;
      attempts++;
      
      console.log(`⏳ Status do scraping (tentativa ${attempts}/30):`, status);
    }

    if (status !== 'SUCCEEDED') {
      throw new Error(`Scraping não completou. Status final: ${status}. Tente novamente.`);
    }

    console.log('✅ Scraping completado com sucesso!');

    // ✅ URL CORRIGIDA: Buscar resultados do dataset
    const resultsResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apifyApiKey}`
    );

    if (!resultsResponse.ok) {
      const errorText = await resultsResponse.text();
      console.error('❌ Erro ao buscar resultados - Status:', resultsResponse.status);
      console.error('❌ Erro ao buscar resultados - Resposta:', errorText);
      throw new Error(`Falha ao obter resultados: ${resultsResponse.status}`);
    }

    const results = await resultsResponse.json();
    console.log('📦 Resultados obtidos:', results.length, 'items');

    if (!results || results.length === 0) {
      throw new Error('Nenhum dado foi retornado. Verifique se o perfil é público.');
    }

    // Separar dados do perfil e posts
    const profileData = results.find((item: any) => item.type === 'Profile') || results[0];
    const posts = results.filter((item: any) => 
      item.type === 'Video' || item.type === 'Image' || item.type === 'Sidecar'
    );

    console.log('📊 Posts encontrados:', posts.length);

    // Store posts in database
    const postsToInsert = posts.map((post: any) => {
      const views = post.videoViewCount || post.displayUrl ? 1000 : 0; // Fallback
      const likes = post.likesCount || 0;
      const comments = post.commentsCount || 0;
      
      return {
        user_id: user.id,
        post_url: post.url || post.displayUrl,
        post_type: post.type,
        caption: post.caption?.substring(0, 500) || '', // Limitar caption
        views: views,
        likes: likes,
        comments: comments,
        shares: 0, // Instagram não fornece shares via scraper
        saves: 0, // Instagram não fornece saves via scraper
        published_at: post.timestamp ? new Date(post.timestamp).toISOString() : new Date().toISOString(),
        engagement_rate: calculateEngagementRate(views, likes, comments, 0),
      };
    });

    // Insert posts (upsert to avoid duplicates)
    const { error: insertError } = await supabase
      .from('ig_posts')
      .upsert(postsToInsert, { 
        onConflict: 'post_url',
        ignoreDuplicates: false // Atualizar se já existir
      });

    if (insertError) {
      console.error('❌ Erro ao inserir posts:', insertError);
      throw insertError;
    }

    console.log('✅ Posts inseridos/atualizados no banco de dados');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Scraping concluído! ${posts.length} posts importados.`,
        stats: {
          totalPosts: posts.length,
          profileData: {
            username: profileData?.username || instagramUsername,
            followersCount: profileData?.followersCount || 0,
            followsCount: profileData?.followsCount || 0,
            postsCount: profileData?.postsCount || posts.length,
          },
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Erro no scraping:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 400,
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
