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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          reference_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          reference_id?: string | null
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          reference_id?: string | null
          type?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          created_at: string
          dog_id: string
          id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dog_id: string
          id?: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          dog_id?: string
          id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_settings: {
        Row: {
          active: boolean
          end_date: string | null
          id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          end_date?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          end_date?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      dogs: {
        Row: {
          age: string
          approved: boolean
          archived: boolean
          boost_votes: number
          breed: string
          created_at: string
          description: string | null
          highlighted: boolean
          id: string
          image_url: string
          is_winner: boolean
          name: string
          owner_id: string
          updated_at: string
          winner_place: number | null
        }
        Insert: {
          age: string
          approved?: boolean
          archived?: boolean
          boost_votes?: number
          breed: string
          created_at?: string
          description?: string | null
          highlighted?: boolean
          id?: string
          image_url: string
          is_winner?: boolean
          name: string
          owner_id: string
          updated_at?: string
          winner_place?: number | null
        }
        Update: {
          age?: string
          approved?: boolean
          archived?: boolean
          boost_votes?: number
          breed?: string
          created_at?: string
          description?: string | null
          highlighted?: boolean
          id?: string
          image_url?: string
          is_winner?: boolean
          name?: string
          owner_id?: string
          updated_at?: string
          winner_place?: number | null
        }
        Relationships: []
      }
      donations_total: {
        Row: {
          id: string
          total_cents: number
          updated_at: string
        }
        Insert: {
          id?: string
          total_cents?: number
          updated_at?: string
        }
        Update: {
          id?: string
          total_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          dog_id: string | null
          id: string
          product_name: string | null
          status: string
          stripe_payment_intent_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          dog_id?: string | null
          id?: string
          product_name?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          dog_id?: string | null
          id?: string
          product_name?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          product_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          product_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          in_stock: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          blocked: boolean
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
          welcome_email_sent: boolean
        }
        Insert: {
          avatar_url?: string | null
          blocked?: boolean
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
          welcome_email_sent?: boolean
        }
        Update: {
          avatar_url?: string | null
          blocked?: boolean
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          welcome_email_sent?: boolean
        }
        Relationships: []
      }
      site_content: {
        Row: {
          key: string
          label: string
          page: string
          sort_order: number
          type: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          label: string
          page: string
          sort_order?: number
          type?: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          label?: string
          page?: string
          sort_order?: number
          type?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      sponsor_inquiries: {
        Row: {
          created_at: string
          email: string
          handled: boolean
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          handled?: boolean
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          handled?: boolean
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          active: boolean
          banner_url: string | null
          created_at: string
          cta_label: string | null
          description: string | null
          featured: boolean
          id: string
          link_url: string | null
          logo_url: string | null
          package_tier: string
          placement: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          banner_url?: string | null
          created_at?: string
          cta_label?: string | null
          description?: string | null
          featured?: boolean
          id?: string
          link_url?: string | null
          logo_url?: string | null
          package_tier?: string
          placement?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          banner_url?: string | null
          created_at?: string
          cta_label?: string | null
          description?: string | null
          featured?: boolean
          id?: string
          link_url?: string | null
          logo_url?: string | null
          package_tier?: string
          placement?: string
          sort_order?: number
          title?: string
          updated_at?: string
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
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          dog_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dog_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dog_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_donation: { Args: { payment_amount: number }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_blocked: { Args: never; Returns: boolean }
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
