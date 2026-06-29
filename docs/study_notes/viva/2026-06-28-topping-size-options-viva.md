# Viva: Topping / size / options

> Phạm vi: lựa chọn size, topping và option cho Món; preview ở client nhưng validate cuối ở backend.

## Domain

1. **Câu hỏi:** Option group là gì?
   **Trả lời ngắn:** Là nhóm lựa chọn cho một Món.
   **Trả lời sâu:** Ví dụ size, topping, mức đá, mức đường. Mỗi group có rule như required, min, max và danh sách choice.
   **File liên quan:** PRD topping.

2. **Câu hỏi:** Size nên là field riêng hay option?
   **Trả lời ngắn:** Nên là option group.
   **Trả lời sâu:** Size có rule chọn một, có thể cộng giá và cần validate giống các lựa chọn khác. Dùng option group giúp model nhất quán.
   **File liên quan:** data model.

3. **Câu hỏi:** Vì sao `CartItem` cần option snapshot?
   **Trả lời ngắn:** Để hiển thị đúng lúc checkout.
   **Trả lời sâu:** Tên hoặc giá option có thể đổi sau khi Customer thêm vào Cart. Snapshot giúp Cart hiển thị lựa chọn Customer đã chọn.
   **File liên quan:** `CartItem`.

4. **Câu hỏi:** `OrderLine` option snapshot để làm gì?
   **Trả lời ngắn:** Giữ lịch sử bất biến.
   **Trả lời sâu:** Order phải giữ tên, giá và option tại thời điểm đặt để đối soát, reorder và hỗ trợ khiếu nại.
   **File liên quan:** `CONTEXT.md`, `OrderLine`.

5. **Câu hỏi:** Món không có option thì sao?
   **Trả lời ngắn:** Add to Cart như bình thường.
   **Trả lời sâu:** Tính năng option không được làm hỏng flow đơn giản. Nếu group rỗng hoặc không required, Customer vẫn thêm món được.
   **File liên quan:** `OrderRepository`.

## Android / MVVM

6. **Câu hỏi:** Bottom sheet option làm gì?
   **Trả lời ngắn:** Render lựa chọn cho Customer.
   **Trả lời sâu:** Bottom sheet hiển thị group, choice, giá cộng thêm và lỗi validation. Logic chọn/validate nên nằm ở ViewModel.
   **File liên quan:** `ToppingBottomSheet.java`.

7. **Câu hỏi:** ViewModel cần validate gì?
   **Trả lời ngắn:** Required, min, max và availability.
   **Trả lời sâu:** ViewModel cập nhật Add button, lỗi từng group và total preview khi Customer chọn/bỏ chọn option.
   **File liên quan:** future ViewModel.

8. **Câu hỏi:** Giá hiển thị tính ở đâu?
   **Trả lời ngắn:** Android preview, backend final.
   **Trả lời sâu:** Client tính preview để UX nhanh, nhưng backend phải tính lại khi add-to-Cart hoặc checkout để chống sửa giá.
   **File liên quan:** model.

9. **Câu hỏi:** Cart merge với options thế nào?
   **Trả lời ngắn:** Cùng Món và cùng option set thì tăng quantity.
   **Trả lời sâu:** Khác size hoặc topping phải là dòng Cart riêng, vì đó là cấu hình sản phẩm khác nhau.
   **File liên quan:** `CartRepository`.

10. **Câu hỏi:** Test UI state nên kiểm gì?
    **Trả lời ngắn:** Required missing, chọn hợp lệ và vượt max.
    **Trả lời sâu:** Dùng fake option groups để assert Add button disabled/enabled, lỗi group và total preview.
    **File liên quan:** unit tests.

## Supabase / API / RLS

11. **Câu hỏi:** Bảng option cần gì?
    **Trả lời ngắn:** Group và choice.
    **Trả lời sâu:** Group có `min_select`, `max_select`, required; choice có label, `price_delta`, availability và sort order.
    **File liên quan:** future SQL.

12. **Câu hỏi:** Backend phải validate gì?
    **Trả lời ngắn:** IDs, min/max, availability và price.
    **Trả lời sâu:** Backend không tin client. Nó phải kiểm tra choice thuộc đúng Món, còn active và tính lại tổng tiền.
    **File liên quan:** add-to-cart RPC.

13. **Câu hỏi:** RLS option data nên thế nào?
    **Trả lời ngắn:** Public read active menu options, Customer không được sửa.
    **Trả lời sâu:** Catalogue option là dữ liệu đọc cho Customer, nhưng write/update thuộc Seller/admin/backend.
    **File liên quan:** policies.

14. **Câu hỏi:** Snapshot option lưu ở đâu?
    **Trả lời ngắn:** `cart_item_options` và `order_line_options`.
    **Trả lời sâu:** Snapshot nên tách khỏi menu option sống để Cart/Order không đổi khi menu được chỉnh sau này.
    **File liên quan:** data model.

15. **Câu hỏi:** Option unavailable xử lý sao?
    **Trả lời ngắn:** Backend reject và app reload.
    **Trả lời sâu:** Nếu choice vừa bị tắt, add-to-Cart phải fail có lý do rõ; UI reload option để Customer chọn lại.
    **File liên quan:** Repository.

## Edge Case và Trade-off

16. **Câu hỏi:** Required size chưa chọn thì sao?
    **Trả lời ngắn:** Disable Add.
    **Trả lời sâu:** UI nên hiển thị lỗi ngay tại group size, không gửi request thiếu option lên backend.
    **File liên quan:** UI states.

17. **Câu hỏi:** Chọn quá max topping thì sao?
    **Trả lời ngắn:** Chặn chọn thêm hoặc yêu cầu bỏ choice cũ.
    **Trả lời sâu:** Rule phải rõ ràng để Customer hiểu vì sao không thể chọn thêm topping.
    **File liên quan:** validation.

18. **Câu hỏi:** Giá option đổi sau khi vào checkout thì sao?
    **Trả lời ngắn:** Backend báo thay đổi và yêu cầu refresh.
    **Trả lời sâu:** Checkout total phải lấy từ backend. Nếu giá đổi, Customer cần thấy giá mới trước khi đặt Order.
    **File liên quan:** checkout.

19. **Câu hỏi:** Vì sao làm sau Ordering MVP?
    **Trả lời ngắn:** Nó chạm menu, Cart, checkout và Order.
    **Trả lời sâu:** Option làm tăng độ phức tạp của add-to-Cart, merge Cart, snapshot Order và reorder. Core Ordering nên ổn định trước.
    **File liên quan:** roadmap.

20. **Câu hỏi:** Vì sao không làm nested options?
    **Trả lời ngắn:** Quá phức tạp cho demo.
    **Trả lời sâu:** Một level group/choice đủ cho size và topping phổ biến. Nested options làm UI, validation và pricing khó hơn nhiều.
    **File liên quan:** questions.
