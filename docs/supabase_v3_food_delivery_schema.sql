-- Food Delivery Supabase schema v3
-- Purpose: production-style target schema for Customer app ordering.
-- Safe principle: no DROP SCHEMA here. Run on a new project, or adapt as a migration.

-- ============================================================
-- 1. ENUMS
-- ============================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_user_role') then
    create type public.app_user_role as enum ('customer', 'restaurant_owner', 'driver', 'admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'account_status') then
    create type public.account_status as enum ('active', 'inactive', 'banned', 'pending_verify');
  end if;
  if not exists (select 1 from pg_type where typname = 'restaurant_status') then
    create type public.restaurant_status as enum ('active', 'inactive', 'suspended');
  end if;
  if not exists (select 1 from pg_type where typname = 'catalog_status') then
    create type public.catalog_status as enum ('active', 'inactive');
  end if;
  if not exists (select 1 from pg_type where typname = 'menu_item_status') then
    create type public.menu_item_status as enum ('active', 'inactive', 'sold_out');
  end if;
  if not exists (select 1 from pg_type where typname = 'option_selection_type') then
    create type public.option_selection_type as enum ('single', 'multiple');
  end if;
  if not exists (select 1 from pg_type where typname = 'cart_status') then
    create type public.cart_status as enum ('active', 'checked_out', 'abandoned');
  end if;
  if not exists (select 1 from pg_type where typname = 'app_order_status') then
    create type public.app_order_status as enum (
      'pending',
      'confirmed',
      'preparing',
      'ready_for_pickup',
      'delivering',
      'completed',
      'cancelled'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'app_payment_method') then
    create type public.app_payment_method as enum ('COD', 'MOMO', 'ZALOPAY', 'BANK_CARD');
  end if;
  if not exists (select 1 from pg_type where typname = 'app_payment_status') then
    create type public.app_payment_status as enum ('pending', 'paid', 'failed', 'refunded');
  end if;
end $$;

-- ============================================================
-- 2. COMMON TRIGGER
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 3. USERS AND CUSTOMER DATA
-- ============================================================
create table if not exists public.users (
  id bigserial primary key,
  auth_uid uuid unique references auth.users(id) on delete cascade,
  role public.app_user_role not null default 'customer',
  full_name text not null,
  phone_number text unique,
  email text unique not null,
  avatar_url text,
  status public.account_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.delivery_addresses (
  id bigserial primary key,
  customer_id bigint not null references public.users(id) on delete cascade,
  label text not null,
  receiver_name text not null,
  receiver_phone text not null,
  address_line text not null,
  building_name text,
  floor text,
  gate_note text,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  is_default boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 4. RESTAURANT AND MENU CATALOG
-- ============================================================
create table if not exists public.cuisines (
  id bigserial primary key,
  name text not null,
  slug text not null unique,
  icon_url text,
  sort_order int not null default 0,
  status public.catalog_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.restaurants (
  id bigserial primary key,
  owner_user_id bigint not null references public.users(id) on delete cascade,
  cuisine_id bigint references public.cuisines(id) on delete set null,
  name text not null,
  description text,
  phone_number text,
  address text not null,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  logo_url text,
  cover_url text,
  avg_rating numeric(3, 2) not null default 0 check (avg_rating >= 0 and avg_rating <= 5),
  total_reviews int not null default 0 check (total_reviews >= 0),
  is_open boolean not null default false,
  status public.restaurant_status not null default 'active',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, name)
);

create table if not exists public.dish_categories (
  id bigserial primary key,
  restaurant_id bigint not null references public.restaurants(id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order int not null default 0,
  status public.catalog_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, slug)
);

create table if not exists public.menu_items (
  id bigserial primary key,
  restaurant_id bigint not null references public.restaurants(id) on delete cascade,
  dish_category_id bigint references public.dish_categories(id) on delete set null,
  name text not null,
  description text,
  base_price numeric(12, 2) not null check (base_price >= 0),
  image_url text,
  avg_rating numeric(3, 2) not null default 0 check (avg_rating >= 0 and avg_rating <= 5),
  sold_count int not null default 0 check (sold_count >= 0),
  status public.menu_item_status not null default 'active',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, name)
);

create table if not exists public.menu_option_groups (
  id bigserial primary key,
  menu_item_id bigint not null references public.menu_items(id) on delete cascade,
  name text not null,
  selection_type public.option_selection_type not null,
  min_select int not null default 0 check (min_select >= 0),
  max_select int not null default 1 check (max_select >= 1),
  is_required boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (max_select >= min_select),
  unique (menu_item_id, name)
);

create table if not exists public.menu_option_choices (
  id bigserial primary key,
  option_group_id bigint not null references public.menu_option_groups(id) on delete cascade,
  name text not null,
  price_delta numeric(12, 2) not null default 0,
  is_available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (option_group_id, name)
);

-- ============================================================
-- 5. CARTS: DRAFT ORDERS
-- ============================================================
create table if not exists public.carts (
  id bigserial primary key,
  customer_id bigint not null references public.users(id) on delete cascade,
  restaurant_id bigint not null references public.restaurants(id) on delete cascade,
  status public.cart_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists carts_one_active_per_restaurant_idx
  on public.carts (customer_id, restaurant_id)
  where status = 'active';

create table if not exists public.cart_items (
  id bigserial primary key,
  cart_id bigint not null references public.carts(id) on delete cascade,
  menu_item_id bigint not null references public.menu_items(id) on delete restrict,
  quantity int not null check (quantity > 0),
  last_known_unit_price numeric(12, 2) check (last_known_unit_price is null or last_known_unit_price >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_item_options (
  id bigserial primary key,
  cart_item_id bigint not null references public.cart_items(id) on delete cascade,
  option_choice_id bigint references public.menu_option_choices(id) on delete set null,
  option_name_snapshot text not null,
  price_delta_snapshot numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 6. ORDERS: CHECKED OUT CARTS
-- ============================================================
create table if not exists public.orders (
  id bigserial primary key,
  customer_id bigint not null references public.users(id) on delete restrict,
  restaurant_id bigint not null references public.restaurants(id) on delete restrict,
  cart_id bigint references public.carts(id) on delete set null,
  delivery_address_id bigint references public.delivery_addresses(id) on delete set null,
  delivery_address_snapshot_json jsonb,
  status public.app_order_status not null default 'pending',
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  delivery_fee numeric(12, 2) not null default 0 check (delivery_fee >= 0),
  discount_amount numeric(12, 2) not null default 0 check (discount_amount >= 0),
  total_amount numeric(12, 2) not null default 0 check (total_amount >= 0),
  payment_method public.app_payment_method not null default 'COD',
  payment_status public.app_payment_status not null default 'pending',
  note text,
  cancelled_reason text,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_lines (
  id bigserial primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  menu_item_id bigint references public.menu_items(id) on delete set null,
  item_name_snapshot text not null,
  item_image_snapshot text,
  quantity int not null check (quantity > 0),
  unit_price_snapshot numeric(12, 2) not null check (unit_price_snapshot >= 0),
  options_snapshot_json jsonb,
  subtotal numeric(12, 2) generated always as (unit_price_snapshot * quantity) stored
);

create table if not exists public.order_status_history (
  id bigserial primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  from_status public.app_order_status,
  to_status public.app_order_status not null,
  changed_by_user_id bigint references public.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id bigserial primary key,
  order_id bigint not null unique references public.orders(id) on delete cascade,
  provider public.app_payment_method not null default 'COD',
  amount numeric(12, 2) not null check (amount >= 0),
  status public.app_payment_status not null default 'pending',
  transaction_id text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 7. COMPATIBILITY VIEW FOR CURRENT ANDROID CODE
-- Existing Android FoodItem expects menus.item_name and menus.price.
-- Point API/RPC to this view only after migrating from the old menus table.
-- ============================================================
drop view if exists public.menus_compat;

create view public.menus_compat
with (security_invoker = true)
as
select
  mi.id,
  mi.restaurant_id,
  mi.dish_category_id as category_id,
  mi.name as item_name,
  mi.description,
  mi.image_url,
  mi.base_price as price,
  mi.avg_rating as rating,
  mi.status::text as status,
  mi.sold_count
from public.menu_items mi
where mi.deleted_at is null;

grant select on public.menus_compat to anon, authenticated;

-- ============================================================
-- 8. INDEXES
-- ============================================================
create index if not exists users_auth_uid_idx on public.users (auth_uid);
create index if not exists users_role_idx on public.users (role);

create index if not exists delivery_addresses_customer_idx on public.delivery_addresses (customer_id);

create index if not exists restaurants_owner_idx on public.restaurants (owner_user_id);
create index if not exists restaurants_cuisine_idx on public.restaurants (cuisine_id);
create index if not exists restaurants_status_open_idx on public.restaurants (status, is_open);
create index if not exists restaurants_location_idx on public.restaurants (latitude, longitude);

create index if not exists dish_categories_restaurant_idx on public.dish_categories (restaurant_id, sort_order);

create index if not exists menu_items_restaurant_idx on public.menu_items (restaurant_id);
create index if not exists menu_items_category_idx on public.menu_items (dish_category_id);
create index if not exists menu_items_status_idx on public.menu_items (status);
create index if not exists menu_items_top_selling_idx on public.menu_items (sold_count desc, avg_rating desc);

create index if not exists menu_option_groups_item_idx on public.menu_option_groups (menu_item_id, sort_order);
create index if not exists menu_option_choices_group_idx on public.menu_option_choices (option_group_id, sort_order);

create index if not exists carts_customer_status_idx on public.carts (customer_id, status, updated_at desc);
create index if not exists carts_restaurant_idx on public.carts (restaurant_id);

create index if not exists cart_items_cart_idx on public.cart_items (cart_id);
create index if not exists cart_items_menu_item_idx on public.cart_items (menu_item_id);
create index if not exists cart_item_options_item_idx on public.cart_item_options (cart_item_id);

create index if not exists orders_customer_status_created_idx on public.orders (customer_id, status, created_at desc);
create index if not exists orders_restaurant_status_created_idx on public.orders (restaurant_id, status, created_at desc);
create index if not exists orders_cart_idx on public.orders (cart_id);
create index if not exists order_lines_order_idx on public.order_lines (order_id);
create index if not exists order_status_history_order_idx on public.order_status_history (order_id, created_at desc);
create index if not exists payments_order_idx on public.payments (order_id);

-- ============================================================
-- 9. UPDATED_AT TRIGGERS
-- ============================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'users',
    'delivery_addresses',
    'cuisines',
    'restaurants',
    'dish_categories',
    'menu_items',
    'menu_option_groups',
    'menu_option_choices',
    'carts',
    'cart_items',
    'orders',
    'payments'
  ]
  loop
    if not exists (
      select 1
      from pg_trigger
      where tgname = format('trg_%s_updated_at', t)
    ) then
      execute format(
        'create trigger trg_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
        t,
        t
      );
    end if;
  end loop;
end $$;

-- ============================================================
-- 10. RLS HELPERS
-- ============================================================
create or replace function public.current_app_user_id()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select u.id
  from public.users u
  where u.auth_uid = (select auth.uid())
  limit 1;
$$;

revoke all on function public.current_app_user_id() from public;
grant execute on function public.current_app_user_id() to authenticated;

create or replace function public.handle_new_auth_user_v3()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    auth_uid,
    role,
    full_name,
    phone_number,
    email,
    avatar_url,
    status
  )
  values (
    new.id,
    'customer',
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, new.phone, new.id::text), '@', 1),
      'Customer'
    ),
    new.phone,
    coalesce(new.email, new.id::text || '@auth.local'),
    new.raw_user_meta_data ->> 'avatar_url',
    'active'
  )
  on conflict (auth_uid) do update
  set
    email = excluded.email,
    phone_number = coalesce(public.users.phone_number, excluded.phone_number),
    avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_v3 on auth.users;
create trigger on_auth_user_created_v3
after insert on auth.users
for each row execute function public.handle_new_auth_user_v3();

insert into public.users (
  auth_uid,
  role,
  full_name,
  phone_number,
  email,
  avatar_url,
  status
)
select
  au.id,
  'customer',
  coalesce(
    au.raw_user_meta_data ->> 'full_name',
    au.raw_user_meta_data ->> 'name',
    split_part(coalesce(au.email, au.phone, au.id::text), '@', 1),
    'Customer'
  ),
  au.phone,
  coalesce(au.email, au.id::text || '@auth.local'),
  au.raw_user_meta_data ->> 'avatar_url',
  'active'
from auth.users au
on conflict (auth_uid) do update
set
  email = excluded.email,
  phone_number = coalesce(public.users.phone_number, excluded.phone_number),
  avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
  updated_at = now();

create or replace function public.ensure_current_user_profile_v3(
  p_full_name text default null,
  p_phone_number text default null,
  p_avatar_url text default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_uid uuid;
  v_email text;
  v_user_id bigint;
begin
  v_auth_uid := (select auth.uid());
  if v_auth_uid is null then
    raise exception 'Not authenticated';
  end if;

  v_email := coalesce(
    nullif((select auth.jwt() ->> 'email'), ''),
    v_auth_uid::text || '@auth.local'
  );

  insert into public.users (
    auth_uid,
    role,
    full_name,
    phone_number,
    email,
    avatar_url,
    status
  )
  values (
    v_auth_uid,
    'customer',
    coalesce(
      nullif(p_full_name, ''),
      nullif((select auth.jwt() -> 'user_metadata' ->> 'full_name'), ''),
      nullif((select auth.jwt() -> 'user_metadata' ->> 'name'), ''),
      split_part(v_email, '@', 1),
      'Customer'
    ),
    nullif(p_phone_number, ''),
    v_email,
    nullif(p_avatar_url, ''),
    'active'
  )
  on conflict (auth_uid) do update
  set
    full_name = coalesce(nullif(excluded.full_name, ''), public.users.full_name),
    phone_number = coalesce(nullif(excluded.phone_number, ''), public.users.phone_number),
    email = excluded.email,
    avatar_url = coalesce(nullif(excluded.avatar_url, ''), public.users.avatar_url),
    updated_at = now()
  returning id into v_user_id;

  return v_user_id;
end;
$$;

revoke all on function public.handle_new_auth_user_v3() from public;
revoke all on function public.ensure_current_user_profile_v3(text, text, text) from public;
grant execute on function public.ensure_current_user_profile_v3(text, text, text) to authenticated;

-- ============================================================
-- 11. RLS
-- ============================================================
alter table public.users enable row level security;
alter table public.delivery_addresses enable row level security;
alter table public.cuisines enable row level security;
alter table public.restaurants enable row level security;
alter table public.dish_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.menu_option_groups enable row level security;
alter table public.menu_option_choices enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.cart_item_options enable row level security;
alter table public.orders enable row level security;
alter table public.order_lines enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payments enable row level security;

-- ============================================================
-- 11A. API GRANTS
-- Supabase Data API needs table/function privileges first; RLS then
-- decides which rows are visible or writable.
-- ============================================================
grant usage on schema public to anon, authenticated;

grant select on public.cuisines to anon, authenticated;
grant select on public.restaurants to anon, authenticated;
grant select on public.dish_categories to anon, authenticated;
grant select on public.menu_items to anon, authenticated;
grant select on public.menu_option_groups to anon, authenticated;
grant select on public.menu_option_choices to anon, authenticated;
grant select on public.menus_compat to anon, authenticated;

grant insert, update, delete on public.restaurants to authenticated;
grant insert, update, delete on public.dish_categories to authenticated;
grant insert, update, delete on public.menu_items to authenticated;
grant insert, update, delete on public.menu_option_groups to authenticated;
grant insert, update, delete on public.menu_option_choices to authenticated;

grant select, update on public.users to authenticated;
grant select, insert, update, delete on public.delivery_addresses to authenticated;
grant select, insert, update, delete on public.carts to authenticated;
grant select, insert, update, delete on public.cart_items to authenticated;
grant select, insert, update, delete on public.cart_item_options to authenticated;
grant select on public.orders to authenticated;
grant select on public.order_lines to authenticated;
grant select on public.order_status_history to authenticated;
grant select on public.payments to authenticated;

grant usage, select on all sequences in schema public to authenticated;

drop policy if exists "users read own profile" on public.users;
create policy "users read own profile"
on public.users for select
to authenticated
using (id = (select public.current_app_user_id()));

drop policy if exists "users update own profile" on public.users;
create policy "users update own profile"
on public.users for update
to authenticated
using (id = (select public.current_app_user_id()))
with check (id = (select public.current_app_user_id()));

drop policy if exists "public read active cuisines" on public.cuisines;
create policy "public read active cuisines"
on public.cuisines for select
to anon, authenticated
using (status = 'active');

drop policy if exists "public read open restaurants" on public.restaurants;
create policy "public read open restaurants"
on public.restaurants for select
to anon, authenticated
using (status = 'active' and is_open = true and deleted_at is null);

drop policy if exists "owner manage own restaurants" on public.restaurants;
create policy "owner manage own restaurants"
on public.restaurants for all
to authenticated
using (owner_user_id = (select public.current_app_user_id()))
with check (owner_user_id = (select public.current_app_user_id()));

drop policy if exists "public read active dish categories" on public.dish_categories;
create policy "public read active dish categories"
on public.dish_categories for select
to anon, authenticated
using (
  status = 'active'
  and exists (
    select 1
    from public.restaurants r
    where r.id = dish_categories.restaurant_id
      and r.status = 'active'
      and r.is_open = true
      and r.deleted_at is null
  )
);

drop policy if exists "owners manage own dish categories" on public.dish_categories;
create policy "owners manage own dish categories"
on public.dish_categories for all
to authenticated
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = dish_categories.restaurant_id
      and r.owner_user_id = (select public.current_app_user_id())
  )
)
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = dish_categories.restaurant_id
      and r.owner_user_id = (select public.current_app_user_id())
  )
);

