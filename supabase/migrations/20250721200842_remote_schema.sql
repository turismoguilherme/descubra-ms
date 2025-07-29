create table "public"."ai_insights" (
    "id" uuid not null default gen_random_uuid(),
    "region" text not null,
    "insight_type" text not null,
    "title" text not null,
    "description" text not null,
    "confidence_score" numeric,
    "data_sources" text[],
    "recommendations" jsonb,
    "priority" text default 'medium'::text,
    "status" text default 'active'::text,
    "generated_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."ai_insights" enable row level security;

create table "public"."ai_master_insights" (
    "id" uuid not null default gen_random_uuid(),
    "insight_type" character varying(50) not null,
    "priority" character varying(20) default 'medium'::character varying,
    "title" text not null,
    "description" text not null,
    "state_code" character varying(10),
    "actions" jsonb default '[]'::jsonb,
    "confidence_score" numeric(3,2),
    "region" text,
    "data_sources" text[],
    "recommendations" jsonb default '{}'::jsonb,
    "generated_by" uuid,
    "status" character varying(20) default 'active'::character varying,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."ai_master_insights" enable row level security;

create table "public"."attendant_timesheet" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "cat_location" text not null,
    "clock_in_time" timestamp with time zone not null default now(),
    "clock_out_time" timestamp with time zone,
    "total_hours" numeric,
    "notes" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."attendant_timesheet" enable row level security;

create table "public"."cat_checkins" (
    "id" uuid not null default gen_random_uuid(),
    "cat_name" text not null,
    "timestamp" timestamp with time zone not null default now(),
    "status" text not null default 'active'::text,
    "latitude" numeric,
    "longitude" numeric,
    "distance_from_cat" numeric,
    "user_id" uuid,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."cat_checkins" enable row level security;

create table "public"."cat_locations" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "address" text,
    "city" text not null,
    "region" text,
    "latitude" numeric,
    "longitude" numeric,
    "contact_phone" text,
    "contact_email" text,
    "working_hours" text,
    "is_active" boolean default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."cat_locations" enable row level security;

create table "public"."cities" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "region_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."cities" enable row level security;

create table "public"."city_tour_bookings" (
    "id" uuid not null default gen_random_uuid(),
    "city" text not null,
    "tour_date" date not null,
    "tour_time" time without time zone not null,
    "max_capacity" integer not null default 10,
    "current_bookings" integer not null default 0,
    "description" text,
    "meeting_point" text,
    "is_active" boolean default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."city_tour_bookings" enable row level security;

create table "public"."city_tour_settings" (
    "id" uuid not null default gen_random_uuid(),
    "city" text not null,
    "is_public" boolean default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."city_tour_settings" enable row level security;

create table "public"."content_audit_log" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "user_name" text,
    "table_name" text not null,
    "action" text not null,
    "record_id" uuid,
    "old_values" jsonb,
    "new_values" jsonb,
    "timestamp" timestamp with time zone default now()
);


alter table "public"."content_audit_log" enable row level security;

create table "public"."destination_details" (
    "id" uuid not null default gen_random_uuid(),
    "destination_id" uuid not null,
    "promotional_text" text,
    "video_url" text,
    "video_type" text,
    "map_latitude" numeric,
    "map_longitude" numeric,
    "tourism_tags" text[],
    "image_gallery" text[],
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "updated_by" uuid
);


alter table "public"."destination_details" enable row level security;

create table "public"."destinations" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "location" text,
    "region" text,
    "image_url" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid,
    "city_id" uuid,
    "state_id" uuid
);


alter table "public"."destinations" enable row level security;

create table "public"."event_details" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" uuid not null,
    "official_name" text,
    "exact_location" text,
    "cover_image_url" text,
    "video_url" text,
    "detailed_description" text,
    "schedule_info" text,
    "event_type" text,
    "registration_link" text,
    "extra_info" text,
    "map_latitude" numeric,
    "map_longitude" numeric,
    "is_free" boolean default false,
    "visibility_end_date" timestamp with time zone,
    "auto_hide" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "updated_by" uuid
);


alter table "public"."event_details" enable row level security;

create table "public"."events" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "location" text,
    "start_date" timestamp with time zone not null,
    "end_date" timestamp with time zone,
    "image_url" text,
    "visibility_end_date" timestamp with time zone,
    "is_visible" boolean default true,
    "auto_hide" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid,
    "city_id" uuid,
    "state_id" uuid
);


alter table "public"."events" enable row level security;

create table "public"."flowtrip_clients" (
    "id" uuid not null default gen_random_uuid(),
    "state_id" uuid,
    "client_name" character varying(100) not null,
    "contact_name" character varying(100),
    "contact_email" text,
    "contact_phone" text,
    "contract_start_date" date,
    "contract_end_date" date,
    "status" character varying(20) default 'active'::character varying,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."flowtrip_clients" enable row level security;

create table "public"."flowtrip_invoices" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid,
    "subscription_id" uuid,
    "invoice_number" character varying(50) not null,
    "amount" numeric not null,
    "due_date" date not null,
    "paid_at" timestamp with time zone,
    "status" character varying(20) default 'pending'::character varying,
    "created_at" timestamp with time zone default now()
);


alter table "public"."flowtrip_invoices" enable row level security;

create table "public"."flowtrip_master_config" (
    "id" uuid not null default gen_random_uuid(),
    "config_key" character varying(100) not null,
    "config_value" jsonb not null,
    "description" text,
    "updated_by" uuid,
    "updated_at" timestamp with time zone default now()
);


alter table "public"."flowtrip_master_config" enable row level security;

create table "public"."flowtrip_onboarding_steps" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid,
    "step_name" character varying(100) not null,
    "step_description" text,
    "is_completed" boolean default false,
    "completed_at" timestamp with time zone,
    "order_sequence" integer not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."flowtrip_onboarding_steps" enable row level security;

create table "public"."flowtrip_state_features" (
    "id" uuid not null default gen_random_uuid(),
    "state_id" uuid,
    "feature_name" character varying(50) not null,
    "is_enabled" boolean default true,
    "config" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now()
);


alter table "public"."flowtrip_state_features" enable row level security;

create table "public"."flowtrip_states" (
    "id" uuid not null default gen_random_uuid(),
    "code" character varying(10) not null,
    "name" character varying(100) not null,
    "logo_url" text,
    "primary_color" character varying(7) default '#1a365d'::character varying,
    "secondary_color" character varying(7) default '#38b2ac'::character varying,
    "accent_color" character varying(7) default '#ed8936'::character varying,
    "has_alumia" boolean default false,
    "plan_type" character varying(20) default 'basic'::character varying,
    "is_active" boolean default true,
    "billing_email" text,
    "contract_start_date" date,
    "contract_end_date" date,
    "monthly_fee" numeric(10,2) default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."flowtrip_subscriptions" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid,
    "plan_type" character varying(20) default 'basic'::character varying,
    "monthly_fee" numeric default 0,
    "max_users" integer default 100,
    "max_destinations" integer default 50,
    "features" jsonb default '{}'::jsonb,
    "billing_cycle" character varying(20) default 'monthly'::character varying,
    "next_billing_date" date,
    "status" character varying(20) default 'active'::character varying,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."flowtrip_subscriptions" enable row level security;

create table "public"."flowtrip_support_tickets" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid,
    "title" text not null,
    "description" text not null,
    "priority" character varying(20) default 'medium'::character varying,
    "status" character varying(20) default 'open'::character varying,
    "assigned_to" uuid,
    "created_by" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."flowtrip_support_tickets" enable row level security;

create table "public"."flowtrip_usage_metrics" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid,
    "metric_type" character varying(50) not null,
    "metric_value" numeric not null,
    "recorded_date" date default CURRENT_DATE,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now()
);


alter table "public"."flowtrip_usage_metrics" enable row level security;

create table "public"."flowtrip_white_label_configs" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid,
    "config_key" character varying(100) not null,
    "config_value" jsonb not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."flowtrip_white_label_configs" enable row level security;

create table "public"."institutional_content" (
    "id" uuid not null default gen_random_uuid(),
    "content_key" text not null,
    "content_value" text,
    "content_type" text default 'text'::text,
    "description" text,
    "is_active" boolean default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "created_by" uuid,
    "updated_by" uuid
);


alter table "public"."institutional_content" enable row level security;

create table "public"."institutional_partners" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "logo_url" text,
    "website_url" text,
    "description" text,
    "contact_email" text,
    "contact_phone" text,
    "is_active" boolean default true,
    "partner_type" text default 'general'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "created_by" uuid
);


alter table "public"."institutional_partners" enable row level security;

create table "public"."institutional_surveys" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "description" text,
    "objective" text not null,
    "questions" jsonb not null,
    "target_audience" text,
    "status" text default 'draft'::text,
    "responses_count" integer default 0,
    "created_by" uuid,
    "created_by_name" text,
    "region" text,
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."institutional_surveys" enable row level security;

create table "public"."knowledge_base_entries" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "content" text not null,
    "category" text not null,
    "region" text,
    "source" text,
    "data_type" text,
    "metadata" jsonb,
    "uploaded_by" uuid,
    "is_verified" boolean default false,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."knowledge_base_entries" enable row level security;

create table "public"."municipal_collaborators" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "email" text not null,
    "phone" text,
    "position" text not null,
    "role" text not null,
    "department" text,
    "municipality" text not null,
    "region" text,
    "status" text default 'active'::text,
    "permissions" jsonb,
    "created_by" uuid,
    "created_by_name" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."municipal_collaborators" enable row level security;

create table "public"."passport_stamps" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "destination_id" uuid,
    "route_id" uuid,
    "checkpoint_id" uuid,
    "stamp_type" text,
    "latitude" numeric,
    "longitude" numeric,
    "stamped_at" timestamp with time zone default now(),
    "state_id" uuid,
    "points_earned" integer default 10,
    "activity_type" text default 'check_in'::text
);


alter table "public"."passport_stamps" enable row level security;

create table "public"."password_reset_tokens" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "token_hash" text not null,
    "expires_at" timestamp with time zone not null,
    "used_at" timestamp with time zone,
    "created_at" timestamp with time zone default now()
);


alter table "public"."password_reset_tokens" enable row level security;

create table "public"."regions" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."regions" enable row level security;

create table "public"."route_checkpoints" (
    "id" uuid not null default gen_random_uuid(),
    "route_id" uuid not null,
    "destination_id" uuid,
    "order_sequence" integer not null,
    "name" text not null,
    "description" text,
    "latitude" numeric,
    "longitude" numeric,
    "is_mandatory" boolean default true,
    "created_at" timestamp with time zone default now()
);


alter table "public"."route_checkpoints" enable row level security;

create table "public"."routes" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "region" text,
    "difficulty" text,
    "estimated_duration" interval,
    "distance_km" numeric,
    "image_url" text,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid,
    "city_id" uuid,
    "state_id" uuid
);


alter table "public"."routes" enable row level security;

create table "public"."secretary_files" (
    "id" uuid not null default gen_random_uuid(),
    "filename" text not null,
    "original_name" text not null,
    "file_path" text not null,
    "file_type" text not null,
    "file_size" integer not null,
    "uploaded_by" uuid,
    "uploaded_by_name" text,
    "description" text,
    "category" text default 'geral'::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."secretary_files" enable row level security;

create table "public"."security_audit_log" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "action" text not null,
    "success" boolean not null,
    "error_message" text,
    "ip_address" inet,
    "user_agent" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."security_audit_log" enable row level security;

create table "public"."states" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "code" text not null,
    "logo_url" text,
    "primary_color" text default '#1E40AF'::text,
    "secondary_color" text default '#06B6D4'::text,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."states" enable row level security;

create table "public"."survey_responses" (
    "id" uuid not null default gen_random_uuid(),
    "survey_id" uuid not null,
    "respondent_id" uuid,
    "respondent_name" text,
    "respondent_email" text,
    "responses" jsonb not null,
    "submitted_at" timestamp with time zone not null default now(),
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."survey_responses" enable row level security;

create table "public"."tourism_intelligence_documents" (
    "id" uuid not null default gen_random_uuid(),
    "filename" text not null,
    "original_name" text not null,
    "file_path" text not null,
    "file_size" integer not null,
    "file_type" text not null,
    "upload_date" timestamp with time zone not null default now(),
    "uploaded_by" uuid,
    "description" text,
    "tags" text[],
    "is_processed" boolean default false,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "mime_type" text,
    "category" text default 'geral'::text,
    "uploader_name" text
);


alter table "public"."tourism_intelligence_documents" enable row level security;

create table "public"."tourist_regions" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "created_by" uuid
);


alter table "public"."tourist_regions" enable row level security;

create table "public"."user_achievements" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "state_id" uuid,
    "achievement_type" character varying(50) not null,
    "achievement_name" character varying(100) not null,
    "achievement_description" text,
    "points_awarded" integer default 0,
    "icon_url" text,
    "unlocked_at" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now()
);


alter table "public"."user_achievements" enable row level security;

create table "public"."user_interactions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "interaction_type" text not null,
    "page_url" text,
    "destination_id" uuid,
    "event_id" uuid,
    "duration_seconds" integer,
    "metadata" jsonb,
    "session_id" text,
    "ip_address" inet,
    "user_agent" text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."user_interactions" enable row level security;

create table "public"."user_levels" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "state_id" uuid,
    "total_points" integer default 0,
    "current_level" text default 'Iniciante'::text,
    "level_number" integer default 1,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."user_levels" enable row level security;

create table "public"."user_profiles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "full_name" text,
    "display_name" text,
    "avatar_url" text,
    "bio" text,
    "user_type" text,
    "region" text,
    "city" text,
    "phone" text,
    "birth_date" date,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "occupation" text,
    "gender" text,
    "sexuality_identity" text,
    "accessibility_preference" text default 'nenhuma'::text,
    "country" text,
    "state" text,
    "travel_organization" text,
    "custom_travel_organization" text,
    "stay_duration" text,
    "travel_motives" text[],
    "other_motive" text,
    "residence_city" text,
    "neighborhood" text,
    "custom_neighborhood" text,
    "time_in_city" text,
    "wants_to_collaborate" boolean default false
);


alter table "public"."user_profiles" enable row level security;

create table "public"."user_roles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "role" text not null,
    "region" text,
    "created_at" timestamp with time zone default now(),
    "created_by" uuid,
    "region_id" uuid,
    "city_id" uuid,
    "state_id" uuid
);


alter table "public"."user_roles" enable row level security;

CREATE UNIQUE INDEX ai_insights_pkey ON public.ai_insights USING btree (id);

CREATE UNIQUE INDEX ai_master_insights_pkey ON public.ai_master_insights USING btree (id);

CREATE UNIQUE INDEX attendant_timesheet_pkey ON public.attendant_timesheet USING btree (id);

CREATE UNIQUE INDEX cat_checkins_pkey ON public.cat_checkins USING btree (id);

CREATE UNIQUE INDEX cat_locations_pkey ON public.cat_locations USING btree (id);

CREATE UNIQUE INDEX cities_name_key ON public.cities USING btree (name);

CREATE UNIQUE INDEX cities_pkey ON public.cities USING btree (id);

CREATE UNIQUE INDEX city_tour_bookings_pkey ON public.city_tour_bookings USING btree (id);

CREATE UNIQUE INDEX city_tour_settings_pkey ON public.city_tour_settings USING btree (id);

CREATE UNIQUE INDEX content_audit_log_pkey ON public.content_audit_log USING btree (id);

CREATE UNIQUE INDEX destination_details_pkey ON public.destination_details USING btree (id);

CREATE UNIQUE INDEX destinations_pkey ON public.destinations USING btree (id);

CREATE UNIQUE INDEX event_details_pkey ON public.event_details USING btree (id);

CREATE UNIQUE INDEX events_pkey ON public.events USING btree (id);

CREATE UNIQUE INDEX flowtrip_clients_pkey ON public.flowtrip_clients USING btree (id);

CREATE UNIQUE INDEX flowtrip_invoices_invoice_number_key ON public.flowtrip_invoices USING btree (invoice_number);

CREATE UNIQUE INDEX flowtrip_invoices_pkey ON public.flowtrip_invoices USING btree (id);

CREATE UNIQUE INDEX flowtrip_master_config_config_key_key ON public.flowtrip_master_config USING btree (config_key);

CREATE UNIQUE INDEX flowtrip_master_config_pkey ON public.flowtrip_master_config USING btree (id);

