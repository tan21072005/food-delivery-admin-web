# Viva: Search và filter Món/Restaurant

> Phạm vi: Customer tìm kiếm và lọc Món/Restaurant thật, không thay đổi Cart/checkout ownership.

## Hiện trạng

1. **Câu hỏi:** Tính năng này giải quyết vấn đề gì?
   **Trả lời ngắn:** Customer chưa search/filter dữ liệu Món/Restaurant thật một cách tin cậy.
   **Trả lời sâu:** Home có search box nhưng listener đang bị comment. `SearchFragment` tồn tại nhưng chủ yếu search Món qua `MenuViewModel` và có fallback mock.
   **File liên quan:** `HomeFragment.java`, `SearchFragment.java`, `search_fragment.xml`.

2. **Câu hỏi:** Vì sao tính năng này tách khỏi Ordering MVP?
   **Trả lời ngắn:** Ordering MVP bắt đầu sau khi Customer đã tìm được Món/Restaurant.
   **Trả lời sâu:** `docs/prd-ordering-mvp.md` đánh dấu discovery, browse Restaurant, search/filter, Cuisine và `DishCategory` là ngoài phạm vi. Search là bước upstream.
   **File liên quan:** `docs/prd-ordering-mvp.md`, `docs/prd/2026-06-28-search-filter.md`.

3. **Câu hỏi:** Hiện phần nào đang mock?
   **Trả lời ngắn:** Home, Restaurant detail foods và Restaurant cards.
   **Trả lời sâu:** `HomeViewModel.loadHome()` tạo mock categories/Món, `RestaurantDetailViewModel.loadRestaurantFoods()` tạo mock Món, `NearbyRestaurantAdapter` dùng `FoodItem` để giả Restaurant cards.
   **File liên quan:** `HomeViewModel.java`, `RestaurantDetailViewModel.java`, `NearbyRestaurantAdapter.java`.

4. **Câu hỏi:** Navigation hiện hỗ trợ gì?
   **Trả lời ngắn:** Home tới Search/Menu/Restaurant detail và Search tới Food detail.
   **Trả lời sâu:** Có thể cần thêm action Search-to-Restaurant để click Restaurant result mở đúng detail bằng `restaurant_id`.
   **File liên quan:** `app/src/main/res/navigation/nav_home.xml`.

5. **Câu hỏi:** Rủi ro lớn nhất nếu Search còn mock là gì?
   **Trả lời ngắn:** Customer có thể add Món không khớp backend.
   **Trả lời sâu:** Ordering cần `menu_id`, `restaurant_id`, giá và status thật. Mock search làm Cart/checkout khó chứng minh đúng.
   **File liên quan:** `docs/prd-ordering-mvp.md`.

## Domain và Data

6. **Câu hỏi:** Món, `DishCategory` và Cuisine khác nhau thế nào?
   **Trả lời ngắn:** Món là item bán; `DishCategory` phân loại Món; Cuisine phân loại Restaurant.
   **Trả lời sâu:** Code có `FoodItem` và `FoodCategory`, nhưng tài liệu/domain nên giữ thuật ngữ rõ để không dùng nhầm category cho Restaurant và Menu.
   **File liên quan:** `CONTEXT.md`, `FoodItem.java`, `FoodCategory.java`.

7. **Câu hỏi:** Vì sao chưa nên rename `FoodItem` thành `Mon` ngay?
   **Trả lời ngắn:** Rename rộng dễ đụng nhiều worker.
   **Trả lời sâu:** MVP nên giữ compatibility models và thêm model search rõ hơn nếu cần. Refactor tên rộng nên làm sau khi flow ổn định.
   **File liên quan:** `FoodItem.java`, `FoodVerticalAdapter.java`, `MenuAdapter.java`.

8. **Câu hỏi:** Data mismatch nào ảnh hưởng category filter?
   **Trả lời ngắn:** `categories`, `menu_categories` và `category_id` chưa thống nhất.
   **Trả lời sâu:** `menus.category_id` trỏ `menu_categories(id)`, Android `FoodCategory` map `categories.cat_name`, còn `MenuViewModel` có thể truyền slug vào numeric `category_id`.
   **File liên quan:** `docs/sql.sql`, `ApiService.java`, `FoodCategory.java`, `MenuViewModel.java`.

9. **Câu hỏi:** Vì sao cần Restaurant model riêng?
   **Trả lời ngắn:** Restaurant result cần field khác Món.
   **Trả lời sâu:** Restaurant cần id, name, locality, cover/logo, rating, open status và distance. Dùng `FoodItem` cho Restaurant card che bug và sai navigation.
   **File liên quan:** `NearbyRestaurantAdapter.java`, `item_nearby_restaurant.xml`, `docs/sql.sql`.