drop policy if exists "public read active menu items" on public.menu_items;
create policy "public read active menu items"
on public.menu_items for select
to anon, authenticated
using (
  status = 'active'
  and deleted_at is null
  and exists (
    select 1
    from public.restaurants r
    where r.id = menu_items.restaurant_id
      and r.status = 'active'
      and r.is_open = true
      and r.deleted_at is null
  )
);

drop policy if exists "owners manage own menu items" on public.menu_items;
create policy "owners manage own menu items"
on public.menu_items for all
to authenticated
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = menu_items.restaurant_id
      and r.owner_user_id = (select public.current_app_user_id())
  )
)
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = menu_items.restaurant_id
      and r.owner_user_id = (select public.current_app_user_id())
  )
);

drop policy if exists "public read option groups for active items" on public.menu_option_groups;
create policy "public read option groups for active items"
on public.menu_option_groups for select
to anon, authenticated
using (
  exists (
    select 1
    from public.menu_items mi
    where mi.id = menu_option_groups.menu_item_id
      and mi.status = 'active'
      and mi.deleted_at is null
  )
);

drop policy if exists "owners manage own option groups" on public.menu_option_groups;
create policy "owners manage own option groups"
on public.menu_option_groups for all
to authenticated
using (
  exists (
    select 1
    from public.menu_items mi
    join public.restaurants r on r.id = mi.restaurant_id
    where mi.id = menu_option_groups.menu_item_id
      and r.owner_user_id = (select public.current_app_user_id())
  )
)
with check (
  exists (
    select 1
    from public.menu_items mi
    join public.restaurants r on r.id = mi.restaurant_id
    where mi.id = menu_option_groups.menu_item_id
      and r.owner_user_id = (select public.current_app_user_id())
  )
);

