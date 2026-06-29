# Search và filter Kế hoạch implementation

> **Danh cho worker agentic:** SUB-SKILL BAT BUOC: Dung superpowers:subagent-driven-development (khuyen nghi) hoac superpowers:executing-plans de trien khai plan nay theo tung task. Cac buoc dung co phap checkbox (`- [ ]`) de theo doi tien do.

**Mục tiêu:** Xay luong search/filter Android MVVM thuc dung cho discovery Mon va Restaurant ma khong doi semantic Cart/Checkout.

**Kiến trúc:** Gioi thieu module Search rieng voi ViewModel state, repository contract va result models. Giu Supabase sau repository de implementation dau co the dung REST/RPC hoac mock fallback trong khi UI van on dinh.

**Tech stack:** Android Java, AndroidX Fragment/ViewModel/LiveData, RecyclerView, Retrofit, Gson, Supabase REST/RPC.

## Rang buoc chung

- Khong doi rule Ordering MVP Cart/Checkout.
- Khong them Supabase SDK; giu style Retrofit/Supabase REST hien co.
- Khong chay SQL schema migration trong task implementation Android tru khi co task backend so huu ro rang.
- Use `Restaurant`, `Mon`, `DishCategory`, `Cuisine`, and `Customer` in docs/UI vocabulary.
- Giu rename code that nho; `FoodItem` va `FoodCategory` co the tiep tuc la compatibility model cho MVP.
- Public search must not require Customer login.
- Chi dung anon key/JWT; khong bao gio dung service role hoac secret key trong Android.

---

## Cấu trúc file

- Tao `app/src/main/java/com/example/fooddelivery/data/model/Restaurant.java`
  - Android model for Restaurant catalogue rows.
- Tao `app/src/main/java/com/example/fooddelivery/data/model/SearchResult.java`
  - Wrapper for `MON` or `RESTAURANT` result rows.
- Tao `app/src/main/java/com/example/fooddelivery/data/model/SearchFilters.java`
  - Immutable-ish state object for query, result type, category, open-only, sort, and tuy chon location.
- Tao `app/src/main/java/com/example/fooddelivery/data/model/SearchCatalogResponse.java`
  - Optional RPC response shape if backend uses `search_catalog`.
- Tao `app/src/main/java/com/example/fooddelivery/data/repository/SearchRepository.java`
  - Search API wrapper and mock fallback.
- Sua `app/src/main/java/com/example/fooddelivery/data/remote/apis/ApiService.java`
  - Them RPC `searchCatalog(...)` hoac method REST Restaurant/list.
- Tao `app/src/main/java/com/example/fooddelivery/ui/search/SearchViewModel.java`
  - Owns query/filter/result/loading/error state.
- Sua `app/src/main/java/com/example/fooddelivery/ui/search/SearchFragment.java`
  - Use `SearchViewModel`, result adapter, filters, and navigation.
- Tao `app/src/main/java/com/example/fooddelivery/ui/search/adapters/SearchResultAdapter.java`
  - RecyclerView adapter with Mon and Restaurant view types.
- Tao `app/src/main/res/layout/search_item_restaurant.xml`
  - Restaurant row/card for search results.
- Sua `app/src/main/res/layout/search_fragment.xml`
  - Add result type controls, active filter state, retry/clear filters affordances if missing.
- Sua `app/src/main/res/navigation/nav_home.xml`
  - Add tuy chon `initial_query` argument to `searchFragment`; add Restaurant navigation from Search if needed.
- Sua `app/src/main/java/com/example/fooddelivery/ui/home/HomeFragment.java`
  - Noi click search/actionSearch tu Home sang Search screen.
- Sua `app/src/main/java/com/example/fooddelivery/ui/detail/RestaurantDetailFragment.java`
  - Dung `restaurant_id` dau vao thay vi hard-code `1L`.
- Sua test trong `app/src/test/java/com/example/fooddelivery/`
  - Them ViewModel/unit test cho search behavior.

## Interface tạo ra/tiêu thụ

- Tao ra `SearchRepository.search(SearchFilters filters): Call<SearchCatalogResponse>` or callback-backed equivalent.
- Tao ra `SearchViewModel.setQuery(String query)`, `setResultType(ResultType type)`, `setSort(Sort sort)`, `setOpenOnly(boolean openOnly)`, `clearFilters()`, `retry()`.
- Tieu thu `ApiService.searchCatalog(SearchCatalogRequest request)` when RPC exists.
- Tieu thu hien co `FoodItem.getId()` for `food_id` navigation.
- Tieu thu `Restaurant.getId()` for `restaurant_id` navigation.

