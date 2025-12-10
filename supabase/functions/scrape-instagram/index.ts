import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApifyPost {
  url?: string;
  displayUrl?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  type?: string;
  caption?: string;
  likesCount?: number;
  commentsCount?: number;
  timestamp?: string;
  videoViewCount?: number;
  videoPlayCount?: number;
}

interface ProfileData {
  username?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
}

async function waitForRun(runId: string, apiKey: string, maxAttempts = 30): Promise<boolean> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const statusResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${apiKey}`
    );
    
    if (!statusResponse.ok) {
      console.error('❌ Erro ao verificar status:', statusResponse.status);
      return false;
    }
    
    const statusData = await statusResponse.json();
    const status = statusData.data.status;
    attempts++;
    
    console.log(`⏳ Aguardando (${attempts}/${maxAttempts}): ${status}`);
    
    if (status === 'SUCCEEDED') return true;
    if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
      console.error(`❌ Run falhou com status: ${status}`);
      return false;
    }
  }
  
  return false;
}

async function getRunResults(runId: string, apiKey: string): Promise<any[]> {
  const resultsResponse = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apiKey}`
  );
  
  if (!resultsResponse.ok) {
    const errorText = await resultsResponse.text();
    console.error('❌ Erro ao obter resultados:', resultsResponse.status, errorText);
    throw new Error(`Falha ao obter resultados: ${resultsResponse.status}`);
  }
  
  const results = await resultsResponse.json();
  console.log(`📦 Resultados obtidos: ${results.length} items`);
  if (results.length > 0) {
    console.log('🔍 Primeiro item:', JSON.stringify(results[0]).substring(0, 500));
  }
  return results;
}

async function scrapeProfile(username: string, apiKey: string): Promise<ProfileData> {
  console.log('📊 Buscando dados do perfil...');
  
  try {
    const response = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs?token=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernames: [username],
          resultsLimit: 1,
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Profile scraper error:', response.status, errorText);
      return {};
    }
    
    const runData = await response.json();
    const runId = runData.data.id;
    console.log(`🎯 Profile scraper run ID: ${runId}`);
    
    const success = await waitForRun(runId, apiKey, 20);
    if (!success) {
      console.error('⏰ Timeout ao buscar perfil');
      return {};
    }
    
    const results = await getRunResults(runId, apiKey);
    return results[0] || {};
  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    return {};
  }
}

async function scrapePosts(username: string, apiKey: string): Promise<ApifyPost[]> {
  console.log('📸 Buscando posts do perfil...');
  
  try {
    const response = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-post-scraper/runs?token=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directUrls: [`https://www.instagram.com/${username}/`],
          resultsLimit: 50,
          resultsType: 'posts',
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Post scraper error:', response.status, errorText);
      console.warn('⚠️ Post scraper falhou');
      return [];
    }
    
    const runData = await response.json();
    const runId = runData.data.id;
    console.log(`🎯 Post scraper run ID: ${runId}`);
    
    const success = await waitForRun(runId, apiKey, 30);
    if (!success) {
      console.error('⏰ Timeout ao buscar posts');
      return [];
    }
    
    const results = await getRunResults(runId, apiKey);
    console.log(`📊 Posts brutos retornados: ${results.length}`);
    
    const filteredPosts = results.filter((item: any) => {
      const isPost = item.url && (item.url.includes('/p/') || item.url.includes('/reel/'));
      if (!isPost && results.length < 5) {
        console.log('🔍 Item rejeitado (não é post):', JSON.stringify(item).substring(0, 300));
      }
      return isPost;
    });
    
    console.log(`✅ Posts filtrados: ${filteredPosts.length}`);
    return filteredPosts;
  } catch (error) {
    console.error('❌ Erro ao buscar posts:', error);
    return [];
  }
}

async function scrapeReels(username: string, apiKey: string): Promise<ApifyPost[]> {
  console.log('🎬 Buscando reels do perfil...');
  
  try {
    const response = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-reel-scraper/runs?token=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: [username],
          resultsLimit: 50,
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Reel scraper error:', response.status, errorText);
      console.warn('⚠️ Reel scraper não disponível');
      return [];
    }
    
    const runData = await response.json();
    const runId = runData.data.id;
    console.log(`🎯 Reel scraper run ID: ${runId}`);
    
    const success = await waitForRun(runId, apiKey, 30);
    if (!success) {
      console.error('⏰ Timeout ao buscar reels');
      return [];
    }
    
    const results = await getRunResults(runId, apiKey);
    console.log(`📊 Reels brutos retornados: ${results.length}`);
    return results;
  } catch (error) {
    console.error('❌ Erro ao buscar reels:', error);
    return [];
  }
}

