-- Read-only aggregate evidence; no credentials or personal data.
-- One statement so CLI JSON output preserves all checks.
select jsonb_build_object(
 'public_tables', (select count(*) from pg_tables where schemaname='public'),
 'tables_without_rls', (select count(*) from pg_tables where schemaname='public' and not rowsecurity),
 'rule_statuses', (select jsonb_object_agg(status,n) from (select status,count(*) n from public.regulatory_rule_versions group by status) s),
 'published_or_verified_versions', (select count(*) from public.regulatory_rule_versions where published_at is not null or verified_by is not null or status='ACTIVE'),
 'snapshots', (select count(*) from public.source_snapshots),
 'evidence_links', (select count(*) from public.rule_source_evidence),
 'auth_users', (select count(*) from auth.users),
 'storage_objects', (select count(*) from storage.objects),
 'companies', (select count(*) from public.companies),
 'paid_orders', (select count(*) from public.orders where status in ('paid','sandbox_paid')),
 'buckets', (select jsonb_agg(jsonb_build_object('id',id,'public',public,'file_size_limit',file_size_limit) order by id) from storage.buckets),
 'catalog_prices', (select jsonb_object_agg(code,n) from (select p.code,count(bp.id) n from public.billing_products p left join public.billing_prices bp on bp.billing_product_id=p.id group by p.code) s)
) as verification;