CREATE UNIQUE INDEX flowtrip_onboarding_steps_pkey ON public.flowtrip_onboarding_steps USING btree (id);

CREATE UNIQUE INDEX flowtrip_state_features_pkey ON public.flowtrip_state_features USING btree (id);

CREATE UNIQUE INDEX flowtrip_state_features_state_id_feature_name_key ON public.flowtrip_state_features USING btree (state_id, feature_name);

CREATE UNIQUE INDEX flowtrip_states_code_key ON public.flowtrip_states USING btree (code);

CREATE UNIQUE INDEX flowtrip_states_pkey ON public.flowtrip_states USING btree (id);

CREATE UNIQUE INDEX flowtrip_subscriptions_pkey ON public.flowtrip_subscriptions USING btree (id);

CREATE UNIQUE INDEX flowtrip_support_tickets_pkey ON public.flowtrip_support_tickets USING btree (id);

CREATE UNIQUE INDEX flowtrip_usage_metrics_pkey ON public.flowtrip_usage_metrics USING btree (id);

CREATE UNIQUE INDEX flowtrip_white_label_configs_client_id_config_key_key ON public.flowtrip_white_label_configs USING btree (client_id, config_key);

CREATE UNIQUE INDEX flowtrip_white_label_configs_pkey ON public.flowtrip_white_label_configs USING btree (id);

CREATE INDEX idx_ai_insights_region ON public.ai_insights USING btree (region);

CREATE INDEX idx_ai_insights_type ON public.ai_insights USING btree (insight_type);

CREATE INDEX idx_attendant_timesheet_user_id ON public.attendant_timesheet USING btree (user_id);

CREATE INDEX idx_cat_locations_city ON public.cat_locations USING btree (city);

CREATE INDEX idx_cat_locations_region ON public.cat_locations USING btree (region);

CREATE INDEX idx_cities_region_id ON public.cities USING btree (region_id);

CREATE INDEX idx_content_audit_timestamp ON public.content_audit_log USING btree ("timestamp");

CREATE INDEX idx_destinations_city_id ON public.destinations USING btree (city_id);

CREATE INDEX idx_destinations_region ON public.destinations USING btree (region);

CREATE INDEX idx_events_city_id ON public.events USING btree (city_id);

CREATE INDEX idx_events_start_date ON public.events USING btree (start_date);

CREATE INDEX idx_events_visibility ON public.events USING btree (is_visible, visibility_end_date);

CREATE INDEX idx_institutional_surveys_region ON public.institutional_surveys USING btree (region);

CREATE INDEX idx_institutional_surveys_status ON public.institutional_surveys USING btree (status);

CREATE INDEX idx_knowledge_base_region ON public.knowledge_base_entries USING btree (region);

CREATE INDEX idx_municipal_collaborators_municipality ON public.municipal_collaborators USING btree (municipality);

CREATE INDEX idx_municipal_collaborators_status ON public.municipal_collaborators USING btree (status);

CREATE INDEX idx_passport_stamps_user_id ON public.passport_stamps USING btree (user_id);

CREATE INDEX idx_password_reset_tokens_expires_at ON public.password_reset_tokens USING btree (expires_at);

CREATE INDEX idx_password_reset_tokens_token_hash ON public.password_reset_tokens USING btree (token_hash);

CREATE INDEX idx_password_reset_tokens_user_id ON public.password_reset_tokens USING btree (user_id);

CREATE INDEX idx_route_checkpoints_route_id ON public.route_checkpoints USING btree (route_id);

CREATE INDEX idx_routes_city_id ON public.routes USING btree (city_id);

CREATE INDEX idx_secretary_files_category ON public.secretary_files USING btree (category);

CREATE INDEX idx_secretary_files_uploaded_by ON public.secretary_files USING btree (uploaded_by);

CREATE INDEX idx_security_audit_created_at ON public.security_audit_log USING btree (created_at);

CREATE INDEX idx_survey_responses_respondent ON public.survey_responses USING btree (respondent_id);

CREATE INDEX idx_survey_responses_survey_id ON public.survey_responses USING btree (survey_id);

CREATE INDEX idx_user_interactions_created_at ON public.user_interactions USING btree (created_at);

CREATE INDEX idx_user_interactions_type ON public.user_interactions USING btree (interaction_type);

CREATE INDEX idx_user_interactions_user_id ON public.user_interactions USING btree (user_id);

CREATE INDEX idx_user_profiles_country ON public.user_profiles USING btree (country);

CREATE INDEX idx_user_profiles_residence_city ON public.user_profiles USING btree (residence_city);

CREATE INDEX idx_user_profiles_state ON public.user_profiles USING btree (state);

CREATE INDEX idx_user_profiles_user_id ON public.user_profiles USING btree (user_id);

CREATE INDEX idx_user_profiles_user_type ON public.user_profiles USING btree (user_type);

CREATE INDEX idx_user_roles_role ON public.user_roles USING btree (role);

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);

CREATE UNIQUE INDEX institutional_content_content_key_key ON public.institutional_content USING btree (content_key);

CREATE UNIQUE INDEX institutional_content_pkey ON public.institutional_content USING btree (id);

CREATE UNIQUE INDEX institutional_partners_pkey ON public.institutional_partners USING btree (id);

CREATE UNIQUE INDEX institutional_surveys_pkey ON public.institutional_surveys USING btree (id);

CREATE UNIQUE INDEX knowledge_base_entries_pkey ON public.knowledge_base_entries USING btree (id);

CREATE UNIQUE INDEX municipal_collaborators_email_key ON public.municipal_collaborators USING btree (email);

CREATE UNIQUE INDEX municipal_collaborators_pkey ON public.municipal_collaborators USING btree (id);

CREATE UNIQUE INDEX passport_stamps_pkey ON public.passport_stamps USING btree (id);

CREATE UNIQUE INDEX password_reset_tokens_pkey ON public.password_reset_tokens USING btree (id);

CREATE UNIQUE INDEX regions_name_key ON public.regions USING btree (name);

CREATE UNIQUE INDEX regions_pkey ON public.regions USING btree (id);

CREATE UNIQUE INDEX route_checkpoints_pkey ON public.route_checkpoints USING btree (id);

CREATE UNIQUE INDEX routes_pkey ON public.routes USING btree (id);

CREATE UNIQUE INDEX secretary_files_pkey ON public.secretary_files USING btree (id);

CREATE UNIQUE INDEX security_audit_log_pkey ON public.security_audit_log USING btree (id);

CREATE UNIQUE INDEX states_code_key ON public.states USING btree (code);

CREATE UNIQUE INDEX states_pkey ON public.states USING btree (id);

CREATE UNIQUE INDEX survey_responses_pkey ON public.survey_responses USING btree (id);

CREATE UNIQUE INDEX tourism_intelligence_documents_pkey ON public.tourism_intelligence_documents USING btree (id);

CREATE UNIQUE INDEX tourist_regions_pkey ON public.tourist_regions USING btree (id);

CREATE UNIQUE INDEX unique_user_profiles_user_id ON public.user_profiles USING btree (user_id);

CREATE UNIQUE INDEX user_achievements_pkey ON public.user_achievements USING btree (id);

CREATE UNIQUE INDEX user_interactions_pkey ON public.user_interactions USING btree (id);

CREATE UNIQUE INDEX user_levels_pkey ON public.user_levels USING btree (id);

CREATE UNIQUE INDEX user_levels_user_id_state_id_key ON public.user_levels USING btree (user_id, state_id);

CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id);

CREATE UNIQUE INDEX user_profiles_user_id_key ON public.user_profiles USING btree (user_id);

CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (id);

CREATE UNIQUE INDEX user_roles_user_id_unique ON public.user_roles USING btree (user_id);

alter table "public"."ai_insights" add constraint "ai_insights_pkey" PRIMARY KEY using index "ai_insights_pkey";

alter table "public"."ai_master_insights" add constraint "ai_master_insights_pkey" PRIMARY KEY using index "ai_master_insights_pkey";

alter table "public"."attendant_timesheet" add constraint "attendant_timesheet_pkey" PRIMARY KEY using index "attendant_timesheet_pkey";

alter table "public"."cat_checkins" add constraint "cat_checkins_pkey" PRIMARY KEY using index "cat_checkins_pkey";

alter table "public"."cat_locations" add constraint "cat_locations_pkey" PRIMARY KEY using index "cat_locations_pkey";

alter table "public"."cities" add constraint "cities_pkey" PRIMARY KEY using index "cities_pkey";

alter table "public"."city_tour_bookings" add constraint "city_tour_bookings_pkey" PRIMARY KEY using index "city_tour_bookings_pkey";

alter table "public"."city_tour_settings" add constraint "city_tour_settings_pkey" PRIMARY KEY using index "city_tour_settings_pkey";

alter table "public"."content_audit_log" add constraint "content_audit_log_pkey" PRIMARY KEY using index "content_audit_log_pkey";

alter table "public"."destination_details" add constraint "destination_details_pkey" PRIMARY KEY using index "destination_details_pkey";

alter table "public"."destinations" add constraint "destinations_pkey" PRIMARY KEY using index "destinations_pkey";

alter table "public"."event_details" add constraint "event_details_pkey" PRIMARY KEY using index "event_details_pkey";

alter table "public"."events" add constraint "events_pkey" PRIMARY KEY using index "events_pkey";

alter table "public"."flowtrip_clients" add constraint "flowtrip_clients_pkey" PRIMARY KEY using index "flowtrip_clients_pkey";

alter table "public"."flowtrip_invoices" add constraint "flowtrip_invoices_pkey" PRIMARY KEY using index "flowtrip_invoices_pkey";

alter table "public"."flowtrip_master_config" add constraint "flowtrip_master_config_pkey" PRIMARY KEY using index "flowtrip_master_config_pkey";

alter table "public"."flowtrip_onboarding_steps" add constraint "flowtrip_onboarding_steps_pkey" PRIMARY KEY using index "flowtrip_onboarding_steps_pkey";

alter table "public"."flowtrip_state_features" add constraint "flowtrip_state_features_pkey" PRIMARY KEY using index "flowtrip_state_features_pkey";

alter table "public"."flowtrip_states" add constraint "flowtrip_states_pkey" PRIMARY KEY using index "flowtrip_states_pkey";

alter table "public"."flowtrip_subscriptions" add constraint "flowtrip_subscriptions_pkey" PRIMARY KEY using index "flowtrip_subscriptions_pkey";

alter table "public"."flowtrip_support_tickets" add constraint "flowtrip_support_tickets_pkey" PRIMARY KEY using index "flowtrip_support_tickets_pkey";

alter table "public"."flowtrip_usage_metrics" add constraint "flowtrip_usage_metrics_pkey" PRIMARY KEY using index "flowtrip_usage_metrics_pkey";

alter table "public"."flowtrip_white_label_configs" add constraint "flowtrip_white_label_configs_pkey" PRIMARY KEY using index "flowtrip_white_label_configs_pkey";

alter table "public"."institutional_content" add constraint "institutional_content_pkey" PRIMARY KEY using index "institutional_content_pkey";

alter table "public"."institutional_partners" add constraint "institutional_partners_pkey" PRIMARY KEY using index "institutional_partners_pkey";

alter table "public"."institutional_surveys" add constraint "institutional_surveys_pkey" PRIMARY KEY using index "institutional_surveys_pkey";

alter table "public"."knowledge_base_entries" add constraint "knowledge_base_entries_pkey" PRIMARY KEY using index "knowledge_base_entries_pkey";

alter table "public"."municipal_collaborators" add constraint "municipal_collaborators_pkey" PRIMARY KEY using index "municipal_collaborators_pkey";

alter table "public"."passport_stamps" add constraint "passport_stamps_pkey" PRIMARY KEY using index "passport_stamps_pkey";

alter table "public"."password_reset_tokens" add constraint "password_reset_tokens_pkey" PRIMARY KEY using index "password_reset_tokens_pkey";

alter table "public"."regions" add constraint "regions_pkey" PRIMARY KEY using index "regions_pkey";

alter table "public"."route_checkpoints" add constraint "route_checkpoints_pkey" PRIMARY KEY using index "route_checkpoints_pkey";

alter table "public"."routes" add constraint "routes_pkey" PRIMARY KEY using index "routes_pkey";

alter table "public"."secretary_files" add constraint "secretary_files_pkey" PRIMARY KEY using index "secretary_files_pkey";

alter table "public"."security_audit_log" add constraint "security_audit_log_pkey" PRIMARY KEY using index "security_audit_log_pkey";

alter table "public"."states" add constraint "states_pkey" PRIMARY KEY using index "states_pkey";

alter table "public"."survey_responses" add constraint "survey_responses_pkey" PRIMARY KEY using index "survey_responses_pkey";

alter table "public"."tourism_intelligence_documents" add constraint "tourism_intelligence_documents_pkey" PRIMARY KEY using index "tourism_intelligence_documents_pkey";

alter table "public"."tourist_regions" add constraint "tourist_regions_pkey" PRIMARY KEY using index "tourist_regions_pkey";

alter table "public"."user_achievements" add constraint "user_achievements_pkey" PRIMARY KEY using index "user_achievements_pkey";

alter table "public"."user_interactions" add constraint "user_interactions_pkey" PRIMARY KEY using index "user_interactions_pkey";

alter table "public"."user_levels" add constraint "user_levels_pkey" PRIMARY KEY using index "user_levels_pkey";

alter table "public"."user_profiles" add constraint "user_profiles_pkey" PRIMARY KEY using index "user_profiles_pkey";

alter table "public"."user_roles" add constraint "user_roles_pkey" PRIMARY KEY using index "user_roles_pkey";

alter table "public"."ai_insights" add constraint "ai_insights_confidence_score_check" CHECK (((confidence_score >= (0)::numeric) AND (confidence_score <= (1)::numeric))) not valid;

alter table "public"."ai_insights" validate constraint "ai_insights_confidence_score_check";

alter table "public"."ai_insights" add constraint "ai_insights_generated_by_fkey" FOREIGN KEY (generated_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."ai_insights" validate constraint "ai_insights_generated_by_fkey";

alter table "public"."ai_master_insights" add constraint "ai_master_insights_priority_check" CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))) not valid;

alter table "public"."ai_master_insights" validate constraint "ai_master_insights_priority_check";

alter table "public"."ai_master_insights" add constraint "ai_master_insights_status_check" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'resolved'::character varying, 'dismissed'::character varying])::text[]))) not valid;

alter table "public"."ai_master_insights" validate constraint "ai_master_insights_status_check";

alter table "public"."attendant_timesheet" add constraint "attendant_timesheet_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."attendant_timesheet" validate constraint "attendant_timesheet_user_id_fkey";

alter table "public"."cities" add constraint "cities_name_key" UNIQUE using index "cities_name_key";

alter table "public"."cities" add constraint "cities_region_id_fkey" FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE not valid;

alter table "public"."cities" validate constraint "cities_region_id_fkey";

alter table "public"."content_audit_log" add constraint "content_audit_log_action_check" CHECK ((action = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text]))) not valid;

alter table "public"."content_audit_log" validate constraint "content_audit_log_action_check";

alter table "public"."content_audit_log" add constraint "content_audit_log_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."content_audit_log" validate constraint "content_audit_log_user_id_fkey";

alter table "public"."destination_details" add constraint "destination_details_destination_id_fkey" FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE not valid;

alter table "public"."destination_details" validate constraint "destination_details_destination_id_fkey";

alter table "public"."destination_details" add constraint "destination_details_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."destination_details" validate constraint "destination_details_updated_by_fkey";

alter table "public"."destination_details" add constraint "destination_details_video_type_check" CHECK ((video_type = ANY (ARRAY['youtube'::text, 'upload'::text]))) not valid;

alter table "public"."destination_details" validate constraint "destination_details_video_type_check";

alter table "public"."destinations" add constraint "destinations_city_id_fkey" FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL not valid;

alter table "public"."destinations" validate constraint "destinations_city_id_fkey";

alter table "public"."destinations" add constraint "destinations_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."destinations" validate constraint "destinations_created_by_fkey";

alter table "public"."destinations" add constraint "destinations_state_id_fkey" FOREIGN KEY (state_id) REFERENCES states(id) not valid;

alter table "public"."destinations" validate constraint "destinations_state_id_fkey";

alter table "public"."event_details" add constraint "event_details_event_id_fkey" FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE not valid;

alter table "public"."event_details" validate constraint "event_details_event_id_fkey";

