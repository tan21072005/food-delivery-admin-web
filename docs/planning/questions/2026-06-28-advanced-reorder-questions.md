# Câu hỏi khó: Reorder nâng cao

## 1. Order nào được reorder?
**Câu hỏi:** Customer được reorder Order nào?  
**Vì sao quan trọng:** Quy tắc eligibility ảnh hưởng UI và backend.  
**Phương án:** Chỉ `completed`; `completed` + `cancelled`; mọi Order.  
**Khuyến nghị:** MVP chỉ cho reorder Order `completed`.  
**Rủi ro nếu sai:** Customer hiểu nhầm giữa retry đơn bị hủy và đặt lại đơn đã nhận.  
**Cần user quyết định:** Có.

## 2. Merge hay replace Cart hiện có?
**Câu hỏi:** Nếu Restaurant đã có Cart draft, reorder nên merge hay replace?  
**Vì sao quan trọng:** Replace có thể làm mất Cart hiện tại.  
**Phương án:** Merge; replace; hỏi Customer.  
**Khuyến nghị:** Hỏi Customer, default là merge.  
**Rủi ro nếu sai:** Ghi đè Cart và làm mất lựa chọn hiện tại.  
**Cần user quyết định:** Có.

## 3. Giá thay đổi xử lý thế nào?
**Câu hỏi:** Reorder dùng giá cũ trong OrderLine hay giá hiện tại của Menu?  
**Vì sao quan trọng:** OrderLine là snapshot lịch sử, không phải giá bán hiện tại.  
**Phương án:** Dùng giá cũ; dùng giá hiện tại và cảnh báo; block nếu giá đổi.  
**Khuyến nghị:** Dùng giá hiện tại và hiển thị cảnh báo.  
**Rủi ro nếu sai:** Tổng tiền checkout sai hoặc gây tranh cãi.  
**Cần user quyết định:** Không.

## 4. Món unavailable xử lý thế nào?
**Câu hỏi:** Nếu một số Món trong Order cũ đã unavailable thì sao?  
**Vì sao quan trọng:** Reorder thường gặp partial success.  
**Phương án:** Bỏ qua Món unavailable; block toàn bộ; cho Customer chọn.  
**Khuyến nghị:** Bỏ qua Món unavailable và show summary.  
**Rủi ro nếu sai:** Customer không biết vì sao đơn đặt lại thiếu Món.  
**Cần user quyết định:** Không.

## 5. Có giữ note/options cũ không?
**Câu hỏi:** Reorder có preserve note/topping/size cũ không?  
**Vì sao quan trọng:** Customer kỳ vọng món đặt lại giống đơn cũ.  
**Phương án:** Preserve text; validate option IDs; bỏ options.  
**Khuyến nghị:** MVP preserve text, validate IDs nếu topping/options đã có.  
**Rủi ro nếu sai:** Option không còn hợp lệ nhưng vẫn vào Cart.  
**Cần user quyết định:** Có.

## 6. Dùng backend RPC hay client loop?
**Câu hỏi:** Reorder nên là một RPC transaction hay Android gọi nhiều API?  
**Vì sao quan trọng:** Cần tránh partial write vào Cart.  
**Phương án:** RPC transaction; client loop; mixed.  
**Khuyến nghị:** RPC transaction.  
**Rủi ro nếu sai:** Cart bị thêm một nửa rồi fail.  
**Cần user quyết định:** Không.

## 7. Restaurant đang đóng cửa thì sao?
**Câu hỏi:** Customer có được reorder từ Restaurant đang đóng cửa không?  
**Vì sao quan trọng:** Có thể tạo Cart không checkout được.  
**Phương án:** Block; cho tạo draft; show warning.  
**Khuyến nghị:** Cho draft có warning nhưng không cho checkout, hoặc block nếu muốn MVP chặt hơn.  
**Rủi ro nếu sai:** Customer tới checkout mới biết không đặt được.  
**Cần user quyết định:** Có.

## 8. Dòng Cart trùng xử lý thế nào?
**Câu hỏi:** Nếu Cart đã có cùng Món/cùng option set thì tạo dòng mới hay tăng quantity?  
**Vì sao quan trọng:** Cart cần gọn và đúng nghĩa.  
**Phương án:** Tăng quantity; tạo dòng mới; hỏi Customer.  
**Khuyến nghị:** Tăng quantity khi cùng Món và cùng option set.  
**Rủi ro nếu sai:** Cart có nhiều dòng trùng khó hiểu.  
**Cần user quyết định:** Không.

## 9. Có copy DeliveryAddress cũ không?
**Câu hỏi:** Reorder có tự dùng DeliveryAddress của Order cũ không?  
**Vì sao quan trọng:** Địa chỉ cũ có thể không còn đúng.  
**Phương án:** Không copy; preselect default; show old as reference.  
**Khuyến nghị:** Preselect default hiện tại, chỉ show địa chỉ cũ để tham khảo nếu cần.  
**Rủi ro nếu sai:** Giao nhầm địa chỉ.  
**Cần user quyết định:** Có.

## 10. Reorder nằm nhóm ưu tiên nào?
**Câu hỏi:** Reorder có phải core demo không?  
**Vì sao quan trọng:** Nó phụ thuộc Ordering MVP và Order history.  
**Phương án:** Group A; Group B; Group C.  
**Khuyến nghị:** Group B, làm sau checkout/order ổn định.  
**Rủi ro nếu sai:** Mất thời gian trước khi core flow chạy.  
**Cần user quyết định:** Có.
