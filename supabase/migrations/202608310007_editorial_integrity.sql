begin;
-- Canonical redirects are reviewed explicitly; the fetcher never follows them automatically.
update public.regulatory_sources set canonical_url='https://www.emta.ee/en/business-client/registration-business/non-residents-e-residents/tax-liabilities-companies' where source_code='EE_TAX';
update public.regulatory_sources set canonical_url='https://www.gov.uk/guidance/being-an-authorised-corporate-service-provider' where source_code='GB_ACSP';
update public.regulatory_sources set canonical_url='https://www.gov.uk/guidance/filing-your-companys-confirmation-statement' where source_code='GB_CONFIRMATION_TIMING';
-- Same-day corrections preserve a superseded, empty effective interval and the audit record.
do $$ declare c record; begin
 for c in select conname from pg_constraint where conrelid='public.regulatory_rule_versions'::regclass and contype='c' and pg_get_constraintdef(oid) like '%effective_to%' loop
 execute format('alter table public.regulatory_rule_versions drop constraint %I',c.conname);
 end loop;
end $$;
alter table public.regulatory_rule_versions add constraint effective_interval check(effective_to is null or effective_to>effective_from or (status='SUPERSEDED' and effective_to=effective_from));
create function public.validate_all_rule_evidence() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status<>'ACTIVE' then return new; end if;
 if new.verified_at>now() or (new.effective_to is not null and new.effective_to<=new.effective_from) then raise exception 'Invalid verification or effective interval'; end if;
 if exists(select 1 from public.rule_source_evidence e
 left join public.regulatory_sources s on s.id=e.source_id
 left join public.source_snapshots ss on ss.id=e.snapshot_id and ss.source_id=e.source_id
 where e.rule_version_id=new.id and (s.id is null or not s.active or s.status<>'verified' or s.source_tier not like 'T0_%'
 or s.last_success_at is null or s.last_success_at>now() or s.last_success_at<=now()-make_interval(hours=>least(s.refresh_cadence_hours,case when s.critical then 24 else 720 end))
 or ss.id is null or ss.http_status<>200 or ss.fetch_status<>'success' or ss.normalized_text_hash is distinct from s.last_content_hash
 or length(trim(e.source_locator))=0 or length(trim(e.evidence_summary))=0)) then raise exception 'All evidence must be fresh, official and match snapshots'; end if;
 return new;
end $$;
create trigger all_evidence_guard before insert or update on public.regulatory_rule_versions for each row execute function public.validate_all_rule_evidence();
create function public.protect_published_evidence() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.regulatory_rule_versions where id in (new.rule_version_id,old.rule_version_id) and status in ('ACTIVE','NEEDS_REVIEW','SUPERSEDED')) then raise exception 'Published evidence is immutable'; end if;
 if tg_op='DELETE' then return old; end if; return new;
end $$;
create trigger published_evidence_guard before insert or update or delete on public.rule_source_evidence for each row execute function public.protect_published_evidence();
create function public.protect_snapshot() returns trigger language plpgsql set search_path='' as $$ begin raise exception 'Source snapshots are append-only'; end $$;
create trigger snapshot_immutable before update or delete on public.source_snapshots for each row execute function public.protect_snapshot();
revoke all on function public.validate_all_rule_evidence(),public.protect_published_evidence(),public.protect_snapshot() from public,anon,authenticated;
commit;
