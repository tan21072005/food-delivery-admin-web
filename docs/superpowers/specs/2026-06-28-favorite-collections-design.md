# Thiết kế bộ sưu tập Restaurant yêu thích

## Mục tiêu

Xây dựng luồng “Góc khoái khẩu” trong tab yêu thích. Customer có thể tạo FavoriteCollection, thêm Restaurant được gợi ý từ lịch sử Order đã hoàn thành và xem lại dữ liệu sau khi chuyển màn hình hoặc khởi động lại ứng dụng. Giai đoạn này dùng repository cục bộ, không gọi Supabase hay API.

## Phạm vi

- Màn danh sách bộ sưu tập theo dạng lưới hai cột.
- Màn nhập hoặc chọn tên bộ sưu tập.
- Màn chọn Restaurant được suy ra từ lịch sử Order `completed`.
- Mở lại bộ sưu tập đã tạo để xem và chỉnh sửa lựa chọn.
- Đổi tên và xóa bộ sưu tập với xác nhận.
- Lưu bền vững bộ sưu tập sau khi tắt ứng dụng.
- Điều hướng tiến, lùi và trạng thái nút bám theo dữ liệu hiện tại.
- Chống thao tác lặp, hỗ trợ accessibility và phục hồi an toàn khi dữ liệu local hỏng.

Không bao gồm đồng bộ tài khoản, tải dữ liệu mạng, tìm kiếm Restaurant, chia sẻ collection công khai hoặc tích hợp Supabase.

## Kiến trúc

Tính năng nằm trong `ui/favorites` và tuân theo cấu trúc Java/XML hiện có:

- `FavoritesFragment`: màn “Góc khoái khẩu”.
- `CollectionNameFragment`: nhập hoặc chọn tên.
- `CollectionRestaurantsFragment`: thêm/bỏ Restaurant và hoàn thành.
- `FavoriteCollectionAdapter`: hiển thị lưới bộ sưu tập.
- `RestaurantSuggestionAdapter`: hiển thị các Restaurant được gợi ý từ lịch sử Order.
- `FavoriteCollection`, `RestaurantSuggestion`: mô hình dữ liệu cục bộ.
- `FavoriteCollectionStore`: lớp duy nhất đọc/ghi `SharedPreferences`, tuần tự hóa JSON bằng Gson.
- `FavoriteCollectionDraftViewModel`: giữ bản nháp xuyên suốt hai màn hình tạo/chỉnh sửa và qua thay đổi cấu hình.
- `OrderHistoryRepository`: contract đọc lịch sử Order; implementation giai đoạn này persist local bằng `SharedPreferences`.
- `RestaurantSuggestionService`: lọc Order `completed`, nhóm theo `restaurantId` và xếp hạng Restaurant.

Navigation Component chịu trách nhiệm chuyển màn hình. ID bộ sưu tập được truyền bằng argument khi chỉnh sửa; dữ liệu đầy đủ được đọc từ store thay vì truyền object lớn trong Bundle.

`Order` bổ sung `restaurantId` và `completedAt`. UI Favorites chỉ phụ thuộc vào `OrderHistoryRepository`, không đọc trực tiếp `LocalOrderStore`; khi có backend, implementation Supabase có thể thay repository local mà không đổi Fragment hoặc adapter.

## Luồng giao diện

### Góc khoái khẩu

- Tiêu đề lớn “Góc khoái khẩu”.
- RecyclerView dạng lưới hai cột hiển thị ảnh đại diện, tên rút gọn và số Restaurant.
- Một ô viền xanh nhạt “+ Thêm bộ sưu tập mới” luôn nằm cuối danh sách.
- Nhấn ô thêm mới mở màn nhập tên với bản nháp rỗng.
- Nhấn bộ sưu tập hiện có mở màn chọn Restaurant để xem/chỉnh sửa trực tiếp.
- Menu `⋮` trên collection cho phép đổi tên hoặc xóa; xóa luôn yêu cầu xác nhận.
- Bottom navigation vẫn hiển thị tại màn này.

### Thêm bộ sưu tập mới

