-- =============================================
-- TABELA: content_metrics
-- Descrição: Métricas de performance de conteúdos publicados
-- =============================================

-- Criar tabela content_metrics
CREATE TABLE IF NOT EXISTS public.content_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id uuid REFERENCES public.contents(id) ON DELETE SET NULL,
    external_post_id text NOT NULL,
    channel text NOT NULL CHECK (channel IN ('instagram', 'youtube', 'tiktok', 'pinterest', 'linkedin', 'twitter', 'facebook', 'other')),
    platform_data_json jsonb NOT NULL DEFAULT '{}'::jsonb,
    success_score numeric(5, 2) DEFAULT 0.0,
    leads_generated integer DEFAULT 0,
    new_followers integer DEFAULT 0,
    attribution_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(external_post_id, channel, user_id)
);

-- Comentário da tabela
COMMENT ON TABLE public.content_metrics IS 'Métricas de performance de conteúdos publicados nas redes sociais';

-- =============================================
-- ÍNDICES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_content_metrics_user_id ON public.content_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_content_metrics_content_id ON public.content_metrics(content_id);
CREATE INDEX IF NOT EXISTS idx_content_metrics_channel ON public.content_metrics(channel);
CREATE INDEX IF NOT EXISTS idx_content_metrics_external_post_id ON public.content_metrics(external_post_id);
CREATE INDEX IF NOT EXISTS idx_content_metrics_created_at ON public.content_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_metrics_success_score ON public.content_metrics(success_score DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.content_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY "Users can view own content_metrics"
    ON public.content_metrics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content_metrics"
    ON public.content_metrics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content_metrics"
    ON public.content_metrics FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content_metrics"
    ON public.content_metrics FOR DELETE
    USING (auth.uid() = user_id);

-- Política para admins
CREATE POLICY "Admins can view all content_metrics"
    ON public.content_metrics FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- TRIGGER updated_at
-- =============================================

CREATE TRIGGER update_content_metrics_updated_at
    BEFORE UPDATE ON public.content_metrics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();