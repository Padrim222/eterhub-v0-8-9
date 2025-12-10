-- Drop existing tables that will be replaced
DROP TABLE IF EXISTS public.ai_analysis CASCADE;
DROP TABLE IF EXISTS public.transcriptions CASCADE;
DROP TABLE IF EXISTS public.post_metrics CASCADE;
DROP TABLE IF EXISTS public.instagram_posts CASCADE;
DROP TABLE IF EXISTS public.instagram_accounts CASCADE;

-- Create USERS table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT,
  email TEXT,
  instagram_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create IG_POSTS table
CREATE TABLE public.ig_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_url TEXT,
  post_type TEXT DEFAULT 'reel',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  engagement_rate FLOAT DEFAULT 0.0,
  published_at TIMESTAMP WITH TIME ZONE,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on ig_posts table
ALTER TABLE public.ig_posts ENABLE ROW LEVEL SECURITY;

-- Create TRANSCRIPTS table
CREATE TABLE public.transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.ig_posts(id) ON DELETE CASCADE,
  transcript_text TEXT,
  duration_seconds FLOAT,
  language TEXT DEFAULT 'pt',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on transcripts table
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;

-- Create ANALYSES table
CREATE TABLE public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.ig_posts(id) ON DELETE CASCADE,
  ai_insights TEXT,
  retention_score FLOAT,
  engagement_score FLOAT,
  imov_score FLOAT,
  communication_errors JSONB,
  recommendations JSONB,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on analyses table
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Update the handle_new_user function to create user in users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  
  -- Keep profiles table for compatibility
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  RETURN NEW;
END;
$$;

-- RLS Policies for users table
CREATE POLICY "Users can view own data"
  ON public.users
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (id = auth.uid());

-- RLS Policies for ig_posts table
CREATE POLICY "Users can view own posts"
  ON public.ig_posts
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own posts"
  ON public.ig_posts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts"
  ON public.ig_posts
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own posts"
  ON public.ig_posts
  FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for transcripts table
CREATE POLICY "Users can view own transcripts"
  ON public.transcripts
  FOR SELECT
  USING (post_id IN (
    SELECT id FROM public.ig_posts WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own transcripts"
  ON public.transcripts
  FOR INSERT
  WITH CHECK (post_id IN (
    SELECT id FROM public.ig_posts WHERE user_id = auth.uid()
  ));

-- RLS Policies for analyses table
CREATE POLICY "Users can view own analyses"
  ON public.analyses
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own analyses"
  ON public.analyses
  FOR INSERT
  WITH CHECK (user_id = auth.uid());