# PRD: Favorites / Yêu thích

> Label: `ready-for-agent`
> Trạng thái: nháp
> Owner: Worker 3 lập kế hoạch
> Feature gate canonical: `favorites_mvp`

## Tóm tắt điều hành

Favorites / Yêu thích cho phép Customer đã login lưu Restaurant từ các màn hình browse/detail và mở lại từ tab bottom navigation "Quán yêu thích". MVP phải persist favorites trong Supabase, đi theo Android Java + MVVM + Retrofit, và giữ đồng bộ với Ordering MVP bằng cách yêu thích Restaurant, không phải từng Mon riêng lẻ.

## Bằng chứng và hiện trạng

- `Hiện tại`: `Favorites / Yêu thíchFragment` tồn tại tại `app/src/main/java/com/example/fooddelivery/ui/favorites/Favorites / Yêu thíchFragment.java`, nhưng chỉ inflate `favorites_fragment.xml`.
- `Hiện tại`: `favorites_fragment.xml` là placeholder với `TextView` full-screen ghi "Favorites / Yêu thích".
- `Hiện tại`: `nav_favorites.xml` có `favoritesFragment`, một action tới `favFoodDetailFragment`, và một action tới `nav_auth`.
- `Hiện tại`: `bottom_nav_menu.xml` đã expose `nav_favorites` với title `@string/nav_favorites`.
- `Hiện tại`: `RestaurantDetailFragment` có icon trái tim trong `fragment_restaurant_detail.xml`, nhưng chưa có id, listener, ViewModel state, Repository hoặc persistence.
- `Hiện tại`: `MenuActivity` có boolean `isFavorite` local-only và Toast. Nó không phải luồng Navigation chính và không nên là nguồn sự thật của MVP.
- `Hiện tại`: `HomeViewModel`, `MenuViewModel`, `RestaurantDetailViewModel` và `FoodDetailViewModel` trộn Supabase call với dữ liệu mock/local.
- `Hiện tại`: tài liệu schema Supabase có `users`, `restaurants`, `menus`, `carts`, `orders`, nhưng chưa có bảng favorites.
- `Hiện tại`: `docs/sql.sql` được đánh dấu DEV MODE / NO RLS, trong khi kế hoạch Supabase phải nhắm tới dữ liệu thuộc Customer và được RLS bảo vệ.
- `Mục tiêu`: Favorites / Yêu thích persist dưới dạng Restaurant favorites thuộc Customer trong Supabase và render các Restaurant yêu thích thật trong tab Favorites / Yêu thích.

## Vấn đề

Customer có thể thấy tab Favorites / Yêu thích và icon trái tim, nhưng chưa có luồng Favorites / Yêu thích end-to-end. Hành vi trái tim hiện tại hoặc bị thiếu hoặc chỉ local-only, nên Restaurant đã lưu không tồn tại sau khi restart app, đổi thiết bị hoặc thay đổi trạng thái login. Điều này làm demo yếu đi và để lại một destination trong bottom navigation nhìn thấy rõ nhưng chưa hoàn thiện.

## Quyết định sản phẩm

Xây Favorites / Yêu thích như một danh sách Restaurant persist. Không favorite từng Mon trong MVP. Customer bật/tắt favorite một Restaurant từ Restaurant detail hoặc Restaurant card, sau đó xem Restaurant đã lưu trong tab Favorites / Yêu thích. Từ Favorites / Yêu thích, Customer mở Restaurant detail và tiếp tục Ordering MVP bằng cách thêm Mon vào Cart.

## Mục tiêu

- `Mục tiêu`: Customer đã login có thể favorite/unfavorite một Restaurant.
- `Mục tiêu`: Tab Favorites / Yêu thích liệt kê Restaurant đã lưu của Customer với ảnh, tên, rating, placeholder địa chỉ/khoảng cách, trạng thái mở cửa và hành động mở nhanh.
- `Mục tiêu`: Trạng thái favorite được tải ở mọi nơi Restaurant card/detail được hiển thị.
- `Mục tiêu`: Customer chưa đăng nhập được đưa tới Login khi cố favorite hoặc mở tab Favorites / Yêu thích mà không có session.
- `Mục tiêu`: Dữ liệu favorite tồn tại sau restart app vì Supabase là nguồn sự thật.
- `Mục tiêu`: Restaurant yêu thích tích hợp với Ordering MVP bằng navigation tới `RestaurantDetailFragment` với `restaurant_id`.

## Không phải mục tiêu

- Favorite từng Mon riêng lẻ.
- Bộ sưu tập, folder, tag, ghi chú, ghim hoặc sắp xếp thủ công.
- Giải quyết xung đột offline-first.
- Push notification cho Restaurant yêu thích.
- Analytics phía seller hoặc số lượt favorite trong Seller app.
- Ranking gợi ý.
- Migration/application SQL thật trong task lập kế hoạch này.

