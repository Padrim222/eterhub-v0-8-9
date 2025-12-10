-- Create movql_metrics table
CREATE TABLE public.movql_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  month_year TEXT NOT NULL,
  leads_count INTEGER DEFAULT 0,
  qualified_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, month_year)
);

ALTER TABLE public.movql_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own movql_metrics" ON public.movql_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own movql_metrics" ON public.movql_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own movql_metrics" ON public.movql_metrics
  FOR UPDATE USING (auth.uid() = user_id);

-- Create sprint_tasks table
CREATE TABLE public.sprint_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  sprint_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sprint_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sprint_tasks" ON public.sprint_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sprint_tasks" ON public.sprint_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sprint_tasks" ON public.sprint_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sprint_tasks" ON public.sprint_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Add Pipedrive columns to leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS pipedrive_person_id TEXT,
ADD COLUMN IF NOT EXISTS pipedrive_deal_id TEXT,
ADD COLUMN IF NOT EXISTS pipedrive_stage TEXT,
ADD COLUMN IF NOT EXISTS pipedrive_value NUMERIC,
ADD COLUMN IF NOT EXISTS pipedrive_last_sync TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create index for Pipedrive lookups
CREATE INDEX IF NOT EXISTS idx_leads_pipedrive_person_id 
ON public.leads(pipedrive_person_id) WHERE pipedrive_person_id IS NOT NULL;