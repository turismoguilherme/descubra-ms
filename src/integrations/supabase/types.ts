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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string | null
          created_at: string | null
          criteria: Json
          description: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          points_reward: number | null
          rarity: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          criteria?: Json
          description: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_reward?: number | null
          rarity?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          criteria?: Json
          description?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_reward?: number | null
          rarity?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_agent_config: {
        Row: {
          active: boolean
          autonomy_level: number
          created_at: string | null
          created_by: string | null
          id: string
          permissions: Json
          tasks: Json
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          autonomy_level?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          permissions?: Json
          tasks?: Json
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          autonomy_level?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          permissions?: Json
          tasks?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_analyses: {
        Row: {
          analysis_data: Json
          created_at: string | null
          created_by: string | null
          id: string
          insights: string | null
          type: string
        }
        Insert: {
          analysis_data?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          insights?: string | null
          type: string
        }
        Update: {
          analysis_data?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          insights?: string | null
          type?: string
        }
        Relationships: []
      }
      ai_auto_approvals: {
        Row: {
          approval_reason: string
          created_at: string | null
          event_data: Json | null
          event_id: string
          id: string
          rules_applied: Json | null
        }
        Insert: {
          approval_reason: string
          created_at?: string | null
          event_data?: Json | null
          event_id: string
          id?: string
          rules_applied?: Json | null
        }
        Update: {
          approval_reason?: string
          created_at?: string | null
          event_data?: Json | null
          event_id?: string
          id?: string
          rules_applied?: Json | null
        }
        Relationships: []
      }
      ai_consultant_config: {
        Row: {
          city_id: string | null
          confidence_threshold: number | null
          created_at: string | null
          custom_prompts: Json | null
          data_sources: Json | null
          enabled: boolean | null
          gemini_api_key_encrypted: string | null
          id: string
          max_queries_per_day: number | null
          region_id: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          city_id?: string | null
          confidence_threshold?: number | null
          created_at?: string | null
          custom_prompts?: Json | null
          data_sources?: Json | null
          enabled?: boolean | null
          gemini_api_key_encrypted?: string | null
          id?: string
          max_queries_per_day?: number | null
          region_id?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          city_id?: string | null
          confidence_threshold?: number | null
          created_at?: string | null
          custom_prompts?: Json | null
          data_sources?: Json | null
          enabled?: boolean | null
          gemini_api_key_encrypted?: string | null
          id?: string
          max_queries_per_day?: number | null
          region_id?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_consultant_config_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_consultant_config_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_consultant_feedback: {
        Row: {
          created_at: string | null
          feedback_text: string | null
          helpful: boolean | null
          id: string
          improvement_suggestions: string | null
          log_id: string | null
          rating: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          feedback_text?: string | null
          helpful?: boolean | null
          id?: string
          improvement_suggestions?: string | null
          log_id?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          feedback_text?: string | null
          helpful?: boolean | null
          id?: string
          improvement_suggestions?: string | null
          log_id?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_consultant_feedback_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "ai_consultant_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_consultant_logs: {
        Row: {
          confidence: number | null
          context: Json | null
          created_at: string | null
          error_message: string | null
          id: string
          insights_count: number | null
          processing_time_ms: number | null
          question: string
          recommendations_count: number | null
          response_summary: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          confidence?: number | null
          context?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          insights_count?: number | null
          processing_time_ms?: number | null
          question: string
          recommendations_count?: number | null
          response_summary?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          confidence?: number | null
          context?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          insights_count?: number | null
          processing_time_ms?: number | null
          question?: string
          recommendations_count?: number | null
          response_summary?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_feedback_log: {
        Row: {
          comments: string | null
          created_at: string | null
          feedback_by_user_id: string | null
          feedback_type: string
          id: string
          interaction_id: string | null
          score: number | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          feedback_by_user_id?: string | null
          feedback_type: string
          id?: string
          interaction_id?: string | null
          score?: number | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          feedback_by_user_id?: string | null
          feedback_type?: string
          id?: string
          interaction_id?: string | null
          score?: number | null
        }
        Relationships: []
      }
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
      ai_proactive_insights: {
        Row: {
          city_id: string | null
          confidence: number | null
          created_at: string | null
          data_sources: Json | null
          description: string
          dismissed_by: string[] | null
          expires_at: string | null
          id: string
          insight_type: string
          region_id: string | null
          severity: string | null
          tenant_id: string
          title: string
          updated_at: string | null
          viewed_by: string[] | null
        }
        Insert: {
          city_id?: string | null
          confidence?: number | null
          created_at?: string | null
          data_sources?: Json | null
          description: string
          dismissed_by?: string[] | null
          expires_at?: string | null
          id?: string
          insight_type: string
          region_id?: string | null
          severity?: string | null
          tenant_id: string
          title: string
          updated_at?: string | null
          viewed_by?: string[] | null
        }
        Update: {
          city_id?: string | null
          confidence?: number | null
          created_at?: string | null
          data_sources?: Json | null
          description?: string
          dismissed_by?: string[] | null
          expires_at?: string | null
          id?: string
          insight_type?: string
          region_id?: string | null
          severity?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
          viewed_by?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_proactive_insights_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_proactive_insights_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_seo_improvements: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          improvements: Json
          priority: string | null
          seo_analysis: string | null
          status: string | null
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          improvements?: Json
          priority?: string | null
          seo_analysis?: string | null
          status?: string | null
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          improvements?: Json
          priority?: string | null
          seo_analysis?: string | null
          status?: string | null
        }
        Relationships: []
      }
      attendant_allowed_locations: {
        Row: {
          address: string | null
          allowed_radius: number
          city_id: string | null
          client_slug: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          latitude: number
          longitude: number
          name: string
          updated_at: string | null
          working_hours: Json
        }
        Insert: {
          address?: string | null
          allowed_radius?: number
          city_id?: string | null
          client_slug: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          latitude: number
          longitude: number
          name: string
          updated_at?: string | null
          working_hours?: Json
        }
        Update: {
          address?: string | null
          allowed_radius?: number
          city_id?: string | null
          client_slug?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          updated_at?: string | null
          working_hours?: Json
        }
        Relationships: [
          {
            foreignKeyName: "attendant_allowed_locations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      attendant_checkins: {
        Row: {
          accuracy: number | null
          attendant_id: string
          checkin_time: string | null
          checkout_latitude: number | null
          checkout_longitude: number | null
          checkout_time: string | null
          client_slug: string
          created_at: string | null
          id: string
          is_valid: boolean
          latitude: number
          location_id: string | null
          longitude: number
          rejection_reason: string | null
          updated_at: string | null
        }
        Insert: {
          accuracy?: number | null
          attendant_id: string
          checkin_time?: string | null
          checkout_latitude?: number | null
          checkout_longitude?: number | null
          checkout_time?: string | null
          client_slug: string
          created_at?: string | null
          id?: string
          is_valid?: boolean
          latitude: number
          location_id?: string | null
          longitude: number
          rejection_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          accuracy?: number | null
          attendant_id?: string
          checkin_time?: string | null
          checkout_latitude?: number | null
          checkout_longitude?: number | null
          checkout_time?: string | null
          client_slug?: string
          created_at?: string | null
          id?: string
          is_valid?: boolean
          latitude?: number
          location_id?: string | null
          longitude?: number
          rejection_reason?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendant_checkins_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "attendant_allowed_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      attendant_location_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          attendant_id: string
          id: string
          is_active: boolean | null
          location_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          attendant_id: string
          id?: string
          is_active?: boolean | null
          location_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          attendant_id?: string
          id?: string
          is_active?: boolean | null
          location_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendant_location_assignments_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "attendant_allowed_locations"
            referencedColumns: ["id"]
          },
        ]
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
      automated_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          executed_at: string | null
          executed_by_ai: boolean | null
          failed_reason: string | null
          id: string
          related_workflow_id: string | null
          requester_user_id: string | null
          scheduled_at: string | null
          status: string
          task_name: string
          task_parameters: Json | null
          task_results: Json | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          executed_at?: string | null
          executed_by_ai?: boolean | null
          failed_reason?: string | null
          id?: string
          related_workflow_id?: string | null
          requester_user_id?: string | null
          scheduled_at?: string | null
          status?: string
          task_name: string
          task_parameters?: Json | null
          task_results?: Json | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          executed_at?: string | null
          executed_by_ai?: boolean | null
          failed_reason?: string | null
          id?: string
          related_workflow_id?: string | null
          requester_user_id?: string | null
          scheduled_at?: string | null
          status?: string
          task_name?: string
          task_parameters?: Json | null
          task_results?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automated_tasks_related_workflow_id_fkey"
            columns: ["related_workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_definitions"
            referencedColumns: ["id"]
          },
        ]
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
          platform: string | null
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
          platform?: string | null
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
          platform?: string | null
          region?: string | null
          updated_at?: string
          working_hours?: string | null
        }
        Relationships: []
      }
      checkpoint_code_attempts: {
        Row: {
          checkpoint_id: string
          code_input: string
          created_at: string | null
          id: string
          ip_address: unknown
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          checkpoint_id: string
          code_input: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          success: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          checkpoint_id?: string
          code_input?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkpoint_code_attempts_checkpoint_id_fkey"
            columns: ["checkpoint_id"]
            isOneToOne: false
            referencedRelation: "route_checkpoints"
            referencedColumns: ["id"]
          },
        ]
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
      commercial_partner_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          partner_id: string
          recorded_at: string
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value?: number
          partner_id: string
          recorded_at?: string
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          partner_id?: string
          recorded_at?: string
          source?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_partner_metrics_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "commercial_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_partners: {
        Row: {
          address: string | null
          approved_at: string | null
          approved_by: string | null
          business_type: string
          city: string | null
          cnpj: string
          company_name: string
          company_size: string
          contact_email: string
          contact_person: string
          contact_phone: string | null
          contact_whatsapp: string | null
          conversion_rate: number | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          featured: boolean | null
          gallery_images: string[] | null
          id: string
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          monthly_fee: number | null
          operating_hours: Json | null
          price_range: string | null
          seasonal_info: Json | null
          services_offered: string[] | null
          state: string | null
          status: string
          subscription_end_date: string | null
          subscription_plan: string
          subscription_start_date: string | null
          subscription_status: string
          target_audience: string[] | null
          total_clicks: number | null
          total_views: number | null
          trade_name: string | null
          updated_at: string
          verified: boolean | null
          website_url: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          business_type: string
          city?: string | null
          cnpj: string
          company_name: string
          company_size?: string
          contact_email: string
          contact_person: string
          contact_phone?: string | null
          contact_whatsapp?: string | null
          conversion_rate?: number | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          featured?: boolean | null
          gallery_images?: string[] | null
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          monthly_fee?: number | null
          operating_hours?: Json | null
          price_range?: string | null
          seasonal_info?: Json | null
          services_offered?: string[] | null
          state?: string | null
          status?: string
          subscription_end_date?: string | null
          subscription_plan?: string
          subscription_start_date?: string | null
          subscription_status?: string
          target_audience?: string[] | null
          total_clicks?: number | null
          total_views?: number | null
          trade_name?: string | null
          updated_at?: string
          verified?: boolean | null
          website_url?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          business_type?: string
          city?: string | null
          cnpj?: string
          company_name?: string
          company_size?: string
          contact_email?: string
          contact_person?: string
          contact_phone?: string | null
          contact_whatsapp?: string | null
          conversion_rate?: number | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          featured?: boolean | null
          gallery_images?: string[] | null
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          monthly_fee?: number | null
          operating_hours?: Json | null
          price_range?: string | null
          seasonal_info?: Json | null
          services_offered?: string[] | null
          state?: string | null
          status?: string
          subscription_end_date?: string | null
          subscription_plan?: string
          subscription_start_date?: string | null
          subscription_status?: string
          target_audience?: string[] | null
          total_clicks?: number | null
          total_views?: number | null
          trade_name?: string | null
          updated_at?: string
          verified?: boolean | null
          website_url?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      commercial_subscription_plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          is_active: boolean | null
          limits: Json
          monthly_price: number
          plan_name: string
          plan_type: string
          sort_order: number | null
          updated_at: string
          yearly_price: number | null
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean | null
          limits?: Json
          monthly_price?: number
          plan_name: string
          plan_type: string
          sort_order?: number | null
          updated_at?: string
          yearly_price?: number | null
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean | null
          limits?: Json
          monthly_price?: number
          plan_name?: string
          plan_type?: string
          sort_order?: number | null
          updated_at?: string
          yearly_price?: number | null
        }
        Relationships: []
      }
      communication_logs: {
        Row: {
          ai_generated_response: boolean | null
          body: string
          channel: string
          created_at: string | null
          direction: string
          from_address: string
          id: string
          related_ticket_id: string | null
          status: string
          subject_or_topic: string | null
          timestamp: string
          to_address: string
          updated_at: string | null
        }
        Insert: {
          ai_generated_response?: boolean | null
          body: string
          channel: string
          created_at?: string | null
          direction: string
          from_address: string
          id?: string
          related_ticket_id?: string | null
          status: string
          subject_or_topic?: string | null
          timestamp?: string
          to_address: string
          updated_at?: string | null
        }
        Update: {
          ai_generated_response?: boolean | null
          body?: string
          channel?: string
          created_at?: string | null
          direction?: string
          from_address?: string
          id?: string
          related_ticket_id?: string | null
          status?: string
          subject_or_topic?: string | null
          timestamp?: string
          to_address?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_logs_related_ticket_id_fkey"
            columns: ["related_ticket_id"]
            isOneToOne: false
            referencedRelation: "flowtrip_support_tickets"
            referencedColumns: ["id"]
          },
        ]
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
      content_translations: {
        Row: {
          content: Json
          content_key: string
          created_at: string | null
          id: string
          language_code: string
          platform: string
          section: string
          updated_at: string | null
        }
        Insert: {
          content: Json
          content_key: string
          created_at?: string | null
          id?: string
          language_code: string
          platform?: string
          section?: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          content_key?: string
          created_at?: string | null
          id?: string
          language_code?: string
          platform?: string
          section?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          content: string
          content_key: string
          content_type: string
          created_at: string | null
          edited_by: string | null
          id: string
          is_published: boolean | null
          platform: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          content: string
          content_key: string
          content_type: string
          created_at?: string | null
          edited_by?: string | null
          id?: string
          is_published?: boolean | null
          platform: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          content?: string
          content_key?: string
          content_type?: string
          created_at?: string | null
          edited_by?: string | null
          id?: string
          is_published?: boolean | null
          platform?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_versions_edited_by_fkey"
            columns: ["edited_by"]
            isOneToOne: false
            referencedRelation: "viajar_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      destination_details: {
        Row: {
          address: string | null
          best_time_to_visit: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          destination_id: string | null
          highlights: string[] | null
          how_to_get_there: string | null
          id: string
          image_gallery: string[] | null
          map_image_url: string | null
          map_latitude: number | null
          map_longitude: number | null
          official_website: string | null
          promotional_text: string | null
          social_links: Json | null
          tourism_tags: string[] | null
          tourist_region_id: string | null
          updated_at: string | null
          updated_by: string | null
          video_type: string | null
          video_url: string | null
        }
        Insert: {
          address?: string | null
          best_time_to_visit?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          destination_id?: string | null
          highlights?: string[] | null
          how_to_get_there?: string | null
          id?: string
          image_gallery?: string[] | null
          map_image_url?: string | null
          map_latitude?: number | null
          map_longitude?: number | null
          official_website?: string | null
          promotional_text?: string | null
          social_links?: Json | null
          tourism_tags?: string[] | null
          tourist_region_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          video_type?: string | null
          video_url?: string | null
        }
        Update: {
          address?: string | null
          best_time_to_visit?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          destination_id?: string | null
          highlights?: string[] | null
          how_to_get_there?: string | null
          id?: string
          image_gallery?: string[] | null
          map_image_url?: string | null
          map_latitude?: number | null
          map_longitude?: number | null
          official_website?: string | null
          promotional_text?: string | null
          social_links?: Json | null
          tourism_tags?: string[] | null
          tourist_region_id?: string | null
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
          {
            foreignKeyName: "destination_details_tourist_region_id_fkey"
            columns: ["tourist_region_id"]
            isOneToOne: false
            referencedRelation: "tourist_regions"
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
      document_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string | null
          document_id: string
          embedding: string | null
          id: string
          metadata: Json | null
          state_code: string | null
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string | null
          document_id: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          state_code?: string | null
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string | null
          document_id?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          state_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          last_fetched_at: string | null
          metadata: Json | null
          source: string | null
          state_code: string | null
          tenant_id: string | null
          title: string
          url: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          last_fetched_at?: string | null
          metadata?: Json | null
          source?: string | null
          state_code?: string | null
          tenant_id?: string | null
          title: string
          url?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          last_fetched_at?: string | null
          metadata?: Json | null
          source?: string | null
          state_code?: string | null
          tenant_id?: string | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      dynamic_menus: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          label: string
          menu_type: string
          order_index: number | null
          parent_id: string | null
          path: string | null
          platform: string
          requires_auth: boolean | null
          roles: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          menu_type: string
          order_index?: number | null
          parent_id?: string | null
          path?: string | null
          platform: string
          requires_auth?: boolean | null
          roles?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          menu_type?: string
          order_index?: number | null
          parent_id?: string | null
          path?: string | null
          platform?: string
          requires_auth?: boolean | null
          roles?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_menus_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "dynamic_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_salaries: {
        Row: {
          base_salary: number
          bonuses: number | null
          created_at: string | null
          deductions: number | null
          employee_id: string
          id: string
          month: number
          notes: string | null
          payment_date: string | null
          payment_status: string | null
          total_amount: number
          updated_at: string | null
          year: number
        }
        Insert: {
          base_salary: number
          bonuses?: number | null
          created_at?: string | null
          deductions?: number | null
          employee_id: string
          id?: string
          month: number
          notes?: string | null
          payment_date?: string | null
          payment_status?: string | null
          total_amount: number
          updated_at?: string | null
          year: number
        }
        Update: {
          base_salary?: number
          bonuses?: number | null
          created_at?: string | null
          deductions?: number | null
          employee_id?: string
          id?: string
          month?: number
          notes?: string | null
          payment_date?: string | null
          payment_status?: string | null
          total_amount?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_salaries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "viajar_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      event_cleanup_logs: {
        Row: {
          created_at: string
          deleted_event_ids: string[] | null
          execution_date: string
          expired_events_deleted: number
          id: string
          rejected_events_deleted: number
          result: Json | null
          total_deleted: number
        }
        Insert: {
          created_at?: string
          deleted_event_ids?: string[] | null
          execution_date?: string
          expired_events_deleted?: number
          id?: string
          rejected_events_deleted?: number
          result?: Json | null
          total_deleted?: number
        }
        Update: {
          created_at?: string
          deleted_event_ids?: string[] | null
          execution_date?: string
          expired_events_deleted?: number
          id?: string
          rejected_events_deleted?: number
          result?: Json | null
          total_deleted?: number
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
          approval_status: string | null
          auto_hide: boolean | null
          category: string | null
          city_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          galeria_imagens: string[] | null
          id: string
          image_url: string | null
          is_sponsored: boolean | null
          is_visible: boolean | null
          location: string | null
          logo_evento: string | null
          name: string
          organizador_email: string | null
          organizador_empresa: string | null
          organizador_nome: string | null
          organizador_telefone: string | null
          return_domain: string | null
          site_oficial: string | null
          sponsor_amount: number | null
          sponsor_end_date: string | null
          sponsor_payment_status: string | null
          sponsor_start_date: string | null
          sponsor_tier: string | null
          start_date: string
          start_time: string | null
          state_id: string | null
          stripe_payment_link_url: string | null
          tourist_region_id: string | null
          updated_at: string | null
          video_url: string | null
          visibility_end_date: string | null
        }
        Insert: {
          approval_status?: string | null
          auto_hide?: boolean | null
          category?: string | null
          city_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          galeria_imagens?: string[] | null
          id?: string
          image_url?: string | null
          is_sponsored?: boolean | null
          is_visible?: boolean | null
          location?: string | null
          logo_evento?: string | null
          name: string
          organizador_email?: string | null
          organizador_empresa?: string | null
          organizador_nome?: string | null
          organizador_telefone?: string | null
          return_domain?: string | null
          site_oficial?: string | null
          sponsor_amount?: number | null
          sponsor_end_date?: string | null
          sponsor_payment_status?: string | null
          sponsor_start_date?: string | null
          sponsor_tier?: string | null
          start_date: string
          start_time?: string | null
          state_id?: string | null
          stripe_payment_link_url?: string | null
          tourist_region_id?: string | null
          updated_at?: string | null
          video_url?: string | null
          visibility_end_date?: string | null
        }
        Update: {
          approval_status?: string | null
          auto_hide?: boolean | null
          category?: string | null
          city_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          galeria_imagens?: string[] | null
          id?: string
          image_url?: string | null
          is_sponsored?: boolean | null
          is_visible?: boolean | null
          location?: string | null
          logo_evento?: string | null
          name?: string
          organizador_email?: string | null
          organizador_empresa?: string | null
          organizador_nome?: string | null
          organizador_telefone?: string | null
          return_domain?: string | null
          site_oficial?: string | null
          sponsor_amount?: number | null
          sponsor_end_date?: string | null
          sponsor_payment_status?: string | null
          sponsor_start_date?: string | null
          sponsor_tier?: string | null
          start_date?: string
          start_time?: string | null
          state_id?: string | null
          stripe_payment_link_url?: string | null
          tourist_region_id?: string | null
          updated_at?: string | null
          video_url?: string | null
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
          {
            foreignKeyName: "events_tourist_region_id_fkey"
            columns: ["tourist_region_id"]
            isOneToOne: false
            referencedRelation: "tourist_regions"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          created_by: string | null
          description: string
          due_date: string
          id: string
          metadata: Json | null
          paid_date: string | null
          payment_status: string | null
          recurring: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          created_by?: string | null
          description: string
          due_date: string
          id?: string
          metadata?: Json | null
          paid_date?: string | null
          payment_status?: string | null
          recurring?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          due_date?: string
          id?: string
          metadata?: Json | null
          paid_date?: string | null
          payment_status?: string | null
          recurring?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
          description: string | null
          gradient_end: string | null
          gradient_start: string | null
          has_alumia: boolean | null
          hero_image_url: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          monthly_fee: number | null
          name: string
          plan_type: string | null
          primary_color: string | null
          secondary_color: string | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          billing_email?: string | null
          code: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          description?: string | null
          gradient_end?: string | null
          gradient_start?: string | null
          has_alumia?: boolean | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          monthly_fee?: number | null
          name: string
          plan_type?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          billing_email?: string | null
          code?: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          description?: string | null
          gradient_end?: string | null
          gradient_start?: string | null
          has_alumia?: boolean | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          monthly_fee?: number | null
          name?: string
          plan_type?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      flowtrip_subscriptions: {
        Row: {
          billing_cycle: string | null
          cancelled_at: string | null
          client_id: string | null
          created_at: string | null
          current_period_end: string | null
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
          cancelled_at?: string | null
          client_id?: string | null
          created_at?: string | null
          current_period_end?: string | null
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
          cancelled_at?: string | null
          client_id?: string | null
          created_at?: string | null
          current_period_end?: string | null
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
      guata_feedback: {
        Row: {
          answer: string | null
          correction: string | null
          created_at: string
          domain: string | null
          id: string
          meta: Json | null
          positive: boolean
          question: string
          session_id: string | null
          source_title: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          answer?: string | null
          correction?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          meta?: Json | null
          positive: boolean
          question: string
          session_id?: string | null
          source_title?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          answer?: string | null
          correction?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          meta?: Json | null
          positive?: boolean
          question?: string
          session_id?: string | null
          source_title?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      guata_knowledge_base: {
        Row: {
          ativo: boolean
          criado_em: string | null
          fonte: string
          id: string
          pergunta: string
          pergunta_normalizada: string
          resposta: string
          tags: string[] | null
          tipo: string
          ultima_atualizacao: string | null
          usado_por: number | null
        }
        Insert: {
          ativo?: boolean
          criado_em?: string | null
          fonte?: string
          id?: string
          pergunta: string
          pergunta_normalizada: string
          resposta: string
          tags?: string[] | null
          tipo?: string
          ultima_atualizacao?: string | null
          usado_por?: number | null
        }
        Update: {
          ativo?: boolean
          criado_em?: string | null
          fonte?: string
          id?: string
          pergunta?: string
          pergunta_normalizada?: string
          resposta?: string
          tags?: string[] | null
          tipo?: string
          ultima_atualizacao?: string | null
          usado_por?: number | null
        }
        Relationships: []
      }
      guata_response_cache: {
        Row: {
          answer: string
          cache_type: string
          created_at: string | null
          expires_at: string
          id: string
          is_suggestion: boolean | null
          question: string
          question_hash: string
          session_id: string | null
          updated_at: string | null
          used_count: number | null
          user_id: string | null
        }
        Insert: {
          answer: string
          cache_type?: string
          created_at?: string | null
          expires_at: string
          id?: string
          is_suggestion?: boolean | null
          question: string
          question_hash: string
          session_id?: string | null
          updated_at?: string | null
          used_count?: number | null
          user_id?: string | null
        }
        Update: {
          answer?: string
          cache_type?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          is_suggestion?: boolean | null
          question?: string
          question_hash?: string
          session_id?: string | null
          updated_at?: string | null
          used_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      guata_user_memory: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          memory_key: string
          memory_type: string
          memory_value: Json | null
          session_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          memory_key: string
          memory_type: string
          memory_value?: Json | null
          session_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          memory_key?: string
          memory_type?: string
          memory_value?: Json | null
          session_id?: string
          updated_at?: string | null
          user_id?: string | null
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
          address: string | null
          approved_at: string | null
          approved_by: string | null
          cnpj: string | null
          contact_email: string | null
          contact_phone: string | null
          cpf: string | null
          created_at: string
          created_by: string | null
          description: string | null
          discount_offer: string | null
          gallery_images: string[] | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          partner_type: string | null
          person_type: string | null
          status: string
          stripe_account_id: string | null
          stripe_connect_status: string | null
          stripe_connected_at: string | null
          updated_at: string
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          cnpj?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_offer?: string | null
          gallery_images?: string[] | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          partner_type?: string | null
          person_type?: string | null
          status?: string
          stripe_account_id?: string | null
          stripe_connect_status?: string | null
          stripe_connected_at?: string | null
          updated_at?: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          cnpj?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_offer?: string | null
          gallery_images?: string[] | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          partner_type?: string | null
          person_type?: string | null
          status?: string
          stripe_account_id?: string | null
          stripe_connect_status?: string | null
          stripe_connected_at?: string | null
          updated_at?: string
          website_url?: string | null
          youtube_url?: string | null
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
      inventory_analytics: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          inventory_id: string | null
          ip_address: unknown
          metadata: Json | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          inventory_id?: string | null
          ip_address?: unknown
          metadata?: Json | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          inventory_id?: string | null
          ip_address?: unknown
          metadata?: Json | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_analytics_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "tourism_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          inventory_id: string | null
          is_approved: boolean | null
          is_verified: boolean | null
          rating: number | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          inventory_id?: string | null
          is_approved?: boolean | null
          is_verified?: boolean | null
          rating?: number | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          inventory_id?: string | null
          is_approved?: boolean | null
          is_verified?: boolean | null
          rating?: number | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_reviews_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "tourism_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base_entries: {
        Row: {
          category: string
          content: string
          context_type: string
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
          context_type?: string
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
          context_type?: string
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
      koda_response_cache: {
        Row: {
          answer: string
          cache_type: string
          created_at: string | null
          expires_at: string
          id: string
          is_suggestion: boolean | null
          language: string
          question: string
          question_hash: string
          session_id: string | null
          updated_at: string | null
          used_count: number | null
          user_id: string | null
        }
        Insert: {
          answer: string
          cache_type?: string
          created_at?: string | null
          expires_at: string
          id?: string
          is_suggestion?: boolean | null
          language?: string
          question: string
          question_hash: string
          session_id?: string | null
          updated_at?: string | null
          used_count?: number | null
          user_id?: string | null
        }
        Update: {
          answer?: string
          cache_type?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          is_suggestion?: boolean | null
          language?: string
          question?: string
          question_hash?: string
          session_id?: string | null
          updated_at?: string | null
          used_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          duration: number | null
          id: string
          lead_id: string | null
          outcome: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          description?: string | null
          duration?: number | null
          id?: string
          lead_id?: string | null
          outcome?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          duration?: number | null
          id?: string
          lead_id?: string | null
          outcome?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_pipeline_stages: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          order_index: number | null
          pipeline_id: string | null
          probability: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_index?: number | null
          pipeline_id?: string | null
          probability?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          pipeline_id?: string | null
          probability?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "lead_pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_pipelines: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
        }
        Relationships: []
      }
      lead_priorities: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          order_index: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_index?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
        }
        Relationships: []
      }
      lead_sources: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      lead_statuses: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_final: boolean | null
          name: string
          order_index: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_final?: boolean | null
          name: string
          order_index?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_final?: boolean | null
          name?: string
          order_index?: number | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to: string | null
          company: string | null
          created_at: string | null
          created_by: string | null
          custom_fields: Json | null
          email: string
          id: string
          last_contact_date: string | null
          name: string
          next_follow_up: string | null
          notes: string | null
          phone: string | null
          priority_id: string | null
          source_id: string | null
          status_id: string | null
          tags: string[] | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          email: string
          id?: string
          last_contact_date?: string | null
          name: string
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          priority_id?: string | null
          source_id?: string | null
          status_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          email?: string
          id?: string
          last_contact_date?: string | null
          name?: string
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          priority_id?: string | null
          source_id?: string | null
          status_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_priority_id_fkey"
            columns: ["priority_id"]
            isOneToOne: false
            referencedRelation: "lead_priorities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "lead_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      master_financial_records: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string
          due_date: string | null
          id: string
          metadata: Json | null
          paid_date: string | null
          record_type: string
          source: string | null
          status: string | null
          stripe_invoice_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description: string
          due_date?: string | null
          id?: string
          metadata?: Json | null
          paid_date?: string | null
          record_type: string
          source?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string
          due_date?: string | null
          id?: string
          metadata?: Json | null
          paid_date?: string | null
          record_type?: string
          source?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          body_template: string
          channel: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          purpose: string | null
          subject_template: string | null
          updated_at: string | null
          variables_json: Json | null
        }
        Insert: {
          body_template: string
          channel: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          purpose?: string | null
          subject_template?: string | null
          updated_at?: string | null
          variables_json?: Json | null
        }
        Update: {
          body_template?: string
          channel?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          purpose?: string | null
          subject_template?: string | null
          updated_at?: string | null
          variables_json?: Json | null
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
      offline_checkins: {
        Row: {
          accuracy: number | null
          checkpoint_id: string
          created_at: string | null
          device_info: string | null
          id: string
          latitude: number
          longitude: number
          photo_metadata: Json | null
          photo_url: string | null
          route_id: string
          synced: boolean | null
          synced_at: string | null
          user_id: string
          validated: boolean | null
          validation_error: string | null
        }
        Insert: {
          accuracy?: number | null
          checkpoint_id: string
          created_at?: string | null
          device_info?: string | null
          id?: string
          latitude: number
          longitude: number
          photo_metadata?: Json | null
          photo_url?: string | null
          route_id: string
          synced?: boolean | null
          synced_at?: string | null
          user_id: string
          validated?: boolean | null
          validation_error?: string | null
        }
        Update: {
          accuracy?: number | null
          checkpoint_id?: string
          created_at?: string | null
          device_info?: string | null
          id?: string
          latitude?: number
          longitude?: number
          photo_metadata?: Json | null
          photo_url?: string | null
          route_id?: string
          synced?: boolean | null
          synced_at?: string | null
          user_id?: string
          validated?: boolean | null
          validation_error?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offline_checkins_checkpoint_id_fkey"
            columns: ["checkpoint_id"]
            isOneToOne: false
            referencedRelation: "route_checkpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offline_checkins_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      pantanal_avatars: {
        Row: {
          conservation_actions: string[] | null
          created_at: string | null
          curiosities: string[] | null
          description: string | null
          diet: string | null
          display_order: number | null
          ecosystem_importance: string | null
          habitat: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_unlocked: boolean | null
          name: string
          personality_traits: string[] | null
          personality_why: string | null
          rarity: string | null
          scientific_name: string | null
          threats: string[] | null
          unlock_requirement: string | null
          updated_at: string | null
        }
        Insert: {
          conservation_actions?: string[] | null
          created_at?: string | null
          curiosities?: string[] | null
          description?: string | null
          diet?: string | null
          display_order?: number | null
          ecosystem_importance?: string | null
          habitat?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_unlocked?: boolean | null
          name: string
          personality_traits?: string[] | null
          personality_why?: string | null
          rarity?: string | null
          scientific_name?: string | null
          threats?: string[] | null
          unlock_requirement?: string | null
          updated_at?: string | null
        }
        Update: {
          conservation_actions?: string[] | null
          created_at?: string | null
          curiosities?: string[] | null
          description?: string | null
          diet?: string | null
          display_order?: number | null
          ecosystem_importance?: string | null
          habitat?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_unlocked?: boolean | null
          name?: string
          personality_traits?: string[] | null
          personality_why?: string | null
          rarity?: string | null
          scientific_name?: string | null
          threats?: string[] | null
          unlock_requirement?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      partner_availability: {
        Row: {
          available: boolean
          booked_guests: number | null
          created_at: string
          date: string
          id: string
          max_guests: number | null
          notes: string | null
          partner_id: string
          service_id: string | null
          updated_at: string
        }
        Insert: {
          available?: boolean
          booked_guests?: number | null
          created_at?: string
          date: string
          id?: string
          max_guests?: number | null
          notes?: string | null
          partner_id: string
          service_id?: string | null
          updated_at?: string
        }
        Update: {
          available?: boolean
          booked_guests?: number | null
          created_at?: string
          date?: string
          id?: string
          max_guests?: number | null
          notes?: string | null
          partner_id?: string
          service_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_availability_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "institutional_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_availability_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "partner_pricing"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_cancellation_policies: {
        Row: {
          created_at: string
          created_by: string | null
          days_before_0_refund_percent: number
          days_before_1_2_refund_percent: number
          days_before_7_refund_percent: number
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          partner_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          days_before_0_refund_percent?: number
          days_before_1_2_refund_percent?: number
          days_before_7_refund_percent?: number
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          partner_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          days_before_0_refund_percent?: number
          days_before_1_2_refund_percent?: number
          days_before_7_refund_percent?: number
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          partner_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_cancellation_policies_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "institutional_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string
          email_sent: boolean | null
          email_sent_at: string | null
          id: string
          message: string
          metadata: Json | null
          partner_id: string
          read: boolean | null
          read_at: string | null
          reservation_id: string | null
          title: string
          transaction_id: string | null
          type: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          partner_id: string
          read?: boolean | null
          read_at?: string | null
          reservation_id?: string | null
          title: string
          transaction_id?: string | null
          type: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          partner_id?: string
          read?: boolean | null
          read_at?: string | null
          reservation_id?: string | null
          title?: string
          transaction_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_notifications_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "institutional_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_notifications_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "partner_reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_notifications_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "partner_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_pricing: {
        Row: {
          base_price: number
          created_at: string
          description: string | null
          gallery_images: string[] | null
          id: string
          is_active: boolean
          max_guests: number | null
          min_guests: number | null
          partner_id: string
          price_per_night: number | null
          price_per_person: number | null
          pricing_type: string
          service_name: string
          service_type: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          base_price?: number
          created_at?: string
          description?: string | null
          gallery_images?: string[] | null
          id?: string
          is_active?: boolean
          max_guests?: number | null
          min_guests?: number | null
          partner_id: string
          price_per_night?: number | null
          price_per_person?: number | null
          pricing_type: string
          service_name: string
          service_type: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          base_price?: number
          created_at?: string
          description?: string | null
          gallery_images?: string[] | null
          id?: string
          is_active?: boolean
          max_guests?: number | null
          min_guests?: number | null
          partner_id?: string
          price_per_night?: number | null
          price_per_person?: number | null
          pricing_type?: string
          service_name?: string
          service_type?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_pricing_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "institutional_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_reservations: {
        Row: {
          cancelled_at: string | null
          check_in_date: string | null
          check_out_date: string | null
          commission_amount: number
          commission_rate: number
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          guests: number
          id: string
          partner_earnings: number | null
          partner_id: string
          partner_notes: string | null
          payment_amount: number | null
          payment_status: string | null
          platform_fee: number | null
          refund_amount: number | null
          refund_percent: number | null
          refunded_at: string | null
          reservation_code: string
          reservation_date: string
          reservation_time: string | null
          reservation_type: string
          service_id: string | null
          service_name: string
          special_requests: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cancelled_at?: string | null
          check_in_date?: string | null
          check_out_date?: string | null
          commission_amount?: number
          commission_rate?: number
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          guests?: number
          id?: string
          partner_earnings?: number | null
          partner_id: string
          partner_notes?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          platform_fee?: number | null
          refund_amount?: number | null
          refund_percent?: number | null
          refunded_at?: string | null
          reservation_code: string
          reservation_date: string
          reservation_time?: string | null
          reservation_type?: string
          service_id?: string | null
          service_name: string
          special_requests?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cancelled_at?: string | null
          check_in_date?: string | null
          check_out_date?: string | null
          commission_amount?: number
          commission_rate?: number
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          guests?: number
          id?: string
          partner_earnings?: number | null
          partner_id?: string
          partner_notes?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          platform_fee?: number | null
          refund_amount?: number | null
          refund_percent?: number | null
          refunded_at?: string | null
          reservation_code?: string
          reservation_date?: string
          reservation_time?: string | null
          reservation_type?: string
          service_id?: string | null
          service_name?: string
          special_requests?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_reservations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "institutional_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_reservations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "partner_pricing"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          description: string
          due_date: string | null
          id: string
          metadata: Json | null
          paid_date: string | null
          partner_id: string
          reservation_id: string | null
          status: string
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          description: string
          due_date?: string | null
          id?: string
          metadata?: Json | null
          paid_date?: string | null
          partner_id: string
          reservation_id?: string | null
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          description?: string
          due_date?: string | null
          id?: string
          metadata?: Json | null
          paid_date?: string | null
          partner_id?: string
          reservation_id?: string | null
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_transactions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "institutional_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_transactions_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "partner_reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      passport_configurations: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          map_config: Json | null
          require_sequential: boolean | null
          route_id: string
          stamp_fragments: number
          stamp_theme: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          map_config?: Json | null
          require_sequential?: boolean | null
          route_id: string
          stamp_fragments?: number
          stamp_theme: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          map_config?: Json | null
          require_sequential?: boolean | null
          route_id?: string
          stamp_fragments?: number
          stamp_theme?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "passport_configurations_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: true
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      passport_rewards: {
        Row: {
          avatar_id: string | null
          created_at: string | null
          discount_percentage: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_fallback: boolean | null
          max_avatars_per_route: number | null
          max_per_user: number | null
          max_vouchers: number | null
          partner_address: string | null
          partner_email: string | null
          partner_name: string
          partner_phone: string | null
          reward_code_prefix: string | null
          reward_description: string | null
          reward_type: string
          route_id: string
          updated_at: string | null
        }
        Insert: {
          avatar_id?: string | null
          created_at?: string | null
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_fallback?: boolean | null
          max_avatars_per_route?: number | null
          max_per_user?: number | null
          max_vouchers?: number | null
          partner_address?: string | null
          partner_email?: string | null
          partner_name: string
          partner_phone?: string | null
          reward_code_prefix?: string | null
          reward_description?: string | null
          reward_type: string
          route_id: string
          updated_at?: string | null
        }
        Update: {
          avatar_id?: string | null
          created_at?: string | null
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_fallback?: boolean | null
          max_avatars_per_route?: number | null
          max_per_user?: number | null
          max_vouchers?: number | null
          partner_address?: string | null
          partner_email?: string | null
          partner_name?: string
          partner_phone?: string | null
          reward_code_prefix?: string | null
          reward_description?: string | null
          reward_type?: string
          route_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "passport_rewards_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "pantanal_avatars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passport_rewards_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
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
      payment_reconciliation: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          notes: string | null
          payment_date: string | null
          reconciled: boolean | null
          reconciled_at: string | null
          reconciled_by: string | null
          status: string
          stripe_payment_id: string | null
          subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          reconciled?: boolean | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          status: string
          stripe_payment_id?: string | null
          subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          reconciled?: boolean | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          status?: string
          stripe_payment_id?: string | null
          subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_reconciliation_reconciled_by_fkey"
            columns: ["reconciled_by"]
            isOneToOne: false
            referencedRelation: "viajar_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_reconciliation_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "flowtrip_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_refunds: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          days_until_reservation: number | null
          id: string
          partner_id: string
          processed_at: string | null
          processed_by: string | null
          reason: string | null
          refund_amount: number
          refund_percent: number
          reservation_code: string | null
          reservation_id: string
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          days_until_reservation?: number | null
          id?: string
          partner_id: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          refund_amount: number
          refund_percent: number
          reservation_code?: string | null
          reservation_id: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          days_until_reservation?: number | null
          id?: string
          partner_id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          refund_amount?: number
          refund_percent?: number
          reservation_code?: string | null
          reservation_id?: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_refunds_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "institutional_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_refunds_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "partner_reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_diretor_acoes: {
        Row: {
          created_at: string | null
          dependencias: string[] | null
          descricao: string | null
          estrategia_id: string
          id: string
          investimento: number | null
          ordem: number | null
          prazo: string | null
          progresso: number | null
          responsavel_id: string | null
          responsavel_nome: string | null
          status: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dependencias?: string[] | null
          descricao?: string | null
          estrategia_id: string
          id?: string
          investimento?: number | null
          ordem?: number | null
          prazo?: string | null
          progresso?: number | null
          responsavel_id?: string | null
          responsavel_nome?: string | null
          status?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dependencias?: string[] | null
          descricao?: string | null
          estrategia_id?: string
          id?: string
          investimento?: number | null
          ordem?: number | null
          prazo?: string | null
          progresso?: number | null
          responsavel_id?: string | null
          responsavel_nome?: string | null
          status?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plano_diretor_acoes_estrategia_id_fkey"
            columns: ["estrategia_id"]
            isOneToOne: false
            referencedRelation: "plano_diretor_estrategias"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_diretor_colaboradores: {
        Row: {
          ativo: boolean | null
          convidado_por: string
          created_at: string | null
          data_aceite: string | null
          data_convite: string | null
          email: string
          id: string
          nivel_acesso: string | null
          nome: string | null
          permissoes: Json | null
          plano_diretor_id: string
          tipo_ator: string | null
          token_convite: string | null
          updated_at: string | null
          usuario_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          convidado_por: string
          created_at?: string | null
          data_aceite?: string | null
          data_convite?: string | null
          email: string
          id?: string
          nivel_acesso?: string | null
          nome?: string | null
          permissoes?: Json | null
          plano_diretor_id: string
          tipo_ator?: string | null
          token_convite?: string | null
          updated_at?: string | null
          usuario_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          convidado_por?: string
          created_at?: string | null
          data_aceite?: string | null
          data_convite?: string | null
          email?: string
          id?: string
          nivel_acesso?: string | null
          nome?: string | null
          permissoes?: Json | null
          plano_diretor_id?: string
          tipo_ator?: string | null
          token_convite?: string | null
          updated_at?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plano_diretor_colaboradores_plano_diretor_id_fkey"
            columns: ["plano_diretor_id"]
            isOneToOne: false
            referencedRelation: "plano_diretor_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_diretor_comentarios: {
        Row: {
          autor_id: string
          comentario: string
          created_at: string | null
          data_resolucao: string | null
          id: string
          plano_diretor_id: string
          resolvido: boolean | null
          resolvido_por: string | null
          secao: string
          secao_id: string | null
          updated_at: string | null
        }
        Insert: {
          autor_id: string
          comentario: string
          created_at?: string | null
          data_resolucao?: string | null
          id?: string
          plano_diretor_id: string
          resolvido?: boolean | null
          resolvido_por?: string | null
          secao: string
          secao_id?: string | null
          updated_at?: string | null
        }
        Update: {
          autor_id?: string
          comentario?: string
          created_at?: string | null
          data_resolucao?: string | null
          id?: string
          plano_diretor_id?: string
          resolvido?: boolean | null
          resolvido_por?: string | null
          secao?: string
          secao_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plano_diretor_comentarios_plano_diretor_id_fkey"
            columns: ["plano_diretor_id"]
            isOneToOne: false
            referencedRelation: "plano_diretor_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_diretor_documentos_anexos: {
        Row: {
          arquivo_url: string
          created_at: string | null
          id: string
          plano_diretor_id: string
          status: string | null
          tamanho_bytes: number | null
          tipo: string | null
          titulo: string
          uploader_id: string
          versao: string | null
        }
        Insert: {
          arquivo_url: string
          created_at?: string | null
          id?: string
          plano_diretor_id: string
          status?: string | null
          tamanho_bytes?: number | null
          tipo?: string | null
          titulo: string
          uploader_id: string
          versao?: string | null
        }
        Update: {
          arquivo_url?: string
          created_at?: string | null
          id?: string
          plano_diretor_id?: string
          status?: string | null
          tamanho_bytes?: number | null
          tipo?: string | null
          titulo?: string
          uploader_id?: string
          versao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plano_diretor_documentos_anexos_plano_diretor_id_fkey"
            columns: ["plano_diretor_id"]
            isOneToOne: false
            referencedRelation: "plano_diretor_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_diretor_documents: {
        Row: {
          aprovado_por: string | null
          created_at: string | null
          criador_id: string
          data_aprovacao: string | null
          id: string
          metadata: Json | null
          municipio_nome: string
          municipio_uf: string
          periodo_fim: string
          periodo_inicio: string
          status: string | null
          titulo: string
          updated_at: string | null
          versao: string
        }
        Insert: {
          aprovado_por?: string | null
          created_at?: string | null
          criador_id: string
          data_aprovacao?: string | null
          id?: string
          metadata?: Json | null
          municipio_nome: string
          municipio_uf: string
          periodo_fim: string
          periodo_inicio: string
          status?: string | null
          titulo: string
          updated_at?: string | null
          versao?: string
        }
        Update: {
          aprovado_por?: string | null
          created_at?: string | null
          criador_id?: string
          data_aprovacao?: string | null
          id?: string
          metadata?: Json | null
          municipio_nome?: string
          municipio_uf?: string
          periodo_fim?: string
          periodo_inicio?: string
          status?: string | null
          titulo?: string
          updated_at?: string | null
          versao?: string
        }
        Relationships: []
      }
      plano_diretor_estrategias: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          investimento: number | null
          objetivo_id: string
          ordem: number | null
          plano_diretor_id: string
          prazo: string | null
          responsavel_id: string | null
          responsavel_nome: string | null
          roi_esperado: number | null
          status: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          investimento?: number | null
          objetivo_id: string
          ordem?: number | null
          plano_diretor_id: string
          prazo?: string | null
          responsavel_id?: string | null
          responsavel_nome?: string | null
          roi_esperado?: number | null
          status?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          investimento?: number | null
          objetivo_id?: string
          ordem?: number | null
          plano_diretor_id?: string
          prazo?: string | null
          responsavel_id?: string | null
          responsavel_nome?: string | null
          roi_esperado?: number | null
          status?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plano_diretor_estrategias_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "plano_diretor_objetivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plano_diretor_estrategias_plano_diretor_id_fkey"
            columns: ["plano_diretor_id"]
            isOneToOne: false
            referencedRelation: "plano_diretor_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_diretor_historico: {
        Row: {
          alteracoes: Json | null
          autor_id: string
          comentarios: string | null
          created_at: string | null
          id: string
          plano_diretor_id: string
          secao: string | null
          secao_id: string | null
          tipo_alteracao: string
          versao: string
        }
        Insert: {
          alteracoes?: Json | null
          autor_id: string
          comentarios?: string | null
          created_at?: string | null
          id?: string
          plano_diretor_id: string
          secao?: string | null
          secao_id?: string | null
          tipo_alteracao: string
          versao: string
        }
        Update: {
          alteracoes?: Json | null
          autor_id?: string
          comentarios?: string | null
          created_at?: string | null
          id?: string
          plano_diretor_id?: string
          secao?: string | null
          secao_id?: string | null
          tipo_alteracao?: string
          versao?: string
        }
        Relationships: [
          {
            foreignKeyName: "plano_diretor_historico_plano_diretor_id_fkey"
            columns: ["plano_diretor_id"]
            isOneToOne: false
            referencedRelation: "plano_diretor_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_diretor_indicadores: {
        Row: {
          atualizacao_automatica: boolean | null
          created_at: string | null
          descricao: string | null
          fonte: string | null
          fonte_dados: string | null
          frequencia: string | null
          id: string
          meta: number | null
          nome: string
          objetivo_id: string | null
          plano_diretor_id: string
          ultima_atualizacao: string | null
          unidade: string | null
          updated_at: string | null
          valor_atual: number | null
        }
        Insert: {
          atualizacao_automatica?: boolean | null
          created_at?: string | null
          descricao?: string | null
          fonte?: string | null
          fonte_dados?: string | null
          frequencia?: string | null
          id?: string
          meta?: number | null
          nome: string
          objetivo_id?: string | null
          plano_diretor_id: string
          ultima_atualizacao?: string | null
          unidade?: string | null
          updated_at?: string | null
          valor_atual?: number | null
        }
        Update: {
          atualizacao_automatica?: boolean | null
          created_at?: string | null
          descricao?: string | null
          fonte?: string | null
          fonte_dados?: string | null
          frequencia?: string | null
          id?: string
          meta?: number | null
          nome?: string
          objetivo_id?: string | null
          plano_diretor_id?: string
          ultima_atualizacao?: string | null
          unidade?: string | null
          updated_at?: string | null
          valor_atual?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plano_diretor_indicadores_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "plano_diretor_objetivos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plano_diretor_indicadores_plano_diretor_id_fkey"
            columns: ["plano_diretor_id"]
            isOneToOne: false
            referencedRelation: "plano_diretor_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_diretor_objetivos: {
        Row: {
          categoria: string | null
          created_at: string | null
          descricao: string | null
          id: string
          meta: number | null
          ordem: number | null
          plano_diretor_id: string
          prazo: string | null
          progresso: number | null
          responsavel_id: string | null
          responsavel_nome: string | null
          status: string | null
          titulo: string
          unidade: string | null
          updated_at: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          meta?: number | null
          ordem?: number | null
          plano_diretor_id: string
          prazo?: string | null
          progresso?: number | null
          responsavel_id?: string | null
          responsavel_nome?: string | null
          status?: string | null
          titulo: string
          unidade?: string | null
          updated_at?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          meta?: number | null
          ordem?: number | null
          plano_diretor_id?: string
          prazo?: string | null
          progresso?: number | null
          responsavel_id?: string | null
          responsavel_nome?: string | null
          status?: string | null
          titulo?: string
          unidade?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plano_diretor_objetivos_plano_diretor_id_fkey"
            columns: ["plano_diretor_id"]
            isOneToOne: false
            referencedRelation: "plano_diretor_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_performance_metrics: {
        Row: {
          context_info: Json | null
          created_at: string | null
          id: string
          metric_name: string
          metric_value: number
          source: string | null
          timestamp: string
          unit: string | null
        }
        Insert: {
          context_info?: Json | null
          created_at?: string | null
          id?: string
          metric_name: string
          metric_value: number
          source?: string | null
          timestamp?: string
          unit?: string | null
        }
        Update: {
          context_info?: Json | null
          created_at?: string | null
          id?: string
          metric_name?: string
          metric_value?: number
          source?: string | null
          timestamp?: string
          unit?: string | null
        }
        Relationships: []
      }
      rag_query_logs: {
        Row: {
          confidence: number | null
          created_at: string | null
          id: string
          processing_time_ms: number | null
          question: string
          session_id: string | null
          state_code: string | null
          strategy: string | null
          top_k: number | null
          user_id: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          processing_time_ms?: number | null
          question: string
          session_id?: string | null
          state_code?: string | null
          strategy?: string | null
          top_k?: number | null
          user_id?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          processing_time_ms?: number | null
          question?: string
          session_id?: string | null
          state_code?: string | null
          strategy?: string | null
          top_k?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      rag_source_logs: {
        Row: {
          chunk_id: string
          domain: string | null
          freshness_ts: string | null
          log_id: string
          relevance: number | null
          title: string | null
          url: string | null
        }
        Insert: {
          chunk_id: string
          domain?: string | null
          freshness_ts?: string | null
          log_id: string
          relevance?: number | null
          title?: string | null
          url?: string | null
        }
        Update: {
          chunk_id?: string
          domain?: string | null
          freshness_ts?: string | null
          log_id?: string
          relevance?: number | null
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rag_source_logs_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "rag_query_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      region_cities: {
        Row: {
          best_time_to_visit: string | null
          city_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          highlights: string[] | null
          how_to_get_there: string | null
          id: string
          image_gallery: string[] | null
          is_active: boolean | null
          map_image_url: string | null
          official_website: string | null
          order_index: number | null
          social_links: Json | null
          tourist_region_id: string
          updated_at: string | null
          updated_by: string | null
          video_type: string | null
          video_url: string | null
        }
        Insert: {
          best_time_to_visit?: string | null
          city_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          highlights?: string[] | null
          how_to_get_there?: string | null
          id?: string
          image_gallery?: string[] | null
          is_active?: boolean | null
          map_image_url?: string | null
          official_website?: string | null
          order_index?: number | null
          social_links?: Json | null
          tourist_region_id: string
          updated_at?: string | null
          updated_by?: string | null
          video_type?: string | null
          video_url?: string | null
        }
        Update: {
          best_time_to_visit?: string | null
          city_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          highlights?: string[] | null
          how_to_get_there?: string | null
          id?: string
          image_gallery?: string[] | null
          is_active?: boolean | null
          map_image_url?: string | null
          official_website?: string | null
          order_index?: number | null
          social_links?: Json | null
          tourist_region_id?: string
          updated_at?: string | null
          updated_by?: string | null
          video_type?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "region_cities_tourist_region_id_fkey"
            columns: ["tourist_region_id"]
            isOneToOne: false
            referencedRelation: "tourist_regions"
            referencedColumns: ["id"]
          },
        ]
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
      reservation_messages: {
        Row: {
          attachments: Json | null
          created_at: string
          id: string
          message: string
          read: boolean | null
          read_at: string | null
          reservation_id: string
          sender_email: string | null
          sender_id: string | null
          sender_name: string
          sender_type: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          read_at?: string | null
          reservation_id: string
          sender_email?: string | null
          sender_id?: string | null
          sender_name: string
          sender_type: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          read_at?: string | null
          reservation_id?: string
          sender_email?: string | null
          sender_id?: string | null
          sender_name?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_messages_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "partner_reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      route_checkpoints: {
        Row: {
          created_at: string | null
          description: string | null
          destination_id: string | null
          geofence_radius: number | null
          id: string
          is_mandatory: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          order_sequence: number
          partner_code: string | null
          partner_id: string | null
          requires_photo: boolean | null
          route_id: string
          stamp_fragment_number: number | null
          validation_mode: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          destination_id?: string | null
          geofence_radius?: number | null
          id?: string
          is_mandatory?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          order_sequence: number
          partner_code?: string | null
          partner_id?: string | null
          requires_photo?: boolean | null
          route_id: string
          stamp_fragment_number?: number | null
          validation_mode?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          destination_id?: string | null
          geofence_radius?: number | null
          id?: string
          is_mandatory?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          order_sequence?: number
          partner_code?: string | null
          partner_id?: string | null
          requires_photo?: boolean | null
          route_id?: string
          stamp_fragment_number?: number | null
          validation_mode?: string | null
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
            foreignKeyName: "route_checkpoints_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "institutional_partners"
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
          estimated_duration: unknown
          id: string
          image_url: string | null
          is_active: boolean | null
          map_image_url: string | null
          name: string
          passport_number_prefix: string | null
          region: string | null
          state_id: string | null
          updated_at: string | null
          updated_by: string | null
          video_url: string | null
        }
        Insert: {
          city_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          distance_km?: number | null
          estimated_duration?: unknown
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          map_image_url?: string | null
          name: string
          passport_number_prefix?: string | null
          region?: string | null
          state_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          video_url?: string | null
        }
        Update: {
          city_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          distance_km?: number | null
          estimated_duration?: unknown
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          map_image_url?: string | null
          name?: string
          passport_number_prefix?: string | null
          region?: string | null
          state_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          video_url?: string | null
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
          ip_address: unknown
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          success: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          platform: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          platform: string
          setting_key: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          platform?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      stamp_themes: {
        Row: {
          color_primary: string | null
          color_secondary: string | null
          created_at: string | null
          description: string | null
          emoji: string | null
          id: string
          is_active: boolean | null
          theme_key: string
          theme_name: string
          updated_at: string | null
        }
        Insert: {
          color_primary?: string | null
          color_secondary?: string | null
          created_at?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          theme_key: string
          theme_name: string
          updated_at?: string | null
        }
        Update: {
          color_primary?: string | null
          color_secondary?: string | null
          created_at?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          is_active?: boolean | null
          theme_key?: string
          theme_name?: string
          updated_at?: string | null
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
      system_alert_config: {
        Row: {
          created_at: string | null
          downtime_alerts: boolean | null
          email_address: string | null
          email_enabled: boolean | null
          error_alerts: boolean | null
          id: string
          slow_response_alerts: boolean | null
          updated_at: string | null
          user_id: string | null
          whatsapp_enabled: boolean | null
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string | null
          downtime_alerts?: boolean | null
          email_address?: string | null
          email_enabled?: boolean | null
          error_alerts?: boolean | null
          id?: string
          slow_response_alerts?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string | null
          downtime_alerts?: boolean | null
          email_address?: string | null
          email_enabled?: boolean | null
          error_alerts?: boolean | null
          id?: string
          slow_response_alerts?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      system_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          service_name: string
          severity: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          service_name: string
          severity: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          service_name?: string
          severity?: string
        }
        Relationships: []
      }
      system_fallback_config: {
        Row: {
          created_at: string | null
          fallback_enabled: boolean | null
          fallback_mode: string | null
          id: string
          last_check: string | null
          maintenance_message: string | null
          platform: string
          redirect_url: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fallback_enabled?: boolean | null
          fallback_mode?: string | null
          id?: string
          last_check?: string | null
          maintenance_message?: string | null
          platform: string
          redirect_url?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fallback_enabled?: boolean | null
          fallback_mode?: string | null
          id?: string
          last_check?: string | null
          maintenance_message?: string | null
          platform?: string
          redirect_url?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_health_checks: {
        Row: {
          checked_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          latency_ms: number | null
          response_data: Json | null
          service_name: string
          service_type: string
          status: string
        }
        Insert: {
          checked_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          response_data?: Json | null
          service_name: string
          service_type: string
          status: string
        }
        Update: {
          checked_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          response_data?: Json | null
          service_name?: string
          service_type?: string
          status?: string
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
      tourism_inventory: {
        Row: {
          accessibility_features: Json | null
          address: string | null
          amenities: Json | null
          capacity: number | null
          capacity_details: Json | null
          category_id: string | null
          certifications: Json | null
          city: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          data_completeness_score: number | null
          description: string | null
          email: string | null
          id: string
          images: Json | null
          is_active: boolean | null
          is_featured: boolean | null
          languages_spoken: string[] | null
          last_verified_date: string | null
          latitude: number | null
          legal_name: string | null
          license_expiry_date: string | null
          license_number: string | null
          longitude: number | null
          meta_description: string | null
          meta_title: string | null
          name: string
          opening_hours: Json | null
          payment_methods: Json | null
          phone: string | null
          postal_code: string | null
          price_range: string | null
          registration_number: string | null
          responsible_cpf: string | null
          responsible_email: string | null
          responsible_name: string | null
          responsible_phone: string | null
          setur_category_code: string | null
          setur_code: string | null
          setur_compliance_score: number | null
          short_description: string | null
          state: string | null
          status: string | null
          subcategory_id: string | null
          tags: string[] | null
          updated_at: string | null
          updated_by: string | null
          validation_notes: string | null
          verification_status: string | null
          videos: Json | null
          website: string | null
        }
        Insert: {
          accessibility_features?: Json | null
          address?: string | null
          amenities?: Json | null
          capacity?: number | null
          capacity_details?: Json | null
          category_id?: string | null
          certifications?: Json | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          data_completeness_score?: number | null
          description?: string | null
          email?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          languages_spoken?: string[] | null
          last_verified_date?: string | null
          latitude?: number | null
          legal_name?: string | null
          license_expiry_date?: string | null
          license_number?: string | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          opening_hours?: Json | null
          payment_methods?: Json | null
          phone?: string | null
          postal_code?: string | null
          price_range?: string | null
          registration_number?: string | null
          responsible_cpf?: string | null
          responsible_email?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          setur_category_code?: string | null
          setur_code?: string | null
          setur_compliance_score?: number | null
          short_description?: string | null
          state?: string | null
          status?: string | null
          subcategory_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          validation_notes?: string | null
          verification_status?: string | null
          videos?: Json | null
          website?: string | null
        }
        Update: {
          accessibility_features?: Json | null
          address?: string | null
          amenities?: Json | null
          capacity?: number | null
          capacity_details?: Json | null
          category_id?: string | null
          certifications?: Json | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          data_completeness_score?: number | null
          description?: string | null
          email?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          languages_spoken?: string[] | null
          last_verified_date?: string | null
          latitude?: number | null
          legal_name?: string | null
          license_expiry_date?: string | null
          license_number?: string | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          opening_hours?: Json | null
          payment_methods?: Json | null
          phone?: string | null
          postal_code?: string | null
          price_range?: string | null
          registration_number?: string | null
          responsible_cpf?: string | null
          responsible_email?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          setur_category_code?: string | null
          setur_code?: string | null
          setur_compliance_score?: number | null
          short_description?: string | null
          state?: string | null
          status?: string | null
          subcategory_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          validation_notes?: string | null
          verification_status?: string | null
          videos?: Json | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tourism_inventory_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tourism_inventory_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tourist_regions: {
        Row: {
          cities: Json
          color: string | null
          color_hover: string | null
          created_at: string
          created_by: string | null
          description: string | null
          highlights: Json
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          order_index: number | null
          slug: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          cities?: Json
          color?: string | null
          color_hover?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          highlights?: Json
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          order_index?: number | null
          slug: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          cities?: Json
          color?: string | null
          color_hover?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          highlights?: Json
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          slug?: string
          updated_at?: string
          updated_by?: string | null
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
      user_passports: {
        Row: {
          created_at: string | null
          id: string
          passport_number: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          passport_number: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          passport_number?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          accessibility_preference: string | null
          avatar_custom_name: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          city: string | null
          city_id: string | null
          client_slug: string | null
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
          region_id: string | null
          residence_city: string | null
          selected_avatar: string | null
          sexuality_identity: string | null
          state: string | null
          stay_duration: string | null
          time_in_city: string | null
          travel_motives: string[] | null
          travel_organization: string | null
          updated_at: string | null
          user_id: string
          user_role: string | null
          user_type: string | null
          wants_to_collaborate: boolean | null
        }
        Insert: {
          accessibility_preference?: string | null
          avatar_custom_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          city_id?: string | null
          client_slug?: string | null
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
          region_id?: string | null
          residence_city?: string | null
          selected_avatar?: string | null
          sexuality_identity?: string | null
          state?: string | null
          stay_duration?: string | null
          time_in_city?: string | null
          travel_motives?: string[] | null
          travel_organization?: string | null
          updated_at?: string | null
          user_id: string
          user_role?: string | null
          user_type?: string | null
          wants_to_collaborate?: boolean | null
        }
        Update: {
          accessibility_preference?: string | null
          avatar_custom_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          city_id?: string | null
          client_slug?: string | null
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
          region_id?: string | null
          residence_city?: string | null
          selected_avatar?: string | null
          sexuality_identity?: string | null
          state?: string | null
          stay_duration?: string | null
          time_in_city?: string | null
          travel_motives?: string[] | null
          travel_organization?: string | null
          updated_at?: string | null
          user_id?: string
          user_role?: string | null
          user_type?: string | null
          wants_to_collaborate?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          created_at: string | null
          id: string
          is_used: boolean | null
          reward_id: string
          route_id: string
          used_at: string | null
          user_id: string
          voucher_code: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_used?: boolean | null
          reward_id: string
          route_id: string
          used_at?: string | null
          user_id: string
          voucher_code: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_used?: boolean | null
          reward_id?: string
          route_id?: string
          used_at?: string | null
          user_id?: string
          voucher_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "passport_rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rewards_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
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
      viajar_employees: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          hire_date: string | null
          id: string
          is_active: boolean | null
          name: string
          permissions: Json | null
          position: string | null
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          permissions?: Json | null
          position?: string | null
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          permissions?: Json | null
          position?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      viajar_products: {
        Row: {
          created_at: string | null
          cta_link: string | null
          cta_text: string | null
          display_order: number | null
          full_description: string | null
          gradient_colors: string | null
          icon_name: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          short_description: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          display_order?: number | null
          full_description?: string | null
          gradient_colors?: string | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          short_description?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          display_order?: number | null
          full_description?: string | null
          gradient_colors?: string | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          short_description?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      viajar_team_members: {
        Row: {
          bio: string | null
          created_at: string | null
          display_order: number | null
          id: string
          instagram_url: string | null
          is_active: boolean | null
          linkedin_url: string | null
          name: string
          photo_url: string | null
          position: string
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          name: string
          photo_url?: string | null
          position: string
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          name?: string
          photo_url?: string | null
          position?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_prompt_configs: {
        Row: {
          id: string
          chatbot_name: string
          prompt_type: string
          content: string
          variables: Json
          is_active: boolean
          version: number
          description: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          chatbot_name: string
          prompt_type: string
          content: string
          variables?: Json
          is_active?: boolean
          version?: number
          description?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          chatbot_name?: string
          prompt_type?: string
          content?: string
          variables?: Json
          is_active?: boolean
          version?: number
          description?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      knowledge_base_uploads: {
        Row: {
          id: string
          filename: string
          file_type: string
          file_size: number
          status: string
          items_created: number | null
          items_failed: number | null
          error_message: string | null
          chatbot_target: string | null
          uploaded_by: string | null
          uploaded_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          filename: string
          file_type: string
          file_size: number
          status?: string
          items_created?: number | null
          items_failed?: number | null
          error_message?: string | null
          chatbot_target?: string | null
          uploaded_by?: string | null
          uploaded_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          filename?: string
          file_type?: string
          file_size?: number
          status?: string
          items_created?: number | null
          items_failed?: number | null
          error_message?: string | null
          chatbot_target?: string | null
          uploaded_by?: string | null
          uploaded_at?: string
          processed_at?: string | null
        }
        Relationships: []
      }
      workflow_definitions: {
        Row: {
          created_at: string | null
          created_by: string | null
          definition: Json
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          workflow_name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          definition: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          workflow_name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          definition?: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          workflow_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_user_role: {
        Args: {
          p_city_id?: string
          p_region_id?: string
          p_role: string
          p_user_id: string
        }
        Returns: boolean
      }
      auto_expire_events: { Args: never; Returns: undefined }
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      calculate_objetivo_progress: {
        Args: { objetivo_uuid: string }
        Returns: number
      }
      calculate_system_uptime_24h: {
        Args: { service_name_param?: string }
        Returns: number
      }
      calculate_user_level: { Args: { points: number }; Returns: Json }
      can_access_document: {
        Args: { p_document_id: string; p_user_id?: string }
        Returns: boolean
      }
      check_availability: {
        Args: {
          p_date: string
          p_guests: number
          p_partner_id: string
          p_service_id: string
        }
        Returns: boolean
      }
      check_checkin_rate_limit: {
        Args: {
          p_max_checkins?: number
          p_user_id: string
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_colaborador_permission: {
        Args: { colaborador_uuid: string; required_permission: string }
        Returns: boolean
      }
      check_events_to_cleanup: { Args: never; Returns: Json }
      check_geofence: {
        Args: {
          checkpoint_lat: number
          checkpoint_lon: number
          radius_meters?: number
          user_lat: number
          user_lon: number
        }
        Returns: boolean
      }
      check_partner_registration_rate_limit: {
        Args: { user_id_input: string }
        Returns: boolean
      }
      clean_expired_guata_cache: { Args: never; Returns: number }
      clean_expired_koda_cache: { Args: never; Returns: number }
      cleanup_all_events_with_logging: { Args: never; Returns: Json }
      cleanup_expired_events: {
        Args: never
        Returns: {
          deleted_count: number
          deleted_ids: string[]
        }[]
      }
      cleanup_old_ai_logs: { Args: never; Returns: undefined }
      cleanup_rejected_events: {
        Args: never
        Returns: {
          deleted_count: number
          deleted_ids: string[]
        }[]
      }
      create_attendant_user: {
        Args: {
          send_invite?: boolean
          user_city_id: string
          user_email: string
          user_name: string
          user_phone?: string
        }
        Returns: Json
      }
      create_initial_admin_if_needed: {
        Args: { admin_email: string; admin_user_id: string }
        Returns: boolean
      }
      create_initial_admin_user: {
        Args: {
          admin_email: string
          admin_name?: string
          admin_password: string
        }
        Returns: boolean
      }
      create_password_reset_token: {
        Args: { user_email: string }
        Returns: string
      }
      create_test_user_profiles: {
        Args: never
        Returns: {
          email_ref: string
          role_assigned: string
          user_id_created: string
        }[]
      }
      decrease_booked_guests: {
        Args: {
          p_date: string
          p_guests: number
          p_partner_id: string
          p_service_id: string
        }
        Returns: boolean
      }
      detect_suspicious_activity: {
        Args: { check_user_id: string }
        Returns: Json
      }
      elevate_to_admin: { Args: { user_email: string }; Returns: undefined }
      ensure_admin_exists: { Args: never; Returns: boolean }
      fix_incomplete_profiles: { Args: never; Returns: undefined }
      generate_partner_code: { Args: never; Returns: string }
      generate_passport_number: { Args: { prefix?: string }; Returns: string }
      get_ai_consultant_stats: {
        Args: {
          p_city_id?: string
          p_days?: number
          p_region_id?: string
          p_tenant_id?: string
        }
        Returns: {
          avg_confidence: number
          daily_usage: Json
          most_common_topics: string[]
          total_queries: number
          total_users: number
        }[]
      }
      get_available_slots: {
        Args: { p_date: string; p_partner_id: string; p_service_id: string }
        Returns: number
      }
      get_checkpoint_code_stats: {
        Args: { p_checkpoint_id: string; p_hours?: number }
        Returns: Json
      }
      get_current_user_role: { Args: never; Returns: string }
      get_user_role: { Args: { check_user_id: string }; Returns: string }
      get_user_states: {
        Args: { check_user_id: string }
        Returns: {
          state_code: string
          state_id: string
          state_name: string
          user_role: string
        }[]
      }
      get_user_statistics: {
        Args: never
        Returns: {
          active_count: number
          role_name: string
          user_count: number
        }[]
      }
      get_users_by_role: {
        Args: { target_role: string }
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          region: string
        }[]
      }
      get_users_with_details: {
        Args: never
        Returns: {
          city_id: string
          city_name: string
          created_at: string
          email: string
          full_name: string
          id: string
          last_sign_in_at: string
          phone: string
          region_id: string
          region_name: string
          role: string
          status: string
          user_type: string
        }[]
      }
      has_plano_diretor_access: {
        Args: { plano_id: string; required_permission: string; user_id: string }
        Returns: boolean
      }
      has_state_role: {
        Args: {
          check_state_id: string
          check_user_id: string
          required_role: string
        }
        Returns: boolean
      }
      increment_guata_cache_usage: {
        Args: { cache_id: string }
        Returns: undefined
      }
      increment_guata_kb_usage: { Args: { kb_id: string }; Returns: undefined }
      increment_koda_cache_usage: {
        Args: { cache_id: string }
        Returns: undefined
      }
      is_admin_user: { Args: { check_user_id: string }; Returns: boolean }
      is_manager: { Args: { check_user_id: string }; Returns: boolean }
      is_partner_of_notification: {
        Args: { notification_partner_id: string }
        Returns: boolean
      }
      is_partner_of_pricing: {
        Args: { pricing_partner_id: string }
        Returns: boolean
      }
      is_partner_of_reservation: {
        Args: { reservation_partner_id: string }
        Returns: boolean
      }
      is_plano_diretor_colaborador: {
        Args: { plano_id: string; required_permission: string; user_id: string }
        Returns: boolean
      }
      is_plano_diretor_creator: {
        Args: { plano_id: string; user_id: string }
        Returns: boolean
      }
      is_valid_uuid: { Args: { uuid_text: string }; Returns: boolean }
      log_document_access: {
        Args: {
          p_access_type: string
          p_document_id: string
          p_user_id?: string
        }
        Returns: undefined
      }
      log_enhanced_admin_operation: {
        Args: {
          operation_details?: Json
          operation_type: string
          target_record_id?: string
          target_table?: string
        }
        Returns: undefined
      }
      log_enhanced_security_event: {
        Args: {
          event_action: string
          event_error_message?: string
          event_metadata?: Json
          event_success?: boolean
          event_user_id?: string
        }
        Returns: boolean
      }
      log_event_cleanup: {
        Args: {
          p_deleted_ids: string[]
          p_expired_count: number
          p_rejected_count: number
          p_result: Json
          p_total_count: number
        }
        Returns: string
      }
      log_security_event: {
        Args: {
          event_action: string
          event_error_message?: string
          event_ip_address?: string
          event_success?: boolean
          event_user_agent?: string
          event_user_id?: string
        }
        Returns: boolean
      }
      promote_user_to_role: {
        Args: { p_email: string; p_role: string }
        Returns: boolean
      }
      secure_ai_consultant_operation: {
        Args: {
          p_config_id?: string
          p_operation_type: string
          p_user_id?: string
        }
        Returns: boolean
      }
      secure_update_user_role: {
        Args: {
          new_role: string
          requesting_user_id?: string
          target_user_id: string
        }
        Returns: boolean
      }
      unlock_rewards: {
        Args: { p_route_id: string; p_user_id: string }
        Returns: {
          reward_id: string
          voucher_code: string
        }[]
      }
      update_user_points: {
        Args: { p_points: number; p_state_id: string; p_user_id: string }
        Returns: undefined
      }
      validate_cnpj: { Args: { cnpj_input: string }; Returns: boolean }
      validate_partner_code: {
        Args: {
          p_checkpoint_id: string
          p_code_input: string
          p_ip_address?: unknown
          p_user_agent?: string
          p_user_id: string
        }
        Returns: Json
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
