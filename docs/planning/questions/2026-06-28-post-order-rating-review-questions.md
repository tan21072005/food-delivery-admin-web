# Câu hỏi khó: Đánh giá sau khi Order hoàn tất

## 1. Status nào đủ điều kiện review?
**Câu hỏi:** Status canonical để cho phép review là `completed` theo `CONTEXT.md`/Ordering MVP hay `delivered` theo enum trong `docs/sql.sql`?  
**Vì sao quan trọng:** Review eligibility phụ thuộc trực tiếp vào status của Order.  
**Phương án:** Dùng `completed`; dùng `delivered`; map tạm giữa hai vocabulary.  
**Khuyến nghị:** Chuẩn hóa về `completed` cho MVP và ghi migration/compat nếu `docs/sql.sql` còn `delivered`.  
**Rủi ro nếu sai:** Customer có thể review Order chưa hoàn tất hoặc không review được Order hợp lệ.  
**Cần user quyết định:** Có.

## 2. Có cần hoàn tất Order history Supabase trước không?
**Câu hỏi:** Nên finish Order history backed by Supabase trước khi làm review, hay build review sau mock adapter chỉ để demo?  
**Vì sao quan trọng:** Review thật cần Order thật, Customer thật và RLS thật.  
**Phương án:** Chờ Order history thật; mock adapter tạm; làm song song với contract cố định.  
**Khuyến nghị:** Chờ hoặc song song trên contract Supabase rõ ràng, không demo review bằng dữ liệu mock.  
**Rủi ro nếu sai:** UI review trông chạy nhưng không chứng minh được security và duplicate prevention.  
**Cần user quyết định:** Có.

## 3. Một review gắn với đơn vị nào?
**Câu hỏi:** Release đầu là một review cho mỗi Order, một review cho mỗi Restaurant trên mỗi Order, hay thêm food ratings theo OrderLine?  
**Vì sao quan trọng:** Cardinality quyết định unique constraint, UI và aggregate rating.  
**Phương án:** Một review/Order; một review/Restaurant/Order; thêm rating theo OrderLine.  
**Khuyến nghị:** Một review cho mỗi completed Order trong MVP, gắn `restaurant_id` snapshot.  
**Rủi ro nếu sai:** Duplicate review hoặc aggregate rating bị tính sai.  
**Cần user quyết định:** Có.

## 4. Có giữ driver rating không?
**Câu hỏi:** Có nên ẩn hoặc loại bỏ driver rating khỏi `order_fragment_review.xml` tới khi có driver-backed Orders?  
**Vì sao quan trọng:** Repo này chưa có Shipper/Driver domain hoàn chỉnh.  
**Phương án:** Ẩn driver rating; giữ UI disabled; giữ full UI.  
**Khuyến nghị:** Ẩn driver rating trong MVP.  
**Rủi ro nếu sai:** App yêu cầu Customer đánh giá actor chưa tồn tại trong dữ liệu.  
**Cần user quyết định:** Không.

## 5. Có hỗ trợ ảnh review ngay không?
**Câu hỏi:** Add-photo UI có nên ẩn tới khi Supabase Storage review-photo policies được thiết kế?  
**Vì sao quan trọng:** Ảnh cần storage bucket, RLS, moderation và cleanup.  
**Phương án:** Ẩn ảnh; cho chọn ảnh nhưng chưa upload; làm Storage ngay.  
**Khuyến nghị:** Ẩn add-photo trong MVP.  
**Rủi ro nếu sai:** Upload thất bại hoặc lộ ảnh riêng tư qua bucket sai policy.  
**Cần user quyết định:** Có.

## 6. Mở review đã gửi bằng màn nào?
**Câu hỏi:** `Xem danh gia` nên mở read-only `OrderReviewFragment` hay một màn review detail đơn giản riêng?  
**Vì sao quan trọng:** Reuse màn submit có thể gây nhầm giữa xem và sửa.  
**Phương án:** Read-only cùng fragment; màn detail riêng; bottom sheet summary.  
**Khuyến nghị:** Dùng read-only mode nếu fragment hỗ trợ state rõ ràng, nếu không tạo detail screen đơn giản.  
**Rủi ro nếu sai:** Customer tưởng có thể sửa hoặc submit lại review.  
**Cần user quyết định:** Không.

