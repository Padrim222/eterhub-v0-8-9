-- Pipeline Logs Table
CREATE TABLE IF NOT EXISTS pipeline_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stage_id TEXT NOT NULL,
    llm_provider TEXT,
    llm_model TEXT,
    input_context TEXT,
    output TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline Outputs Table (approved outputs)
CREATE TABLE IF NOT EXISTS pipeline_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stage_id TEXT NOT NULL,
    output TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, stage_id)
);

-- Content Themes Table (selected themes from ideation)
CREATE TABLE IF NOT EXISTS content_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme_title TEXT NOT NULL,
    theme_description TEXT,
    viralization_score DECIMAL(3,1),
    psychological_triggers TEXT[],
    suggested_format TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'selected', 'rejected', 'completed')),
    research_output TEXT,
    narrative_output TEXT,
    final_content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Formats Table
CREATE TABLE IF NOT EXISTS content_formats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    platform TEXT NOT NULL,
    structure JSONB,
    rules TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pipeline_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_formats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own pipeline logs" ON pipeline_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pipeline logs" ON pipeline_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own pipeline outputs" ON pipeline_outputs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own pipeline outputs" ON pipeline_outputs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own content themes" ON content_themes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own content themes" ON content_themes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own content formats" ON content_formats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own content formats" ON content_formats
    FOR ALL USING (auth.uid() = user_id);

-- Service Role bypass for Edge Functions
CREATE POLICY "Service role can manage pipeline logs" ON pipeline_logs
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can manage pipeline outputs" ON pipeline_outputs
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pipeline_logs_user_id ON pipeline_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_outputs_user_id ON pipeline_outputs(user_id);
CREATE INDEX IF NOT EXISTS idx_content_themes_user_id ON content_themes(user_id);
CREATE INDEX IF NOT EXISTS idx_content_formats_user_id ON content_formats(user_id);
