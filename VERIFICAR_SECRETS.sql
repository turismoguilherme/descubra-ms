SELECT name, created_at 
FROM vault.decrypted_secrets 
WHERE name IN ('autonomous_agent_project_url', 'autonomous_agent_anon_key')
ORDER BY name;


