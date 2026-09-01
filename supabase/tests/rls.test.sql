begin;
create extension if not exists pgtap with schema extensions;
set search_path=public,extensions;
select plan(11);
select is((select count(*)::integer from pg_tables where schemaname='public' and not rowsecurity),0,'Every exposed table has RLS');
select ok(not has_function_privilege('authenticated','public.apply_operations(jsonb)','execute'),'Customers cannot invoke service mutations');
select ok(not has_function_privilege('anon','public.apply_operations(jsonb)','execute'),'Anonymous callers cannot invoke service mutations');
insert into auth.users(id,email,raw_user_meta_data) values
 ('d0000000-0000-4000-8000-000000000001','tenant-a@example.test','{"app_role":"superadmin"}'),
 ('d0000000-0000-4000-8000-000000000002','tenant-b@example.test','{}');
select is((select app_role from profiles where id='d0000000-0000-4000-8000-000000000001'),'customer','User metadata cannot elevate roles');
insert into support_tickets(organization_id,user_id,subject,message) select id,owner_user_id,'Tenant A','Private tenant A message' from organizations where owner_user_id='d0000000-0000-4000-8000-000000000001';
insert into support_tickets(organization_id,user_id,subject,message) select id,owner_user_id,'Tenant B','Private tenant B message' from organizations where owner_user_id='d0000000-0000-4000-8000-000000000002';
insert into source_snapshots(source_id,http_status,normalized_text_hash,fetch_status) select id,200,'private-synthetic-qa','success' from regulatory_sources limit 1;
set local role authenticated;
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000001',true);
select is((select count(*)::integer from support_tickets),1,'Tenant A reads only its own ticket');
select is((select subject from support_tickets),'Tenant A','Tenant B data is not returned');
select is((select count(*)::integer from source_snapshots),0,'Customer cannot read private source snapshots');
select throws_ok($$update profiles set app_role='superadmin' where id='d0000000-0000-4000-8000-000000000001'$$,'42501',null,'Customer cannot change role');
select throws_ok($$update regulatory_rules set title='Tampered'$$,'42501',null,'Customer cannot mutate regulation');
select set_config('request.jwt.claim.sub','d0000000-0000-4000-8000-000000000002',true);
select is((select subject from support_tickets),'Tenant B','Tenant B sees its own ticket');
select is((select count(*)::integer from audit_logs),0,'Customer cannot read internal audit log');
reset role;
select * from finish();
rollback;
