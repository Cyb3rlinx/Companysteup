begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('customer-documents','customer-documents',false,10485760,array['application/pdf','image/png','image/jpeg']),
 ('company-documents','company-documents',false,10485760,array['application/pdf','image/png','image/jpeg']),
 ('regulatory-snapshots','regulatory-snapshots',false,5242880,array['text/plain','text/html','application/pdf']),
 ('public-assets','public-assets',true,2097152,array['image/png','image/jpeg','image/webp'])
on conflict(id) do nothing;
-- Objects: organization UUID / case or company UUID / random UUID. Uploads go through server validation.
create policy customer_document_read on storage.objects for select to authenticated using(
 bucket_id='customer-documents' and exists(select 1 from public.case_documents d where d.storage_path=name and d.status='approved' and public.is_org_member(d.organization_id))
);
create policy company_document_read on storage.objects for select to authenticated using(
 bucket_id='company-documents' and exists(select 1 from public.company_documents d where d.storage_path=name and public.is_org_member(d.organization_id))
);
create policy snapshot_compliance_read on storage.objects for select to authenticated using(bucket_id='regulatory-snapshots' and public.is_compliance_user());
create policy public_asset_read on storage.objects for select to anon,authenticated using(bucket_id='public-assets');
commit;
