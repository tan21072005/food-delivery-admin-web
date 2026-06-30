# Favorites / Yêu thích Kế hoạch implementation

> **Danh cho worker agentic:** SUB-SKILL BAT BUOC: Dung superpowers:subagent-driven-development (khuyen nghi) hoac superpowers:executing-plans de trien khai plan nay theo tung task. Cac buoc dung co phap checkbox (`- [ ]`) de theo doi tien do.

**Mục tiêu:** Xay favorites Restaurant cua Customer co persistence cho bottom tab "Quan yeu thich".

**Kiến trúc:** Android Java MVVM. Fragments bind UI and navigation, ViewModels expose LiveData state and own optimistic toggles, Repositories call Supabase through Retrofit. Supabase remains the source of truth for Favorites / Yêu thích.

**Tech stack:** Android Java, XML layouts, RecyclerView, LiveData/ViewModel, Retrofit/Gson, Glide, Supabase PostgREST/RPC, JUnit for ViewModel tests.

## Rang buoc chung

- Nguon plan: `docs/prd/2026-06-28-favorites.md`.
- Khong couple Favorites / Yeu thich voi `LocalCart` hoac `LocalOrderStore`.
- Favorite theo Restaurant, khong theo tung Mon, trong MVP.
- Quyen so huu Supabase phai suy ra tu session Customer authenticated, khong tin user id do client gui.
- Them RLS va index cho moi migration bang favorites tuong lai.
- Giu business logic trong Fragment that mong.
- Dung navigation va visual pattern hien co khi co the.

---

## Cau truc file

- Tao: `app/src/main/java/com/example/fooddelivery/data/model/FavoriteRestaurant.java` - display model for favorite Restaurant cards.
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/FavoriteRestaurantRequest.java` - request body for insert if REST table insert is used.
- Tao: `app/src/main/java/com/example/fooddelivery/data/repository/FavoriteRepository.java` - Retrofit wrapper for list/state/add/remove.
- Tao: `app/src/main/java/com/example/fooddelivery/ui/favorites/Favorites / Yêu thíchViewModel.java` - screen state, auth state, loading/error/empty, remove actions.
- Tao: `app/src/main/java/com/example/fooddelivery/ui/favorites/FavoriteRestaurantAdapter.java` - RecyclerView adapter.
- Tao: `app/src/main/res/layout/item_favorite_restaurant.xml` - Restaurant card row.
- Sua: `app/src/main/java/com/example/fooddelivery/data/remote/apis/ApiService.java` - favorites endpoints.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/favorites/Favorites / Yêu thíchFragment.java` - bind list/states/navigation.
- Sua: `app/src/main/res/layout/favorites_fragment.xml` - replace placeholder with state layout.
- Sua: `app/src/main/res/navigation/nav_favorites.xml` - route Favorites / Yêu thích item tap to Restaurant detail rather than Food detail.
- Sua: `app/src/main/res/navigation/nav_main.xml` or `nav_favorites.xml` - include/define a Restaurant detail destination if cross-graph destination is not resolvable.
- Sua: `app/src/main/res/layout/fragment_restaurant_detail.xml` - give heart icon an id.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/detail/RestaurantDetailViewModel.java` - load favorite state and toggle favorite.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/detail/RestaurantDetailFragment.java` - bind heart state.
- Test: `app/src/test/java/com/example/fooddelivery/ui/favorites/Favorites / Yêu thíchViewModelTest.java`.
- Test: `app/src/test/java/com/example/fooddelivery/ui/detail/RestaurantFavoriteStateTest.java`.
- SQL tuong lai, tach khoi task lap ke hoach nay: migration for `customer_favorite_restaurants`, RLS policies, grants, indexes.

---

### Task 1: Supabase Favorites / Yêu thích Contract

**File:**
- Tao migration tuong lai: `supabase/migrations/<timestamp>_customer_favorite_restaurants.sql`
- Chi sua docs tuong lai neu can: `docs/sql.sql`

**Interface:**
- Tao ra table `customer_favorite_restaurants(id, user_id, restaurant_id, created_at)`.
- Tao ra unique key `(user_id, restaurant_id)`.
- Tao ra RLS policies for authenticated Customer-owned select/insert/delete.

- [ ] **Buoc 1: Draft SQL migration**

```sql
create table if not exists public.customer_favorite_restaurants (
  id bigserial primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  restaurant_id bigint not null references public.restaurants(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint customer_favorite_restaurants_user_restaurant_key unique (user_id, restaurant_id)
);

create index if not exists customer_favorite_restaurants_user_created_idx
  on public.customer_favorite_restaurants (user_id, created_at desc);

create index if not exists customer_favorite_restaurants_restaurant_idx
  on public.customer_favorite_restaurants (restaurant_id);

alter table public.customer_favorite_restaurants enable row level security;
```

