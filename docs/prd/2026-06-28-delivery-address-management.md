# PRD: Quản lý DeliveryAddress

> Label: `ready-for-agent`
> Trạng thái: tài liệu lập kế hoạch nháp
> Ngày: 2026-06-28
> Worker: Worker 4

## Tóm tắt điều hành

Xây dựng đầy đủ quản lý DeliveryAddress cho Customer app để Customer có thể tạo, xem, sửa, xóa, đặt mặc định và chọn một DeliveryAddress đã lưu trong checkout.

Hành vi canonical:
- Hiện tại: `CONTEXT.md` định nghĩa DeliveryAddress là địa chỉ giao hàng đã lưu thuộc Customer, có label, tên người nhận, số điện thoại người nhận, địa chỉ đầy đủ, tọa độ GPS và `isDefault`.
- Hiện tại: Profile có `AddressListFragment`, `AddressAdapter`, `AddressItem`, `fragment_address_list.xml` và `item_address.xml`, nhưng đang dùng dữ liệu giả, không có repository, không có ViewModel, và các luồng thêm/chọn chỉ là Toast.
- Hiện tại: bản nháp schema Supabase `docs/sql.sql` có `user_addresses` với `user_id`, `label`, `address_detail`, `latitude`, `longitude`, `is_default` và `deleted_at`, nhưng thiếu trường người nhận và chưa có Android API/repository đang hoạt động cho CRUD địa chỉ.
- Hiện tại: Checkout có hai đường cạnh tranh: `Checkout.java` dùng `LocalCart` và `LocalOrderStore`, trong khi `CheckoutViewModel` gọi Supabase `checkout_cart(p_delivery_address TEXT, p_note TEXT)` với địa chỉ dạng text tự do.
- Mục tiêu: DeliveryAddress trở thành dependency MVP hạng nhất cho checkout trong Ordering MVP, với đúng một mặc định cho mỗi Customer và các trường snapshot trong order.

## Vấn đề

Customer chưa thể quản lý địa chỉ giao hàng thật. App hiển thị danh sách địa chỉ trong profile, nhưng các bản ghi đó bị hard-code, không thể persist, chọn, sửa, xóa hoặc dùng an toàn trong checkout.

Ordering MVP phụ thuộc vào DeliveryAddress vì checkout phải tạo Order với snapshot địa chỉ ổn định. Nếu thiếu tính năng này, checkout vẫn chỉ là luồng demo/local hoặc lưu địa chỉ mutable/free-text, không đáp ứng yêu cầu audit, hỗ trợ và bảo mật.

## Mục tiêu

- Mục tiêu: Customer có thể liệt kê DeliveryAddress đã lưu từ Supabase.
- Mục tiêu: Customer có thể tạo DeliveryAddress với `label`, `recipientName`, `recipientPhone`, `fullAddress`, `latitude` tùy chọn, `longitude` tùy chọn và `isDefault`.
- Mục tiêu: Customer có thể sửa, xóa và đặt mặc định DeliveryAddress.
- Mục tiêu: Với mỗi Customer, tối đa một DeliveryAddress chưa xóa là mặc định.
- Mục tiêu: Checkout chọn sẵn DeliveryAddress mặc định khi có.
- Mục tiêu: Customer có thể chọn DeliveryAddress đã lưu khác trong checkout.
- Mục tiêu: Checkout chặn đặt Order cho đến khi có DeliveryAddress hợp lệ được chọn.
- Mục tiêu: Việc tạo Order snapshot các trường người nhận/địa chỉ để sửa địa chỉ về sau không làm thay đổi Order lịch sử.
- Mục tiêu: RLS/quy tắc sở hữu Supabase ngăn truy cập IDOR/BOLA vào DeliveryAddress của Customer khác.

## Không phải mục tiêu

- Mục tiêu: Không có map picker đầy đủ trong MVP.
- Mục tiêu: Không có provider geocoding/autocomplete trong MVP.
- Mục tiêu: Không tính phí giao hàng theo khoảng cách GPS trong MVP.
- Mục tiêu: Không có sổ địa chỉ dùng chung gia đình/nhóm.
- Mục tiêu: Không cho seller/driver sửa địa chỉ.
- Mục tiêu: Không chạy migration trong task lập kế hoạch này.

