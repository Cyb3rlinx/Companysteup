-- Apply only after deploying Edge Functions and creating these Vault secrets:
-- company_os_function_base_url = https://<project-ref>.supabase.co/functions/v1
-- company_os_worker_secret = the same SOURCE_MONITOR_SECRET configured in Edge.
-- Never paste actual secrets in this file or log them.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
select cron.schedule('company-os-source-monitor','*/30 * * * *',$job$
 select net.http_post(
  url := (select decrypted_secret from vault.decrypted_secrets where name='company_os_function_base_url' limit 1)||'/source-monitor',
  headers := jsonb_build_object('Content-Type','application/json','x-automation-secret',(select decrypted_secret from vault.decrypted_secrets where name='company_os_worker_secret' limit 1)),
  body := '{}'::jsonb,
  timeout_milliseconds := 60000
 );
$job$);
select cron.schedule('company-os-notify','0 * * * *',$job$
 select net.http_post(
  url := (select decrypted_secret from vault.decrypted_secrets where name='company_os_function_base_url' limit 1)||'/notify',
  headers := jsonb_build_object('Content-Type','application/json','x-automation-secret',(select decrypted_secret from vault.decrypted_secrets where name='company_os_worker_secret' limit 1)),
  body := '{}'::jsonb,
  timeout_milliseconds := 60000
 );
$job$);
