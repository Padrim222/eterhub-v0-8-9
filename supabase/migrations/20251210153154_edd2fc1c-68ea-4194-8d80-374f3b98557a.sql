-- Create ICPs table
CREATE TABLE IF NOT EXISTS public.icps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  icp_id UUID REFERENCES public.icps(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source_channel TEXT,
  income NUMERIC,
  qualification_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  lead_score INTEGER DEFAULT 0,
  is_qualified BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#ef4444',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Campaign Data table
CREATE TABLE IF NOT EXISTS public.campaign_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  leads_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(campaign_id, date)
);

-- Add Instagram columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS instagram_followers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS instagram_following INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS instagram_posts_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ;

-- Enable RLS on all new tables
ALTER TABLE public.icps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_data ENABLE ROW LEVEL SECURITY;

-- ICPs RLS Policies
CREATE POLICY "Users can view own icps" ON public.icps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own icps" ON public.icps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own icps" ON public.icps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own icps" ON public.icps FOR DELETE USING (auth.uid() = user_id);

-- Leads RLS Policies
CREATE POLICY "Users can view own leads" ON public.leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own leads" ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leads" ON public.leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own leads" ON public.leads FOR DELETE USING (auth.uid() = user_id);

-- Campaigns RLS Policies
CREATE POLICY "Users can view own campaigns" ON public.campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own campaigns" ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own campaigns" ON public.campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own campaigns" ON public.campaigns FOR DELETE USING (auth.uid() = user_id);

-- Campaign Data RLS Policies (based on campaign ownership)
CREATE POLICY "Users can view own campaign data" ON public.campaign_data FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.campaigns WHERE campaigns.id = campaign_data.campaign_id AND campaigns.user_id = auth.uid()));

CREATE POLICY "Users can insert own campaign data" ON public.campaign_data FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.campaigns WHERE campaigns.id = campaign_data.campaign_id AND campaigns.user_id = auth.uid()));

CREATE POLICY "Users can update own campaign data" ON public.campaign_data FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.campaigns WHERE campaigns.id = campaign_data.campaign_id AND campaigns.user_id = auth.uid()));

CREATE POLICY "Users can delete own campaign data" ON public.campaign_data FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.campaigns WHERE campaigns.id = campaign_data.campaign_id AND campaigns.user_id = auth.uid()));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_icp_id ON public.leads(icp_id);
CREATE INDEX IF NOT EXISTS idx_icps_user_id ON public.icps(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_data_campaign_id ON public.campaign_data(campaign_id);