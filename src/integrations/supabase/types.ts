export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analyses: {
        Row: {
          ai_insights: string | null
          analyzed_at: string | null
          communication_errors: Json | null
          engagement_score: number | null
          id: string
          imov_score: number | null
          post_id: string | null
          recommendations: Json | null
          retention_score: number | null
          user_id: string
        }
        Insert: {
          ai_insights?: string | null
          analyzed_at?: string | null
          communication_errors?: Json | null
          engagement_score?: number | null
          id?: string
          imov_score?: number | null
          post_id?: string | null
          recommendations?: Json | null
          retention_score?: number | null
          user_id: string
        }
        Update: {
          ai_insights?: string | null
          analyzed_at?: string | null
          communication_errors?: Json | null
          engagement_score?: number | null
          id?: string
          imov_score?: number | null
          post_id?: string | null
          recommendations?: Json | null
          retention_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analyses_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "ig_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_data: {
        Row: {
          campaign_id: string
          created_at: string | null
          date: string
          id: string
          leads_count: number | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          date: string
          id?: string
          leads_count?: number | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          date?: string
          id?: string
          leads_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_data_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      client_activities: {
        Row: {
          created_at: string | null
          data: string | null
          descricao: string | null
          id: string
          metadata: Json | null
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: string | null
          descricao?: string | null
          id?: string
          metadata?: Json | null
          tipo: string
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: string | null
          descricao?: string | null
          id?: string
          metadata?: Json | null
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      client_project_data: {
        Row: {
          alinhamento: Json | null
          created_at: string | null
          entregas: Json | null
          expectativas: Json | null
          id: string
          links: Json | null
          planejamento: Json | null
          projetos: Json | null
          retrospectiva: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alinhamento?: Json | null
          created_at?: string | null
          entregas?: Json | null
          expectativas?: Json | null
          id?: string
          links?: Json | null
          planejamento?: Json | null
          projetos?: Json | null
          retrospectiva?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alinhamento?: Json | null
          created_at?: string | null
          entregas?: Json | null
          expectativas?: Json | null
          id?: string
          links?: Json | null
          planejamento?: Json | null
          projetos?: Json | null
          retrospectiva?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_project_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      content_analyses: {
        Row: {
          analysis_result: Json
          analysis_type: string
          created_at: string | null
          error_message: string | null
          id: string
          input_data: Json
          metrics_summary: Json | null
          model_used: string | null
          processing_time_ms: number | null
          recommendations: Json | null
          status: string
          success_patterns: Json | null
          tokens_used: number | null
          top_posts: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_result?: Json
          analysis_type?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json
          metrics_summary?: Json | null
          model_used?: string | null
          processing_time_ms?: number | null
          recommendations?: Json | null
          status?: string
          success_patterns?: Json | null
          tokens_used?: number | null
          top_posts?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_result?: Json
          analysis_type?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json
          metrics_summary?: Json | null
          model_used?: string | null
          processing_time_ms?: number | null
          recommendations?: Json | null
          status?: string
          success_patterns?: Json | null
          tokens_used?: number | null
          top_posts?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      content_metrics: {
        Row: {
          attribution_data: Json | null
          channel: string
          content_id: string | null
          created_at: string | null
          external_post_id: string
          id: string
          leads_generated: number | null
          new_followers: number | null
          platform_data_json: Json
          success_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attribution_data?: Json | null
          channel: string
          content_id?: string | null
          created_at?: string | null
          external_post_id: string
          id?: string
          leads_generated?: number | null
          new_followers?: number | null
          platform_data_json?: Json
          success_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attribution_data?: Json | null
          channel?: string
          content_id?: string | null
          created_at?: string | null
          external_post_id?: string
          id?: string
          leads_generated?: number | null
          new_followers?: number | null
          platform_data_json?: Json
          success_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_metrics_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "contents"
            referencedColumns: ["id"]
          },
        ]
      }
      contents: {
        Row: {
          content_type: string
          created_at: string | null
          id: string
          is_canonical: boolean | null
          metadata: Json | null
          narrative_skeleton_id: string | null
          production_status: string | null
          resource_format_id: string
          style_checker_details: Json | null
          style_checker_score: number | null
          text_content: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string | null
          id?: string
          is_canonical?: boolean | null
          metadata?: Json | null
          narrative_skeleton_id?: string | null
          production_status?: string | null
          resource_format_id: string
          style_checker_details?: Json | null
          style_checker_score?: number | null
          text_content: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string | null
          id?: string
          is_canonical?: boolean | null
          metadata?: Json | null
          narrative_skeleton_id?: string | null
          production_status?: string | null
          resource_format_id?: string
          style_checker_details?: Json | null
          style_checker_score?: number | null
          text_content?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contents_narrative_skeleton_id_fkey"
            columns: ["narrative_skeleton_id"]
            isOneToOne: false
            referencedRelation: "narrative_skeletons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contents_resource_format_id_fkey"
            columns: ["resource_format_id"]
            isOneToOne: false
            referencedRelation: "resource_formats"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          created_at: string | null
          currency: string | null
          id: string
          lost_at: string | null
          pipedrive_deal_id: string | null
          stage_name: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
          value: number | null
          won_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          id?: string
          lost_at?: string | null
          pipedrive_deal_id?: string | null
          stage_name?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          value?: number | null
          won_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          id?: string
          lost_at?: string | null
          pipedrive_deal_id?: string | null
          stage_name?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          value?: number | null
          won_at?: string | null
        }
        Relationships: []
      }
      icps: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          position: number | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          position?: number | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          position?: number | null
          user_id?: string
        }
        Relationships: []
      }
      ig_posts: {
        Row: {
          caption: string | null
          comments: number | null
          engagement_rate: number | null
          id: string
          likes: number | null
          post_type: string | null
          post_url: string | null
          published_at: string | null
          saves: number | null
          scraped_at: string | null
          shares: number | null
          thumbnail_url: string | null
          user_id: string
          views: number | null
        }
        Insert: {
          caption?: string | null
          comments?: number | null
          engagement_rate?: number | null
          id?: string
          likes?: number | null
          post_type?: string | null
          post_url?: string | null
          published_at?: string | null
          saves?: number | null
          scraped_at?: string | null
          shares?: number | null
          thumbnail_url?: string | null
          user_id: string
          views?: number | null
        }
        Update: {
          caption?: string | null
          comments?: number | null
          engagement_rate?: number | null
          id?: string
          likes?: number | null
          post_type?: string | null
          post_url?: string | null
          published_at?: string | null
          saves?: number | null
          scraped_at?: string | null
          shares?: number | null
          thumbnail_url?: string | null
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ig_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string | null
          email: string | null
          engagement_score: number | null
          icp_id: string | null
          id: string
          income: number | null
          is_qualified: boolean | null
          lead_score: number | null
          metadata: Json | null
          name: string
          phone: string | null
          pipedrive_deal_id: string | null
          pipedrive_last_sync: string | null
          pipedrive_person_id: string | null
          pipedrive_stage: string | null
          pipedrive_value: number | null
          position: number | null
          qualification_score: number | null
          source_channel: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          engagement_score?: number | null
          icp_id?: string | null
          id?: string
          income?: number | null
          is_qualified?: boolean | null
          lead_score?: number | null
          metadata?: Json | null
          name: string
          phone?: string | null
          pipedrive_deal_id?: string | null
          pipedrive_last_sync?: string | null
          pipedrive_person_id?: string | null
          pipedrive_stage?: string | null
          pipedrive_value?: number | null
          position?: number | null
          qualification_score?: number | null
          source_channel?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          engagement_score?: number | null
          icp_id?: string | null
          id?: string
          income?: number | null
          is_qualified?: boolean | null
          lead_score?: number | null
          metadata?: Json | null
          name?: string
          phone?: string | null
          pipedrive_deal_id?: string | null
          pipedrive_last_sync?: string | null
          pipedrive_person_id?: string | null
          pipedrive_stage?: string | null
          pipedrive_value?: number | null
          position?: number | null
          qualification_score?: number | null
          source_channel?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_icp_id_fkey"
            columns: ["icp_id"]
            isOneToOne: false
            referencedRelation: "icps"
            referencedColumns: ["id"]
          },
        ]
      }
      movql_metrics: {
        Row: {
          created_at: string | null
          id: string
          leads_count: number | null
          month_year: string
          qualified_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          leads_count?: number | null
          month_year: string
          qualified_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          leads_count?: number | null
          month_year?: string
          qualified_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      narrative_skeletons: {
        Row: {
          angle_selected: string | null
          angle_suggestions: Json | null
          created_at: string | null
          format_defined: string
          id: string
          research_map_id: string
          resource_format_id: string | null
          skeleton_structure: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          angle_selected?: string | null
          angle_suggestions?: Json | null
          created_at?: string | null
          format_defined: string
          id?: string
          research_map_id: string
          resource_format_id?: string | null
          skeleton_structure?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          angle_selected?: string | null
          angle_suggestions?: Json | null
          created_at?: string | null
          format_defined?: string
          id?: string
          research_map_id?: string
          resource_format_id?: string | null
          skeleton_structure?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "narrative_skeletons_research_map_id_fkey"
            columns: ["research_map_id"]
            isOneToOne: false
            referencedRelation: "research_maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "narrative_skeletons_resource_format_id_fkey"
            columns: ["resource_format_id"]
            isOneToOne: false
            referencedRelation: "resource_formats"
            referencedColumns: ["id"]
          },
        ]
      }
      playbooks: {
        Row: {
          analysis_id: string | null
          client_context: string | null
          created_at: string | null
          current_stage: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          position: number | null
          slug: string
          status: string | null
          success_patterns_input: Json | null
          themes: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          client_context?: string | null
          created_at?: string | null
          current_stage?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          position?: number | null
          slug: string
          status?: string | null
          success_patterns_input?: Json | null
          themes?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          client_context?: string | null
          created_at?: string | null
          current_stage?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          position?: number | null
          slug?: string
          status?: string | null
          success_patterns_input?: Json | null
          themes?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbooks_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "content_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      research_maps: {
        Row: {
          created_at: string | null
          id: string
          map_data: Json
          playbook_id: string | null
          source_context: string | null
          theme_title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          map_data?: Json
          playbook_id?: string | null
          source_context?: string | null
          theme_title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          map_data?: Json
          playbook_id?: string | null
          source_context?: string | null
          theme_title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_maps_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_formats: {
        Row: {
          created_at: string | null
          duration_or_slides: string | null
          format_type: string
          id: string
          is_active: boolean | null
          name: string
          playbook_id: string
          style_rules: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_or_slides?: string | null
          format_type: string
          id?: string
          is_active?: boolean | null
          name: string
          playbook_id: string
          style_rules?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_or_slides?: string | null
          format_type?: string
          id?: string
          is_active?: boolean | null
          name?: string
          playbook_id?: string
          style_rules?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_formats_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint_tasks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          position: number | null
          sprint_id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          position?: number | null
          sprint_id: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          position?: number | null
          sprint_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transcripts: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          id: string
          language: string | null
          post_id: string
          transcript_text: string | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          language?: string | null
          post_id: string
          transcript_text?: string | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          language?: string | null
          post_id?: string
          transcript_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "ig_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          crm_last_sync_at: string | null
          email: string | null
          id: string
          instagram_followers: number | null
          instagram_following: number | null
          instagram_posts_count: number | null
          instagram_username: string | null
          is_active: boolean | null
          last_sync_at: string | null
          leader_title: string | null
          nome: string | null
          onboarding_completed: boolean | null
          pipedrive_api_token: string | null
          pipedrive_company_domain: string | null
          reportei_api_key: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          crm_last_sync_at?: string | null
          email?: string | null
          id: string
          instagram_followers?: number | null
          instagram_following?: number | null
          instagram_posts_count?: number | null
          instagram_username?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          leader_title?: string | null
          nome?: string | null
          onboarding_completed?: boolean | null
          pipedrive_api_token?: string | null
          pipedrive_company_domain?: string | null
          reportei_api_key?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          crm_last_sync_at?: string | null
          email?: string | null
          id?: string
          instagram_followers?: number | null
          instagram_following?: number | null
          instagram_posts_count?: number | null
          instagram_username?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          leader_title?: string | null
          nome?: string | null
          onboarding_completed?: boolean | null
          pipedrive_api_token?: string | null
          pipedrive_company_domain?: string | null
          reportei_api_key?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_engagement_rate: {
        Args: {
          p_comments: number
          p_likes: number
          p_saves: number
          p_views: number
        }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
