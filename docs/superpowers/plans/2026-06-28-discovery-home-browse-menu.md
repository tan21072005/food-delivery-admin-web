# Discovery / Home / Browse Restaurant / Menu Kế hoạch implementation

> **Danh cho worker agentic:** SUB-SKILL BAT BUOC: Dung superpowers:subagent-driven-development (khuyen nghi) hoac superpowers:executing-plans de trien khai plan nay theo tung task. Cac buoc dung co phap checkbox (`- [ ]`) de theo doi tien do.

**Mục tiêu:** Thay cac luong Discovery, Home, Browse Restaurant va full Menu dang mock/local bang luong Android Java + MVVM + Retrofit duoc backend backing, handoff sach sang contract Ordering MVP Cart.

**Kiến trúc:** Giu Fragment mong va dua logic discovery vao ViewModel duoc repository backing. Dung Supabase REST/RPC qua Retrofit, co UI state loading/content/empty/error va adapter transition tam thoi tu naming `FoodItem`/`FoodCategory` hien co sang thuat ngu domain.

**Tech stack:** Android Java, AndroidX Fragment/ViewModel/LiveData, Navigation XML, RecyclerView adapters, Retrofit, Gson, Glide, Supabase REST/RPC.

## Rang buoc chung

- Chi la plan cho tuong lai; khong trien khai tu tai lieu nay tru khi mot worker sau duoc giao ro rang.
- Khong commit nhu mot phan cua plan nay.
- Khong thay doi schema SQL that neu chua co task backend/schema rieng.
- Giu nguyen thay doi docs va code cua worker khac.
- Dung thuat ngu domain trong `CONTEXT.md` cho docs/code comments moi va ngon ngu planning public.
- Giu hanh vi Ordering MVP Cart dong bo voi `docs/prd-ordering-mvp.md`.
- Go fallback mock from release behavior only after equivalent backend state exists.

---

## Cau truc file

- Sua: `app/src/main/java/com/example/fooddelivery/data/remote/apis/ApiService.java`
  - Them endpoint query/RPC cho discovery va restaurant.
- Sua: `app/src/main/java/com/example/fooddelivery/data/repository/FoodRepository.java`
  - Cung cap call cho Home, browse, Restaurant detail, Restaurant Menu va Mon detail.
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/Restaurant.java`
  - DTO Restaurant.
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/RestaurantMenuResponse.java`
  - DTO tong hop Restaurant detail/Menu.
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/DiscoveryHomeResponse.java`
  - DTO Home neu `HomeDataResponse` hien co khong chua gon cac section Restaurant.
- Sua: `app/src/main/java/com/example/fooddelivery/data/model/FoodItem.java`
  - Chi them serialized field con thieu; tranh rename rong nhieu rui ro o pass dau.
- Sua: `app/src/main/java/com/example/fooddelivery/data/model/FoodCategory.java`
  - Clarify category id/name/slug/icon mapping.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/home/HomeViewModel.java`
  - Thay data Home hard-coded bang screen state tu repository.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/home/HomeFragment.java`
  - Render loading/content/empty/error va navigate bang id that.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/menu/MenuViewModel.java`
  - Tai du lieu browse/menu filter that; khong silent mock fallback trong release path.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/menu/MenuFragment.java`
  - Pass category id/restaurant id as appropriate and render empty/error states.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/detail/RestaurantDetailViewModel.java`
  - Tai Restaurant detail va Menu bang `restaurant_id` that.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/detail/RestaurantDetailFragment.java`
  - Dung navigation argument va bind state Restaurant/Menu that.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/detail/FoodDetailViewModel.java`
  - Tai Mon detail bang `food_id`.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/detail/FoodDetailFragment.java`
  - Bind real Mon detail and add-to-cart result state.
- Sua: hien co adapters under `ui/home/adapters`, `ui/menu/adapters`, and `ui/detail/adapters`
  - Giu adapter chi lo presentation va them state disabled/unavailable khi can.
- Tao hoac sua tests under `app/src/test/java/com/example/fooddelivery/`
  - ViewModel tests for Home, Menu, Restaurant detail, and Mon detail.

---

### Task 1: Chot contract API Discovery

**File:**
- Sua: `app/src/main/java/com/example/fooddelivery/data/remote/apis/ApiService.java`
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/Restaurant.java`
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/RestaurantMenuResponse.java`
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/DiscoveryHomeResponse.java`

