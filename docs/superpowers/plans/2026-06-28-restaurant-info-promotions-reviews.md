# Restaurant info / promotions / reviews data thật Kế hoạch implementation

> **Danh cho worker agentic:** SUB-SKILL BAT BUOC: Dung superpowers:subagent-driven-development (khuyen nghi) hoac superpowers:executing-plans de trien khai plan nay theo tung task. Cac buoc dung co phap checkbox (`- [ ]`) de theo doi tien do.

**Mục tiêu:** Thay cac man hinh mock Restaurant info, promotions va reviews bang du lieu that tu Supabase, dong thoi giu uu tien Ordering MVP.

**Kiến trúc:** Giu Android Java + MVVM + Retrofit. Them model/repository/ViewModel/API method nho, tap trung doc du lieu cho Restaurant info, active offers va review aggregates. Xem review creation va schema offer rieng cho Restaurant la slice follow-up tru khi Ordering MVP completed Orders va schema support da co.

**Tech stack:** Android Java, AndroidX Fragment/ViewModel/LiveData, Retrofit, Gson, Supabase REST/RPC, hien co XML layouts.

## Rang buoc chung

- Nguon plan: `docs/prd/2026-06-28-restaurant-info-promotions-reviews.md`.
- Khong block checkout/order tracking cua Ordering MVP.
- Use `Restaurant`, `Customer`, `Món`, `Cart`, `Order`, and `DeliveryAddress` vocabulary from `CONTEXT.md`.
- Supabase is the target source of truth for real data.
- Khong tin tinh toan promotion chi o client khi checkout; checkout validate final discount phia server.
- Read-only review aggregate may ship before review submission.
- Never expose `service_role` or secret keys in the app.
- Enable RLS before exposing new/changed tables in Supabase production.

---

## Cau truc file

- Sua: `app/src/main/res/navigation/nav_home.xml`
  - Giu destination hien co; verify argument van la `restaurant_id`.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/detail/RestaurantDetailFragment.java`
  - Read da chon `restaurant_id`; pass it to info/promotions/reviews; load foods for that id.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/detail/RestaurantDetailViewModel.java`
  - Thay Restaurant foods hard-coded bang loading qua repository trong task sau.
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/RestaurantInfo.java`
  - UI read model for Restaurant info.
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/RestaurantTiming.java`
  - Opening-hours model.
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/RestaurantPromotion.java`
  - Active offer/promotion model.
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/RestaurantReviewSummary.java`
  - Aggregate review model.
- Tao: `app/src/main/java/com/example/fooddelivery/data/repository/RestaurantRepository.java`
  - Supabase reads for Restaurant info, timings, promotions, review summary, and Restaurant foods.
- Sua: `app/src/main/java/com/example/fooddelivery/data/remote/apis/ApiService.java`
  - Them endpoint/signature RPC doc du lieu.
- Tao: `app/src/main/java/com/example/fooddelivery/ui/detail/RestaurantInfoViewModel.java`
  - State for Restaurant info screen.
- Tao: `app/src/main/java/com/example/fooddelivery/ui/promotions/PromotionsViewModel.java`
  - State for active promotions screen.