alter table "public"."event_details" add constraint "event_details_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."event_details" validate constraint "event_details_updated_by_fkey";

alter table "public"."events" add constraint "events_city_id_fkey" FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL not valid;

alter table "public"."events" validate constraint "events_city_id_fkey";

alter table "public"."events" add constraint "events_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."events" validate constraint "events_created_by_fkey";

alter table "public"."events" add constraint "events_state_id_fkey" FOREIGN KEY (state_id) REFERENCES events(id) not valid;

alter table "public"."events" validate constraint "events_state_id_fkey";

alter table "public"."flowtrip_clients" add constraint "flowtrip_clients_state_id_fkey" FOREIGN KEY (state_id) REFERENCES flowtrip_states(id) not valid;

alter table "public"."flowtrip_clients" validate constraint "flowtrip_clients_state_id_fkey";

alter table "public"."flowtrip_invoices" add constraint "flowtrip_invoices_client_id_fkey" FOREIGN KEY (client_id) REFERENCES flowtrip_clients(id) not valid;

alter table "public"."flowtrip_invoices" validate constraint "flowtrip_invoices_client_id_fkey";

alter table "public"."flowtrip_invoices" add constraint "flowtrip_invoices_invoice_number_key" UNIQUE using index "flowtrip_invoices_invoice_number_key";

alter table "public"."flowtrip_invoices" add constraint "flowtrip_invoices_subscription_id_fkey" FOREIGN KEY (subscription_id) REFERENCES flowtrip_subscriptions(id) not valid;

alter table "public"."flowtrip_invoices" validate constraint "flowtrip_invoices_subscription_id_fkey";

alter table "public"."flowtrip_master_config" add constraint "flowtrip_master_config_config_key_key" UNIQUE using index "flowtrip_master_config_config_key_key";

alter table "public"."flowtrip_master_config" add constraint "flowtrip_master_config_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."flowtrip_master_config" validate constraint "flowtrip_master_config_updated_by_fkey";

alter table "public"."flowtrip_onboarding_steps" add constraint "flowtrip_onboarding_steps_client_id_fkey" FOREIGN KEY (client_id) REFERENCES flowtrip_clients(id) not valid;

alter table "public"."flowtrip_onboarding_steps" validate constraint "flowtrip_onboarding_steps_client_id_fkey";

alter table "public"."flowtrip_state_features" add constraint "flowtrip_state_features_state_id_feature_name_key" UNIQUE using index "flowtrip_state_features_state_id_feature_name_key";

alter table "public"."flowtrip_state_features" add constraint "flowtrip_state_features_state_id_fkey" FOREIGN KEY (state_id) REFERENCES flowtrip_states(id) ON DELETE CASCADE not valid;

alter table "public"."flowtrip_state_features" validate constraint "flowtrip_state_features_state_id_fkey";

alter table "public"."flowtrip_states" add constraint "flowtrip_states_code_key" UNIQUE using index "flowtrip_states_code_key";

alter table "public"."flowtrip_subscriptions" add constraint "flowtrip_subscriptions_client_id_fkey" FOREIGN KEY (client_id) REFERENCES flowtrip_clients(id) not valid;

alter table "public"."flowtrip_subscriptions" validate constraint "flowtrip_subscriptions_client_id_fkey";

alter table "public"."flowtrip_support_tickets" add constraint "flowtrip_support_tickets_client_id_fkey" FOREIGN KEY (client_id) REFERENCES flowtrip_clients(id) not valid;

alter table "public"."flowtrip_support_tickets" validate constraint "flowtrip_support_tickets_client_id_fkey";

alter table "public"."flowtrip_usage_metrics" add constraint "flowtrip_usage_metrics_client_id_fkey" FOREIGN KEY (client_id) REFERENCES flowtrip_clients(id) not valid;

alter table "public"."flowtrip_usage_metrics" validate constraint "flowtrip_usage_metrics_client_id_fkey";

alter table "public"."flowtrip_white_label_configs" add constraint "flowtrip_white_label_configs_client_id_config_key_key" UNIQUE using index "flowtrip_white_label_configs_client_id_config_key_key";

alter table "public"."flowtrip_white_label_configs" add constraint "flowtrip_white_label_configs_client_id_fkey" FOREIGN KEY (client_id) REFERENCES flowtrip_clients(id) not valid;

alter table "public"."flowtrip_white_label_configs" validate constraint "flowtrip_white_label_configs_client_id_fkey";

alter table "public"."institutional_content" add constraint "institutional_content_content_key_key" UNIQUE using index "institutional_content_content_key_key";

alter table "public"."institutional_surveys" add constraint "institutional_surveys_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."institutional_surveys" validate constraint "institutional_surveys_created_by_fkey";

alter table "public"."knowledge_base_entries" add constraint "knowledge_base_entries_uploaded_by_fkey" FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."knowledge_base_entries" validate constraint "knowledge_base_entries_uploaded_by_fkey";

alter table "public"."municipal_collaborators" add constraint "municipal_collaborators_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."municipal_collaborators" validate constraint "municipal_collaborators_created_by_fkey";

alter table "public"."municipal_collaborators" add constraint "municipal_collaborators_email_key" UNIQUE using index "municipal_collaborators_email_key";

alter table "public"."passport_stamps" add constraint "passport_stamps_checkpoint_id_fkey" FOREIGN KEY (checkpoint_id) REFERENCES route_checkpoints(id) not valid;

alter table "public"."passport_stamps" validate constraint "passport_stamps_checkpoint_id_fkey";

alter table "public"."passport_stamps" add constraint "passport_stamps_destination_id_fkey" FOREIGN KEY (destination_id) REFERENCES destinations(id) not valid;

alter table "public"."passport_stamps" validate constraint "passport_stamps_destination_id_fkey";

alter table "public"."passport_stamps" add constraint "passport_stamps_route_id_fkey" FOREIGN KEY (route_id) REFERENCES routes(id) not valid;

alter table "public"."passport_stamps" validate constraint "passport_stamps_route_id_fkey";

alter table "public"."passport_stamps" add constraint "passport_stamps_stamp_type_check" CHECK ((stamp_type = ANY (ARRAY['destination'::text, 'checkpoint'::text, 'route_completion'::text]))) not valid;

alter table "public"."passport_stamps" validate constraint "passport_stamps_stamp_type_check";

alter table "public"."passport_stamps" add constraint "passport_stamps_state_id_fkey" FOREIGN KEY (state_id) REFERENCES states(id) not valid;

alter table "public"."passport_stamps" validate constraint "passport_stamps_state_id_fkey";

alter table "public"."passport_stamps" add constraint "passport_stamps_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."passport_stamps" validate constraint "passport_stamps_user_id_fkey";

alter table "public"."password_reset_tokens" add constraint "password_reset_tokens_expires_check" CHECK ((expires_at > created_at)) not valid;

alter table "public"."password_reset_tokens" validate constraint "password_reset_tokens_expires_check";

alter table "public"."regions" add constraint "regions_name_key" UNIQUE using index "regions_name_key";

alter table "public"."route_checkpoints" add constraint "route_checkpoints_destination_id_fkey" FOREIGN KEY (destination_id) REFERENCES destinations(id) not valid;

alter table "public"."route_checkpoints" validate constraint "route_checkpoints_destination_id_fkey";

alter table "public"."route_checkpoints" add constraint "route_checkpoints_route_id_fkey" FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE not valid;

alter table "public"."route_checkpoints" validate constraint "route_checkpoints_route_id_fkey";

alter table "public"."routes" add constraint "routes_city_id_fkey" FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL not valid;

alter table "public"."routes" validate constraint "routes_city_id_fkey";

alter table "public"."routes" add constraint "routes_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."routes" validate constraint "routes_created_by_fkey";

alter table "public"."routes" add constraint "routes_difficulty_check" CHECK ((difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text]))) not valid;

alter table "public"."routes" validate constraint "routes_difficulty_check";

alter table "public"."routes" add constraint "routes_state_id_fkey" FOREIGN KEY (state_id) REFERENCES states(id) not valid;

alter table "public"."routes" validate constraint "routes_state_id_fkey";

alter table "public"."secretary_files" add constraint "secretary_files_uploaded_by_fkey" FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."secretary_files" validate constraint "secretary_files_uploaded_by_fkey";

alter table "public"."security_audit_log" add constraint "security_audit_log_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."security_audit_log" validate constraint "security_audit_log_user_id_fkey";

alter table "public"."states" add constraint "states_code_key" UNIQUE using index "states_code_key";

