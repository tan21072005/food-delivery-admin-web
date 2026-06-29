# Giai đoạn 1: Tối ưu UI & Refactor Component Mật khẩu

Mình đã hoàn thành việc gom các luồng đổi/tạo/quên mật khẩu vào một component duy nhất theo yêu cầu ở Giai đoạn 1.

## Các thay đổi chính

- **Tạo Component Tái sử dụng**: Đã tạo `PasswordFormFragment.java` và giao diện `fragment_password_form.xml` với thiết kế Sleek Design.
- **Tính năng Động (Dynamic UI)**: Tùy theo tham số truyền vào qua Navigation (`CREATE`, `CHANGE`, `RESET`), tiêu đề và ô "Mật khẩu hiện tại" sẽ tự động ẩn/hiện cho phù hợp.
- **Dọn dẹp Nợ kỹ thuật (Technical Debt)**: Đã xóa bỏ file `Reset_password.java` và `auth_fragment_reset_password.xml` cũ bị thừa, đồng thời gỡ phần bị comment-out của luồng "Đổi mật khẩu" trong Profile.
- **Cập nhật Navigation Graphs**: 
  - Đã trỏ `resetPasswordFragment` trong `nav_auth.xml` tới component mới với tham số `RESET`.
  - Đã trỏ `changePasswordFragment` trong `nav_profile.xml` tới component mới với tham số `CHANGE`.

> **Lưu ý**:
> Riêng luồng **Đăng ký** (Tạo mật khẩu), do giao diện hiện tại đang gộp chung nhập Email và Mật khẩu trên cùng 1 màn hình (`SignUpFragment`), mình tạm thời chưa thay thế bằng component mới để tránh phá hỏng luồng hoạt động hiện tại. Component `PasswordFormFragment` (chế độ `CREATE`) đã sẵn sàng nếu sau này hệ thống tách riêng màn hình Đăng ký thành 2 bước (Bước 1: Email -> Bước 2: Pass).

## Kiểm thử
- Các luồng điều hướng (Navigation) đã liên kết đúng tới Fragment mới.
- Giao diện thay đổi mật khẩu và quên mật khẩu giờ đây hoàn toàn đồng bộ với nhau về thiết kế.