drop policy if exists "public read available option choices" on public.menu_option_choices;
create policy "public read available option choices"
on public.menu_option_choices for select
to anon, authenticated
using (is_available = true);

drop policy if exists "owners manage own option choices" on public.menu_option_choices;
create policy "owners manage own option choices"
on public.menu_option_choices for all
to authenticated
using (
  exists (
    select 1
    from public.menu_option_groups mog
    join public.menu_items mi on mi.id = mog.menu_item_id
    join public.restaurants r on r.id = mi.restaurant_id
    where mog.id = menu_option_choices.option_group_id
      and r.owner_user_id = (select public.current_app_user_id())
  )
)
with check (
  exists (
    select 1
    from public.menu_option_groups mog
    join public.menu_items mi on mi.id = mog.menu_item_id
    join public.restaurants r on r.id = mi.restaurant_id
    where mog.id = menu_option_choices.option_group_id
      and r.owner_user_id = (select public.current_app_user_id())
  )
);

drop policy if exists "customers manage own delivery addresses" on public.delivery_addresses;
create policy "customers manage own delivery addresses"
on public.delivery_addresses for all
to authenticated
using (customer_id = (select public.current_app_user_id()))
with check (customer_id = (select public.current_app_user_id()));

drop policy if exists "customers manage own carts" on public.carts;
create policy "customers manage own carts"
on public.carts for all
to authenticated
using (customer_id = (select public.current_app_user_id()))
with check (customer_id = (select public.current_app_user_id()));