## 7. Review có cho sửa không?
**Câu hỏi:** Customer có được sửa review đã gửi trong một khoảng thời gian không, hay review immutable trong MVP?  
**Vì sao quan trọng:** Edit flow cần audit và chính sách moderation bổ sung.  
**Phương án:** Immutable; cho sửa trong 24 giờ; cho sửa vô hạn.  
**Khuyến nghị:** Immutable trong MVP.  
**Rủi ro nếu sai:** Aggregate và moderation phải xử lý nhiều version ngoài scope.  
**Cần user quyết định:** Có.

## 8. Moderation cho `review_text` thế nào?
**Câu hỏi:** Chính sách moderation nào áp dụng cho `review_text` trước khi hiện trên Restaurant detail?  
**Vì sao quan trọng:** Nội dung công khai có thể chứa thông tin nhạy cảm hoặc ngôn từ không phù hợp.  
**Phương án:** Hiện ngay; pending manual review; lọc từ khóa đơn giản.  
**Khuyến nghị:** MVP có thể hiện ngay nhưng phải có report/admin future note; không log dữ liệu thừa.  
**Rủi ro nếu sai:** Nội dung không phù hợp xuất hiện công khai trong demo.  
**Cần user quyết định:** Có.

## 9. Cập nhật aggregate rating ra sao?
**Câu hỏi:** `restaurants.avg_rating` cập nhật đồng bộ trong `submit_order_review`, bằng trigger, hay tính lại khi đọc?  
**Vì sao quan trọng:** Aggregate cần nhất quán với review rows và không bị client sửa.  
**Phương án:** RPC update đồng bộ; database trigger; computed view.  
**Khuyến nghị:** RPC/trigger trong backend, không để Android tự cập nhật aggregate.  
**Rủi ro nếu sai:** Rating hiển thị sai hoặc bị giả mạo.  
**Cần user quyết định:** Không.

## 10. Review list expose field nào?
**Câu hỏi:** Restaurant review list cần expose field nào mà không lộ dữ liệu riêng tư của Customer?  
**Vì sao quan trọng:** Review là public-ish, nhưng Customer profile là private.  
**Phương án:** Rating + text + masked display name + created_at; full user profile; anonymous only.  
**Khuyến nghị:** Expose rating, text, created_at, masked display name và Order context tối thiểu.  
**Rủi ro nếu sai:** Lộ `users.full_name`, phone hoặc ID nội bộ không cần thiết.  
**Cần user quyết định:** Không.

## 11. Tên hiển thị anonymous là gì?
**Câu hỏi:** App biểu diễn display name bằng `users.full_name`, tên masked, hay chuỗi cố định `Khach hang`?  
**Vì sao quan trọng:** Tên thật có thể là PII.  
**Phương án:** Tên thật; masked name; `Khach hang`.  
**Khuyến nghị:** Masked name nếu có, fallback `Khach hang`.  
**Rủi ro nếu sai:** Lộ danh tính Customer trên màn public.  
**Cần user quyết định:** Có.

## 12. Submit trùng xử lý thế nào?
**Câu hỏi:** Duplicate submit trả lỗi hay trả review đã tồn tại như idempotent success?  
**Vì sao quan trọng:** Mobile có thể retry sau timeout.  
**Phương án:** Error duplicate; idempotent success; update existing review.  
**Khuyến nghị:** Idempotent success nếu payload giống nhau, còn payload khác thì trả lỗi rõ ràng.  
**Rủi ro nếu sai:** Customer bị double submit hoặc không biết review đã được lưu.  
**Cần user quyết định:** Không.

