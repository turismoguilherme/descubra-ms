-- O cron chamava a Edge Function com anon key; requireAdmin exige admin ou service role.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'autonomous-agent-scheduler') THEN
    PERFORM cron.unschedule('autonomous-agent-scheduler');
  END IF;
END $$;

SELECT cron.schedule(
  'autonomous-agent-scheduler',
  '* * * * *',
  $$
  SELECT
    net.http_post(
      url := (
        SELECT decrypted_secret
        FROM vault.decrypted_secrets
        WHERE name = 'autonomous_agent_project_url'
      ) || '/functions/v1/autonomous-agent-scheduler',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(
          (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'autonomous_agent_service_role_key'),
          (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_service_role_key')
        )
      ),
      body := jsonb_build_object(
        'timestamp', now(),
        'source', 'pg_cron'
      )
    ) AS request_id;
  $$
);

-- No Supabase Vault, crie o secret autonomous_agent_service_role_key com a service role JWT do projeto.