alter table "public"."survey_responses" add constraint "survey_responses_respondent_id_fkey" FOREIGN KEY (respondent_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."survey_responses" validate constraint "survey_responses_respondent_id_fkey";

alter table "public"."survey_responses" add constraint "survey_responses_survey_id_fkey" FOREIGN KEY (survey_id) REFERENCES institutional_surveys(id) ON DELETE CASCADE not valid;

alter table "public"."survey_responses" validate constraint "survey_responses_survey_id_fkey";

alter table "public"."user_achievements" add constraint "user_achievements_state_id_fkey" FOREIGN KEY (state_id) REFERENCES flowtrip_states(id) not valid;

alter table "public"."user_achievements" validate constraint "user_achievements_state_id_fkey";

alter table "public"."user_achievements" add constraint "user_achievements_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_achievements" validate constraint "user_achievements_user_id_fkey";

alter table "public"."user_interactions" add constraint "user_interactions_destination_id_fkey" FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL not valid;

alter table "public"."user_interactions" validate constraint "user_interactions_destination_id_fkey";

alter table "public"."user_interactions" add constraint "user_interactions_event_id_fkey" FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL not valid;

alter table "public"."user_interactions" validate constraint "user_interactions_event_id_fkey";

alter table "public"."user_interactions" add constraint "user_interactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_interactions" validate constraint "user_interactions_user_id_fkey";

alter table "public"."user_levels" add constraint "user_levels_state_id_fkey" FOREIGN KEY (state_id) REFERENCES states(id) not valid;

alter table "public"."user_levels" validate constraint "user_levels_state_id_fkey";

alter table "public"."user_levels" add constraint "user_levels_user_id_state_id_key" UNIQUE using index "user_levels_user_id_state_id_key";

alter table "public"."user_profiles" add constraint "unique_user_profiles_user_id" UNIQUE using index "unique_user_profiles_user_id";

alter table "public"."user_profiles" add constraint "user_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_user_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_user_id_key" UNIQUE using index "user_profiles_user_id_key";

alter table "public"."user_profiles" add constraint "user_profiles_user_type_check" CHECK ((user_type = ANY (ARRAY['tourist'::text, 'resident'::text, 'collaborator'::text, 'guide'::text]))) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_user_type_check";

alter table "public"."user_roles" add constraint "user_roles_city_id_fkey" FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL not valid;

alter table "public"."user_roles" validate constraint "user_roles_city_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."user_roles" validate constraint "user_roles_created_by_fkey";

alter table "public"."user_roles" add constraint "user_roles_region_id_fkey" FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL not valid;

alter table "public"."user_roles" validate constraint "user_roles_region_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'tech'::text, 'diretor_estadual'::text, 'gestor_igr'::text, 'gestor_municipal'::text, 'atendente'::text, 'user'::text]))) not valid;

alter table "public"."user_roles" validate constraint "user_roles_role_check";

alter table "public"."user_roles" add constraint "user_roles_state_id_fkey" FOREIGN KEY (state_id) REFERENCES flowtrip_states(id) not valid;

alter table "public"."user_roles" validate constraint "user_roles_state_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_user_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_user_id_unique" UNIQUE using index "user_roles_user_id_unique";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.assign_user_role(p_user_id uuid, p_role text, p_city_id uuid DEFAULT NULL::uuid, p_region_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Inserir ou atualizar role do usuário
  INSERT INTO public.user_roles (
    user_id,
    role,
    city_id,
    region_id,
    created_at,
    created_by
  ) VALUES (
    p_user_id,
    p_role,
    p_city_id,
    p_region_id,
    now(),
    p_user_id
  )
  ON CONFLICT (user_id, role) DO UPDATE SET
    city_id = EXCLUDED.city_id,
    region_id = EXCLUDED.region_id,
    created_at = EXCLUDED.created_at;
  
  -- Log da criação
  INSERT INTO public.security_audit_log (
    action,
    user_id,
    success,
    created_at
  ) VALUES (
    'user_role_assigned',
    p_user_id,
    true,
    now()
  );
  
  RETURN true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.audit_table_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.content_audit_log (
    table_name,
    action,
    record_id,
    user_id,
    user_name,
    old_values,
    new_values
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    auth.uid(),
    COALESCE(
      (SELECT full_name FROM public.user_profiles WHERE user_id = auth.uid()),
      auth.email()
    ),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.auto_expire_events()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Atualizar eventos com end_date que já passaram para inativos
  UPDATE public.events
  SET
    is_active = FALSE,
    updated_at = NOW()
  WHERE
    end_date IS NOT NULL
    AND end_date <= NOW()
    AND is_active = TRUE;

  -- Atualizar eventos em event_details onde auto_hide é TRUE e visibility_end_date já passou
  -- Isso irá impactar a visibilidade no frontend, mas o evento principal permanece.
  UPDATE public.event_details
  SET
    is_visible = FALSE, -- Assumindo que você terá uma coluna is_visible em event_details
    updated_at = NOW()
  WHERE
    auto_hide = TRUE
    AND visibility_end_date IS NOT NULL
    AND visibility_end_date <= NOW()
    AND is_visible = TRUE;

  RAISE NOTICE 'Event expiration function executed.';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_initial_admin_if_needed(admin_email text, admin_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Check if any admins already exist
  SELECT COUNT(*) INTO admin_count 
  FROM public.user_roles 
  WHERE role IN ('admin', 'tech');

  -- Only allow if no admins exist
  IF admin_count > 0 THEN
    INSERT INTO public.security_audit_log (
      action, user_id, success, error_message
    ) VALUES (
      'initial_admin_creation_blocked', 
      admin_user_id, 
      false, 
      'Attempted to create initial admin when admins already exist'
    );
    RETURN FALSE;
  END IF;

  -- Create the admin role directly (bypassing RLS for initial setup)
  INSERT INTO public.user_roles (user_id, role, created_by)
  VALUES (admin_user_id, 'admin', admin_user_id);

  -- Log the creation
  INSERT INTO public.security_audit_log (
    action, user_id, success, error_message
  ) VALUES (
    'initial_admin_created', 
    admin_user_id, 
    true, 
    format('Initial admin created for user: %s', admin_email)
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log any errors
    INSERT INTO public.security_audit_log (
      action, user_id, success, error_message
    ) VALUES (
      'initial_admin_creation_error', 
      admin_user_id, 
      false, 
      SQLERRM
    );
    RETURN FALSE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_initial_admin_user(admin_email text, admin_password text, admin_name text DEFAULT 'System Administrator'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  new_user_id uuid;
  existing_admin_count int;
BEGIN
  -- Check if any admin users already exist
  SELECT COUNT(*) INTO existing_admin_count 
  FROM public.user_roles 
  WHERE role IN ('admin', 'tech');
  
  -- Only create if no admins exist
  IF existing_admin_count > 0 THEN
    RAISE NOTICE 'Admin users already exist. Skipping creation.';
    RETURN false;
  END IF;
  
  -- Create the user in auth.users (this would typically be done via Supabase Auth API)
  -- For now, we'll just create the profile and role entries
  
  -- Generate a UUID for the admin user
  new_user_id := gen_random_uuid();
  
  -- Create user profile
  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    display_name,
    user_type,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    admin_name,
    admin_name,
    'administrator',
    now(),
    now()
  );
  
  -- Assign admin role
  INSERT INTO public.user_roles (
    user_id,
    role,
    created_at,
    created_by
  ) VALUES (
    new_user_id,
    'admin',
    now(),
    new_user_id
  );
  
  -- Log the admin creation
  INSERT INTO public.security_audit_log (
    action,
    user_id,
    success,
    created_at
  ) VALUES (
    'initial_admin_user_created',
    new_user_id,
    true,
    now()
  );
  
  RAISE NOTICE 'Initial admin user profile created with ID: %', new_user_id;
  RETURN true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_password_reset_token(user_email text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  target_user_id uuid;
  reset_token uuid;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Generate reset token
  reset_token := gen_random_uuid();
  
  -- Store token with 1 hour expiration
  INSERT INTO public.password_reset_tokens (
    user_id,
    token_hash,
    expires_at
  ) VALUES (
    target_user_id,
    encode(digest(reset_token::text, 'sha256'), 'hex'),
    now() + interval '1 hour'
  );
  
  -- Log security event
  INSERT INTO public.security_audit_log (
    action,
    user_id,
    success
  ) VALUES (
    'password_reset_token_created',
    target_user_id,
    true
  );
  
  RETURN reset_token;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_test_user_profiles()
 RETURNS TABLE(user_id_created uuid, email_ref text, role_assigned text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  users_info text[][] := ARRAY[
    ARRAY['admin-teste@ms.gov.br', 'admin', 'Administrador de Teste', 'Admin Teste', 'collaborator'],
    ARRAY['diretor-teste@ms.gov.br', 'diretor_estadual', 'Diretor Estadual de Teste', 'Diretor Teste', 'collaborator'],
    ARRAY['gestor-igr-teste@ms.gov.br', 'gestor_igr', 'Gestor IGR de Teste', 'Gestor IGR Teste', 'collaborator'],
    ARRAY['gestor-municipal-teste@ms.gov.br', 'gestor_municipal', 'Gestor Municipal de Teste', 'Gestor Municipal Teste', 'collaborator'],
    ARRAY['atendente-teste@ms.gov.br', 'atendente', 'Atendente de Teste', 'Atendente Teste', 'collaborator'],
    ARRAY['usuario-teste@ms.gov.br', 'user', 'Usuário de Teste', 'Usuário Teste', 'tourist']
  ];
  user_info text[];
  test_user_id uuid;
  i int;
BEGIN
  -- Iterar sobre os usuários de teste
  FOR i IN 1..array_length(users_info, 1)
  LOOP
    user_info := users_info[i];
    test_user_id := gen_random_uuid();
    
    -- Inserir perfil do usuário
    INSERT INTO public.user_profiles (
      user_id,
      full_name,
      display_name,
      user_type,
      created_at,
      updated_at
    ) VALUES (
      test_user_id,
      user_info[3], -- full_name
      user_info[4], -- display_name
      user_info[5], -- user_type
      now(),
      now()
    );
    
    -- Criar papel do usuário apenas se não for 'user'
    IF user_info[2] != 'user' THEN
      INSERT INTO public.user_roles (
        user_id,
        role,
        created_at,
        created_by
      ) VALUES (
        test_user_id,
        user_info[2], -- role
        now(),
        test_user_id
      );
    END IF;
    
    -- Log da criação
    INSERT INTO public.security_audit_log (
      action,
      user_id,
      success,
      created_at
    ) VALUES (
      'test_user_profile_created',
      test_user_id,
      true,
      now()
    );
    
    -- Retornar informações do perfil criado
    RETURN QUERY SELECT 
      test_user_id as user_id_created,
      user_info[1] as email_ref,
      user_info[2] as role_assigned;
  END LOOP;
  
  RETURN;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.detect_suspicious_activity(check_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  failed_logins int;
  multiple_ips int;
  result jsonb;
BEGIN
  -- Count failed login attempts in last hour
  SELECT COUNT(*) INTO failed_logins
  FROM public.security_audit_log
  WHERE user_id = check_user_id
  AND action = 'login_attempt'
  AND success = false
  AND created_at > now() - interval '1 hour';
  
  -- Count distinct IP addresses in last 24 hours
  SELECT COUNT(DISTINCT ip_address) INTO multiple_ips
  FROM public.security_audit_log
  WHERE user_id = check_user_id
  AND created_at > now() - interval '24 hours'
  AND ip_address IS NOT NULL;
  
  result := jsonb_build_object(
    'failed_logins_last_hour', failed_logins,
    'distinct_ips_last_24h', multiple_ips,
    'suspicious', (failed_logins > 5 OR multiple_ips > 3)
  );
  
  RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.elevate_to_admin(user_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  target_user_id uuid;
  requesting_user_id uuid := auth.uid();
  requester_role text;
  success_result boolean;
BEGIN
  -- Get requester's role
  SELECT role INTO requester_role 
  FROM public.user_roles 
  WHERE user_id = requesting_user_id;

  -- Only existing admins can elevate other users
  IF requester_role NOT IN ('admin', 'tech') THEN
    -- Log unauthorized elevation attempt
    INSERT INTO public.security_audit_log (
      action, user_id, success, error_message
    ) VALUES (
      'unauthorized_admin_elevation_attempt', 
      requesting_user_id, 
      false, 
      format('Non-admin user attempted to elevate %s', user_email)
    );
    RAISE EXCEPTION 'Unauthorized: Only admins can elevate users to admin role';
  END IF;

  -- Find target user
  SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;

  IF target_user_id IS NULL THEN
    INSERT INTO public.security_audit_log (
      action, user_id, success, error_message
    ) VALUES (
      'admin_elevation_failed', 
      requesting_user_id, 
      false, 
      format('User with email %s not found', user_email)
    );
    RAISE EXCEPTION 'Usuário com o e-mail % não encontrado', user_email;
  END IF;

  -- Use the secure role update function
  SELECT public.secure_update_user_role(target_user_id, 'admin', requesting_user_id) INTO success_result;
  
  IF NOT success_result THEN
    RAISE EXCEPTION 'Failed to elevate user to admin role';
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.ensure_admin_exists()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  admin_count int;
BEGIN
  -- Verificar se existe pelo menos um admin
  SELECT COUNT(*) INTO admin_count 
  FROM public.user_roles 
  WHERE role IN ('admin', 'tech');
  
  -- Se não existir admin, retornar false para indicar que é necessário criar
  IF admin_count = 0 THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fix_incomplete_profiles()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Criar perfis básicos para usuários que não têm perfil
  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    display_name,
    user_type,
    created_at,
    updated_at
  )
  SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', u.email, 'Usuário'),
    COALESCE(u.raw_user_meta_data->>'full_name', u.email, 'Usuário'),
    'tourist',
    u.created_at,
    now()
  FROM auth.users u
  LEFT JOIN public.user_profiles p ON u.id = p.user_id
  WHERE p.user_id IS NULL
  ON CONFLICT (user_id) DO NOTHING;

  -- Atualizar perfis com dados nulos
  UPDATE public.user_profiles 
  SET 
    full_name = COALESCE(full_name, 'Usuário'),
    display_name = COALESCE(display_name, 'Usuário'),
    user_type = COALESCE(user_type, 'tourist'),
    updated_at = now()
  WHERE full_name IS NULL OR display_name IS NULL OR user_type IS NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Se o usuário não estiver logado, ele é um 'anônimo'.
  IF auth.uid() IS NULL THEN
    RETURN 'anon';
  END IF;

  -- Busca o papel (role) na tabela user_roles.
  -- Se não encontrar, retorna 'user' como padrão.
  RETURN COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
    'user'
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT role FROM public.user_roles
  WHERE user_id = check_user_id
  LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_states(check_user_id uuid)
 RETURNS TABLE(state_id uuid, state_code text, state_name text, user_role text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT 
    COALESCE(ur.state_id, fs.id) as state_id,
    fs.code as state_code,
    fs.name as state_name,
    ur.role as user_role
  FROM user_roles ur
  LEFT JOIN flowtrip_states fs ON ur.state_id = fs.id OR ur.role IN ('admin', 'tech')
  WHERE ur.user_id = check_user_id
  AND fs.is_active = true;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_statistics()
 RETURNS TABLE(role_name text, user_count bigint, active_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Verificar permissões
  IF NOT public.is_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Permission denied to access statistics.';
  END IF;

  RETURN QUERY
  SELECT 
    COALESCE(ur.role::text, 'user') as role_name,
    COUNT(*) as user_count,
    COUNT(CASE WHEN u.banned_until IS NULL AND u.deleted_at IS NULL THEN 1 END) as active_count
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  GROUP BY ur.role
  ORDER BY user_count DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_users_by_role(target_role text)
 RETURNS TABLE(id uuid, email text, full_name text, region text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Verificar permissões
  IF NOT public.is_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Permission denied to access user data.';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email,
    COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.email) as full_name,
    ur.region,
    u.created_at
  FROM auth.users u
  LEFT JOIN public.user_profiles p ON u.id = p.user_id
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  WHERE ur.role::text = target_role OR (target_role = 'user' AND ur.role IS NULL)
  ORDER BY u.created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_users_with_details()
 RETURNS TABLE(id uuid, email text, full_name text, user_type text, role text, region text, status text, created_at timestamp with time zone, last_sign_in_at timestamp with time zone, phone text, city text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  -- Verificar se o usuário tem permissão de gerente
  IF NOT public.is_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Permission denied to access user data.';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email,
    COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.email) as full_name,
    COALESCE(p.user_type, 'user') as user_type,
    COALESCE(ur.role::text, 'user') as role,
    ur.region,
    CASE 
      WHEN u.banned_until IS NULL AND u.deleted_at IS NULL 
      THEN 'active' 
      ELSE 'inactive' 
    END AS status,
    u.created_at,
    u.last_sign_in_at,
    p.phone,
    p.city
  FROM auth.users u
  LEFT JOIN public.user_profiles p ON u.id = p.user_id
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  ORDER BY u.created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.has_state_role(check_user_id uuid, required_role text, check_state_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = check_user_id 
    AND role = required_role
    AND (state_id = check_state_id OR role IN ('admin', 'tech'))
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id 
    AND role IN ('admin', 'tech')
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_manager(check_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id 
    AND role IN ('admin', 'tech', 'municipal_manager', 'gestor', 'municipal')
  );
$function$
;

CREATE OR REPLACE FUNCTION public.log_enhanced_security_event(event_action text, event_user_id uuid DEFAULT NULL::uuid, event_success boolean DEFAULT true, event_error_message text DEFAULT NULL::text, event_metadata jsonb DEFAULT NULL::jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.security_audit_log (
    action,
    user_id,
    success,
    error_message,
    ip_address,
    user_agent
  ) VALUES (
    event_action,
    event_user_id,
    event_success,
    event_error_message,
    COALESCE((event_metadata->>'ip_address')::inet, '127.0.0.1'::inet),
    event_metadata->>'user_agent'
  );
  
  RETURN true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_security_event(event_action text, event_user_id uuid DEFAULT NULL::uuid, event_success boolean DEFAULT true, event_error_message text DEFAULT NULL::text, event_ip_address text DEFAULT NULL::text, event_user_agent text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  INSERT INTO public.security_audit_log (
    action,
    user_id,
    success,
    error_message,
    ip_address,
    user_agent
  ) VALUES (
    event_action,
    event_user_id,
    event_success,
    event_error_message,
    event_ip_address::inet,
    event_user_agent
  );
  
  SELECT TRUE;
$function$
;

CREATE OR REPLACE FUNCTION public.promote_user_to_role(p_email text, p_role text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  target_user_id uuid;
BEGIN
  -- Buscar usuário por email na tabela auth.users
  SELECT id INTO target_user_id FROM auth.users WHERE email = p_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário com email % não encontrado', p_email;
  END IF;
  
  -- Criar perfil se não existir
  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    display_name,
    user_type,
    created_at,
    updated_at
  ) VALUES (
    target_user_id,
    'Usuário ' || p_email,
    'Usuário ' || p_email,
    CASE 
      WHEN p_role = 'user' THEN 'tourist'
      ELSE 'collaborator'
    END,
    now(),
    now()
  ) ON CONFLICT (user_id) DO UPDATE SET
    user_type = CASE 
      WHEN p_role = 'user' THEN 'tourist'
      ELSE 'collaborator'
    END,
    updated_at = now();
  
  -- Assinar role se não for user
  IF p_role != 'user' THEN
    INSERT INTO public.user_roles (
      user_id,
      role,
      created_at,
      created_by
    ) VALUES (
      target_user_id,
      p_role,
      now(),
      target_user_id
    ) ON CONFLICT (user_id, role) DO UPDATE SET
      created_at = now();
  END IF;
  
  RETURN true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.secure_update_user_role(target_user_id uuid, new_role text, requesting_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  requester_role TEXT;
  target_current_role TEXT;
BEGIN
  -- Get requester's role
  SELECT role INTO requester_role 
  FROM public.user_roles 
  WHERE user_id = requesting_user_id;

  -- Get target user's current role
  SELECT role INTO target_current_role 
  FROM public.user_roles 
  WHERE user_id = target_user_id;

  -- Only admins and tech can modify roles
  IF requester_role NOT IN ('admin', 'tech') THEN
    -- Log unauthorized attempt
    INSERT INTO public.security_audit_log (
      action, user_id, success, error_message
    ) VALUES (
      'unauthorized_role_change_attempt', 
      requesting_user_id, 
      false, 
      'User without admin privileges attempted to change roles'
    );
    RETURN FALSE;
  END IF;

  -- Prevent self-elevation (users cannot elevate their own privileges)
  IF requesting_user_id = target_user_id AND 
     target_current_role NOT IN ('admin', 'tech') AND 
     new_role IN ('admin', 'tech') THEN
    -- Log self-elevation attempt
    INSERT INTO public.security_audit_log (
      action, user_id, success, error_message
    ) VALUES (
      'self_elevation_attempt', 
      requesting_user_id, 
      false, 
      'User attempted to elevate their own privileges'
    );
    RETURN FALSE;
  END IF;

  -- Update the role
  UPDATE public.user_roles 
  SET role = new_role 
  WHERE user_id = target_user_id;

  -- Log successful role change
  INSERT INTO public.security_audit_log (
    action, user_id, success, error_message
  ) VALUES (
    'role_change_success', 
    requesting_user_id, 
    true, 
    format('Changed user %s role from %s to %s', target_user_id, target_current_role, new_role)
  );

  RETURN TRUE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_points(p_user_id uuid, p_state_id uuid, p_points integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_total INTEGER := 0;
  new_level TEXT;
  new_level_number INTEGER;
BEGIN
  -- Buscar pontos atuais
  SELECT total_points INTO current_total 
  FROM public.user_levels 
  WHERE user_id = p_user_id AND state_id = p_state_id;
  
  -- Se não existe registro, criar
  IF current_total IS NULL THEN
    current_total := 0;
    INSERT INTO public.user_levels (user_id, state_id, total_points)
    VALUES (p_user_id, p_state_id, p_points);
  ELSE
    -- Atualizar pontos
    current_total := current_total + p_points;
    
    -- Determinar novo nível
    CASE 
      WHEN current_total >= 2000 THEN 
        new_level := 'Mestre';
        new_level_number := 5;
      WHEN current_total >= 1001 THEN 
        new_level := 'Aventureiro';
        new_level_number := 4;
      WHEN current_total >= 501 THEN 
        new_level := 'Viajante';
        new_level_number := 3;
      WHEN current_total >= 101 THEN 
        new_level := 'Explorador';
        new_level_number := 2;
      ELSE 
        new_level := 'Iniciante';
        new_level_number := 1;
    END CASE;
    
    UPDATE public.user_levels 
    SET 
      total_points = current_total,
      current_level = new_level,
      level_number = new_level_number,
      updated_at = now()
    WHERE user_id = p_user_id AND state_id = p_state_id;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_password_reset_token(token_hash text, user_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  target_user_id uuid;
  token_valid boolean := false;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if token exists and is not expired
  SELECT EXISTS(
    SELECT 1 FROM public.password_reset_tokens 
    WHERE user_id = target_user_id 
    AND token_hash = validate_password_reset_token.token_hash
    AND expires_at > now()
    AND used_at IS NULL
  ) INTO token_valid;
  
  -- Log validation attempt
  INSERT INTO public.security_audit_log (
    action,
    user_id,
    success
  ) VALUES (
    'password_reset_token_validation',
    target_user_id,
    token_valid
  );
  
  RETURN token_valid;
END;
$function$
;

grant delete on table "public"."ai_insights" to "anon";

grant insert on table "public"."ai_insights" to "anon";

grant references on table "public"."ai_insights" to "anon";

grant select on table "public"."ai_insights" to "anon";

grant trigger on table "public"."ai_insights" to "anon";

grant truncate on table "public"."ai_insights" to "anon";

grant update on table "public"."ai_insights" to "anon";

grant delete on table "public"."ai_insights" to "authenticated";

grant insert on table "public"."ai_insights" to "authenticated";

grant references on table "public"."ai_insights" to "authenticated";

grant select on table "public"."ai_insights" to "authenticated";

grant trigger on table "public"."ai_insights" to "authenticated";

grant truncate on table "public"."ai_insights" to "authenticated";

grant update on table "public"."ai_insights" to "authenticated";

grant delete on table "public"."ai_insights" to "service_role";

grant insert on table "public"."ai_insights" to "service_role";

grant references on table "public"."ai_insights" to "service_role";

grant select on table "public"."ai_insights" to "service_role";

grant trigger on table "public"."ai_insights" to "service_role";

grant truncate on table "public"."ai_insights" to "service_role";

grant update on table "public"."ai_insights" to "service_role";

grant delete on table "public"."ai_master_insights" to "anon";

grant insert on table "public"."ai_master_insights" to "anon";

grant references on table "public"."ai_master_insights" to "anon";

grant select on table "public"."ai_master_insights" to "anon";

grant trigger on table "public"."ai_master_insights" to "anon";

grant truncate on table "public"."ai_master_insights" to "anon";

grant update on table "public"."ai_master_insights" to "anon";

grant delete on table "public"."ai_master_insights" to "authenticated";

grant insert on table "public"."ai_master_insights" to "authenticated";

grant references on table "public"."ai_master_insights" to "authenticated";

grant select on table "public"."ai_master_insights" to "authenticated";

grant trigger on table "public"."ai_master_insights" to "authenticated";

grant truncate on table "public"."ai_master_insights" to "authenticated";

grant update on table "public"."ai_master_insights" to "authenticated";

grant delete on table "public"."ai_master_insights" to "service_role";

grant insert on table "public"."ai_master_insights" to "service_role";

grant references on table "public"."ai_master_insights" to "service_role";

grant select on table "public"."ai_master_insights" to "service_role";

grant trigger on table "public"."ai_master_insights" to "service_role";

grant truncate on table "public"."ai_master_insights" to "service_role";

grant update on table "public"."ai_master_insights" to "service_role";

grant delete on table "public"."attendant_timesheet" to "anon";

grant insert on table "public"."attendant_timesheet" to "anon";

grant references on table "public"."attendant_timesheet" to "anon";

grant select on table "public"."attendant_timesheet" to "anon";

grant trigger on table "public"."attendant_timesheet" to "anon";

grant truncate on table "public"."attendant_timesheet" to "anon";

grant update on table "public"."attendant_timesheet" to "anon";

grant delete on table "public"."attendant_timesheet" to "authenticated";

grant insert on table "public"."attendant_timesheet" to "authenticated";

grant references on table "public"."attendant_timesheet" to "authenticated";

grant select on table "public"."attendant_timesheet" to "authenticated";

grant trigger on table "public"."attendant_timesheet" to "authenticated";

grant truncate on table "public"."attendant_timesheet" to "authenticated";

grant update on table "public"."attendant_timesheet" to "authenticated";

grant delete on table "public"."attendant_timesheet" to "service_role";

grant insert on table "public"."attendant_timesheet" to "service_role";

grant references on table "public"."attendant_timesheet" to "service_role";

grant select on table "public"."attendant_timesheet" to "service_role";

grant trigger on table "public"."attendant_timesheet" to "service_role";

grant truncate on table "public"."attendant_timesheet" to "service_role";

grant update on table "public"."attendant_timesheet" to "service_role";

grant delete on table "public"."cat_checkins" to "anon";

grant insert on table "public"."cat_checkins" to "anon";

grant references on table "public"."cat_checkins" to "anon";

grant select on table "public"."cat_checkins" to "anon";

grant trigger on table "public"."cat_checkins" to "anon";

grant truncate on table "public"."cat_checkins" to "anon";

grant update on table "public"."cat_checkins" to "anon";

grant delete on table "public"."cat_checkins" to "authenticated";

grant insert on table "public"."cat_checkins" to "authenticated";

grant references on table "public"."cat_checkins" to "authenticated";

grant select on table "public"."cat_checkins" to "authenticated";

grant trigger on table "public"."cat_checkins" to "authenticated";

grant truncate on table "public"."cat_checkins" to "authenticated";

grant update on table "public"."cat_checkins" to "authenticated";

grant delete on table "public"."cat_checkins" to "service_role";

grant insert on table "public"."cat_checkins" to "service_role";

grant references on table "public"."cat_checkins" to "service_role";

grant select on table "public"."cat_checkins" to "service_role";

grant trigger on table "public"."cat_checkins" to "service_role";

grant truncate on table "public"."cat_checkins" to "service_role";

grant update on table "public"."cat_checkins" to "service_role";

grant delete on table "public"."cat_locations" to "anon";

grant insert on table "public"."cat_locations" to "anon";

grant references on table "public"."cat_locations" to "anon";

grant select on table "public"."cat_locations" to "anon";

grant trigger on table "public"."cat_locations" to "anon";

grant truncate on table "public"."cat_locations" to "anon";

grant update on table "public"."cat_locations" to "anon";

grant delete on table "public"."cat_locations" to "authenticated";

grant insert on table "public"."cat_locations" to "authenticated";

grant references on table "public"."cat_locations" to "authenticated";

grant select on table "public"."cat_locations" to "authenticated";

grant trigger on table "public"."cat_locations" to "authenticated";

grant truncate on table "public"."cat_locations" to "authenticated";

grant update on table "public"."cat_locations" to "authenticated";

grant delete on table "public"."cat_locations" to "service_role";

grant insert on table "public"."cat_locations" to "service_role";

grant references on table "public"."cat_locations" to "service_role";

grant select on table "public"."cat_locations" to "service_role";

grant trigger on table "public"."cat_locations" to "service_role";

grant truncate on table "public"."cat_locations" to "service_role";

grant update on table "public"."cat_locations" to "service_role";

grant delete on table "public"."cities" to "anon";

grant insert on table "public"."cities" to "anon";

grant references on table "public"."cities" to "anon";

grant select on table "public"."cities" to "anon";

grant trigger on table "public"."cities" to "anon";

grant truncate on table "public"."cities" to "anon";

grant update on table "public"."cities" to "anon";

grant delete on table "public"."cities" to "authenticated";

grant insert on table "public"."cities" to "authenticated";

grant references on table "public"."cities" to "authenticated";

grant select on table "public"."cities" to "authenticated";

grant trigger on table "public"."cities" to "authenticated";

grant truncate on table "public"."cities" to "authenticated";

grant update on table "public"."cities" to "authenticated";

grant delete on table "public"."cities" to "service_role";

grant insert on table "public"."cities" to "service_role";

grant references on table "public"."cities" to "service_role";

grant select on table "public"."cities" to "service_role";

grant trigger on table "public"."cities" to "service_role";

grant truncate on table "public"."cities" to "service_role";

grant update on table "public"."cities" to "service_role";

grant delete on table "public"."city_tour_bookings" to "anon";

grant insert on table "public"."city_tour_bookings" to "anon";

grant references on table "public"."city_tour_bookings" to "anon";

grant select on table "public"."city_tour_bookings" to "anon";

grant trigger on table "public"."city_tour_bookings" to "anon";

grant truncate on table "public"."city_tour_bookings" to "anon";

grant update on table "public"."city_tour_bookings" to "anon";

grant delete on table "public"."city_tour_bookings" to "authenticated";

grant insert on table "public"."city_tour_bookings" to "authenticated";

grant references on table "public"."city_tour_bookings" to "authenticated";

grant select on table "public"."city_tour_bookings" to "authenticated";

grant trigger on table "public"."city_tour_bookings" to "authenticated";

grant truncate on table "public"."city_tour_bookings" to "authenticated";

grant update on table "public"."city_tour_bookings" to "authenticated";

grant delete on table "public"."city_tour_bookings" to "service_role";

grant insert on table "public"."city_tour_bookings" to "service_role";

grant references on table "public"."city_tour_bookings" to "service_role";

grant select on table "public"."city_tour_bookings" to "service_role";

grant trigger on table "public"."city_tour_bookings" to "service_role";

grant truncate on table "public"."city_tour_bookings" to "service_role";

grant update on table "public"."city_tour_bookings" to "service_role";

grant delete on table "public"."city_tour_settings" to "anon";

grant insert on table "public"."city_tour_settings" to "anon";

grant references on table "public"."city_tour_settings" to "anon";

grant select on table "public"."city_tour_settings" to "anon";

grant trigger on table "public"."city_tour_settings" to "anon";

grant truncate on table "public"."city_tour_settings" to "anon";

grant update on table "public"."city_tour_settings" to "anon";

grant delete on table "public"."city_tour_settings" to "authenticated";

grant insert on table "public"."city_tour_settings" to "authenticated";

grant references on table "public"."city_tour_settings" to "authenticated";

grant select on table "public"."city_tour_settings" to "authenticated";

grant trigger on table "public"."city_tour_settings" to "authenticated";

grant truncate on table "public"."city_tour_settings" to "authenticated";

grant update on table "public"."city_tour_settings" to "authenticated";

grant delete on table "public"."city_tour_settings" to "service_role";

grant insert on table "public"."city_tour_settings" to "service_role";

grant references on table "public"."city_tour_settings" to "service_role";

grant select on table "public"."city_tour_settings" to "service_role";

grant trigger on table "public"."city_tour_settings" to "service_role";

grant truncate on table "public"."city_tour_settings" to "service_role";

grant update on table "public"."city_tour_settings" to "service_role";

grant delete on table "public"."content_audit_log" to "anon";

grant insert on table "public"."content_audit_log" to "anon";

grant references on table "public"."content_audit_log" to "anon";

grant select on table "public"."content_audit_log" to "anon";

grant trigger on table "public"."content_audit_log" to "anon";

grant truncate on table "public"."content_audit_log" to "anon";

grant update on table "public"."content_audit_log" to "anon";

grant delete on table "public"."content_audit_log" to "authenticated";

grant insert on table "public"."content_audit_log" to "authenticated";

grant references on table "public"."content_audit_log" to "authenticated";

grant select on table "public"."content_audit_log" to "authenticated";

grant trigger on table "public"."content_audit_log" to "authenticated";

grant truncate on table "public"."content_audit_log" to "authenticated";

grant update on table "public"."content_audit_log" to "authenticated";

grant delete on table "public"."content_audit_log" to "service_role";

grant insert on table "public"."content_audit_log" to "service_role";

grant references on table "public"."content_audit_log" to "service_role";

grant select on table "public"."content_audit_log" to "service_role";

grant trigger on table "public"."content_audit_log" to "service_role";

grant truncate on table "public"."content_audit_log" to "service_role";

grant update on table "public"."content_audit_log" to "service_role";

grant delete on table "public"."destination_details" to "anon";

grant insert on table "public"."destination_details" to "anon";

grant references on table "public"."destination_details" to "anon";

grant select on table "public"."destination_details" to "anon";

grant trigger on table "public"."destination_details" to "anon";

grant truncate on table "public"."destination_details" to "anon";

grant update on table "public"."destination_details" to "anon";

grant delete on table "public"."destination_details" to "authenticated";

grant insert on table "public"."destination_details" to "authenticated";

grant references on table "public"."destination_details" to "authenticated";

grant select on table "public"."destination_details" to "authenticated";

grant trigger on table "public"."destination_details" to "authenticated";

grant truncate on table "public"."destination_details" to "authenticated";

grant update on table "public"."destination_details" to "authenticated";

grant delete on table "public"."destination_details" to "service_role";

grant insert on table "public"."destination_details" to "service_role";

grant references on table "public"."destination_details" to "service_role";

grant select on table "public"."destination_details" to "service_role";

grant trigger on table "public"."destination_details" to "service_role";

grant truncate on table "public"."destination_details" to "service_role";

grant update on table "public"."destination_details" to "service_role";

grant delete on table "public"."destinations" to "anon";

grant insert on table "public"."destinations" to "anon";

grant references on table "public"."destinations" to "anon";

grant select on table "public"."destinations" to "anon";

grant trigger on table "public"."destinations" to "anon";

grant truncate on table "public"."destinations" to "anon";

grant update on table "public"."destinations" to "anon";

grant delete on table "public"."destinations" to "authenticated";

grant insert on table "public"."destinations" to "authenticated";

grant references on table "public"."destinations" to "authenticated";

grant select on table "public"."destinations" to "authenticated";

grant trigger on table "public"."destinations" to "authenticated";

grant truncate on table "public"."destinations" to "authenticated";

grant update on table "public"."destinations" to "authenticated";

grant delete on table "public"."destinations" to "service_role";

grant insert on table "public"."destinations" to "service_role";

grant references on table "public"."destinations" to "service_role";

grant select on table "public"."destinations" to "service_role";

grant trigger on table "public"."destinations" to "service_role";

grant truncate on table "public"."destinations" to "service_role";

grant update on table "public"."destinations" to "service_role";

grant delete on table "public"."event_details" to "anon";

grant insert on table "public"."event_details" to "anon";

grant references on table "public"."event_details" to "anon";

grant select on table "public"."event_details" to "anon";

grant trigger on table "public"."event_details" to "anon";

grant truncate on table "public"."event_details" to "anon";

grant update on table "public"."event_details" to "anon";

grant delete on table "public"."event_details" to "authenticated";

grant insert on table "public"."event_details" to "authenticated";

grant references on table "public"."event_details" to "authenticated";

grant select on table "public"."event_details" to "authenticated";

grant trigger on table "public"."event_details" to "authenticated";

grant truncate on table "public"."event_details" to "authenticated";

grant update on table "public"."event_details" to "authenticated";

grant delete on table "public"."event_details" to "service_role";

grant insert on table "public"."event_details" to "service_role";

grant references on table "public"."event_details" to "service_role";

grant select on table "public"."event_details" to "service_role";

grant trigger on table "public"."event_details" to "service_role";

grant truncate on table "public"."event_details" to "service_role";

grant update on table "public"."event_details" to "service_role";

grant delete on table "public"."events" to "anon";

grant insert on table "public"."events" to "anon";

grant references on table "public"."events" to "anon";

grant select on table "public"."events" to "anon";

grant trigger on table "public"."events" to "anon";

grant truncate on table "public"."events" to "anon";

grant update on table "public"."events" to "anon";

grant delete on table "public"."events" to "authenticated";

grant insert on table "public"."events" to "authenticated";

grant references on table "public"."events" to "authenticated";

grant select on table "public"."events" to "authenticated";

grant trigger on table "public"."events" to "authenticated";

grant truncate on table "public"."events" to "authenticated";

grant update on table "public"."events" to "authenticated";

grant delete on table "public"."events" to "service_role";

grant insert on table "public"."events" to "service_role";

grant references on table "public"."events" to "service_role";

grant select on table "public"."events" to "service_role";

grant trigger on table "public"."events" to "service_role";

grant truncate on table "public"."events" to "service_role";

grant update on table "public"."events" to "service_role";

grant delete on table "public"."flowtrip_clients" to "anon";

grant insert on table "public"."flowtrip_clients" to "anon";

grant references on table "public"."flowtrip_clients" to "anon";

grant select on table "public"."flowtrip_clients" to "anon";

grant trigger on table "public"."flowtrip_clients" to "anon";

grant truncate on table "public"."flowtrip_clients" to "anon";

grant update on table "public"."flowtrip_clients" to "anon";

grant delete on table "public"."flowtrip_clients" to "authenticated";

grant insert on table "public"."flowtrip_clients" to "authenticated";

grant references on table "public"."flowtrip_clients" to "authenticated";

grant select on table "public"."flowtrip_clients" to "authenticated";

grant trigger on table "public"."flowtrip_clients" to "authenticated";

grant truncate on table "public"."flowtrip_clients" to "authenticated";

grant update on table "public"."flowtrip_clients" to "authenticated";

grant delete on table "public"."flowtrip_clients" to "service_role";

grant insert on table "public"."flowtrip_clients" to "service_role";

grant references on table "public"."flowtrip_clients" to "service_role";

grant select on table "public"."flowtrip_clients" to "service_role";

grant trigger on table "public"."flowtrip_clients" to "service_role";

grant truncate on table "public"."flowtrip_clients" to "service_role";

grant update on table "public"."flowtrip_clients" to "service_role";

grant delete on table "public"."flowtrip_invoices" to "anon";

grant insert on table "public"."flowtrip_invoices" to "anon";

grant references on table "public"."flowtrip_invoices" to "anon";

grant select on table "public"."flowtrip_invoices" to "anon";

grant trigger on table "public"."flowtrip_invoices" to "anon";

grant truncate on table "public"."flowtrip_invoices" to "anon";

grant update on table "public"."flowtrip_invoices" to "anon";

grant delete on table "public"."flowtrip_invoices" to "authenticated";

grant insert on table "public"."flowtrip_invoices" to "authenticated";

grant references on table "public"."flowtrip_invoices" to "authenticated";

grant select on table "public"."flowtrip_invoices" to "authenticated";

grant trigger on table "public"."flowtrip_invoices" to "authenticated";

grant truncate on table "public"."flowtrip_invoices" to "authenticated";

grant update on table "public"."flowtrip_invoices" to "authenticated";

grant delete on table "public"."flowtrip_invoices" to "service_role";

grant insert on table "public"."flowtrip_invoices" to "service_role";

grant references on table "public"."flowtrip_invoices" to "service_role";

grant select on table "public"."flowtrip_invoices" to "service_role";

grant trigger on table "public"."flowtrip_invoices" to "service_role";

grant truncate on table "public"."flowtrip_invoices" to "service_role";

grant update on table "public"."flowtrip_invoices" to "service_role";

grant delete on table "public"."flowtrip_master_config" to "anon";

grant insert on table "public"."flowtrip_master_config" to "anon";

grant references on table "public"."flowtrip_master_config" to "anon";

grant select on table "public"."flowtrip_master_config" to "anon";

grant trigger on table "public"."flowtrip_master_config" to "anon";

grant truncate on table "public"."flowtrip_master_config" to "anon";

grant update on table "public"."flowtrip_master_config" to "anon";

grant delete on table "public"."flowtrip_master_config" to "authenticated";

grant insert on table "public"."flowtrip_master_config" to "authenticated";

grant references on table "public"."flowtrip_master_config" to "authenticated";

grant select on table "public"."flowtrip_master_config" to "authenticated";

grant trigger on table "public"."flowtrip_master_config" to "authenticated";

grant truncate on table "public"."flowtrip_master_config" to "authenticated";

grant update on table "public"."flowtrip_master_config" to "authenticated";

grant delete on table "public"."flowtrip_master_config" to "service_role";

grant insert on table "public"."flowtrip_master_config" to "service_role";

grant references on table "public"."flowtrip_master_config" to "service_role";

grant select on table "public"."flowtrip_master_config" to "service_role";

grant trigger on table "public"."flowtrip_master_config" to "service_role";

grant truncate on table "public"."flowtrip_master_config" to "service_role";

grant update on table "public"."flowtrip_master_config" to "service_role";

grant delete on table "public"."flowtrip_onboarding_steps" to "anon";

grant insert on table "public"."flowtrip_onboarding_steps" to "anon";

grant references on table "public"."flowtrip_onboarding_steps" to "anon";

grant select on table "public"."flowtrip_onboarding_steps" to "anon";

grant trigger on table "public"."flowtrip_onboarding_steps" to "anon";

grant truncate on table "public"."flowtrip_onboarding_steps" to "anon";

grant update on table "public"."flowtrip_onboarding_steps" to "anon";

grant delete on table "public"."flowtrip_onboarding_steps" to "authenticated";

grant insert on table "public"."flowtrip_onboarding_steps" to "authenticated";

grant references on table "public"."flowtrip_onboarding_steps" to "authenticated";

grant select on table "public"."flowtrip_onboarding_steps" to "authenticated";

grant trigger on table "public"."flowtrip_onboarding_steps" to "authenticated";

grant truncate on table "public"."flowtrip_onboarding_steps" to "authenticated";

grant update on table "public"."flowtrip_onboarding_steps" to "authenticated";

grant delete on table "public"."flowtrip_onboarding_steps" to "service_role";

grant insert on table "public"."flowtrip_onboarding_steps" to "service_role";

grant references on table "public"."flowtrip_onboarding_steps" to "service_role";

grant select on table "public"."flowtrip_onboarding_steps" to "service_role";

grant trigger on table "public"."flowtrip_onboarding_steps" to "service_role";

grant truncate on table "public"."flowtrip_onboarding_steps" to "service_role";

grant update on table "public"."flowtrip_onboarding_steps" to "service_role";

grant delete on table "public"."flowtrip_state_features" to "anon";

grant insert on table "public"."flowtrip_state_features" to "anon";

grant references on table "public"."flowtrip_state_features" to "anon";

grant select on table "public"."flowtrip_state_features" to "anon";

grant trigger on table "public"."flowtrip_state_features" to "anon";

grant truncate on table "public"."flowtrip_state_features" to "anon";

grant update on table "public"."flowtrip_state_features" to "anon";

grant delete on table "public"."flowtrip_state_features" to "authenticated";

grant insert on table "public"."flowtrip_state_features" to "authenticated";

grant references on table "public"."flowtrip_state_features" to "authenticated";

grant select on table "public"."flowtrip_state_features" to "authenticated";

grant trigger on table "public"."flowtrip_state_features" to "authenticated";

grant truncate on table "public"."flowtrip_state_features" to "authenticated";

grant update on table "public"."flowtrip_state_features" to "authenticated";

grant delete on table "public"."flowtrip_state_features" to "service_role";

grant insert on table "public"."flowtrip_state_features" to "service_role";

grant references on table "public"."flowtrip_state_features" to "service_role";

grant select on table "public"."flowtrip_state_features" to "service_role";

grant trigger on table "public"."flowtrip_state_features" to "service_role";

grant truncate on table "public"."flowtrip_state_features" to "service_role";

grant update on table "public"."flowtrip_state_features" to "service_role";

grant delete on table "public"."flowtrip_states" to "anon";

grant insert on table "public"."flowtrip_states" to "anon";

grant references on table "public"."flowtrip_states" to "anon";

grant select on table "public"."flowtrip_states" to "anon";

grant trigger on table "public"."flowtrip_states" to "anon";

grant truncate on table "public"."flowtrip_states" to "anon";

grant update on table "public"."flowtrip_states" to "anon";

grant delete on table "public"."flowtrip_states" to "authenticated";

grant insert on table "public"."flowtrip_states" to "authenticated";

grant references on table "public"."flowtrip_states" to "authenticated";

grant select on table "public"."flowtrip_states" to "authenticated";

grant trigger on table "public"."flowtrip_states" to "authenticated";

grant truncate on table "public"."flowtrip_states" to "authenticated";

grant update on table "public"."flowtrip_states" to "authenticated";

grant delete on table "public"."flowtrip_states" to "service_role";

grant insert on table "public"."flowtrip_states" to "service_role";

grant references on table "public"."flowtrip_states" to "service_role";

grant select on table "public"."flowtrip_states" to "service_role";

grant trigger on table "public"."flowtrip_states" to "service_role";

grant truncate on table "public"."flowtrip_states" to "service_role";

grant update on table "public"."flowtrip_states" to "service_role";

grant delete on table "public"."flowtrip_subscriptions" to "anon";

grant insert on table "public"."flowtrip_subscriptions" to "anon";

grant references on table "public"."flowtrip_subscriptions" to "anon";

grant select on table "public"."flowtrip_subscriptions" to "anon";

grant trigger on table "public"."flowtrip_subscriptions" to "anon";

grant truncate on table "public"."flowtrip_subscriptions" to "anon";

grant update on table "public"."flowtrip_subscriptions" to "anon";

grant delete on table "public"."flowtrip_subscriptions" to "authenticated";

grant insert on table "public"."flowtrip_subscriptions" to "authenticated";

grant references on table "public"."flowtrip_subscriptions" to "authenticated";

grant select on table "public"."flowtrip_subscriptions" to "authenticated";

grant trigger on table "public"."flowtrip_subscriptions" to "authenticated";

grant truncate on table "public"."flowtrip_subscriptions" to "authenticated";

grant update on table "public"."flowtrip_subscriptions" to "authenticated";

grant delete on table "public"."flowtrip_subscriptions" to "service_role";

grant insert on table "public"."flowtrip_subscriptions" to "service_role";

grant references on table "public"."flowtrip_subscriptions" to "service_role";

grant select on table "public"."flowtrip_subscriptions" to "service_role";

grant trigger on table "public"."flowtrip_subscriptions" to "service_role";

grant truncate on table "public"."flowtrip_subscriptions" to "service_role";

grant update on table "public"."flowtrip_subscriptions" to "service_role";

grant delete on table "public"."flowtrip_support_tickets" to "anon";

grant insert on table "public"."flowtrip_support_tickets" to "anon";

grant references on table "public"."flowtrip_support_tickets" to "anon";

grant select on table "public"."flowtrip_support_tickets" to "anon";

grant trigger on table "public"."flowtrip_support_tickets" to "anon";

grant truncate on table "public"."flowtrip_support_tickets" to "anon";

grant update on table "public"."flowtrip_support_tickets" to "anon";

grant delete on table "public"."flowtrip_support_tickets" to "authenticated";

grant insert on table "public"."flowtrip_support_tickets" to "authenticated";

grant references on table "public"."flowtrip_support_tickets" to "authenticated";

grant select on table "public"."flowtrip_support_tickets" to "authenticated";

grant trigger on table "public"."flowtrip_support_tickets" to "authenticated";

grant truncate on table "public"."flowtrip_support_tickets" to "authenticated";

grant update on table "public"."flowtrip_support_tickets" to "authenticated";

grant delete on table "public"."flowtrip_support_tickets" to "service_role";

grant insert on table "public"."flowtrip_support_tickets" to "service_role";

grant references on table "public"."flowtrip_support_tickets" to "service_role";

grant select on table "public"."flowtrip_support_tickets" to "service_role";

grant trigger on table "public"."flowtrip_support_tickets" to "service_role";

grant truncate on table "public"."flowtrip_support_tickets" to "service_role";

grant update on table "public"."flowtrip_support_tickets" to "service_role";

grant delete on table "public"."flowtrip_usage_metrics" to "anon";

grant insert on table "public"."flowtrip_usage_metrics" to "anon";

grant references on table "public"."flowtrip_usage_metrics" to "anon";

grant select on table "public"."flowtrip_usage_metrics" to "anon";

grant trigger on table "public"."flowtrip_usage_metrics" to "anon";

grant truncate on table "public"."flowtrip_usage_metrics" to "anon";

grant update on table "public"."flowtrip_usage_metrics" to "anon";

grant delete on table "public"."flowtrip_usage_metrics" to "authenticated";

grant insert on table "public"."flowtrip_usage_metrics" to "authenticated";

grant references on table "public"."flowtrip_usage_metrics" to "authenticated";

grant select on table "public"."flowtrip_usage_metrics" to "authenticated";

grant trigger on table "public"."flowtrip_usage_metrics" to "authenticated";

grant truncate on table "public"."flowtrip_usage_metrics" to "authenticated";

grant update on table "public"."flowtrip_usage_metrics" to "authenticated";

grant delete on table "public"."flowtrip_usage_metrics" to "service_role";

grant insert on table "public"."flowtrip_usage_metrics" to "service_role";

grant references on table "public"."flowtrip_usage_metrics" to "service_role";

grant select on table "public"."flowtrip_usage_metrics" to "service_role";

grant trigger on table "public"."flowtrip_usage_metrics" to "service_role";

grant truncate on table "public"."flowtrip_usage_metrics" to "service_role";

grant update on table "public"."flowtrip_usage_metrics" to "service_role";

grant delete on table "public"."flowtrip_white_label_configs" to "anon";

grant insert on table "public"."flowtrip_white_label_configs" to "anon";

grant references on table "public"."flowtrip_white_label_configs" to "anon";

grant select on table "public"."flowtrip_white_label_configs" to "anon";

grant trigger on table "public"."flowtrip_white_label_configs" to "anon";

grant truncate on table "public"."flowtrip_white_label_configs" to "anon";

grant update on table "public"."flowtrip_white_label_configs" to "anon";

grant delete on table "public"."flowtrip_white_label_configs" to "authenticated";

grant insert on table "public"."flowtrip_white_label_configs" to "authenticated";

grant references on table "public"."flowtrip_white_label_configs" to "authenticated";

grant select on table "public"."flowtrip_white_label_configs" to "authenticated";

grant trigger on table "public"."flowtrip_white_label_configs" to "authenticated";

grant truncate on table "public"."flowtrip_white_label_configs" to "authenticated";

grant update on table "public"."flowtrip_white_label_configs" to "authenticated";

grant delete on table "public"."flowtrip_white_label_configs" to "service_role";

grant insert on table "public"."flowtrip_white_label_configs" to "service_role";

grant references on table "public"."flowtrip_white_label_configs" to "service_role";

grant select on table "public"."flowtrip_white_label_configs" to "service_role";

grant trigger on table "public"."flowtrip_white_label_configs" to "service_role";

grant truncate on table "public"."flowtrip_white_label_configs" to "service_role";

grant update on table "public"."flowtrip_white_label_configs" to "service_role";

grant delete on table "public"."institutional_content" to "anon";

grant insert on table "public"."institutional_content" to "anon";

grant references on table "public"."institutional_content" to "anon";

grant select on table "public"."institutional_content" to "anon";

grant trigger on table "public"."institutional_content" to "anon";

grant truncate on table "public"."institutional_content" to "anon";

grant update on table "public"."institutional_content" to "anon";

grant delete on table "public"."institutional_content" to "authenticated";

grant insert on table "public"."institutional_content" to "authenticated";

grant references on table "public"."institutional_content" to "authenticated";

grant select on table "public"."institutional_content" to "authenticated";

grant trigger on table "public"."institutional_content" to "authenticated";

grant truncate on table "public"."institutional_content" to "authenticated";

grant update on table "public"."institutional_content" to "authenticated";

grant delete on table "public"."institutional_content" to "service_role";

grant insert on table "public"."institutional_content" to "service_role";

grant references on table "public"."institutional_content" to "service_role";

grant select on table "public"."institutional_content" to "service_role";

grant trigger on table "public"."institutional_content" to "service_role";

grant truncate on table "public"."institutional_content" to "service_role";

grant update on table "public"."institutional_content" to "service_role";

grant delete on table "public"."institutional_partners" to "anon";

grant insert on table "public"."institutional_partners" to "anon";

grant references on table "public"."institutional_partners" to "anon";

grant select on table "public"."institutional_partners" to "anon";

grant trigger on table "public"."institutional_partners" to "anon";

grant truncate on table "public"."institutional_partners" to "anon";

grant update on table "public"."institutional_partners" to "anon";

grant delete on table "public"."institutional_partners" to "authenticated";

grant insert on table "public"."institutional_partners" to "authenticated";

grant references on table "public"."institutional_partners" to "authenticated";

grant select on table "public"."institutional_partners" to "authenticated";

grant trigger on table "public"."institutional_partners" to "authenticated";

grant truncate on table "public"."institutional_partners" to "authenticated";

grant update on table "public"."institutional_partners" to "authenticated";

grant delete on table "public"."institutional_partners" to "service_role";

grant insert on table "public"."institutional_partners" to "service_role";

grant references on table "public"."institutional_partners" to "service_role";

grant select on table "public"."institutional_partners" to "service_role";

grant trigger on table "public"."institutional_partners" to "service_role";

grant truncate on table "public"."institutional_partners" to "service_role";

grant update on table "public"."institutional_partners" to "service_role";

grant delete on table "public"."institutional_surveys" to "anon";

grant insert on table "public"."institutional_surveys" to "anon";

grant references on table "public"."institutional_surveys" to "anon";

grant select on table "public"."institutional_surveys" to "anon";

grant trigger on table "public"."institutional_surveys" to "anon";

grant truncate on table "public"."institutional_surveys" to "anon";

grant update on table "public"."institutional_surveys" to "anon";

grant delete on table "public"."institutional_surveys" to "authenticated";

grant insert on table "public"."institutional_surveys" to "authenticated";

grant references on table "public"."institutional_surveys" to "authenticated";

grant select on table "public"."institutional_surveys" to "authenticated";

grant trigger on table "public"."institutional_surveys" to "authenticated";

grant truncate on table "public"."institutional_surveys" to "authenticated";

grant update on table "public"."institutional_surveys" to "authenticated";

grant delete on table "public"."institutional_surveys" to "service_role";

grant insert on table "public"."institutional_surveys" to "service_role";

grant references on table "public"."institutional_surveys" to "service_role";

grant select on table "public"."institutional_surveys" to "service_role";

grant trigger on table "public"."institutional_surveys" to "service_role";

grant truncate on table "public"."institutional_surveys" to "service_role";

grant update on table "public"."institutional_surveys" to "service_role";

grant delete on table "public"."knowledge_base_entries" to "anon";

grant insert on table "public"."knowledge_base_entries" to "anon";

grant references on table "public"."knowledge_base_entries" to "anon";

grant select on table "public"."knowledge_base_entries" to "anon";

grant trigger on table "public"."knowledge_base_entries" to "anon";

grant truncate on table "public"."knowledge_base_entries" to "anon";

grant update on table "public"."knowledge_base_entries" to "anon";

grant delete on table "public"."knowledge_base_entries" to "authenticated";

grant insert on table "public"."knowledge_base_entries" to "authenticated";

grant references on table "public"."knowledge_base_entries" to "authenticated";

grant select on table "public"."knowledge_base_entries" to "authenticated";

grant trigger on table "public"."knowledge_base_entries" to "authenticated";

grant truncate on table "public"."knowledge_base_entries" to "authenticated";

grant update on table "public"."knowledge_base_entries" to "authenticated";

grant delete on table "public"."knowledge_base_entries" to "service_role";

grant insert on table "public"."knowledge_base_entries" to "service_role";

grant references on table "public"."knowledge_base_entries" to "service_role";

grant select on table "public"."knowledge_base_entries" to "service_role";

grant trigger on table "public"."knowledge_base_entries" to "service_role";

grant truncate on table "public"."knowledge_base_entries" to "service_role";

grant update on table "public"."knowledge_base_entries" to "service_role";

grant delete on table "public"."municipal_collaborators" to "anon";

grant insert on table "public"."municipal_collaborators" to "anon";

grant references on table "public"."municipal_collaborators" to "anon";

grant select on table "public"."municipal_collaborators" to "anon";

grant trigger on table "public"."municipal_collaborators" to "anon";

grant truncate on table "public"."municipal_collaborators" to "anon";

grant update on table "public"."municipal_collaborators" to "anon";

grant delete on table "public"."municipal_collaborators" to "authenticated";

grant insert on table "public"."municipal_collaborators" to "authenticated";

grant references on table "public"."municipal_collaborators" to "authenticated";

grant select on table "public"."municipal_collaborators" to "authenticated";

grant trigger on table "public"."municipal_collaborators" to "authenticated";

grant truncate on table "public"."municipal_collaborators" to "authenticated";

grant update on table "public"."municipal_collaborators" to "authenticated";

grant delete on table "public"."municipal_collaborators" to "service_role";

grant insert on table "public"."municipal_collaborators" to "service_role";

grant references on table "public"."municipal_collaborators" to "service_role";

grant select on table "public"."municipal_collaborators" to "service_role";

grant trigger on table "public"."municipal_collaborators" to "service_role";

grant truncate on table "public"."municipal_collaborators" to "service_role";

grant update on table "public"."municipal_collaborators" to "service_role";

grant delete on table "public"."passport_stamps" to "anon";

grant insert on table "public"."passport_stamps" to "anon";

grant references on table "public"."passport_stamps" to "anon";

grant select on table "public"."passport_stamps" to "anon";

grant trigger on table "public"."passport_stamps" to "anon";

grant truncate on table "public"."passport_stamps" to "anon";

grant update on table "public"."passport_stamps" to "anon";

grant delete on table "public"."passport_stamps" to "authenticated";

grant insert on table "public"."passport_stamps" to "authenticated";

grant references on table "public"."passport_stamps" to "authenticated";

grant select on table "public"."passport_stamps" to "authenticated";

grant trigger on table "public"."passport_stamps" to "authenticated";

grant truncate on table "public"."passport_stamps" to "authenticated";

grant update on table "public"."passport_stamps" to "authenticated";

grant delete on table "public"."passport_stamps" to "service_role";

grant insert on table "public"."passport_stamps" to "service_role";

grant references on table "public"."passport_stamps" to "service_role";

grant select on table "public"."passport_stamps" to "service_role";

grant trigger on table "public"."passport_stamps" to "service_role";

grant truncate on table "public"."passport_stamps" to "service_role";

grant update on table "public"."passport_stamps" to "service_role";

grant delete on table "public"."password_reset_tokens" to "anon";

grant insert on table "public"."password_reset_tokens" to "anon";

grant references on table "public"."password_reset_tokens" to "anon";

grant select on table "public"."password_reset_tokens" to "anon";

grant trigger on table "public"."password_reset_tokens" to "anon";

grant truncate on table "public"."password_reset_tokens" to "anon";

grant update on table "public"."password_reset_tokens" to "anon";

grant delete on table "public"."password_reset_tokens" to "authenticated";

grant insert on table "public"."password_reset_tokens" to "authenticated";

grant references on table "public"."password_reset_tokens" to "authenticated";

grant select on table "public"."password_reset_tokens" to "authenticated";

grant trigger on table "public"."password_reset_tokens" to "authenticated";

grant truncate on table "public"."password_reset_tokens" to "authenticated";

grant update on table "public"."password_reset_tokens" to "authenticated";

grant delete on table "public"."password_reset_tokens" to "service_role";

grant insert on table "public"."password_reset_tokens" to "service_role";

grant references on table "public"."password_reset_tokens" to "service_role";

grant select on table "public"."password_reset_tokens" to "service_role";

grant trigger on table "public"."password_reset_tokens" to "service_role";

grant truncate on table "public"."password_reset_tokens" to "service_role";

grant update on table "public"."password_reset_tokens" to "service_role";

grant delete on table "public"."regions" to "anon";

grant insert on table "public"."regions" to "anon";

grant references on table "public"."regions" to "anon";

grant select on table "public"."regions" to "anon";

grant trigger on table "public"."regions" to "anon";

grant truncate on table "public"."regions" to "anon";

grant update on table "public"."regions" to "anon";

grant delete on table "public"."regions" to "authenticated";

grant insert on table "public"."regions" to "authenticated";

grant references on table "public"."regions" to "authenticated";

grant select on table "public"."regions" to "authenticated";

grant trigger on table "public"."regions" to "authenticated";

grant truncate on table "public"."regions" to "authenticated";

grant update on table "public"."regions" to "authenticated";

grant delete on table "public"."regions" to "service_role";

grant insert on table "public"."regions" to "service_role";

grant references on table "public"."regions" to "service_role";

grant select on table "public"."regions" to "service_role";

grant trigger on table "public"."regions" to "service_role";

grant truncate on table "public"."regions" to "service_role";

grant update on table "public"."regions" to "service_role";

grant delete on table "public"."route_checkpoints" to "anon";

grant insert on table "public"."route_checkpoints" to "anon";

grant references on table "public"."route_checkpoints" to "anon";

grant select on table "public"."route_checkpoints" to "anon";

grant trigger on table "public"."route_checkpoints" to "anon";

grant truncate on table "public"."route_checkpoints" to "anon";

grant update on table "public"."route_checkpoints" to "anon";

grant delete on table "public"."route_checkpoints" to "authenticated";

grant insert on table "public"."route_checkpoints" to "authenticated";

grant references on table "public"."route_checkpoints" to "authenticated";

grant select on table "public"."route_checkpoints" to "authenticated";

grant trigger on table "public"."route_checkpoints" to "authenticated";

grant truncate on table "public"."route_checkpoints" to "authenticated";

grant update on table "public"."route_checkpoints" to "authenticated";

grant delete on table "public"."route_checkpoints" to "service_role";

grant insert on table "public"."route_checkpoints" to "service_role";

grant references on table "public"."route_checkpoints" to "service_role";

grant select on table "public"."route_checkpoints" to "service_role";

grant trigger on table "public"."route_checkpoints" to "service_role";

grant truncate on table "public"."route_checkpoints" to "service_role";

grant update on table "public"."route_checkpoints" to "service_role";

grant delete on table "public"."routes" to "anon";

grant insert on table "public"."routes" to "anon";

grant references on table "public"."routes" to "anon";

grant select on table "public"."routes" to "anon";

grant trigger on table "public"."routes" to "anon";

grant truncate on table "public"."routes" to "anon";

grant update on table "public"."routes" to "anon";

grant delete on table "public"."routes" to "authenticated";

grant insert on table "public"."routes" to "authenticated";

grant references on table "public"."routes" to "authenticated";

grant select on table "public"."routes" to "authenticated";

grant trigger on table "public"."routes" to "authenticated";

grant truncate on table "public"."routes" to "authenticated";

grant update on table "public"."routes" to "authenticated";

grant delete on table "public"."routes" to "service_role";

grant insert on table "public"."routes" to "service_role";

grant references on table "public"."routes" to "service_role";

grant select on table "public"."routes" to "service_role";

grant trigger on table "public"."routes" to "service_role";

grant truncate on table "public"."routes" to "service_role";

grant update on table "public"."routes" to "service_role";

grant delete on table "public"."secretary_files" to "anon";

grant insert on table "public"."secretary_files" to "anon";

grant references on table "public"."secretary_files" to "anon";

grant select on table "public"."secretary_files" to "anon";

grant trigger on table "public"."secretary_files" to "anon";

grant truncate on table "public"."secretary_files" to "anon";

grant update on table "public"."secretary_files" to "anon";

grant delete on table "public"."secretary_files" to "authenticated";

grant insert on table "public"."secretary_files" to "authenticated";

grant references on table "public"."secretary_files" to "authenticated";

grant select on table "public"."secretary_files" to "authenticated";

grant trigger on table "public"."secretary_files" to "authenticated";

grant truncate on table "public"."secretary_files" to "authenticated";

grant update on table "public"."secretary_files" to "authenticated";

grant delete on table "public"."secretary_files" to "service_role";

grant insert on table "public"."secretary_files" to "service_role";

grant references on table "public"."secretary_files" to "service_role";

grant select on table "public"."secretary_files" to "service_role";

grant trigger on table "public"."secretary_files" to "service_role";

grant truncate on table "public"."secretary_files" to "service_role";

grant update on table "public"."secretary_files" to "service_role";

grant delete on table "public"."security_audit_log" to "anon";

grant insert on table "public"."security_audit_log" to "anon";

grant references on table "public"."security_audit_log" to "anon";

grant select on table "public"."security_audit_log" to "anon";

grant trigger on table "public"."security_audit_log" to "anon";

grant truncate on table "public"."security_audit_log" to "anon";

grant update on table "public"."security_audit_log" to "anon";

grant delete on table "public"."security_audit_log" to "authenticated";

grant insert on table "public"."security_audit_log" to "authenticated";

grant references on table "public"."security_audit_log" to "authenticated";

grant select on table "public"."security_audit_log" to "authenticated";

grant trigger on table "public"."security_audit_log" to "authenticated";

grant truncate on table "public"."security_audit_log" to "authenticated";

grant update on table "public"."security_audit_log" to "authenticated";

grant delete on table "public"."security_audit_log" to "service_role";

grant insert on table "public"."security_audit_log" to "service_role";

grant references on table "public"."security_audit_log" to "service_role";

grant select on table "public"."security_audit_log" to "service_role";

grant trigger on table "public"."security_audit_log" to "service_role";

grant truncate on table "public"."security_audit_log" to "service_role";

grant update on table "public"."security_audit_log" to "service_role";

grant delete on table "public"."states" to "anon";

grant insert on table "public"."states" to "anon";

grant references on table "public"."states" to "anon";

grant select on table "public"."states" to "anon";

grant trigger on table "public"."states" to "anon";

grant truncate on table "public"."states" to "anon";

grant update on table "public"."states" to "anon";

grant delete on table "public"."states" to "authenticated";

grant insert on table "public"."states" to "authenticated";

grant references on table "public"."states" to "authenticated";

grant select on table "public"."states" to "authenticated";

grant trigger on table "public"."states" to "authenticated";

grant truncate on table "public"."states" to "authenticated";

grant update on table "public"."states" to "authenticated";

grant delete on table "public"."states" to "service_role";

grant insert on table "public"."states" to "service_role";

grant references on table "public"."states" to "service_role";

grant select on table "public"."states" to "service_role";

grant trigger on table "public"."states" to "service_role";

grant truncate on table "public"."states" to "service_role";

grant update on table "public"."states" to "service_role";

grant delete on table "public"."survey_responses" to "anon";

grant insert on table "public"."survey_responses" to "anon";

grant references on table "public"."survey_responses" to "anon";

grant select on table "public"."survey_responses" to "anon";

grant trigger on table "public"."survey_responses" to "anon";

grant truncate on table "public"."survey_responses" to "anon";

grant update on table "public"."survey_responses" to "anon";

grant delete on table "public"."survey_responses" to "authenticated";

grant insert on table "public"."survey_responses" to "authenticated";

grant references on table "public"."survey_responses" to "authenticated";

grant select on table "public"."survey_responses" to "authenticated";

grant trigger on table "public"."survey_responses" to "authenticated";

grant truncate on table "public"."survey_responses" to "authenticated";

grant update on table "public"."survey_responses" to "authenticated";

grant delete on table "public"."survey_responses" to "service_role";

grant insert on table "public"."survey_responses" to "service_role";

grant references on table "public"."survey_responses" to "service_role";

grant select on table "public"."survey_responses" to "service_role";

grant trigger on table "public"."survey_responses" to "service_role";

grant truncate on table "public"."survey_responses" to "service_role";

grant update on table "public"."survey_responses" to "service_role";

grant delete on table "public"."tourism_intelligence_documents" to "anon";

grant insert on table "public"."tourism_intelligence_documents" to "anon";

grant references on table "public"."tourism_intelligence_documents" to "anon";

grant select on table "public"."tourism_intelligence_documents" to "anon";

grant trigger on table "public"."tourism_intelligence_documents" to "anon";

grant truncate on table "public"."tourism_intelligence_documents" to "anon";

grant update on table "public"."tourism_intelligence_documents" to "anon";

grant delete on table "public"."tourism_intelligence_documents" to "authenticated";

grant insert on table "public"."tourism_intelligence_documents" to "authenticated";

grant references on table "public"."tourism_intelligence_documents" to "authenticated";

grant select on table "public"."tourism_intelligence_documents" to "authenticated";

grant trigger on table "public"."tourism_intelligence_documents" to "authenticated";

grant truncate on table "public"."tourism_intelligence_documents" to "authenticated";

grant update on table "public"."tourism_intelligence_documents" to "authenticated";

grant delete on table "public"."tourism_intelligence_documents" to "service_role";

grant insert on table "public"."tourism_intelligence_documents" to "service_role";

grant references on table "public"."tourism_intelligence_documents" to "service_role";

grant select on table "public"."tourism_intelligence_documents" to "service_role";

grant trigger on table "public"."tourism_intelligence_documents" to "service_role";

grant truncate on table "public"."tourism_intelligence_documents" to "service_role";

grant update on table "public"."tourism_intelligence_documents" to "service_role";

grant delete on table "public"."tourist_regions" to "anon";

grant insert on table "public"."tourist_regions" to "anon";

grant references on table "public"."tourist_regions" to "anon";

grant select on table "public"."tourist_regions" to "anon";

grant trigger on table "public"."tourist_regions" to "anon";

grant truncate on table "public"."tourist_regions" to "anon";

grant update on table "public"."tourist_regions" to "anon";

grant delete on table "public"."tourist_regions" to "authenticated";

grant insert on table "public"."tourist_regions" to "authenticated";

grant references on table "public"."tourist_regions" to "authenticated";

grant select on table "public"."tourist_regions" to "authenticated";

grant trigger on table "public"."tourist_regions" to "authenticated";

grant truncate on table "public"."tourist_regions" to "authenticated";

grant update on table "public"."tourist_regions" to "authenticated";

grant delete on table "public"."tourist_regions" to "service_role";

grant insert on table "public"."tourist_regions" to "service_role";

grant references on table "public"."tourist_regions" to "service_role";

grant select on table "public"."tourist_regions" to "service_role";

grant trigger on table "public"."tourist_regions" to "service_role";

grant truncate on table "public"."tourist_regions" to "service_role";

grant update on table "public"."tourist_regions" to "service_role";

grant delete on table "public"."user_achievements" to "anon";

grant insert on table "public"."user_achievements" to "anon";

grant references on table "public"."user_achievements" to "anon";

grant select on table "public"."user_achievements" to "anon";

grant trigger on table "public"."user_achievements" to "anon";

grant truncate on table "public"."user_achievements" to "anon";

grant update on table "public"."user_achievements" to "anon";

grant delete on table "public"."user_achievements" to "authenticated";

grant insert on table "public"."user_achievements" to "authenticated";

grant references on table "public"."user_achievements" to "authenticated";

grant select on table "public"."user_achievements" to "authenticated";

grant trigger on table "public"."user_achievements" to "authenticated";

grant truncate on table "public"."user_achievements" to "authenticated";

grant update on table "public"."user_achievements" to "authenticated";

grant delete on table "public"."user_achievements" to "service_role";

grant insert on table "public"."user_achievements" to "service_role";

grant references on table "public"."user_achievements" to "service_role";

grant select on table "public"."user_achievements" to "service_role";

grant trigger on table "public"."user_achievements" to "service_role";

grant truncate on table "public"."user_achievements" to "service_role";

grant update on table "public"."user_achievements" to "service_role";

grant delete on table "public"."user_interactions" to "anon";

grant insert on table "public"."user_interactions" to "anon";

grant references on table "public"."user_interactions" to "anon";

grant select on table "public"."user_interactions" to "anon";

grant trigger on table "public"."user_interactions" to "anon";

grant truncate on table "public"."user_interactions" to "anon";

grant update on table "public"."user_interactions" to "anon";

grant delete on table "public"."user_interactions" to "authenticated";

grant insert on table "public"."user_interactions" to "authenticated";

grant references on table "public"."user_interactions" to "authenticated";

grant select on table "public"."user_interactions" to "authenticated";

grant trigger on table "public"."user_interactions" to "authenticated";

grant truncate on table "public"."user_interactions" to "authenticated";

grant update on table "public"."user_interactions" to "authenticated";

grant delete on table "public"."user_interactions" to "service_role";

grant insert on table "public"."user_interactions" to "service_role";

grant references on table "public"."user_interactions" to "service_role";

grant select on table "public"."user_interactions" to "service_role";

grant trigger on table "public"."user_interactions" to "service_role";

grant truncate on table "public"."user_interactions" to "service_role";

grant update on table "public"."user_interactions" to "service_role";

grant delete on table "public"."user_levels" to "anon";

grant insert on table "public"."user_levels" to "anon";

grant references on table "public"."user_levels" to "anon";

grant select on table "public"."user_levels" to "anon";

grant trigger on table "public"."user_levels" to "anon";

grant truncate on table "public"."user_levels" to "anon";

grant update on table "public"."user_levels" to "anon";

grant delete on table "public"."user_levels" to "authenticated";

grant insert on table "public"."user_levels" to "authenticated";

grant references on table "public"."user_levels" to "authenticated";

grant select on table "public"."user_levels" to "authenticated";

grant trigger on table "public"."user_levels" to "authenticated";

grant truncate on table "public"."user_levels" to "authenticated";

grant update on table "public"."user_levels" to "authenticated";

grant delete on table "public"."user_levels" to "service_role";

grant insert on table "public"."user_levels" to "service_role";

grant references on table "public"."user_levels" to "service_role";

grant select on table "public"."user_levels" to "service_role";

grant trigger on table "public"."user_levels" to "service_role";

grant truncate on table "public"."user_levels" to "service_role";

grant update on table "public"."user_levels" to "service_role";

grant delete on table "public"."user_profiles" to "anon";

grant insert on table "public"."user_profiles" to "anon";

grant references on table "public"."user_profiles" to "anon";

grant select on table "public"."user_profiles" to "anon";

grant trigger on table "public"."user_profiles" to "anon";

grant truncate on table "public"."user_profiles" to "anon";

grant update on table "public"."user_profiles" to "anon";

grant delete on table "public"."user_profiles" to "authenticated";

grant insert on table "public"."user_profiles" to "authenticated";

grant references on table "public"."user_profiles" to "authenticated";

grant select on table "public"."user_profiles" to "authenticated";

grant trigger on table "public"."user_profiles" to "authenticated";

grant truncate on table "public"."user_profiles" to "authenticated";

grant update on table "public"."user_profiles" to "authenticated";

grant delete on table "public"."user_profiles" to "service_role";

grant insert on table "public"."user_profiles" to "service_role";

grant references on table "public"."user_profiles" to "service_role";

grant select on table "public"."user_profiles" to "service_role";

grant trigger on table "public"."user_profiles" to "service_role";

grant truncate on table "public"."user_profiles" to "service_role";

grant update on table "public"."user_profiles" to "service_role";

grant delete on table "public"."user_roles" to "anon";

grant insert on table "public"."user_roles" to "anon";

grant references on table "public"."user_roles" to "anon";

grant select on table "public"."user_roles" to "anon";

grant trigger on table "public"."user_roles" to "anon";

grant truncate on table "public"."user_roles" to "anon";

grant update on table "public"."user_roles" to "anon";

grant delete on table "public"."user_roles" to "authenticated";

grant insert on table "public"."user_roles" to "authenticated";

grant references on table "public"."user_roles" to "authenticated";

grant select on table "public"."user_roles" to "authenticated";

grant trigger on table "public"."user_roles" to "authenticated";

grant truncate on table "public"."user_roles" to "authenticated";

grant update on table "public"."user_roles" to "authenticated";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant references on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant trigger on table "public"."user_roles" to "service_role";

grant truncate on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";

create policy "Managers can view ai insights"
on "public"."ai_insights"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal_manager'::text, 'gestor'::text]))))));


create policy "System can create ai insights"
on "public"."ai_insights"
as permissive
for insert
to public
with check (true);


create policy "Managers can view ai insights"
on "public"."ai_master_insights"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal_manager'::text, 'gestor_igr'::text, 'diretor_estadual'::text]))))));


create policy "System can create ai insights"
on "public"."ai_master_insights"
as permissive
for insert
to public
with check (true);


create policy "Attendants can manage their own timesheet"
on "public"."attendant_timesheet"
as permissive
for all
to public
using (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal_manager'::text])))))));


create policy "Attendants can create checkins"
on "public"."cat_checkins"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'atendente'::text]))))));


create policy "CAT checkins are viewable by managers"
on "public"."cat_checkins"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal_manager'::text, 'atendente'::text]))))));


create policy "CAT locations are publicly readable"
on "public"."cat_locations"
as permissive
for select
to public
using ((is_active = true));


create policy "Managers can manage CAT locations"
on "public"."cat_locations"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal_manager'::text]))))));


create policy "Admins can manage cities"
on "public"."cities"
as permissive
for all
to public
using (is_admin_user(auth.uid()));


create policy "Cities are publicly readable"
on "public"."cities"
as permissive
for select
to public
using (true);


create policy "City tour bookings are viewable by municipal managers"
on "public"."city_tour_bookings"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal'::text, 'municipal_manager'::text]))))));


create policy "Municipal managers can manage city tour bookings"
on "public"."city_tour_bookings"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal_manager'::text]))))));


create policy "City tour settings are viewable by municipal users"
on "public"."city_tour_settings"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal'::text, 'municipal_manager'::text]))))));


create policy "Municipal managers can manage city tour settings"
on "public"."city_tour_settings"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal_manager'::text]))))));


create policy "Admins can view content logs"
on "public"."content_audit_log"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text]))))));


create policy "Admins can manage destination details"
on "public"."destination_details"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal_manager'::text]))))));


create policy "Destination details are publicly readable"
on "public"."destination_details"
as permissive
for select
to public
using (true);


create policy "Admins can manage destinations"
on "public"."destinations"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal_manager'::text]))))));


create policy "Destinations are publicly readable"
on "public"."destinations"
as permissive
for select
to public
using (true);


create policy "Admins can manage event details"
on "public"."event_details"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal_manager'::text]))))));


create policy "Event details are publicly readable"
on "public"."event_details"
as permissive
for select
to public
using (true);


create policy "Admins can manage events"
on "public"."events"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal_manager'::text]))))));


create policy "Events are publicly readable"
on "public"."events"
as permissive
for select
to public
using ((is_visible = true));


create policy "FlowTrip admins can manage all clients"
on "public"."flowtrip_clients"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text]))))));


