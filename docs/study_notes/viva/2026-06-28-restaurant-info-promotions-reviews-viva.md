# Viva: Restaurant info / promotions / reviews data thật

> Phạm vi: đọc dữ liệu thật cho thông tin Restaurant, khuyến mãi và danh sách review; không thay đổi checkout hoặc tạo review mới.

## Kiến trúc

1. **Câu hỏi:** Vì sao tính năng này ưu tiên đọc dữ liệu trước?
   **Trả lời ngắn:** Vì Restaurant info và promotions cần trước checkout, còn review creation phụ thuộc Order completed.
   **Trả lời sâu:** Đọc dữ liệu thật giúp Customer tin tưởng Restaurant và offer trước khi đặt món. Việc submit review nên đợi luồng completed Order ổn định.
   **File liên quan:** `docs/prd/2026-06-28-restaurant-info-promotions-reviews.md`.

2. **Câu hỏi:** App nên theo pattern nào?
   **Trả lời ngắn:** Android Java MVVM hiện có.
   **Trả lời sâu:** Fragment xử lý UI/navigation, ViewModel own state, Repository gọi Supabase qua Retrofit. Cách này khớp với `HomeViewModel`, `FoodRepository` và `OrderRepository`.
   **File liên quan:** `HomeViewModel`, `FoodRepository`, `OrderRepository`.

3. **Câu hỏi:** Vì sao không gọi Supabase trực tiếp trong Fragment?
   **Trả lời ngắn:** Vì sẽ trộn UI với data access.
   **Trả lời sâu:** Gọi API trực tiếp trong Fragment làm khó test, khó retry/error handling và phá pattern MVVM của repo.
   **File liên quan:** Fragments, Repositories.

4. **Câu hỏi:** Cổng tính năng chuẩn là gì?
   **Trả lời ngắn:** `restaurant_real_data_v1`.
   **Trả lời sâu:** Các implementation docs nên link cùng một gate để tránh mỗi worker tạo tên gate khác nhau và làm cấu hình bị phân mảnh.
   **File liên quan:** PRD restaurant real data.

5. **Câu hỏi:** Tính năng này không được làm gì với Ordering MVP?
   **Trả lời ngắn:** Không đổi Cart, checkout hoặc Order tracking.
   **Trả lời sâu:** Restaurant info/promotions/reviews chỉ cải thiện dữ liệu đọc. Discount cuối cùng vẫn phải validate ở checkout.
   **File liên quan:** `docs/prd-ordering-mvp.md`.

## Hiện trạng

6. **Câu hỏi:** Navigation hiện đã có gì?
   **Trả lời ngắn:** `nav_home.xml` có destinations cho detail, info, promotions và reviews.
   **Trả lời sâu:** Các destination đều có thể nhận `restaurant_id`, nên wiring đúng argument là việc quan trọng nhất trước khi load dữ liệu thật.
   **File liên quan:** `nav_home.xml`.

7. **Câu hỏi:** Navigation bug lớn nhất là gì?
   **Trả lời ngắn:** Có chỗ hard-code `1L`.
   **Trả lời sâu:** `RestaurantDetailFragment` truyền `restaurant_id` chưa nhất quán và gọi `loadRestaurantFoods(1L)`, khiến Customer có thể thấy dữ liệu sai Restaurant.
   **File liên quan:** `RestaurantDetailFragment`.

8. **Câu hỏi:** Promotions hiện có thật chưa?
   **Trả lời ngắn:** Chưa.
   **Trả lời sâu:** `PromotionsFragment` dùng `getMockPromotions()` và hiển thị dữ liệu hard-coded giống package, chưa đọc Supabase.
   **File liên quan:** `PromotionsFragment`.

9. **Câu hỏi:** Reviews hiện có thật chưa?
   **Trả lời ngắn:** Chưa.
   **Trả lời sâu:** `ReviewsFragment` dùng `getMockReviews()` và filter local trên fake `ReviewItem` rows.
   **File liên quan:** `ReviewsFragment`, `ReviewItem`.

