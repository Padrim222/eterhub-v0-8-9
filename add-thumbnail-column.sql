-- Execute este SQL no Supabase SQL Editor para adicionar suporte a thumbnails
-- Vá em: Supabase Dashboard > SQL Editor > New Query

-- Adicionar coluna thumbnail_url na tabela ig_posts
ALTER TABLE public.ig_posts 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_ig_posts_thumbnail 
ON public.ig_posts(thumbnail_url);

-- Comentário para documentação
COMMENT ON COLUMN public.ig_posts.thumbnail_url IS 'URL da thumbnail/imagem do post do Instagram para exibição na grade';
