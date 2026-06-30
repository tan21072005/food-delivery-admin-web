# PRD: Dữ liệu thật cho Restaurant info / promotions / reviews

> Worker: 5
> Ngày: 2026-06-28
> Trạng thái: chỉ lập kế hoạch
> Feature gate canonical: `restaurant_real_data_v1`
> Phạm vi: Customer app đọc thông tin Restaurant thật backed bởi Supabase, promotion đang active, và review aggregation thân thiện với MVP cho các bề mặt Restaurant detail.

## Tóm tắt điều hành

Customer hiện đã có thể navigate từ Restaurant detail tới các màn hình thông tin Restaurant, promotions và reviews, nhưng các màn hình này phần lớn còn static hoặc dựa vào mock. PRD này định nghĩa một đường nhỏ, thân thiện với Ordering MVP, để thay mock bằng read model backed bởi Supabase mà không đổi app code, SQL schema hoặc commit trong lượt lập kế hoạch này.

Mục tiêu là ưu tiên đọc. Thông tin Restaurant và promotion active nên là dữ liệu thật từ Supabase. Reviews nên bắt đầu bằng hiển thị aggregate và hỗ trợ danh sách read-only, còn tạo review vẫn bị gate sau Order completed và có thể được triển khai sau khi Ordering MVP ổn định lịch sử Order.

## Vấn đề

`RestaurantDetailFragment`, `RestaurantInfoFragment`, `PromotionsFragment` và `ReviewsFragment` expose một luồng Restaurant nhìn như thật, nhưng hành vi hiện tại có thể gây hiểu lầm cho Customer vì nhiều giá trị bị hard-code:

- `RestaurantDetailFragment` navigate tới info/promotions/reviews nhưng không truyền nhất quán `restaurant_id` tới mọi màn hình con.
- `RestaurantDetailViewModel.loadRestaurantFoods(restaurantId)` trả về Mon hard-code và fragment gọi nó với `1L`, bỏ qua navigation arguments.
- `RestaurantInfoFragment` có source note để tải dữ liệu Supabase nhưng không có ViewModel, Repository, model hoặc API method.
- `PromotionsFragment` dùng `getMockPromotions()` và Toast "Đăng ký", không dùng `offers`.
- `ReviewsFragment` dùng `getMockReviews()` và filter bằng Java stream local, không dùng Supabase.
- Supabase dev schema có `restaurants`, `restaurant_timings`, `offers`, `orders` và `order_items`, nhưng không có bảng review trong `docs/sql.sql`.
- `docs/prd-ordering-mvp.md` cố ý để rating/review sau Order completed ngoài phạm vi, nên tính năng này không được chặn checkout và tracking của Ordering MVP.

## Mục tiêu

- Mục tiêu: Customer thấy tên Restaurant thật, địa chỉ, trạng thái, số lượng rating, giờ mở cửa và mô tả trên Restaurant info.
- Mục tiêu: Customer thấy promotion active thật áp dụng cho Restaurant hiện tại và/hoặc ngữ cảnh checkout toàn app.
- Mục tiêu: Customer thấy dữ liệu aggregate review từ Supabase, với đường đi tới review row thật sau khi có Order completed.
- Mục tiêu: Các entry point Restaurant detail hiện có tiếp tục hoạt động và luôn dùng `restaurant_id` đã chọn.
- Mục tiêu: Luồng vẫn tương thích với Cart theo từng Restaurant và validation voucher checkout của Ordering MVP.

## Không phải mục tiêu

- Không đổi app code trong lượt lập kế hoạch này.
- Không đổi SQL schema trong lượt lập kế hoạch này.
- Không có UI gửi review trong lát cắt implementation đầu tiên trừ khi Ordering MVP đã có Order completed.
- Không có công cụ chỉnh sửa Seller app.
- Không cập nhật review realtime.
- Không có sản phẩm subscription/package promotion nâng cao như "goi tiet kiem" trả phí.
- Không import review bên ngoài.

## Bằng chứng hiện trạng

### Navigation

Hiện tại:
- `app/src/main/res/navigation/nav_home.xml` định nghĩa `restaurantDetailFragment`, `restaurantInfoFragment`, `promotionsFragment` và `reviewsFragment`.
- Mỗi destination nhận `restaurant_id` với default `-1L`.
- `RestaurantDetailFragment` chỉ truyền `restaurant_id` cho reviews. Info và promotions navigate không kèm bundle.

Mục tiêu:
- Mọi navigation action từ Restaurant detail tới info/promotions/reviews đều mang `restaurant_id` đã chọn.
- Màn hình con từ chối `-1L` bằng trạng thái lỗi/empty thay vì hiển thị dữ liệu mock global.

### UI

Hiện tại:
- Các layout tồn tại:
  - `app/src/main/res/layout/fragment_restaurant_detail.xml`
  - `app/src/main/res/layout/fragment_restaurant_info.xml`
  - `app/src/main/res/layout/fragment_promotions.xml`
  - `app/src/main/res/layout/fragment_reviews.xml`
  - `app/src/main/res/layout/item_promotion.xml`
  - `app/src/main/res/layout/item_review.xml`