## Người dùng, công việc và thành công

| User/Role | Công việc cần làm | Cách né hiện tại | Thành công mục tiêu |
|---|---|---|---|
| Customer | Lưu địa điểm giao hàng dùng lại | Chỉ có danh sách địa chỉ giả | Bản ghi đã lưu tải từ Supabase |
| Customer | Chọn địa điểm giao hàng khi checkout | Checkout dùng bàn hard-code/free-text local demo | Địa chỉ mặc định được chọn sẵn và có thể đổi |
| Customer | Quản lý thông tin người nhận | `AddressItem.userInfo` là một chuỗi hiển thị | Tên và số điện thoại người nhận được lưu riêng |
| Support/audit | Hiểu Order được giao đến đâu | Order chỉ lưu `delivery_address` mutable/free-text | Order lưu snapshot DeliveryAddress bất biến |

## Kiểm kê hiện trạng

### UI

- Hiện tại: `app/src/main/java/com/example/fooddelivery/ui/profile/AddressListFragment.java` inflate danh sách địa chỉ và seed hai bản ghi `AddressItem` giả.
- Hiện tại: click handler của `AddressListFragment` chỉ hiển thị Toast và có `TODO: Select address and go back`.
- Hiện tại: nút thêm địa chỉ hiển thị Toast "feature is being updated".
- Hiện tại: `fragment_address_list.xml` đã có cấu trúc search/current-location/list/add-button.
- Hiện tại: `item_address.xml` đã render label, tag mặc định, chi tiết và thông tin user.
- Hiện tại: chưa thấy wiring Java rõ ràng trong `ProfileFragment` để navigate tới `action_profile_to_addressList`.
- Hiện tại: `HomeFragment` chỉ có code click địa chỉ bị comment.
- Hiện tại: `cart_activity_checkout.xml` hiển thị copy kiểu "Ban so 5 tang 2" cho bàn/vị trí, không phải các trường DeliveryAddress.

### Navigation

- Hiện tại: `nav_profile.xml` có `addressListFragment` và `action_profile_to_addressList`.
- Hiện tại: `nav_ordes.xml` chỉ chứa order management/detail/review.
- Chuyển tiếp: Checkout vẫn là Activity (`Checkout.java`) được start bằng Intent từ Home/Order flows, chưa phải Navigation Fragment.
- Mục tiêu: quản lý địa chỉ vẫn nằm dưới Profile và cũng có thể được mở từ Checkout như một luồng chọn địa chỉ.

### ViewModel / Repository / API

- Hiện tại: chưa có `DeliveryAddressViewModel`.
- Hiện tại: chưa có `DeliveryAddressRepository`.
- Hiện tại: `ApiService` expose users, menus, cart/order RPC, storage upload, nhưng chưa có endpoint địa chỉ.
- Hiện tại: `CheckoutViewModel.checkout(String address, String note)` truyền địa chỉ free-text vào `CheckoutRequest`.
- Mục tiêu: CRUD địa chỉ đi qua Repository -> Supabase REST/RPC.
- Mục tiêu: Checkout truyền `deliveryAddressId` hoặc một contract snapshot DeliveryAddress đã chọn và đã validate cho backend.

### Dữ liệu / Backend

- Hiện tại: `docs/sql.sql` có `user_addresses`, nhưng thiếu tên/số điện thoại người nhận.
- Hiện tại: `orders` có một trường `delivery_address TEXT`.
- Hiện tại: `docs/rpc_cart_order.sql` có `checkout_cart(p_delivery_address TEXT, p_note TEXT)` và insert text đó vào `orders.delivery_address`.
- Hiện tại: comment trong `docs/sql.sql` nói "NO RLS - DEV MODE"; `fix_profile_data.sql` chỉ bật RLS cho `users`.
- Mục tiêu: DeliveryAddress thuộc Customer và được RLS bảo vệ.
- Mục tiêu: Checkout validate quyền sở hữu địa chỉ đã chọn ở server trước khi tạo Order.

## Yêu cầu chức năng