10. **Câu hỏi:** Restaurant info hiện có thật chưa?
    **Trả lời ngắn:** Chưa hoàn chỉnh.
    **Trả lời sâu:** `RestaurantInfoFragment` có ghi chú cần nhận `restaurant_id` và load Supabase data sau, tức hiện mới là vỏ UI/placeholder.
    **File liên quan:** `RestaurantInfoFragment`.

## Supabase Data

11. **Câu hỏi:** Table nào hỗ trợ Restaurant info?
    **Trả lời ngắn:** `restaurants`.
    **Trả lời sâu:** `docs/sql.sql` có name, description, phone, address, location, images, rating, review count, total orders và open status.
    **File liên quan:** `docs/sql.sql`.

12. **Câu hỏi:** Table nào hỗ trợ opening hours?
    **Trả lời ngắn:** `restaurant_timings`.
    **Trả lời sâu:** Table này keyed by `restaurant_id`, có weekday, open time và close time để hiển thị giờ mở cửa.
    **File liên quan:** `restaurant_timings`.

13. **Câu hỏi:** Table nào hỗ trợ promotions?
    **Trả lời ngắn:** `offers`.
    **Trả lời sâu:** `offers` có coupon code, offer type, discount type/value, min order amount, start/end dates, description và status.
    **File liên quan:** `offers`.

14. **Câu hỏi:** Schema đã hỗ trợ khuyến mãi riêng theo Restaurant chưa?
    **Trả lời ngắn:** Chưa rõ.
    **Trả lời sâu:** MVP có thể coi active offers là app-wide, hoặc thêm bridge Restaurant-offer sau nếu cần gắn offer với từng Restaurant.
    **File liên quan:** `docs/sql.sql`.

15. **Câu hỏi:** Schema đã có các dòng review thật chưa?
    **Trả lời ngắn:** Chưa đầy đủ.
    **Trả lời sâu:** `restaurants` có aggregate như `avg_rating` và `total_reviews`, nhưng review rows riêng cần bảng như `order_reviews`.
    **File liên quan:** `restaurants`, future `order_reviews`.

## UI / UX, Bảo mật và Test

16. **Câu hỏi:** `restaurant_id = -1L` nên xử lý thế nào?
    **Trả lời ngắn:** Hiển thị lỗi hoặc empty state.
    **Trả lời sâu:** Không bao giờ silently load Restaurant `1`, vì như vậy che lỗi navigation và hiển thị sai dữ liệu.
    **File liên quan:** `RestaurantDetailFragment`.

17. **Câu hỏi:** Có nên giữ mock data làm fallback không?
    **Trả lời ngắn:** Không khi đã nối dữ liệu thật.
    **Trả lời sâu:** Network failure nên show error/retry hoặc empty state. Mock fallback trong release làm mất niềm tin vào kiểm thử backend/RLS.
    **File liên quan:** `PromotionsFragment`, `ReviewsFragment`.

18. **Câu hỏi:** Review filters nào có thể giữ?
    **Trả lời ngắn:** Star filter, photo/content filter, reset và empty state.
    **Trả lời sâu:** UI filter hiện có vẫn hữu ích; chỉ cần đổi nguồn từ mock list sang dữ liệu thật hoặc repository result.
    **File liên quan:** `ReviewsFragment`.

19. **Câu hỏi:** Android app được dùng Supabase key nào?
    **Trả lời ngắn:** Chỉ anon/publishable key với JWT user nếu có.
    **Trả lời sâu:** Không bao giờ đưa `service_role` vào Android app. Production tables cần RLS và policy đúng.
    **File liên quan:** `SupabaseClient.java`, `docs/sql.sql`.

20. **Câu hỏi:** Test và manual verification cần gì?
    **Trả lời ngắn:** ViewModel tests và seed data thật.
    **Trả lời sâu:** Test invalid id, success, empty, network failure và promotion availability. Manual seed một Restaurant, timings, active offers, menu rows rồi navigate detail/info/promotions/reviews, xác nhận không còn mock.
    **File liên quan:** unit tests, QA checklist.