## 13. Fetch eligibility ở đâu?
**Câu hỏi:** Review eligibility nên fetch khi render completed history hay chỉ khi mở review screen?  
**Vì sao quan trọng:** Quyết định này ảnh hưởng performance và độ chính xác của CTA.  
**Phương án:** Fetch cùng history; fetch khi mở review; hybrid lazy refresh.  
**Khuyến nghị:** Fetch lightweight eligibility cùng completed history để CTA chính xác.  
**Rủi ro nếu sai:** Nút review xuất hiện sai hoặc mở màn rồi mới báo không hợp lệ.  
**Cần user quyết định:** Không.

## 14. Cache status stale trong demo thì sao?
**Câu hỏi:** Nếu Order được mark completed thủ công trong Supabase nhưng Android Order list cache còn status cũ, fallback là gì?  
**Vì sao quan trọng:** Demo hay cập nhật backend thủ công.  
**Phương án:** Pull-to-refresh; auto refresh khi vào màn; chỉ tin cache.  
**Khuyến nghị:** Refresh Order detail/history trước khi quyết định eligibility.  
**Rủi ro nếu sai:** Demo không thấy CTA review dù backend đã đúng.  
**Cần user quyết định:** Không.

## 15. Cancelled Orders có feedback khác không?
**Câu hỏi:** Cancelled Orders có bao giờ cho complaint/refund feedback, hay đây là dispute feature riêng?  
**Vì sao quan trọng:** Review và complaint có mục đích khác nhau.  
**Phương án:** Không review cancelled; cho complaint riêng; cho rating trải nghiệm hủy.  
**Khuyến nghị:** Không cho review cancelled; complaint/refund đi theo feature dispute.  
**Rủi ro nếu sai:** Rating Restaurant bị ảnh hưởng bởi case không giao hàng.  
**Cần user quyết định:** Có.

## 16. RLS cho public read và private read khác nhau thế nào?
**Câu hỏi:** RLS phân biệt public Restaurant review reads và Customer-private review detail reads ra sao?  
**Vì sao quan trọng:** Public list không nên expose toàn bộ row private.  
**Phương án:** Public view/RPC sanitized; table direct read; authenticated-only reads.  
**Khuyến nghị:** Dùng view/RPC sanitized cho Restaurant detail, detail riêng theo ownership cho Customer.  
**Rủi ro nếu sai:** Public API lộ fields nội bộ hoặc private.  
**Cần user quyết định:** Không.

## 17. Có chặn direct `INSERT` vào `order_reviews` không?
**Câu hỏi:** Có nên block hoàn toàn direct `INSERT` vào `order_reviews` cho authenticated clients và ép ghi qua RPC?  
**Vì sao quan trọng:** RPC có thể enforce eligibility, duplicate và snapshot.  
**Phương án:** Chỉ RPC; direct insert với RLS; cả hai.  
**Khuyến nghị:** Chỉ cho write qua `submit_order_review` RPC.  
**Rủi ro nếu sai:** Client bypass điều kiện completed-only hoặc review Order của người khác.  
**Cần user quyết định:** Không.

## 18. Test cross-customer thế nào?
**Câu hỏi:** Test data tạo hai Customers và kiểm tra Customer này không review được Order của Customer kia ra sao?  
**Vì sao quan trọng:** Đây là proof chính cho RLS/security.  
**Phương án:** Manual API checklist; SQL test script; chỉ test UI.  
**Khuyến nghị:** Dùng hai account thật và test RPC/table access cả positive lẫn negative.  
**Rủi ro nếu sai:** Lỗ hổng ownership không bị phát hiện.  
**Cần user quyết định:** Không.

## 19. Lưu `restaurant_id` snapshot hay join từ `orders`?
**Câu hỏi:** Review table nên lưu `restaurant_id` như snapshot từ Order hay join mỗi lần từ `orders`?  
**Vì sao quan trọng:** Aggregate và query Restaurant reviews cần nhanh và ổn định.  
**Phương án:** Snapshot `restaurant_id`; join từ `orders`; cả hai với constraint.  
**Khuyến nghị:** Lưu `restaurant_id` snapshot do RPC lấy từ Order hợp lệ.  
**Rủi ro nếu sai:** Review bị mất context nếu Order schema đổi hoặc query quá phức tạp.  
**Cần user quyết định:** Không.

