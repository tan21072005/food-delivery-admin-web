# PRD: Discovery / Home / Browse Restaurant / Menu đầy đủ

> Trạng thái: bản nháp planning  
> Chủ sở hữu: Worker 1  
> Ngày: 2026-06-28  
> Rào chắn phạm vi: chỉ lập kế hoạch. Không sửa Android app code, không đổi SQL schema thật, không commit từ tài liệu này.

## Vấn đề

Luồng khám phá hiện đang bị chia nhỏ giữa dữ liệu mock ở Home, vài API Supabase cho menu, Restaurant detail hard-code và Cart demo trong memory. Ordering MVP cần Customer tìm được Restaurant thật, xem full Menu, chọn Mon và thêm vào đúng Cart theo Restaurant. Hiện tại đường đi này chưa phải flow backend-backed đáng tin cậy.

## Mục tiêu

Mục tiêu: xây dựng luồng discovery phù hợp MVP cho Android Java + MVVM + Retrofit + Supabase. Customer có thể mở Home, browse theo Cuisine/DishCategory, vào Restaurant detail, xem full Menu, xem chi tiết Mon và thêm Mon vào Cart theo Restaurant.

## Hiện trạng

- Hiện tại: `HomeFragment` đã khởi tạo banner, category, top selling, all foods và sticky cart UI.
- Hiện tại: `HomeViewModel.loadHome()` vẫn dùng `FoodCategory` và `FoodItem` hard-code thay vì `FoodRepository.getHomeData()`.
- Hiện tại: `FoodRepository` đã có `getCategories`, `getMenus`, `getMenusByCategory`, `getHomeData`.
- Hiện tại: `ApiService` đã có REST endpoint cho `categories`, `menus` và RPC `get_home_data`.
- Hiện tại: `docs/rpc_home_data.sql` trả về `categories`, `top_selling`, `all_foods` từ `categories` và `menus`.
- Hiện tại: `MenuFragment` nhận `category_slug` và `category_name`, nhưng `MenuViewModel` lại gửi slug vào query `category_id=eq.<slug>`.
- Hiện tại: `MenuViewModel` fallback sang mock menu khi API fail hoặc empty.
- Hiện tại: `RestaurantDetailFragment` nhận `restaurant_id` trong navigation nhưng có chỗ gọi `viewModel.loadRestaurantFoods(1L)` thay vì dùng argument.
- Hiện tại: `RestaurantDetailViewModel` trả hai Mon mock cho mọi Restaurant.
- Hiện tại: `RestaurantInfoFragment` có TODO load Restaurant info thật theo `restaurant_id`.
- Hiện tại: `FoodDetailViewModel` trả mock Mon theo `foodId`.
- Hiện tại: các action add-to-cart visible chủ yếu ghi vào `LocalCart`, một singleton demo trong memory.
- Hiện tại: `CheckoutViewModel`, `OrderRepository` và RPC docs đã có một phần Supabase Cart/Checkout, nhưng Checkout UI vẫn dùng Activity `Checkout` và `LocalCart`.
- Chuyển tiếp: Discovery/Menu phải handoff sang contract Cart theo Restaurant trong `docs/prd-ordering-mvp.md`; code local/demo chỉ nên là fallback tạm.
- Chuyển tiếp: `categories` trong SQL hiện giống category cho Home/discovery, còn `menu_categories` giống DishCategory hơn. `Cuisine` đã được định nghĩa trong `CONTEXT.md` nhưng chưa có model rõ trong Android.

## Câu chuyện người dùng

1. Mục tiêu: là Customer, tôi muốn Home hiển thị Cuisine hoặc discovery category thật để bắt đầu browse.
2. Mục tiêu: là Customer, tôi muốn Home hiển thị Mon phổ biến và Restaurant đang mở từ Supabase để app vẫn hữu ích sau khi restart.
3. Mục tiêu: là Customer, tôi muốn bấm Cuisine để xem Restaurant hoặc Mon liên quan.
4. Mục tiêu: là Customer, tôi muốn bấm Restaurant để xem đúng thông tin: ảnh, địa chỉ, trạng thái mở cửa, rating, promotion, review entry point và Menu.
5. Mục tiêu: là Customer, tôi muốn Restaurant detail hiển thị full Menu, có group/filter theo DishCategory.
6. Mục tiêu: là Customer, tôi muốn Mon unavailable bị ẩn hoặc disable để không add nhầm.
7. Mục tiêu: là Customer, tôi muốn bấm Mon để xem detail có giá, mô tả, ảnh, Restaurant và quantity control.
8. Mục tiêu: là Customer, tôi muốn add Mon từ Home/Menu/Restaurant/Food detail vào đúng Cart của Restaurant đó.
9. Mục tiêu: là Customer, tôi muốn có loading, empty và retry state để phân biệt chưa có dữ liệu với lỗi mạng.
10. Mục tiêu: là Customer, tôi muốn search/filter dùng cùng nguồn dữ liệu với Home, không phải mock path riêng.

