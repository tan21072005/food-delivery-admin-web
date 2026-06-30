# Câu hỏi khó: Quản lý DeliveryAddress

> Ngày: 2026-06-28
> Mục đích: chốt các quyết định mà implementation worker và reviewer cần biết trước khi code hoặc merge luồng DeliveryAddress.

## 1. Bảng chuẩn cho địa chỉ giao hàng là bảng nào?
**Câu hỏi:** Bảng canonical nên là `public.user_addresses` hiện có hay tạo mới `public.delivery_addresses`, và ai chịu trách nhiệm dọn migration/docs nếu đổi tên?  
**Vì sao quan trọng:** Tên bảng quyết định contract giữa Android, Supabase, RLS và tài liệu nghiệp vụ.  
**Phương án:** Giữ `public.user_addresses`; tạo `public.delivery_addresses`; giữ bảng cũ nhưng bổ sung alias/view.  
**Khuyến nghị:** Giữ `public.user_addresses` cho MVP nếu schema đã tồn tại, đồng thời ghi rõ nó đại diện cho DeliveryAddress.  
**Rủi ro nếu sai:** Worker khác có thể code theo bảng khác nhau, gây lỗi runtime và migration chồng chéo.  
**Cần user quyết định:** Có.

## 2. Bổ sung tên và số điện thoại người nhận thế nào?
**Câu hỏi:** Thêm recipient name và recipient phone ra sao khi `user_addresses` hiện thiếu các cột này nhưng `CONTEXT.md` và Ordering MVP yêu cầu?  
**Vì sao quan trọng:** Checkout cần snapshot người nhận, không chỉ địa chỉ.  
**Phương án:** Thêm cột vào `user_addresses`; lưu trong Order snapshot בלבד; tạo bảng profile người nhận riêng.  
**Khuyến nghị:** Thêm cột vào `user_addresses` và copy sang Order snapshot khi checkout.  
**Rủi ro nếu sai:** Order đã đặt có thể thiếu thông tin giao hàng hoặc phụ thuộc vào dữ liệu profile thay đổi sau này.  
**Cần user quyết định:** Có.

## 3. Checkout gửi ID hay gửi snapshot?
**Câu hỏi:** Checkout nên gửi `deliveryAddressId` để PostgreSQL snapshot row, hay Android gửi full snapshot payload?  
**Vì sao quan trọng:** Cách gửi dữ liệu ảnh hưởng trực tiếp tới chống giả mạo địa chỉ và tính bất biến của Order.  
**Phương án:** Gửi `deliveryAddressId`; gửi snapshot đầy đủ; gửi ID kèm snapshot để backend đối chiếu.  
**Khuyến nghị:** Gửi `deliveryAddressId`, backend/RPC tự đọc và snapshot theo quyền của `auth.uid()`.  
**Rủi ro nếu sai:** Client có thể gửi địa chỉ không thuộc Customer hoặc snapshot không khớp dữ liệu thật.  
**Cần user quyết định:** Không.

## 4. RLS bảo vệ DeliveryAddress ra sao?
**Câu hỏi:** RLS policies cụ thể cho SELECT/INSERT/UPDATE/DELETE là gì, và làm sao ngăn Customer đổi `user_id` trong UPDATE?  
**Vì sao quan trọng:** Địa chỉ, số điện thoại và tọa độ là dữ liệu riêng tư.  
**Phương án:** RLS theo `auth.uid()` qua `users.auth_uid`; chỉ cho RPC ghi; demo bỏ RLS.  
**Khuyến nghị:** Bật RLS theo ownership, dùng `WITH CHECK` để khóa `user_id`, không tin `user_id` từ app.  
**Rủi ro nếu sai:** IDOR/BOLA làm Customer đọc hoặc sửa địa chỉ của Customer khác.  
**Cần user quyết định:** Không.