- [ ] **Buoc 2: Them RLS policies**

```sql
create policy customer_favorites_select_own
on public.customer_favorite_restaurants
for select
to authenticated
using (
  user_id = (
    select id from public.users where auth_uid = (select auth.uid())
  )
);

create policy customer_favorites_insert_own
on public.customer_favorite_restaurants
for insert
to authenticated
with check (
  user_id = (
    select id from public.users where auth_uid = (select auth.uid())
  )
);

create policy customer_favorites_delete_own
on public.customer_favorite_restaurants
for delete
to authenticated
using (
  user_id = (
    select id from public.users where auth_uid = (select auth.uid())
  )
);
```

- [ ] **Buoc 3: Prefer an RPC for Customer-safe insert**

```sql
create or replace function public.favorite_restaurant(p_restaurant_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id bigint;
begin
  select id into v_user_id
  from public.users
  where auth_uid = auth.uid();

  if v_user_id is null then
    raise exception 'User not found';
  end if;

  insert into public.customer_favorite_restaurants (user_id, restaurant_id)
  values (v_user_id, p_restaurant_id)
  on conflict (user_id, restaurant_id) do nothing;
end;
$$;
```

- [ ] **Buoc 4: Them RPC unfavorite tuong ung neu dung RPC**

```sql
create or replace function public.unfavorite_restaurant(p_restaurant_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id bigint;
begin
  select id into v_user_id
  from public.users
  where auth_uid = auth.uid();

  if v_user_id is null then
    raise exception 'User not found';
  end if;

  delete from public.customer_favorite_restaurants
  where user_id = v_user_id
    and restaurant_id = p_restaurant_id;
end;
$$;
```

- [ ] **Buoc 5: Verify database behavior**

Chay Supabase SQL checks manually:

```sql
select restaurant_id from public.customer_favorite_restaurants;
```

Ky vong: authenticated Customer sees only their own rows.

---

### Task 2: Retrofit va Repository

**File:**
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/FavoriteRestaurant.java`
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/FavoriteRestaurantRequest.java`
- Tao: `app/src/main/java/com/example/fooddelivery/data/repository/FavoriteRepository.java`
- Sua: `app/src/main/java/com/example/fooddelivery/data/remote/apis/ApiService.java`

**Interface:**
- Tao ra `FavoriteRepository.listFavorites / Yêu thích()`.
- Tao ra `FavoriteRepository.isFavorite(long restaurantId)`.
- Tao ra `FavoriteRepository.favorite(long restaurantId)`.
- Tao ra `FavoriteRepository.unfavorite(long restaurantId)`.

- [ ] **Buoc 1: Them display model**

```java
public class FavoriteRestaurant {
    @SerializedName("favorite_id") private long favoriteId;
    @SerializedName("restaurant_id") private long restaurantId;
    @SerializedName("name") private String name;
    @SerializedName("address_detail") private String addressDetail;
    @SerializedName("locality") private String locality;
    @SerializedName("logo_url") private String logoUrl;
    @SerializedName("cover_url") private String coverUrl;
    @SerializedName("avg_rating") private double avgRating;
    @SerializedName("is_open") private boolean open;
    @SerializedName("created_at") private String createdAt;
}
```

- [ ] **Buoc 2: Them request model neu dung REST insert**

```java
public class FavoriteRestaurantRequest {
    @SerializedName("user_id") private long userId;
    @SerializedName("restaurant_id") private long restaurantId;
}
```

- [ ] **Buoc 3: Them API methods**

```java
@GET("rest/v1/customer_favorite_restaurants")
Call<List<FavoriteRestaurant>> getFavoriteRestaurants(
    @Query("select") String select,
    @Query("order") String order
);

@GET("rest/v1/customer_favorite_restaurants")
Call<List<FavoriteRestaurant>> getFavoriteState(
    @Query("restaurant_id") String restaurantIdFilter,
    @Query("select") String select
);

@POST("rest/v1/rpc/favorite_restaurant")
Call<Void> favoriteRestaurant(@Body Map<String, Long> body);

@POST("rest/v1/rpc/unfavorite_restaurant")
Call<Void> unfavoriteRestaurant(@Body Map<String, Long> body);
```

- [ ] **Buoc 4: Implement repository**

```java
public Call<Void> favorite(long restaurantId) {
    Map<String, Long> body = new HashMap<>();
    body.put("p_restaurant_id", restaurantId);
    return apiService.favoriteRestaurant(body);
}
```

- [ ] **Buoc 5: Chay unit compile/build**

Chay: `.\gradlew.bat testDebugUnitTest`
Ky vong: Java compiles; hien co tests may reveal unrelated failures that must be triaged separately.

---

