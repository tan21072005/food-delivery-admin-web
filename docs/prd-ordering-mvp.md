# PRD: Ordering MVP - Per-Restaurant Cart, Draft Orders, Checkout, and Order Tracking

> Label: `ready-for-agent`
> Status: Draft

## Problem Statement

Customer app hiện có nhiều màn hình liên quan đến đặt món, Cart, Checkout và Order, nhưng luồng đặt món thật chưa hoàn chỉnh và chưa nhất quán theo MVVM. Checkout hiện còn phụ thuộc vào dữ liệu local/demo, Order list còn đọc từ local store, trong khi một số Repository/ViewModel đã bắt đầu gọi Supabase.

Mục tiêu của PRD này là xây dựng luồng Ordering MVP giống app food thực tế: Customer có thể thêm Món vào Cart theo từng Restaurant, xem các Cart trong tab Đơn nháp, checkout một Cart, tạo Order thật trên Supabase, rồi theo dõi Order trong tab Đang xử lý.

## Solution

Xây dựng Ordering MVP theo kiến trúc MVVM, lấy Supabase làm nguồn dữ liệu chính. Mỗi Customer có thể có nhiều Cart song song, nhưng mỗi Cart thuộc về một Restaurant. Checkout diễn ra trên một Cart cụ thể và tạo một Order cho Restaurant đó.

Màn Order dùng 4 tab:

```text
Đơn nháp | Đang xử lý | Đã hoàn thành | Đã hủy
```

Mapping:

```text
Đơn nháp = Cart chưa checkout
Đang xử lý = pending / confirmed / preparing / delivering
Đã hoàn thành = completed
Đã hủy = cancelled
```

## User Stories

1. Là Customer, tôi muốn thêm Món vào Cart của Restaurant hiện tại, để có thể chuẩn bị một đơn đặt món.
2. Là Customer, tôi muốn mỗi Restaurant có một Cart riêng, để có thể quay lại từng Restaurant và tiếp tục đơn nháp của Restaurant đó.
3. Là Customer, tôi muốn khi thêm lại một Món đã có trong Cart thì số lượng tăng lên, để tránh tạo dòng trùng lặp.
4. Là Customer, tôi muốn tab Đơn nháp hiển thị các Cart theo từng Restaurant, để biết mình đang có những đơn chưa checkout.
5. Là Customer, tôi muốn mỗi card Đơn nháp hiển thị Restaurant, địa chỉ, ảnh, số món và tạm tính, để nhanh chóng nhận ra Cart cần checkout.
6. Là Customer, tôi muốn mở một Đơn nháp để vào Checkout của Restaurant đó.
7. Là Customer, tôi muốn xem danh sách Món trong Checkout, gồm ảnh, tên, option/topping nếu có, số lượng và giá.
8. Là Customer, tôi muốn tăng, giảm hoặc xóa CartItem trước khi đặt món.
9. Là Customer, tôi muốn Cart tự biến mất khỏi Đơn nháp khi không còn CartItem nào.
10. Là Customer, tôi muốn chọn DeliveryAddress khi checkout, để giao đúng nơi.
11. Là Customer, tôi muốn thêm DeliveryAddress mới nếu chưa có địa chỉ phù hợp.
12. Là Customer, tôi muốn lưu tên người nhận và số điện thoại người nhận theo DeliveryAddress.
13. Là Customer, tôi muốn thêm ghi chú giao hàng, ví dụ "gọi trước khi giao" hoặc "để ở lễ tân".
14. Là Customer, tôi muốn chọn voucher khả dụng để giảm giá Order.
15. Là Customer, tôi muốn thấy voucher không khả dụng bị làm mờ và có lý do rõ ràng.
16. Là Customer, tôi muốn app tự tính subtotal, deliveryFee, discount và total trước khi đặt món.
17. Là Customer, tôi muốn thanh toán bằng COD trong MVP.
18. Là Customer, tôi muốn bấm Đặt món để tạo Order thật.
19. Là Customer, tôi muốn sau khi đặt món thành công, Cart biến mất khỏi Đơn nháp và Order xuất hiện ở tab Đang xử lý.
20. Là Customer, tôi muốn xem trạng thái Order bằng nhãn dễ hiểu như Chờ quán xác nhận, Quán đã nhận đơn, Đang chuẩn bị món, Đang giao hàng.
21. Là Customer, tôi muốn hủy Order khi Order vẫn đang pending.
22. Là Customer, tôi muốn Order cũ giữ nguyên tên món, ảnh, giá, địa chỉ và tổng tiền tại thời điểm đặt, dù Restaurant hoặc Customer sửa dữ liệu sau này.

