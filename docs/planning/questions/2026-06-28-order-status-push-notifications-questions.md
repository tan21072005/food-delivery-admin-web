# Câu hỏi khó: Push notification cho trạng thái Order

## 1. FCM thật hay local notification demo trước?
**Câu hỏi:** MVP nên dùng FCM thật hay local notification từ polling?  
**Vì sao quan trọng:** FCM cần backend key/trigger, còn local notification demo nhanh hơn.  
**Phương án:** Local polling; FCM thật; chỉ in-app status.  
**Khuyến nghị:** Local polling trước, FCM là future scope.  
**Rủi ro nếu sai:** Feature bị block bởi service key hoặc backend trigger.  
**Cần user quyết định:** Có.

## 2. Status nào cần thông báo?
**Câu hỏi:** App nên notify những status nào?  
**Vì sao quan trọng:** Notify quá nhiều gây spam, quá ít làm Customer thiếu thông tin.  
**Phương án:** Tất cả status; chỉ status quan trọng; chỉ `delivering` và `completed`.  
**Khuyến nghị:** Notify `confirmed`, `preparing`, `delivering`, `completed`, `cancelled`.  
**Rủi ro nếu sai:** Customer bị làm phiền hoặc bỏ lỡ thay đổi quan trọng.  
**Cần user quyết định:** Có.

## 3. Customer từ chối permission thì sao?
**Câu hỏi:** Android 13+ cần notification permission; nếu bị denied thì app làm gì?  
**Vì sao quan trọng:** Feature phụ không được làm hỏng Order flow.  
**Phương án:** Block checkout; chỉ hiển thị in-app; hỏi lại liên tục.  
**Khuyến nghị:** Chỉ hiển thị in-app status, không block checkout/order.  
**Rủi ro nếu sai:** UX bị kẹt vì một permission không thiết yếu.  
**Cần user quyết định:** Không.

## 4. Lưu FCM token ở đâu?
**Câu hỏi:** FCM token nên lưu trong `users` hay bảng riêng?  
**Vì sao quan trọng:** Một Customer có thể có nhiều thiết bị.  
**Phương án:** Cột trong `users`; bảng token riêng; không lưu token trong MVP.  
**Khuyến nghị:** Dùng bảng token riêng nếu làm FCM thật.  
**Rủi ro nếu sai:** Multi-device không hoạt động đúng hoặc token cũ ghi đè token mới.  
**Cần user quyết định:** Không.

## 5. Chống duplicate notification thế nào?
**Câu hỏi:** Polling có thể phát cùng status nhiều lần, xử lý ra sao?  
**Vì sao quan trọng:** Notification lặp làm app trông lỗi.  
**Phương án:** Lưu last notified status local; server audit; không xử lý.  
**Khuyến nghị:** Lưu last status local cho MVP, server audit để sau.  
**Rủi ro nếu sai:** Customer nhận nhiều notification giống nhau.  
**Cần user quyết định:** Không.

## 6. Có cần in-app toggle không?
**Câu hỏi:** Customer có cần bật/tắt notification trong app không?  
**Vì sao quan trọng:** Toggle riêng kéo thêm Settings scope và sync preference.  
**Phương án:** Chỉ dùng OS permission; thêm in-app toggle; không hỗ trợ tắt.  
**Khuyến nghị:** MVP dùng OS permission là đủ.  
**Rủi ro nếu sai:** Tốn thời gian cho settings không cần demo.  
**Cần user quyết định:** Có.

## 7. Tap notification mở màn nào?
**Câu hỏi:** Khi tap notification, app mở Order list hay Order detail?  
**Vì sao quan trọng:** Customer muốn xem đúng đơn vừa update.  
**Phương án:** Order detail; Order list; Home.  
**Khuyến nghị:** Mở Order detail bằng `orderId`.  
**Rủi ro nếu sai:** Customer phải tự tìm lại Order.  
**Cần user quyết định:** Không.

## 8. Ai gửi notification thật?
**Câu hỏi:** Android app có tự gửi push thật không?  
**Vì sao quan trọng:** App không thể giữ server key an toàn.  
**Phương án:** Backend/edge function; app polling local; FCM console thủ công.  
**Khuyến nghị:** Local polling cho MVP, backend sender là future scope.  
**Rủi ro nếu sai:** Đặt secret vào app hoặc push không chạy khi app bị kill.  
**Cần user quyết định:** Có.

## 9. Có đưa ETA vào notification không?
**Câu hỏi:** Notification có cần hiển thị ETA giao hàng không?  
**Vì sao quan trọng:** ETA phụ thuộc tracking/GPS và tính toán route.  
**Phương án:** Chỉ status; status + ETA; status + shipper info.  
**Khuyến nghị:** Chỉ status trong MVP.  
**Rủi ro nếu sai:** Thêm dependency tracking vào notification.  
**Cần user quyết định:** Không.

## 10. Có cần notification inbox không?
**Câu hỏi:** App có cần màn hình lịch sử notification không?  
**Vì sao quan trọng:** Inbox cần screen, schema và read/unread state.  
**Phương án:** Không; audit table backend; inbox UI.  
**Khuyến nghị:** Không làm inbox trong MVP.  
**Rủi ro nếu sai:** Scope phình mà không phục vụ demo chính.  
**Cần user quyết định:** Có.
