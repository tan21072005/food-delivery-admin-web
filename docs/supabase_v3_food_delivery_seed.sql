-- Food Delivery Supabase seed data v3
-- Run after docs/supabase_v3_food_delivery_schema.sql.
-- Data is realistic demo data for Customer app screens.

-- ============================================================
-- 1. USERS
-- ============================================================
insert into public.users (role, full_name, phone_number, email, avatar_url, status)
values
  ('admin', 'Admin Demo', '0900000000', 'admin@food.local', null, 'active'),
  ('customer', 'Nguyen Minh Anh', '0901000001', 'minhanh@food.local', 'https://i.pravatar.cc/160?img=32', 'active'),
  ('customer', 'Tran Bao Ngoc', '0901000002', 'baongoc@food.local', 'https://i.pravatar.cc/160?img=47', 'active'),
  ('restaurant_owner', 'Le Van Hue', '0902000001', 'owner.bunbo@food.local', 'https://i.pravatar.cc/160?img=12', 'active'),
  ('restaurant_owner', 'Pham Thi Tra', '0902000002', 'owner.trasua@food.local', 'https://i.pravatar.cc/160?img=26', 'active'),
  ('restaurant_owner', 'Hoang Pizza', '0902000003', 'owner.pizza@food.local', 'https://i.pravatar.cc/160?img=18', 'active'),
  ('restaurant_owner', 'Sato Sushi', '0902000004', 'owner.sushi@food.local', 'https://i.pravatar.cc/160?img=54', 'active'),
  ('driver', 'Driver Nam', '0903000001', 'driver.nam@food.local', 'https://i.pravatar.cc/160?img=5', 'active')
on conflict (email) do update
set
  role = excluded.role,
  full_name = excluded.full_name,
  phone_number = excluded.phone_number,
  avatar_url = excluded.avatar_url,
  status = excluded.status;

