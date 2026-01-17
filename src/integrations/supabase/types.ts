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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bankroll_management: {
        Row: {
          created_at: string
          current_bankroll: number
          id: string
          initial_bankroll: number
          unit_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_bankroll?: number
          id?: string
          initial_bankroll?: number
          unit_value?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_bankroll?: number
          id?: string
          initial_bankroll?: number
          unit_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bankroll_transactions: {
        Row: {
          amount: number
          analysis_id: string | null
          created_at: string
          description: string | null
          id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          analysis_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          analysis_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bankroll_transactions_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "bet_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      bet_analyses: {
        Row: {
          analysis_result: Json | null
          created_at: string
          extracted_data: Json | null
          id: string
          is_green: boolean | null
          original_image_url: string
          overall_risk: Database["public"]["Enums"]["risk_level"] | null
          status: Database["public"]["Enums"]["analysis_status"]
          updated_at: string
          user_id: string
          user_notes: string | null
        }
        Insert: {
          analysis_result?: Json | null
          created_at?: string
          extracted_data?: Json | null
          id?: string
          is_green?: boolean | null
          original_image_url: string
          overall_risk?: Database["public"]["Enums"]["risk_level"] | null
          status?: Database["public"]["Enums"]["analysis_status"]
          updated_at?: string
          user_id: string
          user_notes?: string | null
        }
        Update: {
          analysis_result?: Json | null
          created_at?: string
          extracted_data?: Json | null
          id?: string
          is_green?: boolean | null
          original_image_url?: string
          overall_risk?: Database["public"]["Enums"]["risk_level"] | null
          status?: Database["public"]["Enums"]["analysis_status"]
          updated_at?: string
          user_id?: string
          user_notes?: string | null
        }
        Relationships: []
      }
      learning_feedback: {
        Row: {
          analysis_id: string | null
          created_at: string
          extracted_data: Json | null
          id: string
          image_url: string
          match_info: Json | null
          notes: string | null
          result: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string
          extracted_data?: Json | null
          id?: string
          image_url: string
          match_info?: Json | null
          notes?: string | null
          result: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          created_at?: string
          extracted_data?: Json | null
          id?: string
          image_url?: string
          match_info?: Json | null
          notes?: string | null
          result?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_feedback_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "bet_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_plan: Database["public"]["Enums"]["subscription_plan"]
          daily_analyses_used: number
          email_notifications: boolean
          full_name: string | null
          id: string
          last_analysis_reset: string | null
          marketing_consent: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_plan?: Database["public"]["Enums"]["subscription_plan"]
          daily_analyses_used?: number
          email_notifications?: boolean
          full_name?: string | null
          id?: string
          last_analysis_reset?: string | null
          marketing_consent?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_plan?: Database["public"]["Enums"]["subscription_plan"]
          daily_analyses_used?: number
          email_notifications?: boolean
          full_name?: string | null
          id?: string
          last_analysis_reset?: string | null
          marketing_consent?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      analysis_status: "pending" | "processing" | "completed" | "failed"
      app_role: "admin" | "user"
      risk_level: "low" | "medium" | "high"
      subscription_plan: "free" | "intermediate" | "advanced"
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
      analysis_status: ["pending", "processing", "completed", "failed"],
      app_role: ["admin", "user"],
      risk_level: ["low", "medium", "high"],
      subscription_plan: ["free", "intermediate", "advanced"],
    },
  },
} as const
