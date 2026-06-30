# Câu hỏi khó: Realtime order tracking / shipper GPS

> Luồng: Customer xem tiến trình giao Order và vị trí shipper.  
> Lưu ý: repo này chỉ là Customer app; Seller/Shipper app không thuộc scope.

## 1. Realtime thật hay polling?
**Câu hỏi:** MVP cần realtime thật hay chỉ cần polling/manual refresh?  
**Vì sao quan trọng:** Realtime thật cần Shipper upload GPS, backend channel và lifecycle phức tạp hơn.  
**Phương án:** Polling; Supabase Realtime; FCM/data message; manual refresh.  
**Khuyến nghị:** Polling trong MVP khi màn Order detail đang mở.  
**Rủi ro nếu sai:** Demo không ổn định hoặc scope vượt khỏi Customer app.  
**Cần user quyết định:** Có.

## 2. Có cần Map SDK không?
**Câu hỏi:** Tracking MVP có bắt buộc hiển thị bản đồ không?  
**Vì sao quan trọng:** Map SDK cần API key, dependency, quota và xử lý UI phức tạp.  
**Phương án:** Timeline + tọa độ/card trạng thái; bản đồ thật; placeholder map.  
**Khuyến nghị:** Timeline + location card trước, map là phase sau.  
**Rủi ro nếu sai:** Bị block bởi API key hoặc layout map.  
**Cần user quyết định:** Có.

## 3. Ai cung cấp GPS?
**Câu hỏi:** Vị trí shipper lấy từ đâu khi repo không có Shipper app?  
**Vì sao quan trọng:** Customer app không thể tự tạo vị trí thật của shipper.  
**Phương án:** Manual seed trong Supabase; mock route; Shipper app future; admin update.  
**Khuyến nghị:** Manual seed/demo point trong Supabase cho MVP.  
**Rủi ro nếu sai:** Plan đòi một actor không tồn tại trong repo.  
**Cần user quyết định:** Có.

## 4. Poll interval bao lâu?
**Câu hỏi:** Nếu dùng polling, nên refresh bao nhiêu giây một lần?  
**Vì sao quan trọng:** Interval quá ngắn tốn pin/API; quá dài thì cảm giác không realtime.  
**Phương án:** 5 giây; 10-15 giây; chỉ manual refresh.  
**Khuyến nghị:** 15 giây khi màn hình visible, dừng khi rời màn hình.  
**Rủi ro nếu sai:** Tốn tài nguyên hoặc UX chậm.  
**Cần user quyết định:** Không.

## 5. Có hiển thị tên/số điện thoại shipper không?
**Câu hỏi:** Tracking có cần shipper name/phone không?  
**Vì sao quan trọng:** Đây là dữ liệu cá nhân và repo chưa có Shipper app thật.  
**Phương án:** Không hiển thị; hiển thị snapshot demo; hiển thị đầy đủ.  
**Khuyến nghị:** Optional snapshot demo, tránh phụ thuộc Shipper thật.  
**Rủi ro nếu sai:** Lộ PII hoặc tạo dữ liệu giả khó giải thích.  
**Cần user quyết định:** Có.

## 6. Completed Order có giữ GPS không?
**Câu hỏi:** Sau khi Order `completed`, Customer còn xem location trail không?  
**Vì sao quan trọng:** Vị trí shipper không nên bị lộ sau khi giao xong.  
**Phương án:** Giữ đầy đủ; chỉ giữ last point; ẩn tracking.  
**Khuyến nghị:** Ẩn tracking sau `completed`, chỉ giữ timeline/status.  
**Rủi ro nếu sai:** Tăng privacy risk không cần thiết.  
**Cần user quyết định:** Không.

## 7. ETA lấy từ đâu?
**Câu hỏi:** App có cần ETA chính xác không?  
**Vì sao quan trọng:** ETA thật cần route/distance engine hoặc backend tính.  
**Phương án:** Không ETA; ETA tĩnh/manual; ETA từ Maps.  
**Khuyến nghị:** ETA tĩnh/manual cho demo, hoặc không hiển thị nếu chưa có dữ liệu.  
**Rủi ro nếu sai:** Hứa thời gian giao sai.  
**Cần user quyết định:** Có.

## 8. RLS cho tracking point thế nào?
**Câu hỏi:** Customer nào được đọc `order_tracking_points`?  
**Vì sao quan trọng:** GPS là dữ liệu nhạy cảm.  
**Phương án:** Public read; Customer chỉ đọc Order của mình; đọc qua RPC service.  
**Khuyến nghị:** Customer chỉ đọc tracking point của Order thuộc về mình.  
**Rủi ro nếu sai:** Lộ vị trí shipper/Order cho user khác.  
**Cần user quyết định:** Không.

## 9. Chưa có GPS point thì sao?
**Câu hỏi:** UI nên hiển thị gì khi Order `delivering` nhưng chưa có point?  
**Vì sao quan trọng:** Đây là trạng thái bình thường trong demo/manual update.  
**Phương án:** Báo lỗi; hiển thị "chưa có vị trí"; fallback timeline.  
**Khuyến nghị:** Hiển thị tracking chưa khả dụng và vẫn giữ timeline.  
**Rủi ro nếu sai:** Customer tưởng app lỗi.  
**Cần user quyết định:** Không.

## 10. Tracking có bắt buộc cho Ordering MVP không?
**Câu hỏi:** Tracking/GPS có chặn checkout demo không?  
**Vì sao quan trọng:** Core demo là đặt món thành công, không phải GPS thật.  
**Phương án:** Bắt buộc; optional Group C; chỉ timeline status.  
**Khuyến nghị:** Optional Group C; nếu thiếu thời gian, chỉ làm timeline/status.  
**Rủi ro nếu sai:** Mất thời gian vào feature nâng cao.  
**Cần user quyết định:** Có.