## Câu chuyện người dùng

1. Là Customer, tôi muốn lưu một Restaurant làm yêu thích để có thể đặt lại nhanh sau này.
2. Là Customer, tôi muốn icon trái tim phản ánh Restaurant đã được lưu hay chưa để tin trạng thái app.
3. Là Customer, tôi muốn gỡ một Restaurant khỏi yêu thích để danh sách gọn gàng.
4. Là Customer, tôi muốn Favorites / Yêu thích vẫn tồn tại sau restart app để nó hoạt động như tính năng tài khoản thật.
5. Là Customer, tôi muốn Favorites / Yêu thích yêu cầu login để dữ liệu đã lưu theo tài khoản trên nhiều thiết bị.
6. Là Customer, tôi muốn tab Favorites / Yêu thích hiển thị empty state hữu ích để biết nên làm gì tiếp theo.
7. Là Customer, tôi muốn bấm một Restaurant yêu thích để mở Restaurant detail, xem Menu và thêm Mon vào Cart.
8. Là Customer, tôi muốn trạng thái favorite cập nhật ngay sau khi bấm trái tim để UI phản hồi nhanh.
9. Là Customer, tôi muốn hành động favorite thất bại hiển thị thông báo rõ và khôi phục trạng thái để tôi không mất niềm tin.
10. Là Customer, tôi muốn Favorites / Yêu thích không can thiệp vào Cart hoặc Checkout để các luồng Ordering MVP hiện có vẫn ổn định.

## Yêu cầu

### Xác thực

- `Mục tiêu`: Nếu Customer chưa login và bấm trái tim favorite, navigate tới Login qua Navigation graph hiện tại.
- `Mục tiêu`: Nếu Customer mở tab Favorites / Yêu thích khi đã logout, hiển thị trạng thái yêu cầu login với CTA tới Login.
- `Mục tiêu`: Repository không được tin `user_id` do client gửi; Supabase nên suy ra Customer từ `auth.uid()` hoặc JWT đã xác thực.

### Mô hình dữ liệu

- `Mục tiêu`: Thêm contract lập kế hoạch cho bảng `customer_favorite_restaurants`.
- `Mục tiêu`: Columns: `id`, `customer_id` hoặc `user_id`, `restaurant_id`, `created_at`.
- `Mục tiêu`: Unique constraint: một row cho mỗi cặp Customer và Restaurant.
- `Mục tiêu`: RLS: Customer chỉ có thể select/insert/delete các row favorite của chính mình.
- `Mục tiêu`: Indexes: `(user_id, created_at desc)`, unique `(user_id, restaurant_id)`, và FK index trên `restaurant_id`.
- `Chuyển tiếp`: Bảng `restaurants` hiện có vẫn là nguồn Restaurant. Nếu seed data có `menus.restaurant_id` null, các team Ordering/Restaurant phải sửa seed data trước khi Favorites / Yêu thích có thể demo đầy đủ.

### API / Repository

- `Mục tiêu`: Tạo `FavoriteRepository` bọc Retrofit calls.
- `Mục tiêu`: Tạo model `FavoriteRestaurant` cho row danh sách join với các field hiển thị Restaurant.
- `Mục tiêu`: API calls phải hỗ trợ: list favorites, lấy trạng thái favorite theo Restaurant, thêm favorite, xóa favorite.
- `Mục tiêu`: Ưu tiên REST table calls cho MVP. RPC chỉ nên dùng nếu shape join quá khó cho Retrofit/Gson.
- `Mục tiêu`: Trả về các trạng thái xác định: loading, data, empty, auth required, error.

### ViewModel

- `Mục tiêu`: Tạo `Favorites / Yêu thíchViewModel` cho tab Favorites / Yêu thích.
- `Mục tiêu`: Thêm method trạng thái favorite vào Restaurant detail và card ViewModels thông qua `FavoriteRepository`.
- `Mục tiêu`: ViewModel sở hữu logic toggle, rollback optimistic update và message.
- `Mục tiêu`: Fragment chỉ bind UI, observe LiveData, hiển thị Toast/snackbar và navigate.

### UI