## Phạm vi

- Mục tiêu: Home discovery sections được backend bằng Supabase qua `FoodRepository`.
- Mục tiêu: model Restaurant list/detail và repository method.
- Mục tiêu: full Restaurant Menu theo `restaurant_id`, có DishCategory filtering.
- Mục tiêu: chi tiết Mon load từ Supabase theo `food_id`.
- Mục tiêu: handoff add-to-Cart sang contract Cart API của Ordering MVP.
- Mục tiêu: loading, error, empty, retry và logged-out handling cho discovery.
- Mục tiêu: ViewModel state có thể unit test cho Home, Menu, Restaurant detail và Mon detail.

## Ngoài phạm vi

- Seller app quản lý Restaurant.
- Realtime open/close update.
- GPS distance ranking và delivery ETA.
- Topping/variant phức tạp ngoài việc hiển thị label nếu data đã có.
- Payment, Checkout implementation, Order tracking implementation và voucher.
- Push notification.
- Viết hoặc chạy schema migration thật trong planning task này.
- Xóa toàn bộ legacy/local cart code trong planning task này.

## Thuật ngữ domain

- Customer: người dùng app đặt món.
- Restaurant: đơn vị bán hàng, Customer app chỉ đọc.
- Mon: món ăn/đồ uống thuộc một Restaurant.
- DishCategory: nhóm Mon trong Menu của Restaurant.
- Cuisine: phân loại Restaurant để discovery.
- Cart: đơn nháp theo từng Restaurant trong Ordering MVP.
- CartItem: Mon + quantity trước checkout.

## Phụ thuộc

- Hiện tại: `CONTEXT.md` là nguồn từ vựng domain canonical.
- Hiện tại: `docs/prd-ordering-mvp.md` là contract downstream cho Cart/Checkout/Order.
- Hiện tại: `docs/sql.sql` có `restaurants`, `menu_categories`, `menus`, `categories`.
- Hiện tại: `docs/rpc_home_data.sql` định nghĩa Home aggregate RPC hiện tại.
- Hiện tại: Android dùng Java, AndroidX Fragment/ViewModel/LiveData, Retrofit, Gson, Glide, Navigation XML.
- Mục tiêu: Repository method phải che chi tiết Supabase REST/RPC khỏi Fragment.
- Mục tiêu: mọi call liên quan Customer state phải dựa vào auth/session hiện có.

## Luồng người dùng

1. Mục tiêu: Customer mở Home.
2. Mục tiêu: Home load payload: Cuisine/category chips, Mon phổ biến và Restaurant cards.
3. Mục tiêu: Customer bấm Cuisine/category chip hoặc "see all".
4. Mục tiêu: Browse screen load Restaurant/Mon đã filter với state sẵn sàng cho paging sau này.
5. Mục tiêu: Customer bấm Restaurant.
6. Mục tiêu: Restaurant detail load theo `restaurant_id`, gồm header và full Menu.
7. Mục tiêu: Customer filter Menu theo DishCategory hoặc scroll tất cả Mon.
8. Mục tiêu: Customer bấm Mon để xem detail hoặc bấm add.
9. Mục tiêu: Add action gọi Cart contract và update sticky Cart/draft state.
10. Mục tiêu: Customer tiếp tục Ordering MVP flow từ sticky Cart/Order draft.

## Mô hình dữ liệu

Hiện tại:

- `FoodItem`: map `menus.id`, `restaurant_id`, `category_id`, `item_name`, `description`, `price`, `rating`, `image_url`, `status`; có thêm local-only `soldCount`.
- `FoodCategory`: map `categories.id`, `cat_name`, `icon_url`, thêm local `slug`.
- `HomeDataResponse`: `categories`, `top_selling`, `all_foods`.