## 5. Đổi địa chỉ mặc định bằng RPC hay client logic?
**Câu hỏi:** Nếu dùng `SECURITY DEFINER` RPC để đổi default, RPC sẽ validate `auth.uid()`, revoke `PUBLIC`, grant only `authenticated`, và tránh bypass tenant ownership thế nào?  
**Vì sao quan trọng:** RPC có quyền cao dễ vô tình vượt qua RLS.  
**Phương án:** RPC transaction an toàn; client update nhiều row; unique partial index kèm RPC.  
**Khuyến nghị:** Dùng RPC transaction, revoke `PUBLIC`, grant `authenticated`, tự xác định Customer từ `auth.uid()`.  
**Rủi ro nếu sai:** Một user có thể set default cho địa chỉ không thuộc mình hoặc tạo nhiều default.  
**Cần user quyết định:** Không.

## 6. Đảm bảo đúng một default khi có nhiều thiết bị thế nào?
**Câu hỏi:** App/backend bảo đảm mỗi Customer chỉ có một DeliveryAddress mặc định ra sao khi hai thiết bị gửi request cùng lúc?  
**Vì sao quan trọng:** Race condition dễ tạo nhiều địa chỉ default hoặc không có default nào.  
**Phương án:** Unique partial index; RPC transaction; chỉ xử lý ở Android.  
**Khuyến nghị:** Dùng unique partial index theo Customer và RPC transaction đổi default.  
**Rủi ro nếu sai:** Checkout có thể chọn sai địa chỉ mặc định.  
**Cần user quyết định:** Không.

## 7. Xóa địa chỉ mặc định thì xử lý thế nào?
**Câu hỏi:** Khi default DeliveryAddress bị xóa, backend tự promote địa chỉ khác, để không có default, hay chặn xóa cho tới khi chọn default mới?  
**Vì sao quan trọng:** Hành vi này ảnh hưởng checkout lần sau và UI quản lý địa chỉ.  
**Phương án:** Tự promote; cho phép không có default; bắt chọn địa chỉ khác trước khi xóa.  
**Khuyến nghị:** MVP cho phép không có default và checkout yêu cầu chọn/thêm địa chỉ khi cần.  
**Rủi ro nếu sai:** App có thể âm thầm dùng địa chỉ không mong muốn.  
**Cần user quyết định:** Có.

## 8. Chuyển tiếp từ `Checkout.java` sang `CheckoutViewModel` ra sao?
**Câu hỏi:** Kế hoạch transition cho `Checkout.java` đang đặt Order demo local so với `CheckoutViewModel` đang gọi Supabase một phần là gì?  
**Vì sao quan trọng:** Hai luồng checkout cùng tồn tại dễ tạo hành vi trái ngược.  
**Phương án:** Retire `Checkout.java`; bọc bằng feature flag; giữ demo local song song.  
**Khuyến nghị:** Chọn một checkout path Supabase-backed cho MVP và dọn path demo khỏi luồng chính.  
**Rủi ro nếu sai:** QA test nhầm flow local và bỏ sót lỗi backend.  
**Cần user quyết định:** Có.

## 9. Không có địa chỉ đã lưu thì checkout làm gì?
**Câu hỏi:** Checkout xử lý thế nào khi Customer chưa có DeliveryAddress đã lưu: block, bắt thêm địa chỉ, cho địa chỉ dùng một lần, hay fallback text input?  
**Vì sao quan trọng:** Đây là trạng thái phổ biến của user mới.  
**Phương án:** Bắt thêm địa chỉ; cho one-time address; fallback text input; block checkout.  
**Khuyến nghị:** Bắt thêm DeliveryAddress trước khi đặt Order để snapshot rõ ràng.  
**Rủi ro nếu sai:** Customer bị kẹt ở checkout hoặc Order thiếu địa chỉ giao hàng.  
**Cần user quyết định:** Có.