**Interface:**
- Tieu thu: Supabase tables/RPCs for `restaurants`, `menus`, `menu_categories`, `categories`, and `get_home_data`.
- Tao ra:
  - `Call<DiscoveryHomeResponse> getDiscoveryHomeData()`
  - `Call<List<Restaurant>> getRestaurants(String select, String isOpen, String order)`
  - `Call<List<FoodItem>> getMenusByRestaurant(String restaurantIdFilter, String select, String order)`
  - `Call<List<FoodItem>> getMenuItemById(String foodIdFilter, String select)`

- [ ] Them field DTO khop ten cot Supabase hien tai.
- [ ] Giu `FoodItem` lam DTO Mon cho pass implementation dau.
- [ ] Them signature Retrofit voi query parameter ro rang.
- [ ] Them note trong code comment rang `FoodCategory` co the la legacy discovery category cho toi khi tach Cuisine/DishCategory.
- [ ] Compile-check with `.\gradlew.bat :app:compileDebugJavaWithJavac`.

### Task 2: Tang Repository

**File:**
- Sua: `app/src/main/java/com/example/fooddelivery/data/repository/FoodRepository.java`

**Interface:**
- Tieu thu: `ApiService` discovery methods.
- Tao ra:
  - `Call<DiscoveryHomeResponse> getDiscoveryHomeData()`
  - `Call<List<Restaurant>> getOpenRestaurants()`
  - `Call<List<FoodItem>> getRestaurantMenu(long restaurantId)`
  - `Call<List<FoodItem>> getFoodById(long foodId)`
  - `Call<List<FoodItem>> getMenusByDishCategory(long categoryId)`

- [ ] Them repository method khong phu thuoc Fragment.
- [ ] Dam bao query value dung format Supabase nhu `eq.<id>` chi ben trong repository.
- [ ] Khong dua fallback/mock data vao release method cua repository.
- [ ] Compile-check with `.\gradlew.bat :app:compileDebugJavaWithJavac`.

### Task 3: State HomeViewModel

**File:**
- Sua: `app/src/main/java/com/example/fooddelivery/ui/home/HomeViewModel.java`

**Interface:**
- Tieu thu: `FoodRepository.getDiscoveryHomeData()`.
- Tao ra:
  - `LiveData<Boolean> isLoading()`
  - `LiveData<List<FoodCategory>> getCategories()`
  - `LiveData<List<FoodItem>> getTopSelling()`
  - `LiveData<List<FoodItem>> getAllFoods()`
  - `LiveData<List<Restaurant>> getRestaurants()`
  - `LiveData<String> getErrorMsg()`

- [ ] Thay Home data hard-coded bang xu ly response tu repository.
- [ ] Them empty state khi moi section deu rong.
- [ ] Them method retry dung lai request Home gan nhat.
- [ ] Khong tu mo `Checkout` sau add-to-cart tu Home; de Ordering MVP dinh nghia handoff sticky Cart.
- [ ] Unit test success, empty, and failure states.

### Task 4: Bind HomeFragment

**File:**
- Sua: `app/src/main/java/com/example/fooddelivery/ui/home/HomeFragment.java`
- Sua: relevant Home adapters only if bat buoc.

**Interface:**
- Tieu thu: `HomeViewModel` LiveData state.
- Tao ra: Navigation arguments for `restaurant_id`, `food_id`, category id/name.

- [ ] Noi pull-to-refresh vao `viewModel.loadHome()`.
- [ ] Navigate card Restaurant bang `restaurant_id` that.
- [ ] Navigate card Mon toi Restaurant detail hoac Food detail theo UX da chot.
- [ ] Show loading, empty, and retry states.
- [ ] Keep `LocalCart` calls only behind a transition note or feature flag until Cart repository integration is ready.

### Task 5: Browse/Menu ViewModel

**File:**
- Sua: `app/src/main/java/com/example/fooddelivery/ui/menu/MenuViewModel.java`

**Interface:**
- Tieu thu: `FoodRepository.getMenus`, `getMenusByDishCategory`, `getRestaurantMenu`.
- Tao ra:
  - `void loadFoods(String categoryIdOrSlug)`
  - `void loadRestaurantMenu(long restaurantId)`
  - `void searchWithinLoadedMenu(String keyword)`

- [ ] Stop sending text slug as `category_id` unless backend confirms slug support.
- [ ] Preserve local keyword filtering only for already-loaded data.
- [ ] Them empty state ro rang khi khong co ket qua.
- [ ] Them failure state ma khong am tham thay bang mock data.
- [ ] Unit test category filter and search behavior.

### Task 6: Navigation va state coa MenuFragment

**File:**
- Sua: `app/src/main/java/com/example/fooddelivery/ui/menu/MenuFragment.java`
- Sua: `app/src/main/res/navigation/nav_home.xml` if new arguments are needed.

