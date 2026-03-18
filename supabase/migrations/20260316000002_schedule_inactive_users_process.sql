-- Agenda o processamento de contas inativas (Descubra MS) semanalmente.
-- Usa os mesmos secrets do vault que o autonomous-agent-scheduler (project URL + anon key).
-- Para usar outros secrets, altere os nomes em vault.decrypted_secrets.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'inactive-users-process') THEN
    PERFORM cron.unschedule('inactive-users-process');
  END IF;
END $$;

-- Executa toda segunda-feira às 03:00 (horário do servidor)
SELECT cron.schedule(
  'inactive-users-process',
  '0 3 * * 1',
  $$
  SELECT
    net.http_post(
      url := (
        SELECT decrypted_secret
        FROM vault.decrypted_secrets
        WHERE name = 'autonomous_agent_project_url'
        LIMIT 1
      ) || '/functions/v1/inactive-users-process',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (
          SELECT decrypted_secret
          FROM vault.decrypted_secrets
          WHERE name = 'autonomous_agent_anon_key'
          LIMIT 1
        )
      ),
      body := jsonb_build_object(
        'source', 'pg_cron',
        'job', 'inactive-users-process'
      )
    ) AS request_id;
  $$
);