## Task theo thứ tự

### Task 1: Chot state va model Search

**File:**
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/Restaurant.java`
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/SearchResult.java`
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/SearchFilters.java`
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/SearchCatalogResponse.java`

- [ ] Define `Restaurant` fields matching `docs/sql.sql`: id, name, description, addressDetail, locality, latitude, longitude, logoUrl, coverUrl, avgRating, totalReviews, totalOrders, isOpen.
- [ ] Define `SearchResult.Type` values `MON` and `RESTAURANT`.
- [ ] Define `SearchFilters.ResultType` values `ALL`, `MON`, `RESTAURANT`.
- [ ] Define `SearchFilters.Sort` values `RELEVANCE`, `BEST_SELLING`, `RATING`, `PRICE_ASC`, `PRICE_DESC`, `DISTANCE`.
- [ ] Them getters/setters voi Gson `@SerializedName` tai cac field map sang snake_case cua Supabase.
- [ ] Compile-check: run `.\gradlew.bat :app:compileDebugJavaWithJavac`.

### Task 2: Them contract Repository/API

**File:**
- Sua: `app/src/main/java/com/example/fooddelivery/data/remote/apis/ApiService.java`
- Tao: `app/src/main/java/com/example/fooddelivery/data/repository/SearchRepository.java`

- [ ] Them contract Retrofit cho `@POST("rest/v1/rpc/search_catalog")` hoac REST method cho `menus` va `restaurants`.
- [ ] Implement `SearchRepository.search(SearchFilters filters)` and keep all API query construction inside the repository.
- [ ] Them mock fallback private voi it nhat ba ket qua Mon va hai ket qua Restaurant de demo resilient.
- [ ] Dam bao query rong hoac mot ky tu tra ve danh sach rong ma khong goi network.
- [ ] Compile-check: run `.\gradlew.bat :app:compileDebugJavaWithJavac`.

### Task 3: Them SearchViewModel

**File:**
- Tao: `app/src/main/java/com/example/fooddelivery/ui/search/SearchViewModel.java`
- Test: `app/src/test/java/com/example/fooddelivery/SearchViewModelTest.java`

- [ ] Write tests for query normalization, minimum query length, clear filters, stale response handling, and error state.
- [ ] Implement `SearchViewModel` with `LiveData<SearchUiState>`.
- [ ] Dung request sequence de response network cu khong overwrite ket qua query moi hon.
- [ ] Debounce text input around 300 ms with `Handler` or a testable equivalent.
- [ ] Chay unit tests: `.\gradlew.bat :app:testDebugUnitTest`.

### Task 4: Xay adapter ket qua va dung Restaurant

**File:**
- Tao: `app/src/main/java/com/example/fooddelivery/ui/search/adapters/SearchResultAdapter.java`
- Tao: `app/src/main/res/layout/search_item_restaurant.xml`
- Tai su dung: `app/src/main/res/layout/home_item_food_list.xml`

- [ ] Implement two view types: Mon and Restaurant.
- [ ] Mon row uses hien co visual pattern and emits `onMonClick(FoodItem)` and `onAddMon(FoodItem)`.
- [ ] Restaurant row emits `onRestaurantClick(Restaurant)`.
- [ ] Dung `placeholder_food` hien co hoac asset placeholder Restaurant khi thieu URL.
- [ ] Compile-check: run `.\gradlew.bat :app:compileDebugJavaWithJavac`.

### Task 5: Noi UI SearchFragment

**File:**
- Sua: `app/src/main/java/com/example/fooddelivery/ui/search/SearchFragment.java`
- Sua: `app/src/main/res/layout/search_fragment.xml`
- Sua: `app/src/main/res/navigation/nav_home.xml`

- [ ] Thay usage `MenuViewModel` bang `SearchViewModel`.
- [ ] Read tuy chon `initial_query` argument and seed the input.
- [ ] Noi thay doi text vao `SearchViewModel.setQuery`.
- [ ] Noi control result type: all, Mon, Restaurant.
- [ ] Noi filter chip: open-only, best-selling/rating/price/distance sort, clear filters.
- [ ] Navigate click Mon toi `action_search_to_foodDetail` voi `food_id`.
- [ ] Them va dung navigation Search-to-Restaurant voi `restaurant_id` neu chua co.
- [ ] Giu add-to-Cart behavior delegate cho Cart path hien tai cho toi khi Ordering MVP thay the.
- [ ] Compile-check: run `.\gradlew.bat :app:compileDebugJavaWithJavac`.

### Task 6: Noi diem vao Search tu Home