## 10. Order snapshot cần copy field nào?
**Câu hỏi:** Những field nào phải copy vào Order snapshot, và QA chứng minh việc sửa DeliveryAddress sau này không làm đổi Order lịch sử ra sao?  
**Vì sao quan trọng:** Order history phải giữ dữ liệu đúng tại thời điểm đặt hàng.  
**Phương án:** Copy address text only; copy recipient + phone + address + coordinates; join live address khi đọc.  
**Khuyến nghị:** Copy recipient name, recipient phone, address lines, note, latitude/longitude nếu có.  
**Rủi ro nếu sai:** Sửa địa chỉ mới làm biến đổi chi tiết Order cũ.  
**Cần user quyết định:** Không.

## 11. Tọa độ có bắt buộc trong MVP không?
**Câu hỏi:** Latitude/longitude nên bắt buộc, nullable tới khi map/geocoding có, hay lấy fallback từ current location?  
**Vì sao quan trọng:** Tọa độ kéo theo permission, geocoding và privacy.  
**Phương án:** Bắt buộc; nullable; tự điền từ current location.  
**Khuyến nghị:** Nullable trong MVP, chỉ dùng khi user/app có dữ liệu đáng tin cậy.  
**Rủi ro nếu sai:** Checkout bị chặn bởi tính năng location chưa hoàn thiện.  
**Cần user quyết định:** Có.

## 12. Validate số điện thoại người nhận theo rule nào?
**Câu hỏi:** Rule validate recipient phone là gì, và có dùng chung với auth/profile validation hay định nghĩa riêng?  
**Vì sao quan trọng:** Số điện thoại giao hàng có thể khác số đăng nhập nhưng vẫn cần hợp lệ.  
**Phương án:** Dùng chung rule auth/profile; rule riêng cho recipient; chỉ kiểm tra non-empty.  
**Khuyến nghị:** Dùng rule Việt Nam đơn giản cho recipient phone, tách khỏi auth nếu auth có yêu cầu khác.  
**Rủi ro nếu sai:** App chặn số hợp lệ hoặc lưu số không gọi được.  
**Cần user quyết định:** Có.

## 13. Màn chọn địa chỉ trả kết quả về checkout ra sao?
**Câu hỏi:** `AddressListFragment` nên trả lựa chọn về checkout bằng Navigation result API, shared ViewModel, Activity result hay direct callback?  
**Vì sao quan trọng:** Cách trả kết quả ảnh hưởng coupling giữa profile và checkout.  
**Phương án:** Navigation result API; shared ViewModel; Activity result; direct callback.  
**Khuyến nghị:** Navigation result API hoặc shared ViewModel theo pattern hiện có của app.  
**Rủi ro nếu sai:** Checkout nhận sai địa chỉ hoặc màn profile bị phụ thuộc checkout quá chặt.  
**Cần user quyết định:** Không.

## 14. Phân biệt management mode và checkout select mode thế nào?
**Câu hỏi:** Profile address management phân biệt chế độ quản lý bình thường và chế độ chọn địa chỉ cho checkout ra sao mà không duplicate screen?  
**Vì sao quan trọng:** Một màn nên dùng lại được nhưng hành vi action button khác nhau.  
**Phương án:** Fragment argument mode; hai màn riêng; ViewModel state chung.  
**Khuyến nghị:** Dùng argument mode rõ ràng: `manage` và `select_for_checkout`.  
**Rủi ro nếu sai:** User đang checkout có thể sửa/xóa thay vì chọn địa chỉ, hoặc ngược lại.  
**Cần user quyết định:** Không.

## 15. Tránh rò rỉ địa chỉ và điện thoại vào log thế nào?
**Câu hỏi:** Implementation tránh ghi full address/phone/coordinates vào logs, crash reports, analytics events hoặc Toast debug ra sao?  
**Vì sao quan trọng:** Đây là PII của Customer.  
**Phương án:** Không log PII; mask dữ liệu; chỉ log ID và status.  
**Khuyến nghị:** Chỉ log IDs/status, mask phone/address nếu buộc phải debug.  
**Rủi ro nếu sai:** Lộ dữ liệu cá nhân trong môi trường demo hoặc crash report.  
**Cần user quyết định:** Không.

