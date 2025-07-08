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
      attendants: {
        Row: {
          cat_id: string | null
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          user_id: string | null
        }
        Insert: {
          cat_id?: string | null
          created_at?: string
          full_name: string
          id?: string
          is_active?: boolean
          user_id?: string | null
        }
        Update: {
          cat_id?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendants_cat_id_fkey"
            columns: ["cat_id"]
            isOneToOne: false
            referencedRelation: "cats"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log_entries: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: number
          ip_address: unknown | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: number
          ip_address?: unknown | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: number
          ip_address?: unknown | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_trail_archive: {
        Row: {
          action: string | null
          after_data: Json | null
          before_data: Json | null
          city_id: number | null
          created_at: string
          error_message: string | null
          id: string
          ip_address: string | null
          region_id: string | null
          success: boolean | null
          target_id: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action?: string | null
          after_data?: Json | null
          before_data?: Json | null
          city_id?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          region_id?: string | null
          success?: boolean | null
          target_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string | null
          after_data?: Json | null
          before_data?: Json | null
          city_id?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          region_id?: string | null
          success?: boolean | null
          target_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      cat_ai_queries: {
        Row: {
          attendant_id: string
          attendant_name: string
          cat_location: string | null
          created_at: string
          feedback_useful: boolean | null
          id: string
          latitude: number | null
          longitude: number | null
          question: string
          response: string
          response_source: string | null
          updated_at: string
        }
        Insert: {
          attendant_id: string
          attendant_name: string
          cat_location?: string | null
          created_at?: string
          feedback_useful?: boolean | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          question: string
          response: string
          response_source?: string | null
          updated_at?: string
        }
        Update: {
          attendant_id?: string
          attendant_name?: string
          cat_location?: string | null
          created_at?: string
          feedback_useful?: boolean | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          question?: string
          response?: string
          response_source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cat_checkins: {
        Row: {
          cat_name: string
          created_at: string | null
          distance_from_cat: number | null
          id: string
          latitude: number
          longitude: number
          status: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          cat_name: string
          created_at?: string | null
          distance_from_cat?: number | null
          id?: string
          latitude: number
          longitude: number
          status?: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          cat_name?: string
          created_at?: string | null
          distance_from_cat?: number | null
          id?: string
          latitude?: number
          longitude?: number
          status?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cat_frequent_questions: {
        Row: {
          category: string
          created_at: string
          frequency_count: number
          id: string
          is_active: boolean
          question_pattern: string
          suggested_response: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          frequency_count?: number
          id?: string
          is_active?: boolean
          question_pattern: string
          suggested_response: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          frequency_count?: number
          id?: string
          is_active?: boolean
          question_pattern?: string
          suggested_response?: string
          updated_at?: string
        }
        Relationships: []
      }
      cat_locations: {
        Row: {
          address: string | null
          cat_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          latitude: number
          longitude: number
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          cat_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude: number
          longitude: number
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          cat_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      cat_performance: {
        Row: {
          attendant_id: string
          attendant_name: string
          cat_name: string
          created_at: string | null
          date: string
          feedback_rating: number | null
          id: string
          performance_score: number | null
          questions_answered: number | null
          total_checkins: number | null
          total_hours_worked: number | null
          tourist_interactions: number | null
          updated_at: string | null
        }
        Insert: {
          attendant_id: string
          attendant_name: string
          cat_name: string
          created_at?: string | null
          date: string
          feedback_rating?: number | null
          id?: string
          performance_score?: number | null
          questions_answered?: number | null
          total_checkins?: number | null
          total_hours_worked?: number | null
          tourist_interactions?: number | null
          updated_at?: string | null
        }
        Update: {
          attendant_id?: string
          attendant_name?: string
          cat_name?: string
          created_at?: string | null
          date?: string
          feedback_rating?: number | null
          id?: string
          performance_score?: number | null
          questions_answered?: number | null
          total_checkins?: number | null
          total_hours_worked?: number | null
          tourist_interactions?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cats: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          manager_id: string | null
          name: string
          phone: string | null
          region: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          manager_id?: string | null
          name: string
          phone?: string | null
          region: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          manager_id?: string | null
          name?: string
          phone?: string | null
          region?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      city_tour_bookings: {
        Row: {
          city: string
          created_at: string | null
          current_bookings: number | null
          description: string
          id: string
          is_active: boolean | null
          manager_id: string
          max_capacity: number
          meeting_point: string
          tour_date: string
          tour_time: string
          updated_at: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          current_bookings?: number | null
          description: string
          id?: string
          is_active?: boolean | null
          manager_id: string
          max_capacity?: number
          meeting_point: string
          tour_date: string
          tour_time: string
          updated_at?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          current_bookings?: number | null
          description?: string
          id?: string
          is_active?: boolean | null
          manager_id?: string
          max_capacity?: number
          meeting_point?: string
          tour_date?: string
          tour_time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      city_tour_settings: {
        Row: {
          city: string
          created_at: string | null
          id: string
          is_public: boolean | null
          manager_id: string
          updated_at: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          manager_id: string
          updated_at?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          manager_id?: string
          updated_at?: string | null
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
          timestamp: string
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
          timestamp?: string
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
          timestamp?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      destination_details: {
        Row: {
          created_at: string
          destination_id: string
          id: string
          image_gallery: string[] | null
          map_latitude: number | null
          map_longitude: number | null
          promotional_text: string | null
          tourism_tags: string[] | null
          updated_at: string
          updated_by: string | null
          video_type: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          destination_id: string
          id?: string
          image_gallery?: string[] | null
          map_latitude?: number | null
          map_longitude?: number | null
          promotional_text?: string | null
          tourism_tags?: string[] | null
          updated_at?: string
          updated_by?: string | null
          video_type?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          destination_id?: string
          id?: string
          image_gallery?: string[] | null
          map_latitude?: number | null
          map_longitude?: number | null
          promotional_text?: string | null
          tourism_tags?: string[] | null
          updated_at?: string
          updated_by?: string | null
          video_type?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "destination_details_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: true
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          name: string
          region: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name: string
          region?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name?: string
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      digital_stamps: {
        Row: {
          city_id: string | null
          completion_percentage: number | null
          cultural_phrase: string | null
          earned_at: string
          id: string
          region_id: string | null
          route_id: string | null
          stamp_icon_url: string | null
          stamp_name: string
          user_id: string
        }
        Insert: {
          city_id?: string | null
          completion_percentage?: number | null
          cultural_phrase?: string | null
          earned_at: string
          id?: string
          region_id?: string | null
          route_id?: string | null
          stamp_icon_url?: string | null
          stamp_name: string
          user_id: string
        }
        Update: {
          city_id?: string | null
          completion_percentage?: number | null
          cultural_phrase?: string | null
          earned_at?: string
          id?: string
          region_id?: string | null
          route_id?: string | null
          stamp_icon_url?: string | null
          stamp_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_stamps_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "region_cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_stamps_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "tourist_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      event_details: {
        Row: {
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
        }
        Insert: {
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
        }
        Update: {
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
          created_at: string | null
          description: string | null
          end_date: string | null
          expires_at: string | null
          id: string
          image_url: string | null
          location: string | null
          name: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      institutional_content: {
        Row: {
          content_key: string
          content_type: string
          content_value: string
          created_at: string
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          content_key: string
          content_type?: string
          content_value: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          content_key?: string
          content_type?: string
          content_value?: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      institutional_partners: {
        Row: {
          approved_at: string | null
          category: Database["public"]["Enums"]["partner_category"] | null
          city: string | null
          contact_email: string | null
          contact_whatsapp: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          message: string | null
          name: string
          segment: string | null
          status: string | null
          tier: string | null
          updated_at: string
          website_link: string | null
          website_url: string | null
        }
        Insert: {
          approved_at?: string | null
          category?: Database["public"]["Enums"]["partner_category"] | null
          city?: string | null
          contact_email?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          message?: string | null
          name: string
          segment?: string | null
          status?: string | null
          tier?: string | null
          updated_at?: string
          website_link?: string | null
          website_url?: string | null
        }
        Update: {
          approved_at?: string | null
          category?: Database["public"]["Enums"]["partner_category"] | null
          city?: string | null
          contact_email?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          message?: string | null
          name?: string
          segment?: string | null
          status?: string | null
          tier?: string | null
          updated_at?: string
          website_link?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      institutional_surveys: {
        Row: {
          city: string | null
          created_at: string | null
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          objective: string
          questions: Json
          start_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          objective: string
          questions: Json
          start_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          objective?: string
          questions?: Json
          start_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          content: string
          created_at: string
          embedding: string | null
          id: string
          metadata: Json | null
          source_type: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_type: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      municipal_collaborators: {
        Row: {
          city: string
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          manager_id: string
          name: string
          position: string
          role: string
          updated_at: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          manager_id: string
          name: string
          position: string
          role: string
          updated_at?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          manager_id?: string
          name?: string
          position?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      municipal_content: {
        Row: {
          author_id: string | null
          city_id: number | null
          content: string | null
          content_type: Database["public"]["Enums"]["content_type"]
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          region_id: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          city_id?: number | null
          content?: string | null
          content_type?: Database["public"]["Enums"]["content_type"]
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          region_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          city_id?: number | null
          content?: string | null
          content_type?: Database["public"]["Enums"]["content_type"]
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          region_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "municipal_content_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "municipal_content_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "tourist_regions"
            referencedColumns: ["id"]
          },
        ]
      }
      municipal_profiles: {
        Row: {
          city_id: number
          created_at: string | null
          department_name: string | null
          id: number
          institutional_email: string | null
          institutional_phone: string | null
          manager_name: string | null
          updated_at: string | null
        }
        Insert: {
          city_id: number
          created_at?: string | null
          department_name?: string | null
          id?: number
          institutional_email?: string | null
          institutional_phone?: string | null
          manager_name?: string | null
          updated_at?: string | null
        }
        Update: {
          city_id?: number
          created_at?: string | null
          department_name?: string | null
          id?: number
          institutional_email?: string | null
          institutional_phone?: string | null
          manager_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      region_cities: {
        Row: {
          created_at: string
          cultural_description: string | null
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          region_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cultural_description?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          region_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cultural_description?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          region_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      route_checkpoints: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          order_index: number
          promotional_text: string | null
          required_time_minutes: number | null
          route_id: string
          updated_at: string | null
          validation_radius_meters: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          order_index?: number
          promotional_text?: string | null
          required_time_minutes?: number | null
          route_id: string
          updated_at?: string | null
          validation_radius_meters?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          order_index?: number
          promotional_text?: string | null
          required_time_minutes?: number | null
          route_id?: string
          updated_at?: string | null
          validation_radius_meters?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "route_checkpoints_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "tourist_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      route_rewards: {
        Row: {
          created_at: string
          current_uses: number | null
          description: string | null
          discount_percentage: number | null
          how_to_claim: string
          id: string
          is_active: boolean | null
          max_uses: number | null
          partner_contact: string | null
          partner_name: string | null
          region_id: string | null
          reward_type: string
          route_id: string | null
          title: string
          valid_until: string | null
          where_to_claim: string | null
        }
        Insert: {
          created_at?: string
          current_uses?: number | null
          description?: string | null
          discount_percentage?: number | null
          how_to_claim: string
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          partner_contact?: string | null
          partner_name?: string | null
          region_id?: string | null
          reward_type: string
          route_id?: string | null
          title: string
          valid_until?: string | null
          where_to_claim?: string | null
        }
        Update: {
          created_at?: string
          current_uses?: number | null
          description?: string | null
          discount_percentage?: number | null
          how_to_claim?: string
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          partner_contact?: string | null
          partner_name?: string | null
          region_id?: string | null
          reward_type?: string
          route_id?: string | null
          title?: string
          valid_until?: string | null
          where_to_claim?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_rewards_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "tourist_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      secretary_files: {
        Row: {
          category: string | null
          city: string | null
          created_at: string | null
          description: string | null
          file_path: string
          file_size: number | null
          file_type: string
          filename: string
          id: string
          is_public: boolean | null
          mime_type: string | null
          original_name: string
          updated_at: string | null
          uploaded_by: string
          uploader_name: string | null
        }
        Insert: {
          category?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          file_path: string
          file_size?: number | null
          file_type: string
          filename: string
          id?: string
          is_public?: boolean | null
          mime_type?: string | null
          original_name: string
          updated_at?: string | null
          uploaded_by: string
          uploader_name?: string | null
        }
        Update: {
          category?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string
          filename?: string
          id?: string
          is_public?: boolean | null
          mime_type?: string | null
          original_name?: string
          updated_at?: string | null
          uploaded_by?: string
          uploader_name?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          id: string
          ip_address: string | null
          record_id: string | null
          success: boolean | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          success?: boolean | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          success?: boolean | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          created_at: string | null
          id: string
          location: string | null
          respondent_email: string | null
          respondent_name: string | null
          responses: Json
          survey_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          location?: string | null
          respondent_email?: string | null
          respondent_name?: string | null
          responses: Json
          survey_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string | null
          respondent_email?: string | null
          respondent_name?: string | null
          responses?: Json
          survey_id?: string
        }
        Relationships: []
      }
      tourism_analytics: {
        Row: {
          additional_data: Json | null
          city: string | null
          created_at: string | null
          date: string
          id: string
          metric_type: string
          metric_value: number
          region: string
        }
        Insert: {
          additional_data?: Json | null
          city?: string | null
          created_at?: string | null
          date: string
          id?: string
          metric_type: string
          metric_value: number
          region: string
        }
        Update: {
          additional_data?: Json | null
          city?: string | null
          created_at?: string | null
          date?: string
          id?: string
          metric_type?: string
          metric_value?: number
          region?: string
        }
        Relationships: []
      }
      tourism_intelligence_documents: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          file_path: string
          file_size: number | null
          file_type: string
          filename: string
          id: string
          mime_type: string | null
          original_name: string
          updated_at: string | null
          uploaded_by: string
          uploader_name: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          file_path: string
          file_size?: number | null
          file_type: string
          filename: string
          id?: string
          mime_type?: string | null
          original_name: string
          updated_at?: string | null
          uploaded_by: string
          uploader_name?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string
          filename?: string
          id?: string
          mime_type?: string | null
          original_name?: string
          updated_at?: string | null
          uploaded_by?: string
          uploader_name?: string | null
        }
        Relationships: []
      }
      tourist_regions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tourist_routes: {
        Row: {
          city_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          estimated_duration: number | null
          id: string
          is_active: boolean | null
          map_image_url: string | null
          name: string
          points: number | null
          promotional_text: string | null
          proof_type: string | null
          region: string | null
          requires_proof: boolean | null
          stamp_icon_url: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          map_image_url?: string | null
          name: string
          points?: number | null
          promotional_text?: string | null
          proof_type?: string | null
          region?: string | null
          requires_proof?: boolean | null
          stamp_icon_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          map_image_url?: string | null
          name?: string
          points?: number | null
          promotional_text?: string | null
          proof_type?: string | null
          region?: string | null
          requires_proof?: boolean | null
          stamp_icon_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tourist_routes_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "region_cities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_benefits: {
        Row: {
          benefit_name: string
          benefit_type: string
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_used: boolean | null
          updated_at: string | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          benefit_name: string
          benefit_type: string
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          updated_at?: string | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          benefit_name?: string
          benefit_type?: string
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          updated_at?: string | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_city_associations: {
        Row: {
          city_id: number
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city_id: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city_id?: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_city_associations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interactions: {
        Row: {
          city: string | null
          element_id: string | null
          element_type: string | null
          id: string
          interaction_data: Json | null
          interaction_type: string
          ip_address: string | null
          page_path: string | null
          region: string | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          element_id?: string | null
          element_type?: string | null
          id?: string
          interaction_data?: Json | null
          interaction_type: string
          ip_address?: string | null
          page_path?: string | null
          region?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          element_id?: string | null
          element_type?: string | null
          id?: string
          interaction_data?: Json | null
          interaction_type?: string
          ip_address?: string | null
          page_path?: string | null
          region?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_passport_progress: {
        Row: {
          city_id: string | null
          completed_at: string
          id: string
          points_earned: number | null
          proof_photo_url: string | null
          region_id: string | null
          route_id: string | null
          stamp_earned: boolean | null
          user_id: string
          user_notes: string | null
        }
        Insert: {
          city_id?: string | null
          completed_at: string
          id?: string
          points_earned?: number | null
          proof_photo_url?: string | null
          region_id?: string | null
          route_id?: string | null
          stamp_earned?: boolean | null
          user_id: string
          user_notes?: string | null
        }
        Update: {
          city_id?: string | null
          completed_at?: string
          id?: string
          points_earned?: number | null
          proof_photo_url?: string | null
          region_id?: string | null
          route_id?: string | null
          stamp_earned?: boolean | null
          user_id?: string
          user_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_passport_progress_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "region_cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_passport_progress_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "tourist_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          accessibility_preference: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          location: string | null
          neighborhood: string | null
          occupation: string | null
          other_motive: string | null
          residence_city: string | null
          sexuality_identity: string | null
          state: string | null
          stay_duration: string | null
          time_in_city: string | null
          travel_motives: string[] | null
          travel_organization: string | null
          updated_at: string | null
          user_id: string
          user_type: string | null
          wants_to_collaborate: boolean | null
          website: string | null
        }
        Insert: {
          accessibility_preference?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          location?: string | null
          neighborhood?: string | null
          occupation?: string | null
          other_motive?: string | null
          residence_city?: string | null
          sexuality_identity?: string | null
          state?: string | null
          stay_duration?: string | null
          time_in_city?: string | null
          travel_motives?: string[] | null
          travel_organization?: string | null
          updated_at?: string | null
          user_id: string
          user_type?: string | null
          wants_to_collaborate?: boolean | null
          website?: string | null
        }
        Update: {
          accessibility_preference?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          location?: string | null
          neighborhood?: string | null
          occupation?: string | null
          other_motive?: string | null
          residence_city?: string | null
          sexuality_identity?: string | null
          state?: string | null
          stay_duration?: string | null
          time_in_city?: string | null
          travel_motives?: string[] | null
          travel_organization?: string | null
          updated_at?: string | null
          user_id?: string
          user_type?: string | null
          wants_to_collaborate?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      user_rewards: {
        Row: {
          claim_code: string | null
          claim_location: string | null
          claimed_at: string | null
          earned_at: string
          id: string
          is_claimed: boolean
          reward_id: string
          user_id: string
        }
        Insert: {
          claim_code?: string | null
          claim_location?: string | null
          claimed_at?: string | null
          earned_at: string
          id?: string
          is_claimed?: boolean
          reward_id: string
          user_id: string
        }
        Update: {
          claim_code?: string | null
          claim_location?: string | null
          claimed_at?: string | null
          earned_at?: string
          id?: string
          is_claimed?: boolean
          reward_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "route_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          region: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          region?: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          region?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_route_checkins: {
        Row: {
          checkin_at: string | null
          checkpoint_id: string | null
          created_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          photo_url: string | null
          route_id: string
          user_id: string
        }
        Insert: {
          checkin_at?: string | null
          checkpoint_id?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          photo_url?: string | null
          route_id: string
          user_id: string
        }
        Update: {
          checkin_at?: string | null
          checkpoint_id?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          photo_url?: string | null
          route_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_route_checkins_checkpoint_id_fkey"
            columns: ["checkpoint_id"]
            isOneToOne: false
            referencedRelation: "route_checkpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_route_checkins_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "tourist_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stamps: {
        Row: {
          city_id: string | null
          completion_percentage: number | null
          created_at: string | null
          cultural_phrase: string | null
          earned_at: string | null
          id: string
          region_id: string | null
          route_id: string | null
          stamp_icon_url: string | null
          stamp_name: string
          user_id: string
        }
        Insert: {
          city_id?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          cultural_phrase?: string | null
          earned_at?: string | null
          id?: string
          region_id?: string | null
          route_id?: string | null
          stamp_icon_url?: string | null
          stamp_name: string
          user_id: string
        }
        Update: {
          city_id?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          cultural_phrase?: string | null
          earned_at?: string | null
          id?: string
          region_id?: string | null
          route_id?: string | null
          stamp_icon_url?: string | null
          stamp_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stamps_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "region_cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_stamps_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "tourist_routes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aggregate_daily_analytics: {
        Args: { target_date?: string }
        Returns: undefined
      }
      archive_audit_logs: {
        Args: { cutoff_date: string }
        Returns: Json
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      calculate_performance_score: {
        Args: {
          p_total_checkins: number
          p_total_hours: number
          p_questions_answered: number
          p_tourist_interactions: number
        }
        Returns: number
      }
      can_access_route: {
        Args: { user_role: string; route_path: string }
        Returns: boolean
      }
      get_checkins_by_day: {
        Args: { start_date: string; end_date: string }
        Returns: {
          day: string
          checkin_count: number
        }[]
      }
      get_municipal_heatmap_data: {
        Args: { p_city_id: number; p_time_range?: string }
        Returns: {
          lat: number
          lng: number
        }[]
      }
      get_municipal_kpi_checkins: {
        Args: { p_city_id: number }
        Returns: number
      }
      get_municipal_kpi_passports: {
        Args: { p_city_id: number }
        Returns: number
      }
      get_municipal_kpi_suggestions: {
        Args: { p_city_id: number }
        Returns: {
          total_suggestions: number
          unread_suggestions: number
        }[]
      }
      get_municipal_kpi_top_routes: {
        Args: { p_city_id: number }
        Returns: {
          route_name: string
          interaction_count: number
        }[]
      }
      get_my_claim: {
        Args: { claim_name: string }
        Returns: Json
      }
      get_my_claims: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_region_statistics: {
        Args: { region_uuid: string }
        Returns: {
          total_users: number
          completed_routes: number
          most_visited_city: string
          average_completion_time: number
        }[]
      }
      get_regional_dashboard_data: {
        Args: { p_region_id: string }
        Returns: {
          total_visitors: number
          total_checkins: number
          average_satisfaction: number
          total_cities: number
          top_cities: Database["public"]["CompositeTypes"]["city_performance_type"][]
        }[]
      }
      get_user_dashboard_route: {
        Args: { user_role: string }
        Returns: string
      }
      get_user_role: {
        Args: { check_user_id?: string }
        Returns: string
      }
      get_users_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          email: string
          role: string
          region: string
          status: string
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin_or_tech: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      log_data_access_attempt: {
        Args: {
          p_table_name: string
          p_action: string
          p_target_user_id?: string
        }
        Returns: undefined
      }
      log_security_event: {
        Args: {
          p_user_id: string
          p_action: string
          p_success?: boolean
          p_error_message?: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      match_knowledge: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      validate_user_data_access: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "tech"
        | "municipal"
        | "atendente"
        | "gestor"
        | "user"
        | "municipal_manager"
        | "regional_manager"
        | "state_manager"
        | "cat_attendant"
        | "collaborator"
      content_status: "Rascunho" | "Pendente" | "Publicado" | "Arquivado"
      content_type: "Notícia" | "Evento" | "Artigo" | "Página"
      partner_category: "local" | "regional" | "estadual"
    }
    CompositeTypes: {
      city_performance_type: {
        city_name: string | null
        visitors_count: number | null
      }
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
      app_role: [
        "admin",
        "tech",
        "municipal",
        "atendente",
        "gestor",
        "user",
        "municipal_manager",
        "regional_manager",
        "state_manager",
        "cat_attendant",
        "collaborator",
      ],
      content_status: ["Rascunho", "Pendente", "Publicado", "Arquivado"],
      content_type: ["Notícia", "Evento", "Artigo", "Página"],
      partner_category: ["local", "regional", "estadual"],
    },
  },
} as const
