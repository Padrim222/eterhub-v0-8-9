-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create instagram_accounts table
CREATE TABLE public.instagram_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  account_id TEXT,
  profile_picture_url TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, username)
);

ALTER TABLE public.instagram_accounts ENABLE ROW LEVEL SECURITY;

-- Create instagram_posts table
CREATE TABLE public.instagram_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_account_id UUID REFERENCES public.instagram_accounts(id) ON DELETE CASCADE NOT NULL,
  post_id TEXT UNIQUE NOT NULL,
  post_type TEXT CHECK (post_type IN ('reel', 'post', 'carousel')) DEFAULT 'reel',
  caption TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  permalink TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

-- Create post_metrics table
CREATE TABLE public.post_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.instagram_posts(id) ON DELETE CASCADE NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  retention_rate DECIMAL(5,2) DEFAULT 0,
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.post_metrics ENABLE ROW LEVEL SECURITY;

-- Create transcriptions table
CREATE TABLE public.transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.instagram_posts(id) ON DELETE CASCADE NOT NULL,
  transcript_text TEXT,
  language TEXT DEFAULT 'pt',
  duration_seconds INTEGER,
  transcribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.transcriptions ENABLE ROW LEVEL SECURITY;

-- Create ai_analysis table
CREATE TABLE public.ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.instagram_posts(id) ON DELETE CASCADE NOT NULL,
  analysis_type TEXT CHECK (analysis_type IN ('content', 'performance', 'optimization')) DEFAULT 'content',
  insights JSONB,
  recommendations TEXT[],
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for instagram_accounts
CREATE POLICY "Users can view own Instagram accounts"
  ON public.instagram_accounts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own Instagram accounts"
  ON public.instagram_accounts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own Instagram accounts"
  ON public.instagram_accounts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own Instagram accounts"
  ON public.instagram_accounts FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for instagram_posts
CREATE POLICY "Users can view own Instagram posts"
  ON public.instagram_posts FOR SELECT
  USING (instagram_account_id IN (
    SELECT id FROM public.instagram_accounts WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own Instagram posts"
  ON public.instagram_posts FOR INSERT
  WITH CHECK (instagram_account_id IN (
    SELECT id FROM public.instagram_accounts WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own Instagram posts"
  ON public.instagram_posts FOR UPDATE
  USING (instagram_account_id IN (
    SELECT id FROM public.instagram_accounts WHERE user_id = auth.uid()
  ));

-- RLS Policies for post_metrics
CREATE POLICY "Users can view own post metrics"
  ON public.post_metrics FOR SELECT
  USING (post_id IN (
    SELECT p.id FROM public.instagram_posts p
    INNER JOIN public.instagram_accounts a ON p.instagram_account_id = a.id
    WHERE a.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own post metrics"
  ON public.post_metrics FOR INSERT
  WITH CHECK (post_id IN (
    SELECT p.id FROM public.instagram_posts p
    INNER JOIN public.instagram_accounts a ON p.instagram_account_id = a.id
    WHERE a.user_id = auth.uid()
  ));

-- RLS Policies for transcriptions
CREATE POLICY "Users can view own transcriptions"
  ON public.transcriptions FOR SELECT
  USING (post_id IN (
    SELECT p.id FROM public.instagram_posts p
    INNER JOIN public.instagram_accounts a ON p.instagram_account_id = a.id
    WHERE a.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own transcriptions"
  ON public.transcriptions FOR INSERT
  WITH CHECK (post_id IN (
    SELECT p.id FROM public.instagram_posts p
    INNER JOIN public.instagram_accounts a ON p.instagram_account_id = a.id
    WHERE a.user_id = auth.uid()
  ));

-- RLS Policies for ai_analysis
CREATE POLICY "Users can view own AI analysis"
  ON public.ai_analysis FOR SELECT
  USING (post_id IN (
    SELECT p.id FROM public.instagram_posts p
    INNER JOIN public.instagram_accounts a ON p.instagram_account_id = a.id
    WHERE a.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own AI analysis"
  ON public.ai_analysis FOR INSERT
  WITH CHECK (post_id IN (
    SELECT p.id FROM public.instagram_posts p
    INNER JOIN public.instagram_accounts a ON p.instagram_account_id = a.id
    WHERE a.user_id = auth.uid()
  ));

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for instagram_accounts updated_at
CREATE TRIGGER update_instagram_accounts_updated_at
  BEFORE UPDATE ON public.instagram_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for instagram_posts updated_at
CREATE TRIGGER update_instagram_posts_updated_at
  BEFORE UPDATE ON public.instagram_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();