## Implementation Decisions

- **Architecture**: Tiếp tục theo MVVM. Fragment chỉ xử lý UI, binding, observe state và navigation. ViewModel giữ screen state và gọi Repository. Repository gọi Supabase API/RPC.
- **Data source**: Supabase là nguồn dữ liệu chính cho Cart, Checkout và Order. `LocalCart` và `LocalOrderStore` không dùng cho flow thật.
- **Checkout navigation**: Refactor `Checkout` từ Activity sang `CheckoutFragment` trong Navigation graph. Flow mới không dùng `startActivity(... Checkout.class)`.
- **Checkout input**: `CheckoutFragment` nhận `cartId` hoặc `restaurantId` để load đúng per-Restaurant Cart.
- **Draft carts**: Tab Đơn nháp gọi `CartRepository.getDraftCarts()` và hiển thị danh sách Cart group theo Restaurant.
- **Draft cart card data**: Mỗi card cần `cartId`, `restaurantId`, `restaurantName`, `restaurantAddress`, `restaurantImageUrl`, `serviceType`, `itemCount`, `subtotal`, `updatedAt`.
- **Cart schema**:

```text
carts
- id
- customer_id / user_id
- restaurant_id
- status: draft
- created_at
- updated_at

cart_items
- id
- cart_id
- menu_id
- quantity
- option_label
- note
- unit_price_snapshot
- created_at
- updated_at
```

- **Cart rule**: Một Customer chỉ có tối đa một Cart draft cho mỗi Restaurant.
- **Add to Cart**: Nếu Restaurant đã có Cart thì dùng lại Cart đó. Nếu Món chưa có thì thêm CartItem mới. Nếu Món đã có thì tăng quantity.
- **Empty Cart**: Nếu Cart không còn CartItem thì xóa hoặc ẩn khỏi Đơn nháp.
- **Checkout UI**:

```text
Header: Thanh toán
DeliveryAddress đang chọn
Ghi chú giao hàng
DeliveryOption: Giao đơn ngay
Restaurant section + Thêm món
CartItem list
Quantity control
PaymentMethod
OrderNote
PriceSummary
CTA: Đặt món
```

- **DeliveryAddress MVP fields**: `label`, `recipientName`, `recipientPhone`, `fullAddress`, `latitude`, `longitude`, `isDefault`.
- **DeliveryAddress snapshot in Order**:

```text
delivery_address_id
recipient_name_snapshot
recipient_phone_snapshot
full_address_snapshot
latitude_snapshot
longitude_snapshot
```

- **Delivery option**: MVP chỉ hỗ trợ Giao đơn ngay. Hẹn giờ giao là Future Scope.
- **Delivery fee**: MVP dùng deliveryFee cố định `15.000đ` mỗi Order. Lưu `delivery_fee` vào Order khi checkout.
- **PaymentMethod**: MVP chỉ hỗ trợ COD. MOMO, ZALOPAY, BANK_CARD là Future Scope.
- **Voucher MVP**: Voucher toàn app, tối đa 1 voucher cho mỗi Order. Voucher khả dụng cho chọn. Voucher không khả dụng vẫn hiển thị nhưng bị disabled/màu xám và có lý do.
- **Voucher validation**: ViewModel validate sơ bộ để UI phản hồi nhanh. Supabase validate lại khi checkout và là nguồn quyết định cuối cùng.
- **Voucher conditions MVP**: `min_order_amount`, `discount_type` (`fixed` hoặc `percent`), `discount_value`, `max_discount_amount`, `start_at`, `end_at`, `usage_limit` hoặc `is_active`.
- **Order price fields**:

