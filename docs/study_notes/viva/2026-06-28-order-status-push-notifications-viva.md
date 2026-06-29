# Viva: Push notification trạng thái Order

> Phạm vi: thông báo cho Customer khi Order đổi trạng thái, không thay thế Order detail hoặc tracking.

## Domain

1. **Câu hỏi:** Push notification giải quyết vấn đề gì?
   **Trả lời ngắn:** Báo Customer khi Order đổi trạng thái.
   **Trả lời sâu:** Customer không cần mở app liên tục để biết Order đã được xác nhận, đang chuẩn bị, đang giao hay đã hoàn tất.
   **File liên quan:** Order docs.

2. **Câu hỏi:** Những status nào quan trọng để notify?
   **Trả lời ngắn:** `confirmed`, `preparing`, `delivering`, `completed`, `cancelled`.
   **Trả lời sâu:** `pending` là trạng thái ngay sau đặt hàng nên có thể không cần push riêng. Các mốc sau mới thay đổi kỳ vọng của Customer.
   **File liên quan:** `CONTEXT.md`.

3. **Câu hỏi:** Notification có thay Order tracking không?
   **Trả lời ngắn:** Không.
   **Trả lời sâu:** Notification chỉ là sự kiện ngắn. Chi tiết timeline, map hoặc Order item vẫn nằm trong Order screen.
   **File liên quan:** `ui/order`.

4. **Câu hỏi:** Seller/Shipper app có trong repo này không?
   **Trả lời ngắn:** Không.
   **Trả lời sâu:** Repo là Customer app. Status demo có thể cập nhật từ Supabase/manual hoặc backend tương lai.
   **File liên quan:** `CONTEXT.md`.

5. **Câu hỏi:** Nếu Customer deny notification permission thì sao?
   **Trả lời ngắn:** App vẫn phải xem được trạng thái trong app.
   **Trả lời sâu:** Notification là enhancement. Core order flow không được phụ thuộc vào permission.
   **File liên quan:** Android permission.

## Android / MVVM

6. **Câu hỏi:** Notification channel dùng để làm gì?
   **Trả lời ngắn:** Bắt buộc cho Android O+.
   **Trả lời sâu:** Channel gom các cảnh báo Order status vào một nhóm riêng để user có thể quản lý âm thanh, rung và visibility.
   **File liên quan:** `App.java`.

7. **Câu hỏi:** Mapper notification có tác dụng gì?
   **Trả lời ngắn:** Đổi status thành title/body.
   **Trả lời sâu:** `OrderNotificationMapper` tách copy/format khỏi Android framework, nhờ đó test được mà không cần tạo notification thật.
   **File liên quan:** `OrderNotificationMapper`.

8. **Câu hỏi:** ViewModel có nên tạo notification trực tiếp không?
   **Trả lời ngắn:** Không nên.
   **Trả lời sâu:** ViewModel nên phát event hoặc state; UI/service xử lý Android API để tránh phụ thuộc framework trong business logic.
   **File liên quan:** `OrderViewModel`.

9. **Câu hỏi:** Deep link notification nên mở đâu?
   **Trả lời ngắn:** Mở Order detail.
   **Trả lời sâu:** Intent/navigation cần mang `orderId` để Customer chạm notification là xem đúng Order.
   **File liên quan:** navigation graph.

10. **Câu hỏi:** Polling nên nằm ở đâu?
    **Trả lời ngắn:** Repository/ViewModel.
    **Trả lời sâu:** Fragment chỉ observe state. Repository lấy dữ liệu, ViewModel so sánh status và phát event notify nếu cần.
    **File liên quan:** `OrderRepository`.

## Supabase / API / RLS

11. **Câu hỏi:** FCM token nên lưu ở đâu?
    **Trả lời ngắn:** Bảng token theo Customer và thiết bị.
    **Trả lời sâu:** Một Customer có thể dùng nhiều thiết bị. Token table nên có `customer_id`, token, platform, `last_seen_at` và trạng thái active.
    **File liên quan:** future SQL.

12. **Câu hỏi:** RLS cho token cần gì?
    **Trả lời ngắn:** Customer chỉ insert/select token của chính mình.
    **Trả lời sâu:** Không user nào được đọc token thiết bị của user khác vì token có thể dùng để gửi thông báo ngoài ý muốn.
    **File liên quan:** RLS policy.

13. **Câu hỏi:** Ai gửi FCM thật?
    **Trả lời ngắn:** Backend hoặc Edge Function.
    **Trả lời sâu:** Android app không có server key. Gửi push thật phải chạy ở môi trường server có secret an toàn.
    **File liên quan:** backend future.

14. **Câu hỏi:** Trigger gửi notification dựa vào gì?
    **Trả lời ngắn:** Thay đổi `orders.status`.
    **Trả lời sâu:** Chỉ tạo event khi status mới khác status cũ và là status đáng thông báo, tránh spam Customer.
    **File liên quan:** `orders`.

15. **Câu hỏi:** Body notification có nên chứa dữ liệu nhạy cảm không?
    **Trả lời ngắn:** Không.
    **Trả lời sâu:** Không đưa địa chỉ, phone hoặc thông tin thanh toán vào notification. Lock screen có thể bị người khác nhìn thấy.
    **File liên quan:** notification mapper.

## Edge Case và Trade-off

16. **Câu hỏi:** Polling có thể lặp notification không?
    **Trả lời ngắn:** Có, nên lưu last notified status.
    **Trả lời sâu:** ViewModel/local prefs cần nhớ status đã notify theo `orderId` để không bắn lại cùng một thông báo.
    **File liên quan:** local prefs.

17. **Câu hỏi:** App bị kill thì local polling ra sao?
    **Trả lời ngắn:** Không đảm bảo.
    **Trả lời sâu:** Đây là trade-off MVP. Muốn chắc chắn khi app bị kill cần FCM server-side.
    **File liên quan:** PRD notification.

18. **Câu hỏi:** Token hết hạn thì sao?
    **Trả lời ngắn:** Đăng ký lại và cập nhật backend.
    **Trả lời sâu:** Khi login/resume hoặc FCM refresh token, app gửi token mới và update `last_seen_at`.
    **File liên quan:** `NotificationRepository`.

19. **Câu hỏi:** Vì sao local notification MVP hợp lý?
    **Trả lời ngắn:** Nhanh và demo được.
    **Trả lời sâu:** MVP có thể chứng minh mapping status, channel, deep link và UX mà chưa cần server key/webhook.
    **File liên quan:** questions.

20. **Câu hỏi:** Vì sao chưa làm notification inbox?
    **Trả lời ngắn:** Không cần cho demo chính.
    **Trả lời sâu:** Order tab đã giữ trạng thái mới nhất. Inbox là phạm vi rộng hơn gồm lưu lịch sử, đọc/chưa đọc và pagination.
    **File liên quan:** scope.
