begin;

create table public.agent_conversations (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references organizations(id),
 case_id uuid not null references formation_cases(id),
 jurisdiction_code text not null references jurisdictions(code) check(jurisdiction_code='US-WY'),
 status text not null default 'active' check(status in ('active','ready_for_packet_review','blocked','closed')),
 execution_mode text not null check(execution_mode in ('DETERMINISTIC_MOCK','OPENAI_RESPONSES')),
 model text,
 synthetic boolean not null check(synthetic=true),
 state_json jsonb not null default '{}',
 pending_patch jsonb not null default '{}',
 revision integer not null default 0 check(revision>=0),
 client_request_id uuid not null,
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(organization_id,client_request_id)
);

create table public.agent_conversation_turns (
 id bigint generated always as identity primary key,
 organization_id uuid not null references organizations(id),
 conversation_id uuid not null references agent_conversations(id),
 turn_kind text not null check(turn_kind in ('USER_MESSAGE','PATCH_ACCEPTED','PATCH_REJECTED')),
 customer_message text,
 assistant_message text not null,
 proposed_patch jsonb not null default '{}',
 model_status text not null check(model_status in ('DETERMINISTIC_MOCK','OPENAI_STRUCTURED','EXTERNAL_BLOCKED','NOT_APPLICABLE')),
 client_request_id uuid not null,
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 unique(conversation_id,client_request_id)
);

alter table public.agent_conversations add unique(id,organization_id);
alter table public.agent_conversations add constraint agent_conversations_case_id_tenant foreign key(case_id,organization_id) references public.formation_cases(id,organization_id);
alter table public.agent_conversation_turns add unique(id,organization_id);
alter table public.agent_conversation_turns add constraint agent_conversation_turns_conversation_id_tenant foreign key(conversation_id,organization_id) references public.agent_conversations(id,organization_id);
create index agent_conversations_case_idx on public.agent_conversations(case_id,created_at desc);
create index agent_conversation_turns_conversation_idx on public.agent_conversation_turns(conversation_id,id);

create trigger touch_agent_conversations before update on public.agent_conversations for each row execute function public.touch_updated_at();
create trigger immutable_agent_conversation_turns before update or delete on public.agent_conversation_turns for each row execute function public.reject_append_only_mutation();

alter table public.agent_conversations enable row level security;
revoke all on public.agent_conversations from anon,authenticated;
grant all on public.agent_conversations to service_role;
grant select on public.agent_conversations to authenticated;
create policy tenant_read on public.agent_conversations for select to authenticated using(public.is_org_member(organization_id) or public.is_internal_user());

alter table public.agent_conversation_turns enable row level security;
revoke all on public.agent_conversation_turns from anon,authenticated;
grant all on public.agent_conversation_turns to service_role;
grant select on public.agent_conversation_turns to authenticated;
create policy tenant_read on public.agent_conversation_turns for select to authenticated using(public.is_org_member(organization_id) or public.is_internal_user());

create or replace function public.apply_operations(operations jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare op jsonb; tbl text; col text; cols text; vals text; sets text; filters text; result jsonb='[]'; item jsonb; count_rows integer;
begin
 if jsonb_array_length(operations)>500 then raise exception 'Too many operations'; end if;
 for op in select * from jsonb_array_elements(operations) loop
  tbl=op->>'table';
  if tbl not in ('founder_profiles','founder_addresses','founder_tax_residencies','business_profiles','business_owners','questionnaire_answers','consents','formation_cases','case_steps','case_tasks','case_events','case_escalations','case_documents','document_extractions','companies','company_owners','company_officers','company_addresses','company_documents','company_registrations','company_obligations','obligation_events','regulatory_alerts','orders','subscriptions','notifications','support_tickets','audit_logs','regulatory_sources','source_snapshots','source_change_events','source_monitor_runs','regulatory_rule_versions','rule_source_evidence','obligation_templates','webhook_events','risk_assessments','identity_verifications','screening_results','agent_conversations','agent_conversation_turns') then raise exception 'Table not permitted'; end if;
  cols='';vals='';sets='';filters='';
  for col in select jsonb_object_keys(op->'data') loop
   if not exists(select 1 from information_schema.columns where table_schema='public' and table_name=tbl and column_name=col) then raise exception 'Unknown column'; end if;
   cols=cols||case when cols='' then '' else ',' end||format('%I',col);
   vals=vals||case when vals='' then '' else ',' end||format('r.%I',col);
   sets=sets||case when sets='' then '' else ',' end||format('%I=r.%I',col,col);
  end loop;
  if op->>'kind'='insert' then
   execute format('with r as(select * from jsonb_populate_record(null::public.%I,$1)), i as(insert into public.%I(%s) select %s from r returning *) select to_jsonb(i) from i',tbl,tbl,cols,vals) into item using op->'data';
  elsif op->>'kind'='update' then
   if not (op ? 'where') or op->'where'='{}'::jsonb then raise exception 'Update filter required'; end if;
   for col in select jsonb_object_keys(op->'where') loop
    if not exists(select 1 from information_schema.columns where table_schema='public' and table_name=tbl and column_name=col) then raise exception 'Unknown filter'; end if;
    filters=filters||case when filters='' then '' else ' and ' end||format('t.%I is not distinct from f.%I',col,col);
   end loop;
   execute format('with r as(select * from jsonb_populate_record(null::public.%I,$1)), f as(select * from jsonb_populate_record(null::public.%I,$2)), u as(update public.%I t set %s from r,f where %s returning t.*) select to_jsonb(u) from u',tbl,tbl,tbl,sets,filters) into item using op->'data',op->'where';
   get diagnostics count_rows=row_count;
   if count_rows<>1 then raise exception 'Concurrent update or missing resource' using errcode='40001'; end if;
  else raise exception 'Unknown operation'; end if;
  result=result||jsonb_build_array(item);
 end loop;
 return result;
end $$;
revoke all on function public.apply_operations(jsonb) from public,anon,authenticated;
grant execute on function public.apply_operations(jsonb) to service_role;

commit;