function normalizePost(post: ApifyPost, userId: string) {
  const url = post.url || '';
  // Tentar múltiplas fontes de thumbnail
  const thumbnailUrl = post.displayUrl || post.thumbnailUrl || post.imageUrl || post.videoUrl || '';
  
  console.log('🖼️ Thumbnail capturada:', thumbnailUrl ? '✅' : '❌', url);
  
  const likes = post.likesCount || 0;
  const comments = post.commentsCount || 0;
  
  // Usar views reais se disponível (reels), senão estimar
  const views = post.videoViewCount || post.videoPlayCount || likes * 10;
  
  const shares = 0;
  const saves = 0;
  
  const totalEngagement = likes + comments + shares + saves;
  const engagementRate = views > 0 ? (totalEngagement / views) * 100 : 0;
  
  return {
    user_id: userId,
    post_url: url,
    thumbnail_url: thumbnailUrl,
    post_type: post.type || 'Image',
    caption: (post.caption || '').substring(0, 1000),
    views: views,
    likes: likes,
    comments: comments,
    shares: shares,
    saves: saves,
    published_at: post.timestamp 
      ? new Date(post.timestamp).toISOString() 
      : new Date().toISOString(),
    engagement_rate: parseFloat(engagementRate.toFixed(2)),
  };
}

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

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Não autenticado');
    }

    console.log('✅ Usuário autenticado:', user.id);

    // Get instagram username
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('instagram_username')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.instagram_username) {
      throw new Error('Username do Instagram não configurado');
    }

    const instagramUsername = profile.instagram_username.replace('@', '');
    console.log('🎯 Iniciando scraping completo:', instagramUsername);

    // Execute scrapers em paralelo para máxima eficiência
    const [profileData, posts, reels] = await Promise.allSettled([
      scrapeProfile(instagramUsername, apifyApiKey),
      scrapePosts(instagramUsername, apifyApiKey),
      scrapeReels(instagramUsername, apifyApiKey),
    ]);

    const profile_data = profileData.status === 'fulfilled' ? profileData.value : {};
    const posts_data = posts.status === 'fulfilled' ? posts.value : [];
    const reels_data = reels.status === 'fulfilled' ? reels.value : [];

    console.log('📊 Dados coletados:', {
      profile: profile_data.username || instagramUsername,
      posts: posts_data.length,
      reels: reels_data.length,
    });

    // Combinar posts e reels, remover duplicatas
    const allPosts = [...posts_data, ...reels_data];
    const uniquePosts = Array.from(
      new Map(allPosts.map(p => [(p.url || p.displayUrl), p])).values()
    );

    if (uniquePosts.length === 0) {
      console.warn('⚠️ Nenhum post encontrado');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Perfil encontrado mas sem posts públicos',
          stats: {
            totalPosts: 0,
            profile: profile_data,
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Normalizar e inserir no banco
    const postsToInsert = uniquePosts
      .filter(p => p.url || p.displayUrl)
      .map(p => normalizePost(p, user.id));

    console.log('💾 Inserindo', postsToInsert.length, 'posts...');

    const { data: insertedPosts, error: insertError } = await supabase
      .from('ig_posts')
      .upsert(postsToInsert, { 
        onConflict: 'post_url',
        ignoreDuplicates: false,
      })
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir:', insertError);
      throw insertError;
    }

    console.log('✅ Sucesso! Posts salvos:', insertedPosts?.length || postsToInsert.length);

    // Atualizar dados do perfil na tabela users
    if (profile_data.followersCount || profile_data.followsCount) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          instagram_followers: profile_data.followersCount || 0,
          instagram_following: profile_data.followsCount || 0,
          instagram_posts_count: profile_data.postsCount || postsToInsert.length,
          last_sync_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.warn('⚠️ Erro ao atualizar perfil:', updateError);
      } else {
        console.log('✅ Perfil atualizado com sucesso');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${postsToInsert.length} posts importados com sucesso!`,
        stats: {
          totalPosts: postsToInsert.length,
          postsInserted: insertedPosts?.length || postsToInsert.length,
          profile: {
            username: profile_data.username || instagramUsername,
            followers: profile_data.followersCount || 0,
            following: profile_data.followsCount || 0,
            totalPosts: profile_data.postsCount || postsToInsert.length,
          },
          metrics: {
            totalLikes: postsToInsert.reduce((sum, p) => sum + p.likes, 0),
            totalComments: postsToInsert.reduce((sum, p) => sum + p.comments, 0),
            totalViews: postsToInsert.reduce((sum, p) => sum + p.views, 0),
            avgEngagement: (
              postsToInsert.reduce((sum, p) => sum + p.engagement_rate, 0) / 
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
