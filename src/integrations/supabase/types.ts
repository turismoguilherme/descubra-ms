export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      cat_checkins: {
        Row: {
          cat_name: string
          created_at: string
          distance_from_cat: number | null
          id: string
          latitude: number | null
          longitude: number | null
          status: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          cat_name: string
          created_at?: string
          distance_from_cat?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          status?: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          cat_name?: string
          created_at?: string
          distance_from_cat?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          status?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      city_tour_bookings: {
        Row: {
          city: string
          created_at: string
          current_bookings: number
          description: string | null
          id: string
          is_active: boolean | null
          max_capacity: number
          meeting_point: string | null
          tour_date: string
          tour_time: string
          updated_at: string
        }
        Insert: {
          city: string
          created_at?: string
          current_bookings?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_capacity?: number
          meeting_point?: string | null
          tour_date: string
          tour_time: string
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          current_bookings?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_capacity?: number
          meeting_point?: string | null
          tour_date?: string
          tour_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      city_tour_settings: {
        Row: {
          city: string
          created_at: string
          id: string
          is_public: boolean | null
          updated_at: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      content_audit_log: {
        Row: {
          action: string
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          timestamp: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          timestamp?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          timestamp?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      destination_details: {
        Row: {
          created_at: string | null
          destination_id: string
          id: string
          image_gallery: string[] | null
          map_latitude: number | null
          map_longitude: number | null
          promotional_text: string | null
          tourism_tags: string[] | null
          updated_at: string | null
          updated_by: string | null
          video_type: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          destination_id: string
          id?: string
          image_gallery?: string[] | null
          map_latitude?: number | null
          map_longitude?: number | null
          promotional_text?: string | null
          tourism_tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          video_type?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          destination_id?: string
          id?: string
          image_gallery?: string[] | null
          map_latitude?: number | null
          map_longitude?: number | null
          promotional_text?: string | null
          tourism_tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          video_type?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "destination_details_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          name: string
          region: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name: string
          region?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name?: string
          region?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      event_details: {
        Row: {
          auto_hide: boolean | null
          cover_image_url: string | null
          created_at: string | null
          detailed_description: string | null
          event_id: string
          event_type: string | null
          exact_location: string | null
          extra_info: string | null
          id: string
          is_free: boolean | null
          map_latitude: number | null
          map_longitude: number | null
          official_name: string | null
          registration_link: string | null
          schedule_info: string | null
          updated_at: string | null
          updated_by: string | null
          video_url: string | null
          visibility_end_date: string | null
        }
        Insert: {
          auto_hide?: boolean | null
          cover_image_url?: string | null
          created_at?: string | null
          detailed_description?: string | null
          event_id: string
          event_type?: string | null
          exact_location?: string | null
          extra_info?: string | null
          id?: string
          is_free?: boolean | null
          map_latitude?: number | null
          map_longitude?: number | null
          official_name?: string | null
          registration_link?: string | null
          schedule_info?: string | null
          updated_at?: string | null
          updated_by?: string | null
          video_url?: string | null
          visibility_end_date?: string | null
        }
        Update: {
          auto_hide?: boolean | null
          cover_image_url?: string | null
          created_at?: string | null
          detailed_description?: string | null
          event_id?: string
          event_type?: string | null
          exact_location?: string | null
          extra_info?: string | null
          id?: string
          is_free?: boolean | null
          map_latitude?: number | null
          map_longitude?: number | null
          official_name?: string | null
          registration_link?: string | null
          schedule_info?: string | null
          updated_at?: string | null
          updated_by?: string | null
          video_url?: string | null
          visibility_end_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_details_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          auto_hide: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_visible: boolean | null
          location: string | null
          name: string
          start_date: string
          updated_at: string | null
          visibility_end_date: string | null
        }
        Insert: {
          auto_hide?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          location?: string | null
          name: string
          start_date: string
          updated_at?: string | null
          visibility_end_date?: string | null
        }
        Update: {
          auto_hide?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          location?: string | null
          name?: string
          start_date?: string
          updated_at?: string | null
          visibility_end_date?: string | null
        }
        Relationships: []
      }
      institutional_content: {
        Row: {
          content_key: string
          content_type: string | null
          content_value: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content_key: string
          content_type?: string | null
          content_value?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content_key?: string
          content_type?: string | null
          content_value?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      institutional_partners: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          partner_type: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          partner_type?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          partner_type?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      passport_stamps: {
        Row: {
          checkpoint_id: string | null
          destination_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          route_id: string | null
          stamp_type: string | null
          stamped_at: string | null
          user_id: string
        }
        Insert: {
          checkpoint_id?: string | null
          destination_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          route_id?: string | null
          stamp_type?: string | null
          stamped_at?: string | null
          user_id: string
        }
        Update: {
          checkpoint_id?: string | null
          destination_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          route_id?: string | null
          stamp_type?: string | null
          stamped_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "passport_stamps_checkpoint_id_fkey"
            columns: ["checkpoint_id"]
            isOneToOne: false
            referencedRelation: "route_checkpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passport_stamps_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passport_stamps_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_checkpoints: {
        Row: {
          created_at: string | null
          description: string | null
          destination_id: string | null
          id: string
          is_mandatory: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          order_sequence: number
          route_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          destination_id?: string | null
          id?: string
          is_mandatory?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          order_sequence: number
          route_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          destination_id?: string | null
          id?: string
          is_mandatory?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          order_sequence?: number
          route_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_checkpoints_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_checkpoints_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          distance_km: number | null
          estimated_duration: unknown | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          region: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          distance_km?: number | null
          estimated_duration?: unknown | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          region?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          distance_km?: number | null
          estimated_duration?: unknown | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          region?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: unknown | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          success: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tourism_intelligence_documents: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          file_path: string
          file_size: number
          file_type: string
          filename: string
          id: string
          is_processed: boolean | null
          mime_type: string | null
          original_name: string
          tags: string[] | null
          updated_at: string
          upload_date: string
          uploaded_by: string | null
          uploader_name: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_path: string
          file_size: number
          file_type: string
          filename: string
          id?: string
          is_processed?: boolean | null
          mime_type?: string | null
          original_name: string
          tags?: string[] | null
          updated_at?: string
          upload_date?: string
          uploaded_by?: string | null
          uploader_name?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          is_processed?: boolean | null
          mime_type?: string | null
          original_name?: string
          tags?: string[] | null
          updated_at?: string
          upload_date?: string
          uploaded_by?: string | null
          uploader_name?: string | null
        }
        Relationships: []
      }
      tourist_regions: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          city: string | null
          created_at: string | null
          display_name: string | null
          full_name: string | null
          id: string
          phone: string | null
          region: string | null
          updated_at: string | null
          user_id: string
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          region?: string | null
          updated_at?: string | null
          user_id: string
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          region?: string | null
          updated_at?: string | null
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          region: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          region?: string | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          region?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_users_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          full_name: string
          user_type: string
          role: string
          region: string
          created_at: string
        }[]
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
    Enums: {},
  },
} as const