drop policy if exists "customers manage own cart items" on public.cart_items;
create policy "customers manage own cart items"
on public.cart_items for all
to authenticated
using (
  exists (
    select 1 from public.carts c
    where c.id = cart_items.cart_id
      and c.customer_id = (select public.current_app_user_id())
  )
)
with check (
  exists (
    select 1 from public.carts c
    where c.id = cart_items.cart_id
      and c.customer_id = (select public.current_app_user_id())
  )
);

drop policy if exists "customers manage own cart item options" on public.cart_item_options;
create policy "customers manage own cart item options"
on public.cart_item_options for all
to authenticated
using (
  exists (
    select 1
    from public.cart_items ci
    join public.carts c on c.id = ci.cart_id
    where ci.id = cart_item_options.cart_item_id
      and c.customer_id = (select public.current_app_user_id())
  )
)
with check (
  exists (
    select 1
    from public.cart_items ci
    join public.carts c on c.id = ci.cart_id
    where ci.id = cart_item_options.cart_item_id
      and c.customer_id = (select public.current_app_user_id())
  )
);

drop policy if exists "customers read own orders" on public.orders;
create policy "customers read own orders"
on public.orders for select
to authenticated
using (customer_id = (select public.current_app_user_id()));

drop policy if exists "restaurant owners read restaurant orders" on public.orders;
create policy "restaurant owners read restaurant orders"
on public.orders for select
to authenticated
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = orders.restaurant_id
      and r.owner_user_id = (select public.current_app_user_id())
  )
);

