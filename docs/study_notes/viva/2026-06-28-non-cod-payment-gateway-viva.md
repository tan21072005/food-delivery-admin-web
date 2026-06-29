# Viva: Payment gateway ngoài COD

> Phạm vi: ôn vấn đáp cho thanh toán không dùng COD, ưu tiên an toàn, backend verification và không đặt secret trong Android app.

## Domain

1. **Câu hỏi:** `PaymentMethod` là gì?
   **Trả lời ngắn:** Là cách Customer chọn thanh toán cho Order.
   **Trả lời sâu:** Domain có thể có `COD`, `MOMO`, `ZALOPAY`, `BANK_CARD`, nhưng phương thức online cần backend xác minh trước khi Order được xem là đã thanh toán.
   **File liên quan:** `CONTEXT.md`.

2. **Câu hỏi:** Vì sao COD vẫn là default cho MVP?
   **Trả lời ngắn:** COD ít rủi ro hơn và dễ demo.
   **Trả lời sâu:** Ordering MVP cần chứng minh đặt món thật trước. Thanh toán online kéo theo provider, webhook, secret và xử lý tiền thật nên nên tách khỏi luồng lõi.
   **File liên quan:** `docs/prd-ordering-mvp.md`.

3. **Câu hỏi:** Payment status khác Order status thế nào?
   **Trả lời ngắn:** Payment nói về tiền, Order nói về vòng đời giao món.
   **Trả lời sâu:** Order có thể là `pending`, `delivering`, `completed`; payment có thể là `unpaid`, `paid`, `failed`, `refunded`. Hai state machine liên quan nhưng không thay thế nhau.
   **File liên quan:** future `Order`.

4. **Câu hỏi:** Khi payment fail thì Cart ra sao?
   **Trả lời ngắn:** Cart phải được giữ để Customer retry.
   **Trả lời sâu:** Không nên mất Cart hoặc tạo Order paid giả. Customer có thể đổi provider, thử lại hoặc quay về COD.
   **File liên quan:** `CheckoutViewModel`.

5. **Câu hỏi:** Refund liên quan payment như thế nào?
   **Trả lời ngắn:** Refund là luồng sau thanh toán hoặc sau tranh chấp.
   **Trả lời sâu:** MVP nên xử lý manual hoặc ghi trạng thái cơ bản. Provider refund API là phạm vi tương lai vì cần audit, permission và đối soát.
   **File liên quan:** `docs/prd/2026-06-28-refund-dispute-complaint.md`.

## Android / MVVM

6. **Câu hỏi:** Fragment làm gì trong payment?
   **Trả lời ngắn:** Chỉ render UI và nhận provider result.
   **Trả lời sâu:** Fragment không tự quyết định paid/failed. Nó chuyển result cho ViewModel/Repository để backend verification quyết định trạng thái cuối.
   **File liên quan:** `ui/cart`.

7. **Câu hỏi:** `CheckoutViewModel` cần state nào?
   **Trả lời ngắn:** Method, loading, payment status, reference và error.
   **Trả lời sâu:** State rõ ràng giúp UI hiển thị đang tạo payment, đang chờ xác minh, thành công, thất bại hoặc retry mà không lẫn với state của Cart.
   **File liên quan:** `CheckoutViewModel`.

8. **Câu hỏi:** Repository nào nên gọi API payment?
   **Trả lời ngắn:** `PaymentRepository` hoặc `OrderRepository`.
   **Trả lời sâu:** Retrofit interface không nên được gọi trực tiếp từ Fragment. Repository che chi tiết API và giúp test bằng fake implementation.
   **File liên quan:** `data/repository`.

9. **Câu hỏi:** Test online payment thế nào?
   **Trả lời ngắn:** Dùng fake repository.
   **Trả lời sâu:** Test ViewModel cho các case tạo payment, nhận pending, verify success, verify failed và không gọi checkout hai lần.
   **File liên quan:** unit tests.