- Thanh đầu trang có nút quay lại và tiêu đề.
- Ô nhập tên có nút xóa khi đã có nội dung.
- Các chip gợi ý điền tên vào ô nhập; Customer vẫn có thể sửa tự do.
- Nút “Quán yêu thích” bị vô hiệu hóa khi tên chỉ chứa khoảng trắng và được bật khi tên hợp lệ.
- Tên sau khi trim dài từ 1 đến 60 ký tự; giao diện hiển thị lỗi rõ ràng nếu vượt giới hạn.
- Nhấn nút tiếp tục chuyển sang màn chọn Restaurant, giữ nguyên tên trong bản nháp.

### Thêm Restaurant vào bộ sưu tập

- Thanh đầu trang có nút quay lại và tiêu đề.
- Khối chú thích về danh sách gợi ý.
- Danh sách Restaurant được suy ra từ Order `completed`, gồm ảnh local, tên, đánh giá, lượt bán và khoảng cách.
- Mỗi dòng có trạng thái “Thêm vào bộ sưu tập” hoặc “Đã thêm vào bộ sưu tập”. Nhấn vào hành động sẽ chuyển đổi trạng thái ngay lập tức.
- Nút “Hoàn thành” lưu mới hoặc cập nhật bộ sưu tập, sau đó quay về “Góc khoái khẩu”.
- Trong lúc lưu, nút “Hoàn thành” bị vô hiệu hóa để không tạo thao tác lặp.
- Khi quay lại màn nhập tên rồi trở lại, các lựa chọn Restaurant trong bản nháp không bị mất.
- Bottom navigation bị ẩn ở hai màn hình tạo/chỉnh sửa.

## Dữ liệu và lưu trữ

`FavoriteCollection` gồm ID ổn định, tên và danh sách ID Restaurant. `RestaurantSuggestion` là projection hiển thị được tạo từ Restaurant và thống kê Order đã hoàn thành; mỗi phần tử có ID, nội dung hiển thị, ảnh, số lần đặt và thời điểm hoàn thành gần nhất.

Tên FavoriteCollection được phép trùng; ID là định danh duy nhất. Một Restaurant có thể thuộc nhiều FavoriteCollection. Membership của FavoriteCollection độc lập với trạng thái trái tim FavoriteRestaurant: thêm hoặc bỏ Restaurant khỏi collection không tự động bật/tắt trái tim.

`FavoriteCollectionStore` lưu danh sách bộ sưu tập thành JSON trong một file `SharedPreferences` riêng. Việc lưu chỉ xảy ra khi Customer nhấn “Hoàn thành”. Bản nháp chưa hoàn thành được giữ trong `FavoriteCollectionDraftViewModel`, vì vậy không tạo dữ liệu rác sau khi Customer hủy luồng.

Khi JSON trống hoặc không đọc được, store trả về danh sách mặc định an toàn thay vì làm ứng dụng crash. Tên được trim trước khi lưu; ID mới được tạo cục bộ và không phụ thuộc máy chủ.

Store dùng một khóa version cho JSON local. Dữ liệu chưa có version được đọc như version đầu tiên; version không được hỗ trợ hoặc JSON hỏng được cô lập và trả về trạng thái trống an toàn, không ghi đè dữ liệu hỏng cho tới khi Customer thực hiện thao tác lưu mới.

### Gợi ý từ lịch sử Order

Chỉ Order có trạng thái `completed` được tính. Mỗi Restaurant xuất hiện tối đa một lần. Restaurant được xếp theo số Order `completed` giảm dần; nếu bằng nhau, Restaurant có `completedAt` mới nhất đứng trước. Order `pending`, `confirmed`, `preparing`, `delivering` và `cancelled` không ảnh hưởng gợi ý.

Nếu Customer chưa có Order `completed`, màn chọn Restaurant hiển thị “Bạn chưa có quán từng đặt” và CTA về Trang chủ. Hệ thống không chèn gợi ý giả hoặc Restaurant phổ biến vì chúng không xuất phát từ lịch sử của Customer.

## Trạng thái mặc định

Lần chạy đầu hiển thị ô hệ thống “Yêu thích” đại diện cho các FavoriteRestaurant đã đánh dấu bằng trái tim và ô thêm mới. “Yêu thích” không phải FavoriteCollection do Customer tạo. Những FavoriteCollection Customer tạo sau đó được thêm vào lưới. Ảnh bìa dùng ảnh của tối đa ba Restaurant đầu tiên; collection trống dùng ảnh placeholder local.

## Thiết kế hình ảnh

