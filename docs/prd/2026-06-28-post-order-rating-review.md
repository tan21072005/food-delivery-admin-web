# PRD: Rating/review sau Order completed

> Label: `ready-for-agent`
> Trạng thái: nháp
> Owner: Worker 6 tài liệu lập kế hoạch
> Feature gate canonical: tài liệu này

## Tóm tắt điều hành

Customer chỉ có thể review một Order thuộc về họ và đã đạt trạng thái `completed`. Lát cắt có thể release đầu tiên thêm một review sau Order cho mỗi Order completed, lưu trong Supabase, ngăn gửi trùng ở cả UI và database/API, và hiển thị trạng thái review trên card lịch sử Order completed.

Đây là phần nối tiếp Ordering MVP. Nó không được chặn draft Cart, Checkout hoặc active Order tracking, nhưng nên sẵn sàng cho demo MVP khi đã có Order completed thật.

## Hiện trạng

- `Hiện tại`: `OrderAdapter` đã hiển thị control `Danh gia don hang` và `Xem danh gia` cho card Order completed dựa trên `Order.isReviewed()`.
- `Hiện tại`: `OrderReviewFragment` tồn tại và thu thập rating Restaurant, food thumbs up/down, text, UI ảnh tùy chọn và driver rating, rồi đánh dấu Order mock local là đã review.
- `Hiện tại`: `OrderListFragment` đọc mọi tab Order từ `LocalOrderStore`, không phải Supabase.
- `Hiện tại`: `OrderDetailFragment` có thể navigate tới `OrderReviewFragment`, nhưng không truyền `order_id` từ Order thật.
- `Hiện tại`: `ReviewsFragment`, `ReviewItem` và `ReviewAdapter` hiển thị review Restaurant với filter, nhưng toàn bộ dữ liệu là mock.
- `Hiện tại`: Supabase SQL có `restaurants.avg_rating`, `restaurants.total_reviews`, `menus.rating`, `orders` và `order_items`, nhưng chưa có bảng review và chưa có contract ghi review được RLS bảo vệ.
- `Hiện tại`: `docs/sql.sql` ghi "NO RLS - DEV MODE"; tính năng này không thể được xem là bảo mật cho đến khi policies/functions review được thêm trong bước lập kế hoạch/thực thi SQL sau.
- `Mục tiêu`: Review được persist phía server và suy ra từ authenticated Customer identity, không tin `user_id` do client gửi.
- `Chuyển tiếp`: Cho đến khi Ordering MVP thay `LocalOrderStore`, tính năng có thể giữ UI mock làm fallback demo, nhưng tiêu chí production phụ thuộc vào Order completed được backing bởi Supabase.

## Vấn đề

Customer app có màn hình review trực quan nhưng chưa có tính năng review đáng tin. Customer hiện có thể mở màn hình review từ Order completed mock và đánh dấu một object in-memory là đã review. Điều đó không tồn tại sau restart app, không cập nhật tổng hợp review của Restaurant, không ngăn ghi trùng ở backend, và không xác minh Order được review đã completed hoặc thuộc Customer đã xác thực.

Nếu thiếu contract review sau Order an toàn, demo MVP không thể trung thực thể hiện luồng end-to-end "Customer nhận món, rồi review Restaurant" như một tính năng thật.

## Mục tiêu

- Cho phép Customer gửi review chỉ cho Order `completed` của chính họ.
- Ngăn review trùng cho cùng Order kể cả double tap, retry hoặc API call song song.
- Persist dữ liệu rating/review Restaurant trong Supabase với ranh giới RLS/security.
- Cập nhật UI lịch sử Order completed từ trạng thái review phía server.
- Tái sử dụng layout `OrderReviewFragment` hiện có khi phù hợp.
- Giữ lát cắt đầu tiên thân thiện với demo: một Order, một rating Restaurant, text tùy chọn, food feedback tag/thumb tùy chọn, không bắt buộc upload ảnh.

## Không phải mục tiêu

- Không có Seller app moderation console.
- Không persist driver review trong release đầu tiên trừ khi model Order có driver đã sẵn sàng.
- Không upload ảnh review trong release đầu tiên.
- Không có endpoint ghi public anonymous.
- Không thay đổi schema checkout Ordering MVP trong task lập kế hoạch này.
- Không thực thi SQL thật hoặc implementation app trong task Worker 6 này.

## Người dùng

- Customer: viết review sau khi nhận món.
- Restaurant/Seller tương lai: hưởng lợi từ aggregate rating và review text, nhưng không dùng Customer app này.
- Demo evaluator: cần thấy một Order completed chuyển thành reviewed và xuất hiện trong lịch sử review Restaurant.

## Câu chuyện người dùng

