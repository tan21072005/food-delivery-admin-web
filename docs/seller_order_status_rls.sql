-- Apply this SQL to allow restaurant owners to advance their own orders.
-- It keeps ownership checks in RLS and does not use service_role in the app.

grant update on public.orders to authenticated;
grant insert on public.order_status_history to authenticated;

drop policy if exists "restaurant owners update restaurant order status" on public.orders;
create policy "restaurant owners update restaurant order status"
on public.orders for update
to authenticated
using (
  status in ('pending', 'confirmed', 'preparing')
  and exists (
    select 1
    from public.restaurants r
    where r.id = orders.restaurant_id
      and r.owner_user_id = (select public.current_app_user_id())
  )
)
with check (
  status in ('confirmed', 'preparing', 'ready_for_pickup')
  and exists (
    select 1
    from public.restaurants r
    where r.id = orders.restaurant_id
      and r.owner_user_id = (select public.current_app_user_id())
  )
);

drop policy if exists "restaurant owners insert order status history" on public.order_status_history;
create policy "restaurant owners insert order status history"
on public.order_status_history for insert
to authenticated
with check (
  exists (
    select 1
    from public.orders o
    join public.restaurants r on r.id = o.restaurant_id
    where o.id = order_status_history.order_id
      and r.owner_user_id = (select public.current_app_user_id())
  )
);