- `Mục tiêu`: Thay màn hình placeholder Favorites / Yêu thích bằng danh sách RecyclerView.
- `Mục tiêu`: Nội dung favorite card: ảnh cover/logo, tên Restaurant, địa chỉ/locality, rating, nhãn mở/đóng cửa và trái tim để gỡ.
- `Mục tiêu`: Empty state copy: "Chưa có quán yêu thích" và CTA để browse Home.
- `Mục tiêu`: Login state copy: "Đăng nhập để xem quán yêu thích" và CTA tới Login.
- `Mục tiêu`: Loading state dùng ProgressBar/SwipeRefresh hiện có khi phù hợp.
- `Mục tiêu`: Error state có retry.
- `Mục tiêu`: Icon trái tim dùng `ic_favorite` khi active và `ic_heart_outline` hoặc `ic_favorite_border` khi inactive.

### Navigation

- `Mục tiêu`: Bấm favorite card navigate tới `RestaurantDetailFragment` hoặc destination restaurant detail scoped cho favorites với `restaurant_id`.
- `Chuyển tiếp`: `nav_favorites.xml` hiện trỏ Favorites / Yêu thích tới `FoodDetailFragment`; implementation nên đổi action sang Restaurant detail cho MVP.
- `Mục tiêu`: Action Login tiếp tục dùng `action_favorites_to_login`.

### Tác động tới Ordering MVP

- `Mục tiêu`: Favorites / Yêu thích chỉ là shortcut discovery; không được tạo Cart row hoặc Order row.
- `Mục tiêu`: Luồng Favorites / Yêu thích -> Restaurant detail -> add Mon to Cart phải dùng contract Cart theo từng Restaurant của Ordering MVP.
- `Mục tiêu`: Favorites / Yêu thích không phụ thuộc vào `LocalCart` hoặc `LocalOrderStore`.
- `Chuyển tiếp`: Cho đến khi Ordering MVP thay thế local Cart, Favorites / Yêu thích có thể navigate tới Restaurant detail hiện có, còn hành vi add-to-cart vẫn thuộc Ordering.

## Tiêu chí chấp nhận

- Given Customer đã login chưa có favorite, khi mở tab Favorites / Yêu thích, then empty state được hiển thị.
- Given Customer đã login bấm trái tim inactive trên một Restaurant, khi API thành công, then trái tim active và row xuất hiện trong tab Favorites / Yêu thích.
- Given Customer đã login bấm trái tim active, khi API thành công, then trái tim inactive và row biến mất khỏi tab Favorites / Yêu thích.
- Given Customer đã logout, khi bấm trái tim, then app navigate tới Login và không tạo favorite giả local.
- Given Customer đã logout, khi mở tab Favorites / Yêu thích, then trạng thái yêu cầu login xuất hiện.
- Given network failure khi thêm, then trái tim quay lại trạng thái inactive trước đó và hiển thị thông báo lỗi.
- Given network failure khi xóa, then trái tim quay lại trạng thái active trước đó và hiển thị thông báo lỗi.
- Given một Restaurant yêu thích được bấm, then Restaurant detail mở với cùng `restaurant_id`.
- Given app restart sau khi favorite, then tab Favorites / Yêu thích tải lại Restaurant đã lưu từ Supabase.
- Given add favorite trùng được retry, then unique constraint/upsert ngăn row trùng trong danh sách.

## Chỉ số

- `Release blocker`: Customer đã login có thể thêm, thấy, xóa và thấy lại Restaurant yêu thích đã persist sau restart trong demo thủ công.
- `Release blocker`: Hành động favorite khi logged-out không bao giờ ghi dữ liệu.
- `Tín hiệu tham khảo`: Tab Favorites / Yêu thích tải xong dưới 2 giây với dữ liệu demo đã seed.
- `Tín hiệu tham khảo`: Không có Restaurant card trùng sau nhiều lần bấm trái tim liên tiếp.

## Phụ thuộc

- Auth session từ `SessionManager` và Supabase JWT.
- Dữ liệu Restaurant trong `restaurants`.
- Route Restaurant detail với `restaurant_id`.
- Pattern Retrofit/Gson API trong `ApiService`.
- Glide cho ảnh Restaurant.
- Contract Restaurant và Cart của Ordering MVP.

## Rủi ro

- Seed data hiện tại có thể chưa cung cấp Restaurant nhất quán cho mọi row Menu.
- SQL DEV hiện tại không có RLS; implementation không được copy tư thế bảo mật đó vào production.
- Code hiện có có chuỗi mojibake và dữ liệu mock/live lẫn lộn, dễ gây nhầm khi QA.
- `nav_favorites.xml` hiện ưu tiên Food detail, trong khi quyết định sản phẩm ưu tiên Restaurant.
- Bấm nhanh liên tục có thể gây race UI nếu toggle call không bị disable hoặc debounce trong khi request đang chạy.

## Câu hỏi mở

Xem `docs/planning/questions/2026-06-28-favorites-questions.md`.

## Bàn giao implementation

Xem `docs/superpowers/plans/2026-06-28-favorites.md`.
