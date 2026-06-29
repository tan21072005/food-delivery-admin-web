-- Basic seller offers schema for /seller/promotions.
-- Apply this SQL before using the promotions UI.
-- RLS keeps sellers scoped to restaurants they own.

create table if not exists public.offers (
  id bigserial primary key,
  restaurant_id bigint not null references public.restaurants(id) on delete cascade,
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

drop policy if exists "restaurant owners manage own offers" on public.offers;
create policy "restaurant owners manage own offers"
on public.offers for all
to authenticated
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = offers.restaurant_id
      and r.owner_user_id = (select public.current_app_user_id())
  )
)
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = offers.restaurant_id
      and r.owner_user_id = (select public.current_app_user_id())
  )
);