drop policy if exists "customers read own order lines" on public.order_lines;
create policy "customers read own order lines"
on public.order_lines for select
to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = order_lines.order_id
      and o.customer_id = (select public.current_app_user_id())
  )
);

drop policy if exists "customers read own order history" on public.order_status_history;
create policy "customers read own order history"
on public.order_status_history for select
to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = order_status_history.order_id
      and o.customer_id = (select public.current_app_user_id())
  )
);

drop policy if exists "customers read own payments" on public.payments;
create policy "customers read own payments"
on public.payments for select
to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = payments.order_id
      and o.customer_id = (select public.current_app_user_id())
  )
);

-- ============================================================
-- 12. RPC: HOME, CART, CHECKOUT
-- ============================================================
create or replace function public.get_home_data_v3()
returns jsonb
language sql
stable
security invoker
as $$
  select jsonb_build_object(
    'categories', coalesce((
      select jsonb_agg(to_jsonb(c) order by c.sort_order, c.name)
      from public.cuisines c
      where c.status = 'active'
    ), '[]'::jsonb),
    'cuisines', coalesce((
      select jsonb_agg(to_jsonb(c) order by c.sort_order, c.name)
      from public.cuisines c
      where c.status = 'active'
    ), '[]'::jsonb),
    'restaurants', coalesce((
      select jsonb_agg(to_jsonb(r) order by r.avg_rating desc, r.total_reviews desc)
      from (
        select *
        from public.restaurants
        where status = 'active' and is_open = true and deleted_at is null
        order by avg_rating desc, total_reviews desc
        limit 20
      ) r
    ), '[]'::jsonb),
    'top_selling', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', mi.id,
          'restaurant_id', mi.restaurant_id,
          'category_id', mi.dish_category_id,
          'item_name', mi.name,
          'description', mi.description,
          'image_url', mi.image_url,
          'price', mi.base_price,
          'rating', mi.avg_rating,
          'status', mi.status::text,
          'sold_count', mi.sold_count
        )
        order by mi.sold_count desc, mi.avg_rating desc
      )
      from (
        select mi.*
        from public.menu_items mi
        join public.restaurants r on r.id = mi.restaurant_id
        where mi.status = 'active'
          and mi.deleted_at is null
          and r.status = 'active'
          and r.is_open = true
          and r.deleted_at is null
        order by mi.sold_count desc, mi.avg_rating desc
        limit 20
      ) mi
    ), '[]'::jsonb),
    'all_foods', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', mi.id,
          'restaurant_id', mi.restaurant_id,
          'category_id', mi.dish_category_id,
          'item_name', mi.name,
          'description', mi.description,
          'image_url', mi.image_url,
          'price', mi.base_price,
          'rating', mi.avg_rating,
          'status', mi.status::text,
          'sold_count', mi.sold_count
        )
        order by mi.avg_rating desc, mi.sold_count desc
      )
      from (
        select mi.*
        from public.menu_items mi
        join public.restaurants r on r.id = mi.restaurant_id
        where mi.status = 'active'
          and mi.deleted_at is null
          and r.status = 'active'
          and r.is_open = true
          and r.deleted_at is null
        order by mi.avg_rating desc, mi.sold_count desc
        limit 50
      ) mi
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.get_home_data_v3() from public;
grant execute on function public.get_home_data_v3() to anon, authenticated;

