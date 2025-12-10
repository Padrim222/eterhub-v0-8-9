-- Tabela de ICPs (Ideal Customer Profiles)
CREATE TABLE IF NOT EXISTS public.icps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  criteria jsonb DEFAULT '{}',
  color text DEFAULT '#F59E0B',
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Leads
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  icp_id uuid REFERENCES public.icps(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text,
  phone text,
  source_channel text,
  income numeric,
  qualification_score numeric DEFAULT 0,
  engagement_score numeric DEFAULT 0,
  lead_score numeric DEFAULT 0,
  is_qualified boolean DEFAULT false,
  position integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_icp_id ON public.leads(icp_id);
CREATE INDEX IF NOT EXISTS idx_icps_user_id ON public.icps(user_id);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icps ENABLE ROW LEVEL SECURITY;

-- RLS Policies para leads
CREATE POLICY "Users can view their own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies para ICPs
CREATE POLICY "Users can view their own ICPs" ON public.icps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ICPs" ON public.icps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ICPs" ON public.icps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ICPs" ON public.icps
  FOR DELETE USING (auth.uid() = user_id);

-- Inserir ICPs de exemplo
INSERT INTO public.icps (user_id, name, color, position)
SELECT 
  id,
  'ICP 1',
  '#FCD34D',
  0
FROM auth.users
ON CONFLICT DO NOTHING;

INSERT INTO public.icps (user_id, name, color, position)
SELECT 
  id,
  'ICP 2',
  '#FCA5A5',
  1
FROM auth.users
ON CONFLICT DO NOTHING;