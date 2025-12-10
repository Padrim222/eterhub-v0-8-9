import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing request for user: ${user.id}`);

    // Parse request body for optional webhook_url override
    let webhookUrl = 'https://webhook.symbiotic.com.br/webhook/920f35a0-264c-4a92-9356-26afe41a6551';
    
    try {
      const body = await req.json();
      if (body.webhook_url) {
        webhookUrl = body.webhook_url;
      }
    } catch {
      // No body or invalid JSON, use default webhook URL
    }

    console.log(`Using webhook URL: ${webhookUrl}`);

    // Fetch user profile with Instagram data
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('instagram_username, instagram_followers, instagram_following, instagram_posts_count, last_sync_at, nome, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found profile: ${userProfile.instagram_username}`);

    // Fetch Instagram posts
    const { data: posts, error: postsError } = await supabase
      .from('ig_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('published_at', { ascending: false })
      .limit(50);

    if (postsError) {
      console.error('Posts fetch error:', postsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch posts' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${posts?.length || 0} posts`);

    // Calculate aggregated metrics
    const totalLikes = posts?.reduce((sum, p) => sum + (p.likes || 0), 0) || 0;
    const totalComments = posts?.reduce((sum, p) => sum + (p.comments || 0), 0) || 0;
    const totalSaves = posts?.reduce((sum, p) => sum + (p.saves || 0), 0) || 0;
    const totalShares = posts?.reduce((sum, p) => sum + (p.shares || 0), 0) || 0;
    const totalViews = posts?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;
    
    const engagementRates = posts?.filter(p => p.engagement_rate != null).map(p => p.engagement_rate!) || [];
    const avgEngagementRate = engagementRates.length > 0 
      ? Number((engagementRates.reduce((sum, r) => sum + r, 0) / engagementRates.length).toFixed(2))
      : 0;

    // Prepare payload
    const payload = {
      profile: {
        username: userProfile.instagram_username || 'unknown',
        name: userProfile.nome,
        email: userProfile.email,
        followers: userProfile.instagram_followers || 0,
        following: userProfile.instagram_following || 0,
        posts_count: userProfile.instagram_posts_count || 0,
        last_sync: userProfile.last_sync_at
      },
      metrics: {
        total_posts_tracked: posts?.length || 0,
        total_likes: totalLikes,
        total_comments: totalComments,
        total_saves: totalSaves,
        total_shares: totalShares,
        total_views: totalViews,
        avg_engagement_rate: avgEngagementRate
      },
      recent_posts: (posts || []).slice(0, 10).map(post => ({
        url: post.post_url,
        type: post.post_type,
        thumbnail: post.thumbnail_url,
        likes: post.likes || 0,
        comments: post.comments || 0,
        saves: post.saves || 0,
        shares: post.shares || 0,
        views: post.views || 0,
        engagement_rate: post.engagement_rate || 0,
        published_at: post.published_at,
        caption: post.caption?.substring(0, 200)
      })),
      sent_at: new Date().toISOString(),
      user_id: user.id
    };

    console.log('Sending payload to N8N webhook...');

    // Send to N8N webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const webhookStatus = webhookResponse.status;
    let webhookResponseText = '';
    
    try {
      webhookResponseText = await webhookResponse.text();
    } catch {
      webhookResponseText = 'No response body';
    }

    console.log(`Webhook response status: ${webhookStatus}`);
    console.log(`Webhook response: ${webhookResponseText}`);

    if (!webhookResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Webhook request failed',
          status: webhookStatus,
          response: webhookResponseText
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Metrics sent to N8N successfully',
        webhook_status: webhookStatus,
        payload_summary: {
          username: payload.profile.username,
          posts_sent: payload.recent_posts.length,
          total_metrics: payload.metrics
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
