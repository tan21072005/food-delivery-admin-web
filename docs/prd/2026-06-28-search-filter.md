# PRD: Search và filter Mon/Restaurant

## Vấn đề

Customer có thể browse Home feed mock và một màn hình Menu một phần, nhưng chưa thể search hoặc filter dữ liệu Mon/Restaurant thật một cách đáng tin. Search box ở Home đã hiển thị nhưng listener wiring đang bị comment. `SearchFragment` tồn tại, nhưng chỉ search Mon qua `MenuViewModel`, dùng dữ liệu fallback mock, và expose filter chips chưa hoạt động. Discovery Restaurant hầu hết là giả: `NearbyRestaurantAdapter` render Restaurant cards từ `FoodItem`, và `RestaurantDetailFragment` bỏ qua `restaurant_id` đầu vào.

Điều này chặn Ordering MVP vì Customer phải tìm được Restaurant hoặc Mon trước khi thêm vào Cart và checkout. Ordering MVP đã chủ động để discovery/search/filter ngoài phạm vi, nên PRD này định nghĩa luồng discovery upstream còn thiếu.

## Mục tiêu

Xây một luồng search và filter MVP thực tế, nơi Customer có thể search Mon và Restaurant, áp dụng một nhóm filter hữu ích nhỏ, mở Restaurant detail hoặc Mon detail, rồi tiếp tục vào các đường add-to-Cart/checkout hiện có mà không đổi ngữ nghĩa Ordering MVP.

## Hiện trạng

- `CONTEXT.md` định nghĩa Restaurant, Mon, DishCategory và Cuisine, nhưng code vẫn dùng `FoodItem` và `FoodCategory`.
- `docs/prd-ordering-mvp.md` xem search/filter, Cuisine, DishCategory và Restaurant browsing là ngoài phạm vi Ordering MVP.
- `docs/prd-domain-model-refactor.md` xác định nhu cầu rộng hơn cho các model Restaurant, Cuisine và DishCategory.
- `app/src/main/res/navigation/nav_home.xml` đã có `homeFragment -> searchFragment`, `homeFragment -> menuFragment`, `homeFragment -> restaurantDetailFragment` và `searchFragment -> foodDetailFragment`.
- `HomeFragment` có EditText search trong `home_fragment.xml`, nhưng `setupListeners()` bị comment nên gõ/bấm search không navigate.
- `SearchFragment` dùng `MenuViewModel`, `FoodVerticalAdapter`, `LocalCart` và Activity `Checkout`. Nó chỉ search tên Mon sau khi fetch toàn bộ menus hoặc dữ liệu mock.
- `search_fragment.xml` có filter chips cho filter, near me, best selling, rating và price, nhưng chưa có active state hoặc click handling.
- `MenuFragment` tải `category_slug`, nhưng `MenuViewModel.getMenusByCategory()` gửi slug dưới dạng `category_id=eq.<slug>`, trong khi API/model gợi ý `category_id` là số.
- `MenuAdapter` có client-side `filter(String query)` nhưng fragment chưa wire icon search.
- `FoodRepository` expose `getCategories()`, `getMenus()`, `getMenusByCategory()` và `getHomeData()`.
- `ApiService` expose Supabase REST endpoints cho `categories`, `menus` và RPC `get_home_data`, nhưng chưa có endpoint list/search Restaurant.
- `docs/sql.sql` định nghĩa `restaurants`, `menu_categories`, `menus` và `categories`; `docs/seed_data.sql` hiện nới lỏng `menus.restaurant_id` và seed `categories`, `menu_categories`, `menus`, nhưng không seed Restaurant thật.
- `docs/rpc_home_data.sql` trả về categories, top_selling và all_foods; chưa có danh sách Restaurant.

## Câu chuyện người dùng

1. Là Customer, tôi muốn bấm search box ở Home để bắt đầu search ngay.
2. Là Customer, tôi muốn nhập keyword để tìm Mon theo tên hoặc mô tả.
3. Là Customer, tôi muốn cùng keyword tìm Restaurant theo tên hoặc locality để chọn nơi đặt.
4. Là Customer, tôi muốn chuyển giữa tất cả kết quả, kết quả Mon và kết quả Restaurant để thu hẹp search nhiễu.
5. Là Customer, tôi muốn filter Mon theo DishCategory để browse một loại món cụ thể.
6. Là Customer, tôi muốn filter Restaurant theo trạng thái mở cửa để không mở Restaurant không khả dụng.
7. Là Customer, tôi muốn sort theo bán chạy, rating, giá thấp đến cao hoặc khoảng cách khi có, để chọn nhanh.
8. Là Customer, tôi muốn empty state có copy rõ ràng để biết nên đổi keyword hay bỏ filter.
9. Là Customer, tôi muốn khi lỗi mạng, màn hình vẫn dùng được với retry action để không bị kẹt.
10. Là Customer, tôi muốn bấm Mon để mở Mon detail và bấm Restaurant để mở Restaurant detail, để tiếp tục tới Cart.
11. Là Customer, tôi muốn thêm Mon từ search dùng cùng hành vi Cart như Home/Menu, để Ordering MVP nhất quán.
12. Là Customer, tôi muốn filter đã áp dụng hiển thị rõ và có thể xóa, để hiểu vì sao kết quả bị giới hạn.

