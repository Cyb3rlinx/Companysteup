begin;
alter table public.subscriptions add column last_event_created bigint not null default 0;
create unique index one_open_subscription_per_company on public.subscriptions(company_id) where status not in ('canceled','incomplete_expired');
commit;