create policy "State users can view their client data"
on "public"."flowtrip_clients"
as permissive
for select
to public
using ((state_id IN ( SELECT user_roles.state_id
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['diretor_estadual'::text, 'gestor_igr'::text]))))));


create policy "FlowTrip admins can manage all invoices"
on "public"."flowtrip_invoices"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text]))))));


create policy "Only FlowTrip admins can manage master config"
on "public"."flowtrip_master_config"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text]))))));


create policy "FlowTrip admins can manage onboarding steps"
on "public"."flowtrip_onboarding_steps"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text]))))));


create policy "State admins can manage features"
on "public"."flowtrip_state_features"
as permissive
for all
to public
using ((state_id IN ( SELECT user_roles.state_id
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'diretor_estadual'::text, 'gestor_igr'::text]))))));


create policy "FlowTrip admins can manage all states"
on "public"."flowtrip_states"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text]))))));


create policy "State users can view their state"
on "public"."flowtrip_states"
as permissive
for select
to public
using (((id IN ( SELECT user_roles.state_id
   FROM user_roles
  WHERE (user_roles.user_id = auth.uid()))) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text])))))));


create policy "FlowTrip admins can manage all subscriptions"
on "public"."flowtrip_subscriptions"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text]))))));


create policy "FlowTrip admins can manage support tickets"
on "public"."flowtrip_support_tickets"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text]))))));


