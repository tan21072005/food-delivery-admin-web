# PRD: Topping / size / options

## Vấn đề
Hiện tại: tài liệu Cart/Order có nhắc đến nhãn option/topping và UI có `ToppingBottomSheet`, nhưng chưa có domain model đầy đủ cho option group, quy tắc min/max, phần chênh giá hoặc snapshot bất biến khi checkout. Mục tiêu: Customer chọn size/topping/options hợp lệ trước khi thêm Mon vào Cart.

## Mục tiêu
Lập kế hoạch hệ thống option thực tế cho Android Java MVVM + Supabase, tránh xây quá mức thành product configurator quá phức tạp.

## Hiện trạng
- `docs/prd-ordering-mvp.md` xem topping/size/options phức tạp là phạm vi tương lai.
- Code/layout có `topping_bottom_sheet.xml` và `ToppingBottomSheet.java`.
- Cart API hiện tại đơn giản: `menu_id` + quantity, chưa có options có cấu trúc.

## Câu chuyện người dùng
- Customer chọn một size bắt buộc nếu Mon có size.
- Customer chọn topping tùy chọn theo quy tắc min/max.
- Cart và Order hiển thị đúng option đã chọn và đúng giá.

## Phạm vi
- Option group theo Mon.
- Loại chọn: bắt buộc chọn một, tùy chọn chọn một, tùy chọn chọn nhiều có max.
- Chênh giá theo option choice.
- CartItem lưu selected option IDs và display snapshot.

## Ngoài phạm vi
Option lồng nhau, tồn kho chi tiết từng topping, quy tắc dinh dưỡng, option theo khung giờ.

## Thuật ngữ domain
Mon, DishCategory, Restaurant, CartItem, OrderLine, option group, option choice.

## Phụ thuộc
Discovery/Menu, Cart/Checkout, Reorder nếu muốn replay option chính xác, Search chỉ nên search theo Mon/Restaurant trong MVP.

## Luồng người dùng
Customer bấm Mon, bottom sheet tải option groups. Các group bắt buộc phải hợp lệ. Giá preview cập nhật trực tiếp. Add to Cart gửi lựa chọn; checkout hiển thị tóm tắt option.

## Mô hình dữ liệu
- `menu_option_groups(id, menu_id, name, selection_type, min_select, max_select, sort_order, is_required)`.
- `menu_option_choices(id, group_id, name, price_delta, is_available, sort_order)`.
- `cart_item_options(cart_item_id, group_name_snapshot, choice_name_snapshot, price_delta_snapshot, choice_id)`.
- `order_line_options(order_line_id, group_name_snapshot, choice_name_snapshot, price_delta_snapshot)`.

## Thay đổi API/RPC/Supabase
Endpoint menu detail cần include option groups/choices. Add-to-cart RPC kiểm tra group bắt buộc, min/max, availability và tính lại giá.

## Kiến trúc Android
`FoodDetailViewModel` hoặc `ToppingViewModel` tải options và expose selection state. `ToppingBottomSheet` render groups. CartRepository gửi request có cấu trúc.

## Trạng thái UI
Không có options, đang tải, thiếu option bắt buộc, lựa chọn hợp lệ, choice không khả dụng, đang cập nhật giá, thêm thành công, thêm thất bại.

## Xử lý lỗi
- Disable choice không khả dụng.
- Nếu backend từ chối lựa chọn đã cũ, tải lại options và báo Customer.
- Nếu tải option lỗi, chỉ cho add Mon không có option bắt buộc.

## Ghi chú bảo mật/RLS
Backend phải tính lại chênh giá option và kiểm tra IDs. Android không được gửi label/price tùy ý rồi để backend tin luôn.

## Chiến lược test
Unit test validation min/max, group bắt buộc, tính giá, từ chối dữ liệu cũ và tóm tắt hiển thị CartItem. Test thủ công size + topping add to Cart.

## Kịch bản demo thủ công
1. Seed một Mon trà sữa có size bắt buộc và topping tùy chọn.
2. Thử combo không hợp lệ/hợp lệ.
3. Thêm vào Cart.
4. Checkout.
5. Kiểm tra snapshot option trong Order detail/data.

## Rủi ro
Luồng này chạm Menu, Cart, Checkout, snapshot Order và Reorder. Khuyến nghị làm sau Ordering MVP; bắt đầu bằng một group size và một group topping.

## Câu hỏi mở
Xem `docs/planning/questions/2026-06-28-topping-size-options-questions.md`.

## Nhật ký giả định
- **Giả định:** MVP chỉ cần option group một cấp.  
  **Vì sao hợp lý:** size/topping demo phổ biến không cần option lồng nhau.  
  **Rủi ro nếu sai:** Restaurant có menu phức tạp sẽ cần model sâu hơn.  
  **Cách kiểm chứng:** kiểm tra sample data/demo menu.