10. **Câu hỏi:** Vì sao không xử lý payment logic trong Activity?
    **Trả lời ngắn:** Để giữ MVVM và dễ test.
    **Trả lời sâu:** Activity dễ bị mất state khi rotate hoặc process death. ViewModel giữ state tốt hơn và tách khỏi Android framework.
    **File liên quan:** `Checkout.java`.

## Supabase / API / RLS

11. **Câu hỏi:** Ai được quyền xác minh `paid`?
    **Trả lời ngắn:** Backend, RPC, Edge Function hoặc webhook.
    **Trả lời sâu:** Android không được tự set `paid` vì client có thể bị sửa. Provider secret và logic verify phải nằm ở server.
    **File liên quan:** `ApiService`, payment RPC.

12. **Câu hỏi:** RLS cho payment attempt cần gì?
    **Trả lời ngắn:** Customer chỉ thấy attempt của chính mình.
    **Trả lời sâu:** Policy insert/select/update phải dựa trên `auth.uid()` hoặc mapping Customer, không tin `customer_id` client gửi.
    **File liên quan:** future SQL.

13. **Câu hỏi:** Amount nên tính ở đâu?
    **Trả lời ngắn:** Backend phải tính lại.
    **Trả lời sâu:** Backend đọc Cart, giá món, phí và giảm giá hiện tại để tránh client sửa tổng tiền trước khi tạo payment request.
    **File liên quan:** `checkout_cart`.

14. **Câu hỏi:** Provider secret đặt ở đâu?
    **Trả lời ngắn:** Không đặt trong Android app.
    **Trả lời sâu:** Secret chỉ nằm ở server, Edge Function hoặc backend riêng. Android app chỉ nhận redirect/token/reference an toàn.
    **File liên quan:** security notes.

15. **Câu hỏi:** Unknown provider result xử lý sao?
    **Trả lời ngắn:** Đưa vào `pending verification`.
    **Trả lời sâu:** App nên poll backend bằng payment reference hoặc chờ webhook. Không double checkout khi trạng thái chưa rõ.
    **File liên quan:** payment RPC.

## Edge Case

16. **Câu hỏi:** Mất mạng sau khi Customer đã trả tiền thì sao?
    **Trả lời ngắn:** Hiển thị trạng thái chờ xác minh.
    **Trả lời sâu:** App dùng payment reference để truy vấn lại backend khi có mạng. Không tự kết luận thất bại chỉ vì callback bị gián đoạn.
    **File liên quan:** payment state.

17. **Câu hỏi:** Customer bấm thanh toán hai lần thì sao?
    **Trả lời ngắn:** Disable CTA khi đang tạo payment.
    **Trả lời sâu:** Backend cũng cần idempotency theo Cart hoặc payment reference để tránh tạo nhiều charge cho cùng một checkout.
    **File liên quan:** `CheckoutViewModel`, payment RPC.

18. **Câu hỏi:** Giá thay đổi lúc thanh toán thì sao?
    **Trả lời ngắn:** Backend reject và yêu cầu refresh Cart.
    **Trả lời sâu:** Nếu tổng tiền không còn khớp, không nên tiếp tục provider flow. Customer phải thấy giá mới trước khi xác nhận.
    **File liên quan:** checkout RPC.

## Trade-off

19. **Câu hỏi:** Vì sao dùng sandbox thay vì provider thật?
    **Trả lời ngắn:** An toàn và phù hợp demo.
    **Trả lời sâu:** Provider thật cần hợp đồng, webhook, secret, đối soát và xử lý tiền thật. Sandbox chứng minh kiến trúc mà không tạo rủi ro vận hành.
    **File liên quan:** PRD payment.

20. **Câu hỏi:** Vì sao không lưu card trong app?
    **Trả lời ngắn:** Để tránh rủi ro bảo mật và PCI.
    **Trả lời sâu:** App nên redirect hoặc tokenize qua provider đạt chuẩn. Customer app không nên lưu số thẻ, CVV hay secret thanh toán.
    **File liên quan:** security notes.