create or replace function public.add_to_cart_v3(
  p_menu_item_id bigint,
  p_quantity int default 1,
  p_note text default null,
  p_option_choice_ids bigint[] default '{}'
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id bigint;
  v_restaurant_id bigint;
  v_cart_id bigint;
  v_cart_item_id bigint;
  v_base_price numeric(12, 2);
  v_choice record;
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantity must be greater than 0';
  end if;

  select public.current_app_user_id() into v_customer_id;
  if v_customer_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  select mi.restaurant_id, mi.base_price
  into v_restaurant_id, v_base_price
  from public.menu_items mi
  where mi.id = p_menu_item_id
    and mi.status = 'active'
    and mi.deleted_at is null;

  if v_restaurant_id is null then
    raise exception 'Menu item is not available';
  end if;

  insert into public.carts (customer_id, restaurant_id, status)
  values (v_customer_id, v_restaurant_id, 'active')
  on conflict (customer_id, restaurant_id) where status = 'active'
  do update set updated_at = now()
  returning id into v_cart_id;

  insert into public.cart_items (cart_id, menu_item_id, quantity, note, last_known_unit_price)
  values (v_cart_id, p_menu_item_id, p_quantity, p_note, v_base_price)
  returning id into v_cart_item_id;

  for v_choice in
    select distinct on (moc.id) moc.id, moc.name, moc.price_delta
    from public.menu_option_choices moc
    join public.menu_option_groups mog on mog.id = moc.option_group_id
    where moc.id = any(p_option_choice_ids)
      and mog.menu_item_id = p_menu_item_id
      and moc.is_available = true
    order by moc.id
  loop
    insert into public.cart_item_options (
      cart_item_id,
      option_choice_id,
      option_name_snapshot,
      price_delta_snapshot
    )
    values (
      v_cart_item_id,
      v_choice.id,
      v_choice.name,
      v_choice.price_delta
    );
  end loop;

  return v_cart_id;
end;
$$;

revoke all on function public.add_to_cart_v3(bigint, int, text, bigint[]) from public;
grant execute on function public.add_to_cart_v3(bigint, int, text, bigint[]) to authenticated;

create or replace function public.get_draft_carts_v3()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id bigint;
  v_delivery_fee numeric(12, 2) := 15000;
  v_result jsonb;
begin
  select public.current_app_user_id() into v_customer_id;
  if v_customer_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'cart_id', c.id,
        'restaurant_id', r.id,
        'restaurant_name', r.name,
        'restaurant_logo_url', r.logo_url,
        'restaurant_cover_url', r.cover_url,
        'restaurant_rating', r.avg_rating,
        'restaurant_is_open', r.is_open,
        'item_count', totals.item_count,
        'line_count', totals.line_count,
        'subtotal', totals.subtotal,
        'delivery_fee', v_delivery_fee,
        'discount_amount', 0,
        'total_amount', totals.subtotal + v_delivery_fee,
        'updated_at', c.updated_at,
        'preview_items', coalesce(preview.items, '[]'::jsonb)
      )
      order by c.updated_at desc
    ),
    '[]'::jsonb
  )
  into v_result
  from public.carts c
  join public.restaurants r on r.id = c.restaurant_id
  join lateral (
    select
      count(*)::int as line_count,
      coalesce(sum(ci.quantity), 0)::int as item_count,
      coalesce(sum((mi.base_price + coalesce(opt.option_total, 0)) * ci.quantity), 0) as subtotal
    from public.cart_items ci
    join public.menu_items mi on mi.id = ci.menu_item_id
    left join lateral (
      select sum(cio.price_delta_snapshot) as option_total
      from public.cart_item_options cio
      where cio.cart_item_id = ci.id
    ) opt on true
    where ci.cart_id = c.id
  ) totals on true
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'cart_item_id', pi.cart_item_id,
        'menu_item_id', pi.menu_item_id,
        'item_name', pi.item_name,
        'image_url', pi.image_url,
        'quantity', pi.quantity,
        'unit_price', pi.unit_price,
        'options', pi.options
      )
      order by pi.created_at, pi.cart_item_id
    ) as items
    from (
      select
        ci.id as cart_item_id,
        mi.id as menu_item_id,
        mi.name as item_name,
        mi.image_url,
        ci.quantity,
        mi.base_price + coalesce(opt.option_total, 0) as unit_price,
        ci.created_at,
        coalesce(opt.options_json, '[]'::jsonb) as options
      from public.cart_items ci
      join public.menu_items mi on mi.id = ci.menu_item_id
      left join lateral (
        select
          sum(cio.price_delta_snapshot) as option_total,
          jsonb_agg(
            jsonb_build_object(
              'option_choice_id', cio.option_choice_id,
              'name', cio.option_name_snapshot,
              'price_delta', cio.price_delta_snapshot
            )
            order by cio.id
          ) as options_json
        from public.cart_item_options cio
        where cio.cart_item_id = ci.id
      ) opt on true
      where ci.cart_id = c.id
      order by ci.created_at, ci.id
      limit 3
    ) pi
  ) preview on true
  where c.customer_id = v_customer_id
    and c.status = 'active'
    and totals.line_count > 0
    and r.deleted_at is null;

  return v_result;
