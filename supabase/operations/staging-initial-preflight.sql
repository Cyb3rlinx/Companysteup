-- Read-only inventory before first deployment. No credentials or personal data are selected.
select jsonb_build_object(
  'public_tables', coalesce((select jsonb_agg(tablename order by tablename) from pg_tables where schemaname='public'), '[]'::jsonb),
  'auth_users', (select count(*) from auth.users),
  'storage_objects', (select count(*) from storage.objects),
  'storage_buckets', (select count(*) from storage.buckets),
  'postgres_version', current_setting('server_version')
) as preflight;
