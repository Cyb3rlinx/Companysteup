// Explicit schema catalog. Generated SQL is committed and is the deployment authority.
import { mkdirSync, writeFileSync } from 'node:fs';
const uuid='uuid primary key default gen_random_uuid()';
const timestamp='created_at timestamptz not null default now(), updated_at timestamptz not null default now()';
const org='organization_id uuid not null references organizations(id)';
const tables = {
profiles:`id uuid primary key references auth.users(id), display_name text, preferred_language text not null default 'es-419', timezone text not null default 'UTC', app_role text not null default 'customer' check(app_role in ('customer','ops','compliance','admin','superadmin')), ${timestamp}`,
organizations:`id ${uuid}, name text not null, type text not null default 'customer' check(type in ('customer','internal','partner')), owner_user_id uuid not null references auth.users(id), ${timestamp}`,
organization_members:`id ${uuid}, ${org}, user_id uuid not null references auth.users(id), member_role text not null default 'member' check(member_role in ('owner','member')), status text not null default 'active' check(status in ('active','invited','revoked')), created_at timestamptz not null default now(), unique(organization_id,user_id)`,
jurisdictions:`code text primary key check(code in ('US-DE','US-WY','EE','GB')), country_code text not null, subdivision_code text, name text not null, active boolean not null default true, default_currency text not null, timezone text not null, ${timestamp}`,
entity_types:`code text primary key, jurisdiction_code text not null references jurisdictions(code), legal_name text not null, short_name text not null, active boolean not null default true, metadata jsonb not null default '{}'`,
founder_profiles:`id ${uuid}, ${org}, user_id uuid references auth.users(id), legal_first_name text, legal_last_name text, date_of_birth date, nationality_country_code text, residence_country_code text, phone text, onboarding_status text not null default 'draft', ${timestamp}`,
founder_addresses:`id ${uuid}, ${org}, founder_id uuid not null references founder_profiles(id), address_type text, country_code text, line1 text, line2 text, city text, region text, postal_code text, valid_from date, valid_to date, ${timestamp}`,
founder_tax_residencies:`id ${uuid}, ${org}, founder_id uuid not null references founder_profiles(id), country_code text not null, tax_id_last4 text check(length(tax_id_last4)<=4), status text, ${timestamp}`,
business_profiles:`id ${uuid}, ${org}, created_by uuid references auth.users(id), proposed_name text not null, activity_summary text, industry_code text, business_model text, expected_annual_revenue_minor bigint check(expected_annual_revenue_minor>=0), expected_currency text, customer_countries text[], operating_countries text[], has_employees boolean, plans_fundraising boolean, requires_usd_account boolean, requires_eur_account boolean, needs_stripe boolean, crypto_exposure boolean, regulated_activity boolean, physical_inventory boolean, notes text, questionnaire jsonb not null default '{}', ${timestamp}`,
business_owners:`id ${uuid}, ${org}, business_profile_id uuid not null references business_profiles(id), owner_type text check(owner_type in ('natural_person','legal_entity')), founder_id uuid references founder_profiles(id), legal_name text, ownership_percent numeric check(ownership_percent between 0 and 100), voting_percent numeric check(voting_percent between 0 and 100), is_ubo boolean, parent_owner_id uuid references business_owners(id), ${timestamp}`,
questionnaire_answers:`id ${uuid}, ${org}, business_profile_id uuid not null references business_profiles(id), question_code text not null, answer_json jsonb not null, answer_version integer not null default 1, ${timestamp}, unique(business_profile_id,question_code)`,
identity_verifications:`id ${uuid}, ${org}, founder_id uuid references founder_profiles(id), provider text not null, provider_reference text, verification_type text, status text not null, document_country_code text, document_type text, document_expiry date, risk_flags jsonb, verified_at timestamptz, ${timestamp}`,
screening_results:`id ${uuid}, ${org}, founder_id uuid references founder_profiles(id), business_profile_id uuid references business_profiles(id), provider text, screening_type text check(screening_type in ('sanctions','pep','adverse_media','business_risk')), status text, result_summary jsonb, provider_reference text, requires_review boolean default true, checked_at timestamptz, ${timestamp}`,
consents:`id ${uuid}, ${org}, user_id uuid not null references auth.users(id), consent_type text not null, policy_version text not null, accepted_at timestamptz not null default now(), metadata jsonb default '{}', ${timestamp}`,
formation_cases:`id ${uuid}, ${org}, business_profile_id uuid not null references business_profiles(id), jurisdiction_code text not null references jurisdictions(code), entity_type_code text not null, product_code text not null, execution_mode text not null check(execution_mode in ('SANDBOX','GUIDED','PARTNER','LIVE')), status text not null default 'DRAFT' check(status in ('DRAFT','QUALIFYING','ELIGIBLE','REVIEW_REQUIRED','AWAITING_PAYMENT','ONBOARDING','AWAITING_CUSTOMER','AWAITING_PARTNER','READY_TO_FILE','SUBMITTED','REGISTERED','POST_FORMATION','ACTIVE_COMPLIANCE','REJECTED','CANCELLED')), recommendation_score integer, recommendation_explanation jsonb, assigned_ops_user_id uuid references auth.users(id), assigned_compliance_user_id uuid references auth.users(id), opened_at timestamptz default now(), submitted_at timestamptz, registered_at timestamptz, external_reference text, revision integer not null default 0, workflow_state jsonb not null default '{}', ${timestamp}`,
risk_assessments:`id ${uuid}, ${org}, case_id uuid references formation_cases(id), subject_type text, subject_id uuid, risk_level text check(risk_level in ('LOW','MEDIUM','HIGH','CRITICAL')), score numeric, reasons jsonb, decision text, decided_by uuid references auth.users(id), model_or_rules_version text, ${timestamp}`,
case_participants:`id ${uuid}, ${org}, case_id uuid not null references formation_cases(id), founder_id uuid not null references founder_profiles(id), participant_role text not null, ${timestamp}`,
workflow_templates:`id ${uuid}, code text not null, jurisdiction_code text references jurisdictions(code), entity_type_code text, version integer not null, status text not null, effective_from date, effective_to date, ${timestamp}, unique(code,version)`,
workflow_template_steps:`id ${uuid}, workflow_template_id uuid not null references workflow_templates(id), step_code text not null, sequence integer not null, title text, description text, automation_level text, execution_actor text, prerequisite_step_codes text[], entry_condition jsonb, completion_condition jsonb, customer_visible boolean default true, requires_review boolean default false, config jsonb, ${timestamp}, unique(workflow_template_id,step_code)`,
case_steps:`id ${uuid}, ${org}, case_id uuid not null references formation_cases(id), template_step_id uuid references workflow_template_steps(id), step_code text not null, sequence integer not null, status text not null, assigned_actor_type text, assigned_user_id uuid references auth.users(id), external_reference text, due_at timestamptz, started_at timestamptz, completed_at timestamptz, blocking_reason text, output_json jsonb default '{}', ${timestamp}, unique(case_id,step_code)`,
case_tasks:`id ${uuid}, ${org}, case_id uuid not null references formation_cases(id), case_step_id uuid references case_steps(id), title text not null, description text, task_type text, owner_type text, owner_user_id uuid references auth.users(id), status text not null default 'pending', due_at timestamptz, ${timestamp}`,
case_events:`id bigint generated always as identity primary key, ${org}, case_id uuid not null references formation_cases(id), event_type text not null, actor_type text not null, actor_user_id uuid references auth.users(id), payload jsonb not null default '{}', created_at timestamptz not null default now()`,
case_escalations:`id ${uuid}, ${org}, case_id uuid references formation_cases(id), case_step_id uuid references case_steps(id), escalation_type text not null, severity text not null, reason text not null, status text not null default 'open', assigned_to uuid references auth.users(id), resolution text, resolved_at timestamptz, ${timestamp}`,
case_documents:`id ${uuid}, ${org}, case_id uuid not null references formation_cases(id), document_type text not null, storage_bucket text not null default 'customer-documents', storage_path text not null unique, original_filename text not null, mime_type text not null, size_bytes bigint not null check(size_bytes>0 and size_bytes<=10485760), sha256 text not null, status text not null default 'quarantined', classification text not null default 'confidential', uploaded_by uuid references auth.users(id), expires_at timestamptz, metadata jsonb default '{}', ${timestamp}`,
document_extractions:`id ${uuid}, ${org}, document_id uuid not null references case_documents(id), extractor text, extraction_version text, structured_data jsonb, confidence jsonb, contains_sensitive_data boolean default true, reviewed_by uuid references auth.users(id), reviewed_at timestamptz, ${timestamp}`,
partners:`id ${uuid}, organization_id uuid references organizations(id), legal_name text not null, display_name text, partner_type text not null, website text, compliance_status text not null default 'unverified', agreement_status text not null default 'missing', active boolean not null default false, metadata jsonb, ${timestamp}`,
companies:`id ${uuid}, ${org}, formation_case_id uuid not null unique references formation_cases(id), jurisdiction_code text not null references jurisdictions(code), entity_type_code text not null, legal_name text not null, registration_number text not null, incorporation_date date not null, status text not null default 'SANDBOX', financial_year_end_month integer not null default 12 check(financial_year_end_month between 1 and 12), financial_year_end_day integer not null default 31 check(financial_year_end_day between 1 and 31), registered_agent_partner_id uuid references partners(id), registered_office_partner_id uuid references partners(id), ${timestamp}`,
company_owners:`id ${uuid}, ${org}, company_id uuid not null references companies(id), owner_type text, founder_id uuid references founder_profiles(id), legal_name text, ownership_percent numeric check(ownership_percent between 0 and 100), voting_percent numeric check(voting_percent between 0 and 100), is_ubo boolean, valid_from date, valid_to date, ${timestamp}`,
company_officers:`id ${uuid}, ${org}, company_id uuid not null references companies(id), founder_id uuid references founder_profiles(id), legal_name text, role_code text, appointment_date date, resignation_date date, external_person_code text, metadata jsonb, ${timestamp}`,
company_addresses:`id ${uuid}, ${org}, company_id uuid not null references companies(id), address_type text, country_code text, line1 text, line2 text, city text, region text, postal_code text, partner_id uuid references partners(id), valid_from date, valid_to date, ${timestamp}`,
authorities:`id ${uuid}, jurisdiction_code text references jurisdictions(code), name text not null unique, authority_type text not null, official_domain text not null, active boolean default true, ${timestamp}`,
company_registrations:`id ${uuid}, ${org}, company_id uuid not null references companies(id), authority_id uuid references authorities(id), registration_type text, registration_number_masked text, status text, issued_at timestamptz, external_reference text, ${timestamp}`,
company_documents:`id ${uuid}, ${org}, company_id uuid not null references companies(id), document_type text, storage_bucket text not null default 'company-documents', storage_path text not null unique, issued_by_authority_id uuid references authorities(id), issued_at timestamptz, sha256 text, ${timestamp}`,
regulatory_sources:`id ${uuid}, source_code text not null unique, authority_id uuid not null references authorities(id), jurisdiction_code text references jurisdictions(code), title text not null, canonical_url text not null check(canonical_url like 'https://%'), source_tier text not null, source_category text, refresh_cadence_hours integer not null check(refresh_cadence_hours>0), active boolean not null default true, critical boolean not null default true, last_checked_at timestamptz, last_success_at timestamptz, last_content_hash text, published_date date, source_updated_date date, status text not null default 'unverified', notes text, ${timestamp}`,
source_snapshots:`id ${uuid}, source_id uuid not null references regulatory_sources(id), fetched_at timestamptz not null default now(), http_status integer, etag text, last_modified_header text, content_hash text, normalized_text_hash text, storage_path text, page_title text, published_date date, detected_updated_date date, extraction_metadata jsonb, fetch_status text not null, ${timestamp}`,
source_change_events:`id ${uuid}, source_id uuid not null references regulatory_sources(id), previous_snapshot_id uuid references source_snapshots(id), new_snapshot_id uuid not null references source_snapshots(id), change_type text, severity text, changed_sections jsonb, ai_summary text, status text not null default 'detected' check(status in ('detected','triaged','reviewing','approved','dismissed')), reviewer_id uuid references auth.users(id), resolved_at timestamptz, ${timestamp}`,
regulatory_rules:`id ${uuid}, rule_code text not null unique, jurisdiction_code text not null references jurisdictions(code), entity_type_code text, rule_type text not null, title text not null, description text, severity text not null, automation_level text, requires_human_review boolean not null default false, ${timestamp}`,
regulatory_rule_versions:`id ${uuid}, rule_id uuid not null references regulatory_rules(id), version integer not null check(version>0), status text not null default 'DRAFT' check(status in ('DRAFT','PENDING_REVIEW','ACTIVE','NEEDS_REVIEW','SUPERSEDED','ARCHIVED')), effective_from date not null, effective_to date, condition_json jsonb not null default '{}', outcome_json jsonb not null default '{}', explanation_template text not null, confidence text not null default 'LOW', verified_at timestamptz, verified_by uuid references auth.users(id), published_at timestamptz, ${timestamp}, unique(rule_id,version), check(effective_to is null or effective_to>effective_from)`,
rule_source_evidence:`id ${uuid}, rule_version_id uuid not null references regulatory_rule_versions(id), source_id uuid not null references regulatory_sources(id), snapshot_id uuid not null references source_snapshots(id), source_locator text not null, evidence_summary text not null, is_primary boolean not null default true, ${timestamp}`,
obligation_templates:`id ${uuid}, code text not null unique, jurisdiction_code text not null references jurisdictions(code), entity_type_code text, title text not null, obligation_type text not null, trigger_json jsonb, due_date_rule_json jsonb, fee_rule_json jsonb, penalty_rule_json jsonb, required_action_json jsonb, governing_rule_version_id uuid not null references regulatory_rule_versions(id), active boolean not null default false, ${timestamp}`,
company_obligations:`id ${uuid}, ${org}, company_id uuid not null references companies(id), obligation_template_id uuid references obligation_templates(id), obligation_code text not null, title text not null, period_start date not null, period_end date not null, due_at timestamptz, status text not null default 'pending', amount_minor bigint check(amount_minor>=0), currency text, source_rule_version_id uuid references regulatory_rule_versions(id), generated_at timestamptz not null default now(), completed_at timestamptz, external_reference text, notes text, evidence_json jsonb not null default '[]', ${timestamp}, unique(company_id,obligation_code,period_start)`,
obligation_events:`id bigint generated always as identity primary key, ${org}, company_obligation_id uuid not null references company_obligations(id), event_type text not null, actor_type text not null, payload jsonb, created_at timestamptz not null default now()`,
regulatory_alerts:`id ${uuid}, ${org}, company_id uuid references companies(id), rule_id uuid references regulatory_rules(id), severity text not null, title text not null, message text not null, status text not null default 'open', acknowledged_at timestamptz, ${timestamp}`,
source_monitor_runs:`id ${uuid}, started_at timestamptz not null default now(), finished_at timestamptz, status text not null, sources_attempted integer default 0, sources_changed integer default 0, errors jsonb default '[]', ${timestamp}`,
partner_services:`id ${uuid}, partner_id uuid not null references partners(id), jurisdiction_code text references jurisdictions(code), entity_type_code text, service_type text, execution_mode text, unit_cost_minor bigint check(unit_cost_minor>=0), currency text, commission_type text, commission_value numeric, sla_json jsonb, active boolean default false, ${timestamp}`,
partner_referrals:`id ${uuid}, ${org}, case_id uuid references formation_cases(id), company_id uuid references companies(id), partner_service_id uuid not null references partner_services(id), status text, external_reference text, revenue_minor bigint, currency text, ${timestamp}`,
billing_products:`id ${uuid}, code text not null unique, name text not null, type text not null check(type in ('formation','compliance','premium_support','partner_service')), active boolean default true, metadata jsonb, ${timestamp}`,
billing_prices:`id ${uuid}, billing_product_id uuid not null references billing_products(id), jurisdiction_code text references jurisdictions(code), currency text not null, amount_minor bigint not null check(amount_minor>=0), interval text, stripe_price_id text, active boolean default true, valid_from timestamptz, valid_to timestamptz, ${timestamp}`,
orders:`id ${uuid}, ${org}, formation_case_id uuid references formation_cases(id), status text not null default 'pending', currency text not null, subtotal_minor bigint not null check(subtotal_minor>=0), platform_fee_minor bigint not null check(platform_fee_minor>=0), government_fee_minor bigint check(government_fee_minor>=0), partner_fee_minor bigint check(partner_fee_minor>=0), total_minor bigint not null check(total_minor>=0), stripe_checkout_session_id text unique, idempotency_key text unique, paid_at timestamptz, ${timestamp}`,
subscriptions:`id ${uuid}, ${org}, company_id uuid references companies(id), billing_product_id uuid references billing_products(id), stripe_customer_id text, stripe_subscription_id text unique, status text not null, current_period_end timestamptz, ${timestamp}`,
notifications:`id ${uuid}, ${org}, company_obligation_id uuid references company_obligations(id), channel text not null default 'in_app', title text not null, message text not null, status text not null default 'queued', deduplication_key text not null unique, provider_reference text, attempts integer not null default 0, sent_at timestamptz, ${timestamp}`,
support_tickets:`id ${uuid}, ${org}, user_id uuid references auth.users(id), subject text not null, message text not null, status text not null default 'open', ${timestamp}`,
audit_logs:`id bigint generated always as identity primary key, organization_id uuid references organizations(id), actor_user_id uuid references auth.users(id), action text not null, resource_type text, resource_id text, metadata jsonb not null default '{}', created_at timestamptz not null default now()`,
webhook_events:`id text primary key, provider text not null, processed_at timestamptz not null default now(), payload_hash text not null`,
rate_limits:`id text primary key, count integer not null default 0, window_start timestamptz not null default now()`
};
let sql = '-- Generated by scripts/generate-schema.mjs. Review and commit every migration change.\nbegin;\n';
for(const [name,cols] of Object.entries(tables)) sql += `create table public.${name} (${cols});\n`;
// Composite tenant foreign keys prevent references to another organization, including privileged writes.
for(const [name,cols] of Object.entries(tables)) if(cols.includes(org)) sql += `alter table public.${name} add unique(id,organization_id);\ncreate index ${name}_org_idx on public.${name}(organization_id);\n`;
for(const [name,cols] of Object.entries(tables)) if(cols.includes(org)) {
 for(const m of cols.matchAll(/(\w+) uuid(?: not null)? references (\w+)\(id\)/g)) {
  if(tables[m[2]]?.includes(org)) sql += `alter table public.${name} add constraint ${name}_${m[1]}_tenant foreign key (${m[1]},organization_id) references public.${m[2]}(id,organization_id);\n`;
 }
}
sql += `
create function public.is_org_member(org_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.organization_members where organization_id=org_id and user_id=auth.uid() and status='active')
$$;
create function public.is_org_owner(org_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.organization_members where organization_id=org_id and user_id=auth.uid() and member_role='owner' and status='active')
$$;
create function public.is_internal_user() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=auth.uid() and app_role in ('ops','compliance','admin','superadmin'))
$$;
create function public.is_compliance_user() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=auth.uid() and app_role in ('compliance','admin','superadmin'))
$$;
create function public.can_access_case(case_uuid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.formation_cases where id=case_uuid and (public.is_org_member(organization_id) or public.is_internal_user()))
$$;
create function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end $$;
create function public.reject_append_only_mutation() returns trigger language plpgsql set search_path='' as $$ begin raise exception 'append-only resource'; end $$;
create function public.protect_profile_role() returns trigger language plpgsql set search_path='' as $$
begin
 if new.app_role is distinct from old.app_role and current_user not in ('postgres','service_role') then raise exception 'app_role is server managed'; end if;
 return new;
end $$;
create trigger profiles_role_guard before update on public.profiles for each row execute function public.protect_profile_role();
create function public.bootstrap_user() returns trigger language plpgsql security definer set search_path='' as $$
declare org_id uuid;
begin
 insert into public.profiles(id,display_name) values(new.id,coalesce(new.raw_user_meta_data->>'display_name','Fundador'));
 insert into public.organizations(name,owner_user_id) values('Mi organización',new.id) returning id into org_id;
 insert into public.organization_members(organization_id,user_id,member_role) values(org_id,new.id,'owner');
 return new;
end $$;
create trigger auth_user_created after insert on auth.users for each row execute function public.bootstrap_user();
`;
const catalogs=['jurisdictions','entity_types','authorities','regulatory_sources','regulatory_rules','billing_products','billing_prices','workflow_templates','workflow_template_steps'];
const internalOnly=['partners','partner_services','source_snapshots','source_change_events','source_monitor_runs','audit_logs','webhook_events','rate_limits','rule_source_evidence'];
for(const [name,cols] of Object.entries(tables)) {
 sql += `alter table public.${name} enable row level security;\nrevoke all on public.${name} from anon,authenticated;\ngrant all on public.${name} to service_role;\n`;
 if(!['webhook_events','rate_limits'].includes(name)) sql += `grant select on public.${name} to authenticated;\n`;
 if(cols.includes('updated_at')) sql += `create trigger touch_${name} before update on public.${name} for each row execute function public.touch_updated_at();\n`;
 if(['audit_logs','case_events','obligation_events','consents'].includes(name)) sql += `create trigger immutable_${name} before update or delete on public.${name} for each row execute function public.reject_append_only_mutation();\n`;
 if(catalogs.includes(name)) sql += `grant select on public.${name} to anon;\ncreate policy catalog_read on public.${name} for select to anon,authenticated using(true);\n`;
 else if(name==='profiles') sql += `create policy profile_read on public.profiles for select to authenticated using(id=auth.uid() or public.is_internal_user());\ngrant update(display_name,preferred_language,timezone) on public.profiles to authenticated;\ncreate policy profile_update on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());\n`;
 else if(name==='organizations') sql += `create policy organization_read on public.organizations for select to authenticated using(public.is_org_member(id) or public.is_internal_user());\n`;
 else if(internalOnly.includes(name)) sql += `create policy internal_read on public.${name} for select to authenticated using(public.is_compliance_user());\n`;
 else if(name==='regulatory_rule_versions') sql += `grant select on public.${name} to anon;\ncreate policy active_rules_read on public.${name} for select to anon,authenticated using(status='ACTIVE' or public.is_compliance_user());\n`;
 else if(name==='obligation_templates') sql += `create policy template_read on public.${name} for select to authenticated using(active or public.is_compliance_user());\n`;
 else if(cols.includes(org)) sql += `create policy tenant_read on public.${name} for select to authenticated using(public.is_org_member(organization_id) or public.is_internal_user());\n`;
}
sql += `
-- No customer direct writes to operational decisions, membership, billing, identity or regulation.
-- Server operations validate actor and tenant; evidence publication is additionally guarded below.
grant usage,select on all sequences in schema public to service_role;
revoke execute on all functions in schema public from public,anon,authenticated;
grant execute on function public.is_org_member(uuid), public.is_org_owner(uuid), public.is_internal_user(),public.is_compliance_user(),public.can_access_case(uuid) to authenticated;
grant execute on function public.is_compliance_user() to anon;
grant execute on all functions in schema public to service_role;
create index organization_members_user_idx on public.organization_members(user_id,status);
create index obligations_due_idx on public.company_obligations(due_at,status);
create index rule_versions_effective_idx on public.regulatory_rule_versions(rule_id,status,effective_from,effective_to);
create index source_snapshot_source_idx on public.source_snapshots(source_id,fetched_at desc);
create index case_events_case_idx on public.case_events(case_id,created_at);
commit;
`;
mkdirSync('supabase/migrations',{recursive:true});
writeFileSync('supabase/migrations/202608310001_foundation.sql',sql);
writeFileSync('docs/schema-catalog.json',JSON.stringify(Object.keys(tables),null,2));
