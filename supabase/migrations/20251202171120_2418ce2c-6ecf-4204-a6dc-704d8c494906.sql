-- Adicionar colunas para projetos e entregas na tabela existente
ALTER TABLE public.client_project_data
ADD COLUMN IF NOT EXISTS projetos JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS entregas JSONB DEFAULT '[]';

-- Criar tabela para histórico de atividades
CREATE TABLE public.client_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.client_activities ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own activities"
  ON public.client_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON public.client_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);