- Tao: `app/src/main/java/com/example/fooddelivery/ui/reviews/ReviewsViewModel.java`
  - State for review aggregate/list filters.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/detail/RestaurantInfoFragment.java`
  - Bind real info state.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/promotions/PromotionsFragment.java`
  - Remove mock list fallback.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/promotions/adapters/PromotionAdapter.java`
  - Support `submitList`/availability state.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/promotions/model/PromotionItem.java`
  - Either replace with data-layer model or map from `RestaurantPromotion`.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/reviews/ReviewsFragment.java`
  - Tai summary that va cac row review that tuy chon; giu filter.
- Sua: `app/src/main/java/com/example/fooddelivery/ui/reviews/adapters/ReviewAdapter.java`
  - Giu API update list; dam bao khong fallback fake.
- Test: `app/src/test/java/com/example/fooddelivery/RestaurantRealDataViewModelTest.java`
  - test ViewModel voi fake repository.

## Contract backend

Prefer RPCs if joins become awkward:

- `get_restaurant_info(p_restaurant_id bigint)` returns one object with Restaurant fields and timings.
- `get_restaurant_promotions(p_restaurant_id bigint, p_subtotal numeric default null)` returns active offers and availability.
- `get_restaurant_review_summary(p_restaurant_id bigint)` returns aggregate values.

If using PostgREST direct reads first:

- `GET rest/v1/restaurants?id=eq.{id}&select=id,name,description,phone_number,address_detail,locality,latitude,longitude,logo_url,cover_url,avg_rating,total_reviews,total_orders,is_open`
- `GET rest/v1/restaurant_timings?restaurant_id=eq.{id}&select=id,restaurant_id,week_day,open_time,close_time`
- `GET rest/v1/offers?status=eq.active&start_date=lte.{now}&end_date=gte.{now}&select=id,coupon_code,offer_type,discount_type,discount_value,max_discount_amount,min_order_amount,start_date,end_date,description,status`

Chua lap ke hoach cho cac dong review cho toi khi schema ton tai.

---

### Task 1: Sua truyen `restaurant_id`

**File:**
- Sua: `app/src/main/java/com/example/fooddelivery/ui/detail/RestaurantDetailFragment.java`
- Test: `app/src/test/java/com/example/fooddelivery/RestaurantRealDataViewModelTest.java`

**Interface:**
- Tieu thu: `restaurant_id` navigation argument.
- Tao ra: `long da chonRestaurantId`.

- [ ] **Buoc 1: Them test resolver pure**

Tao helper nho co the test hoac method ViewModel:

```java
long resolveRestaurantId(Bundle args) {
    return args == null ? -1L : args.getLong("restaurant_id", -1L);
}
```

Cac truong hop ky vong:
- null bundle returns `-1L`.
- missing id returns `-1L`.
- valid id returns that id.

- [ ] **Buoc 2: Dung id da resolve trong RestaurantDetailFragment**

Thay load hard-coded:

```java
viewModel.loadRestaurantFoods(1L);
```

with da chon id loading:

```java
long restaurantId = getArguments() != null
        ? getArguments().getLong("restaurant_id", -1L)
        : -1L;
