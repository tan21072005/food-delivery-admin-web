# Viva: Favorites / Yêu thích

> Phạm vi: Customer lưu Restaurant yêu thích, mở lại từ tab Favorites và đi tiếp vào Restaurant detail/Menu.

## Product và Domain

1. **Câu hỏi:** Favorites trong app này là gì?
   **Trả lời ngắn:** Là tính năng Customer lưu Restaurant để quay lại đặt món nhanh.
   **Trả lời sâu:** Favorites không tạo Cart và không thay đổi Order. Nó là lớp discovery/navigation giúp Customer lưu Restaurant quan tâm.
   **File liên quan:** Favorites PRD.

2. **Câu hỏi:** Vì sao ưu tiên Restaurant favorites thay vì Món favorites?
   **Trả lời ngắn:** Cart của Ordering MVP đi theo Restaurant.
   **Trả lời sâu:** Tab hiện hướng tới "Quán yêu thích", và từ Restaurant detail Customer có thể xem Menu rồi thêm Món vào đúng per-Restaurant Cart.
   **File liên quan:** `docs/prd-ordering-mvp.md`.

3. **Câu hỏi:** Favorites có thuộc Seller app không?
   **Trả lời ngắn:** Không.
   **Trả lời sâu:** Repo này là Customer app. Seller analytics, favorite counts cho Seller hoặc dashboard không nằm trong phạm vi.
   **File liên quan:** `CONTEXT.md`.

4. **Câu hỏi:** Giá trị MVP của Favorites là gì?
   **Trả lời ngắn:** Lưu quán, mở lại quán, tiếp tục đặt món.
   **Trả lời sâu:** Customer có thể bấm tim ở Restaurant detail/card, mở tab Favorites, thấy Restaurant đã lưu và đi vào detail/Menu.
   **File liên quan:** `FavoritesFragment`.

5. **Câu hỏi:** Người dùng chưa đăng nhập nên thấy gì?
   **Trả lời ngắn:** Trạng thái yêu cầu đăng nhập.
   **Trả lời sâu:** MVP không nên lưu anonymous favorites bền vững. Nếu Customer chưa login, app nên route tới Login hoặc hiển thị login-required state.
   **File liên quan:** auth flow.

## Hiện trạng

6. **Câu hỏi:** Code hiện có gì?
   **Trả lời ngắn:** Có `FavoritesFragment`, layout favorites và navigation tab.
   **Trả lời sâu:** Các phần này chủ yếu là placeholder, chưa có persistence, ViewModel thật hoặc Supabase-backed list.
   **File liên quan:** `FavoritesFragment`, `favorites_fragment.xml`, `nav_favorites.xml`.

7. **Câu hỏi:** Heart UI hiện ở đâu?
   **Trả lời ngắn:** Trong Restaurant detail và một số flow cũ.
   **Trả lời sâu:** `fragment_restaurant_detail.xml` có icon tim nhưng chưa persistence. `MenuActivity` có local boolean toggle nhưng không phải luồng MVVM chính.
   **File liên quan:** `fragment_restaurant_detail.xml`, `MenuActivity`.

8. **Câu hỏi:** Vì sao không xây trên `MenuActivity.isFavorite`?
   **Trả lời ngắn:** Nó chỉ là state local trong Activity.
   **Trả lời sâu:** State này không MVVM, không persistent, không nối Supabase và dễ mất khi Activity recreate.
   **File liên quan:** `MenuActivity`.

9. **Câu hỏi:** Navigation mismatch hiện tại là gì?
   **Trả lời ngắn:** Favorites đang route tới `FoodDetailFragment`.
   **Trả lời sâu:** Nếu product quyết định là Restaurant favorites, click row nên mở Restaurant detail với `restaurant_id`, không mở Food detail.
   **File liên quan:** `nav_favorites.xml`.

