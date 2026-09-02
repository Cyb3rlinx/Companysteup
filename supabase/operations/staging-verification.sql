-- Read-only checks AFTER migrations + controlled seed on the authenticated staging target.
-- Verify project identity/region separately through Supabase Management API before connecting.
begin read only;

-- Expected: 55 public application tables, zero without RLS.
select count(*) as public_tables,
       count(*) filter(where not rowsecurity) as tables_without_rls
from pg_tables where schemaname='public';

-- Expected on a new staging: pending candidates only; no published/verified versions.
select status,count(*) as versions from public.regulatory_rule_versions group by status;
select count(*) as published_or_verified_versions from public.regulatory_rule_versions
where published_at is not null or verified_by is not null or status='ACTIVE';
select count(*) as snapshots from public.source_snapshots;
select count(*) as evidence_links from public.rule_source_evidence;

-- Initial staging contains no identities or filings; these counts change only in later synthetic tests.
select count(*) as auth_users from auth.users;
select count(*) as companies from public.companies;
select count(*) as orders from public.orders;

-- Expected: three private document/snapshot buckets; public-assets is intentionally public.
select id,public,file_size_limit from storage.buckets
where id in ('customer-documents','company-documents','regulatory-snapshots','public-assets') order by id;

-- Expected: one initial price for PLATFORM_SETUP, never duplicated by a seed retry.
select p.code,count(bp.id) as prices from public.billing_products p
left join public.billing_prices bp on bp.billing_product_id=p.id group by p.code order by p.code;
commit;
