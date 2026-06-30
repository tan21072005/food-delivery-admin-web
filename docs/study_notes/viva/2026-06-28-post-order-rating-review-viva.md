# Viva: Rating/review sau Order completed

> Phạm vi: Customer chỉ đánh giá sau khi Order `completed`, dữ liệu được lưu bền vững và có kiểm tra ownership.

## Khái niệm và phạm vi

1. **Câu hỏi:** Tính năng này giải quyết vấn đề gì?
   **Trả lời ngắn:** Biến review từ mock/local thành dữ liệu thật.
   **Trả lời sâu:** App đã có màn hình review, nhưng state hiện chủ yếu nằm local. Tính năng này làm review bền vững, bảo mật và liên kết với Order thật.
   **File liên quan:** `OrderReviewFragment`.

2. **Câu hỏi:** Vì sao chỉ Order `completed` mới được review?
   **Trả lời ngắn:** Vì Customer đã nhận dịch vụ.
   **Trả lời sâu:** `pending`, `preparing`, `delivering` và `cancelled` không chứng minh Customer đã nhận món. Review trước thời điểm đó dễ tạo đánh giá giả hoặc không công bằng.
   **File liên quan:** `CONTEXT.md`.

3. **Câu hỏi:** Rating/review có thuộc Ordering MVP không?
   **Trả lời ngắn:** Không.
   **Trả lời sâu:** `docs/prd-ordering-mvp.md` liệt kê rating/review sau completed là ngoài phạm vi. Nó phụ thuộc vào Order history completed ổn định.
   **File liên quan:** `docs/prd-ordering-mvp.md`.

4. **Câu hỏi:** Demo tối thiểu nên là gì?
   **Trả lời ngắn:** Completed Order -> submit review -> Order thành reviewed.
   **Trả lời sâu:** Tạo Order, mark `completed`, mở lịch sử completed, submit Restaurant rating, quay lại history và thấy nút đổi từ `Đánh giá đơn hàng` sang `Xem đánh giá`.
   **File liên quan:** `OrderAdapter`.

5. **Câu hỏi:** Review nên gắn với entity nào?
   **Trả lời ngắn:** Gắn với Order và Restaurant.
   **Trả lời sâu:** Review phải chứng minh Customer đã đặt ở Restaurant đó qua một Order cụ thể. Không nên chỉ gửi `restaurant_id` tự do từ client.
   **File liên quan:** `orders`, `restaurants`.

## Hiện trạng

6. **Câu hỏi:** UI review hiện có gì?
   **Trả lời ngắn:** Có `OrderReviewFragment` và `order_fragment_review.xml`.
   **Trả lời sâu:** UI đã thu thập sao Restaurant, feedback món, text review, affordance ảnh và driver rating. Có thể tái dùng vỏ UI này.
   **File liên quan:** `OrderReviewFragment`, `order_fragment_review.xml`.

7. **Câu hỏi:** Order card hiện có state review nào?
   **Trả lời ngắn:** `OrderAdapter` đọc `Order.isReviewed()`.
   **Trả lời sâu:** Adapter toggle giữa `btnReview` và `btnViewReview` cho card completed, nhưng nguồn state hiện chưa được backend bảo vệ.
   **File liên quan:** `OrderAdapter`, `Order`.

8. **Câu hỏi:** Vì sao implementation hiện chưa production-ready?
   **Trả lời ngắn:** Nó chỉ ghi local/mock.
   **Trả lời sâu:** `LocalOrderStore.markAsReviewed(orderId)` không persistent, không RLS và không chống user giả mạo.
   **File liên quan:** `LocalOrderStore`.

9. **Câu hỏi:** Restaurant review list hiện ra sao?
   **Trả lời ngắn:** `ReviewsFragment` dùng mock data.
   **Trả lời sâu:** `getMockReviews()` và `ReviewAdapter` là vỏ UI tốt nhưng cần thay nguồn bằng Supabase-backed reviews.
   **File liên quan:** `ReviewsFragment`, `ReviewAdapter`.

