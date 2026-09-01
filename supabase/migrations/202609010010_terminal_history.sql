begin;
create or replace function public.prevent_published_edit() returns trigger language plpgsql set search_path='' as $$
begin
 if old.status in ('ACTIVE','SUPERSEDED','NEEDS_REVIEW','ARCHIVED') then
  if new.status in ('DRAFT','PENDING_REVIEW') or (old.status in ('SUPERSEDED','NEEDS_REVIEW','ARCHIVED') and new.status='ACTIVE') then raise exception 'Published version cannot be reset or reactivated'; end if;
  if new.outcome_json is distinct from old.outcome_json or new.condition_json is distinct from old.condition_json or new.explanation_template is distinct from old.explanation_template or new.effective_from is distinct from old.effective_from or new.rule_id is distinct from old.rule_id or new.version is distinct from old.version or new.verified_at is distinct from old.verified_at or new.verified_by is distinct from old.verified_by or new.published_at is distinct from old.published_at or new.confidence is distinct from old.confidence then raise exception 'Published rule content immutable: create a new version'; end if;
  if old.status in ('SUPERSEDED','ARCHIVED') and new.effective_to is distinct from old.effective_to then raise exception 'Historical effective interval immutable'; end if;
 end if;
 return new;
end $$;
create or replace function public.protect_published_evidence() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.regulatory_rule_versions where id in (new.rule_version_id,old.rule_version_id) and status in ('ACTIVE','NEEDS_REVIEW','SUPERSEDED','ARCHIVED')) then raise exception 'Published evidence is immutable'; end if;
 if tg_op='DELETE' then return old; end if; return new;
end $$;
commit;
