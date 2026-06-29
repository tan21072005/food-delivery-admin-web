# Viva: Reorder nâng cao

> Phạm vi: ôn vấn đáp cho luồng đặt lại món từ Order cũ, tạo hoặc gộp vào Cart hiện tại, không tự động checkout.

## Domain

1. **Câu hỏi:** Reorder dựa vào entity nào?
   **Trả lời ngắn:** Dựa vào snapshot trong `OrderLine`.
   **Trả lời sâu:** `OrderLine` cho biết món, số lượng, option và giá tại thời điểm Order cũ. Tuy nhiên reorder chỉ dùng snapshot để gợi ý lại món; trước khi đưa vào Cart phải kiểm tra menu hiện tại, trạng thái bán và giá mới.
   **File liên quan:** `CONTEXT.md`, `OrderLine`.

2. **Câu hỏi:** Vì sao không dùng lại giá cũ khi reorder?
   **Trả lời ngắn:** Checkout phải dùng giá hiện tại.
   **Trả lời sâu:** Giá trong Order cũ là dữ liệu lịch sử để đối soát. Nếu dùng lại giá đó cho Order mới, Customer có thể mua với giá đã hết hiệu lực và hệ thống sai lệch doanh thu.
   **File liên quan:** `OrderLine`, `docs/prd-ordering-mvp.md`.

3. **Câu hỏi:** Reorder có tạo Order mới ngay không?
   **Trả lời ngắn:** Không, reorder tạo hoặc gộp vào Cart.
   **Trả lời sâu:** Customer vẫn phải xem lại Cart, giá, phí, địa chỉ và phương thức thanh toán. Tự tạo Order sẽ bỏ qua bước xác nhận quan trọng.
   **File liên quan:** `Cart`, `CheckoutViewModel`.

4. **Câu hỏi:** Món đã hết hàng thì xử lý thế nào?
   **Trả lời ngắn:** Bỏ qua món đó và thông báo rõ.
   **Trả lời sâu:** Không nên fail toàn bộ reorder nếu vẫn còn món hợp lệ. Kết quả nên trả về danh sách món đã thêm, món bị bỏ qua và lý do để UI hiển thị summary.
   **File liên quan:** `ReorderResult`.

5. **Câu hỏi:** Reorder có tự dùng lại `DeliveryAddress` cũ không?
   **Trả lời ngắn:** Không nên mặc định dùng lại.
   **Trả lời sâu:** Địa chỉ giao hàng có thể đã đổi, bị xóa hoặc không còn phù hợp. Checkout phải yêu cầu Customer xác nhận lại địa chỉ.
   **File liên quan:** `docs/prd/2026-06-28-delivery-address-management.md`.

## Android / MVVM

6. **Câu hỏi:** Nút Reorder nên nằm ở đâu?
   **Trả lời ngắn:** Trong Order detail hoặc Order history của Order đã hoàn tất.
   **Trả lời sâu:** Reorder gắn với một Order cụ thể, nên UI phải truyền đúng `orderId` và chỉ bật hành động cho trạng thái phù hợp như `completed`.
   **File liên quan:** `OrderDetailFragment`, `OrderAdapter`.

7. **Câu hỏi:** `OrderDetailViewModel` nên expose state gì?
   **Trả lời ngắn:** Loading, success summary và error.
   **Trả lời sâu:** ViewModel cần biểu diễn trạng thái đang xử lý, kết quả món đã thêm, món không thể thêm và lỗi mạng/backend. Fragment chỉ render state đó.
   **File liên quan:** `OrderDetailViewModel`.

8. **Câu hỏi:** Repository nên gọi gì cho reorder?
   **Trả lời ngắn:** Nên gọi RPC như `reorder_order`.
   **Trả lời sâu:** RPC giúp validate quyền sở hữu Order, đọc menu hiện tại và ghi Cart trong một transaction. Client loop dễ tạo partial write và khó rollback.
   **File liên quan:** `ReorderRepository`, Supabase RPC.

9. **Câu hỏi:** Sau reorder thành công Cart cần làm gì?
   **Trả lời ngắn:** Reload Cart từ server.
   **Trả lời sâu:** Không nên tự đoán Cart cuối cùng ở client vì backend có thể merge quantity, đổi giá hoặc bỏ món unavailable. Reload giúp UI không stale.
   **File liên quan:** `CartViewModel`.

