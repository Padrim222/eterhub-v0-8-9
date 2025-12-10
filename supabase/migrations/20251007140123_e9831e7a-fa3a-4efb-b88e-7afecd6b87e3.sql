-- Add UNIQUE constraint to post_url to enable upsert
ALTER TABLE public.ig_posts 
ADD CONSTRAINT ig_posts_post_url_key UNIQUE (post_url);

-- Add index for better performance on user queries
CREATE INDEX IF NOT EXISTS idx_ig_posts_user_published 
ON public.ig_posts(user_id, published_at DESC);