create policy "FlowTrip admins can view all metrics"
on "public"."flowtrip_usage_metrics"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text]))))));


create policy "FlowTrip admins can manage white-label configs"
on "public"."flowtrip_white_label_configs"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text]))))));


create policy "Admins can manage institutional content"
on "public"."institutional_content"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text]))))));


create policy "Institutional content is publicly readable"
on "public"."institutional_content"
as permissive
for select
to public
using ((is_active = true));


create policy "Admins can manage institutional partners"
on "public"."institutional_partners"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text]))))));


create policy "Institutional partners are publicly readable"
on "public"."institutional_partners"
as permissive
for select
to public
using ((is_active = true));


create policy "Municipal managers can manage surveys"
on "public"."institutional_surveys"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal_manager'::text]))))));


create policy "Municipal users can view surveys"
on "public"."institutional_surveys"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal'::text, 'municipal_manager'::text]))))));


create policy "Managers can manage knowledge base"
on "public"."knowledge_base_entries"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal_manager'::text, 'gestor'::text]))))));


create policy "Municipal managers can manage collaborators"
on "public"."municipal_collaborators"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal_manager'::text]))))));


create policy "Municipal managers can view collaborators"
on "public"."municipal_collaborators"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal'::text, 'municipal_manager'::text]))))));


