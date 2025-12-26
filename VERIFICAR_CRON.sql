SELECT * FROM cron.job WHERE jobname = 'autonomous-agent-scheduler';

SELECT 
  jobid,
  runid,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details 
WHERE jobid = (
  SELECT jobid FROM cron.job WHERE jobname = 'autonomous-agent-scheduler'
) 
ORDER BY start_time DESC 
LIMIT 10;


