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
          payment_provider: string | null
          plan_expires_at: string | null
          plan_status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_id: string | null
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
          payment_provider?: string | null
          plan_expires_at?: string | null
          plan_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_id?: string | null
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
          payment_provider?: string | null
          plan_expires_at?: string | null
          plan_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          count: number
          created_at: string
          id: string
          identifier: string
          updated_at: string
          window_start: string
        }
        Insert: {
          action: string
          count?: number
          created_at?: string
          id?: string
          identifier: string
          updated_at?: string
          window_start?: string
        }
        Update: {
          action?: string
          count?: number
          created_at?: string
          id?: string
          identifier?: string
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string
          event_type: Database["public"]["Enums"]["security_event_type"]
          id: string
          ip_address: unknown
          metadata: Json | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: Database["public"]["Enums"]["security_event_type"]
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: Database["public"]["Enums"]["security_event_type"]
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_events: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          event_type: string
          external_id: string | null
          id: string
          metadata: Json | null
          plan_id: string | null
          plan_key: string | null
          processed_at: string | null
          provider: string
          raw_event: Json | null
          status: Database["public"]["Enums"]["subscription_status"]
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          event_type: string
          external_id?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          plan_key?: string | null
          processed_at?: string | null
          provider: string
          raw_event?: Json | null
          status: Database["public"]["Enums"]["subscription_status"]
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          event_type?: string
          external_id?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          plan_key?: string | null
          processed_at?: string | null
          provider?: string
          raw_event?: Json | null
          status?: Database["public"]["Enums"]["subscription_status"]
          user_id?: string | null
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
      check_expired_subscriptions: { Args: never; Returns: undefined }
      check_rate_limit: {
        Args: {
          p_action: string
          p_identifier: string
          p_max_count: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      get_plan_daily_limit: { Args: { p_plan: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_analysis_count: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      is_plan_active: { Args: { p_user_id: string }; Returns: boolean }
      log_security_event: {
        Args: {
          p_event_type: Database["public"]["Enums"]["security_event_type"]
          p_ip_address?: string
          p_metadata?: Json
          p_severity?: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      validate_plan_limit: {
        Args: { p_action: string; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      analysis_status: "pending" | "processing" | "completed" | "failed"
      app_role: "admin" | "user"
      risk_level: "low" | "medium" | "high"
      security_event_type:
        | "login_attempt"
        | "login_failed"
        | "login_success"
        | "logout"
        | "rate_limit_exceeded"
        | "plan_limit_exceeded"
        | "suspicious_activity"
        | "upload_rejected"
        | "invalid_token"
        | "unauthorized_access"
        | "payment_webhook"
        | "subscription_change"
        | "account_blocked"
      subscription_plan: "free" | "intermediate" | "advanced" | "elite"
      subscription_status:
        | "active"
        | "canceled"
        | "expired"
        | "blocked"
        | "pending"
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
      security_event_type: [
        "login_attempt",
        "login_failed",
        "login_success",
        "logout",
        "rate_limit_exceeded",
        "plan_limit_exceeded",
        "suspicious_activity",
        "upload_rejected",
        "invalid_token",
        "unauthorized_access",
        "payment_webhook",
        "subscription_change",
        "account_blocked",
      ],
      subscription_plan: ["free", "intermediate", "advanced", "elite"],
      subscription_status: [
        "active",
        "canceled",
        "expired",
        "blocked",
        "pending",
      ],
    },
  },
} as const
