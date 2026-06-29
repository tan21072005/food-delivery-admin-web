# PRD: Đặt lại nâng cao

## Vấn đề
Hiện tại: lịch sử Order đã có hoặc đang được lên kế hoạch, nhưng đặt lại Order cũ phải xử lý Mon không còn bán, giá thay đổi, trạng thái mở cửa của Restaurant và topping/options trong tương lai. Mục tiêu: Customer có thể đặt lại an toàn vào Cart với các thay đổi được thông báo rõ.

## Mục tiêu
Lập kế hoạch luồng đặt lại nâng cao: dựng lại Cart từ snapshot OrderLine bất biến, đồng thời kiểm tra menu hiện tại.

## Hiện trạng
- Tài liệu domain định nghĩa OrderLine là snapshot sau checkout.
- Ordering MVP xem đặt lại là phạm vi tương lai.
- Model `Order` hiện tại vẫn đơn giản hơn mục tiêu và còn `LocalOrderStore`.

## Câu chuyện người dùng
- Customer bấm Đặt lại trên Order đã hoàn tất.
- App kiểm tra từng OrderLine với Menu hiện tại.
- Mon còn bán được thêm vào Cart của Restaurant; Mon không còn bán hoặc đã đổi giá được thông báo rõ.

## Phạm vi
- Đặt lại từ một Order thuộc một Restaurant vào draft Cart của Restaurant đó.
- Xử lý Mon không còn bán, thay đổi giá, số lượng, ghi chú và nhãn option cơ bản.
- Xử lý gộp khi đã có draft Cart.

## Ngoài phạm vi
Đặt lại nhiều Restaurant cùng lúc, đặt lại theo lịch, subscription, chỉnh sửa menu phía seller.

## Thuật ngữ domain
Order, OrderLine, Cart, CartItem, Restaurant, Mon, PaymentMethod.

## Phụ thuộc
Ordering MVP, dữ liệu thật cho Discovery/Menu, Topping/options nếu muốn replay option chính xác.

## Luồng người dùng
Customer mở Order đã hoàn tất và bấm Đặt lại. App kiểm tra Restaurant và Mon hiện tại. Customer thấy tóm tắt: đã thêm, giá thay đổi, không còn bán. Customer xác nhận gộp vào draft Cart rồi mở Cart/Checkout.

## Mô hình dữ liệu
Dùng snapshot OrderLine hiện có hoặc tương lai và bảng `menus` hiện tại. DTO kết quả đặt lại gồm: `addedItems`, `changedItems`, `unavailableItems`, `cartId`.

## Thay đổi API/RPC/Supabase
Khuyến nghị RPC `reorder_order(order_id, merge_strategy)` để kiểm tra quyền sở hữu, Restaurant, trạng thái khả dụng của menu hiện tại và ghi Cart/CartItems trong một transaction.

## Kiến trúc Android
`OrderDetailViewModel` gọi `ReorderRepository`. Trạng thái kết quả render bottom sheet xác nhận. Màn hình Cart tải lại từ backend sau khi đặt lại thành công.

## Trạng thái UI
Đủ điều kiện, đang kiểm tra, cần xác nhận, thành công một phần, đã gộp, chỉ còn món không khả dụng, lỗi, offline.

## Xử lý lỗi
- Nếu tất cả Mon đều không còn bán, không tạo Cart.
- Nếu có giá thay đổi, bắt Customer xác nhận.
- Nếu Cart đã có cùng Mon/options, tăng số lượng.

## Ghi chú bảo mật/RLS
Customer chỉ được đặt lại Order của chính mình. Backend tính lại giá hiện tại; Android không được gửi unit price tùy ý.

## Chiến lược test
Unit test mapping kết quả đặt lại, chiến lược gộp, item không còn bán, giá thay đổi và lỗi repository. Test thủ công với Order completed đã seed.

## Kịch bản demo thủ công
1. Seed một Order completed.
2. Đổi giá một Mon và đánh dấu một Mon không còn bán.
3. Bấm Đặt lại.
4. Hiển thị tóm tắt.
5. Xác nhận và kiểm tra Cart.

## Rủi ro
Việc kiểm tra chính xác option/topping phụ thuộc kế hoạch topping/options. MVP có thể giữ `option_label` dạng text và cảnh báo khi option phức tạp cần xem lại.

## Câu hỏi mở
Xem `docs/planning/questions/2026-06-28-advanced-reorder-questions.md`.

## Nhật ký giả định
- **Giả định:** Đặt lại chỉ áp dụng cho Order completed.  
  **Vì sao hợp lý:** Đặt lại Order cancelled/pending dễ bị nhầm với retry.  
  **Rủi ro nếu sai:** Customer có thể muốn đặt lại Order đã bị hủy.  
  **Cách kiểm chứng:** hỏi project owner.