- FR1 Mục tiêu: hiển thị DeliveryAddress đã lưu trong Profile bằng dữ liệu backend, sắp xếp mặc định trước rồi theo cập nhật gần đây.
- FR2 Mục tiêu: empty state cho biết chưa có địa chỉ đã lưu và cung cấp hành động thêm.
- FR3 Mục tiêu: form thêm yêu cầu `recipientName`, `recipientPhone`, `fullAddress`; `label` mặc định là "Nhà" hoặc "Khác" nhưng có thể tùy chỉnh.
- FR4 Mục tiêu: validation số điện thoại chấp nhận định dạng điện thoại Việt Nam MVP nhất quán với auth/profile.
- FR5 Mục tiêu: form sửa tải DeliveryAddress hiện có thuộc Customer hiện tại và chỉ cập nhật các field được phép.
- FR6 Mục tiêu: xóa mềm khi schema hỗ trợ (`deleted_at`) và loại item khỏi danh sách.
- FR7 Mục tiêu: đặt một địa chỉ làm mặc định sẽ xóa mặc định khỏi mọi địa chỉ chưa xóa khác của cùng Customer một cách atomic.
- FR8 Mục tiêu: nếu Customer tạo DeliveryAddress đầu tiên, địa chỉ đó tự động thành mặc định.
- FR9 Mục tiêu: Checkout tải DeliveryAddress mặc định của Customer và hiển thị tên người nhận, số điện thoại, label và địa chỉ đầy đủ.
- FR10 Mục tiêu: Checkout cho Customer mở danh sách địa chỉ ở chế độ chọn và trả DeliveryAddress đã chọn về checkout.
- FR11 Mục tiêu: CTA checkout bị disable với lỗi inline rõ ràng cho đến khi chọn DeliveryAddress.
- FR12 Mục tiêu: tạo Order lưu snapshot: `delivery_address_id`, `recipient_name_snapshot`, `recipient_phone_snapshot`, `full_address_snapshot`, `latitude_snapshot`, `longitude_snapshot`.
- FR13 Chuyển tiếp: nếu backend hiện tại vẫn chỉ nhận `p_delivery_address TEXT`, adapter tạm thời có thể serialize DeliveryAddress đã chọn thành text hiển thị, nhưng phải đánh dấu là tạm thời và gỡ khi checkout RPC hỗ trợ `deliveryAddressId`/snapshots.
- FR14 Mục tiêu: `AddressItem` giả local chỉ được phép tồn tại trong tests/fakes, không dùng trong runtime production.

## Yêu cầu phi chức năng

- Mục tiêu bảo mật: Supabase Data API không được lộ DeliveryAddress giữa các Customer.
- Mục tiêu bảo mật: RLS policy phải kiểm tra quyền sở hữu Customer, không chỉ dùng `TO authenticated`.
- Mục tiêu bảo mật: UPDATE policy phải có cả `USING` và `WITH CHECK` để Customer không thể đổi `user_id`.
- Mục tiêu bảo mật: mọi RPC `SECURITY DEFINER` cho set-default/checkout phải kiểm tra `auth.uid()` -> `users.id`, validate ownership, revoke `PUBLIC`, và chỉ grant cho `authenticated`.
- Mục tiêu quyền riêng tư: analytics không được log địa chỉ đầy đủ, số điện thoại người nhận, latitude hoặc longitude.
- Mục tiêu độ tin cậy: đổi mặc định và validation địa chỉ checkout phải atomic ở backend.
- Mục tiêu hiệu năng: danh sách địa chỉ MVP nên tải trong một request cho một Customer; không có N+1 dependent calls.
- Mục tiêu accessibility: item địa chỉ và control sửa/xóa/mặc định có label dễ đọc, và trạng thái mặc định không chỉ dựa vào màu.

## Contract dữ liệu

Tên model mục tiêu: `DeliveryAddress`.

Field mục tiêu:
- `id: long`
- `customerId/userId: long`
- `label: String`
- `recipientName: String`
- `recipientPhone: String`
- `fullAddress: String`
- `latitude: Double?`
- `longitude: Double?`
- `isDefault: boolean`
- `createdAt: String?`
- `updatedAt: String?`
- `deletedAt: String?`

Mapping chuyển tiếp từ schema hiện tại:
- `user_addresses.address_detail` map sang `fullAddress`.
- `AddressItem.detail` hiện có map sang `fullAddress`.
- `AddressItem.userInfo` hiện có phải được tách thành `recipientName` và `recipientPhone`; không giữ nó làm storage canonical.
- `orders.delivery_address TEXT` hiện tại có thể được populate từ `fullAddress` chỉ trong giai đoạn chuyển tiếp.