1. Là Customer, tôi muốn thấy `Danh gia don hang` chỉ trên Order completed mà tôi chưa review, để biết Order nào đủ điều kiện.
2. Là Customer, tôi muốn Order đang xử lý, đã hủy và đang chờ chặn việc gửi review, để tôi không review Order chưa nhận.
3. Là Customer, tôi muốn chấm Restaurant từ 1 đến 5 sao, để trải nghiệm của tôi đóng góp vào chất lượng Restaurant.
4. Là Customer, tôi muốn thêm feedback text tùy chọn, để mô tả điều tốt hoặc chưa tốt.
5. Là Customer, tôi muốn gửi food feedback như thumbs up/down hoặc tag, để app thu thập phản hồi có cấu trúc nhanh.
6. Là Customer, tôi muốn app ngăn gửi trùng, để tôi không vô tình tạo review lặp.
7. Là Customer, tôi muốn Order đã review hiển thị `Xem danh gia`, để biết review đã tồn tại.
8. Là Customer, tôi muốn danh sách review Restaurant có review thật đã gửi, để trang Restaurant detail phản ánh lịch sử Customer.

## Yêu cầu

### Điều kiện đủ

- `Mục tiêu`: Gửi review phải yêu cầu Customer đã xác thực.
- `Mục tiêu`: `order_id` được gửi phải thuộc Customer đã xác thực.
- `Mục tiêu`: Trạng thái Order phải đúng bằng `completed`.
- `Mục tiêu`: Order cancelled, pending, confirmed, preparing, ready-for-pickup và delivering không được review.
- `Mục tiêu`: UI phải ẩn hoặc disable CTA review cho Order chưa completed, nhưng backend vẫn là nguồn quyết định chính thức.

### Ngăn trùng

- `Mục tiêu`: Tối đa một review cho mỗi Order.
- `Mục tiêu`: Ngăn trùng phải tồn tại ở database bằng unique constraint trên `order_id`.
- `Mục tiêu`: Repository/ViewModel phải xử lý response trùng như trạng thái "already reviewed" và refresh trạng thái Order.
- `Mục tiêu`: Nút submit phải disable trong khi submit call đang chạy.

### Dữ liệu review

- `Mục tiêu`: Field bắt buộc: `order_id`, `restaurant_id`, `customer_id/user_id`, `restaurant_rating` từ 1 đến 5.
- `Mục tiêu`: Field tùy chọn: `review_text`, `food_feedback`, selected food tags.
- `Mục tiêu`: Server suy ra `customer_id/user_id` và `restaurant_id` từ Order completed. Client không được tin cậy cho các field này.
- `Mục tiêu`: Driver rating là phạm vi tương lai trừ khi `driver_id` hiện diện và team chấp nhận rõ contract/table bổ sung.

### UI

- `Chuyển tiếp`: Tái sử dụng `app/src/main/res/layout/order_fragment_review.xml`, nhưng bind vào `OrderReviewViewModel` thay vì `LocalOrderStore`.
- `Mục tiêu`: `OrderReviewFragment` tải điều kiện review và review hiện có theo `order_id`.
- `Mục tiêu`: Nếu Order đã review, màn hình mở ở chế độ read-only hoặc route tới review detail read-only.
- `Mục tiêu`: Card Order completed dùng `is_reviewed` suy ra từ server.

### Backend và bảo mật

- `Mục tiêu`: Ghi review phải đi qua Supabase RPC như `submit_order_review(p_order_id, p_restaurant_rating, p_review_text, p_food_feedback, p_tags)`.
- `Mục tiêu`: RPC phải là `SECURITY DEFINER`, phải tra `users.id` qua `auth.uid()`, phải kiểm tra ownership và trạng thái completed, và chỉ insert nếu chưa có review.
- `Mục tiêu`: RLS policies phải cho Customer đọc review của chính họ và cho màn hình public/Restaurant đọc các field review an toàn để hiển thị.
- `Mục tiêu`: Không route client nào được gửi `user_id`, `customer_id`, `restaurant_id` hoặc `is_reviewed` như giá trị đáng tin cậy.

## Contract dữ liệu đề xuất

Chỉ lập kế hoạch; không chạy SQL này từ tài liệu.

```text
order_reviews
- id
- order_id unique not null references orders(id)
- user_id/customer_id not null references users(id)
- restaurant_id not null references restaurants(id)
- restaurant_rating smallint check 1..5
- review_text text nullable
- food_feedback text nullable, e.g. positive/negative
- food_tags text[] nullable
- created_at timestamptz default now()
- updated_at timestamptz default now()
- deleted_at timestamptz nullable
```

Các field read model suy ra cần cho Android:

```text
OrderReviewState
- orderId
- status
- isEligible
- isReviewed
- restaurantName
- restaurantImageUrl/orderFirstItemImageUrl
- existingReview nullable
```