**File:**
- Sua: `app/src/main/java/com/example/fooddelivery/ui/home/HomeFragment.java`

- [ ] Restore only the search-related listener from the commented `setupListeners()` block.
- [ ] On focus/click, navigate to Search with no query.
- [ ] On IME action search, navigate to Search with `initial_query`.
- [ ] Avoid changing Home category, cart, banner, or address behavior.
- [ ] Compile-check: run `.\gradlew.bat :app:compileDebugJavaWithJavac`.

### Task 7: Sua input RestaurantDetail

**File:**
- Sua: `app/src/main/java/com/example/fooddelivery/ui/detail/RestaurantDetailFragment.java`
- Sua neu can: `app/src/main/java/com/example/fooddelivery/ui/detail/RestaurantDetailViewModel.java`

- [ ] Read `restaurant_id` from arguments.
- [ ] Pass the argument to `viewModel.loadRestaurantFoods(restaurantId)`.
- [ ] Preserve mock fallback when `restaurant_id == -1L`.
- [ ] Compile-check: run `.\gradlew.bat :app:compileDebugJavaWithJavac`.

### Task 8: Kiem chung

**File:**
- Test: `app/src/test/java/com/example/fooddelivery/SearchViewModelTest.java`

- [ ] Chay compile-check: `.\gradlew.bat :app:compileDebugJavaWithJavac`.
- [ ] Chay unit tests: `.\gradlew.bat :app:testDebugUnitTest`.
- [ ] Chay debug build: `.\gradlew.bat :app:assembleDebug`.
- [ ] Kiểm tra thủ công: Home search opens Search.
- [ ] Kiểm tra thủ công: keyword returns Mon and Restaurant results.
- [ ] Kiểm tra thủ công: filters change visible results or show empty state.
- [ ] Kiểm tra thủ công: Mon click passes `food_id`.
- [ ] Kiểm tra thủ công: Restaurant click passes `restaurant_id`.
- [ ] Kiểm tra thủ công: network failure shows retry and does not crash.

## File cần tạo/sửa

- Tao `app/src/main/java/com/example/fooddelivery/data/model/Restaurant.java`
- Tao `app/src/main/java/com/example/fooddelivery/data/model/SearchResult.java`
- Tao `app/src/main/java/com/example/fooddelivery/data/model/SearchFilters.java`
- Tao `app/src/main/java/com/example/fooddelivery/data/model/SearchCatalogResponse.java`
- Tao `app/src/main/java/com/example/fooddelivery/data/repository/SearchRepository.java`
- Tao `app/src/main/java/com/example/fooddelivery/ui/search/SearchViewModel.java`
- Tao `app/src/main/java/com/example/fooddelivery/ui/search/adapters/SearchResultAdapter.java`
- Tao `app/src/main/res/layout/search_item_restaurant.xml`
- Tao `app/src/test/java/com/example/fooddelivery/SearchViewModelTest.java`
- Sua `app/src/main/java/com/example/fooddelivery/data/remote/apis/ApiService.java`
- Sua `app/src/main/java/com/example/fooddelivery/ui/search/SearchFragment.java`
- Sua `app/src/main/res/layout/search_fragment.xml`
- Sua `app/src/main/res/navigation/nav_home.xml`
- Sua `app/src/main/java/com/example/fooddelivery/ui/home/HomeFragment.java`
- Sua `app/src/main/java/com/example/fooddelivery/ui/detail/RestaurantDetailFragment.java`
- Sua `app/src/main/java/com/example/fooddelivery/ui/detail/RestaurantDetailViewModel.java` if needed

## Compile-check

Chay:

```powershell
.\gradlew.bat :app:compileDebugJavaWithJavac
```

Ky vong: compile succeeds.

## Unit test

Chay:

```powershell
.\gradlew.bat :app:testDebugUnitTest
```

Ky vong: all SearchViewModel tests pass, plus hien co unit tests.

## Kiểm tra thủ công

- Home search opens Search screen.
- Search for `pho` shows Mon results.
- Search for a seeded Restaurant name shows Restaurant results.
- Result type filters switch between all, Mon, and Restaurant.
- Open-only and sort filters update state visibly.
- Mon result opens Food detail with the correct `food_id`.
- Restaurant result opens Restaurant detail with the correct `restaurant_id`.
- Add-to-Cart tu search di theo behavior Cart hien co.

## Ghi chú rollback

If search implementation destabilizes the app, revert the Search module changes and restore `SearchFragment` to the previous `MenuViewModel`-based behavior. The rollback should not touch Ordering MVP, auth, profile, Supabase schema, or unrelated docs.