## Phạm vi

- Wire entry search ở Home vào `SearchFragment`.
- Định nghĩa một màn hình Search duy nhất cho kết quả Mon và Restaurant.
- Thêm hoặc lập kế hoạch `SearchViewModel` với search query, tab loại kết quả, filters, loading, empty và error state.
- Thêm contract repository/API cho kết quả discovery kết hợp.
- Giữ layout hiện có phần lớn có thể tái sử dụng; chỉ thêm layout item kết quả hoặc thay adapter khi cần.
- Hỗ trợ filter MVP: loại kết quả, DishCategory, chỉ Restaurant đang mở, sort theo relevance/best selling/rating/price/distance.
- Giữ cách tiếp cận REST/Retrofit hiện tại; không giới thiệu Supabase SDK.
- Cung cấp đường mock/fallback cho demo local nếu discovery RPC Supabase chưa sẵn sàng.

## Ngoài phạm vi

- Migration SQL thật trong task lập kế hoạch này.
- Ranking full text search bằng `tsvector` trong implementation MVP trừ khi worker backend chọn sau.
- Map view, polygon bán kính giao hàng, độ chính xác ETA hoặc GPS routing thật.
- Ranking cá nhân hóa, sponsored results, recent searches, search suggestions, typo tolerance và analytics.
- Seller app quản lý Restaurant/Menu data.
- Thay thế kiến trúc Cart/Checkout của Ordering MVP.
- Rename domain lớn từ `FoodItem`/`FoodCategory` sang `Mon`/`DishCategory` trong một lượt.

## Thuật ngữ domain

- Customer: user duy nhất của app trong repo này.
- Restaurant: business entity có thể đọc, sở hữu Mon.
- Mon: món ăn hoặc đồ uống do Restaurant cung cấp. Model code hiện tại: `FoodItem`.
- DishCategory: nhóm Mon. Model/table code hiện tại còn mơ hồ: `FoodCategory`, `categories` và `menu_categories`.
- Cuisine: phân loại Restaurant. Hiện chưa được model hóa trong Android code.
- SearchQuery: keyword đã normalize do Customer nhập.
- SearchFilter: loại kết quả đã chọn, DishCategory, flag open-only, sort option và location context tùy chọn.
- SearchResult: row UI đại diện cho một Mon hoặc một Restaurant.

## Phụ thuộc

- Ordering MVP chỉ phụ thuộc vào luồng này ở entry point discovery; quy tắc Cart/Checkout vẫn thuộc Ordering MVP.
- `FoodRepository` và `ApiService` phải expose discovery endpoint hoặc RPC.
- `SessionManager`/`SupabaseClient` đã attach anon hoặc Customer JWT cho Supabase REST calls.
- `RestaurantDetailFragment` phải nhận và dùng `restaurant_id`.
- `FoodDetailFragment` đã nhận `food_id`.
- Bảng/RPC Supabase exposed phải readable bởi role anon/authenticated với RLS phù hợp cho dữ liệu catalogue public.
- Seed data phải có Restaurant được link với menus để demo hữu ích.

## Luồng người dùng

1. Customer mở Home.
2. Customer bấm search box hoặc submit text.
3. App navigate tới Search screen với initial query tùy chọn.
4. Search screen focus input và hiển thị idle copy hoặc kết quả.
5. Customer nhập ít nhất 2 ký tự.
6. ViewModel debounce input và tải kết quả Mon/Restaurant kết hợp.
7. Customer bật/tắt loại kết quả hoặc filters.
8. Kết quả refresh mà không rời màn hình.
9. Customer bấm kết quả Restaurant và mở Restaurant detail với `restaurant_id`.
10. Customer bấm kết quả Mon và mở Food detail với `food_id`.
11. Customer thêm Mon vào Cart qua route add-to-Cart hiện tại.