## Tiêu chí chấp nhận

- Given Customer đã xác thực có một Order completed chưa có review, khi mở lịch sử completed, then `Danh gia don hang` hiển thị.
- Given cùng Customer gửi review Restaurant 5 sao, khi request thành công, then lịch sử Order refresh và hiển thị `Xem danh gia`.
- Given Customer double tap submit, khi cả hai request tới backend, then chỉ có một row `order_reviews` cho Order.
- Given Order thuộc Customer khác, khi Customer hiện tại cố gửi review cho Order đó, then backend từ chối request.
- Given Order là `pending`, `confirmed`, `preparing`, `ready_for_pickup`, `delivering` hoặc `cancelled`, khi cố gửi review, then backend từ chối request.
- Given Restaurant detail reviews được mở, khi có dữ liệu review thật, then danh sách render server reviews thay vì chỉ review mock.
- Given app restart, trạng thái reviewed vẫn đúng vì đến từ Supabase.

## Chỉ số

- `Release blocker`: số review trùng cho một Order phải bằng 0, đo bằng `count(*) group by order_id having count(*) > 1`.
- `Release blocker`: review RPC từ chối Order chưa completed trong test SQL thủ công hoặc có unit hỗ trợ.
- `Tín hiệu tham khảo`: tỷ lệ submit review thành công trong rehearsal demo.
- `Tín hiệu tham khảo`: average Restaurant rating hiển thị sau ít nhất một review đã gửi.

## Phụ thuộc

- Ordering MVP phải tạo Order thật với trạng thái `completed`.
- Order list phải chuyển từ `LocalOrderStore` sang dữ liệu Supabase qua Repository/ViewModel trước khi trạng thái review production có ý nghĩa.
- Navigation phải truyền `order_id` nhất quán vào `OrderReviewFragment`.
- Auth session phải cung cấp Customer JWT qua `SupabaseClient`.
- RLS phải được bật cho bảng/function liên quan review trước khi tuyên bố bảo mật.

## Tác động tới Ordering MVP

Tính năng này không nên làm chậm Ordering MVP. Nó phụ thuộc vào lịch sử Order completed của MVP và nên được triển khai sau khi luồng Checkout/Order chính có thể tạo và hiển thị Order thật. Với demo MVP, chỉ cần một đường hẹp: đánh dấu thủ công một Order là `completed` trong Supabase, mở lịch sử completed, gửi một review, refresh và hiển thị trạng thái reviewed cùng danh sách review Restaurant.

## Rủi ro

- Tên enum hiện có trong `docs/sql.sql` dùng `delivered`/`on_the_way`, trong khi domain docs dùng `completed`/`delivering`; điều kiện review phải khớp Order status canonical trước implementation.
- Model Order hiện tại là model mock một món; review thật cần snapshot restaurant/order-line.
- SQL hiện tại được gắn nhãn no-RLS dev mode; tiêu chí bảo mật bị chặn cho đến khi RLS/RPC được lập kế hoạch và áp dụng.
- UI review hiện có gồm driver rating và UI thêm ảnh; ship các phần này khi chưa có backend support sẽ làm sai phạm vi.

## Quyết định mở

- Release đầu tiên chỉ lưu Restaurant review hay cả food-level feedback theo từng OrderLine?
- `Xem danh gia` nên mở cùng màn hình ở chế độ read-only hay một detail view đơn giản hơn?
- Review text có được sửa sau khi gửi không? Khuyến nghị mặc định: không sửa trong MVP, thêm edit ở phạm vi tương lai.
- Aggregate rating của Restaurant nên cập nhật bằng trigger, materialized query hay recalculation định kỳ? Khuyến nghị mặc định: trigger hoặc RPC transaction update để MVP đơn giản.

## Kế hoạch test

- ViewModel tests với fake repository:
  - Order completed chưa review là đủ điều kiện
  - Order completed đã review mở trạng thái read-only/already-reviewed
  - Order chưa completed không đủ điều kiện
  - submit disable loading và phát success/error events
  - lỗi duplicate map sang trạng thái already-reviewed
- Repository/API contract tests khi khả thi:
  - payload submit review không chứa field identity đáng tin cậy
  - response duplicate được xử lý như trạng thái ổn định, không crash
- Verification SQL/RLS thủ công trong Supabase:
  - owner của Order completed có thể insert qua RPC
  - owner của Order chưa completed bị từ chối
  - Order của Customer khác bị từ chối
  - direct table insert bị từ chối khi RLS được bật

## Phạm vi tương lai

- Ảnh review qua Supabase Storage.
- Persist driver rating.
- Rating theo từng OrderLine hoặc từng Mon.
- Moderation/reporting.
- Khoảng thời gian cho sửa/xóa review.
- Seller phản hồi review của Customer.
