# Kiểm tra cấu hình Supabase khi build

## Vấn đề

Ứng dụng Android hiện chuyển các giá trị `SUPABASE_URL` và
`SUPABASE_ANON_KEY` bị thiếu trong `local.properties` thành chuỗi rỗng trong
`BuildConfig`. Khi khởi động, `AuthViewModel` tạo `AuthRepository`; repository
này tiếp tục khởi tạo Retrofit bằng URL rỗng, khiến `AuthActivity` bị crash.

## Thiết kế

Gradle sẽ quản lý giao diện cấu hình. Gradle đọc các giá trị không có dấu ngoặc
kép từ `local.properties`, chuẩn hóa URL Supabase để luôn có dấu gạch chéo ở
cuối, chuyển hai giá trị thành chuỗi Java an toàn và từ chối cấu hình bị thiếu
hoặc sai định dạng bằng thông báo lỗi build có hướng dẫn xử lý. Một tệp cấu
hình mẫu được lưu trong repository sẽ mô tả các khóa bắt buộc nhưng không chứa
thông tin xác thực thật.

Supabase client hiện tại không cần thay đổi. Khi build thành công,
`BuildConfig.SUPABASE_URL` được bảo đảm là URL HTTP(S) hợp lệ cho Retrofit và
khóa phía client được bảo đảm không rỗng.

## Xử lý lỗi

Bản build debug và release sẽ dừng trước bước biên dịch nếu thiếu một trong các
thuộc tính bắt buộc. Thông báo lỗi chỉ rõ thuộc tính còn thiếu và hướng dẫn lập
trình viên tham khảo tệp cấu hình mẫu. Không có giá trị bí mật nào được in ra.

## Xác minh

Kiểm thử hồi quy sẽ bao phủ cấu hình bị thiếu, sai định dạng và hợp lệ. Kiểm thử
đơn vị tập trung cùng toàn bộ bộ kiểm thử của ứng dụng phải chạy thành công.
Khi dùng `local.properties` chưa đầy đủ hiện tại, Gradle phải dừng với thông báo
có hướng dẫn thay vì tạo APK bị crash lúc khởi động.