## Mô hình dữ liệu

Các model Android MVP cần lập kế hoạch:

```text
Restaurant
- id: long
- name: String
- description: String?
- addressDetail: String?
- locality: String?
- latitude: double?
- longitude: double?
- logoUrl: String?
- coverUrl: String?
- avgRating: double
- totalReviews: int
- totalOrders: int
- isOpen: boolean

SearchResult
- type: MON | RESTAURANT
- mon: FoodItem?
- restaurant: Restaurant?
- restaurantName: String?
- distanceKm: Double?
- matchReason: String?

SearchFilters
- query: String
- resultType: ALL | MON | RESTAURANT
- dishCategoryId: Long?
- openOnly: boolean
- sort: RELEVANCE | BEST_SELLING | RATING | PRICE_ASC | PRICE_DESC | DISTANCE
- latitude: Double?
- longitude: Double?
```

Không rename `FoodItem`/`FoodCategory` hiện có trong MVP. Dùng thuật ngữ domain trong docs/UI trong khi giữ tương thích code.

## Thay đổi API/RPC/Supabase

Khuyến nghị lập kế hoạch: thêm một RPC contract thay vì nhiều REST query phía client.

```text
POST /rest/v1/rpc/search_catalog
Body:
- p_query text
- p_result_type text default 'all'
- p_category_id bigint default null
- p_open_only boolean default false
- p_sort text default 'relevance'
- p_latitude numeric default null
- p_longitude numeric default null
- p_limit int default 30

Returns JSON:
- results: SearchResult[]
- categories: DishCategory[]
- applied_filters: object
```

MVP có thể triển khai trước bằng REST endpoint `menus` hiện có cộng với REST endpoint `restaurants` nếu RPC chưa sẵn sàng. Tuy nhiên, contract ổn định nên là `SearchRepository.searchCatalog(SearchFilters)` để UI không cần biết dữ liệu đến từ REST, RPC hay mock.

Ghi chú bảo mật/RLS cho SQL tương lai:

- Row catalogue public (`restaurants` nơi `deleted_at is null`, `menus` nơi `status='active'`) có thể readable bởi `anon` và `authenticated`.
- Không expose dữ liệu Customer riêng tư trong search RPC.
- Ưu tiên `SECURITY INVOKER`; nếu cần `SECURITY DEFINER`, giữ function nhỏ, validate input và revoke execute rộng trước khi grant chỉ cho role cần thiết.
- Tránh `auth.role()` trong policies; dùng `TO anon, authenticated` với row predicates.
- Nếu dùng views trên Postgres 15+, dùng `security_invoker = true`.

## Kiến trúc Android

- Fragment: `SearchFragment` sở hữu binding, text input, chips/tabs, adapter events và navigation.
- ViewModel: `SearchViewModel` mới sở hữu debounce, filters, screen state và repository calls.
- Repository: `SearchRepository` mới hoặc mở rộng `FoodRepository` sở hữu Supabase calls và mock fallback.
- API: thêm Retrofit method cho RPC `search_catalog` và/hoặc REST list Restaurant.
- Models: thêm `Restaurant`, `SearchResult`, `SearchFilters` và có thể `SearchCatalogResponse`.
- Adapters: ưu tiên một `SearchResultAdapter` với hai view type, hoặc hai adapter nhỏ nếu layout hiện tại làm cách đó đơn giản hơn.
- Navigation: thêm argument string `initial_query` tùy chọn cho `searchFragment`.

## Trạng thái UI

- Idle: chưa có query, nhắc Customer search Mon hoặc Restaurant.
- Loading: progress hiển thị, giữ kết quả cũ nếu query/filter thay đổi sau lần tải đầu.
- Results: danh sách group hoặc tab với row Mon và Restaurant.
- Empty query: không gọi network cho input rỗng/một ký tự.
- Empty results: hiển thị query và filters active; cho phép clear filters.
- Error initial load: thông báo lỗi/empty full với retry.
- Error refresh: toast/snackbar và giữ kết quả cũ.
- Filter active: chip selected state hiển thị rõ và có thể clear.

## Xử lý lỗi

- Normalize query bằng `trim()`; bỏ qua query rỗng và một ký tự.
- Debounce typing khoảng 300 ms và hủy/bỏ qua stale responses bằng request sequence.
- Network failure chỉ fallback sang mock data trong debug/demo mode, hoặc hiển thị retry trong production path.
- Sort/filter value không hợp lệ được ViewModel ép về default trước khi gọi repository.
- Nếu Restaurant result thiếu `cover_url`, dùng placeholder hiện có.
- Nếu Mon có `restaurant_id <= 0`, disable Restaurant navigation và log/debug-toast trong development.
- Nếu API trả unauthorized, hiển thị thông báo catalogue tạm không khả dụng; public discovery không nên yêu cầu login.

