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
      throw new Error('Username do Instagram não configurado');
    }

    const instagramUsername = profile.instagram_username.replace('@', '');
    console.log('📸 Iniciando scraping:', instagramUsername);

    // Start Apify actor
    const actorRunResponse = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs?token=${apifyApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernames: [instagramUsername],
          resultsLimit: 30,
          addParentData: false,
        }),
      }
    );

    if (!actorRunResponse.ok) {
      throw new Error(`Apify start failed: ${await actorRunResponse.text()}`);
    }

    const runData = await actorRunResponse.json();
    const runId = runData.data.id;
    
    console.log('🚀 Run ID:', runId);

    // Poll for completion
    let status = 'RUNNING';
    let attempts = 0;
    const maxAttempts = 30;

    while (status === 'RUNNING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyApiKey}`
      );
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        status = statusData.data.status;
        attempts++;
        console.log(`⏳ Tentativa ${attempts}/30: ${status}`);
      } else {
        break;
      }
    }

    if (status !== 'SUCCEEDED') {
      throw new Error(`Scraping falhou. Status: ${status}`);
    }

    // Get results
    const resultsResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apifyApiKey}`
    );

    if (!resultsResponse.ok) {
      throw new Error(`Failed to get results: ${resultsResponse.status}`);
    }

    const results = await resultsResponse.json();
    console.log('📦 Items retornados:', results.length);

    if (!results || results.length === 0) {
      throw new Error('Nenhum dado retornado');
    }

    // ✅ PARSE CORRETO DOS DADOS
    const profileData = results[0]; // Primeiro item = dados do perfil
    
    // Filtrar apenas posts (ignorar profile info)
    const posts = results.filter((item: any) => 
      item.url && item.url.includes('/p/') // URL de post
    );

    console.log('📊 Posts encontrados:', posts.length);
    console.log('👤 Perfil:', {
      username: profileData.username,
      followers: profileData.followersCount,
      following: profileData.followsCount,
      posts: profileData.postsCount
    });

    // ✅ TRANSFORMAR DADOS DO APIFY PARA O FORMATO DO SUPABASE
    const postsToInsert = posts.map((post: any) => {
      // ✅ Apify retorna likes/comments/timestamp
      // ❌ Apify NÃO retorna views/shares/saves
      
      const likes = post.likesCount || 0;
      const comments = post.commentsCount || 0;
      
      // 🔧 ESTIMATIVA DE VIEWS (Instagram não fornece via scraper)
      // Heurística: views ≈ likes * 10 (média conservadora)
      const estimatedViews = likes * 10;
      
      // 🔧 Shares e Saves não disponíveis via Apify
      const shares = 0;
      const saves = 0;
      
      // Calcular engagement rate
      const totalEngagement = likes + comments + shares + saves;
      const engagementRate = estimatedViews > 0 
        ? (totalEngagement / estimatedViews) * 100 
        : 0;

      return {
        user_id: user.id,
        post_url: post.url,
        post_type: post.type || 'Image', // Image, Video, Sidecar
        caption: (post.caption || '').substring(0, 1000), // Limitar tamanho
        views: estimatedViews,
        likes: likes,
        comments: comments,
        shares: shares,
        saves: saves,
        published_at: post.timestamp 
          ? new Date(post.timestamp).toISOString() 
          : new Date().toISOString(),
        engagement_rate: parseFloat(engagementRate.toFixed(2)),
      };
    });

    console.log('💾 Preparando para inserir', postsToInsert.length, 'posts');

    // ✅ UPSERT NO SUPABASE
    const { data: insertedPosts, error: insertError } = await supabase
      .from('ig_posts')
      .upsert(postsToInsert, { 
        onConflict: 'post_url',
        ignoreDuplicates: false // Atualizar se já existir
      })
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir:', insertError);
      throw insertError;
    }

    console.log('✅ Posts salvos:', insertedPosts?.length || postsToInsert.length);

    // ✅ RETORNAR SUCESSO COM ESTATÍSTICAS
    return new Response(
      JSON.stringify({
        success: true,
        message: `${posts.length} posts importados com sucesso!`,
        stats: {
          totalPosts: posts.length,
          postsInserted: insertedPosts?.length || postsToInsert.length,
          profile: {
            username: profileData.username || instagramUsername,
            followers: profileData.followersCount || 0,
            following: profileData.followsCount || 0,
            totalPosts: profileData.postsCount || posts.length,
          },
          metrics: {
            totalLikes: postsToInsert.reduce((sum: number, p: any) => sum + p.likes, 0),
            totalComments: postsToInsert.reduce((sum: number, p: any) => sum + p.comments, 0),
            avgEngagement: (
              postsToInsert.reduce((sum: number, p: any) => sum + p.engagement_rate, 0) / 
              postsToInsert.length
            ).toFixed(2),
          }
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Erro:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