### Task 3: Favorites / Yêu thích Tab UI And ViewModel

**File:**
- Tao: `Favorites / Yêu thíchViewModel.java`
- Tao: `FavoriteRestaurantAdapter.java`
- Tao: `item_favorite_restaurant.xml`
- Sua: `Favorites / Yêu thíchFragment.java`
- Sua: `favorites_fragment.xml`

**Interface:**
- Tieu thu `FavoriteRepository`.
- Tao ra `LiveData<Boolean> isLoading`.
- Tao ra `LiveData<List<FavoriteRestaurant>> favorites`.
- Tao ra `LiveData<String> errorMessage`.
- Tao ra `LiveData<Boolean> loginRequired`.

- [ ] **Buoc 1: Them state ViewModel**

```java
private final MutableLiveData<Boolean> isLoading = new MutableLiveData<>(false);
private final MutableLiveData<List<FavoriteRestaurant>> favorites = new MutableLiveData<>(new ArrayList<>());
private final MutableLiveData<String> errorMessage = new MutableLiveData<>();
private final MutableLiveData<Boolean> loginRequired = new MutableLiveData<>(false);
```

- [ ] **Buoc 2: Implement `loadFavorites / Yêu thích()`**

```java
public void loadFavorites / Yêu thích() {
    if (!sessionManager.isLoggedIn()) {
        loginRequired.setValue(true);
        favorites.setValue(new ArrayList<>());
        return;
    }
    loginRequired.setValue(false);
    isLoading.setValue(true);
    repository.listFavorites / Yêu thích().enqueue(new Callback<List<FavoriteRestaurant>>() { ... });
}
```

- [ ] **Buoc 3: Xay XML states**

Dung mot root voi:
- `ProgressBar` id `progressBar`
- `RecyclerView` id `rvFavorites / Yêu thích`
- empty container id `layoutEmpty`
- login container id `layoutLoginRequired`
- error container id `layoutError`

- [ ] **Buoc 4: Bind fragment observers**

```java
viewModel.getFavorites / Yêu thích().observe(getViewLifecycleOwner(), list -> {
    adapter.submitList(list == null ? new ArrayList<>() : list);
    renderState();
});
```

- [ ] **Buoc 5: Navigate khi tap card**

```java
Bundle args = new Bundle();
args.putLong("restaurant_id", item.getRestaurantId());
Navigation.findNavController(requireView()).navigate(R.id.action_favorites_to_restaurantDetail, args);
```

- [ ] **Buoc 6: Test manually**

Script thu cong: login, mo tab Favorites / Yeu thich, thay empty state, them mot favorite tu Restaurant detail sau Task 4, quay lai Favorites / Yeu thich, mo Restaurant.

---

### Task 4: Nut tim o RestaurantDetail

**File:**
- Sua: `fragment_restaurant_detail.xml`
- Sua: `RestaurantDetailViewModel.java`
- Sua: `RestaurantDetailFragment.java`

**Interface:**
- Tieu thu `FavoriteRepository`.
- Tao ra `LiveData<Boolean> isFavorite`.
- Tao ra `LiveData<Boolean> favoriteInFlight`.
- Tao ra `toggleFavorite(long restaurantId)`.

- [ ] **Buoc 1: Them id cho icon heart**

```xml
<ImageView
    android:id="@+id/btnFavoriteRestaurant"
    android:layout_width="24dp"
    android:layout_height="24dp"
    android:src="@drawable/ic_heart_outline" />
```

- [ ] **Buoc 2: Tai state khi Restaurant load**

```java
public void loadFavoriteState(long restaurantId) {
    favoriteRepository.isFavorite(restaurantId).enqueue(new Callback<Boolean>() { ... });
}
```

- [ ] **Buoc 3: Toggle with optimistic rollback**

```java
boolean previous = Boolean.TRUE.equals(isFavorite.getValue());
isFavorite.setValue(!previous);
favoriteInFlight.setValue(true);
Call<Void> call = previous
        ? favoriteRepository.unfavorite(restaurantId)
        : favoriteRepository.favorite(restaurantId);
```

- [ ] **Buoc 4: Bind icon state**

```java
viewModel.getIsFavorite().observe(getViewLifecycleOwner(), favorite ->
    favoriteButton.setImageResource(Boolean.TRUE.equals(favorite)
        ? R.drawable.ic_favorite
        : R.drawable.ic_heart_outline));
```

- [ ] **Buoc 5: Auth behavior**

Neu chua dang nhap, navigate toi Login va khong doi state icon.

---

### Task 5: Sua navigation

**File:**
- Sua: `app/src/main/res/navigation/nav_favorites.xml`
- Co the sua: `app/src/main/res/navigation/nav_main.xml`

