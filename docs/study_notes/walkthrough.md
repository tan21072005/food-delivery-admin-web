# Hoàn thành Bơm Dữ liệu & Tính năng Upload Avatar

Mình đã thực hiện xong các bước để bơm dữ liệu mẫu và tích hợp tính năng quản lý File thông qua **Supabase Storage**.

## 1. Dữ liệu mẫu (Seed Data)
Để có dữ liệu hiển thị trên app, mình đã tạo file `docs/seed_data.sql`.
- File này chứa sẵn các lệnh tạo danh mục (Burger, Pizza, Đồ uống...) và 10 món ăn đi kèm với hình ảnh thật (link Unsplash).
- Bạn chỉ cần mở file này và chạy (Run) trong SQL Editor của Supabase để làm đầy bảng `categories` và `menus`.

## 2. Quản lý File & Hình ảnh (Supabase Storage)
Mình đã hoàn thiện trọn vẹn luồng cho phép User thay đổi ảnh đại diện (Avatar). 

### 🛡️ Cấu hình Storage (Backend)
- Đã tạo file `docs/storage_setup.sql`. Khi bạn chạy file này trên Supabase, nó sẽ tự động tạo một Bucket tên là `avatars`.
- Thiết lập luôn các luồng bảo mật (RLS Policies): Ảnh Avatar ai cũng có thể xem, nhưng **chỉ người dùng đăng nhập mới được upload ảnh của chính họ**. Rất an toàn!

### 📱 Lập trình App (Android)
- **Retrofit (`ApiService.java`)**: Bổ sung hàm `@POST("storage/v1/object/avatars/{fileName}")` hỗ trợ upload file dưới định dạng Multipart Binary.
- **SupabaseClient.java**: Tùy chỉnh khéo léo Interceptor để không ghi đè `Content-Type` khi tải file, cho phép Retrofit tự quyết định MIME type (VD: `image/jpeg`).
- **Giao diện (`ProfileFragment.java`)**:
  - Gắn sự kiện vào nút "Sửa" (hình cây bút). 
  - Khi bấm vào, Android sẽ mở thư viện ảnh của điện thoại ra.
  - Sau khi người dùng chọn ảnh, app sẽ đọc ảnh thành `byte[]`, dùng API bắn lên Supabase Storage, lấy đường dẫn URL và lưu ngược lại vào bảng `users`.
  - Cuối cùng, `Glide` sẽ tải ảnh mới nhất lên màn hình một cách mượt mà.

> [!TIP]
> **Điểm nhấn bảo vệ đồ án:** Toàn bộ quá trình Upload này không dùng "thư viện ăn sẵn" (như `supabase-kt`) mà sử dụng RESTful API thuần túy. Nó chứng minh bạn hiểu rất rõ về HTTP Request, Header, cách gửi file qua mạng và bảo mật qua Bearer Token.

---
👉 **Việc cần làm tiếp theo:**
1. Lên Supabase Dashboard -> SQL Editor.
2. Chạy lần lượt 2 file: `docs/seed_data.sql` và `docs/storage_setup.sql`.
3. Chạy App lên máy ảo, thử vào mục Tài Khoản (Profile) -> Bấm vào nút sửa kế bên Tên để thử đổi Avatar nhé!
