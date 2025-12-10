-- =============================================
-- TABELA: content_analyses
-- Descrição: Armazena análises geradas pelo agente de IA
-- =============================================

CREATE TABLE IF NOT EXISTS public.content_analyses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_type text NOT NULL DEFAULT 'performance' CHECK (analysis_type IN ('performance', 'trends', 'recommendations', 'full_report')),
    input_data jsonb NOT NULL DEFAULT '{}'::jsonb,
    analysis_result jsonb NOT NULL DEFAULT '{}'::jsonb,
    success_patterns jsonb DEFAULT '[]'::jsonb,
    recommendations jsonb DEFAULT '[]'::jsonb,
    top_posts jsonb DEFAULT '[]'::jsonb,
    metrics_summary jsonb DEFAULT '{}'::jsonb,
    model_used text DEFAULT 'google/gemini-2.5-flash',
    tokens_used integer DEFAULT 0,
    processing_time_ms integer DEFAULT 0,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.content_analyses IS 'Análises de performance de conteúdo geradas pelo agente de IA';

-- =============================================
-- ÍNDICES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_content_analyses_user_id ON public.content_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_content_analyses_type ON public.content_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_content_analyses_status ON public.content_analyses(status);
CREATE INDEX IF NOT EXISTS idx_content_analyses_created_at ON public.content_analyses(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.content_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content_analyses"
    ON public.content_analyses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content_analyses"
    ON public.content_analyses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content_analyses"
    ON public.content_analyses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content_analyses"
    ON public.content_analyses FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all content_analyses"
    ON public.content_analyses FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- TRIGGER updated_at
-- =============================================

CREATE TRIGGER update_content_analyses_updated_at
    BEFORE UPDATE ON public.content_analyses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();