import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReporteiPost {
  id?: string;
  type?: string;
  media_type?: string;
  caption?: string;
  permalink?: string;
  thumbnail_url?: string;
  media_url?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
  saved_count?: number;
  shares_count?: number;
  plays?: number;
  reach?: number;
  impressions?: number;
  engagement?: number;
}

interface ReporteiProfile {
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  username?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== fetch-reportei-data: Starting ===');

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing Authorization header');
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Authenticated user:', user.id);

    // Get user's Reportei API key and Instagram username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('reportei_api_key, instagram_username')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!userData.reportei_api_key) {
      console.error('User has no Reportei API key configured');
      return new Response(JSON.stringify({ error: 'Reportei API key not configured. Please add your key in Settings.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching data for Instagram:', userData.instagram_username);

    // The Reportei API key is actually a dashboard share URL token
    // Format: https://app.reportei.com/dashboard/{API_KEY}
    // We need to call Reportei's internal API or parse the dashboard data
    
    // For now, we'll use the Reportei public dashboard API
    // The key provided is the dashboard share token
    const reporteiKey = userData.reportei_api_key;
    
    // Try to fetch dashboard data from Reportei
    // Reportei exposes data through their share dashboard endpoint
    const dashboardUrl = `https://app.reportei.com/api/dashboard/${reporteiKey}`;
    
    console.log('Calling Reportei API...');
    
    const reporteiResponse = await fetch(dashboardUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ETER-Integration/1.0',
      },
    });

    if (!reporteiResponse.ok) {
      // Try alternative endpoint format
      const altUrl = `https://app.reportei.com/dashboard/${reporteiKey}/data`;
      console.log('Primary endpoint failed, trying alternative:', altUrl);
      
      const altResponse = await fetch(altUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ETER-Integration/1.0',
        },
      });

      if (!altResponse.ok) {
        console.error('Reportei API error:', reporteiResponse.status, await reporteiResponse.text());
        return new Response(JSON.stringify({ 
          error: 'Failed to fetch data from Reportei. Please verify your API key.',
          status: reporteiResponse.status 
        }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    let reporteiData;
    try {
      reporteiData = await reporteiResponse.json();
      console.log('Reportei data received:', JSON.stringify(reporteiData).substring(0, 500));
    } catch (e) {
      console.error('Failed to parse Reportei response:', e);
      return new Response(JSON.stringify({ 
        error: 'Invalid response from Reportei API',
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract Instagram data from Reportei response
    // The structure depends on how Reportei formats their dashboard data
    const instagramData = reporteiData?.instagram || reporteiData?.data?.instagram || reporteiData;
    
    // Extract profile metrics
    const profile: ReporteiProfile = instagramData?.profile || instagramData?.account || {};
    const posts: ReporteiPost[] = instagramData?.posts || instagramData?.media || [];

    console.log(`Found ${posts.length} posts from Reportei`);

    // Update user profile with Instagram stats
    if (profile.followers_count || profile.follows_count || profile.media_count) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          instagram_followers: profile.followers_count || 0,
          instagram_following: profile.follows_count || 0,
          instagram_posts_count: profile.media_count || 0,
          last_sync_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
      }
    }

    // Process and upsert posts
    let processedCount = 0;
    for (const post of posts) {
      // Calculate engagement rate
      const likes = post.like_count || 0;
      const comments = post.comments_count || 0;
      const saves = post.saved_count || 0;
      const shares = post.shares_count || 0;
      const views = post.plays || post.reach || 1;
      const totalEngagement = likes + comments + saves;
      const engagementRate = parseFloat(((totalEngagement / views) * 100).toFixed(2));

      const postData = {
        id: post.id || `${user.id}_${post.permalink || Date.now()}`,
        user_id: user.id,
        post_url: post.permalink || null,
        thumbnail_url: post.thumbnail_url || post.media_url || null,
        caption: post.caption || null,
        post_type: post.type || post.media_type || 'post',
        published_at: post.timestamp || null,
        likes,
        comments,
        saves,
        shares,
        views,
        engagement_rate: engagementRate,
        scraped_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from('ig_posts')
        .upsert(postData, { onConflict: 'id' });

      if (upsertError) {
        console.error('Error upserting post:', upsertError);
      } else {
        processedCount++;
      }
    }

    console.log(`Successfully processed ${processedCount} posts`);

    // Update last sync timestamp
    await supabase
      .from('users')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', user.id);

    return new Response(JSON.stringify({
      success: true,
      message: `Synced ${processedCount} posts from Reportei`,
      profile: {
        followers: profile.followers_count,
        following: profile.follows_count,
        posts: profile.media_count,
      },
      posts_synced: processedCount,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