```text
subtotal_amount
delivery_fee
discount_amount
total_amount / net_amount
```

MVP formula:

```text
total_amount = subtotal_amount + delivery_fee - discount_amount
```

- **OrderLine/order_items snapshot**:

```text
order_id
menu_id
item_name_snapshot
item_image_snapshot
unit_price_snapshot
quantity
option_label
note
```

- **Order status MVP**:

```text
pending = Chờ quán xác nhận
confirmed = Quán đã nhận đơn
preparing = Đang chuẩn bị món
delivering = Đang giao hàng
completed = Đã hoàn thành
cancelled = Đã hủy
```

- **Cancel rule**: Customer chỉ được hủy Order khi status là `pending`.
- **Checkout success**: Khi checkout thành công, xóa Cart khỏi Đơn nháp, tạo Order `pending`, điều hướng sang tab Đang xử lý và hiển thị Order mới ở đầu danh sách.
- **Demo status update**: Trong MVP demo, status Order có thể được cập nhật thủ công trong Supabase DB. Seller/Shipper update thật là follow-up.
- **Topping/Option**: MVP hiển thị option/topping nếu dữ liệu có trong Supabase. Chưa xây flow chọn topping phức tạp.

## Testing Decisions

- Test seam chính là ViewModel.
- Test ViewModel với fake Repository, không phụ thuộc Supabase thật.
- Test tốt assert vào observable state và hành vi người dùng thấy được, không assert chi tiết ViewModel gọi method nào.
- Ưu tiên test:
  - `CartViewModel`: load Đơn nháp, add/update/remove CartItem, empty Cart behavior.
  - `CheckoutViewModel`: load Cart, chọn địa chỉ, chọn voucher, tính PriceSummary, checkout success/failure.
  - `OrderViewModel`: load Order theo tab, mapping status, cancel pending Order.
- Integration với Supabase có thể test thủ công trong MVP 3 ngày.

## Out of Scope

- Discovery/Menu/Restaurant Browsing đầy đủ: Home data, Restaurant list/detail, search/filter, Cuisine, DishCategory. Các phần này thuộc PRD 2.
- Seller app xác nhận đơn và cập nhật trạng thái.
- Shipper app cập nhật delivering.
- Realtime shipper GPS tracking.
- `ready_for_pickup`.
- Refund / dispute.
- Push notification.
- Payment gateway MOMO/ZALOPAY/BANK_CARD.
- Hẹn giờ giao.
- Tính phí giao hàng theo GPS/khoảng cách.
- Phụ phí thời tiết, giờ cao điểm, giao tận cửa.
- Food Care / bảo hiểm đơn hàng.
- Service fee, small order fee, surge fee.
- Voucher theo Restaurant, voucher theo Customer, free ship voucher, stack nhiều voucher, point/coin.
- Rating/review sau completed.
- Reorder nâng cao.
- Flow chọn topping/size phức tạp.

## Further Notes

- PRD này thay thế trọng tâm Ordering trong `docs/prd-domain-model-refactor.md`. PRD cũ vẫn hữu ích như tài liệu domain rộng hơn, nhưng implementation nên tách PRD 1 và PRD 2.
- `CONTEXT.md` đã được cập nhật để định nghĩa Cart là per-Restaurant Cart và DeliveryAddress có thông tin người nhận.
- Deadline 3 ngày: nên ưu tiên schema/RPC, Repository/ViewModel, CheckoutFragment, Đơn nháp và Order list. Các phần visual polish chỉ làm sau khi flow thật chạy được.
