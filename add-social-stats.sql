-- Execute este SQL no Supabase SQL Editor para adicionar campos de estatísticas sociais
-- Vá em: Supabase Dashboard > SQL Editor > New Query

-- Adicionar colunas para estatísticas do Instagram na tabela users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS instagram_followers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS instagram_following INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS instagram_posts_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_instagram_followers 
ON public.users(instagram_followers);

CREATE INDEX IF NOT EXISTS idx_users_last_sync 
ON public.users(last_sync_at);

-- Comentários para documentação
COMMENT ON COLUMN public.users.instagram_followers IS 'Número de seguidores no Instagram';
COMMENT ON COLUMN public.users.instagram_following IS 'Número de contas seguidas no Instagram';
COMMENT ON COLUMN public.users.instagram_posts_count IS 'Total de posts no Instagram';
COMMENT ON COLUMN public.users.last_sync_at IS 'Data/hora da última sincronização com Instagram';
