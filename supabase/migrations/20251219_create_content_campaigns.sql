-- Content Campaigns Table (Stores state of Social Media Pipeline)
CREATE TABLE IF NOT EXISTS content_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Nova Campanha',
    status TEXT DEFAULT 'upload', -- upload, ideation, research, structure, completed
    current_step INTEGER DEFAULT 0,
    
    -- JSONB Store for each step's complex data
    upload_data JSONB,    -- { url, analysis_md, filename }
    ideation_data JSONB,  -- { raw_output, selected_ideas: [], refinement_text }
    research_data JSONB,  -- { raw_output, research_points: [], refinement_text }
    structure_data JSONB, -- { raw_output, blocks: [], refinement_text }
    script_data JSONB,    -- { raw_output, final_content }

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE content_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaigns" ON content_campaigns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns" ON content_campaigns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" ON content_campaigns
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns" ON content_campaigns
    FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_campaigns_updated_at
    BEFORE UPDATE ON content_campaigns
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