## Ghi chú bảo mật/RLS

- Search là dữ liệu catalogue public, không phải dữ liệu thuộc Customer.
- RLS phải ngăn đọc Restaurant soft-deleted và Menu inactive.
- Search RPC không được trả user email, phone, auth UID, cart, order, address hoặc field seller-only.
- Client tiếp tục chỉ dùng anon key/JWT; không bao giờ dùng service role.
- Nếu distance dùng latitude/longitude từ thiết bị Customer, chỉ gửi tọa độ search hiện tại và không persist trong MVP.
- Giới hạn độ dài query, giới hạn page size và tránh trả chi tiết lỗi SQL tùy ý ra UI.

## Chiến lược test

- Unit test `SearchViewModel` với fake `SearchRepository`.
- Test normalize query, độ dài tối thiểu, debounce/request sequence, clear filters và trạng thái sort/filter.
- Test payload navigation của kết quả Mon dùng `food_id`.
- Test payload navigation của kết quả Restaurant dùng `restaurant_id`.
- Test mapping URL/body repository với fake Retrofit service nếu khả thi.
- Giữ test tập trung vào state quan sát được và hành vi nhìn thấy bởi user, không phải internal method calls.
- Verification API thủ công có thể thực hiện với Supabase SQL/RPC sau; task lập kế hoạch này không chạy schema change thật.

## Kịch bản demo thủ công

1. Launch app và mở Home.
2. Bấm search field.
3. Xác nhận Search screen mở và input được focus.
4. Nhập `pho`.
5. Xác nhận kết quả Mon phù hợp xuất hiện.
6. Chuyển sang kết quả Restaurant và search keyword Restaurant từ seed data.
7. Bật `Đang mở cửa` hoặc filter open-only.
8. Sort theo rating và xác nhận thứ tự thay đổi hoặc ổn định khi rating bằng nhau.
9. Bấm một kết quả Restaurant và xác nhận Restaurant detail mở cho `restaurant_id` đó.
10. Quay lại, bấm một kết quả Mon và xác nhận Food detail mở cho `food_id` đó.
11. Mô phỏng lỗi mạng và xác nhận retry/error state dễ hiểu.

## Rủi ro

- Seed data hiện tại có thể có menus không có `restaurant_id` thật, làm Restaurant discovery yếu.
- Mismatch `category_slug` với `category_id` dạng số có thể làm hỏng category filtering.
- Tái sử dụng `FoodItem` cho Restaurant cards che giấu bug domain.
- RPC với `SECURITY DEFINER` có thể vô tình bypass RLS nếu triển khai cẩu thả.
- Search relevance có thể bị over-engineer; MVP nên ưu tiên filters/sorts dễ đoán.
- Mojibake trong copy tiếng Việt hiện có có thể làm UI assertions giòn.
- Thay đổi Cart của Ordering MVP có thể làm thay đổi hành vi add-to-Cart trong khi công việc này được triển khai.

## Câu hỏi mở

- Search nên mặc định là tất cả kết quả hay chỉ Mon?
- Gõ ở Home nên submit ngay hay chỉ navigate tới Search khi tap/actionSearch?
- Search Restaurant có yêu cầu seed data Restaurant thật trước khi bắt đầu implementation không?
- Bảng canonical cho DishCategory trong MVP là `categories` hay `menu_categories`?
- Cuisine có bắt buộc cho filter MVP không, hay có thể chờ refactor model Restaurant?
- Restaurant đóng cửa nên xuất hiện disabled hay bị ẩn khi open-only tắt?
- Search có nên khả dụng cho Customer anonymous không?
- Backend path tối thiểu chấp nhận được là chỉ REST queries hay bắt buộc RPC?

## Nhật ký giả định

- Giả định: catalogue discovery là public và có thể đọc trước login.
- Giả định: MVP có thể giữ tên class `FoodItem`/`FoodCategory` trong khi UI/docs dùng thuật ngữ domain.
- Giả định: MVP thực tế không yêu cầu Postgres full-text search đầy đủ.
- Giả định: hành vi add-to-Cart của Ordering MVP thuộc worker khác và không nên được thiết kế lại ở đây.
- Giả định: implementation đầu tiên nên hỗ trợ mock fallback để viva/demo có thể diễn ra khi seed data Supabase chưa đầy đủ.
