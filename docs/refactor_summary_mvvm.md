# Tóm tắt quá trình Refactor mô hình MVVM và Bảo mật (Giai đoạn 1 - 4)

Tài liệu này ghi lại toàn bộ các công việc đã thực hiện nhằm chuẩn hóa kiến trúc của dự án Food Delivery sang mô hình MVVM và Clean Architecture, đồng thời tăng cường tính bảo mật cho ứng dụng.

## 1. Tách biệt Logic Mạng (Network) bằng Repository (Giai đoạn 1)
Thay vì để các Fragment/Activity trực tiếp gọi API thông qua `SupabaseClient` và `ApiService`, các lớp `Repository` đã được tạo ra để tập trung hóa logic truy xuất dữ liệu:
- `AuthRepository`: Xử lý đăng nhập, đăng ký.
- `FoodRepository`: Lấy danh sách món ăn, danh mục từ máy chủ.
- `OrderRepository`: Xử lý thêm vào giỏ hàng, cập nhật/xóa món, đặt hàng.
- `UserRepository`: Xử lý tải thông tin người dùng, upload ảnh đại diện (avatar) lên Storage.

## 2. Áp dụng triệt để ViewModel cho các tính năng (Giai đoạn 2 & 3)

### Nhóm Xác thực & Profile (Auth & Profile)
- **Tạo `AuthViewModel` & `ProfileViewModel`**: Đóng vai trò cầu nối giữa UI và Repository.
- **Cập nhật `LoginFragment`, `SignUpFragment`, `ProfileFragment`**: 
  - Các Fragment này đã được "dọn dẹp" hoàn toàn khỏi các lệnh gọi API (`enqueue`, `Callback`).
  - Chuyển sang lắng nghe (observe) dữ liệu trạng thái thông qua `LiveData` từ ViewModel (ví dụ: `getIsLoading()`, `getLoginSuccess()`, `getError()`).
  - Fix các lỗi rò rỉ bộ nhớ hoặc lỗi gọi mạng lặp lại nhờ Lifecycle của ViewModel.

### Nhóm Trang chủ & Giỏ hàng (Home & Checkout)
- **Cập nhật `HomeViewModel` & `CheckoutViewModel`**: 
  - Chuyển từ việc gọi trực tiếp `ApiService` sang việc sử dụng `FoodRepository` và `OrderRepository`.
  - Đảm bảo tính nhất quán về kiến trúc trên toàn bộ app.

## 3. Bảo mật và Dọn dẹp Code (Giai đoạn 4)

### Ẩn cấu hình nhạy cảm (Credentials)
- **Vấn đề cũ:** Key Supabase (URL và ANON KEY) được fix cứng dạng chuỗi trong file `Constants.java`, dẫn đến rủi ro lộ key khi mã nguồn được đưa lên GitHub.
- **Giải pháp:** 
  - Lưu key vào file `local.properties` (file này luôn nằm trong `.gitignore` và không bị đưa lên Git).
  - Cấu hình `build.gradle.kts` (bật tính năng `buildConfig = true`) để đọc dữ liệu từ `local.properties` và tự động sinh ra lớp `BuildConfig`.
  - `Constants.java` lấy dữ liệu từ `BuildConfig` để sử dụng an toàn trong code.

### Mã hóa Token đăng nhập (Session Security)
- **Vấn đề cũ:** Token đăng nhập (JWT) lưu trực tiếp ở dạng plain-text bằng `SharedPreferences`. Nếu thiết bị bị root, hacker có thể dễ dàng đọc được token này.
- **Giải pháp:** Cập nhật lớp `SessionManager.java` sang sử dụng `EncryptedSharedPreferences` (thư viện `androidx.security.crypto`), sử dụng thuật toán mã hóa tiên tiến (`AES256_GCM`) giúp việc lưu trữ thông tin đăng nhập của người dùng an toàn tuyệt đối.

## Tổng kết
Ứng dụng hiện tại đã có bộ khung MVVM sạch sẽ, dễ bảo trì, dễ viết Test sau này và cực kỳ an toàn về mặt thông tin xác thực.
