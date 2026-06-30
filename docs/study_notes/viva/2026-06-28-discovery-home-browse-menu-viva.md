# Viva: Discovery / Home / Browse Restaurant / Menu

> Phạm vi: Customer mở Home, browse Restaurant, xem Menu, chọn Món và handoff sang Cart.

## Domain

1. **Câu hỏi:** Cuisine khác `DishCategory` như thế nào?
   **Trả lời ngắn:** Cuisine phân loại Restaurant, `DishCategory` phân loại Món trong Menu.
   **Trả lời sâu:** Cuisine dùng ở Home/Search để tìm Restaurant theo loại ẩm thực như Pizza, Sushi, Trà sữa. `DishCategory` dùng trong Restaurant Menu để lọc Món như Cơm, Phở, Đồ uống.
   **File liên quan:** `CONTEXT.md`, `docs/prd/2026-06-28-discovery-home-browse-menu.md`.

2. **Câu hỏi:** Vì sao Restaurant là read-only trong Customer app?
   **Trả lời ngắn:** Customer app chỉ đọc Restaurant để đặt món.
   **Trả lời sâu:** Seller có app hoặc surface riêng để quản lý Restaurant/Menu. Customer không được sửa giá, trạng thái mở cửa hoặc Món.
   **File liên quan:** `CONTEXT.md`.

3. **Câu hỏi:** Mục tiêu chính của Discovery trước Ordering là gì?
   **Trả lời ngắn:** Tìm Restaurant/Món thật để đưa vào Cart đúng Restaurant.
   **Trả lời sâu:** Cart và checkout cần `restaurant_id`, `menu_id`, giá và trạng thái Món từ backend. Nếu Discovery còn mock, Ordering MVP khó chứng minh end-to-end.
   **File liên quan:** `docs/prd-ordering-mvp.md`.

4. **Câu hỏi:** Vì sao Cart theo từng Restaurant quan trọng?
   **Trả lời ngắn:** Một Cart chỉ thuộc một Restaurant.
   **Trả lời sâu:** Checkout tạo một Order cho một Restaurant. Trộn Món từ nhiều Restaurant sẽ làm sai phí giao, xác nhận của Restaurant và `OrderLine`.
   **File liên quan:** `CONTEXT.md`.

5. **Câu hỏi:** Home nên ưu tiên hiển thị Món hay Restaurant?
   **Trả lời ngắn:** Có thể hiển thị cả hai, nhưng Restaurant là ngữ cảnh chính.
   **Trả lời sâu:** Món luôn thuộc Restaurant. Khi Customer bấm Món, app vẫn phải giữ `restaurant_id` để add vào đúng per-Restaurant Cart.
   **File liên quan:** `HomeFragment`, `HomeViewModel`.

## Android / MVVM

6. **Câu hỏi:** Fragment nên làm gì trong MVVM?
   **Trả lời ngắn:** Render UI, observe state và điều hướng.
   **Trả lời sâu:** Fragment không nên chứa business logic như filter Supabase query, quyết định Cart merge hoặc validate backend.
   **File liên quan:** `app/src/main/java/com/example/fooddelivery/ui/home/HomeFragment.java`.

7. **Câu hỏi:** `HomeViewModel.loadHome()` hiện có vấn đề gì?
   **Trả lời ngắn:** Còn dùng dữ liệu mock hoặc hard-coded.
   **Trả lời sâu:** Repo đã có `FoodRepository.getHomeData()` và `ApiService.getHomeData()`, nhưng Home cần dựa vào backend thật để đồng bộ với Ordering.
   **File liên quan:** `HomeViewModel`, `FoodRepository`, `ApiService`.

8. **Câu hỏi:** Vì sao `RestaurantDetailFragment` hiện tại rủi ro?
   **Trả lời ngắn:** Có chỗ nhận `restaurant_id` nhưng load hard-code `1L`.
   **Trả lời sâu:** Nếu bỏ qua navigation argument, Customer bấm Restaurant nào cũng có thể thấy data sai. Đây là lỗi nghiêm trọng trong browse/detail.
   **File liên quan:** `RestaurantDetailFragment`, `RestaurantDetailViewModel`.

9. **Câu hỏi:** Vì sao không nên fallback mock âm thầm trong release?
   **Trả lời ngắn:** Mock che lỗi backend và RLS.
   **Trả lời sâu:** API fail mà UI vẫn hiển thị mock sẽ làm demo có vẻ chạy nhưng dữ liệu thật, permission hoặc schema có thể đang hỏng. Release nên hiện error/retry.
   **File liên quan:** `MenuViewModel`.

