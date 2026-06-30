# Viva: Refund / dispute / khiếu nại

> Phạm vi: Customer gửi complaint sau Order, refund là kết quả xử lý support hoặc payment, không để Customer tự approve.

## Domain

1. **Câu hỏi:** Khi nào Customer không được cancel nữa?
   **Trả lời ngắn:** Sau giai đoạn `pending`.
   **Trả lời sâu:** Khi Order đã `preparing`, `ready` hoặc `delivering`, hủy đơn có thể ảnh hưởng Restaurant/Shipper. Lúc đó nên dùng complaint/refund flow.
   **File liên quan:** `CONTEXT.md`.

2. **Câu hỏi:** Complaint khác refund thế nào?
   **Trả lời ngắn:** Complaint là yêu cầu; refund là kết quả tiền.
   **Trả lời sâu:** Customer mô tả vấn đề qua complaint. Support/admin hoặc backend sau đó quyết định refund, reject hoặc resolve.
   **File liên quan:** PRD refund.

3. **Câu hỏi:** Vì sao cần reason?
   **Trả lời ngắn:** Để phân loại vấn đề.
   **Trả lời sâu:** Reason như missing item, wrong item, late delivery hoặc payment issue giúp support xử lý đúng nhóm và thống kê chất lượng.
   **File liên quan:** Complaint model.

4. **Câu hỏi:** Customer có tự approve refund không?
   **Trả lời ngắn:** Không.
   **Trả lời sâu:** Cho Customer tự approve sẽ tạo rủi ro gian lận. Customer chỉ tạo/read complaint, quyền approve thuộc admin/service role.
   **File liên quan:** RLS notes.

5. **Câu hỏi:** COD refund xử lý sao?
   **Trả lời ngắn:** Thường manual.
   **Trả lời sâu:** COD không có provider để reverse transaction tự động. Hệ thống có thể ghi case và trạng thái refund, còn xử lý tiền là vận hành.
   **File liên quan:** payment PRD.

## Android / MVVM

6. **Câu hỏi:** Complaint UI mở từ đâu?
   **Trả lời ngắn:** Từ Order detail.
   **Trả lời sâu:** Complaint phải gắn với Order cụ thể để backend kiểm tra ownership, status và thông tin thanh toán.
   **File liên quan:** `OrderDetailFragment`.

7. **Câu hỏi:** ViewModel cần validate gì?
   **Trả lời ngắn:** Eligibility, reason và độ dài note.
   **Trả lời sâu:** ViewModel chặn submit thiếu reason, note quá dài hoặc Order chưa đủ điều kiện trước khi gọi API.
   **File liên quan:** `ComplaintViewModel`.

8. **Câu hỏi:** Repository làm gì?
   **Trả lời ngắn:** Gọi create/list complaint.
   **Trả lời sâu:** `ComplaintRepository` tách network khỏi UI, xử lý mapping error và giúp test bằng fake repository.
   **File liên quan:** `ComplaintRepository`.

9. **Câu hỏi:** Upload photo fail thì sao?
   **Trả lời ngắn:** Cho retry hoặc submit không ảnh.
   **Trả lời sâu:** Photo nên optional trong MVP. Text complaint đủ để demo và tránh block Customer khi storage lỗi.
   **File liên quan:** UI states.

10. **Câu hỏi:** Test eligibility thế nào?
    **Trả lời ngắn:** Dùng fake Order status.
    **Trả lời sâu:** Assert nút complaint/state theo `pending`, `completed`, `cancelled`, `delivering` và các rule nghiệp vụ.
    **File liên quan:** unit tests.

## Supabase / API / RLS

11. **Câu hỏi:** RLS complaint cần gì?
    **Trả lời ngắn:** Customer chỉ thao tác complaint của Order thuộc mình.
    **Trả lời sâu:** Insert/select phải kiểm tra Order ownership qua `customer_id` hoặc mapping từ `auth.uid()`.
    **File liên quan:** future SQL.

12. **Câu hỏi:** Ai update complaint status?
    **Trả lời ngắn:** Admin hoặc service role.
    **Trả lời sâu:** Customer không được tự chuyển complaint sang `approved`, `refunded` hoặc `rejected`.
    **File liên quan:** policies.

13. **Câu hỏi:** Attachment cần bảo mật thế nào?
    **Trả lời ngắn:** Dùng scoped path và bucket không public nếu ảnh nhạy cảm.
    **Trả lời sâu:** Ảnh có thể chứa hóa đơn, địa chỉ hoặc mặt người. Access phải theo complaint ownership hoặc signed URL.
    **File liên quan:** storage.

14. **Câu hỏi:** Chống duplicate complaint ở đâu?
    **Trả lời ngắn:** Ở backend và ViewModel.
    **Trả lời sâu:** UI disable submit, backend có unique active complaint theo Order/reason hoặc RPC idempotency để retry không tạo trùng.
    **File liên quan:** RPC.

15. **Câu hỏi:** Complaint có ảnh hưởng trực tiếp Order status không?
    **Trả lời ngắn:** Không trực tiếp.
    **Trả lời sâu:** Complaint là support case riêng. Order status phản ánh giao món, còn complaint/refund phản ánh xử lý sau bán.
    **File liên quan:** domain.

## Edge Case và Trade-off

16. **Câu hỏi:** Order `pending` có report problem được không?
    **Trả lời ngắn:** Không nên, vì còn cancel được.
    **Trả lời sâu:** UI nên giải thích dùng cancel cho Order chưa xử lý, tránh tạo complaint không cần thiết.
    **File liên quan:** eligibility.

17. **Câu hỏi:** Network fail khi submit thì sao?
    **Trả lời ngắn:** Hiển thị retry.
    **Trả lời sâu:** Retry không được tạo duplicate; cần request id hoặc backend unique constraint.
    **File liên quan:** `ComplaintRepository`.

18. **Câu hỏi:** Admin reject complaint thì Customer thấy gì?
    **Trả lời ngắn:** Thấy trạng thái `rejected` hoặc `resolved`.
    **Trả lời sâu:** UI nên hiển thị status, thời gian cập nhật và message nếu có, không để Customer tưởng case vẫn pending.
    **File liên quan:** complaint summary.

19. **Câu hỏi:** Vì sao không làm admin dashboard trong repo này?
    **Trả lời ngắn:** Ngoài phạm vi Customer app.
    **Trả lời sâu:** Repo chỉ chứa app Customer. Admin dashboard cần quyền, workflow và UI khác.
    **File liên quan:** `CONTEXT.md`.

20. **Câu hỏi:** Vì sao photo optional?
    **Trả lời ngắn:** Giảm rủi ro upload và moderation.
    **Trả lời sâu:** Text complaint đủ cho demo. Ảnh thêm storage, quyền truy cập, kích thước file và kiểm duyệt nội dung.
    **File liên quan:** questions.
