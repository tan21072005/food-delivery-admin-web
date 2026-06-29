# PRD: Cổng thanh toán ngoài COD

## Vấn đề
Hiện tại: Ordering MVP đã có khái niệm `PaymentMethod`, nhưng luồng chạy ổn định nhất hiện tại vẫn nên là COD. Mục tiêu: Customer có thể chọn một phương thức ngoài COD để demo mà không giả vờ rằng Android app tự xử lý tiền an toàn. Chuyển tiếp: bắt đầu bằng sandbox/xác nhận thủ công, sau đó mới chuyển xác nhận thanh toán sang backend/webhook.

## Mục tiêu
Lập kế hoạch cho luồng thanh toán MoMo/ZaloPay/BANK_CARD rủi ro thấp, phù hợp Android Java, MVVM, Retrofit và Supabase, trong khi COD vẫn là fallback ổn định.

## Hiện trạng
- `CONTEXT.md` định nghĩa `PaymentMethod` gồm `COD`, `MOMO`, `ZALOPAY`, `BANK_CARD`.
- `docs/prd-ordering-mvp.md` đưa payment gateway thật ra ngoài MVP và chỉ hỗ trợ COD.
- `OrderRepository` gọi RPC `checkout_cart`; chưa có provider SDK, webhook hoặc service xác minh thanh toán.
- Checkout UI tồn tại dưới dạng `ui/cart/Checkout.java` và `CheckoutViewModel`, nhưng migration đầy đủ sang CheckoutFragment vẫn đang được lên kế hoạch.

## Câu chuyện người dùng
- Là Customer, tôi có thể chọn COD hoặc một phương thức online sandbox trước khi đặt Order.
- Là Customer, tôi thấy rõ trạng thái chờ thanh toán, đã thanh toán, thất bại và đã hủy.
- Là Customer, tôi có thể thử lại hoặc quay về COD khi thanh toán online thất bại trước khi Order được hoàn tất.

## Phạm vi
- Đề xuất các field mục tiêu: `payment_method`, `payment_status`, `payment_reference`, `paid_at`.
- Đề xuất Repository/API cho `create_payment_intent` và `confirm_payment`.
- Demo hỗ trợ sandbox/xác nhận thủ công, không xử lý tiền production.

## Ngoài phạm vi
Onboarding provider production, xử lý PCI, lưu dữ liệu thẻ, payout cho seller, tự động hóa refund.

## Thuật ngữ domain
Customer, Order, OrderLine, Cart, PaymentMethod, DeliveryAddress.

## Phụ thuộc
- Checkout/Ordering MVP.
- Quản lý DeliveryAddress.
- Hiển thị trạng thái Order.
- Refund/dispute cho hoàn tiền về sau.

## Luồng người dùng
Customer mở checkout, chọn PaymentMethod, xem lại tổng tiền và bấm đặt món. Với COD, luồng tạo Order `pending` như MVP. Với thanh toán online, app xin payment session, mở provider/sandbox, nhận kết quả, rồi backend xác nhận và tạo/confirm Order với `payment_status=paid` hoặc báo thất bại.

## Mô hình dữ liệu
- `orders.payment_method`: text dạng enum.
- `orders.payment_status`: `unpaid`, `pending`, `paid`, `failed`, `refunded`.
- `orders.payment_reference`: transaction id của provider hoặc sandbox id.
- `payment_attempts`: bảng audit tương lai gồm order/cart id, amount, provider, status và metadata an toàn.

## Thay đổi API/RPC/Supabase
RPC mục tiêu:
- `create_payment_intent(cart_id, payment_method)`
- `confirm_payment(payment_reference)`
- mở rộng `checkout_cart` để kiểm tra payment status khi cần.

RLS phải đảm bảo Customer chỉ tạo/đọc payment attempt của Cart/Order thuộc về mình.

## Kiến trúc Android
`CheckoutFragment` observe `CheckoutViewModel`. ViewModel expose `PaymentUiState`; Repository bọc Retrofit calls. Kết quả provider SDK/browser được chuyển thành confirmation call của repository; Fragment chỉ xử lý navigation UI.

## Trạng thái UI
Đang tải phương thức, đã chọn phương thức, đang tạo payment, đang chờ provider, thanh toán thành công, thanh toán thất bại, đang thử lại, quay về COD, offline.

## Xử lý lỗi
- Không tạo Order đã thanh toán khi timeout.
- Nếu kết quả provider không rõ, hiển thị "Đang xác minh thanh toán" và poll backend.
- Nếu thanh toán thất bại, giữ Cart không đổi để Customer thử lại hoặc đổi COD.

## Ghi chú bảo mật/RLS
- Không bao giờ tin kết quả thanh toán chỉ từ Android.
- Backend/RPC phải xác minh provider/webhook trước khi đánh dấu `paid`.
- Không bao giờ lưu số thẻ hoặc secret provider trong app.

## Chiến lược test
Unit test `CheckoutViewModel` cho COD, online thành công, online thất bại, thử lại, trạng thái không xác định và offline. Test thủ công sandbox thành công/thất bại và kiểm tra row Supabase.

## Kịch bản demo thủ công
1. Seed một Cart.
2. Checkout bằng COD.
3. Checkout bằng sandbox MoMo thành công.
4. Lặp lại với sandbox thất bại và chứng minh Cart vẫn còn.
5. Mở Supabase và xem `orders.payment_method/payment_status`.

## Rủi ro
Provider thật có thể vượt quá thời gian project. Khuyến nghị: giữ provider thật là phạm vi tương lai, demo bằng sandbox/xác nhận thủ công.

## Câu hỏi mở
Xem `docs/planning/questions/2026-06-28-non-cod-payment-gateway-questions.md`.

## Nhật ký giả định
- **Giả định:** COD vẫn là mặc định.  
  **Vì sao hợp lý:** Ordering MVP đã chọn COD.  
  **Rủi ro nếu sai:** thanh toán có thể chặn checkout.  
  **Cách kiểm chứng:** hỏi project owner.
- **Giả định:** sandbox/xác nhận thủ công được chấp nhận cho demo.  
  **Vì sao hợp lý:** repo Customer app chưa có backend webhook service.  
  **Rủi ro nếu sai:** cần thêm backend ngoài phạm vi.  
  **Cách kiểm chứng:** xác nhận với instructor/project owner.
