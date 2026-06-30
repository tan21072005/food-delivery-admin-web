# Câu hỏi khó: Payment gateway ngoài COD

> Luồng: PaymentMethod ngoài COD cho ứng dụng Customer.  
> Mục tiêu: chốt phạm vi demo trước khi code để tránh kéo provider, backend và webhook vào Android app quá sớm.

## 1. Demo sandbox/manual hay provider thật?
**Câu hỏi:** MVP có chấp nhận thanh toán sandbox/manual confirmation không, hay bắt buộc tích hợp provider thật?  
**Vì sao quan trọng:** Provider thật cần backend, webhook và secret; không thể làm an toàn chỉ trong Customer app.  
**Phương án:** Sandbox/manual trước; tích hợp MoMo/ZaloPay thật ngay; chỉ giữ COD.  
**Khuyến nghị:** Sandbox/manual trước, COD vẫn là default.  
**Rủi ro nếu sai:** Scope phình lớn và checkout chính bị chậm.  
**Cần user quyết định:** Có.

## 2. Chọn provider nào trước?
**Câu hỏi:** Nếu demo online payment, nên ưu tiên MoMo, ZaloPay hay BANK_CARD?  
**Vì sao quan trọng:** UI, SDK, redirect flow và backend contract khác nhau theo provider.  
**Phương án:** MoMo sandbox; ZaloPay sandbox; BANK_CARD sandbox; fake provider nội bộ.  
**Khuyến nghị:** MoMo sandbox hoặc fake provider nội bộ nếu chưa có account/key.  
**Rủi ro nếu sai:** Worker mất thời gian vào provider không kịp demo.  
**Cần user quyết định:** Có.

## 3. Tạo Order trước hay sau khi thanh toán?
**Câu hỏi:** App nên tạo Order rồi thanh toán, hay thanh toán Cart trước rồi mới tạo Order?  
**Vì sao quan trọng:** Quyết định này ảnh hưởng orphan Order, duplicate payment và rollback.  
**Phương án:** Tạo unpaid Order trước; tạo payment intent từ Cart rồi confirm mới tạo Order; COD đi path riêng.  
**Khuyến nghị:** MVP dùng Cart payment intent trước, COD đi path checkout hiện có; nếu tạo unpaid Order thì phải có timeout/expire.  
**Rủi ro nếu sai:** Có Order đã tạo nhưng không thanh toán, hoặc thanh toán xong không có Order.  
**Cần user quyết định:** Có.

## 4. Ai xác minh payment đã paid?
**Câu hỏi:** Android có được tự set `payment_status=paid` không?  
**Vì sao quan trọng:** Android client có thể bị sửa request.  
**Phương án:** Tin redirect từ Android; backend/RPC/webhook xác minh; admin manual xác minh.  
**Khuyến nghị:** Backend/RPC/webhook hoặc manual admin xác minh; Android chỉ gửi reference.  
**Rủi ro nếu sai:** Customer giả mạo paid Order.  
**Cần user quyết định:** Không.

## 5. Timeout hoặc kết quả unknown xử lý thế nào?
**Câu hỏi:** Nếu app mất mạng sau khi quay về từ provider thì trạng thái hiển thị ra sao?  
**Vì sao quan trọng:** Payment có thể đã thành công nhưng app chưa nhận response.  
**Phương án:** Fail ngay; `pending verification`; retry confirm bằng reference.  
**Khuyến nghị:** Dùng `pending verification`, cho retry/poll backend bằng payment reference.  
**Rủi ro nếu sai:** Double charge hoặc mất Order.  
**Cần user quyết định:** Không.

## 6. Có fallback về COD không?
**Câu hỏi:** Khi online payment fail, Customer có được đổi sang COD không?  
**Vì sao quan trọng:** Đây là recovery path quan trọng cho demo.  
**Phương án:** Cho đổi COD trước khi Order finalized; bắt retry online; hủy Cart.  
**Khuyến nghị:** Cho đổi sang COD nếu chưa tạo paid/final Order.  
**Rủi ro nếu sai:** Customer bị kẹt ở checkout.  
**Cần user quyết định:** Không.

## 7. Refund có tự động không?
**Câu hỏi:** Payment gateway có cần hỗ trợ hoàn tiền tự động trong MVP không?  
**Vì sao quan trọng:** Refund tự động cần provider API và policy riêng.  
**Phương án:** Manual complaint; provider refund API; không hỗ trợ refund.  
**Khuyến nghị:** Manual complaint trong repo này, refund API là future scope.  
**Rủi ro nếu sai:** Hứa một luồng mà Customer app không đủ quyền xử lý.  
**Cần user quyết định:** Có.

## 8. Có lưu raw payload provider không?
**Câu hỏi:** App/backend có nên lưu toàn bộ JSON trả về từ provider không?  
**Vì sao quan trọng:** Payload có thể chứa dữ liệu nhạy cảm.  
**Phương án:** Lưu full raw JSON; chỉ lưu safe metadata; không lưu gì.  
**Khuyến nghị:** Chỉ lưu safe metadata: provider, reference, amount, status, timestamps.  
**Rủi ro nếu sai:** Lộ dữ liệu nhạy cảm hoặc khó audit.  
**Cần user quyết định:** Không.

## 9. Payment ngoài COD có chặn MVP chính không?
**Câu hỏi:** Có coi non-COD payment là bắt buộc để demo app không?  
**Vì sao quan trọng:** Ordering MVP hiện đã chọn COD để demo được nhanh.  
**Phương án:** Bắt buộc; optional Group C; bỏ hẳn.  
**Khuyến nghị:** Optional Group C; demo chính vẫn là COD.  
**Rủi ro nếu sai:** Chậm hoàn thiện browse-cart-checkout-order.  
**Cần user quyết định:** Có.

## 10. Amount được validate ở đâu?
**Câu hỏi:** Tổng tiền thanh toán lấy từ Android hay backend tính lại?  
**Vì sao quan trọng:** Client có thể sửa subtotal, discount hoặc fee.  
**Phương án:** Tin Android; backend tính lại; provider tự tính.  
**Khuyến nghị:** Backend tính lại từ Cart, OrderLine, DeliveryFee và Discount.  
**Rủi ro nếu sai:** Underpayment hoặc sai reconciliation.  
**Cần user quyết định:** Không.