- Nền trắng, chữ gần đen và màu nhấn cyan/teal đồng bộ ảnh tham chiếu.
- Góc bo lớn cho ô nhập, nút và thẻ; khoảng trắng rộng, ưu tiên khả năng đọc trên màn hình nhỏ.
- Typography dùng font hệ thống với phân cấp đậm rõ ràng để không thêm dependency font.
- Dấu hiệu nhận diện là ảnh bìa dạng ghép từ Restaurant đã chọn, giúp mỗi bộ sưu tập phản ánh đúng nội dung thay vì dùng ảnh trang trí cố định.
- Các trạng thái disabled, selected và focus có độ tương phản rõ ràng; vùng chạm tối thiểu 48dp.
- Icon chỉ dùng hình ảnh phải có content description; hàng Restaurant và collection phải hỗ trợ focus, selected state và TalkBack action có nghĩa.
- Danh sách giữ vị trí cuộn khi xoay màn hình; bản nháp được giữ bằng ViewModel và trạng thái cần thiết được phục hồi sau process recreation.

## Xử lý lỗi và trường hợp biên

- Không cho tiếp tục với tên rỗng hoặc toàn khoảng trắng.
- Không cho lưu tên dài quá 60 ký tự; thông báo không làm mất nội dung đã nhập.
- Không thêm trùng cùng một Restaurant vào một bộ sưu tập.
- Cho phép nhiều bộ sưu tập có cùng tên.
- Bộ sưu tập được phép có 0 Restaurant và hiển thị placeholder cùng nhãn “0 quán”.
- Xóa bộ sưu tập chỉ xảy ra sau khi Customer xác nhận; thao tác không xóa Restaurant hoặc Order.
- Nếu bộ sưu tập cần chỉnh sửa không còn tồn tại, màn hình quay về danh sách thay vì crash.
- Nếu dữ liệu lưu cục bộ bị hỏng, ứng dụng phục hồi về trạng thái mặc định.
- Nút lưu, đổi tên và xóa được chống bấm lặp; mỗi thao tác thành công chỉ cập nhật store một lần.
- Lỗi đọc/ghi local hiển thị thông báo có hành động thử lại khi thao tác của Customer chưa được lưu.

## Kiểm thử và xác minh

- Unit test cho store: lưu/đọc, cập nhật, dữ liệu lỗi và chống trùng ID Restaurant.
- Unit test cho quy tắc hợp lệ của tên và trạng thái bản nháp.
- Unit test giới hạn 60 ký tự và chống thao tác lưu lặp.
- Unit test cho bộ lọc trạng thái Order, khử trùng Restaurant và quy tắc xếp hạng tần suất/độ mới.
- Build debug để phát hiện lỗi resource/navigation.
- Kiểm tra thủ công: tạo bộ sưu tập, back/forward, chỉnh sửa lựa chọn, đổi tab, xoay màn hình và tắt/mở lại ứng dụng.
- Kiểm tra TalkBack/content description, vùng chạm 48dp, process recreation và JSON local hỏng.

## Tiêu chí hoàn thành

- Ba màn hình bám sát bố cục và trạng thái trong ảnh tham chiếu.
- Mọi nút/icon liên quan chuyển đúng màn hình.
- Tên và lựa chọn Restaurant không mất khi chuyển qua lại trong luồng.
- Bộ sưu tập đã hoàn thành vẫn tồn tại sau khi tắt/mở ứng dụng.
- Gợi ý chỉ gồm Restaurant từ Order `completed` và đúng thứ tự đã định nghĩa.
- Không có lời gọi Supabase hoặc phụ thuộc mạng trong tính năng.
- Dự án build debug thành công và các kiểm thử liên quan chạy đạt.

## Quan hệ với PRD Favorites đã nhập

`docs/prd/2026-06-28-favorites.md` mô tả FavoriteRestaurant dạng trái tim và loại FavoriteCollection khỏi MVP. Đặc tả này bổ sung một capability riêng là FavoriteCollection; nó không thay thế trạng thái trái tim. Các yêu cầu Supabase trong PRD cũ là hướng backend tương lai, còn implementation hiện tại dùng repository cục bộ. Khi triển khai backend, hai capability dùng model và persistence riêng nhưng có thể cùng hiển thị trong “Góc khoái khẩu”.