## 20. Food feedback có ảnh hưởng `menus.rating` không?
**Câu hỏi:** `menus.rating` có bị ảnh hưởng bởi food feedback không, hay release đầu chỉ cập nhật `restaurants.avg_rating`?  
**Vì sao quan trọng:** Rating theo món cần UI và schema chi tiết hơn.  
**Phương án:** Chỉ Restaurant rating; thêm food rating; không cập nhật aggregate.  
**Khuyến nghị:** Release đầu chỉ cập nhật `restaurants.avg_rating`.  
**Rủi ro nếu sai:** App hứa rating món nhưng không có OrderLine feedback đúng nghĩa.  
**Cần user quyết định:** Có.

## 21. Restaurant bị xóa sau khi Order hoàn tất thì sao?
**Câu hỏi:** Nếu Restaurant bị xóa sau Order completion nhưng trước khi Customer review, có cho review không?  
**Vì sao quan trọng:** Soft delete/inactive ảnh hưởng public display và aggregate.  
**Phương án:** Chặn review; cho review nhưng không public; cho review nếu soft-deleted.  
**Khuyến nghị:** Chặn review nếu Restaurant không còn active/public, hiển thị lý do rõ.  
**Rủi ro nếu sai:** Review xuất hiện cho entity đã không còn phục vụ.  
**Cần user quyết định:** Có.

## 22. Customer bị xóa sau khi review thì sao?
**Câu hỏi:** Nếu Customer account bị xóa sau khi submit review, review được giữ anonymous hay xóa theo?  
**Vì sao quan trọng:** Chính sách retention ảnh hưởng privacy và aggregate.  
**Phương án:** Giữ anonymous; xóa review; giữ nhưng ẩn public.  
**Khuyến nghị:** MVP ghi rõ policy; nếu chưa có account deletion thật thì giữ anonymous là hướng an toàn hơn cho aggregate.  
**Rủi ro nếu sai:** Xóa account làm sai aggregate hoặc giữ PII quá lâu.  
**Cần user quyết định:** Có.

## 23. Giới hạn độ dài review text là bao nhiêu?
**Câu hỏi:** Review text có giới hạn độ dài không, và Android hiển thị lỗi gì khi quá dài?  
**Vì sao quan trọng:** Backend và UI cần cùng constraint.  
**Phương án:** 500 ký tự; 1000 ký tự; không giới hạn ngoài database.  
**Khuyến nghị:** Giới hạn 500 hoặc 1000 ký tự, Android validate trước và backend enforce lại.  
**Rủi ro nếu sai:** Submit fail khó hiểu hoặc lưu text quá dài làm UI xấu.  
**Cần user quyết định:** Có.

## 24. Không có mạng khi submit thì sao?
**Câu hỏi:** Feature nên block submit khi no network với local draft saving, hay chỉ show retry?  
**Vì sao quan trọng:** Draft offline thêm state phức tạp.  
**Phương án:** Show retry; lưu draft local; queue submit nền.  
**Khuyến nghị:** Show retry và giữ nội dung trên màn trong MVP.  
**Rủi ro nếu sai:** Mất nội dung Customer vừa nhập hoặc tạo queue khó kiểm soát.  
**Cần user quyết định:** Không.

## 25. Checklist demo cần chứng minh gì?
**Câu hỏi:** Checklist demo cụ thể nào chứng minh completed-only, duplicate prevention, RLS/security và MVP impact cho evaluator?  
**Vì sao quan trọng:** Review feature dễ nhìn như UI-only nếu không có proof backend.  
**Phương án:** UI-only script; API + UI checklist; SQL policy checklist riêng.  
**Khuyến nghị:** Chuẩn bị checklist gồm Order completed, duplicate submit, cross-customer denial và aggregate update.  
**Rủi ro nếu sai:** Demo không thuyết phục được phần security và data integrity.  
**Cần user quyết định:** Không.
