alter table "public"."ai_master_insights" drop constraint "ai_master_insights_priority_check";

alter table "public"."ai_master_insights" drop constraint "ai_master_insights_status_check";

alter table "public"."ai_master_insights" add constraint "ai_master_insights_priority_check" CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))) not valid;

alter table "public"."ai_master_insights" validate constraint "ai_master_insights_priority_check";

alter table "public"."ai_master_insights" add constraint "ai_master_insights_status_check" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'resolved'::character varying, 'dismissed'::character varying])::text[]))) not valid;

alter table "public"."ai_master_insights" validate constraint "ai_master_insights_status_check";


