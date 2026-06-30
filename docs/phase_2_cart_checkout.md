# Giai đoạn 2: Cart theo từng Restaurant và Checkout từng Đơn nháp

> Trạng thái: đã chốt lại hướng domain theo `CONTEXT.md` và `docs/prd-ordering-mvp.md`.

## Quyết định đã chốt

Ordering MVP không dùng mô hình một Cart chứa món từ nhiều Restaurant rồi checkout một lần.

Luồng chuẩn của repo là:

```text
Restaurant A -> Cart A / Đơn nháp A
Restaurant B -> Cart B / Đơn nháp B
Customer checkout từng Cart riêng
Mỗi lần checkout tạo một Order riêng cho Restaurant đó
```

## Nguyên tắc domain

- Mỗi Customer có thể có nhiều Cart song song.
- Mỗi Cart chỉ thuộc về một Restaurant.
- Một Customer chỉ có tối đa một Cart draft cho mỗi Restaurant.
- Checkout luôn diễn ra trên một Cart cụ thể.
- Checkout một Cart tạo đúng một Order cho Restaurant của Cart đó.
- Tab Đơn nháp hiển thị danh sách Cart theo từng Restaurant.

## Luồng thêm món

Khi Customer thêm Món từ Restaurant A:

- Nếu Cart A đã tồn tại, dùng lại Cart A.
- Nếu Món đã có trong Cart A với cùng option/note, tăng quantity.
- Nếu Món chưa có trong Cart A, tạo CartItem mới.
- Nếu Cart A chưa tồn tại, tạo Cart draft mới cho Restaurant A rồi thêm CartItem.

Khi Customer sau đó thêm Món từ Restaurant B:

- Không merge vào Cart A.
- Không xoá Cart A.
- Tạo hoặc dùng lại Cart B.
- Cart A và Cart B cùng xuất hiện trong tab Đơn nháp.

## Luồng Đơn nháp

Tab Đơn nháp hiển thị mỗi Cart như một card riêng:

```text
Restaurant name
Restaurant address / delivery context
Item count
Subtotal
Updated time
CTA: Xem / Thanh toán
```

Customer chọn một card Đơn nháp để mở Checkout cho đúng Cart đó.

## Luồng Checkout

Checkout nhận `cartId` hoặc `restaurantId` để load đúng Cart:

```text
Checkout Cart A
-> chọn DeliveryAddress
-> chọn payment/voucher/note nếu có
-> đặt món
-> tạo Order A
-> xoá/ẩn Cart A khỏi Đơn nháp
-> Order A xuất hiện ở tab Đang xử lý
```

Cart B không bị ảnh hưởng khi checkout Cart A.

## Backend/RPC kỳ vọng

Backend nên hỗ trợ per-Restaurant Cart thay vì multi-vendor Cart:

- `carts` có `customer_id`, `restaurant_id`, `status = draft`.
- Unique draft Cart theo `(customer_id, restaurant_id, status)` hoặc constraint tương đương.
- `cart_items` thuộc về một `cart_id`.
- Add-to-Cart upsert vào Cart của đúng Restaurant.
- Checkout nhận một `cart_id` và tạo một `orders` row.
- Checkout không trả về danh sách nhiều order IDs cho một Cart.

## Ghi chú về hướng cũ

Phiên bản cũ của file này từng mô tả multi-vendor Cart:

```text
Một Cart chứa nhiều Restaurant
checkout_cart lặp qua từng restaurant_id
một lần checkout trả về List<OrderId>
```

Hướng đó không còn là chuẩn cho Ordering MVP vì mâu thuẫn với `CONTEXT.md` và `docs/prd-ordering-mvp.md`.
