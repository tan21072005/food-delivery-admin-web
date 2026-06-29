# PRD: Push notification trạng thái Order

## Vấn đề
Hiện tại: Customer chỉ biết Order đổi trạng thái khi mở màn Order hoặc khi polling trong app. Mục tiêu: Customer nhận thông báo khi Order đổi trạng thái. Chuyển tiếp: demo có thể dùng polling và local notification trước khi làm FCM/backend trigger thật.

## Mục tiêu
Lập kế hoạch notification cho trạng thái Order mà không cần Seller/Shipper app trong repo này.

## Hiện trạng
- Vòng đời Order được định nghĩa trong `CONTEXT.md`.
- `docs/prd-ordering-mvp.md` đánh dấu push notification là ngoài phạm vi.
- Chưa có model FCM token, notification repository hoặc backend trigger.

## Câu chuyện người dùng
- Customer nhận notification khi Order được xác nhận, đang chuẩn bị, đang giao, hoàn tất hoặc bị hủy.
- Customer bấm notification và mở Order detail.
- Nếu quyền notification bị từ chối, Customer vẫn xem trạng thái trong app.

## Phạm vi
- Kế hoạch permission/channel notification trên Android.
- Kế hoạch model đăng ký FCM token.
- Fallback MVP: polling trong app phát hiện thay đổi trạng thái và hiển thị local notification trong demo.

## Ngoài phạm vi
Cập nhật trạng thái từ Seller/Shipper app, triển khai FCM server production, notification marketing, notification inbox.

## Thuật ngữ domain
Customer, Order, Order status, Restaurant, Shipper.

## Phụ thuộc
Ordering MVP, cơ chế cập nhật trạng thái, session/auth, tracking tùy chọn.

## Luồng người dùng
Sau khi login, app đăng ký notification channel/token nếu feature bật. Khi trạng thái Order thay đổi, backend gửi push hoặc app polling phát hiện thay đổi. Customer bấm notification để mở `OrderDetailFragment`.

## Mô hình dữ liệu
- `customer_notification_tokens(customer_id, token, platform, created_at, last_seen_at)`.
- Audit tùy chọn: `order_notifications(order_id, customer_id, status, title, body, sent_at, read_at)`.

## Thay đổi API/RPC/Supabase
- Đăng ký token.
- Hủy đăng ký token.
- Liệt kê notification nếu sau này có inbox.

FCM production cần Supabase trigger/edge function hoặc backend service gửi FCM sau khi `orders.status` đổi.

## Kiến trúc Android
`NotificationRepository` xử lý đăng ký token. `OrderViewModel` vẫn là nguồn state cho trạng thái trong app. Firebase messaging service nhận push và điều hướng qua MainActivity/deep link nếu làm FCM thật.

## Trạng thái UI
Chưa hỏi quyền, đã cấp quyền, bị từ chối, đồng bộ token thất bại, nhận notification, đã bấm, đã đọc.

## Xử lý lỗi
- Đăng ký token thất bại không làm hỏng luồng Order.
- Quyền bị từ chối thì chỉ hiển thị trạng thái trong tab Order.
- Tránh notification trùng bằng trạng thái đã thông báo gần nhất.

## Ghi chú bảo mật/RLS
Customer chỉ có thể đăng ký token cho chính mình. Server chọn nội dung notification từ row Order đáng tin cậy; Android không được yêu cầu gửi notification tùy ý cho Customer khác.

## Chiến lược test
Unit test trạng thái đăng ký token và mapper từ trạng thái Order sang title/body notification. Test thủ công local notification bằng polling; FCM thật test sau bằng sandbox/console khi có backend.

## Kịch bản demo thủ công
1. Mở app và cho phép notification.
2. Đặt Order.
3. Cập nhật thủ công status trong Supabase.
4. App polling phát hiện status mới và hiển thị local notification.
5. Bấm notification và mở Order detail.

## Rủi ro
Push thật cần backend key và hành vi nền phức tạp. MVP nên dùng local notification từ polling; FCM là Nhóm C/phạm vi tương lai.

## Câu hỏi mở
Xem `docs/planning/questions/2026-06-28-order-status-push-notifications-questions.md`.

## Nhật ký giả định
- **Giả định:** Demo có thể giữ app ở foreground hoặc background nhẹ.  
  **Vì sao hợp lý:** chưa có hạ tầng backend push.  
  **Rủi ro nếu sai:** demo kém thực tế hơn.  
  **Cách kiểm chứng:** hỏi instructor.