create policy "Users can create own stamps"
on "public"."passport_stamps"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can view own stamps"
on "public"."passport_stamps"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "System can manage password reset tokens"
on "public"."password_reset_tokens"
as permissive
for all
to public
using (false);


create policy "Admins can manage regions"
on "public"."regions"
as permissive
for all
to public
using (is_admin_user(auth.uid()));


create policy "Regions are publicly readable"
on "public"."regions"
as permissive
for select
to public
using (true);


create policy "Admins can manage checkpoints"
on "public"."route_checkpoints"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal_manager'::text]))))));


create policy "Checkpoints are publicly readable"
on "public"."route_checkpoints"
as permissive
for select
to public
using (true);


create policy "Admins can manage routes"
on "public"."routes"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal_manager'::text]))))));


create policy "Routes are publicly readable"
on "public"."routes"
as permissive
for select
to public
using ((is_active = true));


create policy "Municipal managers can manage secretary files"
on "public"."secretary_files"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal_manager'::text]))))));


create policy "Municipal users can view secretary files"
on "public"."secretary_files"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal'::text, 'municipal_manager'::text]))))));


create policy "Admins can view security logs"
on "public"."security_audit_log"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text]))))));


create policy "Admins can manage states"
on "public"."states"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text]))))));


create policy "States are publicly readable"
on "public"."states"
as permissive
for select
to public
using ((is_active = true));


