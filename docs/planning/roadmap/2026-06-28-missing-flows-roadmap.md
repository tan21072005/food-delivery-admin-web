# Lộ trình các luồng Customer app còn thiếu plan

> Ngày: 2026-06-28  
> Vai trò tài liệu: roadmap điều phối cho **Coordinator Agent**.  
> Phạm vi: chỉ dùng để lập kế hoạch, review chéo, chia việc cho subagent/code worker. Không phải tài liệu yêu cầu implement ngay.

## Kết luận nhanh cho Coordinator

Đúng, bạn đang là **Coordinator Agent**.

Vai trò của Coordinator:
- gom kết quả từ các worker/subagent;
- review chéo PRD, plan, questions, viva;
- phát hiện dependency, conflict, thiếu RLS/auth/session;
- quyết định thứ tự làm;
- giao việc tiếp cho code worker khi bắt đầu implement.

Worker/subagent không phải Coordinator. Worker chỉ phụ trách một luồng cụ thể và tạo artifact cho luồng đó.

## Đánh giá chéo của Coordinator

- Không plan nào được sửa app code nếu chưa có lệnh implement rõ ràng.
- Tất cả artifact hiện tại là tài liệu planning.
- Tất cả luồng phải giữ đúng từ vựng trong `CONTEXT.md`: Customer, Restaurant, Món, DishCategory, Cuisine, Cart, CartItem, Order, OrderLine, DeliveryAddress, PaymentMethod.
- Dependency mạnh nhất là Ordering MVP. Các luồng Discovery/Menu, DeliveryAddress, Search, Favorites và Restaurant data thật làm demo chính đáng tin hơn.
- Payment, Push, Tracking/GPS và Refund/Dispute không nên chặn demo checkout chính.
- RLS/auth/session là rủi ro lặp lại ở hầu hết luồng có backend. Mọi read/write dữ liệu Customer phải dựa vào session hiện tại, không tin `user_id` do Android gửi lên.
- Seller/Shipper app không nằm trong repo này. Cập nhật trạng thái, GPS, xử lý refund và xác nhận thanh toán thật chỉ nên mô phỏng/manual hoặc để backend/admin future scope.

## Các subagent đã có plan chi tiết để code chưa?

Có, nhưng **không đồng đều**.

| Luồng | Mức sẵn sàng giao code | Nhận xét Coordinator |
|---|---|---|
| Discovery / Home / Browse Restaurant / Menu | Cao | Plan có file cụ thể, task theo thứ tự, compile/test/manual check. Có thể giao code worker sau khi duyệt API/schema. |
| Search và filter Món/Restaurant | Cao | Plan đủ chi tiết cho SearchFragment/ViewModel/Repository. Cần chốt RPC hay REST trước khi code backend. |
| Favorites / Yêu thích | Cao | Plan chi tiết, có RLS, optimistic UI, table đề xuất. Cần chốt favorite Restaurant-only hay cả Món. |
| DeliveryAddress management | Cao | Plan rất chi tiết, có CRUD/default/checkout/RLS. Có thể giao worker code sau khi chốt `user_addresses` hay `delivery_addresses`. |
| Restaurant info / promotions / reviews data thật | Cao | Plan đủ để implement theo lát cắt data thật. Cần chốt promotion schema và review aggregate. |
| Rating/review sau Order completed | Cao | Plan rất chi tiết, có eligibility, duplicate prevention, RLS. Cần chốt status `completed` là canonical. |
| Payment gateway ngoài COD | Trung bình | Có hướng kiến trúc và task, nhưng chưa đủ code-ready cho provider thật. Code được bản sandbox/manual sau khi chốt decision. |
| Push notification Order status | Trung bình | Code được MVP local notification/polling. Chưa đủ cho FCM thật vì thiếu backend trigger/key/service design. |
| Realtime tracking / shipper GPS | Trung bình | Code được timeline + polling/manual GPS. Chưa đủ cho realtime GPS thật hoặc Maps SDK production. |
| Refund / dispute / complaint | Trung bình | Code được complaint-recording MVP. Chưa đủ cho refund tiền thật/admin workflow. |
| Advanced reorder | Trung bình | Code được RPC/Cart merge MVP nếu Ordering MVP đã xong. Cần deepen nếu options/toppings phức tạp. |
| Topping / size / options | Trung bình | Có model/task chính, nhưng cần plan backend validation chi tiết hơn trước khi code rộng. |