viewModel.loadRestaurantFoods(restaurantId);
```

- [ ] **Buoc 3: Pass id to all child screens**

Info and promotions should navigate with the same bundle pattern already used for reviews.

- [ ] **Buoc 4: Compile-check**

Chay: `.\gradlew.bat :app:compileDebugJavaWithJavac`

Ky vong: compile succeeds.

---

### Task 2: Them model doc Restaurant va Repository

**File:**
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/RestaurantInfo.java`
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/RestaurantTiming.java`
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/RestaurantPromotion.java`
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/RestaurantReviewSummary.java`
- Tao: `app/src/main/java/com/example/fooddelivery/data/repository/RestaurantRepository.java`
- Sua: `app/src/main/java/com/example/fooddelivery/data/remote/apis/ApiService.java`

**Interface:**
- Tao ra:
  - `Call<List<RestaurantInfo>> getRestaurantInfo(String idFilter, String select)`
  - `Call<List<RestaurantTiming>> getRestaurantTimings(String restaurantIdFilter, String select)`
  - `Call<List<RestaurantPromotion>> getActiveOffers(String statusFilter, String startFilter, String endFilter, String select)`
  - `Call<List<FoodItem>> getMenusByRestaurant(String restaurantIdFilter, String select)`

- [ ] **Buoc 1: Them field model voi `@SerializedName` khop cot Supabase**

Dung ten cot chinh xac tu `docs/sql.sql`: `address_detail`, `logo_url`, `cover_url`, `avg_rating`, `total_reviews`, `total_orders`, `is_open`.

- [ ] **Buoc 2: Them endpoint read trong ApiService**

Dung method PostgREST truc tiep truoc. Giu migration RPC nhu tuy chon toi uu backend.

- [ ] **Buoc 3: Them wrapper RestaurantRepository**

The repository should return Retrofit `Call` objects and not hold UI state.

- [ ] **Buoc 4: Compile-check**

Chay: `.\gradlew.bat :app:compileDebugJavaWithJavac`

Ky vong: compile succeeds.

---

### Task 3: Noi man hinh Restaurant Info

**File:**
- Tao: `app/src/main/java/com/example/fooddelivery/ui/detail/RestaurantInfoViewModel.java`
- Sua: `app/src/main/java/com/example/fooddelivery/ui/detail/RestaurantInfoFragment.java`
- Sua neu can: `app/src/main/res/layout/fragment_restaurant_info.xml`

**Interface:**
- Tieu thu: `RestaurantRepository`.
- Tao ra: LiveData for loading, error, info, timings.

- [ ] **Buoc 1: Write ViewModel tests**

Cover:
- invalid `restaurant_id` emits error/empty and does not call real data.
- repository success emits Restaurant info.
- empty repository result emits not-found state.
- network failure emits retryable error.

- [ ] **Buoc 2: Implement ViewModel**

State should include:
- `LiveData<Boolean> isLoading`
- `LiveData<RestaurantInfo> restaurantInfo`
- `LiveData<List<RestaurantTiming>> timings`
- `LiveData<String> errorMessage`

- [ ] **Buoc 3: Bind Fragment**

Read `restaurant_id`, call `viewModel.load(restaurantId)`, observe state, and set hien co TextViews.

- [ ] **Buoc 4: Go fallback mock**

Neu load fail, hien thi error/empty state. Khong hien gia tri Restaurant hard-coded.

- [ ] **Buoc 5: Chay tests and compile**

Chay:
- `.\gradlew.bat :app:testDebugUnitTest`
- `.\gradlew.bat :app:compileDebugJavaWithJavac`

Ky vong: tests and compile pass.

---

### Task 4: Noi man hinh Promotions

**File:**
- Tao: `app/src/main/java/com/example/fooddelivery/ui/promotions/PromotionsViewModel.java`
- Sua: `app/src/main/java/com/example/fooddelivery/ui/promotions/PromotionsFragment.java`
- Sua: `app/src/main/java/com/example/fooddelivery/ui/promotions/adapters/PromotionAdapter.java`
- Sua hoac thay: `app/src/main/java/com/example/fooddelivery/ui/promotions/model/PromotionItem.java`

**Interface:**
- Tieu thu: `RestaurantRepository.getActiveOffers(...)`.
- Tao ra: active `RestaurantPromotion` list and availability labels.

- [ ] **Buoc 1: Write promotion ViewModel tests**

Cover:
- active offer returned as available when subtotal is null.
- active offer below min subtotal is unavailable with a reason.
- empty offer list shows empty state.
- invalid Restaurant id still allows app-wide offer list only if product decides app-wide promotions are allowed.

- [ ] **Buoc 2: Thay `getMockPromotions()`**

Fragment should call `viewModel.loadPromotions(restaurantId, subtotalOrNull)`.

- [ ] **Buoc 3: Adapter supports list replacement**

Them `submitList(List<RestaurantPromotion> items)` hoac map sang `PromotionItem`.

- [ ] **Buoc 4: Disable misleading "Dang ky" behavior**

Trong MVP, button action nen chi hien thong tin hoac copy coupon code. Khong tao paid promotion subscription.

- [ ] **Buoc 5: Compile and test**

Chay:
- `.\gradlew.bat :app:testDebugUnitTest`
- `.\gradlew.bat :app:compileDebugJavaWithJavac`

Ky vong: tests and compile pass.

---

### Task 5: Noi review summary va trang thai review that rong

**File:**
- Tao: `app/src/main/java/com/example/fooddelivery/ui/reviews/ReviewsViewModel.java`
- Sua: `app/src/main/java/com/example/fooddelivery/ui/reviews/ReviewsFragment.java`
- Sua neu can: `app/src/main/java/com/example/fooddelivery/ui/reviews/adapters/ReviewAdapter.java`
- Giu: `app/src/main/java/com/example/fooddelivery/ui/reviews/model/ReviewItem.java` until real review table exists.

**Interface:**
- Tieu thu: `RestaurantReviewSummary`.
- Tao ra: summary LiveData and filtered list state.

- [ ] **Buoc 1: Write review ViewModel tests**

Cover:
- summary maps `avg_rating` and `total_reviews`.
- no review rows shows empty list without mock fallback.
- star/photo filters work against real rows when provided.
- reset clears filters.

- [ ] **Buoc 2: Tai summary truoc**

Use `restaurants.avg_rating` and `restaurants.total_reviews` through repository.

- [ ] **Buoc 3: Giu list la tuy chon**

Cho toi khi review schema ton tai, hien aggregate cong empty list state. Khong goi `getMockReviews()`.

- [ ] **Buoc 4: Compile and test**

Chay:
- `.\gradlew.bat :app:testDebugUnitTest`
- `.\gradlew.bat :app:compileDebugJavaWithJavac`

Ky vong: tests and compile pass.

---

### Task 6: Thay mock FoodItem trong RestaurantDetail

**File:**
- Sua: `app/src/main/java/com/example/fooddelivery/ui/detail/RestaurantDetailViewModel.java`
- Sua: `app/src/main/java/com/example/fooddelivery/data/repository/RestaurantRepository.java`
- Sua: `app/src/main/java/com/example/fooddelivery/data/remote/apis/ApiService.java`

**Interface:**
- Tieu thu: `restaurant_id`.
- Tao ra: `LiveData<List<FoodItem>> foods`.

- [ ] **Buoc 1: Them repository method**

`getMenusByRestaurant("eq." + restaurantId, "id,restaurant_id,category_id,item_name,description,image_url,price,rating,status")`

- [ ] **Buoc 2: Thay danh sach FoodItem hard-coded**

ViewModel should call Supabase and expose error state.

- [ ] **Buoc 3: Invalid id behavior**

If `restaurant_id <= 0`, set empty list and error state.

- [ ] **Buoc 4: Compile-check**

Chay: `.\gradlew.bat :app:compileDebugJavaWithJavac`

Ky vong: compile succeeds.

---

### Task 7: Kiem tra thu cong

**File:**
- No app source files unless a prior task failed.

- [ ] **Buoc 1: Seed prerequisite data manually**

Verify Supabase has:
- at least one `restaurants` row
- at least one active `menus` row with that `restaurant_id`
- tuy chon `restaurant_timings`
- tuy chon active `offers`

- [ ] **Buoc 2: Chay app and navigate**

Mo Home/Menu, chon mot Restaurant, roi mo Info, Promotions va Reviews.

- [ ] **Buoc 3: Confirm no mock content**

Ky vong:
- Restaurant info values match Supabase.
- Promotions match active offers.
- Reviews summary matches `restaurants.avg_rating` and `total_reviews`.
- Empty review rows show empty state, not fake names.

- [ ] **Buoc 4: Ordering MVP smoke check**

Add Món to Cart and ensure checkout behavior is unchanged except for da chon Restaurant context.

---

## Tu ra soat

- Spec coverage: Bao phu Restaurant info, promotions, review aggregation, truyen navigation id, go mock, gioi han backend hien tai va tac dong Ordering MVP.
- Placeholder scan: Khong co step implementation phu thuoc behavior "later" chua ro; review creation bi defer va nam ngoai slice implementation dau.
- Type consistency: `restaurant_id` van la `long`; ten field model khop `docs/sql.sql`; repository method dung Retrofit `Call` de khop code hien co.



