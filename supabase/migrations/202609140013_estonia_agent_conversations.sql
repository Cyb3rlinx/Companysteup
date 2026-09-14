begin;

alter table public.agent_conversations
  drop constraint agent_conversations_jurisdiction_code_check;

alter table public.agent_conversations
  add constraint agent_conversations_jurisdiction_code_check
  check (jurisdiction_code in ('US-WY','US-DE','EE'));

commit;
