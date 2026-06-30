# Kế hoạch triển khai Dữ liệu mẫu (Seed Data) & Quản lý File (Supabase Storage)

Dưới đây là kế hoạch để bơm dữ liệu vào hệ thống và xây dựng tính năng upload ảnh đại diện cho người dùng (một tính năng cực tốt để show cho thầy cô).

## 1. Bơm dữ liệu mẫu (Seed Data)
Hiện tại code gọi API đã chuẩn bị xong, nhưng Database trống. Mình sẽ tạo một file SQL tên `docs/seed_data.sql` chứa các lệnh `INSERT` để tạo nhanh dữ liệu:
- **Bảng `categories`**: Tạo khoảng 4-5 danh mục (Burger, Pizza, Đồ uống, ...).
- **Bảng `menus`**: Tạo khoảng 10 món ăn, thuộc các danh mục trên. Các món ăn này sẽ dùng các URL ảnh giả lập tạm thời hoặc ảnh thật (trên mạng) để test giao diện.

## 2. Triển khai Supabase Storage (Upload Ảnh đại diện)

Thay vì chỉ làm file SQL, mình sẽ làm trọn vẹn luồng **"Người dùng chọn ảnh từ thư viện -> Upload lên Supabase Storage -> Lưu URL vào bảng users -> Hiển thị lên Profile"**.

### Cấu hình Database & Storage (SQL)
- Tạo Bucket mới tên `avatars` (Công khai).
- Thiết lập RLS Policy cho Storage: Bất kỳ ai cũng đọc được ảnh (Public Read), nhưng chỉ User đã đăng nhập mới được upload ảnh của chính họ.

### Cập nhật Retrofit (ApiService.java)
- Bổ sung hàm `@Multipart @POST` vào Retrofit để upload file nhị phân (byte array/File) lên Endpoint của Supabase Storage: `/storage/v1/object/avatars/{filename}`.
- Bổ sung hàm cập nhật URL ảnh vào bảng `users`.

### Xây dựng Giao diện Profile (ProfileFragment)
- Bổ sung `ImageView` hiển thị Avatar và nút `Sửa ảnh`.
- Sử dụng `ActivityResultLauncher` của Android để cho phép người dùng chọn ảnh từ Gallery.
- Khi chọn xong, gọi API để Upload ảnh lên Supabase.
- Trả về URL của ảnh và dùng thư viện `Glide` để load ảnh vừa cập nhật lên màn hình.

> [!IMPORTANT]
> **Quyết định thiết kế:** Tính năng upload file lên Supabase thông qua Retrofit đòi hỏi phải xử lý File cẩn thận (vì chúng ta không dùng thư viện Supabase-kt mà dùng RESTful API thuần). Bù lại, làm theo cách REST thuần giúp bạn rất hiểu bản chất API, cực kỳ có lợi khi bị hỏi xoáy đáp xoay lúc bảo vệ đồ án!

## Các bước thực hiện
1. Viết file `docs/seed_data.sql` và `docs/storage_setup.sql`.
2. Tạo endpoint upload file trong `ApiService.java`.
3. Sửa layout của `ProfileFragment` (`profile_fragment.xml`) để chứa Avatar và thông tin User.
4. Cập nhật logic trong `ProfileFragment.java` để xử lý việc chọn ảnh, upload và lưu URL.
