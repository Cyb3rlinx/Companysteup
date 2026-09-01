begin;
create or replace function public.block_changed_source() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status not in ('approved','dismissed') then
  update public.regulatory_sources set status='needs_review' where id=new.source_id;
  update public.regulatory_rule_versions set status='NEEDS_REVIEW' where id in (select rule_version_id from public.rule_source_evidence where source_id=new.source_id) and status='ACTIVE';
  update public.company_obligations set status='review_required',notes=coalesce(notes,'')||' Fuente oficial modificada: requiere reverificación.' where source_rule_version_id in (select rule_version_id from public.rule_source_evidence where source_id=new.source_id) and status<>'completed';
  insert into public.regulatory_alerts(organization_id,company_id,severity,title,message)
  select distinct o.organization_id,o.company_id,'HIGH','Fuente oficial modificada','Revisaremos las obligaciones afectadas antes de indicar nuevos requisitos.' from public.company_obligations o where o.source_rule_version_id in (select rule_version_id from public.rule_source_evidence where source_id=new.source_id) and o.status<>'completed';
 end if;
 return new;
end $$;
commit;