- Review filter tồn tại local: filter ảnh, bottom sheet chọn sao, reset, empty state.

Mục tiêu:
- Giữ cấu trúc visual hiện có và chỉ thay nguồn dữ liệu.
- Loading, error, empty và offline state phải rõ ràng cho từng màn hình.

### ViewModel / Repository / API

Hiện tại:
- `RestaurantDetailViewModel` chỉ có dữ liệu món hard-code.
- `FoodRepository` hỗ trợ categories, menus, menus by category và home RPC.
- `ApiService` chỉ hỗ trợ `restaurants` gián tiếp qua các file SQL hiện tại, chưa có endpoint Restaurant.
- `OrderRepository` hỗ trợ cart/order RPCs.
- Chưa có `RestaurantRepository`, `PromotionRepository`, `ReviewRepository` hoặc ViewModel dữ liệu thật chuyên biệt cho các màn hình này.

Mục tiêu:
- Thêm module dữ liệu Restaurant read-only với một số Retrofit endpoint hoặc RPC nhỏ.
- Ưu tiên read model trả đúng những gì UI cần để tránh nhiều join phía client.

### Backend / SQL

Hiện tại:
- `docs/sql.sql` định nghĩa:
  - `restaurants` với `name`, `description`, `phone_number`, `address_detail`, `locality`, `latitude`, `longitude`, `logo_url`, `cover_url`, `avg_rating`, `total_reviews`, `total_orders`, `is_open`.
  - `restaurant_timings`.
  - `offers` với coupon fields và active date range.
  - `orders` và `order_items`.
- `docs/rpc_home_data.sql` chỉ expose home data.
- `docs/rpc_cart_order.sql` có checkout/cart RPCs, với thiết kế chuyển tiếp nơi cart row hiện đang là line-level theo `menu_id`.
- `docs/sql.sql` được gắn nhãn dev mode không có RLS.
- Không có bảng review trong schema file.

Mục tiêu:
- Restaurant info đọc từ `restaurants` và `restaurant_timings`.
- Promotions đọc từ `offers` cộng với contract applicability cho Restaurant. Nếu schema thiếu liên kết restaurant-specific, MVP xem active offers là app-wide và đánh dấu offer riêng cho Restaurant là follow-up.
- Reviews bắt đầu với `restaurants.avg_rating` và `restaurants.total_reviews`; review row thật cần bảng hoặc read view review mới trong migration sau.

## Câu chuyện người dùng

1. Mục tiêu: Là Customer, tôi muốn Restaurant detail mở đúng màn hình thông tin Restaurant, để tin địa chỉ và giờ mở cửa trước khi đặt.
2. Mục tiêu: Là Customer, tôi muốn biết Restaurant có đang mở không, để không thêm Mon từ Restaurant đã đóng.
3. Mục tiêu: Là Customer, tôi muốn xem giờ mở cửa theo ngày, để biết khi nào có thể đặt.
4. Mục tiêu: Là Customer, tôi muốn xem promotion active cho Restaurant đã chọn hoặc checkout toàn app, để biết discount có thể dùng trước checkout.
5. Mục tiêu: Là Customer, tôi muốn promotion không khả dụng giải thích lý do không thể dùng, để checkout dễ dự đoán.
6. Mục tiêu: Là Customer, tôi muốn rating và review count của Restaurant phản ánh dữ liệu Supabase, để điểm số không giả.
7. Mục tiêu: Là Customer, tôi muốn filter review theo sao và ảnh/nội dung, để kiểm tra tín hiệu tin cậy nhanh.
8. Chuyển tiếp: Là Customer có Order completed, về sau tôi nên có thể tạo một review cho Order đó, nhưng điều này không bắt buộc cho lát cắt read-only đầu tiên.

## Nhãn hành vi

- Hiện tại: màn hình Restaurant info render layout static và có source note cho Supabase loading.
- Hiện tại: màn hình Promotions render bốn promotion mock kiểu package.
- Hiện tại: màn hình Reviews render review mock và filter local.
- Hiện tại: danh sách món Restaurant detail được hard-code bởi `RestaurantDetailViewModel`.
- Mục tiêu: Restaurant info đọc Restaurant đã chọn theo `restaurant_id`.
- Mục tiêu: Promotions đọc active offers và phân loại available/unavailable theo subtotal hiện tại khi có ngữ cảnh checkout.
- Mục tiêu: Reviews hiển thị aggregate value từ Supabase kể cả trước khi có review row thật.
- Chuyển tiếp: Review row thật có thể rỗng cho đến khi thêm bảng/view review và có Order completed.
- Chuyển tiếp: Promotion applicability có thể bắt đầu là app-wide offers vì schema hiện tại chưa cho thấy liên kết Restaurant-offer.

## Contract dữ liệu

### Read model Restaurant Info

Field mục tiêu:

- `restaurantId: long`
- `name: String`
- `description: String?`
- `phoneNumber: String?`
- `addressDetail: String?`
- `locality: String?`
- `latitude: double?`
- `longitude: double?`
- `logoUrl: String?`
- `coverUrl: String?`
- `avgRating: double`
- `totalReviews: int`
- `totalOrders: int`
- `isOpen: boolean`
- `timings: List<RestaurantTiming>`

Nguồn:
- `restaurants`
- `restaurant_timings`

### Read model Promotion

Field mục tiêu:

- `offerId: long`
- `couponCode: String`
- `offerType: discount | freeship`
- `discountType: fixed | rate`
- `discountValue: double`
- `maxDiscountAmount: double?`
- `minOrderAmount: double`
- `description: String?`
- `startDate: String`
- `endDate: String`
- `status: active | inactive`
- `availability: available | unavailable`
- `unavailableReason: String?`

Nguồn MVP:
- `offers`

Nguồn chuyển tiếp nếu cần offer riêng cho Restaurant:
- Thêm bridge tương lai như `restaurant_offers(restaurant_id, offer_id)` hoặc thêm `restaurant_id` nullable vào offers sau khi review schema.

### Read model Review Aggregate

Field mục tiêu:

- `restaurantId: long`
- `avgRating: double`
- `totalReviews: int`
- `starCounts: Map<Int, Int>`
- `photoReviewCount: int`

Nguồn MVP:
- `restaurants.avg_rating`
- `restaurants.total_reviews`

Nguồn chuyển tiếp:
- Bảng/view `reviews` hoặc `restaurant_reviews` tương lai với một review cho mỗi Order completed.

## Tiêu chí chấp nhận

- Mục tiêu: Mở info/promotions/reviews từ Restaurant được chọn trên Home/Menu dùng id của Restaurant đó, không dùng `1L`.
- Mục tiêu: Khi `restaurant_id == -1L`, màn hình hiển thị lỗi/empty state và không hiển thị mock content.
- Mục tiêu: Restaurant info render tên thật, địa chỉ, rating, review count, trạng thái mở cửa và timings từ Supabase.
- Mục tiêu: Danh sách Promotions chỉ hiển thị active offers nơi `start_date <= now <= end_date` và `status = active`.
- Mục tiêu: Promotion availability phản ánh `min_order_amount` khi có subtotal; nếu không, danh sách chỉ mang tính thông tin.
- Mục tiêu: Reviews summary hiển thị `avg_rating` và `total_reviews` thật.
- Chuyển tiếp: Review list có thể hiển thị empty state nếu chưa có review row; không được fallback sang review text giả.
- Mục tiêu: Mọi network call dùng Supabase auth/anon headers hiện có qua `SupabaseClient`.
- Mục tiêu: UI xử lý loading, empty, error và success states.
- Mục tiêu: Ordering MVP checkout vẫn là nguồn sự thật cho việc áp dụng voucher/offer discount.

## Tác động tới Ordering MVP

Tính năng này không nên chặn Ordering MVP. Nó phụ thuộc Ordering MVP ở hai điểm:

- Promotions: checkout phải re-validate offer phía server. Restaurant promotions có thể thông tin cho Customer, nhưng không được tự tính discount cuối cùng.
- Reviews: tạo review phụ thuộc vào Order completed và nên chờ đến khi Order model và Order history là dữ liệu thật. Aggregate read-only có thể ship sớm hơn.

Thứ tự implementation khuyến nghị:

1. Sửa propagation Restaurant id và read model Restaurant info.
2. Thêm read model active promotions.
3. Thêm hiển thị review aggregate.
4. Chỉ thêm review rows/submission sau khi Order completed được backing bởi Supabase.

## Chỉ số

- Tín hiệu tham khảo: số lần mở màn hình con Restaurant detail theo destination.
- Tín hiệu tham khảo: click-through từ Restaurant detail tới Promotions.
- Tín hiệu tham khảo: mức dùng review filter theo sao/ảnh.
- Release blocker: không có Restaurant info, promotions hoặc reviews mock xuất hiện khi có `restaurant_id` thật.
- Release blocker: `restaurant_id` không hợp lệ không bao giờ render dữ liệu từ Restaurant `1`.

## Rủi ro

- SQL docs hiện có xung đột với target cart model của Ordering MVP; tránh coupling tính năng này vào cart schema.
- Dev schema hiện tại không có RLS; implementation không được ship bảng public exposed khi chưa có policies.
- `offers` có thể chỉ là app-wide; copy riêng cho Restaurant không được tuyên bố độc quyền Restaurant cho đến khi schema hỗ trợ.
- Review rows cần identity và kiểm soát abuse; không thêm anonymous review writes.
- Mojibake trong comment và chuỗi source hiện có có thể làm review copy khó hơn.

## Quyết định mở

- Promotion riêng cho Restaurant trong MVP nên dùng app-wide offers hay yêu cầu bridge table?
- Review aggregate nên denormalize trong `restaurants` hay compute từ review rows khi có?
- Giờ mở cửa Restaurant nên đọc trực tiếp từ `restaurant_timings` hay qua RPC `get_restaurant_detail`?
- Reviews nên gắn với `orders.id`, `order_items.id`, hay cả hai?