10. **Câu hỏi:** Kết quả Search nên phân loại thế nào?
    **Trả lời ngắn:** Theo result type như Món và Restaurant.
    **Trả lời sâu:** Typed result giúp adapter biết mở `FoodDetailFragment` bằng `food_id` hay Restaurant detail bằng `restaurant_id`.
    **File liên quan:** planned `SearchResultAdapter.java`.

## Android Architecture

11. **Câu hỏi:** Vì sao tạo `SearchViewModel` thay vì dùng `MenuViewModel`?
    **Trả lời ngắn:** Search có state rộng hơn Menu.
    **Trả lời sâu:** Search cần mixed result types, filters, sort state, empty/error states và Restaurant navigation. `MenuViewModel` hiện chỉ tập trung list Món.
    **File liên quan:** `MenuViewModel.java`, `SearchFragment.java`.

12. **Câu hỏi:** `SearchFragment` nên own gì?
    **Trả lời ngắn:** Binding, input listeners, chip clicks, adapter callbacks và navigation.
    **Trả lời sâu:** Fragment không nên tự dựng network query hoặc rule filter; những phần đó thuộc ViewModel/Repository.
    **File liên quan:** `SearchFragment.java`, `search_fragment.xml`.

13. **Câu hỏi:** `SearchRepository` nên own gì?
    **Trả lời ngắn:** Chuyển `SearchFilters` thành Supabase REST/RPC calls.
    **Trả lời sâu:** UI không cần biết dữ liệu đến từ REST, RPC hay fallback demo. Repository cũng là seam tốt cho test.
    **File liên quan:** `FoodRepository.java`, `ApiService.java`, planned `SearchRepository.java`.

14. **Câu hỏi:** Vì sao dùng một adapter search result?
    **Trả lời ngắn:** Để hiển thị Món và Restaurant chung một list.
    **Trả lời sâu:** Adapter hai view type giữ ordering, empty state và pagination đơn giản hơn so với nhiều list rời.
    **File liên quan:** planned `SearchResultAdapter.java`.

15. **Câu hỏi:** Home search nên hoạt động thế nào?
    **Trả lời ngắn:** Tap field mở Search; IME search truyền `initial_query`.
    **Trả lời sâu:** Customer gõ ở Home thì Search screen nên nhận query ban đầu và chạy tìm kiếm ngay, thay vì bắt nhập lại.
    **File liên quan:** `HomeFragment.java`, `home_fragment.xml`, `nav_home.xml`.

## Backend, UI và Risks

16. **Câu hỏi:** Backend contract được khuyến nghị là gì?
    **Trả lời ngắn:** RPC `search_catalog`.
    **Trả lời sâu:** RPC nhận query, result type, category, open-only, sort, lat/lng tùy chọn và limit; trả typed search results để Android map dễ.
    **File liên quan:** `docs/prd/2026-06-28-search-filter.md`, `ApiService.java`.

17. **Câu hỏi:** RLS rule quan trọng nhất là gì?
    **Trả lời ngắn:** Chỉ trả public catalogue rows.
    **Trả lời sâu:** Search chỉ được expose active Món và non-deleted Restaurants; không trả Customer data, Cart, Order, address, seller private data hoặc auth fields.
    **File liên quan:** `SupabaseClient.java`, `docs/sql.sql`.

18. **Câu hỏi:** MVP filters gồm gì?
    **Trả lời ngắn:** Result type, `DishCategory`, open-only và sort.
    **Trả lời sâu:** Sort có thể gồm relevance, best selling, rating, price hoặc distance khi có location. Filters phải clear được.
    **File liên quan:** `search_fragment.xml`, `docs/prd/2026-06-28-search-filter.md`.

19. **Câu hỏi:** Lỗi response cũ ghi đè là gì?
    **Trả lời ngắn:** Response query cũ về sau query mới và ghi đè UI.
    **Trả lời sâu:** Khi Customer gõ nhanh, cần request sequence id hoặc cancellation để chỉ render response mới nhất.
    **File liên quan:** planned `SearchViewModel.java`.

20. **Câu hỏi:** Manual demo nên chứng minh gì?
    **Trả lời ngắn:** Search Món, filter, mở Food detail, mở Restaurant detail và retry/error.
    **Trả lời sâu:** Demo nên bắt đầu từ Home, tap search, tìm `pho`, đổi filter, mở đúng detail theo result type và xác nhận không làm thay đổi Cart/checkout behavior.
    **File liên quan:** `docs/prd/2026-06-28-search-filter.md`.