10. **Câu hỏi:** Data model gap lớn nhất là gì?
    **Trả lời ngắn:** Chưa có bảng Customer favorite Restaurant.
    **Trả lời sâu:** Schema có `restaurants` nhưng cần bảng join theo Customer và Restaurant để lưu favorite bền vững.
    **File liên quan:** Supabase schema.

## Kiến trúc và Backend

11. **Câu hỏi:** Android architecture nên dùng gì?
    **Trả lời ngắn:** Java + MVVM + Retrofit.
    **Trả lời sâu:** Fragment bind UI, ViewModel own state/behavior, Repository own Supabase calls. Đây là pattern đang dùng trong repo.
    **File liên quan:** `FoodRepository`, `OrderRepository`.

12. **Câu hỏi:** Repository mới cần gì?
    **Trả lời ngắn:** `FavoriteRepository`.
    **Trả lời sâu:** Repository nên có list favorites, check favorite state, add favorite và remove favorite.
    **File liên quan:** `FavoriteRepository`.

13. **Câu hỏi:** ViewModel mới cần gì?
    **Trả lời ngắn:** `FavoritesViewModel` và state tim ở Restaurant detail.
    **Trả lời sâu:** Tab Favorites cần list state; Restaurant detail/card cần check/toggle state cho từng `restaurant_id`.
    **File liên quan:** `FavoritesViewModel`.

14. **Câu hỏi:** Table được khuyến nghị là gì?
    **Trả lời ngắn:** `customer_favorite_restaurants`.
    **Trả lời sâu:** Bảng nên có `id`, `user_id`, `restaurant_id`, `created_at` và unique `(user_id, restaurant_id)`.
    **File liên quan:** future SQL.

15. **Câu hỏi:** Vì sao cần unique `(user_id, restaurant_id)`?
    **Trả lời ngắn:** Để tránh duplicate favorites.
    **Trả lời sâu:** Double tap, retry hoặc request lặp không được tạo nhiều row cho cùng một Customer và Restaurant.
    **File liên quan:** database constraint.

## Bảo mật, UI và Test

16. **Câu hỏi:** RLS cho Favorites cần gì?
    **Trả lời ngắn:** Customer chỉ đọc/ghi favorite của chính mình.
    **Trả lời sâu:** Favorite tiết lộ sở thích cá nhân, nên policy phải dựa trên user hiện tại và không tin `user_id` client gửi.
    **File liên quan:** RLS policy.

17. **Câu hỏi:** Favorites screen cần các state nào?
    **Trả lời ngắn:** Loading, data, empty, login required và error.
    **Trả lời sâu:** Mỗi state cần UI rõ ràng để Customer biết đang tải, chưa có quán yêu thích, cần đăng nhập hoặc có lỗi có thể retry.
    **File liên quan:** `FavoritesFragment`.

18. **Câu hỏi:** Favorite card nên hiển thị gì?
    **Trả lời ngắn:** Ảnh/logo, tên, rating, địa chỉ, trạng thái mở cửa và tim đã fill.
    **Trả lời sâu:** Card phải đủ thông tin để Customer nhận ra Restaurant và quyết định mở detail hay remove favorite.
    **File liên quan:** `FavoriteRestaurant`.

19. **Câu hỏi:** Vì sao disable tim khi request đang chạy?
    **Trả lời ngắn:** Để tránh race condition.
    **Trả lời sâu:** Nếu Customer bấm liên tục add/remove, response có thể về lệch thứ tự. Disable hoặc sequence request giúp state cuối dễ hiểu.
    **File liên quan:** `FavoritesViewModel`.

20. **Câu hỏi:** Manual demo nên chứng minh gì?
    **Trả lời ngắn:** Favorite được lưu, reload vẫn còn và remove hoạt động.
    **Trả lời sâu:** Đăng nhập, mở Restaurant detail, bấm tim, mở tab Favorites, thấy Restaurant, mở lại detail, remove favorite và kiểm tra empty state.
    **File liên quan:** QA checklist.
