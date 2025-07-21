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
      ai_insights: {
        Row: {
          confidence_score: number | null
          created_at: string
          data_sources: string[] | null
          description: string
          generated_by: string | null
          id: string
          insight_type: string
          priority: string | null
          recommendations: Json | null
          region: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          data_sources?: string[] | null
          description: string
          generated_by?: string | null
          id?: string
          insight_type: string
          priority?: string | null
          recommendations?: Json | null
          region: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          data_sources?: string[] | null
          description?: string
          generated_by?: string | null
          id?: string
          insight_type?: string
          priority?: string | null
          recommendations?: Json | null
          region?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_master_insights: {
        Row: {
          actions: Json | null
          confidence_score: number | null
          created_at: string | null
          data_sources: string[] | null
          description: string
          generated_by: string | null
          id: string
          insight_type: string
          priority: string | null
          recommendations: Json | null
          region: string | null
          state_code: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actions?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          data_sources?: string[] | null
          description: string
          generated_by?: string | null
          id?: string
          insight_type: string
          priority?: string | null
          recommendations?: Json | null
          region?: string | null
          state_code?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          data_sources?: string[] | null
          description?: string
          generated_by?: string | null
          id?: string
          insight_type?: string
          priority?: string | null
          recommendations?: Json | null
          region?: string | null
          state_code?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      attendant_timesheet: {
        Row: {
          cat_location: string
          clock_in_time: string
          clock_out_time: string | null
          created_at: string
          id: string
          notes: string | null
          total_hours: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cat_location: string
          clock_in_time?: string
          clock_out_time?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          total_hours?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cat_location?: string
          clock_in_time?: string
          clock_out_time?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          total_hours?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      cat_locations: {
        Row: {
          address: string | null
          city: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          region: string | null
          updated_at: string
          working_hours: string | null
        }
        Insert: {
          address?: string | null
          city: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          region?: string | null
          updated_at?: string
          working_hours?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          region?: string | null
          updated_at?: string
          working_hours?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          created_at: string | null
          id: string
          name: string
          region_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          region_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          region_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
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
          city_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          name: string
          region: string | null
          state_id: string | null
          updated_at: string | null
        }
        Insert: {
          city_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name: string
          region?: string | null
          state_id?: string | null
          updated_at?: string | null
        }
        Update: {
          city_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name?: string
          region?: string | null
          state_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "destinations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "destinations_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      alumia_destinations: {
        Row: {
          id: string
          alumia_id: string
          name: string | null
          description: string | null
          latitude: number | null
          longitude: number | null
          address: string | null
          city: string | null
          state: string | null
          category: string | null
          rating: number | null
          price: string | null
          images: string[] | null
          availability: boolean | null
          accessibility: string[] | null
          languages: string[] | null
          contact_phone: string | null
          contact_email: string | null
          contact_website: string | null
          operating_hours_open: string | null
          operating_hours_close: string | null
          operating_hours_days: string[] | null
          capacity_max: number | null
          capacity_current: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          alumia_id: string
          name?: string | null
          description?: string | null
          latitude?: number | null
          longitude?: number | null
          address?: string | null
          city?: string | null
          state?: string | null
          category?: string | null
          rating?: number | null
          price?: string | null
          images?: string[] | null
          availability?: boolean | null
          accessibility?: string[] | null
          languages?: string[] | null
          contact_phone?: string | null
          contact_email?: string | null
          contact_website?: string | null
          operating_hours_open?: string | null
          operating_hours_close?: string | null
          operating_hours_days?: string[] | null
          capacity_max?: number | null
          capacity_current?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          alumia_id?: string
          name?: string | null
          description?: string | null
          latitude?: number | null
          longitude?: number | null
          address?: string | null
          city?: string | null
          state?: string | null
          category?: string | null
          rating?: number | null
          price?: string | null
          images?: string[] | null
          availability?: boolean | null
          accessibility?: string[] | null
          languages?: string[] | null
          contact_phone?: string | null
          contact_email?: string | null
          contact_website?: string | null
          operating_hours_open?: string | null
          operating_hours_close?: string | null
          operating_hours_days?: string[] | null
          capacity_max?: number | null
          capacity_current?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alumia_destinations_alumia_id_fkey"
            columns: ["alumia_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          }
        ]
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
          city_id: string | null
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
          state_id: string | null
          updated_at: string | null
          visibility_end_date: string | null
        }
        Insert: {
          auto_hide?: boolean | null
          city_id?: string | null
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
          state_id?: string | null
          updated_at?: string | null
          visibility_end_date?: string | null
        }
        Update: {
          auto_hide?: boolean | null
          city_id?: string | null
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
          state_id?: string | null
          updated_at?: string | null
          visibility_end_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      alumia_events: {
        Row: {
          id: string
          alumia_id: string
          name: string | null
          description: string | null
          start_date: string | null
          end_date: string | null
          location: string | null
          category: string | null
          price: number | null
          capacity: number | null
          registered: number | null
          status: string | null
          organizer: string | null
          contact_phone: string | null
          contact_email: string | null
          images: string[] | null
          tags: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          alumia_id: string
          name?: string | null
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          location?: string | null
          category?: string | null
          price?: number | null
          capacity?: number | null
          registered?: number | null
          status?: string | null
          organizer?: string | null
          contact_phone?: string | null
          contact_email?: string | null
          images?: string[] | null
          tags?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          alumia_id?: string
          name?: string | null
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          location?: string | null
          category?: string | null
          price?: number | null
          capacity?: number | null
          registered?: number | null
          status?: string | null
          organizer?: string | null
          contact_phone?: string | null
          contact_email?: string | null
          images?: string[] | null
          tags?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alumia_events_alumia_id_fkey"
            columns: ["alumia_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          }
        ]
      }
      flowtrip_clients: {
        Row: {
          client_name: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string | null
          id: string
          state_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_name: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          id?: string
          state_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_name?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          id?: string
          state_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flowtrip_clients_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "flowtrip_states"
            referencedColumns: ["id"]
          },
        ]
      }
      flowtrip_invoices: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string | null
          due_date: string
          id: string
          invoice_number: string
          paid_at: string | null
          status: string | null
          subscription_id: string | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string | null
          due_date: string
          id?: string
          invoice_number: string
          paid_at?: string | null
          status?: string | null
          subscription_id?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          paid_at?: string | null
          status?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flowtrip_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "flowtrip_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flowtrip_invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "flowtrip_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      flowtrip_master_config: {
        Row: {
          config_key: string
          config_value: Json
          description: string | null
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          description?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          description?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      flowtrip_onboarding_steps: {
        Row: {
          client_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          order_sequence: number
          step_description: string | null
          step_name: string
        }
        Insert: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          order_sequence: number
          step_description?: string | null
          step_name: string
        }
        Update: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          order_sequence?: number
          step_description?: string | null
          step_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "flowtrip_onboarding_steps_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "flowtrip_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      flowtrip_state_features: {
        Row: {
          config: Json | null
          created_at: string | null
          feature_name: string
          id: string
          is_enabled: boolean | null
          state_id: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          feature_name: string
          id?: string
          is_enabled?: boolean | null
          state_id?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          feature_name?: string
          id?: string
          is_enabled?: boolean | null
          state_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flowtrip_state_features_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "flowtrip_states"
            referencedColumns: ["id"]
          },
        ]
      }
      flowtrip_states: {
        Row: {
          accent_color: string | null
          billing_email: string | null
          code: string
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string | null
          has_alumia: boolean | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          monthly_fee: number | null
          name: string
          plan_type: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          billing_email?: string | null
          code: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          has_alumia?: boolean | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          monthly_fee?: number | null
          name: string
          plan_type?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          billing_email?: string | null
          code?: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          has_alumia?: boolean | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          monthly_fee?: number | null
          name?: string
          plan_type?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      flowtrip_subscriptions: {
        Row: {
          billing_cycle: string | null
          client_id: string | null
          created_at: string | null
          features: Json | null
          id: string
          max_destinations: number | null
          max_users: number | null
          monthly_fee: number | null
          next_billing_date: string | null
          plan_type: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string | null
          client_id?: string | null
          created_at?: string | null
          features?: Json | null
          id?: string
          max_destinations?: number | null
          max_users?: number | null
          monthly_fee?: number | null
          next_billing_date?: string | null
          plan_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string | null
          client_id?: string | null
          created_at?: string | null
          features?: Json | null
          id?: string
          max_destinations?: number | null
          max_users?: number | null
          monthly_fee?: number | null
          next_billing_date?: string | null
          plan_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flowtrip_subscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "flowtrip_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      flowtrip_support_tickets: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flowtrip_support_tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "flowtrip_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      flowtrip_usage_metrics: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          recorded_date: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          recorded_date?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          recorded_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flowtrip_usage_metrics_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "flowtrip_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      flowtrip_white_label_configs: {
        Row: {
          client_id: string | null
          config_key: string
          config_value: Json
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          config_key: string
          config_value: Json
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          config_key?: string
          config_value?: Json
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flowtrip_white_label_configs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "flowtrip_clients"
            referencedColumns: ["id"]
          },
        ]
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
      institutional_surveys: {
        Row: {
          created_at: string
          created_by: string | null
          created_by_name: string | null
          description: string | null
          end_date: string | null
          id: string
          objective: string
          questions: Json
          region: string | null
          responses_count: number | null
          start_date: string | null
          status: string | null
          target_audience: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          objective: string
          questions: Json
          region?: string | null
          responses_count?: number | null
          start_date?: string | null
          status?: string | null
          target_audience?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          objective?: string
          questions?: Json
          region?: string | null
          responses_count?: number | null
          start_date?: string | null
          status?: string | null
          target_audience?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_base_entries: {
        Row: {
          category: string
          content: string
          created_at: string
          data_type: string | null
          id: string
          is_verified: boolean | null
          metadata: Json | null
          region: string | null
          source: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          data_type?: string | null
          id?: string
          is_verified?: boolean | null
          metadata?: Json | null
          region?: string | null
          source?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          data_type?: string | null
          id?: string
          is_verified?: boolean | null
          metadata?: Json | null
          region?: string | null
          source?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      municipal_collaborators: {
        Row: {
          created_at: string
          created_by: string | null
          created_by_name: string | null
          department: string | null
          email: string
          id: string
          municipality: string
          name: string
          permissions: Json | null
          phone: string | null
          position: string
          region: string | null
          role: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          department?: string | null
          email: string
          id?: string
          municipality: string
          name: string
          permissions?: Json | null
          phone?: string | null
          position: string
          region?: string | null
          role: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          department?: string | null
          email?: string
          id?: string
          municipality?: string
          name?: string
          permissions?: Json | null
          phone?: string | null
          position?: string
          region?: string | null
          role?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      passport_stamps: {
        Row: {
          activity_type: string | null
          checkpoint_id: string | null
          destination_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          points_earned: number | null
          route_id: string | null
          stamp_type: string | null
          stamped_at: string | null
          state_id: string | null
          user_id: string
        }
        Insert: {
          activity_type?: string | null
          checkpoint_id?: string | null
          destination_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          points_earned?: number | null
          route_id?: string | null
          stamp_type?: string | null
          stamped_at?: string | null
          state_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string | null
          checkpoint_id?: string | null
          destination_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          points_earned?: number | null
          route_id?: string | null
          stamp_type?: string | null
          stamped_at?: string | null
          state_id?: string | null
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
          {
            foreignKeyName: "passport_stamps_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token_hash: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token_hash: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token_hash?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
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
          city_id: string | null
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
          state_id: string | null
          updated_at: string | null
        }
        Insert: {
          city_id?: string | null
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
          state_id?: string | null
          updated_at?: string | null
        }
        Update: {
          city_id?: string | null
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
          state_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      secretary_files: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          file_path: string
          file_size: number
          file_type: string
          filename: string
          id: string
          original_name: string
          updated_at: string
          uploaded_by: string | null
          uploaded_by_name: string | null
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
          original_name: string
          updated_at?: string
          uploaded_by?: string | null
          uploaded_by_name?: string | null
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
          original_name?: string
          updated_at?: string
          uploaded_by?: string | null
          uploaded_by_name?: string | null
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
      states: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          created_at: string
          id: string
          respondent_email: string | null
          respondent_id: string | null
          respondent_name: string | null
          responses: Json
          submitted_at: string
          survey_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          respondent_email?: string | null
          respondent_id?: string | null
          respondent_name?: string | null
          responses: Json
          submitted_at?: string
          survey_id: string
        }
        Update: {
          created_at?: string
          id?: string
          respondent_email?: string | null
          respondent_id?: string | null
          respondent_name?: string | null
          responses?: Json
          submitted_at?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "institutional_surveys"
            referencedColumns: ["id"]
          },
        ]
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
      user_achievements: {
        Row: {
          achievement_description: string | null
          achievement_name: string
          achievement_type: string
          created_at: string | null
          icon_url: string | null
          id: string
          points_awarded: number | null
          state_id: string | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_name: string
          achievement_type: string
          created_at?: string | null
          icon_url?: string | null
          id?: string
          points_awarded?: number | null
          state_id?: string | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_name?: string
          achievement_type?: string
          created_at?: string | null
          icon_url?: string | null
          id?: string
          points_awarded?: number | null
          state_id?: string | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "flowtrip_states"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interactions: {
        Row: {
          created_at: string
          destination_id: string | null
          duration_seconds: number | null
          event_id: string | null
          id: string
          interaction_type: string
          ip_address: unknown | null
          metadata: Json | null
          page_url: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          destination_id?: string | null
          duration_seconds?: number | null
          event_id?: string | null
          id?: string
          interaction_type: string
          ip_address?: unknown | null
          metadata?: Json | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          destination_id?: string | null
          duration_seconds?: number | null
          event_id?: string | null
          id?: string
          interaction_type?: string
          ip_address?: unknown | null
          metadata?: Json | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_interactions_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interactions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_levels: {
        Row: {
          created_at: string | null
          current_level: string | null
          id: string
          level_number: number | null
          state_id: string | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_level?: string | null
          id?: string
          level_number?: number | null
          state_id?: string | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_level?: string | null
          id?: string
          level_number?: number | null
          state_id?: string | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_levels_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
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
          custom_neighborhood: string | null
          custom_travel_organization: string | null
          display_name: string | null
          full_name: string | null
          gender: string | null
          id: string
          neighborhood: string | null
          occupation: string | null
          other_motive: string | null
          phone: string | null
          region: string | null
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
        }
        Insert: {
          accessibility_preference?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          custom_neighborhood?: string | null
          custom_travel_organization?: string | null
          display_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          neighborhood?: string | null
          occupation?: string | null
          other_motive?: string | null
          phone?: string | null
          region?: string | null
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
        }
        Update: {
          accessibility_preference?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          custom_neighborhood?: string | null
          custom_travel_organization?: string | null
          display_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          neighborhood?: string | null
          occupation?: string | null
          other_motive?: string | null
          phone?: string | null
          region?: string | null
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
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          city_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          region: string | null
          region_id: string | null
          role: string
          state_id: string | null
          user_id: string
        }
        Insert: {
          city_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          region?: string | null
          region_id?: string | null
          role: string
          state_id?: string | null
          user_id: string
        }
        Update: {
          city_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          region?: string | null
          region_id?: string | null
          role?: string
          state_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "flowtrip_states"
            referencedColumns: ["id"]
          },
        ]
      }
      alumia_bookings: {
        Row: {
          id: string
          alumia_id: string
          tourist_id: string | null
          service_type: string | null
          service_id: string | null
          date: string | null
          time: string | null
          people: number | null
          total_price: number | null
          status: string | null
          payment_status: string | null
          special_requirements: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          alumia_id: string
          tourist_id?: string | null
          service_type?: string | null
          service_id?: string | null
          date?: string | null
          time?: string | null
          people?: number | null
          total_price?: number | null
          status?: string | null
          payment_status?: string | null
          special_requirements?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          alumia_id?: string
          tourist_id?: string | null
          service_type?: string | null
          service_id?: string | null
          date?: string | null
          time?: string | null
          people?: number | null
          total_price?: number | null
          status?: string | null
          payment_status?: string | null
          special_requirements?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alumia_bookings_tourist_id_fkey"
            columns: ["tourist_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      alumia_analytics_data: {
        Row: {
          id: string
          period: string | null
          total_visitors: number | null
          total_bookings: number | null
          total_revenue: number | null
          popular_destinations: Json | null
          popular_events: Json | null
          visitor_demographics_by_country: Json | null
          visitor_demographics_by_age: Json | null
          visitor_demographics_by_language: Json | null
          booking_trends: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          period?: string | null
          total_visitors?: number | null
          total_bookings?: number | null
          total_revenue?: number | null
          popular_destinations?: Json | null
          popular_events?: Json | null
          visitor_demographics_by_country?: Json | null
          visitor_demographics_by_age?: Json | null
          visitor_demographics_by_language?: Json | null
          booking_trends?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          period?: string | null
          total_visitors?: number | null
          total_bookings?: number | null
          total_revenue?: number | null
          popular_destinations?: Json | null
          popular_events?: Json | null
          visitor_demographics_by_country?: Json | null
          visitor_demographics_by_age?: Json | null
          visitor_demographics_by_language?: Json | null
          booking_trends?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tourism_events_data: {
        Row: {
          id: string
          name: string
          description: string | null
          start_date: string
          end_date: string | null
          location: string | null
          category: string | null
          price: number | null
          capacity: number | null
          status: string | null
          organizer: string | null
          contact_info: string | null
          images: string[] | null
          tags: string[] | null
          city_id: string | null
          created_at: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          start_date: string
          end_date?: string | null
          location?: string | null
          category?: string | null
          price?: number | null
          capacity?: number | null
          status?: string | null
          organizer?: string | null
          contact_info?: string | null
          images?: string[] | null
          tags?: string[] | null
          city_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string | null
          location?: string | null
          category?: string | null
          price?: number | null
          capacity?: number | null
          status?: string | null
          organizer?: string | null
          contact_info?: string | null
          images?: string[] | null
          tags?: string[] | null
          city_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tourism_events_data_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          }
        ]
      }
      tourism_destinations_data: {
        Row: {
          id: string
          name: string
          description: string | null
          latitude: number | null
          longitude: number | null
          address: string | null
          city_id: string | null
          category: string | null
          rating: number | null
          price_range: string | null
          images: string[] | null
          availability_info: string | null
          accessibility_features: string[] | null
          contact_phone: string | null
          contact_email: string | null
          website: string | null
          opening_hours: string | null
          capacity: number | null
          created_at: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          latitude?: number | null
          longitude?: number | null
          address?: string | null
          city_id?: string | null
          category?: string | null
          rating?: number | null
          price_range?: string | null
          images?: string[] | null
          availability_info?: string | null
          accessibility_features?: string[] | null
          contact_phone?: string | null
          contact_email?: string | null
          website?: string | null
          opening_hours?: string | null
          capacity?: number | null
          created_at?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          latitude?: number | null
          longitude?: number | null
          address?: string | null
          city_id?: string | null
          category?: string | null
          rating?: number | null
          price_range?: string | null
          images?: string[] | null
          availability_info?: string | null
          accessibility_features?: string[] | null
          contact_phone?: string | null
          contact_email?: string | null
          website?: string | null
          opening_hours?: string | null
          capacity?: number | null
          created_at?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tourism_destinations_data_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          }
        ]
      }
      tourism_feedback_data: {
        Row: {
          id: string
          feedback_type: string | null
          content: string
          sentiment: string | null
          city_id: string | null
          user_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          feedback_type?: string | null
          content: string
          sentiment?: string | null
          city_id?: string | null
          user_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          feedback_type?: string | null
          content?: string
          sentiment?: string | null
          city_id?: string | null
          user_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tourism_feedback_data_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tourism_feedback_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_user_role: {
        Args: {
          p_user_id: string
          p_role: string
          p_city_id?: string
          p_region_id?: string
        }
        Returns: boolean
      }
      create_initial_admin_if_needed: {
        Args: { admin_email: string; admin_user_id: string }
        Returns: boolean
      }
      create_initial_admin_user: {
        Args: {
          admin_email: string
          admin_password: string
          admin_name?: string
        }
        Returns: boolean
      }
      create_password_reset_token: {
        Args: { user_email: string }
        Returns: string
      }
      create_test_user_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id_created: string
          email_ref: string
          role_assigned: string
        }[]
      }
      detect_suspicious_activity: {
        Args: { check_user_id: string }
        Returns: Json
      }
      elevate_to_admin: {
        Args: { user_email: string }
        Returns: undefined
      }
      ensure_admin_exists: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      fix_incomplete_profiles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { check_user_id: string }
        Returns: string
      }
      get_user_states: {
        Args: { check_user_id: string }
        Returns: {
          state_id: string
          state_code: string
          state_name: string
          user_role: string
        }[]
      }
      get_user_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          role_name: string
          user_count: number
          active_count: number
        }[]
      }
      get_users_by_role: {
        Args: { target_role: string }
        Returns: {
          id: string
          email: string
          full_name: string
          region: string
          created_at: string
        }[]
      }
      get_users_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          full_name: string
          user_type: string
          role: string
          region: string
          status: string
          created_at: string
          last_sign_in_at: string
          phone: string
          city: string
        }[]
      }
      has_state_role: {
        Args: {
          check_user_id: string
          required_role: string
          check_state_id: string
        }
        Returns: boolean
      }
      is_admin_user: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_manager: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      log_enhanced_security_event: {
        Args: {
          event_action: string
          event_user_id?: string
          event_success?: boolean
          event_error_message?: string
          event_metadata?: Json
        }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          event_action: string
          event_user_id?: string
          event_success?: boolean
          event_error_message?: string
          event_ip_address?: string
          event_user_agent?: string
        }
        Returns: boolean
      }
      promote_user_to_role: {
        Args: { p_email: string; p_role: string }
        Returns: boolean
      }
      secure_update_user_role: {
        Args: {
          target_user_id: string
          new_role: string
          requesting_user_id?: string
        }
        Returns: boolean
      }
      update_user_points: {
        Args: { p_user_id: string; p_state_id: string; p_points: number }
        Returns: undefined
      }
      validate_password_reset_token: {
        Args: { token_hash: string; user_email: string }
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