10. **Câu hỏi:** Test ViewModel cho reorder nên kiểm gì?
    **Trả lời ngắn:** Kiểm loading, success, partial success và error.
    **Trả lời sâu:** Dùng fake repository để assert ViewModel phát đúng summary, không navigate khi lỗi và yêu cầu refresh Cart khi thành công.
    **File liên quan:** unit tests.

## Supabase / API / RLS

11. **Câu hỏi:** RLS quan trọng nhất của reorder là gì?
    **Trả lời ngắn:** Customer chỉ được reorder Order của chính mình.
    **Trả lời sâu:** RPC hoặc policy phải kiểm tra `customer_id` khớp với user hiện tại. Nếu không, người dùng có thể đoán `orderId` và sao chép đơn của người khác.
    **File liên quan:** future RPC, RLS policy.

12. **Câu hỏi:** Vì sao reorder nên chạy trong transaction?
    **Trả lời ngắn:** Để tránh ghi Cart dở dang.
    **Trả lời sâu:** Reorder gồm nhiều bước: đọc OrderLine, validate menu, tìm Cart draft, upsert CartItem. Transaction giúp toàn bộ thay đổi nhất quán nếu có lỗi.
    **File liên quan:** Supabase RPC.

13. **Câu hỏi:** Giá hiện tại lấy ở đâu?
    **Trả lời ngắn:** Lấy từ bảng menu/món hiện tại ở backend.
    **Trả lời sâu:** Android không được gửi giá quyết định. Backend phải tự đọc giá hiện hành để tránh client sửa tổng tiền.
    **File liên quan:** `menus`, `checkout_cart`.

14. **Câu hỏi:** Cart draft hiện có được tìm thế nào?
    **Trả lời ngắn:** Theo Customer và Restaurant.
    **Trả lời sâu:** Domain Ordering MVP giả định một Cart draft cho một Restaurant. Nếu Cart đang thuộc Restaurant khác, UI phải yêu cầu Customer xác nhận thay thế hoặc tạo Cart phù hợp.
    **File liên quan:** `docs/prd-ordering-mvp.md`.

15. **Câu hỏi:** Option cũ như topping/size nên validate ra sao?
    **Trả lời ngắn:** MVP có thể preserve label, bản đầy đủ phải validate option hiện tại.
    **Trả lời sâu:** Nếu topping/size đã đổi, backend cần bỏ option invalid hoặc báo Customer chọn lại. Không nên âm thầm tính tiền option không còn tồn tại.
    **File liên quan:** `docs/prd/2026-06-28-topping-size-options.md`.

## Edge Case

16. **Câu hỏi:** Nếu tất cả món đều unavailable thì sao?
    **Trả lời ngắn:** Không tạo Cart mới và hiển thị empty result.
    **Trả lời sâu:** UI nên báo không có món nào còn khả dụng, gợi ý Customer xem lại menu Restaurant hoặc quay về Home/Search.
    **File liên quan:** UI state.

17. **Câu hỏi:** Nếu mạng lỗi giữa chừng thì sao?
    **Trả lời ngắn:** Hiển thị retry và không giả định thành công.
    **Trả lời sâu:** Nếu dùng RPC transaction, Cart không bị thay đổi khi RPC fail. Nếu không chắc trạng thái, app nên reload Cart trước khi cho retry.
    **File liên quan:** `ReorderRepository`.

18. **Câu hỏi:** Customer bấm Reorder hai lần liên tiếp thì sao?
    **Trả lời ngắn:** Disable nút khi đang loading.
    **Trả lời sâu:** UI tránh double tap, còn backend nên merge theo CartItem hoặc idempotent theo request để không nhân đôi ngoài ý muốn.
    **File liên quan:** `OrderDetailViewModel`, Supabase RPC.

## Trade-off

19. **Câu hỏi:** Vì sao reorder không thuộc luồng bắt buộc đầu tiên?
    **Trả lời ngắn:** Nó tăng tiện ích nhưng không cần cho checkout đầu tiên.
    **Trả lời sâu:** Demo cốt lõi là browse, Cart, checkout và Order. Reorder cần Order history ổn định nên hợp lý hơn ở nhóm tính năng sau.
    **File liên quan:** roadmap, PRD.

20. **Câu hỏi:** Vì sao không auto checkout sau reorder?
    **Trả lời ngắn:** Customer phải xác nhận lại giá, địa chỉ và thanh toán.
    **Trả lời sâu:** Auto checkout dễ gây đặt nhầm, dùng địa chỉ cũ sai hoặc chấp nhận giá mới mà Customer chưa biết. Reorder chỉ nên đưa Customer tới Cart.
    **File liên quan:** `docs/prd-ordering-mvp.md`.
