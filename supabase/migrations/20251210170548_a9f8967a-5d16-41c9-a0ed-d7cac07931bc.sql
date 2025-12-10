-- Add UNIQUE constraint on post_url for upsert to work correctly
ALTER TABLE public.ig_posts 
ADD CONSTRAINT ig_posts_post_url_unique UNIQUE (post_url);

-- Add index on user_id and published_at for better query performance
CREATE INDEX IF NOT EXISTS idx_ig_posts_user_published 
ON public.ig_posts(user_id, published_at DESC);