## Tiêu chí chấp nhận

- [ ] Màn hình địa chỉ Profile không còn hiển thị địa chỉ giả hard-code trong production flow.
- [ ] Customer đã login có thể tạo DeliveryAddress và thấy nó vẫn tồn tại sau khi restart app.
- [ ] Customer đã login có thể sửa label, tên người nhận, số điện thoại người nhận và địa chỉ đầy đủ.
- [ ] Customer đã login có thể xóa DeliveryAddress và nó biến mất khỏi danh sách có thể chọn.
- [ ] DeliveryAddress đầu tiên được tạo sẽ thành mặc định.
- [ ] Đặt địa chỉ mặc định mới để lại đúng một DeliveryAddress mặc định cho Customer.
- [ ] Checkout chọn sẵn DeliveryAddress mặc định.
- [ ] Checkout chặn đặt Order khi chưa chọn DeliveryAddress.
- [ ] Order tạo từ checkout snapshot dữ liệu DeliveryAddress tại thời điểm đặt.
- [ ] Sửa DeliveryAddress sau checkout không làm thay đổi chi tiết giao hàng của Order lịch sử.
- [ ] Test bảo mật RLS/thủ công không thể đọc/update/delete DeliveryAddress của Customer khác.

## Tác động tới Ordering MVP

- DeliveryAddress là blocker cho checkout thật vì các story 10-12 trong `docs/prd-ordering-mvp.md` yêu cầu chọn/thêm DeliveryAddress và lưu thông tin người nhận.
- Tính năng địa chỉ nên được triển khai trước khi hoàn thiện checkout RPC vì checkout cần validation quyền sở hữu địa chỉ và snapshot.
- Nếu worker cart/order hoàn tất trước, họ nên expose một điểm tích hợp trong `CheckoutViewModel` cho DeliveryAddress đã chọn và tránh hard-code text address.
- Kế hoạch DeliveryAddress không được rework nhóm Cart; nó nên tích hợp với luồng Cart theo từng Restaurant canonical khi luồng đó hoàn tất.

## Rủi ro

- Schema hiện có `user_addresses` nhưng thiếu tên/số điện thoại người nhận; implementation cần migration hoặc field/table chuyển tiếp.
- Checkout Activity hiện tại bypass `CheckoutViewModel`, nên tích hợp địa chỉ có thể bị mất nếu checkout không được migrate sang Fragment/MVVM hoặc Activity không được wiring rõ ràng.
- Các RPC `SECURITY DEFINER` đã tồn tại cho cart/order; nếu thiếu kiểm tra sở hữu và grant rõ ràng, chúng có thể bypass RLS.
- Mojibake/encoding hiện có trong file có thể làm thay đổi copy UI bị nhiễu; implementation nên giữ hành vi và chỉ dọn copy được chạm tới.

## Chỉ số thành công

- Release blocker: 100% checkout attempt yêu cầu DeliveryAddress đã chọn trước khi tạo Order.
- Release blocker: 0 truy cập DeliveryAddress xuyên Customer trong test RLS thủ công.
- Release blocker: 100% Order tạo qua checkout MVP có các field snapshot địa chỉ hoặc tương đương chuyển tiếp đã ghi rõ.
- Tín hiệu tham khảo: ít nhất 80% Customer có một địa chỉ đã lưu có địa chỉ mặc định sau các luồng CRUD.
- Tín hiệu tham khảo: QA thủ công happy path Address CRUD hoàn tất dưới 3 phút trên emulator.

## Câu hỏi mở

- Bảng backend canonical nên đổi tên thành `delivery_addresses` hay MVP nên mở rộng `user_addresses` hiện có?
- Checkout nên truyền `deliveryAddressId` vào RPC và để DB snapshot field, hay client nên gửi một snapshot bất biến đầy đủ?
- Quy tắc validation số điện thoại Việt Nam chính xác cho app này là gì?
- MVP có yêu cầu tọa độ GPS cho nhập địa chỉ thủ công không, hay có thể nullable cho đến khi map/geocoding hoàn tất?
- Khi xóa địa chỉ mặc định, có nên tự động promote địa chỉ khác hay để không có mặc định?
