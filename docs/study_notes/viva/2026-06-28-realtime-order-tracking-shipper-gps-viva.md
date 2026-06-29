# Viva: Realtime order tracking / shipper GPS

> Phạm vi: Customer xem tiến trình giao hàng và vị trí shipper theo hướng MVP polling, không yêu cầu Shipper app trong repo.

## Domain

1. **Câu hỏi:** Tracking bắt đầu khi nào?
   **Trả lời ngắn:** Khi Order vào trạng thái `delivering`.
   **Trả lời sâu:** Trước `delivering`, timeline trạng thái như `confirmed` và `preparing` thường đã đủ. GPS chỉ có ý nghĩa khi shipper đang di chuyển.
   **File liên quan:** `CONTEXT.md`.

2. **Câu hỏi:** Shipper app có trong repo không?
   **Trả lời ngắn:** Không.
   **Trả lời sâu:** Repo này là Customer app. MVP có thể đọc hoặc simulate tracking point, còn app shipper thật là phạm vi tương lai.
   **File liên quan:** `CONTEXT.md`.

3. **Câu hỏi:** Tracking khác push notification thế nào?
   **Trả lời ngắn:** Tracking là màn hình xem tiến trình; push là thông báo sự kiện.
   **Trả lời sâu:** Hai flow có thể dùng chung Order status, nhưng tracking cần state liên tục như vị trí, stale point và ETA.
   **File liên quan:** `docs/prd/2026-06-28-order-status-push-notifications.md`.

4. **Câu hỏi:** Vì sao cần `DeliveryAddress`?
   **Trả lời ngắn:** Nó là điểm giao hàng.
   **Trả lời sâu:** Map/ETA cần biết điểm xuất phát Restaurant và điểm đến Customer. Địa chỉ phải được snapshot hoặc xác minh từ Order.
   **File liên quan:** `docs/prd/2026-06-28-delivery-address-management.md`.

5. **Câu hỏi:** Order `completed` có nên tiếp tục hiện GPS không?
   **Trả lời ngắn:** Không nên.
   **Trả lời sâu:** Khi giao xong, tracking kết thúc. Tiếp tục hiện vị trí gây rủi ro privacy và không còn giá trị cho Customer.
   **File liên quan:** security notes.

## Android / MVVM

6. **Câu hỏi:** ViewModel nên expose gì?
   **Trả lời ngắn:** `TrackingUiState`.
   **Trả lời sâu:** State nên gồm Order status, latest point, stale flag, loading và error để Fragment render nhất quán.
   **File liên quan:** `OrderDetailViewModel`.

7. **Câu hỏi:** Polling nên theo vòng đời nào?
   **Trả lời ngắn:** Chỉ chạy khi screen visible.
   **Trả lời sâu:** Bắt đầu khi view active và dừng ở `onPause`/`onDestroyView` để tránh leak, hao pin và request nền không cần thiết.
   **File liên quan:** Fragment lifecycle.

8. **Câu hỏi:** Nếu không có map key thì sao?
   **Trả lời ngắn:** Hiển thị timeline hoặc tọa độ.
   **Trả lời sâu:** Demo không nên bị chặn chỉ vì thiếu Google Maps key. Timeline-first vẫn cho Customer biết trạng thái giao hàng.
   **File liên quan:** layout tracking.

9. **Câu hỏi:** `TrackingRepository` làm gì?
   **Trả lời ngắn:** Gọi API lấy tracking point mới nhất.
   **Trả lời sâu:** Repository cách ly Retrofit/Supabase khỏi UI và giúp ViewModel test được bằng fake repository.
   **File liên quan:** `TrackingRepository`.

10. **Câu hỏi:** Test tracking nên kiểm gì?
    **Trả lời ngắn:** Fresh point, stale point, no point và error.
    **Trả lời sâu:** Test ViewModel nên assert UI state tương ứng khi repository trả điểm mới, điểm quá cũ, không có điểm hoặc lỗi mạng.
    **File liên quan:** unit tests.

## Supabase / API / RLS

11. **Câu hỏi:** Bảng tracking point cần cột gì?
    **Trả lời ngắn:** `order_id`, `lat`, `lng`, `recorded_at`.
    **Trả lời sâu:** Có thể thêm `source` để phân biệt manual demo, shipper app hoặc backend simulation.
    **File liên quan:** future SQL.

12. **Câu hỏi:** RLS tracking cần gì?
    **Trả lời ngắn:** Customer chỉ đọc tracking của Order thuộc mình.
    **Trả lời sâu:** Policy nên join/kiểm tra `orders.customer_id` để tránh Customer đọc vị trí giao hàng của Order khác.
    **File liên quan:** RLS policy.

13. **Câu hỏi:** MVP nên dùng realtime hay REST polling?
    **Trả lời ngắn:** REST polling là lựa chọn MVP.
    **Trả lời sâu:** Polling dễ triển khai, dễ debug và ít phụ thuộc lifecycle phức tạp. Realtime có thể thêm sau khi backend ổn định.
    **File liên quan:** `ApiService`.

14. **Câu hỏi:** Stale point là gì?
    **Trả lời ngắn:** Là điểm GPS đã quá cũ.
    **Trả lời sâu:** Ví dụ point cũ hơn 2 phút thì UI nên hiện timestamp/cảnh báo để Customer không tưởng vị trí đó là live.
    **File liên quan:** `TrackingUiState`.

15. **Câu hỏi:** Ai được insert tracking point?
    **Trả lời ngắn:** Demo/manual hoặc Shipper backend tương lai.
    **Trả lời sâu:** Customer app không được tự insert GPS shipper vì có thể giả vị trí. Insert thật nên thuộc shipper/service role có kiểm soát.
    **File liên quan:** assumptions.

## Edge Case và Trade-off

16. **Câu hỏi:** Mất mạng khi tracking thì sao?
    **Trả lời ngắn:** Giữ last known point và hiển thị lỗi nhẹ.
    **Trả lời sâu:** Không xóa timeline hoặc làm màn hình trống. Customer vẫn cần biết trạng thái gần nhất.
    **File liên quan:** UI states.

17. **Câu hỏi:** Order bị `cancelled` khi đang poll thì sao?
    **Trả lời ngắn:** Dừng tracking.
    **Trả lời sâu:** ViewModel chuyển sang cancelled state, hủy timer/polling và không tiếp tục request GPS.
    **File liên quan:** `OrderDetailViewModel`.

18. **Câu hỏi:** API trả point của Order khác thì sao?
    **Trả lời ngắn:** RLS phải chặn, app cũng validate `orderId`.
    **Trả lời sâu:** Backend là lớp bảo vệ chính; Repository/ViewModel vẫn nên bỏ qua response có `order_id` không khớp để tránh render sai.
    **File liên quan:** `TrackingRepository`.

19. **Câu hỏi:** Vì sao timeline-first hợp lý?
    **Trả lời ngắn:** Timeline luôn hữu ích, map có thể fail.
    **Trả lời sâu:** Thiếu map key, quyền location hoặc point GPS không nên làm Customer mất thông tin Order status.
    **File liên quan:** PRD tracking.

20. **Câu hỏi:** Khi nào nên nâng lên realtime?
    **Trả lời ngắn:** Khi backend và Shipper app đã ổn định.
    **Trả lời sâu:** Realtime cần xử lý reconnect, lifecycle, battery và permission kỹ hơn; không nên làm trước khi luồng Order cơ bản chạy chắc.
    **File liên quan:** roadmap.
