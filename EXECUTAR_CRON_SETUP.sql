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
        'Authorization', 'Bearer ' || (
          SELECT decrypted_secret 
          FROM vault.decrypted_secrets 
          WHERE name = 'autonomous_agent_anon_key'
        )
      ),
      body := jsonb_build_object(
        'timestamp', now(),
        'source', 'pg_cron'
      )
    ) as request_id;
  $$
);