10. **Câu hỏi:** Dependency lớn nhất là gì?
    **Trả lời ngắn:** Order history thật từ Supabase.
    **Trả lời sâu:** Nếu `OrderListFragment` còn đọc `LocalOrderStore`, không thể chứng minh review end-to-end với Order thật.
    **File liên quan:** `OrderListFragment`, `LocalOrderStore`.

## Backend và bảo mật

11. **Câu hỏi:** Bảng nào nên lưu review?
    **Trả lời ngắn:** `order_reviews`.
    **Trả lời sâu:** Bảng nên có một row cho mỗi Order được review, link tới `orders`, `users` và `restaurants`, kèm rating, text và timestamp.
    **File liên quan:** future SQL.

12. **Câu hỏi:** Chống duplicate review thế nào?
    **Trả lời ngắn:** Dùng `UNIQUE(order_id)`.
    **Trả lời sâu:** UI disable double submit, nhưng database constraint là lớp bảo vệ cuối để một Order không có nhiều review.
    **File liên quan:** database constraint.

13. **Câu hỏi:** Vì sao không tin `user_id` từ Android?
    **Trả lời ngắn:** Client có thể bị sửa.
    **Trả lời sâu:** Backend phải derive Customer từ `auth.uid()` và `users` table, không lấy owner từ request body.
    **File liên quan:** Supabase auth.

14. **Câu hỏi:** Submit RPC phải kiểm gì?
    **Trả lời ngắn:** Auth, ownership, status `completed`, rating 1..5 và chưa review.
    **Trả lời sâu:** RPC cũng nên lấy `restaurant_id` từ Order, không tin client truyền để tránh gắn review sai Restaurant.
    **File liên quan:** submit review RPC.

15. **Câu hỏi:** Rủi ro bảo mật chính là gì?
    **Trả lời ngắn:** Review giả hoặc duplicate.
    **Trả lời sâu:** Nếu thiếu check ownership/completed, user có token có thể review Order không thuộc mình hoặc review Restaurant chưa từng đặt.
    **File liên quan:** RLS policy.

## Android, Product và Test

16. **Câu hỏi:** Layer Android nào own review logic?
    **Trả lời ngắn:** `OrderReviewViewModel` và `ReviewRepository`.
    **Trả lời sâu:** ViewModel own state/validation; Repository own Supabase calls. Fragment chỉ bind, observe, collect input và navigate.
    **File liên quan:** `OrderReviewViewModel`, `ReviewRepository`.

17. **Câu hỏi:** Nếu mở review screen cho Order đã reviewed thì sao?
    **Trả lời ngắn:** Hiển thị read-only hoặc route sang detail.
    **Trả lời sâu:** Không cho submit lần hai. UI nên hiển thị review hiện có và trạng thái ổn định.
    **File liên quan:** `OrderReviewFragment`.

18. **Câu hỏi:** Driver rating có nên nằm trong MVP không?
    **Trả lời ngắn:** Chưa nên nếu chưa có driver-backed Order.
    **Trả lời sâu:** Bản đầu nên persist Restaurant review và optional food feedback. Driver rating cần domain shipper rõ hơn.
    **File liên quan:** product decision.

19. **Câu hỏi:** Photo upload có nên nằm trong MVP không?
    **Trả lời ngắn:** Không.
    **Trả lời sâu:** UI có affordance thêm ảnh, nhưng upload/storage/moderation tăng phạm vi và rủi ro bảo mật.
    **File liên quan:** storage future.

20. **Câu hỏi:** Test quan trọng nhất là gì?
    **Trả lời ngắn:** Completed-only, duplicate prevention, ownership rejection và state submit.
    **Trả lời sâu:** Dùng fake repository cho ViewModel và hai Customer trong môi trường Supabase disposable để chứng minh RLS/security.
    **File liên quan:** unit tests, QA checklist.
