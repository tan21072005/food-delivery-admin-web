# PRD: Theo dõi Order realtime / GPS shipper

## Vấn đề
Hiện tại: vòng đời Order có `delivering` và nhắc tới GPS, nhưng Customer app chưa có nguồn vị trí shipper thật. Mục tiêu: Customer xem được tiến trình giao Order. Chuyển tiếp: MVP dùng timeline trạng thái và điểm vị trí được poll/seed thủ công; GPS realtime thật thuộc phần tích hợp Shipper/backend.

## Mục tiêu
Lập kế hoạch cho màn hình theo dõi phía Customer, có thể demo mà không cần xây Seller/Shipper app trong repo này.

## Hiện trạng
- `CONTEXT.md` định nghĩa `delivering` và nói tới GPS tracking realtime.
- Ordering MVP loại realtime shipper GPS khỏi phạm vi.
- UI Order hiện có list/detail/status step, nhưng chưa có map/location repository.

## Câu chuyện người dùng
- Customer có thể mở Order đang hoạt động và xem trạng thái hiện tại.
- Khi Order ở `delivering`, Customer thấy vị trí shipper hoặc trạng thái rõ ràng rằng tracking chưa khả dụng.
- Customer refresh tracking mà không mất Order detail.

## Phạm vi
- Làm timeline trạng thái trước.
- Có thể thêm thẻ vị trí/polling từ `order_tracking_points`.
- Dữ liệu demo có thể được cập nhật thủ công trong Supabase.

## Ngoài phạm vi
Shipper app, gán driver thật, upload GPS nền, tối ưu tuyến đường, ETA engine.

## Thuật ngữ domain
Order, Customer, Restaurant, DeliveryAddress, Shipper, Order status.

## Phụ thuộc
Ordering MVP, DeliveryAddress, push notification, có thể cần phê duyệt Maps SDK.

## Luồng người dùng
Customer mở Order detail. Nếu Order chưa `delivering`, app hiển thị timeline. Nếu `delivering`, app fetch tracking point mới nhất mỗi 10-15 giây hoặc khi Customer refresh và cập nhật UI.

## Mô hình dữ liệu
- `order_tracking_points(order_id, latitude, longitude, recorded_at, source)`.
- Tùy chọn: `orders.shipper_name_snapshot`, `shipper_phone_snapshot`, `estimated_delivery_at`.

## Thay đổi API/RPC/Supabase
Endpoint/RPC lấy tracking point mới nhất cho Order thuộc về Customer hiện tại. RLS: Customer chỉ đọc tracking của Order mình sở hữu.

## Kiến trúc Android
`OrderDetailViewModel` giữ `TrackingUiState`. `TrackingRepository` fetch point mới nhất. Fragment render timeline, thẻ vị trí hoặc placeholder bản đồ.

## Trạng thái UI
Chưa bắt đầu, đang chuẩn bị, sẵn sàng, đang giao có vị trí, đang giao chưa có vị trí, hoàn tất, đã hủy, đang tải, offline. Tracking không cần quyền location của Customer nếu chỉ đọc điểm shipper.

## Xử lý lỗi
Nếu map lỗi hoặc chưa có GPS point, vẫn giữ timeline hiển thị. Nếu polling lỗi, hiển thị timestamp của điểm đã biết gần nhất.

## Ghi chú bảo mật/RLS
Customer chỉ được đọc tracking point của Order thuộc về mình. Không nên expose trail chi tiết sau khi Order completed. Customer app không được tự insert GPS của shipper.

## Chiến lược test
Unit test mapping từ status sang tracking state, vị trí cũ, không có point và lỗi polling. Test thủ công bằng tracking point đã seed trong Supabase.

## Kịch bản demo thủ công
1. Tạo Order.
2. Chuyển status sang `delivering`.
3. Insert tracking point trong Supabase.
4. Mở detail và refresh/poll.
5. Cập nhật point và hiển thị chuyển động hoặc timestamp.

## Rủi ro
Maps SDK/API key có thể làm chậm demo. Khuyến nghị: timeline + thẻ vị trí trước, map sau.

## Câu hỏi mở
Xem `docs/planning/questions/2026-06-28-realtime-order-tracking-shipper-gps-questions.md`.

## Nhật ký giả định
- **Giả định:** Chưa có Shipper app thật upload GPS.  
  **Vì sao hợp lý:** repo chỉ có Customer app.  
  **Rủi ro nếu sai:** tracking chỉ là mô phỏng.  
  **Cách kiểm chứng:** hỏi project owner.