## 16. Test RLS thủ công bằng dữ liệu nào?
**Câu hỏi:** Dùng tài khoản và dữ liệu test nào để xác minh Customer A không đọc/sửa được DeliveryAddress của Customer B?  
**Vì sao quan trọng:** RLS cần test bằng user thật, không chỉ đọc code policy.  
**Phương án:** Hai account test riêng; script SQL impersonation; chỉ kiểm tra UI.  
**Khuyến nghị:** Tạo hai Customer test và checklist đọc/sửa/xóa cross-user qua API.  
**Rủi ro nếu sai:** Chính sách tưởng đúng nhưng vẫn leak qua PostgREST/RPC.  
**Cần user quyết định:** Không.

## 17. Xử lý `AddressItem` demo thế nào?
**Câu hỏi:** `AddressItem` nên được retire hay adapt thế nào để dummy display fields không vô tình thành domain model?  
**Vì sao quan trọng:** Model demo thường lan vào repository thật nếu không chặn sớm.  
**Phương án:** Xóa và thay bằng DTO thật; adapt mapper; giữ nguyên cho UI.  
**Khuyến nghị:** Tạo DTO/domain model rõ ràng và chỉ giữ `AddressItem` như UI model nếu cần.  
**Rủi ro nếu sai:** Schema thật bị uốn theo dữ liệu mock.  
**Cần user quyết định:** Không.

## 18. Địa chỉ bị xóa ở thiết bị khác trước khi đặt Order thì sao?
**Câu hỏi:** Nếu checkout bắt đầu với default address nhưng địa chỉ đó bị xóa ở thiết bị khác trước khi Customer bấm đặt Order, app xử lý thế nào?  
**Vì sao quan trọng:** Dữ liệu checkout có thể stale.  
**Phương án:** Backend reject và app yêu cầu chọn lại; app refresh trước submit; tự fallback default khác.  
**Khuyến nghị:** Backend reject bằng lỗi rõ ràng, app reload danh sách và yêu cầu chọn lại.  
**Rủi ro nếu sai:** Order có thể snapshot địa chỉ đã bị xóa hoặc không thuộc Customer.  
**Cần user quyết định:** Không.

## 19. Có cho sửa địa chỉ ngay từ checkout không?
**Câu hỏi:** App có hỗ trợ edit address từ checkout không, và nếu có thì quay lại có tự select địa chỉ vừa sửa/tạo không?  
**Vì sao quan trọng:** Đây là UX tiện lợi nhưng làm navigation phức tạp hơn.  
**Phương án:** Cho add/edit và auto-select; chỉ cho chọn; chuyển sang profile management.  
**Khuyến nghị:** Cho add từ checkout và auto-select địa chỉ mới; edit có thể phase sau nếu gấp.  
**Rủi ro nếu sai:** User phải rời checkout rồi quay lại thủ công, dễ mất context.  
**Cần user quyết định:** Có.

## 20. Ai cập nhật tài liệu contract cuối?
**Câu hỏi:** Worker nào chịu trách nhiệm cập nhật `docs/prd-ordering-mvp.md` sau khi final checkout address contract được implement?  
**Vì sao quan trọng:** Docs phải phản ánh đúng contract để worker sau không dùng giả định cũ.  
**Phương án:** DeliveryAddress worker; Ordering MVP worker; reviewer merge cuối.  
**Khuyến nghị:** DeliveryAddress worker cập nhật phần address contract, Ordering worker review khi tích hợp checkout.  
**Rủi ro nếu sai:** PRD và implementation lệch nhau, gây bug cho checkout/order history.  
**Cần user quyết định:** Có.
