begin;
-- Server-only transaction boundary. Table/column identifiers are catalog validated and quoted.
create function public.apply_operations(operations jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare op jsonb; tbl text; col text; cols text; vals text; sets text; filters text; result jsonb='[]'; item jsonb; count_rows integer;
begin
 if jsonb_array_length(operations)>500 then raise exception 'Too many operations'; end if;
 for op in select * from jsonb_array_elements(operations) loop
  tbl=op->>'table';
  if tbl not in ('founder_profiles','founder_addresses','founder_tax_residencies','business_profiles','business_owners','questionnaire_answers','consents','formation_cases','case_steps','case_tasks','case_events','case_escalations','case_documents','document_extractions','companies','company_owners','company_officers','company_addresses','company_documents','company_registrations','company_obligations','obligation_events','regulatory_alerts','orders','subscriptions','notifications','support_tickets','audit_logs','regulatory_sources','source_snapshots','source_change_events','source_monitor_runs','regulatory_rule_versions','rule_source_evidence','obligation_templates','webhook_events','risk_assessments','identity_verifications','screening_results') then raise exception 'Table not permitted'; end if;
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
-- Durable throttling for server endpoints.
create function public.take_rate_limit(bucket text,max_requests integer,seconds integer) returns boolean language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 insert into public.rate_limits(id,count,window_start) values(bucket,1,now()) on conflict(id) do update set
 count=case when rate_limits.window_start<now()-make_interval(secs=>seconds) then 1 else rate_limits.count+1 end,
 window_start=case when rate_limits.window_start<now()-make_interval(secs=>seconds) then now() else rate_limits.window_start end returning count into n;
 return n<=max_requests;
end $$;
revoke all on function public.take_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.take_rate_limit(text,integer,integer) to service_role;
commit;
