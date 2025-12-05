import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate authentication - require valid JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the JWT token and get the authenticated user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Invalid token:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = await req.json();
    console.log('Received Instagram metrics payload for authenticated user:', user.id);

    const { userId, user_id, profile, account_metrics, posts, stories, instagram_stats, general_metrics } = payload;
    
    // Use authenticated user's ID - ignore any user_id from payload for security
    const finalUserId = user.id;
    
    // Log warning if payload tried to specify a different user
    if ((userId || user_id) && (userId || user_id) !== user.id) {
      console.warn('Payload contained different user_id, using authenticated user instead');
    }

    const today = new Date().toISOString().split('T')[0];

    // 1. Atualizar perfil do usuário
    if (profile || instagram_stats) {
      const updateData: any = {};
      
      if (profile?.followers) {
        updateData.instagram_followers = profile.followers;
      }
      if (instagram_stats?.followers) {
        updateData.instagram_followers = instagram_stats.followers;
      }
      if (profile?.profile_fullname) {
        updateData.nome = profile.profile_fullname;
      }
      if (profile?.profile_photo_url) {
        updateData.avatar_url = profile.profile_photo_url;
      }

      if (Object.keys(updateData).length > 0) {
        const { error: userError } = await supabaseAdmin
          .from('users')
          .update(updateData)
          .eq('id', finalUserId);

        if (userError) {
          console.error('Erro ao atualizar usuário:', userError);
        } else {
          console.log('Perfil atualizado com sucesso');
        }
      }
    }

    // 2. Salvar métricas diárias (upsert)
    if (account_metrics || general_metrics) {
      const metrics = account_metrics || general_metrics;
      const metricsData = {
        user_id: finalUserId,
        date: today,
        reach_total: metrics.reach_total || 0,
        reach_paid: metrics.reach_paid || 0,
        reach_organic: metrics.reach_organic || 0,
        impressions: metrics.impressions || 0,
        profile_views: metrics.profile_views || 0,
        website_clicks: metrics.website_clicks || 0,
        email_clicks: metrics.email_clicks || 0,
        call_clicks: metrics.call_clicks || 0,
        text_clicks: metrics.text_clicks || 0,
        followers_reached: metrics.followers_reached || 0,
        non_followers: metrics.non_followers || 0,
        stories_reach: metrics.stories_reach_last_30_days || metrics.stories_reach || 0,
        stories_impressions: metrics.stories_impressions_last_30_days || metrics.stories_impressions || 0,
        stories_exits: metrics.stories_exits || 0,
      };

      const { error: metricsError } = await supabaseAdmin
        .from('instagram_metrics')
        .upsert(metricsData, { onConflict: 'user_id,date' });

      if (metricsError) {
        console.error('Erro ao salvar métricas diárias:', metricsError);
      } else {
        console.log('Métricas diárias salvas com sucesso');
      }
    }

    // 3. Salvar posts individuais
    if (posts && Array.isArray(posts) && posts.length > 0) {
      for (const post of posts) {
        if (!post.post_url && !post.url) continue;

        const postData = {
          user_id: finalUserId,
          post_url: post.post_url || post.url,
          thumbnail_url: post.thumbnail_url || post.thumbnail || null,
          post_type: post.post_type || post.type || 'post',
          views: post.views || post.impressions || 0,
          likes: post.likes || post.like_count || 0,
          comments: post.comments || post.comment_count || 0,
          shares: post.shares || post.share_count || 0,
          saves: post.saves || post.save_count || 0,
          engagement_rate: post.engagement_rate || 0,
          published_at: post.published_at || post.timestamp || new Date().toISOString(),
          scraped_at: new Date().toISOString(),
        };

        const { error: postError } = await supabaseAdmin
          .from('ig_posts')
          .upsert(postData, { onConflict: 'post_url' });

        if (postError) {
          console.error('Erro ao salvar post:', postError);
        }
      }
      console.log(`${posts.length} posts processados`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Métricas do Instagram recebidas e processadas com sucesso' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erro na function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
