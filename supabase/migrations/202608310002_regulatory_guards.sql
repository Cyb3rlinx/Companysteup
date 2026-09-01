begin;
create function public.validate_active_rule() returns trigger language plpgsql security definer set search_path='' as $$
declare severity_value text;
begin
 if new.status <> 'ACTIVE' then return new; end if;
 select severity into severity_value from public.regulatory_rules where id=new.rule_id;
 if new.verified_at is null or new.verified_by is null then raise exception 'ACTIVE rule requires human verification'; end if;
 if not exists(select 1 from public.profiles where id=new.verified_by and app_role in ('compliance','admin','superadmin')) then raise exception 'Reviewer must have compliance role'; end if;
 if exists(select 1 from public.regulatory_rule_versions v where v.rule_id=new.rule_id and v.id<>new.id and v.status='ACTIVE' and daterange(v.effective_from,v.effective_to,'[)') && daterange(new.effective_from,new.effective_to,'[)')) then raise exception 'Overlapping ACTIVE rule versions'; end if;
 if not exists(
   select 1 from public.rule_source_evidence e join public.regulatory_sources s on s.id=e.source_id
   join public.source_snapshots ss on ss.id=e.snapshot_id and ss.source_id=s.id
   where e.rule_version_id=new.id and e.is_primary and s.active and s.source_tier like 'T0_%'
   and s.status='verified' and ss.fetch_status='success' and ss.http_status=200
   and s.last_content_hash=ss.normalized_text_hash
   and s.last_success_at between now()-make_interval(hours=>least(s.refresh_cadence_hours,case when severity_value='CRITICAL' then 24 else 720 end)) and now()
 ) then raise exception 'ACTIVE rule requires fresh official evidence'; end if;
 if exists(select 1 from public.rule_source_evidence e join public.source_change_events c on c.source_id=e.source_id where e.rule_version_id=new.id and c.status not in ('approved','dismissed')) then raise exception 'Unreviewed source change'; end if;
 return new;
end $$;
create trigger active_rule_guard before insert or update on public.regulatory_rule_versions for each row execute function public.validate_active_rule();
create function public.block_changed_source() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status not in ('approved','dismissed') then
  update public.regulatory_sources set status='needs_review' where id=new.source_id;
  update public.regulatory_rule_versions set status='NEEDS_REVIEW' where id in (select rule_version_id from public.rule_source_evidence where source_id=new.source_id) and status='ACTIVE';
 end if;
 return new;
end $$;
create trigger source_change_guard after insert on public.source_change_events for each row execute function public.block_changed_source();
create function public.prevent_published_edit() returns trigger language plpgsql set search_path='' as $$
begin
 if old.status in ('ACTIVE','SUPERSEDED','NEEDS_REVIEW') and (new.outcome_json is distinct from old.outcome_json or new.condition_json is distinct from old.condition_json or new.explanation_template is distinct from old.explanation_template or new.effective_from is distinct from old.effective_from or new.rule_id is distinct from old.rule_id or new.version is distinct from old.version) then raise exception 'Published rule content immutable: create a new version'; end if;
 return new;
end $$;
create trigger immutable_rule_content before update on public.regulatory_rule_versions for each row execute function public.prevent_published_edit();
revoke all on function public.validate_active_rule(), public.block_changed_source(), public.prevent_published_edit() from public,anon,authenticated;
commit;