**Interface:**
- Tao ra `action_favorites_to_restaurantDetail` with `restaurant_id`.

- [ ] **Buoc 1: Thay action Favorites / Yeu thich-to-Food**

```xml
<action
    android:id="@+id/action_favorites_to_restaurantDetail"
    app:destination="@id/favRestaurantDetailFragment" />
```

- [ ] **Buoc 2: Them destination Restaurant detail scoped cho favorites**

```xml
<fragment
    android:id="@+id/favRestaurantDetailFragment"
    android:name="com.example.fooddelivery.ui.detail.RestaurantDetailFragment"
    android:label="Chi tiet quan">
    <argument
        android:name="restaurant_id"
        android:defaultValue="-1L"
        app:argType="long" />
</fragment>
```

- [ ] **Buoc 3: Verify graph inflation**

Chay: `.\gradlew.bat testDebugUnitTest`
Ky vong: navigation XML regression tests pass or expose exact graph issues.

---

### Task 6: Unit test ViewModel

**File:**
- Tao: `app/src/test/java/com/example/fooddelivery/ui/favorites/Favorites / Yêu thíchViewModelTest.java`
- Tao: `app/src/test/java/com/example/fooddelivery/ui/detail/RestaurantFavoriteStateTest.java`

**Interface:**
- Tieu thu fake `FavoriteRepository`.
- Verifies LiveData state, not Retrofit internals.

- [ ] **Buoc 1: Test logged-out state**

```java
@Test
public void loadFavorites / Yêu thích_whenLoggedOut_setsLoginRequired() {
    viewModel.loadFavorites / Yêu thích();
    assertTrue(getValue(viewModel.getLoginRequired()));
    assertTrue(getValue(viewModel.getFavorites / Yêu thích()).isEmpty());
}
```

- [ ] **Buoc 2: Test empty state**

```java
@Test
public void loadFavorites / Yêu thích_whenRepositoryReturnsEmpty_setsEmptyList() {
    fakeRepository.nextFavorites / Yêu thích = Collections.emptyList();
    viewModel.loadFavorites / Yêu thích();
    assertFalse(getValue(viewModel.getLoginRequired()));
    assertTrue(getValue(viewModel.getFavorites / Yêu thích()).isEmpty());
}
```

- [ ] **Buoc 3: Test optimistic add success**

```java
@Test
public void toggleFavorite_fromFalse_success_setsTrue() {
    viewModel.setFavoriteForTest(false);
    fakeRepository.nextToggleSucceeds = true;
    viewModel.toggleFavorite(10L);
    assertTrue(getValue(viewModel.getIsFavorite()));
}
```

- [ ] **Buoc 4: Test optimistic rollback**

```java
@Test
public void toggleFavorite_fromFalse_failure_rollsBackToFalse() {
    viewModel.setFavoriteForTest(false);
    fakeRepository.nextToggleSucceeds = false;
    viewModel.toggleFavorite(10L);
    assertFalse(getValue(viewModel.getIsFavorite()));
    assertNotNull(getValue(viewModel.getErrorMessage()));
}
```

- [ ] **Buoc 5: Chay tests**

Chay: `.\gradlew.bat testDebugUnitTest`
Ky vong: new Favorites / Yêu thích tests pass.

---

### Task 7: Kiem tra demo thu cong

**File:**
- No source changes unless a verified bug is found.

**Interface:**
- Verify full story tu man Login den Favorites / Yeu thich den Restaurant detail.

- [ ] **Buoc 1: Prepare demo data**

Dam bao co it nhat mot Restaurant active with `id`, `name`, `cover_url` or `logo_url`, `address_detail`, `avg_rating`, and `is_open`.

- [ ] **Buoc 2: Demo add**

Dang nhap, mo Restaurant detail, nhan heart, verify heart da fill.

- [ ] **Buoc 3: Demo list**

Mo tab Favorites / Yeu thich, verify card Restaurant xuat hien.

- [ ] **Buoc 4: Demo navigation**

Nhan card, verify Restaurant detail mo voi cung `restaurant_id`.

- [ ] **Buoc 5: Demo remove**

Quay lai Favorites / Yeu thich, tap heart filled/remove, verify card bien mat va empty state xuat hien neu khong con row.

- [ ] **Buoc 6: Demo persistence**

Khoi dong lai app, login neu can, mo Favorites / Yeu thich, verify row da luu reload tu Supabase.

---

## Checklist tu ra soat

- PRD behaviors are labeled Hien trang, Target, or Transition.
- Implementation tasks do not require Favorites / Yêu thích to create Cart or Order rows.
- RLS and indexes are included in the tuong lai backend task.
- Navigation mismatch from Food detail to Restaurant detail is explicitly fixed.
- Tests focus on ViewModel-visible behavior.
- Demo thu cong proves persistence.