Kết luận: nhóm A và một phần B đã đủ để giao code worker. Nhóm C và các flow có external service chỉ đủ để làm MVP mô phỏng, chưa đủ để làm production thật.

## Thứ tự nên làm

1. A1 - Discovery / Home / Browse Restaurant / Menu.
2. A2 - DeliveryAddress management.
3. A3 - Search và filter Món/Restaurant.
4. A4 - Favorites / Yêu thích.
5. A5 - Restaurant info / promotions / reviews data thật.
6. B1 - Rating/review sau khi Order completed.
7. B2 - Reorder nâng cao.
8. B3 - Topping / size / options.
9. C1 - Push notification cho trạng thái Order.
10. C2 - Realtime order tracking / shipper GPS.
11. C3 - Payment gateway ngoài COD.
12. C4 - Refund / dispute / khiếu nại.

## Dependency map

- Discovery/Menu -> Search/filter, Favorites, Restaurant info, Topping/options, Reorder.
- DeliveryAddress -> Checkout, tracking destination context, payment checkout review.
- Ordering MVP -> Rating/review, Push, Tracking, Refund/dispute, Reorder, Payment.
- Restaurant info/reviews -> Rating/review aggregate sau completed Order.
- Topping/options -> Reorder chính xác và snapshot CartItem/OrderLine.
- Payment gateway -> Refund tự động. Nếu chưa có payment thật, refund chỉ nên là complaint/manual.
- Push notifications -> giúp Customer biết status update, nhưng Tracking vẫn có thể chạy không cần Push.

## Plan nên gộp

- Discovery/Menu + Search/filter có thể làm chung nếu cùng đụng `FoodRepository`, Home/Menu API và adapter dữ liệu.
- Restaurant info/promotions/reviews nên đi sau Discovery/Menu nhưng có thể dùng chung contract Restaurant data.
- Advanced reorder và Topping/options nên thống nhất CartItem/OrderLine option snapshot.
- Push notification và Tracking nên dùng chung status vocabulary, Order detail navigation và deep link.

## Plan nên tách riêng

- Payment gateway phải tách vì liên quan provider, bảo mật, webhook/backend confirmation.
- Refund/dispute phải tách vì có support-case state và policy hoàn tiền.
- DeliveryAddress phải tách vì là CRUD nền tảng, có default-address và RLS riêng.
- Rating/review phải tách khỏi Restaurant info vì quyền ghi review khác quyền đọc aggregate.

## MVP demo path khuyến nghị

1. Customer đăng nhập.
2. Mở Home, xem Restaurant list, mở Restaurant detail/Menu.
3. Search/filter Món hoặc Restaurant.
4. Favorite Restaurant/Món, rồi mở tab Favorites.
5. Quản lý DeliveryAddress và đặt default.
6. Thêm Món vào Cart, checkout COD, tạo Order.
7. Manual update Order status trong Supabase và show Order tab/detail.
8. Mark Order completed, submit rating/review.
9. Nếu còn thời gian: Reorder completed Order và show option/topping summary.

## 5 quyết định quan trọng cần user duyệt

1. Payment ngoài COD: chấp nhận sandbox/manual hay bắt buộc provider thật?
2. Tracking/GPS: dùng polling/manual seeded GPS hay realtime thật?
3. Rating/review và complaint áp dụng cho status Order nào?
4. Topping/options MVP chỉ one-level option group hay cần nested/complex option?
5. Refund/dispute: chỉ ghi complaint hay phải demo hoàn tiền thật?

## Có thể bỏ qua nếu thiếu thời gian

- Payment gateway ngoài COD.
- Realtime shipper GPS map.
- Refund/dispute/complaint.
- Push notification.
- Advanced reorder.
- Topping/options phức tạp ngoài một nhóm size và một nhóm topping.

## Bắt buộc cho demo chạy ổn

- Discovery/Home/Browse Restaurant/Menu.
- DeliveryAddress management.
- Search/filter.
- Favorites.
- Restaurant info/promotions/reviews data thật.
- Ordering MVP trong `docs/prd-ordering-mvp.md`.
- Rating/review sau completed Order nếu demo có review mutation.

## Cách giao việc tiếp cho code worker

Coordinator nên giao theo từng issue nhỏ:

1. Giao worker đọc PRD + plan của đúng luồng.
2. Bắt worker xác nhận dependency trước khi sửa code.
3. Yêu cầu worker chỉ sửa file nằm trong plan.
4. Bắt buộc chạy compile check.
5. Với luồng có Supabase/RLS, bắt worker ghi rõ SQL/RPC chỉ là đề xuất nếu chưa được duyệt.
6. Sau mỗi worker, Coordinator review lại conflict với `CONTEXT.md`, Ordering MVP và roadmap này.

## Danh sách file đã tạo

### PRD
- `docs/prd/2026-06-28-discovery-home-browse-menu.md`
- `docs/prd/2026-06-28-search-filter.md`
- `docs/prd/2026-06-28-favorites.md`
- `docs/prd/2026-06-28-delivery-address-management.md`
- `docs/prd/2026-06-28-restaurant-info-promotions-reviews.md`
- `docs/prd/2026-06-28-post-order-rating-review.md`
- `docs/prd/2026-06-28-non-cod-payment-gateway.md`
- `docs/prd/2026-06-28-order-status-push-notifications.md`
- `docs/prd/2026-06-28-realtime-order-tracking-shipper-gps.md`
- `docs/prd/2026-06-28-refund-dispute-complaint.md`
- `docs/prd/2026-06-28-advanced-reorder.md`
- `docs/prd/2026-06-28-topping-size-options.md`

### Implementation plan
- `docs/superpowers/plans/2026-06-28-discovery-home-browse-menu.md`
- `docs/superpowers/plans/2026-06-28-search-filter.md`
- `docs/superpowers/plans/2026-06-28-favorites.md`
- `docs/superpowers/plans/2026-06-28-delivery-address-management.md`
- `docs/superpowers/plans/2026-06-28-restaurant-info-promotions-reviews.md`
- `docs/superpowers/plans/2026-06-28-post-order-rating-review.md`
- `docs/superpowers/plans/2026-06-28-non-cod-payment-gateway.md`
- `docs/superpowers/plans/2026-06-28-order-status-push-notifications.md`
- `docs/superpowers/plans/2026-06-28-realtime-order-tracking-shipper-gps.md`
- `docs/superpowers/plans/2026-06-28-refund-dispute-complaint.md`
- `docs/superpowers/plans/2026-06-28-advanced-reorder.md`
- `docs/superpowers/plans/2026-06-28-topping-size-options.md`

### Viva
- `docs/study_notes/viva/2026-06-28-discovery-home-browse-menu-viva.md`
- `docs/study_notes/viva/2026-06-28-search-filter-viva.md`
- `docs/study_notes/viva/2026-06-28-favorites-viva.md`
- `docs/study_notes/viva/2026-06-28-delivery-address-management-viva.md`
- `docs/study_notes/viva/2026-06-28-restaurant-info-promotions-reviews-viva.md`
- `docs/study_notes/viva/2026-06-28-post-order-rating-review-viva.md`
- `docs/study_notes/viva/2026-06-28-non-cod-payment-gateway-viva.md`
- `docs/study_notes/viva/2026-06-28-order-status-push-notifications-viva.md`
- `docs/study_notes/viva/2026-06-28-realtime-order-tracking-shipper-gps-viva.md`
- `docs/study_notes/viva/2026-06-28-refund-dispute-complaint-viva.md`
- `docs/study_notes/viva/2026-06-28-advanced-reorder-viva.md`
- `docs/study_notes/viva/2026-06-28-topping-size-options-viva.md`

### Câu hỏi khó
- `docs/planning/questions/2026-06-28-discovery-home-browse-menu-questions.md`
- `docs/planning/questions/2026-06-28-search-filter-questions.md`
- `docs/planning/questions/2026-06-28-favorites-questions.md`
- `docs/planning/questions/2026-06-28-delivery-address-management-questions.md`
- `docs/planning/questions/2026-06-28-restaurant-info-promotions-reviews-questions.md`
- `docs/planning/questions/2026-06-28-post-order-rating-review-questions.md`
- `docs/planning/questions/2026-06-28-non-cod-payment-gateway-questions.md`
- `docs/planning/questions/2026-06-28-order-status-push-notifications-questions.md`
- `docs/planning/questions/2026-06-28-realtime-order-tracking-shipper-gps-questions.md`
- `docs/planning/questions/2026-06-28-refund-dispute-complaint-questions.md`
- `docs/planning/questions/2026-06-28-advanced-reorder-questions.md`
- `docs/planning/questions/2026-06-28-topping-size-options-questions.md`