create policy "Municipal users can view survey responses"
on "public"."survey_responses"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal'::text, 'municipal_manager'::text]))))));


create policy "Respondents can create responses"
on "public"."survey_responses"
as permissive
for insert
to public
with check (((auth.uid() = respondent_id) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal_manager'::text])))))));


create policy "Admins can manage tourism documents"
on "public"."tourism_intelligence_documents"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text]))))));


create policy "Admins can manage tourist regions"
on "public"."tourist_regions"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal_manager'::text]))))));


create policy "Tourist regions are publicly readable"
on "public"."tourist_regions"
as permissive
for select
to public
using (true);


create policy "Users can create own achievements"
on "public"."user_achievements"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can view own achievements"
on "public"."user_achievements"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Managers can view all interactions"
on "public"."user_interactions"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::text, 'tech'::text, 'municipal_manager'::text, 'gestor_igr'::text, 'diretor_estadual'::text]))))));


create policy "Users can create their own interactions"
on "public"."user_interactions"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can create own levels"
on "public"."user_levels"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update own levels"
on "public"."user_levels"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view own levels"
on "public"."user_levels"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Authenticated users can read user profiles"
on "public"."user_profiles"
as permissive
for select
to public
using ((auth.role() = 'authenticated'::text));


create policy "Enable read access for own profile and for admins"
on "public"."user_profiles"
as permissive
for select
to public
using (((auth.uid() = id) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text))))));


create policy "Enable read access for users on their own profile and for admin"
on "public"."user_profiles"
as permissive
for select
to public
using (((auth.uid() = user_id) OR (get_current_user_role() = 'admin'::text)));


create policy "Users can create their own profile"
on "public"."user_profiles"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can insert own profile"
on "public"."user_profiles"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update own profile"
on "public"."user_profiles"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can update their own profile"
on "public"."user_profiles"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their own profile"
on "public"."user_profiles"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Admins and self-register can insert roles"
on "public"."user_roles"
as permissive
for insert
to public
with check (((get_current_user_role() = 'admin'::text) OR (auth.uid() = user_id)));


create policy "Admins and self-update can update roles"
on "public"."user_roles"
as permissive
for update
to public
using (((get_current_user_role() = 'admin'::text) OR (auth.uid() = user_id)));


create policy "Admins can view all roles"
on "public"."user_roles"
as permissive
for select
to public
using (is_admin_user(auth.uid()));


create policy "Block direct role deletion"
on "public"."user_roles"
as permissive
for delete
to public
using (false);


create policy "Block direct role insertion"
on "public"."user_roles"
as permissive
for insert
to public
with check (false);


create policy "Block direct role updates"
on "public"."user_roles"
as permissive
for update
to public
using (false);


create policy "Enable read access for users on their own role and for admins"
on "public"."user_roles"
as permissive
for select
to public
using (((auth.uid() = user_id) OR (get_current_user_role() = 'admin'::text)));


create policy "Users can view their own role"
on "public"."user_roles"
as permissive
for select
to public
using ((auth.uid() = user_id));


CREATE TRIGGER update_ai_insights_updated_at BEFORE UPDATE ON public.ai_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendant_timesheet_updated_at BEFORE UPDATE ON public.attendant_timesheet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cat_locations_updated_at BEFORE UPDATE ON public.cat_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_city_tour_bookings_updated_at BEFORE UPDATE ON public.city_tour_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_city_tour_settings_updated_at BEFORE UPDATE ON public.city_tour_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_destination_details_updated_at BEFORE UPDATE ON public.destination_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON public.destinations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_details_updated_at BEFORE UPDATE ON public.event_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flowtrip_clients_updated_at BEFORE UPDATE ON public.flowtrip_clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flowtrip_subscriptions_updated_at BEFORE UPDATE ON public.flowtrip_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flowtrip_support_tickets_updated_at BEFORE UPDATE ON public.flowtrip_support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flowtrip_white_label_configs_updated_at BEFORE UPDATE ON public.flowtrip_white_label_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_institutional_content AFTER INSERT OR DELETE OR UPDATE ON public.institutional_content FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

CREATE TRIGGER update_institutional_content_updated_at BEFORE UPDATE ON public.institutional_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institutional_partners_updated_at BEFORE UPDATE ON public.institutional_partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institutional_surveys_updated_at BEFORE UPDATE ON public.institutional_surveys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_entries_updated_at BEFORE UPDATE ON public.knowledge_base_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_municipal_collaborators_updated_at BEFORE UPDATE ON public.municipal_collaborators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON public.regions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON public.routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_secretary_files_updated_at BEFORE UPDATE ON public.secretary_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tourism_intelligence_documents_updated_at BEFORE UPDATE ON public.tourism_intelligence_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tourist_regions_updated_at BEFORE UPDATE ON public.tourist_regions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_user_roles AFTER INSERT OR DELETE OR UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION audit_table_changes();


