-- Add CRM fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pipedrive_api_token text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pipedrive_company_domain text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS crm_last_sync_at timestamp with time zone;

-- Create deals table for sales tracking
CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pipedrive_deal_id text,
  title text NOT NULL,
  value numeric DEFAULT 0,
  currency text DEFAULT 'BRL',
  status text DEFAULT 'open',
  stage_name text,
  won_at timestamp with time zone,
  lost_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on deals
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- RLS policies for deals
CREATE POLICY "Users can view own deals" ON public.deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deals" ON public.deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own deals" ON public.deals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own deals" ON public.deals FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();