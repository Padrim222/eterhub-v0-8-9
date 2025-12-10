-- ============================================
-- SETUP COMPLETO LOVABLE CLOUD - ETER
-- Execute este SQL no Cloud → Database → SQL Editor
-- ============================================

-- 1. CRIAR TABELA DE USUÁRIOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  nome TEXT,
  instagram_username TEXT,
  avatar_url TEXT,
  leader_title TEXT,
  is_active BOOLEAN DEFAULT true,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CRIAR TABELA DE POSTS DO INSTAGRAM
-- ============================================
CREATE TABLE IF NOT EXISTS public.ig_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_url TEXT,
  thumbnail_url TEXT,
  post_type TEXT,
  caption TEXT,
  views INTEGER,
  likes INTEGER,
  comments INTEGER,
  saves INTEGER,
  shares INTEGER,
  engagement_rate NUMERIC,
  published_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CRIAR TABELA DE ANÁLISES
-- ============================================
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.ig_posts(id) ON DELETE CASCADE,
  imov_score NUMERIC,
  engagement_score NUMERIC,
  retention_score NUMERIC,
  ai_insights TEXT,
  recommendations JSONB,
  communication_errors JSONB,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CRIAR TABELA DE TRANSCRIÇÕES
-- ============================================
CREATE TABLE IF NOT EXISTS public.transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.ig_posts(id) ON DELETE CASCADE,
  transcript_text TEXT,
  language TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. HABILITAR RLS EM TODAS AS TABELAS
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ig_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;

-- 6. CRIAR POLÍTICAS RLS PARA USERS
-- ============================================
CREATE POLICY "Users can view own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- 7. CRIAR POLÍTICAS RLS PARA IG_POSTS
-- ============================================
CREATE POLICY "Users can view own posts" 
  ON public.ig_posts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts" 
  ON public.ig_posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" 
  ON public.ig_posts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" 
  ON public.ig_posts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 8. CRIAR POLÍTICAS RLS PARA ANALYSES
-- ============================================
CREATE POLICY "Users can view own analyses" 
  ON public.analyses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" 
  ON public.analyses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" 
  ON public.analyses 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 9. CRIAR POLÍTICAS RLS PARA TRANSCRIPTS
-- ============================================
CREATE POLICY "Users can view own transcripts" 
  ON public.transcripts 
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.ig_posts WHERE id = post_id
    )
  );

CREATE POLICY "Users can insert own transcripts" 
  ON public.transcripts 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.ig_posts WHERE id = post_id
    )
  );

-- 10. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_ig_posts_user_id ON public.ig_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_ig_posts_published_at ON public.ig_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_post_id ON public.analyses(post_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_post_id ON public.transcripts(post_id);

-- 11. CRIAR FUNÇÃO PARA ATUALIZAR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. TRIGGER PARA ATUALIZAR UPDATED_AT
-- ============================================
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 13. FUNÇÃO PARA CRIAR PERFIL AUTOMÁTICO
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (new.id, new.email, NOW());
  RETURN NEW;
END;
$$;

-- 14. TRIGGER PARA CRIAR PERFIL AO CADASTRAR
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 15. FUNÇÃO PARA CALCULAR ENGAGEMENT RATE
-- ============================================
CREATE OR REPLACE FUNCTION calculate_engagement_rate(
  p_likes INTEGER,
  p_comments INTEGER,
  p_saves INTEGER,
  p_views INTEGER
)
RETURNS NUMERIC AS $$
BEGIN
  IF p_views IS NULL OR p_views = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND(
    ((COALESCE(p_likes, 0) + COALESCE(p_comments, 0) + COALESCE(p_saves, 0))::NUMERIC / p_views) * 100,
    2
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- ✅ SETUP COMPLETO!
-- ============================================
-- Próximos passos:
-- 1. Desabilitar "Confirm email" em Cloud → Authentication → Email
-- 2. Criar conta com brufab222@gmail.com
-- 3. Executar populate-test-user-data.sql para popular dados
-- ============================================
