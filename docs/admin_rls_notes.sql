-- Admin RLS notes for the Supabase v3 food delivery schema.
-- Apply after docs/supabase_v3_food_delivery_schema.sql.
-- If Admin Offers is enabled and public.offers does not exist yet, apply docs/seller_offers_schema_rls.sql first.

drop policy if exists "admins read all users" on public.users;
create policy "admins read all users"
on public.users for select
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = (select public.current_app_user_id())
      and u.role = 'admin'
  )
);

drop policy if exists "admins update all users" on public.users;
create policy "admins update all users"
on public.users for update
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

drop policy if exists "admins manage all restaurants" on public.restaurants;
create policy "admins manage all restaurants"
on public.restaurants for all
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

drop policy if exists "admins manage all dish categories" on public.dish_categories;
create policy "admins manage all dish categories"
on public.dish_categories for all
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

drop policy if exists "admins manage all menu items" on public.menu_items;
create policy "admins manage all menu items"
on public.menu_items for all
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

drop policy if exists "admins read all orders" on public.orders;
create policy "admins read all orders"
on public.orders for select
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = (select public.current_app_user_id())
      and u.role = 'admin'
  )
);

drop policy if exists "admins read all order lines" on public.order_lines;
create policy "admins read all order lines"
on public.order_lines for select
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = (select public.current_app_user_id())
      and u.role = 'admin'
  )
);

drop policy if exists "admins read all payments" on public.payments;
create policy "admins read all payments"
on public.payments for select
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = (select public.current_app_user_id())
      and u.role = 'admin'
  )
);

-- public.offers policy is defined in docs/seller_offers_schema_rls.sql:
-- "admins manage all offers" lets admins list, create, update, and soft-delete offers.
