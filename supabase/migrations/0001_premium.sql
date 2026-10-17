-- StarTap web Premium migration (applied to StarTap project rrnefbnzayeskapmtseo on 2026-10-17)
create extension if not exists pgcrypto;

-- profiles
create table public.profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

-- payments
create table public.payments (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid not null references auth.users(id) on delete cascade,
  tx_ref                      text not null unique,
  flutterwave_transaction_id  text unique,
  plan                        text not null check (plan in ('premium_monthly','premium_yearly')),
  amount                      numeric(12,2) not null check (amount > 0),
  currency                    text not null check (currency in ('NGN','USD')),
  status                      text not null default 'pending'
                              check (status in ('pending','successful','failed','cancelled')),
  verified_at                 timestamptz,
  created_at                  timestamptz not null default now()
);
create index payments_user_id_created_idx on public.payments (user_id, created_at desc);

-- entitlements
create table public.entitlements (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  plan                 text not null check (plan in ('premium_monthly','premium_yearly')),
  status               text not null check (status in ('active','expired','cancelled','pending','failed')),
  provider             text not null default 'flutterwave',
  current_period_start timestamptz,
  current_period_end   timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index entitlements_period_end_idx on public.entitlements (current_period_end);

-- webhook idempotency log (server only)
create table public.webhook_events (
  event_key    text primary key,          -- e.g. 'charge.completed:<flw tx id>'
  received_at  timestamptz not null default now(),
  processed_at timestamptz
);

-- keep updated_at fresh
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;
create trigger entitlements_touch before update on public.entitlements
for each row execute function public.touch_updated_at();

-- auto-create profile on sign-up
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, email) values (new.id, new.email)
  on conflict (user_id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- ROW LEVEL SECURITY
alter table public.profiles       enable row level security;
alter table public.payments       enable row level security;
alter table public.entitlements   enable row level security;
alter table public.webhook_events enable row level security;

-- read-only, own rows only
create policy "read own profile"     on public.profiles     for select to authenticated using ((select auth.uid()) = user_id);
create policy "read own payments"    on public.payments     for select to authenticated using ((select auth.uid()) = user_id);
create policy "read own entitlement" on public.entitlements for select to authenticated using ((select auth.uid()) = user_id);
-- No insert/update/delete policies on any table, and none at all on webhook_events:
-- browsers (anon/authenticated) cannot write; only the service role (server routes) can.

-- belt and braces: strip write privileges from browser roles
revoke insert, update, delete on public.profiles, public.payments, public.entitlements from anon, authenticated;
revoke all on public.webhook_events from anon, authenticated;

-- hardening (advisor fix): trigger functions must not be callable via the API
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
