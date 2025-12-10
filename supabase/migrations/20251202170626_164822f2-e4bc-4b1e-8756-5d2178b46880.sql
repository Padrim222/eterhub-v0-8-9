-- Criar tabela para armazenar dados do projeto do cliente
CREATE TABLE public.client_project_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Dados estruturados como JSONB
  alinhamento JSONB DEFAULT '{"porque": "", "metaAnual": ""}',
  expectativas JSONB DEFAULT '[]',
  links JSONB DEFAULT '[]',
  planejamento JSONB DEFAULT '{}',
  retrospectiva JSONB DEFAULT '{"keepDoing": [], "stopDoing": [], "startDoing": []}',
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garantir apenas um registro por usuário
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.client_project_data ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own project data"
  ON public.client_project_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own project data"
  ON public.client_project_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own project data"
  ON public.client_project_data FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_client_project_data_updated_at
  BEFORE UPDATE ON public.client_project_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();