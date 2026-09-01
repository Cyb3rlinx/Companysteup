begin;
create function public.can_read_regulatory_version(version_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.regulatory_rule_versions v where v.id=version_id and v.status='ACTIVE'
 and v.effective_from<=current_date and (v.effective_to is null or v.effective_to>current_date)
 and v.verified_at is not null and v.verified_at<=now() and v.verified_by is not null
 and exists(select 1 from public.rule_source_evidence e where e.rule_version_id=v.id and e.is_primary)
 and not exists(select 1 from public.rule_source_evidence e
 left join public.regulatory_sources s on s.id=e.source_id
 left join public.source_snapshots ss on ss.id=e.snapshot_id and ss.source_id=e.source_id
 where e.rule_version_id=v.id and (s.id is null or not s.active or s.status<>'verified' or s.source_tier not like 'T0_%'
 or s.last_success_at is null or s.last_success_at>now() or s.last_success_at<=now()-make_interval(hours=>least(s.refresh_cadence_hours,case when s.critical then 24 else 720 end))
 or ss.id is null or ss.fetch_status<>'success' or ss.normalized_text_hash is distinct from s.last_content_hash))
 and not exists(select 1 from public.rule_source_evidence e join public.source_change_events c on c.source_id=e.source_id where e.rule_version_id=v.id and c.status not in ('approved','dismissed')))
$$;
create function public.can_read_regulatory_rule(rule_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.regulatory_rule_versions v where v.rule_id=can_read_regulatory_rule.rule_id and public.can_read_regulatory_version(v.id))
$$;
revoke all on function public.can_read_regulatory_version(uuid),public.can_read_regulatory_rule(uuid) from public;
grant execute on function public.can_read_regulatory_version(uuid),public.can_read_regulatory_rule(uuid) to anon,authenticated,service_role;
drop policy active_rules_read on public.regulatory_rule_versions;
create policy active_rules_read on public.regulatory_rule_versions for select to anon,authenticated using(public.is_compliance_user() or public.can_read_regulatory_version(id));
drop policy catalog_read on public.regulatory_rules;
create policy catalog_read on public.regulatory_rules for select to anon,authenticated using(public.is_compliance_user() or public.can_read_regulatory_rule(id));
alter table public.formation_cases add constraint case_entity_pair check((jurisdiction_code in ('US-DE','US-WY') and entity_type_code='LLC') or (jurisdiction_code='EE' and entity_type_code='OU') or (jurisdiction_code='GB' and entity_type_code='LTD_PRIVATE_SHARES'));
alter table public.formation_cases add constraint case_product_fk foreign key(product_code) references public.entity_types(code);
commit;
