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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const payload = await req.json();
    console.log('Received webhook payload:', JSON.stringify(payload, null, 2));

    // Extract user_id from the request or use a default mapping
    // You can pass user_id in the webhook payload or map by email/username
    const userId = payload.user_id || payload.userId;
    
    if (!userId) {
      throw new Error('user_id is required in the payload');
    }

    // Process Instagram posts metrics
    if (payload.posts && Array.isArray(payload.posts)) {
      for (const post of payload.posts) {
        const postData = {
          user_id: userId,
          post_url: post.url || post.post_url,
          thumbnail_url: post.thumbnail_url || post.thumbnail,
          post_type: post.type || post.post_type || 'post',
          views: post.views || post.impressions || 0,
          likes: post.likes || post.like_count || 0,
          comments: post.comments || post.comment_count || 0,
          shares: post.shares || post.share_count || 0,
          saves: post.saves || post.save_count || 0,
          engagement_rate: post.engagement_rate || 0,
          published_at: post.published_at || post.timestamp || new Date().toISOString(),
          scraped_at: new Date().toISOString(),
        };

        // Upsert post (insert or update if exists)
        const { error: postError } = await supabaseClient
          .from('ig_posts')
          .upsert(postData, { 
            onConflict: 'post_url',
            ignoreDuplicates: false 
          });

        if (postError) {
          console.error('Error inserting post:', postError);
        } else {
          console.log('Post saved successfully:', postData.post_url);
        }
      }
    }

    // Update user Instagram stats if provided
    if (payload.instagram_stats) {
      const stats = payload.instagram_stats;
      const { error: statsError } = await supabaseClient
        .from('users')
        .update({
          instagram_followers: stats.followers || stats.follower_count,
          instagram_following: stats.following || stats.following_count,
          instagram_posts_count: stats.posts_count || stats.media_count,
          last_sync_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (statsError) {
        console.error('Error updating user stats:', statsError);
      } else {
        console.log('User stats updated successfully');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Instagram metrics processed successfully',
        processed_posts: payload.posts?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});