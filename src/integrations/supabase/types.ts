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
      agents: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          model: string | null
          name: string
          role: string
          system_prompt: string
          tools: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          model?: string | null
          name: string
          role: string
          system_prompt: string
          tools?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          model?: string | null
          name?: string
          role?: string
          system_prompt?: string
          tools?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      analyses: {
        Row: {
          ai_insights: string | null
          analyzed_at: string | null
          communication_errors: Json | null
          engagement_score: number | null
          id: string
          imov_score: number | null
          post_id: string
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
          post_id: string
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
          post_id?: string
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
      brand_identities: {
        Row: {
          id: string
          user_id: string
          name: string
          tone_of_voice: string | null
          key_terms: string[] | null
          beliefs: string | null
          avoid_terms: string[] | null
          psychological_profile: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          tone_of_voice?: string | null
          key_terms?: string[] | null
          beliefs?: string | null
          avoid_terms?: string[] | null
          psychological_profile?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          tone_of_voice?: string | null
          key_terms?: string[] | null
          beliefs?: string | null
          avoid_terms?: string[] | null
          psychological_profile?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_identities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          logs: Json | null
          status: string | null
          workflow_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          logs?: Json | null
          status?: string | null
          workflow_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          logs?: Json | null
          status?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          }
        ]
      }
      workflows: {
        Row: {
          created_at: string | null
          description: string | null
          edges: Json | null
          id: string
          name: string
          nodes: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          edges?: Json | null
          id?: string
          name: string
          nodes?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          edges?: Json | null
          id?: string
          name?: string
          nodes?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ig_posts: {
        Row: {
          caption: string | null
          comments: number | null
          created_at: string | null
          engagement_rate: number | null
          id: string
          instagram_id: string
          likes: number | null
          media_url: string | null
          media_type: string | null
          permalink: string | null
          published_at: string | null
          saves: number | null
          thumbnail_url: string | null
          user_id: string | null
          video_view_count: number | null
          views: number | null
        }
        Insert: {
          caption?: string | null
          comments?: number | null
          created_at?: string | null
          engagement_rate?: number | null
          id?: string
          instagram_id: string
          likes?: number | null
          media_url?: string | null
          media_type?: string | null
          permalink?: string | null
          published_at?: string | null
          saves?: number | null
          thumbnail_url?: string | null
          user_id?: string | null
          video_view_count?: number | null
          views?: number | null
        }
        Update: {
          caption?: string | null
          comments?: number | null
          created_at?: string | null
          engagement_rate?: number | null
          id?: string
          instagram_id?: string
          likes?: number | null
          media_url?: string | null
          media_type?: string | null
          permalink?: string | null
          published_at?: string | null
          saves?: number | null
          thumbnail_url?: string | null
          user_id?: string | null
          video_view_count?: number | null
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
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
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
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
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
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
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
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
    PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
    PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof PublicSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never