**Interface:**
- Tieu thu: `category_id`, `category_slug`, `category_name`, tuy chon `restaurant_id`.
- Tao ra: Navigation to `restaurantDetailFragment` and `foodDetailFragment`.

- [ ] Them argument `category_id` kieu so neu dung id DishCategory.
- [ ] Preserve `category_name` for title only.
- [ ] Navigate tap card Mon nhat quan toi Food detail hoac Restaurant detail theo quyet dinh PRD.
- [ ] Render loading/error/empty views.
- [ ] Compile-check after navigation argument changes.

### Task 7: Du lieu that cho RestaurantDetail

**File:**
- Sua: `app/src/main/java/com/example/fooddelivery/ui/detail/RestaurantDetailViewModel.java`
- Sua: `app/src/main/java/com/example/fooddelivery/ui/detail/RestaurantDetailFragment.java`
- Sua: `app/src/main/java/com/example/fooddelivery/ui/detail/adapters/StorefrontAdapter.java`

**Interface:**
- Tieu thu: `restaurant_id` argument and `FoodRepository.getRestaurantMenu(restaurantId)`.
- Tao ra: Restaurant header state and full Menu list.

- [ ] Read `restaurant_id` from arguments and reject `-1L` with an error state.
- [ ] Thay `loadRestaurantFoods(1L)` bang argument that.
- [ ] Bind Restaurant name/address/rating/open status from backend.
- [ ] Bind Menu items by `restaurant_id`.
- [ ] Them filter DishCategory neu response co category data.
- [ ] Unit test that requested `restaurant_id` is used.

### Task 8: Du lieu that cho FoodDetail

**File:**
- Sua: `app/src/main/java/com/example/fooddelivery/ui/detail/FoodDetailViewModel.java`
- Sua: `app/src/main/java/com/example/fooddelivery/ui/detail/FoodDetailFragment.java`

**Interface:**
- Tieu thu: `food_id` argument and `FoodRepository.getFoodById(foodId)`.
- Tao ra: Mon detail state and add-to-cart UI event.

- [ ] Thay Mon mock bang Mon tai tu repository.
- [ ] Show unavailable state when no active Mon is returned.
- [ ] Giu quantity control local trong screen state.
- [ ] Hand off add action to Cart repository once Ordering MVP provides final interface.
- [ ] Unit test successful load, not found, and network error.

### Task 9: Chuyen tiep handoff sang Cart

**File:**
- Sua sau: discovery Fragments and/or shared Cart ViewModel once Ordering MVP Cart API exists.

**Interface:**
- Tieu thu: Tdeng lai `CartRepository.addToCart(restaurantId, menuId, quantity, optionLabel, note)`.
- Tao ra: Sticky Cart/draft state update.

- [ ] Thay cac call truc tiep `LocalCart.getInstance().add(...)` tu Home/Menu/Search/Food detail.
- [ ] Dam bao add-to-cart validate login hoac tra ve UI yeu cau auth.
- [ ] Dam bao moi add request deu co Restaurant id.
- [ ] Dam bao add fail khong update sai sticky Cart.
- [ ] Kiem tra thu cong per-Restaurant Cart with two Restaurants.

### Task 10: Kiem chung

**File:**
- Test files under `app/src/test/java/com/example/fooddelivery/`
- No production file changes beyond tasks above.

**Interface:**
- Tieu thu: ViewModel public APIs and fake repositories.
- Tao ra: repeatable compile, unit test, and manual verification evidence.

- [ ] Chay compile check: `.\gradlew.bat :app:compileDebugJavaWithJavac`.
- [ ] Chay unit tests: `.\gradlew.bat :app:testDebugUnitTest`.
- [ ] Kiểm tra thủ công: Home loads real Supabase data.
- [ ] Kiểm tra thủ công: Restaurant detail uses da chon `restaurant_id`.
- [ ] Kiểm tra thủ công: Restaurant Menu shows all active Mon for that Restaurant.
- [ ] Kiểm tra thủ công: unavailable Mon cannot be added.
- [ ] Kiểm tra thủ công: add-to-cart creates/updates the correct per-Restaurant draft Cart.
- [ ] Ghi chú rollback: if backend data/RLS is not ready, gate real discovery behind a debug flag and preserve hien co mock demo path only for non-release builds.

## Tu ra soat

- Spec coverage: Bao phu Home, browse category, Restaurant detail, full Menu, Mon detail, add-to-cart handoff, UI states, security/RLS, test va manual verification.
- Placeholder scan: Khong con placeholder bat buoc de thuc thi plan; ten RPC backend tuong lai co the duoc chot trong task do backend so huu.
- Type consistency: Ten method Repository va ViewModel duoc gioi thieu truoc khi UI task tieu thu.



