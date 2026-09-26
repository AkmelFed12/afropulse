-- Table abonnements
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_name text not null,
  plan_name text not null,
  billing_cycle text check (billing_cycle in ('monthly','yearly')) not null,
  amount numeric not null,
  gateway text check (gateway in ('WAVE','ORANGE')) not null,
  tx_reference text not null,
--   status text check (status in ('en_attente','actif','expire','rejete')) default 'en_attente',
  created_at timestamptz default now()
);

-- Table entreprises / RCCM
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  rccm_number text not null,
  cc_number text not null,
  document_url text not null,
  status text check (status in ('en_attente','approuve','rejete')) default 'en_attente',
  created_at timestamptz default now()
);

-- RLS
alter table public.subscriptions enable row level security;
alter table public.businesses   enable row level security;

-- Politiques (démo — à durcir en production)
create policy "sub_select" on public.subscriptions for select using (true);
create policy "sub_insert" on public.subscriptions for insert with check (true);
create policy "sub_update" on public.subscriptions for update using (true);

create policy "bus_select" on public.businesses for select using (true);
create policy "bus_insert" on public.businesses for insert with check (true);
create policy "bus_update" on public.businesses for update using (true);