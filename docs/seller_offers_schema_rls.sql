-- Basic offers schema for /seller/promotions and /admin/offers.
-- Apply this SQL if public.offers is not already present in the main v3 schema.
-- Offers can be restaurant-scoped, or app-wide when restaurant_id is null.

create table if not exists public.offers (
  id bigserial primary key,
  restaurant_id bigint references public.restaurants(id) on delete cascade,
  title text not null,
  description text,
  discount_type text not null default 'percent' check (discount_type in ('percent', 'fixed')),
  discount_value numeric(12, 2) not null check (discount_value > 0),
  min_order_amount numeric(12, 2) not null default 0 check (min_order_amount >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

alter table public.offers
  add column if not exists restaurant_id bigint references public.restaurants(id) on delete cascade,
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists discount_type text not null default 'percent',
  add column if not exists discount_value numeric(12, 2) not null default 0,
  add column if not exists min_order_amount numeric(12, 2) not null default 0,
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists status text not null default 'active',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists offers_restaurant_status_idx
on public.offers (restaurant_id, status, created_at desc);

drop trigger if exists set_offers_updated_at on public.offers;
create trigger set_offers_updated_at
before update on public.offers
for each row execute function public.set_updated_at();

alter table public.offers enable row level security;

grant select on public.offers to authenticated;
grant insert, update, delete on public.offers to authenticated;
grant usage, select on sequence public.offers_id_seq to authenticated;

drop policy if exists "admins manage all offers" on public.offers;
create policy "admins manage all offers"
on public.offers for all
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = (select public.current_app_user_id())
      and u.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.users u
    where u.id = (select public.current_app_user_id())
      and u.role = 'admin'
  )
);

drop policy if exists "restaurant owners manage own offers" on public.offers;
create policy "restaurant owners manage own offers"
on public.offers for all
to authenticated
using (
  restaurant_id is not null
  and exists (
    select 1
    from public.restaurants r
    where r.id = offers.restaurant_id
      and r.owner_user_id = (select public.current_app_user_id())
  )
)
with check (
  restaurant_id is not null
  and exists (
    select 1
    from public.restaurants r
    where r.id = offers.restaurant_id
      and r.owner_user_id = (select public.current_app_user_id())
  )
);