10. **Câu hỏi:** Supabase query string nên format ở đâu?
    **Trả lời ngắn:** Trong Repository.
    **Trả lời sâu:** Fragment không nên biết `eq.<id>` hay PostgREST syntax. Repository che chi tiết API để ViewModel/Fragment sạch hơn và dễ test hơn.
    **File liên quan:** `FoodRepository`.

## Supabase / API / RLS

11. **Câu hỏi:** Supabase hiện có gì hỗ trợ Home?
    **Trả lời ngắn:** Có endpoint `categories`, `menus` và RPC `get_home_data`.
    **Trả lời sâu:** `ApiService` đã khai báo REST/RPC cơ bản, nhưng cần mở rộng để có Restaurant list/detail/menu thật.
    **File liên quan:** `ApiService.java`, `docs/rpc_home_data.sql`.

12. **Câu hỏi:** Vì sao `categories` và `menu_categories` gây nhầm?
    **Trả lời ngắn:** Một bên giống discovery category, một bên giống `DishCategory`.
    **Trả lời sâu:** `CONTEXT.md` tách Cuisine và `DishCategory`. Dùng sai table để filter có thể làm Search/Menu trả kết quả sai hoặc rỗng.
    **File liên quan:** `docs/sql.sql`, `FoodCategory.java`.

13. **Câu hỏi:** RLS cho discovery nên cho phép gì?
    **Trả lời ngắn:** Customer được đọc Restaurant/Món active, không được sửa.
    **Trả lời sâu:** Catalogue có thể public read, nhưng draft/unpublished/deleted Restaurant/Menu phải bị ẩn. Cart write vẫn phải theo Customer session.
    **File liên quan:** Supabase policies.

14. **Câu hỏi:** Vì sao add-to-cart phải validate server-side?
    **Trả lời ngắn:** Android client không đáng tin tuyệt đối.
    **Trả lời sâu:** Backend/RPC phải kiểm tra Món active, Restaurant còn nhận đơn, Customer identity và giá hiện tại. Nếu chỉ tin client, Customer có thể thêm món hết hàng hoặc sửa giá.
    **File liên quan:** `docs/prd-ordering-mvp.md`, `OrderRepository`.

15. **Câu hỏi:** Dùng anon key trong Android có rủi ro gì?
    **Trả lời ngắn:** Anon key không phải secret, nên RLS phải đúng.
    **Trả lời sâu:** Android app có thể bị reverse-engineer. Không được đặt service-role key trong app; bảo vệ dữ liệu bằng RLS/RPC.
    **File liên quan:** `SupabaseClient.java`.

## Edge Case và Trade-off

16. **Câu hỏi:** Restaurant không có Món active thì UI nên làm gì?
    **Trả lời ngắn:** Hiển thị empty state rõ ràng.
    **Trả lời sâu:** Không crash và không show mock. Có thể cho Customer quay lại Home/Search.
    **File liên quan:** `RestaurantDetailFragment`, `MenuFragment`.

17. **Câu hỏi:** Customer mở link Món đã bị xóa thì sao?
    **Trả lời ngắn:** Show trạng thái không khả dụng và disable add-to-cart.
    **Trả lời sâu:** Nếu API trả 404 hoặc status inactive, app không được tạo `CartItem`.
    **File liên quan:** `FoodDetailViewModel`.

18. **Câu hỏi:** Mất mạng sau khi Home đã có dữ liệu cũ thì sao?
    **Trả lời ngắn:** Giữ dữ liệu cũ và show retry/error nhẹ.
    **Trả lời sâu:** UX tốt hơn màn trắng, nhưng phải cho biết refresh fail để Customer không hiểu nhầm dữ liệu đã mới.
    **File liên quan:** `HomeViewModel`.

19. **Câu hỏi:** Có nên rename `FoodItem` thành `Mon` ngay không?
    **Trả lời ngắn:** Chưa nên nếu rủi ro refactor cao.
    **Trả lời sâu:** Có thể giữ class `FoodItem` ban đầu, nhưng docs/comment/UI state phải hiểu nó là Món. Rename rộng nên làm sau khi flow ổn định.
    **File liên quan:** `FoodItem.java`.

20. **Câu hỏi:** Home nên dùng RPC aggregate hay nhiều REST call?
    **Trả lời ngắn:** RPC aggregate tốt cho Home MVP.
    **Trả lời sâu:** Home cần nhiều section cùng lúc; RPC giảm số call và gom logic ranking/filter. REST vẫn hữu ích cho detail/list riêng.
    **File liên quan:** `docs/rpc_home_data.sql`.