end;
$$;

revoke all on function public.get_draft_carts_v3() from public;
grant execute on function public.get_draft_carts_v3() to authenticated;

create or replace function public.get_cart_summary_v3(p_cart_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id bigint;
  v_cart_owner_id bigint;
  v_subtotal numeric(12, 2);
  v_delivery_fee numeric(12, 2) := 15000;
  v_result jsonb;
begin
  select public.current_app_user_id() into v_customer_id;

  select c.customer_id into v_cart_owner_id
  from public.carts c
  where c.id = p_cart_id and c.status = 'active';

  if v_customer_id is null or v_cart_owner_id is distinct from v_customer_id then
    raise exception 'Cart not found';
  end if;

  select coalesce(sum((mi.base_price + coalesce(opt.option_total, 0)) * ci.quantity), 0)
  into v_subtotal
  from public.cart_items ci
  join public.menu_items mi on mi.id = ci.menu_item_id
  left join (
    select cio.cart_item_id, sum(cio.price_delta_snapshot) as option_total
    from public.cart_item_options cio
    group by cio.cart_item_id
  ) opt on opt.cart_item_id = ci.id
  where ci.cart_id = p_cart_id;

  select jsonb_build_object(
    'cart_id', p_cart_id,
    'items', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'cart_item_id', ci.id,
          'menu_item_id', ci.menu_item_id,
          'item_name', mi.name,
          'image_url', mi.image_url,
          'quantity', ci.quantity,
          'base_price', mi.base_price,
          'note', ci.note,
          'options', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'option_choice_id', cio.option_choice_id,
                'name', cio.option_name_snapshot,
                'price_delta', cio.price_delta_snapshot
              )
            )
            from public.cart_item_options cio
            where cio.cart_item_id = ci.id
          ), '[]'::jsonb)
        )
      )
      from public.cart_items ci
      join public.menu_items mi on mi.id = ci.menu_item_id
      where ci.cart_id = p_cart_id
    ), '[]'::jsonb),
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery_fee,
    'discount_amount', 0,
    'total_amount', v_subtotal + v_delivery_fee
  )
  into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_cart_summary_v3(bigint) from public;
grant execute on function public.get_cart_summary_v3(bigint) to authenticated;

