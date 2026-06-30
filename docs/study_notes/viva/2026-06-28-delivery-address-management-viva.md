# Viva: Quản lý DeliveryAddress

> Phạm vi: CRUD địa chỉ giao hàng, địa chỉ mặc định và tích hợp checkout cho Customer app.

## Domain và Product

1. **Câu hỏi:** `DeliveryAddress` trong dự án này là gì?
   **Trả lời ngắn:** Là địa chỉ giao hàng đã lưu của Customer.
   **Trả lời sâu:** `DeliveryAddress` gồm nhãn, tên người nhận, số điện thoại người nhận, địa chỉ đầy đủ, tọa độ tùy chọn và cờ `isDefault`. Đây là thuật ngữ domain dùng cho giao hàng, không phải địa chỉ chung chung.
   **File liên quan:** `CONTEXT.md`.

2. **Câu hỏi:** Vì sao không gọi đơn giản là `Address`?
   **Trả lời ngắn:** `DeliveryAddress` rõ nghĩa domain hơn.
   **Trả lời sâu:** `Address` có thể chỉ địa chỉ hồ sơ, địa chỉ nhà hàng hoặc dữ liệu nội bộ. `DeliveryAddress` nói rõ đây là địa chỉ Customer chọn khi checkout.
   **File liên quan:** `CONTEXT.md`.

3. **Câu hỏi:** Vì sao DeliveryAddress quan trọng cho Ordering MVP?
   **Trả lời ngắn:** Checkout cần biết giao đến đâu.
   **Trả lời sâu:** Không thể tạo Order thực tế nếu thiếu địa chỉ, người nhận và số điện thoại. Luồng MVP phải cho Customer chọn hoặc thêm địa chỉ trước khi đặt món.
   **File liên quan:** `docs/prd-ordering-mvp.md`.

4. **Câu hỏi:** Giá trị MVP của tính năng này là gì?
   **Trả lời ngắn:** Customer không phải nhập lại địa chỉ mỗi lần.
   **Trả lời sâu:** Customer có thể lưu nhiều địa chỉ, đặt một địa chỉ mặc định, đổi địa chỉ khi checkout và giảm lỗi nhập liệu.
   **File liên quan:** address PRD.

5. **Câu hỏi:** Những gì nằm ngoài phạm vi MVP?
   **Trả lời ngắn:** Map picker, geocoding, phí theo khoảng cách và chia sẻ địa chỉ.
   **Trả lời sâu:** Các phần đó cần dịch vụ bản đồ, thuật toán tính phí và UI phức tạp. MVP nên ưu tiên CRUD ổn định và checkout dùng được.
   **File liên quan:** roadmap.

## Hiện trạng

6. **Câu hỏi:** UI địa chỉ hiện có gì?
   **Trả lời ngắn:** Có `AddressListFragment`, `AddressAdapter`, `fragment_address_list.xml` và `item_address.xml`.
   **Trả lời sâu:** Các file này nằm dưới Profile và có thể dùng làm vỏ UI ban đầu, nhưng chưa phải luồng DeliveryAddress thật.
   **File liên quan:** `AddressListFragment`, `AddressAdapter`.

7. **Câu hỏi:** UI địa chỉ hiện tại đã thật chưa?
   **Trả lời ngắn:** Chưa, đang dùng dummy data.
   **Trả lời sâu:** `AddressItem` hiện được hard-code và hành vi add/select chỉ Toast. Chưa có repository, API, persistence hoặc validation thật.
   **File liên quan:** `AddressItem`.

8. **Câu hỏi:** `AddressItem` đang thiếu gì?
   **Trả lời ngắn:** Thiếu dữ liệu domain giao hàng đầy đủ.
   **Trả lời sâu:** Nó chưa tách tên người nhận, số điện thoại, tọa độ, timestamp và trạng thái xóa. Không nên biến display model này thành contract backend.
   **File liên quan:** `AddressItem`.

9. **Câu hỏi:** Hiện có `DeliveryAddressRepository` chưa?
   **Trả lời ngắn:** Chưa.
   **Trả lời sâu:** Cần repository riêng để list/create/update/delete/set-default thay vì để Fragment gọi API trực tiếp.
   **File liên quan:** `DeliveryAddressRepository`.

