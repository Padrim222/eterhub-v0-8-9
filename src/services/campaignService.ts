import { supabase } from "@/integrations/supabase/client";

export interface ContentCampaign {
    id: string;
    user_id: string;
    title: string;
    status: 'upload' | 'ideation' | 'research' | 'structure' | 'script' | 'completed';
    current_step: number;
    upload_data: any;
    ideation_data: any;
    research_data: any;
    structure_data: any;
    script_data: any;
    created_at: string;
    updated_at: string;
}

export const campaignService = {
    async create(title: string = "Nova Campanha") {
        const { data, error } = await supabase
            .from('content_campaigns')
            .insert({ title })
            .select()
            .single();

        if (error) console.error("Error creating campaign:", error);
        if (error) throw error;
        return data as ContentCampaign;
    },

    async update(id: string, updates: Partial<ContentCampaign>) {
        const { data, error } = await supabase
            .from('content_campaigns')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) console.error("Error updating campaign:", error);
        if (error) throw error;
        return data as ContentCampaign;
    },

    async get(id: string) {
        const { data, error } = await supabase
            .from('content_campaigns')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as ContentCampaign;
    },

    async list() {
        const { data, error } = await supabase
            .from('content_campaigns')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data as ContentCampaign[];
    }
};
