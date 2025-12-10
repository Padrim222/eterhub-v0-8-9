-- Adicionar campos para foto e nome do líder à tabela users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS leader_title TEXT DEFAULT 'Líder';

-- Comentários para documentação
COMMENT ON COLUMN public.users.avatar_url IS 'URL da foto do líder do movimento';
COMMENT ON COLUMN public.users.leader_title IS 'Título do líder (ex: Líder, Mentor, Coach)';