Mục tiêu:

- `Restaurant`: `id`, `name`, `description`, `addressDetail`, `locality`, `latitude`, `longitude`, `logoUrl`, `coverUrl`, `avgRating`, `totalReviews`, `totalOrders`, `isOpen`.
- `Cuisine`: `id`, `name`, `slug`, `iconUrl`.
- `DishCategory`: `id`, `name`, `slug`, `iconUrl`.
- `Mon`: có thể tạm giữ class name `FoodItem` nếu rename rộng quá rủi ro. Field cần có: `id`, `restaurantId`, `dishCategoryId`, `name`, `description`, `price`, `rating`, `imageUrl`, `status`, `soldCount`.
- `RestaurantMenuResponse`: Restaurant header + `List<DishCategory>` + `List<FoodItem>`.

Chuyển tiếp:

- Giữ `FoodItem` và `FoodCategory` ở pass đầu để tương thích, nhưng document chúng như adapter cho Mon/DishCategory/Cuisine.
- Không dựa vào mock `soldCount` trong release nếu Supabase chưa expose.

## Thay đổi API/RPC/Supabase

Hiện tại:

- REST `GET rest/v1/categories`
- REST `GET rest/v1/menus`
- REST `GET rest/v1/menus?category_id=...`
- RPC `POST rest/v1/rpc/get_home_data`

Mục tiêu:

- Thêm hoặc chỉnh Home RPC để include active Restaurants và tách rõ Cuisine với DishCategory.
- Thêm Restaurant detail query/RPC theo `restaurant_id`.
- Thêm Restaurant Menu query theo `restaurant_id`, có optional `category_id`.
- Thêm Mon detail query theo `food_id`.
- Thêm Cart handoff call khớp Ordering MVP per-Restaurant Cart.

Chuyển tiếp:

- Planning task này không đổi schema.
- SQL tương lai nên ưu tiên view/RPC tương thích thay vì rename table rủi ro.
- Nếu `categories` vẫn là Home discovery và `menu_categories` là DishCategory, Android naming phải thể hiện rõ.

## Kiến trúc Android

Mục tiêu:

- Fragment: render state, bind adapter, nhận click, navigate.
- ViewModel: expose screen state, xử lý query/filter intent, gọi repository, map error.
- Repository: sở hữu Retrofit call, parse response, cung cấp callback/result.
- Model: Java DTO với `@SerializedName`, thêm UI state wrapper khi cần.
- Navigation: truyền `restaurant_id`, `food_id`, `category_id`, label qua `Bundle` hoặc Safe Args nếu sau này dùng.

Chuyển tiếp:

- Thay direct `LocalCart` call từ discovery surface bằng Cart repository method khi Ordering MVP Cart sẵn sàng.
- Giữ adapter hiện có nếu adapter chỉ làm presentation.

## Trạng thái UI

- Mục tiêu: initial loading với spinner/skeleton.
- Mục tiêu: content có list dữ liệu.
- Mục tiêu: empty Home khi không có active Restaurant/Mon.
- Mục tiêu: empty Menu khi Restaurant không có active Mon hoặc filter không có kết quả.
- Mục tiêu: network error có retry.
- Mục tiêu: auth-required khi add-to-cart cần login.
- Mục tiêu: Restaurant closed state, cho browse nhưng disable add-to-cart hoặc cần product decision.
- Mục tiêu: Mon unavailable state, disable add button.
- Mục tiêu: sticky Cart summary sau khi add thành công.

## Xử lý lỗi

- Mục tiêu: HTTP 401/403 nghĩa là session expired hoặc RLS denied; yêu cầu Customer login lại.
- Mục tiêu: HTTP 404 cho Restaurant/Mon nghĩa là show "không còn khả dụng" và có option quay lại.
- Mục tiêu: HTTP 5xx/network failure show retry, giữ old content nếu đã load.
- Mục tiêu: API empty body không được âm thầm chuyển sang mock trong release.
- Mục tiêu: Add-to-Cart fail không update sticky Cart optimistic nếu chưa có rollback.

## Ghi chú bảo mật/RLS

