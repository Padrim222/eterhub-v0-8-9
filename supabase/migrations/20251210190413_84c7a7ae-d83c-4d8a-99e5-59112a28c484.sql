-- =====================================================
-- ETER Content Pipeline Tables
-- Tables: playbooks, resource_formats, research_maps, narrative_skeletons, contents
-- =====================================================

-- 1. PLAYBOOKS TABLE
CREATE TABLE IF NOT EXISTS public.playbooks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    position integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, slug)
);

-- 2. RESOURCE_FORMATS TABLE
CREATE TABLE IF NOT EXISTS public.resource_formats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    playbook_id uuid NOT NULL REFERENCES public.playbooks(id) ON DELETE CASCADE,
    name text NOT NULL,
    format_type text NOT NULL CHECK (format_type IN ('reels', 'carrossel', 'stories', 'post_estatico', 'live', 'outros')),
    duration_or_slides text,
    style_rules jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. RESEARCH_MAPS TABLE
CREATE TABLE IF NOT EXISTS public.research_maps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    playbook_id uuid REFERENCES public.playbooks(id) ON DELETE SET NULL,
    theme_title text NOT NULL,
    map_data jsonb NOT NULL DEFAULT '{}'::jsonb,
    source_context text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. NARRATIVE_SKELETONS TABLE
CREATE TABLE IF NOT EXISTS public.narrative_skeletons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    research_map_id uuid NOT NULL REFERENCES public.research_maps(id) ON DELETE RESTRICT,
    resource_format_id uuid REFERENCES public.resource_formats(id) ON DELETE SET NULL,
    format_defined text NOT NULL,
    skeleton_structure jsonb NOT NULL DEFAULT '{}'::jsonb,
    angle_suggestions jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. CONTENTS TABLE
CREATE TABLE IF NOT EXISTS public.contents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_format_id uuid NOT NULL REFERENCES public.resource_formats(id) ON DELETE RESTRICT,
    narrative_skeleton_id uuid REFERENCES public.narrative_skeletons(id) ON DELETE SET NULL,
    title text NOT NULL,
    text_content text NOT NULL,
    content_type text NOT NULL CHECK (content_type IN ('roteiro', 'legenda', 'carrossel', 'outros')),
    style_checker_score numeric(3, 1) DEFAULT 0.0,
    metadata jsonb DEFAULT '{}'::jsonb,
    is_canonical boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_playbooks_user_id ON public.playbooks(user_id);
CREATE INDEX IF NOT EXISTS idx_playbooks_slug ON public.playbooks(slug);
CREATE INDEX IF NOT EXISTS idx_playbooks_is_active ON public.playbooks(is_active);

CREATE INDEX IF NOT EXISTS idx_resource_formats_user_id ON public.resource_formats(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_formats_playbook_id ON public.resource_formats(playbook_id);
CREATE INDEX IF NOT EXISTS idx_resource_formats_format_type ON public.resource_formats(format_type);

CREATE INDEX IF NOT EXISTS idx_research_maps_user_id ON public.research_maps(user_id);
CREATE INDEX IF NOT EXISTS idx_research_maps_playbook_id ON public.research_maps(playbook_id);
CREATE INDEX IF NOT EXISTS idx_research_maps_theme ON public.research_maps(theme_title);

CREATE INDEX IF NOT EXISTS idx_narrative_skeletons_user_id ON public.narrative_skeletons(user_id);
CREATE INDEX IF NOT EXISTS idx_narrative_skeletons_research_map_id ON public.narrative_skeletons(research_map_id);
CREATE INDEX IF NOT EXISTS idx_narrative_skeletons_resource_format_id ON public.narrative_skeletons(resource_format_id);

CREATE INDEX IF NOT EXISTS idx_contents_user_id ON public.contents(user_id);
CREATE INDEX IF NOT EXISTS idx_contents_resource_format_id ON public.contents(resource_format_id);
CREATE INDEX IF NOT EXISTS idx_contents_content_type ON public.contents(content_type);
CREATE INDEX IF NOT EXISTS idx_contents_is_canonical ON public.contents(is_canonical);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.narrative_skeletons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - PLAYBOOKS
-- =====================================================

CREATE POLICY "Users can view own playbooks" ON public.playbooks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own playbooks" ON public.playbooks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playbooks" ON public.playbooks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own playbooks" ON public.playbooks
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all playbooks" ON public.playbooks
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES - RESOURCE_FORMATS
-- =====================================================

CREATE POLICY "Users can view own resource_formats" ON public.resource_formats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resource_formats" ON public.resource_formats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resource_formats" ON public.resource_formats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resource_formats" ON public.resource_formats
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all resource_formats" ON public.resource_formats
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES - RESEARCH_MAPS
-- =====================================================

CREATE POLICY "Users can view own research_maps" ON public.research_maps
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own research_maps" ON public.research_maps
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own research_maps" ON public.research_maps
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own research_maps" ON public.research_maps
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all research_maps" ON public.research_maps
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES - NARRATIVE_SKELETONS
-- =====================================================

CREATE POLICY "Users can view own narrative_skeletons" ON public.narrative_skeletons
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own narrative_skeletons" ON public.narrative_skeletons
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own narrative_skeletons" ON public.narrative_skeletons
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own narrative_skeletons" ON public.narrative_skeletons
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all narrative_skeletons" ON public.narrative_skeletons
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES - CONTENTS
-- =====================================================

CREATE POLICY "Users can view own contents" ON public.contents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contents" ON public.contents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contents" ON public.contents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contents" ON public.contents
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all contents" ON public.contents
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- TRIGGERS FOR updated_at
-- =====================================================

CREATE TRIGGER update_playbooks_updated_at
    BEFORE UPDATE ON public.playbooks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resource_formats_updated_at
    BEFORE UPDATE ON public.resource_formats
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_research_maps_updated_at
    BEFORE UPDATE ON public.research_maps
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_narrative_skeletons_updated_at
    BEFORE UPDATE ON public.narrative_skeletons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contents_updated_at
    BEFORE UPDATE ON public.contents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();