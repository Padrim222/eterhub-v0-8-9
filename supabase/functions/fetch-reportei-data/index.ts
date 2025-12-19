import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Reportei API v1
const REPORTEI_API_BASE = 'https://app.reportei.com/api/v1';

interface ReporteiClient {
  id: number;
  name: string;
  logo?: string;
  timezone?: string;
}

interface ReporteiReport {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  external_url?: string;
}

interface InstagramMetrics {
  followers?: number;
  following?: number;
  posts_count?: number;
  reach?: number;
  impressions?: number;
  engagement_rate?: number;
}

interface InstagramPost {
  id?: string;
  permalink?: string;
  thumbnail_url?: string;
  media_url?: string;
  caption?: string;
  media_type?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
  saved?: number;
  shares?: number;
  reach?: number;
  impressions?: number;
  plays?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== fetch-reportei-data: Starting ===');

    // Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Authenticated user:', user.id);

    // Get user's Reportei API key
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('reportei_api_key, reportei_client_id, instagram_username')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!userData.reportei_api_key) {
      return new Response(JSON.stringify({
        error: 'Reportei API key not configured. Please add your key in Settings.',
        action: 'configure_api_key'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = userData.reportei_api_key;
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    };

    // Parse request body for options
    let action = 'sync';
    let clientId = userData.reportei_client_id;

    try {
      const body = await req.json();
      action = body.action || 'sync';
      if (body.client_id) clientId = body.client_id;
    } catch {
      // No body, use defaults
    }

    // ACTION: List clients (for setup)
    if (action === 'list_clients') {
      console.log('Fetching Reportei clients...');

      const response = await fetch(`${REPORTEI_API_BASE}/clients`, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Reportei API error:', response.status, errorText);
        return new Response(JSON.stringify({
          error: 'Failed to fetch clients from Reportei',
          status: response.status
        }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();
      const clients: ReporteiClient[] = data.data || [];

      console.log(`Found ${clients.length} clients`);

      return new Response(JSON.stringify({
        success: true,
        clients: clients.map(c => ({ id: c.id, name: c.name, logo: c.logo }))
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: Set client ID
    if (action === 'set_client') {
      if (!clientId) {
        return new Response(JSON.stringify({ error: 'client_id required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      await supabase
        .from('users')
        .update({ reportei_client_id: String(clientId) })
        .eq('id', user.id);

      return new Response(JSON.stringify({ success: true, client_id: clientId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ACTION: Sync data (default)
    if (!clientId) {
      // Auto-select first client if not set
      const clientsResponse = await fetch(`${REPORTEI_API_BASE}/clients`, { headers });
      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        if (clientsData.data && clientsData.data.length > 0) {
          clientId = String(clientsData.data[0].id);
          // Save for next time
          await supabase
            .from('users')
            .update({ reportei_client_id: clientId })
            .eq('id', user.id);
        }
      }
    }

    if (!clientId) {
      return new Response(JSON.stringify({
        error: 'No Reportei client configured. Please select a client first.',
        action: 'select_client'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching reports for client:', clientId);

    // Get latest report
    const reportsResponse = await fetch(`${REPORTEI_API_BASE}/clients/${clientId}/reports`, { headers });

    if (!reportsResponse.ok) {
      console.error('Failed to fetch reports:', reportsResponse.status);
      return new Response(JSON.stringify({ error: 'Failed to fetch reports' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const reportsData = await reportsResponse.json();
    const reports: ReporteiReport[] = reportsData.data || [];

    if (reports.length === 0) {
      return new Response(JSON.stringify({
        error: 'No reports found for this client',
        action: 'create_report'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the most recent report
    const latestReport = reports[0];
    console.log('Using report:', latestReport.id, latestReport.title);

    // Fetch report details
    const reportResponse = await fetch(`${REPORTEI_API_BASE}/reports/${latestReport.id}`, { headers });

    if (!reportResponse.ok) {
      console.error('Failed to fetch report details:', reportResponse.status);
      return new Response(JSON.stringify({ error: 'Failed to fetch report details' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const reportData = await reportResponse.json();
    console.log('Report data received');

    // Extract Instagram data
    // The structure depends on Reportei's response format
    const report = reportData.report || reportData;
    const instagram = report.instagram || report.data?.instagram || {};

    // Profile metrics
    const profile: InstagramMetrics = instagram.profile || instagram.account || {};
    const posts: InstagramPost[] = instagram.posts || instagram.media || instagram.feed || [];

    console.log(`Found ${posts.length} posts from report`);

    // Update user profile
    if (profile.followers || profile.following) {
      await supabase
        .from('users')
        .update({
          instagram_followers: profile.followers || 0,
          instagram_following: profile.following || 0,
          instagram_posts_count: profile.posts_count || posts.length,
          last_sync_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }

    // Process and save posts
    let processedCount = 0;

    for (const post of posts) {
      const likes = post.like_count || 0;
      const comments = post.comments_count || 0;
      const saves = post.saved || 0;
      const shares = post.shares || 0;
      const views = post.plays || post.reach || post.impressions || 1;
      const totalEngagement = likes + comments + saves + shares;
      const engagementRate = parseFloat(((totalEngagement / views) * 100).toFixed(2));

      const postData = {
        id: post.id || `${user.id}_${post.permalink || Date.now()}_${processedCount}`,
        user_id: user.id,
        post_url: post.permalink || null,
        thumbnail_url: post.thumbnail_url || post.media_url || null,
        caption: post.caption || null,
        post_type: post.media_type || 'post',
        published_at: post.timestamp || null,
        likes,
        comments,
        saves,
        shares,
        views,
        reach: post.reach || 0,
        impressions: post.impressions || 0,
        engagement_rate: engagementRate,
        scraped_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from('ig_posts')
        .upsert(postData, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error('Error upserting post:', upsertError.message);
      } else {
        processedCount++;
      }
    }

    console.log(`Successfully processed ${processedCount} posts`);

    // Update last sync
    await supabase
      .from('users')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', user.id);

    return new Response(JSON.stringify({
      success: true,
      message: `Synced ${processedCount} posts from Reportei`,
      report: {
        id: latestReport.id,
        title: latestReport.title,
        period: `${latestReport.start_date} to ${latestReport.end_date}`
      },
      profile: {
        followers: profile.followers,
        following: profile.following,
        posts: profile.posts_count,
      },
      posts_synced: processedCount,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