- Mục tiêu: Customer app chỉ đọc Restaurant, Cuisine, DishCategory và Mon active/non-deleted.
- Mục tiêu: Customer chỉ create/update Cart row cho chính auth user của mình.
- Mục tiêu: không expose service-role key trong Android.
- Mục tiêu: Restaurant draft/unpublished Menu phải bị RLS hoặc RPC filter ẩn đi.
- Mục tiêu: Add-to-Cart RPC phải validate `menu.status = active`, rule Restaurant availability và Customer identity ở server.
- Chuyển tiếp: `docs/sql.sql` có ghi "NO RLS - DEV MODE"; production MVP phải review và bật RLS trước release.

## Chiến lược test

- Mục tiêu: unit test `HomeViewModel` cho success, empty, API failure và retry.
- Mục tiêu: unit test `MenuViewModel` cho category/filter mapping và không mock fallback trong release path.
- Mục tiêu: unit test `RestaurantDetailViewModel` để chắc chắn dùng đúng `restaurant_id`.
- Mục tiêu: unit test `FoodDetailViewModel` cho Mon detail success/unavailable.
- Mục tiêu: Repository test có thể dùng mocked Retrofit `Call` hoặc fake repository interface.
- Mục tiêu: manual integration test với Supabase seed data.
- Mục tiêu: compile check bằng `.\gradlew.bat :app:compileDebugJavaWithJavac`.
- Mục tiêu: unit test bằng `.\gradlew.bat :app:testDebugUnitTest`.

## Kịch bản demo thủ công

1. Seed Supabase với ít nhất hai Restaurant đang mở, hai Cuisine, ba DishCategory và tám Mon active.
2. Launch app và login Customer.
3. Mở Home và xác nhận categories/Restaurants/Mon thật xuất hiện.
4. Pull refresh hoặc retry sau khi tắt/bật mạng.
5. Bấm discovery category và xác nhận browse result đã filter.
6. Bấm Restaurant và xác nhận detail dùng đúng `restaurant_id`.
7. Filter Restaurant Menu theo DishCategory rồi clear filter.
8. Mở Mon detail và kiểm tra giá/ảnh/mô tả.
9. Add một Mon vào Cart và xác nhận sticky Cart/draft state update.
10. Lặp lại với Restaurant khác để xác nhận Ordering MVP xử lý per-Restaurant Cart.

## Rủi ro

- Table naming hiện làm mờ ranh giới Cuisine, DishCategory và product/home categories.
- `FoodCategory.slug` hiện local-only trong khi API filter dùng numeric `category_id`.
- Mock fallback có thể che backend/RLS failure.
- Restaurant detail hiện có rủi ro ignore navigation argument.
- LocalCart và backend Cart có thể lệch trong giai đoạn chuyển tiếp.
- Text mojibake tiếng Việt cũ có thể làm UI copy cleanup khó hơn.

## Câu hỏi mở

Các câu hỏi cần review nằm tại:

- `docs/planning/questions/2026-06-28-discovery-home-browse-menu-questions.md`

Các quyết định quan trọng nhất:

1. Home chip đại diện cho Cuisine, DishCategory hay editorial category?
2. Home Mon nên mở Food detail hay Restaurant detail?
3. Restaurant đóng cửa nên hidden, disabled hay vẫn browse?
4. Có chấp nhận giữ `FoodItem`/`FoodCategory` như adapter tạm không?
5. Home dùng RPC aggregate hay nhiều REST call?

## Nhật ký giả định

- **Giả định:** Discovery/Menu nên ưu tiên backend-backed data hơn mock fallback.  
  **Vì sao hợp lý:** Ordering MVP cần Cart/Order thật, mock data không chứng minh flow thật.  
  **Rủi ro nếu sai:** App demo có thể chậm nếu backend chưa sẵn sàng.  
  **Cách validate:** chạy manual demo với seed Supabase.

- **Giả định:** Chưa rename toàn bộ `FoodItem` thành `Mon` trong pass đầu.  
  **Vì sao hợp lý:** Rename rộng có thể làm vỡ nhiều adapter/layout trong lúc cần demo.  
  **Rủi ro nếu sai:** Code vẫn có vocabulary cũ.  
  **Cách validate:** ghi rõ mapping trong docs và chỉ rename khi có task refactor riêng.
