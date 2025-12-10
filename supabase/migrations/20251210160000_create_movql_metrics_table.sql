-- Create movql_metrics table for tracking qualified leads by month
CREATE TABLE IF NOT EXISTS public.movql_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month_year text NOT NULL, -- Format: "2025-01" for January 2025
  leads_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable RLS
ALTER TABLE public.movql_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own MOVQL metrics" ON public.movql_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MOVQL metrics" ON public.movql_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MOVQL metrics" ON public.movql_metrics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own MOVQL metrics" ON public.movql_metrics
  FOR DELETE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_movql_metrics_user_month 
  ON public.movql_metrics(user_id, month_year);

CREATE INDEX IF NOT EXISTS idx_movql_metrics_user_id 
  ON public.movql_metrics(user_id);