-- ============================================================
-- 2. CUISINES
-- ============================================================
insert into public.cuisines (name, slug, icon_url, sort_order, status)
values
  ('Bun pho', 'bun-pho', 'https://cdn-icons-png.flaticon.com/512/2718/2718224.png', 1, 'active'),
  ('Tra sua', 'tra-sua', 'https://cdn-icons-png.flaticon.com/512/3081/3081967.png', 2, 'active'),
  ('Pizza', 'pizza', 'https://cdn-icons-png.flaticon.com/512/3132/3132693.png', 3, 'active'),
  ('Sushi', 'sushi', 'https://cdn-icons-png.flaticon.com/512/2254/2254464.png', 4, 'active'),
  ('Com van phong', 'com-van-phong', 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png', 5, 'active'),
  ('Ga ran', 'ga-ran', 'https://cdn-icons-png.flaticon.com/512/1046/1046751.png', 6, 'active')
on conflict (slug) do update
set name = excluded.name, icon_url = excluded.icon_url, sort_order = excluded.sort_order, status = excluded.status;

-- ============================================================
-- 3. RESTAURANTS
-- ============================================================
insert into public.restaurants (
  owner_user_id,
  cuisine_id,
  name,
  description,
  phone_number,
  address,
  latitude,
  longitude,
  logo_url,
  cover_url,
  avg_rating,
  total_reviews,
  is_open,
  status
)
values
  (
    (select id from public.users where email = 'owner.bunbo@food.local'),
    (select id from public.cuisines where slug = 'bun-pho'),
    'Bun Bo Hue Dong Ba',
    'Quan bun bo phong cach Hue voi bep mo, phuc vu nhanh cho bua trua va toi.',
    '0287000199',
    '199 Nguyen Trai, District 1, Ho Chi Minh City',
    10.767215,
    106.693821,
    'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1200&q=80',
    4.7,
    842,
    true,
    'active'
  ),
  (
    (select id from public.users where email = 'owner.trasua@food.local'),
    (select id from public.cuisines where slug = 'tra-sua'),
    'Bobapop CMT8',
    'Quan tra sua take-away gan truong hoc, noi bat voi tran chau nau moi moi ngay.',
    '0287000200',
    '88 Cach Mang Thang 8, District 3, Ho Chi Minh City',
    10.779512,
    106.688274,
    'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=1200&q=80',
    4.5,
    621,
    true,
    'active'
  ),
  (
    (select id from public.users where email = 'owner.pizza@food.local'),
    (select id from public.cuisines where slug = 'pizza'),
    'Pizza 4Ps Le Loi',
    'Nha hang pizza phong cach Y, co khu ngoi lai va nhan don giao nhanh.',
    '0287000300',
    '12 Le Loi, District 1, Ho Chi Minh City',
    10.775843,
    106.700982,
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
    4.6,
    734,
    true,
    'active'
  ),
  (
    (select id from public.users where email = 'owner.sushi@food.local'),
    (select id from public.cuisines where slug = 'sushi'),
    'Sushi Tei Pasteur',
    'Nha hang sushi Nhat Ban voi quay sushi va cac set giao hang dong goi ky.',
    '0287000400',
    '45 Pasteur, District 1, Ho Chi Minh City',
    10.780018,
    106.699915,
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=1200&q=80',
    4.8,
    512,
    false,
    'active'
  )
on conflict (owner_user_id, name) do update
set
  cuisine_id = excluded.cuisine_id,
  description = excluded.description,
  phone_number = excluded.phone_number,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  logo_url = excluded.logo_url,
  cover_url = excluded.cover_url,
  avg_rating = excluded.avg_rating,
  total_reviews = excluded.total_reviews,
  is_open = excluded.is_open,
  status = excluded.status;

-- ============================================================
-- 4. DISH CATEGORIES
-- ============================================================
insert into public.dish_categories (restaurant_id, name, slug, sort_order, status)
values
  ((select id from public.restaurants where name = 'Bun Bo Hue Dong Ba'), 'Bun bo', 'bun-bo', 1, 'active'),
  ((select id from public.restaurants where name = 'Bun Bo Hue Dong Ba'), 'Mon them', 'mon-them', 2, 'active'),
  ((select id from public.restaurants where name = 'Bun Bo Hue Dong Ba'), 'Do uong', 'do-uong', 3, 'active'),
  ((select id from public.restaurants where name = 'Bobapop CMT8'), 'Tra sua', 'tra-sua', 1, 'active'),
  ((select id from public.restaurants where name = 'Bobapop CMT8'), 'Tra trai cay', 'tra-trai-cay', 2, 'active'),
  ((select id from public.restaurants where name = 'Bobapop CMT8'), 'Topping', 'topping', 3, 'active'),
  ((select id from public.restaurants where name = 'Pizza 4Ps Le Loi'), 'Pizza', 'pizza', 1, 'active'),
  ((select id from public.restaurants where name = 'Pizza 4Ps Le Loi'), 'My Y', 'my-y', 2, 'active'),
  ((select id from public.restaurants where name = 'Pizza 4Ps Le Loi'), 'Combo', 'combo', 3, 'active'),
  ((select id from public.restaurants where name = 'Sushi Tei Pasteur'), 'Sushi set', 'sushi-set', 1, 'active'),
  ((select id from public.restaurants where name = 'Sushi Tei Pasteur'), 'Sashimi', 'sashimi', 2, 'active')
on conflict (restaurant_id, slug) do update
set name = excluded.name, sort_order = excluded.sort_order, status = excluded.status;

-- ============================================================
-- 5. MENU ITEMS
-- ============================================================
insert into public.menu_items (
  restaurant_id,
  dish_category_id,
  name,
  description,
  base_price,
  image_url,
  avg_rating,
  sold_count,
  status
)
values
  (
    (select id from public.restaurants where name = 'Bun Bo Hue Dong Ba'),
    (select dc.id from public.dish_categories dc join public.restaurants r on r.id = dc.restaurant_id where r.name = 'Bun Bo Hue Dong Ba' and dc.slug = 'bun-bo'),
    'Bun bo dac biet',
    'Bun bo, gio heo, cha cua, bo tai va rau song.',
    65000,
    'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=800&q=80',
    4.8,
    1320,
    'active'
  ),
  (
    (select id from public.restaurants where name = 'Bun Bo Hue Dong Ba'),
    (select dc.id from public.dish_categories dc join public.restaurants r on r.id = dc.restaurant_id where r.name = 'Bun Bo Hue Dong Ba' and dc.slug = 'bun-bo'),
    'Bun bo tai',
    'Bun bo tai mem, nuoc dung cay nhe.',
    55000,
    'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=800&q=80',
    4.6,
    824,
    'active'
  ),
  (
    (select id from public.restaurants where name = 'Bun Bo Hue Dong Ba'),
    (select dc.id from public.dish_categories dc join public.restaurants r on r.id = dc.restaurant_id where r.name = 'Bun Bo Hue Dong Ba' and dc.slug = 'bun-bo'),
    'Bun bo gio heo',
    'Bun bo Hue voi khoanh gio heo mem, cha Hue va rau song.',
    62000,
    'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=800&q=80',
    4.7,
    716,
    'active'
  ),
  (
    (select id from public.restaurants where name = 'Bun Bo Hue Dong Ba'),
    (select dc.id from public.dish_categories dc join public.restaurants r on r.id = dc.restaurant_id where r.name = 'Bun Bo Hue Dong Ba' and dc.slug = 'mon-them'),
    'Cha cua them',
    'Mot phan cha cua them cho mon bun.',
    18000,
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
    4.5,
    403,
    'active'
  ),
  (
    (select id from public.restaurants where name = 'Bun Bo Hue Dong Ba'),
    (select dc.id from public.dish_categories dc join public.restaurants r on r.id = dc.restaurant_id where r.name = 'Bun Bo Hue Dong Ba' and dc.slug = 'do-uong'),
    'Tra dao cam sa',
    'Tra dao mat lanh voi cam va sa.',
    30000,
    'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=800&q=80',
    4.7,
    954,
    'active'
  ),
  (
    (select id from public.restaurants where name = 'Bobapop CMT8'),
    (select dc.id from public.dish_categories dc join public.restaurants r on r.id = dc.restaurant_id where r.name = 'Bobapop CMT8' and dc.slug = 'tra-sua'),
    'Tra sua tran chau duong den',
    'Tra sua beo nhe, tran chau duong den deo.',
    42000,
    'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=800&q=80',
    4.6,
    1424,
    'active'
  ),
  (
    (select id from public.restaurants where name = 'Bobapop CMT8'),
    (select dc.id from public.dish_categories dc join public.restaurants r on r.id = dc.restaurant_id where r.name = 'Bobapop CMT8' and dc.slug = 'tra-trai-cay'),
    'Tra vai hoa hong',
    'Tra vai thom nhe, ngot thanh.',
    39000,
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
    4.4,
    635,
    'active'
  ),
  (
    (select id from public.restaurants where name = 'Bobapop CMT8'),
    (select dc.id from public.dish_categories dc join public.restaurants r on r.id = dc.restaurant_id where r.name = 'Bobapop CMT8' and dc.slug = 'tra-sua'),
    'Tra sua oolong nuong',
    'Tra oolong nuong thom, sua tuoi va tran chau den.',
    45000,
    'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=800&q=80',
    4.7,
    1188,
    'active'
  ),
  (
    (select id from public.restaurants where name = 'Bobapop CMT8'),
    (select dc.id from public.dish_categories dc join public.restaurants r on r.id = dc.restaurant_id where r.name = 'Bobapop CMT8' and dc.slug = 'tra-trai-cay'),
    'Tra dao cam sa',
    'Tra dao cam sa mat lanh, phu hop buoi trua.',
    39000,
    'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=800&q=80',
    4.5,
    812,
    'active'
  ),
  (
    (select id from public.restaurants where name = 'Pizza 4Ps Le Loi'),
    (select dc.id from public.dish_categories dc join public.restaurants r on r.id = dc.restaurant_id where r.name = 'Pizza 4Ps Le Loi' and dc.slug = 'pizza'),
    'Pizza hai san size M',
    'Tom, muc, thanh cua, pho mai mozzarella.',
    159000,
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    4.7,
    711,
    'active'
  ),
  (
    (select id from public.restaurants where name = 'Pizza 4Ps Le Loi'),
    (select dc.id from public.dish_categories dc join public.restaurants r on r.id = dc.restaurant_id where r.name = 'Pizza 4Ps Le Loi' and dc.slug = 'pizza'),
    'Pizza pepperoni size M',
    'Pepperoni, sot ca chua, pho mai day.',
    139000,
    'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
    4.6,
    682,
    'active'
  ),
  (
    (select id from public.restaurants where name = 'Pizza 4Ps Le Loi'),
    (select dc.id from public.dish_categories dc join public.restaurants r on r.id = dc.restaurant_id where r.name = 'Pizza 4Ps Le Loi' and dc.slug = 'pizza'),
    'Pizza margherita size M',
    'Sot ca chua, mozzarella, basil va dau olive.',
    129000,
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
    4.5,
    534,
    'active'
  ),
  (
    (select id from public.restaurants where name = 'Pizza 4Ps Le Loi'),
    (select dc.id from public.dish_categories dc join public.restaurants r on r.id = dc.restaurant_id where r.name = 'Pizza 4Ps Le Loi' and dc.slug = 'my-y'),
    'Spaghetti bo bam',
    'Mi Y sot bo bam ca chua, phu parmesan.',
    99000,
    'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80',
    4.4,
    421,
    'active'
  ),
  (
    (select id from public.restaurants where name = 'Sushi Tei Pasteur'),
    (select dc.id from public.dish_categories dc join public.restaurants r on r.id = dc.restaurant_id where r.name = 'Sushi Tei Pasteur' and dc.slug = 'sushi-set'),
    'Set sushi ca hoi 8 mieng',
    'Sushi ca hoi, avocado va trung cuon rong bien.',
    168000,
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    4.7,
    486,
    'active'
  ),
  (
    (select id from public.restaurants where name = 'Sushi Tei Pasteur'),
    (select dc.id from public.dish_categories dc join public.restaurants r on r.id = dc.restaurant_id where r.name = 'Sushi Tei Pasteur' and dc.slug = 'sashimi'),
    'Sashimi ca hoi',
    'Ca hoi tuoi cat day, an kem wasabi va shoyu.',
    189000,
    'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80',
    4.8,
    377,
    'active'
  ),
  (
    (select id from public.restaurants where name = 'Sushi Tei Pasteur'),
    (select dc.id from public.dish_categories dc join public.restaurants r on r.id = dc.restaurant_id where r.name = 'Sushi Tei Pasteur' and dc.slug = 'sushi-set'),
    'Set sushi tong hop 12 mieng',
    'Ca hoi, ca ngu, tom, trung va cuon rong bien.',
    220000,
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    4.8,
    391,
    'sold_out'
  )
on conflict (restaurant_id, name) do update
set
  dish_category_id = excluded.dish_category_id,
  description = excluded.description,
  base_price = excluded.base_price,
  image_url = excluded.image_url,
  avg_rating = excluded.avg_rating,
  sold_count = excluded.sold_count,
  status = excluded.status;

-- ============================================================
-- 6. OPTION GROUPS AND CHOICES
-- ============================================================
insert into public.menu_option_groups (
  menu_item_id,
  name,
  selection_type,
  min_select,
  max_select,
  is_required,
  sort_order
)
values
  ((select id from public.menu_items where name = 'Bun bo dac biet'), 'Size', 'single', 1, 1, true, 1),
  ((select id from public.menu_items where name = 'Bun bo dac biet'), 'Topping', 'multiple', 0, 3, false, 2),
  ((select id from public.menu_items where name = 'Bun bo tai'), 'Size', 'single', 1, 1, true, 1),
  ((select id from public.menu_items where name = 'Tra sua tran chau duong den'), 'Muc duong', 'single', 1, 1, true, 1),
  ((select id from public.menu_items where name = 'Tra sua tran chau duong den'), 'Topping', 'multiple', 0, 3, false, 2),
  ((select id from public.menu_items where name = 'Pizza hai san size M'), 'Vien pizza', 'single', 0, 1, false, 1)
on conflict (menu_item_id, name) do update
set
  selection_type = excluded.selection_type,
  min_select = excluded.min_select,
  max_select = excluded.max_select,
  is_required = excluded.is_required,
  sort_order = excluded.sort_order;

insert into public.menu_option_choices (
  option_group_id,
  name,
  price_delta,
  is_available,
  sort_order
)
values
  ((select mog.id from public.menu_option_groups mog join public.menu_items mi on mi.id = mog.menu_item_id where mi.name = 'Bun bo dac biet' and mog.name = 'Size'), 'To thuong', 0, true, 1),
  ((select mog.id from public.menu_option_groups mog join public.menu_items mi on mi.id = mog.menu_item_id where mi.name = 'Bun bo dac biet' and mog.name = 'Size'), 'To lon', 12000, true, 2),
  ((select mog.id from public.menu_option_groups mog join public.menu_items mi on mi.id = mog.menu_item_id where mi.name = 'Bun bo dac biet' and mog.name = 'Topping'), 'Them bo', 15000, true, 1),
  ((select mog.id from public.menu_option_groups mog join public.menu_items mi on mi.id = mog.menu_item_id where mi.name = 'Bun bo dac biet' and mog.name = 'Topping'), 'Them cha cua', 12000, true, 2),
  ((select mog.id from public.menu_option_groups mog join public.menu_items mi on mi.id = mog.menu_item_id where mi.name = 'Bun bo dac biet' and mog.name = 'Topping'), 'Them gio heo', 18000, true, 3),
  ((select mog.id from public.menu_option_groups mog join public.menu_items mi on mi.id = mog.menu_item_id where mi.name = 'Bun bo tai' and mog.name = 'Size'), 'To thuong', 0, true, 1),
  ((select mog.id from public.menu_option_groups mog join public.menu_items mi on mi.id = mog.menu_item_id where mi.name = 'Bun bo tai' and mog.name = 'Size'), 'To lon', 10000, true, 2),
  ((select mog.id from public.menu_option_groups mog join public.menu_items mi on mi.id = mog.menu_item_id where mi.name = 'Tra sua tran chau duong den' and mog.name = 'Muc duong'), '30% duong', 0, true, 1),
  ((select mog.id from public.menu_option_groups mog join public.menu_items mi on mi.id = mog.menu_item_id where mi.name = 'Tra sua tran chau duong den' and mog.name = 'Muc duong'), '70% duong', 0, true, 2),
  ((select mog.id from public.menu_option_groups mog join public.menu_items mi on mi.id = mog.menu_item_id where mi.name = 'Tra sua tran chau duong den' and mog.name = 'Topping'), 'Tran chau den', 7000, true, 1),
  ((select mog.id from public.menu_option_groups mog join public.menu_items mi on mi.id = mog.menu_item_id where mi.name = 'Tra sua tran chau duong den' and mog.name = 'Topping'), 'Pudding trung', 9000, true, 2),
  ((select mog.id from public.menu_option_groups mog join public.menu_items mi on mi.id = mog.menu_item_id where mi.name = 'Pizza hai san size M' and mog.name = 'Vien pizza'), 'Vien pho mai', 25000, true, 1)
on conflict (option_group_id, name) do update
set price_delta = excluded.price_delta, is_available = excluded.is_available, sort_order = excluded.sort_order;

-- ============================================================
-- 7. DELIVERY ADDRESSES
-- ============================================================
with seed_addresses (
  customer_email,
  label,
  receiver_name,
  receiver_phone,
  address_line,
  building_name,
  floor,
  gate_note,
  latitude,
  longitude,
  is_default
) as (
  values
    (
      'minhanh@food.local',
      'Nha',
      'Nguyen Minh Anh',
      '0901000001',
      '25 Nguyen Dinh Chieu, District 1, Ho Chi Minh City',
      'Apartment A',
      '10',
      'Call before delivery',
      10.782021,
      106.700744,
      true
    ),
    (
      'minhanh@food.local',
      'Cong ty',
      'Nguyen Minh Anh',
      '0901000001',
      '2 Hai Trieu, District 1, Ho Chi Minh City',
      'Bitexco area',
      '18',
      'Leave at reception',
      10.771721,
      106.704674,
      false
    ),
    (
      'baongoc@food.local',
      'Nha',
      'Tran Bao Ngoc',
      '0901000002',
      '102 Nguyen Van Troi, Phu Nhuan, Ho Chi Minh City',
      null,
      null,
      'Call at gate',
      10.798062,
      106.674049,
      true
    )
)
insert into public.delivery_addresses (
  customer_id,
  label,
  receiver_name,
  receiver_phone,
  address_line,
  building_name,
  floor,
  gate_note,
  latitude,
  longitude,
  is_default
)
select
  u.id,
  sa.label,
  sa.receiver_name,
  sa.receiver_phone,
  sa.address_line,
  sa.building_name,
  sa.floor,
  sa.gate_note,
  sa.latitude,
  sa.longitude,
  sa.is_default
from seed_addresses sa
join public.users u on u.email = sa.customer_email
where not exists (
  select 1
  from public.delivery_addresses existing
  where existing.customer_id = u.id
    and existing.label = sa.label
    and existing.address_line = sa.address_line
    and existing.deleted_at is null
);

-- ============================================================
-- 8. ACTIVE DRAFT CART
-- ============================================================
insert into public.carts (customer_id, restaurant_id, status)
values (
  (select id from public.users where email = 'minhanh@food.local'),
  (select id from public.restaurants where name = 'Bun Bo Hue Dong Ba'),
  'active'
)
on conflict (customer_id, restaurant_id) where status = 'active'
do update set updated_at = now();

insert into public.cart_items (cart_id, menu_item_id, quantity, last_known_unit_price, note)
select
  c.id,
  mi.id,
  2,
  65000,
  'It cay, it hanh'
from public.carts c
join public.users u on u.id = c.customer_id
join public.restaurants r on r.id = c.restaurant_id
join public.menu_items mi on mi.restaurant_id = r.id and mi.name = 'Bun bo dac biet'
where u.email = 'minhanh@food.local'
  and r.name = 'Bun Bo Hue Dong Ba'
  and c.status = 'active'
  and not exists (
    select 1
    from public.cart_items existing
    where existing.cart_id = c.id
      and existing.menu_item_id = mi.id
      and coalesce(existing.note, '') = 'It cay, it hanh'
  );

with seeded_cart_item as (
  select ci.id
  from public.cart_items ci
  join public.carts c on c.id = ci.cart_id
  join public.users u on u.id = c.customer_id
  join public.restaurants r on r.id = c.restaurant_id
  join public.menu_items mi on mi.id = ci.menu_item_id
  where u.email = 'minhanh@food.local'
    and r.name = 'Bun Bo Hue Dong Ba'
    and c.status = 'active'
    and mi.name = 'Bun bo dac biet'
    and coalesce(ci.note, '') = 'It cay, it hanh'
  order by ci.id
  limit 1
)
insert into public.cart_item_options (
  cart_item_id,
  option_choice_id,
  option_name_snapshot,
  price_delta_snapshot
)
select
  sci.id,
  moc.id,
  moc.name,
  moc.price_delta
from seeded_cart_item sci
join public.menu_items mi on mi.name = 'Bun bo dac biet'
join public.menu_option_groups mog on mog.menu_item_id = mi.id
join public.menu_option_choices moc on moc.option_group_id = mog.id
where moc.name in ('To lon', 'Them bo')
  and not exists (
    select 1
    from public.cart_item_options existing
    where existing.cart_item_id = sci.id
      and existing.option_choice_id = moc.id
  );

-- ============================================================
-- 9. SAMPLE ORDERS FOR HISTORY TABS
-- ============================================================
with seed_orders (
  customer_email,
  restaurant_name,
  address_label,
  delivery_address_snapshot_json,
  status,
  subtotal,
  delivery_fee,
  discount_amount,
  total_amount,
  payment_method,
  payment_status,
  note,
  created_at
) as (
  values
    (
      'minhanh@food.local',
      'Pizza 4Ps Le Loi',
      'Cong ty',
      jsonb_build_object('label','Cong ty','receiver_name','Nguyen Minh Anh','receiver_phone','0901000001','address_line','2 Hai Trieu, District 1, Ho Chi Minh City'),
      'pending'::public.app_order_status,
      184000,
      15000,
      0,
      199000,
      'COD'::public.app_payment_method,
      'pending'::public.app_payment_status,
      'Please call before arrival',
      now() - interval '20 minutes'
    ),
    (
      'minhanh@food.local',
      'Bun Bo Hue Dong Ba',
      'Nha',
      jsonb_build_object('label','Nha','receiver_name','Nguyen Minh Anh','receiver_phone','0901000001','address_line','25 Nguyen Dinh Chieu, District 1, Ho Chi Minh City'),
      'completed'::public.app_order_status,
      95000,
      15000,
      10000,
      100000,
      'COD'::public.app_payment_method,
      'paid'::public.app_payment_status,
      'Completed demo order',
      now() - interval '2 days'
    ),
    (
      'baongoc@food.local',
      'Bobapop CMT8',
      'Nha',
      jsonb_build_object('label','Nha','receiver_name','Tran Bao Ngoc','receiver_phone','0901000002','address_line','102 Nguyen Van Troi, Phu Nhuan, Ho Chi Minh City'),
      'cancelled'::public.app_order_status,
      49000,
      15000,
      0,
      64000,
      'COD'::public.app_payment_method,
      'failed'::public.app_payment_status,
      'Customer cancelled while pending',
      now() - interval '1 day'
    )
)
insert into public.orders (
  customer_id,
  restaurant_id,
  delivery_address_id,
  delivery_address_snapshot_json,
  status,
  subtotal,
  delivery_fee,
  discount_amount,
  total_amount,
  payment_method,
  payment_status,
  note,
  created_at
)
select
  u.id,
  r.id,
  da.id,
  so.delivery_address_snapshot_json,
  so.status,
  so.subtotal,
  so.delivery_fee,
  so.discount_amount,
  so.total_amount,
  so.payment_method,
  so.payment_status,
  so.note,
  so.created_at
from seed_orders so
join public.users u on u.email = so.customer_email
join public.restaurants r on r.name = so.restaurant_name
left join lateral (
  select da.id
  from public.delivery_addresses da
  where da.customer_id = u.id
    and da.label = so.address_label
    and da.deleted_at is null
  order by da.id
  limit 1
) da on true
where not exists (
  select 1
  from public.orders existing
  where existing.customer_id = u.id
    and existing.restaurant_id = r.id
    and existing.status = so.status
    and existing.note = so.note
);

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
  o.id,
  mi.id,
  mi.name,
  mi.image_url,
  1,
  184000,
  jsonb_build_array(jsonb_build_object('name', 'Vien pho mai', 'price_delta', 25000))
from public.orders o
join public.restaurants r on r.id = o.restaurant_id
join public.menu_items mi on mi.restaurant_id = r.id and mi.name = 'Pizza hai san size M'
where r.name = 'Pizza 4Ps Le Loi'
  and o.status = 'pending'
  and o.note = 'Please call before arrival'
  and not exists (
    select 1
    from public.order_lines existing
    where existing.order_id = o.id
      and existing.menu_item_id = mi.id
  );

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
  o.id,
  mi.id,
  mi.name,
  mi.image_url,
  1,
  80000,
  jsonb_build_array(jsonb_build_object('name', 'To lon', 'price_delta', 12000), jsonb_build_object('name', 'Them cha cua', 'price_delta', 12000))
from public.orders o
join public.restaurants r on r.id = o.restaurant_id
join public.menu_items mi on mi.restaurant_id = r.id and mi.name = 'Bun bo dac biet'
where r.name = 'Bun Bo Hue Dong Ba'
  and o.status = 'completed'
  and o.note = 'Completed demo order'
  and not exists (
    select 1
    from public.order_lines existing
    where existing.order_id = o.id
      and existing.menu_item_id = mi.id
  );

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
  o.id,
  mi.id,
  mi.name,
  mi.image_url,
  1,
  49000,
  jsonb_build_array(jsonb_build_object('name', 'Tran chau den', 'price_delta', 7000))
from public.orders o
join public.restaurants r on r.id = o.restaurant_id
join public.menu_items mi on mi.restaurant_id = r.id and mi.name = 'Tra sua tran chau duong den'
where r.name = 'Bobapop CMT8'
  and o.status = 'cancelled'
  and o.note = 'Customer cancelled while pending'
  and not exists (
    select 1
    from public.order_lines existing
    where existing.order_id = o.id
      and existing.menu_item_id = mi.id
  );

insert into public.order_status_history (order_id, from_status, to_status, changed_by_user_id, note)
select o.id, null, o.status, o.customer_id,
  case
    when o.status = 'pending' then 'Order created'
    when o.status = 'completed' then 'Order completed'
    when o.status = 'cancelled' then 'Customer cancelled'
    else 'Seed status'
  end
from public.orders o
where not exists (
  select 1 from public.order_status_history h where h.order_id = o.id
);

insert into public.payments (order_id, provider, amount, status, paid_at)
select
  o.id,
  o.payment_method,
  o.total_amount,
  o.payment_status,
  case when o.payment_status = 'paid' then o.created_at + interval '35 minutes' else null end
from public.orders o
where not exists (
  select 1 from public.payments p where p.order_id = o.id
);