create or replace function public.checkout_cart_v3(
  p_cart_id bigint,
  p_delivery_address_id bigint,
  p_payment_method public.app_payment_method default 'COD',
  p_note text default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id bigint;
  v_cart record;
  v_address record;
  v_order_id bigint;
  v_subtotal numeric(12, 2);
  v_delivery_fee numeric(12, 2) := 15000;
  v_total numeric(12, 2);
begin
  select public.current_app_user_id() into v_customer_id;
  if v_customer_id is null then
    raise exception 'Authenticated user profile not found';
  end if;

  select *
  into v_cart
  from public.carts
  where id = p_cart_id
    and customer_id = v_customer_id
    and status = 'active';

  if v_cart.id is null then
    raise exception 'Active cart not found';
  end if;

  select *
  into v_address
  from public.delivery_addresses
  where id = p_delivery_address_id
    and customer_id = v_customer_id
    and deleted_at is null;

  if v_address.id is null then
    raise exception 'Delivery address not found';
  end if;

  select coalesce(sum((mi.base_price + coalesce(opt.option_total, 0)) * ci.quantity), 0)
  into v_subtotal
  from public.cart_items ci
  join public.menu_items mi on mi.id = ci.menu_item_id and mi.status = 'active' and mi.deleted_at is null
  left join (
    select cart_item_id, sum(price_delta_snapshot) as option_total
    from public.cart_item_options
    group by cart_item_id
  ) opt on opt.cart_item_id = ci.id
  where ci.cart_id = p_cart_id;

  if v_subtotal <= 0 then
    raise exception 'Cart is empty';
  end if;

  v_total := v_subtotal + v_delivery_fee;

  insert into public.orders (
    customer_id,
    restaurant_id,
    cart_id,
    delivery_address_id,
    delivery_address_snapshot_json,
    status,
    subtotal,
    delivery_fee,
    discount_amount,
    total_amount,
    payment_method,
    payment_status,
    note
  )
  values (
    v_customer_id,
    v_cart.restaurant_id,
    p_cart_id,
    p_delivery_address_id,
    jsonb_build_object(
      'label', v_address.label,
      'receiver_name', v_address.receiver_name,
      'receiver_phone', v_address.receiver_phone,
      'address_line', v_address.address_line,
      'building_name', v_address.building_name,
      'floor', v_address.floor,
      'gate_note', v_address.gate_note,
      'latitude', v_address.latitude,
      'longitude', v_address.longitude
    ),
    'pending',
    v_subtotal,
    v_delivery_fee,
    0,
    v_total,
    p_payment_method,
    'pending'::public.app_payment_status,
    p_note
  )
  returning id into v_order_id;

  insert into public.order_lines (
    order_id,
    menu_item_id,
    item_name_snapshot,
    item_image_snapshot,
    quantity,
    unit_price_snapshot,
    options_snapshot_json
  )
  select
    v_order_id,
    mi.id,
    mi.name,
    mi.image_url,
    ci.quantity,
    mi.base_price + coalesce(opt.option_total, 0),
    coalesce(opt.options_json, '[]'::jsonb)
  from public.cart_items ci
  join public.menu_items mi on mi.id = ci.menu_item_id
  left join (
    select
      cio.cart_item_id,
      sum(cio.price_delta_snapshot) as option_total,
      jsonb_agg(
        jsonb_build_object(
          'option_choice_id', cio.option_choice_id,
          'name', cio.option_name_snapshot,
          'price_delta', cio.price_delta_snapshot
        )
      ) as options_json
    from public.cart_item_options cio
    group by cio.cart_item_id
  ) opt on opt.cart_item_id = ci.id
  where ci.cart_id = p_cart_id;

  insert into public.order_status_history (
    order_id,
    from_status,
    to_status,
    changed_by_user_id,
    note
  )
  values (v_order_id, null, 'pending', v_customer_id, 'Order created from cart');

  insert into public.payments (order_id, provider, amount, status)
  values (v_order_id, p_payment_method, v_total, 'pending');

  update public.carts
  set status = 'checked_out', updated_at = now()
  where id = p_cart_id;

  return v_order_id;
end;
$$;

revoke all on function public.checkout_cart_v3(bigint, bigint, public.app_payment_method, text) from public;
grant execute on function public.checkout_cart_v3(bigint, bigint, public.app_payment_method, text) to authenticated;

-- ============================================================
-- 13. STORAGE: AVATARS
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public View Avatar" on storage.objects;
drop policy if exists "User Can Upload Avatar" on storage.objects;
drop policy if exists "User Can Update Own Avatar" on storage.objects;

drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'avatars');

drop policy if exists "avatars users upload own files" on storage.objects;
create policy "avatars users upload own files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and owner = (select auth.uid())
);

drop policy if exists "avatars users update own files" on storage.objects;
create policy "avatars users update own files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and owner = (select auth.uid())
)
with check (
  bucket_id = 'avatars'
  and owner = (select auth.uid())
);

drop policy if exists "avatars users delete own files" on storage.objects;
create policy "avatars users delete own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and owner = (select auth.uid())
);
