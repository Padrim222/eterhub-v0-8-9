-- Adicionar coluna post_url única para evitar duplicatas no scraping
ALTER TABLE public.ig_posts
ADD COLUMN IF NOT EXISTS post_url TEXT UNIQUE;

-- Criar índice para melhor performance nas consultas por URL
CREATE INDEX IF NOT EXISTS idx_ig_posts_post_url ON public.ig_posts(post_url);

-- Comentário para documentação
COMMENT ON COLUMN public.ig_posts.post_url IS 'URL única do post do Instagram para evitar duplicatas no scraping';