# Bơm Dữ liệu (Seed Data) & Supabase Storage

- `[x]` **Bước 1: Cơ sở dữ liệu & Storage (SQL)**
  - `[x]` Tạo file `docs/seed_data.sql` chứa dữ liệu mẫu cho `categories` và `menus`.
  - `[x]` Tạo file `docs/storage_setup.sql` để tạo bucket `avatars` và thiết lập Policies.
- `[x]` **Bước 2: Cập nhật Mạng (Retrofit)**
  - `[x]` Thêm API Endpoint để upload file vào `ApiService.java`.
- `[x]` **Bước 3: Giao diện Profile**
  - `[x]` Cập nhật `profile_fragment.xml` thêm ImageView Avatar và nút chọn ảnh.
- `[x]` **Bước 4: Logic Profile (ProfileFragment.java)**
  - `[x]` Đăng ký `ActivityResultLauncher` để lấy ảnh từ Gallery.
  - `[x]` Viết logic đọc file ảnh và đẩy lên Supabase thông qua Retrofit.
  - `[x]` Lấy URL trả về, cập nhật vào bảng `users` và render bằng Glide.
