# Câu hỏi khó: Refund / dispute / khiếu nại

## 1. Chỉ ghi complaint hay hoàn tiền thật?
**Câu hỏi:** MVP cần hoàn tiền qua payment gateway hay chỉ cần ghi nhận khiếu nại?  
**Vì sao quan trọng:** Hoàn tiền thật cần provider API, policy và admin/backend.  
**Phương án:** Complaint only; refund API thật; không làm refund.  
**Khuyến nghị:** Complaint only cho MVP Customer app.  
**Rủi ro nếu sai:** Kéo thêm admin/payment backend ngoài scope.  
**Cần user quyết định:** Có.

## 2. Order status nào được khiếu nại?
**Câu hỏi:** Customer được tạo complaint ở status nào?  
**Vì sao quan trọng:** `pending` còn có thể cancel, không cần complaint.  
**Phương án:** Chỉ `completed`; `delivering` + `completed`; mọi non-pending.  
**Khuyến nghị:** `delivering`, `completed`, và `cancelled` có payment issue; không áp dụng `pending`.  
**Rủi ro nếu sai:** Abuse hoặc UX rối giữa cancel và complaint.  
**Cần user quyết định:** Có.

## 3. Có cho nhiều complaint trên một Order không?
**Câu hỏi:** Một Order có thể có nhiều complaint active không?  
**Vì sao quan trọng:** Dễ spam và khó review.  
**Phương án:** Một active complaint; nhiều complaint; một complaint cho mỗi reason.  
**Khuyến nghị:** Một active complaint cho mỗi Order trong MVP.  
**Rủi ro nếu sai:** Dữ liệu support loạn.  
**Cần user quyết định:** Không.

## 4. Ảnh có bắt buộc không?
**Câu hỏi:** Customer có phải upload ảnh khi khiếu nại không?  
**Vì sao quan trọng:** Supabase Storage/RLS làm scope lớn hơn.  
**Phương án:** Optional; required; không hỗ trợ ảnh.  
**Khuyến nghị:** Ảnh optional; text complaint đủ cho demo.  
**Rủi ro nếu sai:** Upload fail làm Customer không gửi được complaint.  
**Cần user quyết định:** Có.

## 5. Ai đổi trạng thái complaint?
**Câu hỏi:** Customer app có được đổi `approved/rejected/resolved` không?  
**Vì sao quan trọng:** Customer tự approve refund là lỗ hổng.  
**Phương án:** Admin/manual; Customer; backend automation.  
**Khuyến nghị:** Chỉ admin/manual/service role đổi status.  
**Rủi ro nếu sai:** Gian lận refund.  
**Cần user quyết định:** Không.

## 6. Có hiển thị refund amount không?
**Câu hỏi:** Complaint screen có cho nhập/hiển thị số tiền hoàn không?  
**Vì sao quan trọng:** Refund amount là policy nghiệp vụ.  
**Phương án:** Không hiển thị amount; requested amount; approved amount.  
**Khuyến nghị:** Không hiển thị amount trong MVP.  
**Rủi ro nếu sai:** Customer hiểu nhầm là được hoàn tiền chắc chắn.  
**Cần user quyết định:** Có.

## 7. COD refund xử lý khác không?
**Câu hỏi:** COD và online payment có refund flow khác nhau không?  
**Vì sao quan trọng:** COD không có provider để reverse transaction.  
**Phương án:** Chung complaint; tách COD/manual; không refund COD.  
**Khuyến nghị:** Chung complaint, resolution manual.  
**Rủi ro nếu sai:** Logic phân nhánh quá sớm.  
**Cần user quyết định:** Không.

## 8. Attachment storage path thế nào?
**Câu hỏi:** Ảnh complaint nếu có thì lưu path ra sao?  
**Vì sao quan trọng:** Ảnh có thể nhạy cảm.  
**Phương án:** Public bucket; scoped theo Customer/Order; không upload.  
**Khuyến nghị:** Scoped path theo Customer/Order, không public.  
**Rủi ro nếu sai:** Lộ ảnh complaint.  
**Cần user quyết định:** Không.

## 9. Complaint có chặn reorder/rating không?
**Câu hỏi:** Nếu Order đang có complaint, Customer có được reorder hoặc rating không?  
**Vì sao quan trọng:** Các flow B/C có thể giao nhau.  
**Phương án:** Block cả hai; cho cả hai; chỉ block rating.  
**Khuyến nghị:** Cho reorder; rating vẫn cho nhưng ghi chú policy sau nếu cần.  
**Rủi ro nếu sai:** UX quá cứng hoặc review bị lợi dụng.  
**Cần user quyết định:** Có.

## 10. Refund/dispute thuộc nhóm ưu tiên nào?
**Câu hỏi:** Đây có phải flow bắt buộc cho demo chính không?  
**Vì sao quan trọng:** Nó không làm browse-cart-checkout chạy tốt hơn.  
**Phương án:** Group A; Group B; Group C.  
**Khuyến nghị:** Group C, chỉ làm nếu còn thời gian hoặc giáo viên yêu cầu.  
**Rủi ro nếu sai:** Lấy thời gian của Ordering MVP.  
**Cần user quyết định:** Có.