10. **Câu hỏi:** Backend schema hiện hỗ trợ ra sao?
    **Trả lời ngắn:** Có draft `user_addresses` nhưng chưa đủ.
    **Trả lời sâu:** Draft thiếu recipient name/phone và chưa nối với Android CRUD. Cần quyết định dùng lại `user_addresses` hay tạo `delivery_addresses`.
    **File liên quan:** `docs/sql.sql`.

## Kiến trúc

11. **Câu hỏi:** Business logic nên nằm ở đâu?
    **Trả lời ngắn:** Trong ViewModel và Repository.
    **Trả lời sâu:** Fragment chỉ inflate view, bind adapter, observe state, hiển thị lỗi và điều hướng. Validation và gọi Supabase không nên nằm trong Fragment.
    **File liên quan:** `DeliveryAddressViewModel`.

12. **Câu hỏi:** Repository nên chịu trách nhiệm gì?
    **Trả lời ngắn:** Che chi tiết Supabase REST/RPC.
    **Trả lời sâu:** Repository cung cấp API rõ như `listAddresses`, `createAddress`, `updateAddress`, `deleteAddress`, `setDefaultAddress`, giúp ViewModel dễ test.
    **File liên quan:** `DeliveryAddressRepository`.

13. **Câu hỏi:** Checkout tích hợp DeliveryAddress ở đâu?
    **Trả lời ngắn:** Trong `CheckoutViewModel`.
    **Trả lời sâu:** `CheckoutViewModel` nên own selected/default `DeliveryAddress` và block checkout nếu không có địa chỉ hợp lệ.
    **File liên quan:** `CheckoutViewModel`.

14. **Câu hỏi:** Vì sao cần snapshot địa chỉ vào Order?
    **Trả lời ngắn:** Order lịch sử phải giữ địa chỉ đã giao.
    **Trả lời sâu:** Customer có thể sửa hoặc xóa địa chỉ đã lưu sau khi đặt. Order vẫn phải hiển thị đúng địa chỉ tại thời điểm tạo Order.
    **File liên quan:** `Order`.

15. **Câu hỏi:** Snapshot nên gồm field nào?
    **Trả lời ngắn:** Id địa chỉ, người nhận, phone, địa chỉ đầy đủ và tọa độ.
    **Trả lời sâu:** Backend nên snapshot từ row đã xác minh ownership, không tin snapshot client gửi lên.
    **File liên quan:** checkout RPC.

## Bảo mật và RLS

16. **Câu hỏi:** Rủi ro bảo mật lớn nhất là gì?
    **Trả lời ngắn:** IDOR/BOLA giữa các Customer.
    **Trả lời sâu:** Nếu policy chỉ yêu cầu authenticated mà không lọc owner, Customer A có thể đọc hoặc sửa địa chỉ của Customer B bằng cách đoán id.
    **File liên quan:** RLS policy.

17. **Câu hỏi:** `TO authenticated` một mình có đủ không?
    **Trả lời ngắn:** Không đủ.
    **Trả lời sâu:** Nó chỉ chứng minh người dùng đã đăng nhập. Policy vẫn cần điều kiện owner theo `auth.uid()` hoặc `customer_id`.
    **File liên quan:** Supabase RLS.

18. **Câu hỏi:** UPDATE policy cần gì?
    **Trả lời ngắn:** Cần cả `USING` và `WITH CHECK`.
    **Trả lời sâu:** `USING` giới hạn row được update, còn `WITH CHECK` ngăn Customer đổi owner field để chiếm row của người khác.
    **File liên quan:** RLS policy.

19. **Câu hỏi:** Dữ liệu địa chỉ nào là nhạy cảm?
    **Trả lời ngắn:** Địa chỉ đầy đủ, phone, tên người nhận, latitude và longitude.
    **Trả lời sâu:** Log và analytics không nên ghi PII này; chỉ nên ghi event như `address_created` hoặc `default_changed`.
    **File liên quan:** analytics notes.

20. **Câu hỏi:** Điều gì làm tính năng chưa sẵn sàng release?
    **Trả lời ngắn:** Rò rỉ địa chỉ, thiếu validation checkout hoặc không snapshot Order.
    **Trả lời sâu:** Chỉ cần một lỗi cross-Customer address access cũng đủ chặn release vì đây là dữ liệu cá nhân nhạy cảm.
    **File liên quan:** QA checklist.
