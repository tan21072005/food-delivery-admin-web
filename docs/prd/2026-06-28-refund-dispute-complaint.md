# PRD: Refund / dispute / khiếu nại

## Vấn đề
Hiện tại: app đã có quy tắc hủy Order, nhưng sau `ready_for_pickup`, `delivering` hoặc `completed`, Customer chưa có luồng báo sự cố. Mục tiêu: Customer có thể gửi complaint/refund request gắn với một Order. Chuyển tiếp: MVP chỉ ghi nhận support case; xử lý bởi admin/human nằm ngoài Customer app.

## Mục tiêu
Lập kế hoạch luồng khiếu nại thực tế, có thể demo và không phá quy tắc vòng đời Order.

## Hiện trạng
- `CONTEXT.md` nói sau `ready_for_pickup` không còn hủy, chỉ còn complaint/refund.
- Ordering MVP loại refund/dispute khỏi phạm vi.
- App chưa có support repository/model/UI.

## Câu chuyện người dùng
- Customer có thể báo thiếu món, giao trễ, sai món, đồ ăn hỏng hoặc vấn đề thanh toán.
- Customer đính kèm mô tả và ảnh tùy chọn.
- Customer có thể xem trạng thái khiếu nại từ Order detail/history.

## Phạm vi
- Tạo complaint và hiển thị trạng thái ở phía Customer.
- Trạng thái refund/complaint: `submitted`, `reviewing`, `approved`, `rejected`, `resolved`.
- Review/xử lý cuối cùng là thủ công/admin ngoài repo này.

## Ngoài phạm vi
Admin dashboard, workflow dispute phía seller, refund tự động qua payment gateway, tự động hóa chính sách pháp lý.

## Thuật ngữ domain
Customer, Order, OrderLine, Restaurant, PaymentMethod, refund request, complaint.

## Phụ thuộc
Ordering MVP, Order history completed/cancelled, payment gateway nếu sau này cần refund tự động.

## Luồng người dùng
Customer mở Order đủ điều kiện, bấm "Báo cáo vấn đề", chọn reason, nhập note/ảnh tùy chọn và gửi. App hiển thị trạng thái complaint và chặn complaint active trùng cho cùng Order.

## Mô hình dữ liệu
- `complaints(id, customer_id, order_id, reason, description, status, created_at, resolved_at)`.
- `complaint_attachments(id, complaint_id, storage_path, created_at)` tùy chọn.
- `refund_amount_requested` và `refund_amount_approved` là các field tùy chọn trong tương lai.

## Thay đổi API/RPC/Supabase
REST/RPC tạo complaint phải kiểm tra quyền sở hữu Order và trạng thái đủ điều kiện. RLS: Customer chỉ insert/select complaint của mình; thay đổi status dùng service/admin role ngoài app.

## Kiến trúc Android
`ComplaintFragment` hoặc bottom sheet mở từ Order detail. `ComplaintViewModel` validate field và gọi `ComplaintRepository`. Order detail observe tóm tắt complaint.

## Trạng thái UI
Đủ điều kiện, không đủ điều kiện, đang tải, đang gửi, đã gửi, đang review, đã xử lý, complaint active bị trùng, offline, upload thất bại.

## Xử lý lỗi
- Nếu upload lỗi, cho phép gửi không ảnh hoặc thử upload lại.
- Nếu Order không đủ điều kiện, giải thích lý do.
- Nếu đã có complaint active, link tới trạng thái hiện tại.

## Ghi chú bảo mật/RLS
Customer không thể tạo complaint cho Order của Customer khác hoặc tự approve refund của mình. Attachment phải được lưu trong path scoped theo Customer/order.

## Chiến lược test
Unit test quy tắc đủ điều kiện, xử lý complaint trùng, validation và mapping lỗi repository. Test thủ công tạo complaint trên Order completed và từ chối trên Order pending.

## Kịch bản demo thủ công
1. Dùng Order completed.
2. Gửi complaint.
3. Kiểm tra row Supabase.
4. Hiển thị status trên Order detail.
5. Thử Order pending và hiển thị không đủ điều kiện.

## Rủi ro
Không có admin app nên việc xử lý phải thủ công qua DB/admin. Điều này chấp nhận được cho demo Customer nếu nói rõ.

## Câu hỏi mở
Xem `docs/planning/questions/2026-06-28-refund-dispute-complaint-questions.md`.

## Nhật ký giả định
- **Giả định:** Ghi nhận complaint là đủ cho demo dự án.  
  **Vì sao hợp lý:** admin/seller app ngoài phạm vi repo.  
  **Rủi ro nếu sai:** instructor kỳ vọng workflow đầy đủ.  
  **Cách kiểm chứng:** xác nhận sớm.
