# Câu hỏi khó: Restaurant info, promotions, reviews real data

## 1. `offers` là app-wide hay Restaurant-specific?
**Câu hỏi:** Active `offers` trong MVP dùng toàn app, hay promotions phải gắn Restaurant-specific trước khi ship?  
**Vì sao quan trọng:** Quyết định này ảnh hưởng schema, checkout eligibility và Restaurant detail.  
**Phương án:** App-wide `offers`; Restaurant-specific offers; app-wide trước rồi refactor.  
**Khuyến nghị:** MVP có thể app-wide nếu copy ghi rõ; Restaurant-specific là follow-up.  
**Rủi ro nếu sai:** Customer thấy promotion không áp dụng được cho Restaurant hiện tại.  
**Cần user quyết định:** Có.

## 2. Schema promotion theo Restaurant thiết kế ra sao?
**Câu hỏi:** Nếu cần Restaurant-specific promotions, nên dùng `restaurant_offers(restaurant_id, offer_id)` hay thêm nullable `restaurant_id` vào `offers`?  
**Vì sao quan trọng:** Quan hệ many-to-many và migration ảnh hưởng về sau.  
**Phương án:** Join table `restaurant_offers`; nullable `restaurant_id`; duplicate offer per Restaurant.  
**Khuyến nghị:** Dùng join table nếu promotion có thể áp dụng nhiều Restaurant.  
**Rủi ro nếu sai:** Schema khó mở rộng hoặc query promotion bị ambiguous.  
**Cần user quyết định:** Có.

## 3. Restaurant info fetch bằng REST hay RPC?
**Câu hỏi:** Restaurant info nên fetch bằng direct PostgREST table reads hay một RPC `get_restaurant_info` join timings và aggregates?  
**Vì sao quan trọng:** Một màn detail cần nhiều nguồn data và error state nhất quán.  
**Phương án:** Direct table reads; RPC aggregate; hybrid.  
**Khuyến nghị:** RPC cho detail aggregate nếu backend sẵn sàng, REST tối thiểu cho MVP.  
**Rủi ro nếu sai:** UI load lắt nhắt, over-fetch hoặc sai aggregate.  
**Cần user quyết định:** Không.

## 4. `restaurant_id = -1L` xử lý thế nào?
**Câu hỏi:** Release rule khi `restaurant_id = -1L` là block screen, pop back hay show retryable empty state?  
**Vì sao quan trọng:** Sentinel ID có thể từ mock/navigation cũ lọt vào real data flow.  
**Phương án:** Block và show lỗi; pop back; retryable empty state.  
**Khuyến nghị:** Block screen với error state rõ ràng và không gọi backend bằng `-1L`.  
**Rủi ro nếu sai:** API nhận ID giả và trả dữ liệu sai hoặc lỗi khó debug.  
**Cần user quyết định:** Không.

## 5. Aggregate rating hiện có có authoritative không?
**Câu hỏi:** `restaurants.avg_rating` và `restaurants.total_reviews` có được coi là authoritative nếu chưa có review table không?  
**Vì sao quan trọng:** UI review có thể hiển thị aggregate mà không có rows chi tiết.  
**Phương án:** Tin aggregate; coi là seed/demo only; ẩn aggregate tới khi có review rows.  
**Khuyến nghị:** Cho hiển thị aggregate nhưng ghi rõ nguồn seed/demo nếu chưa có review table.  
**Rủi ro nếu sai:** Customer thấy số review nhưng mở list lại trống không giải thích.  
**Cần user quyết định:** Có.

## 6. Khi có review table, aggregate cập nhật bằng gì?
**Câu hỏi:** Khi thêm review table, aggregate fields cập nhật bằng trigger, scheduled job hay computed view?  
**Vì sao quan trọng:** Aggregate phải nhất quán và không phụ thuộc Android.  
**Phương án:** Trigger; scheduled job; computed view.  
**Khuyến nghị:** Trigger hoặc RPC update trong transaction submit review.  
**Rủi ro nếu sai:** Rating/total_reviews bị stale hoặc bị client sửa.  
**Cần user quyết định:** Không.

## 7. Customer được review theo đơn vị nào?
**Câu hỏi:** Customer được một review per completed Order, per Restaurant, hay per OrderLine/Món?  
**Vì sao quan trọng:** Quyết định unique constraint và UI review.  
**Phương án:** Per Order; per Restaurant; per OrderLine/Món.  
**Khuyến nghị:** Per completed Order trong MVP.  
**Rủi ro nếu sai:** Duplicate hoặc aggregate rating không rõ nghĩa.  
**Cần user quyết định:** Có.

## 8. Review eligibility xử lý Order cancelled/refunded/disputed ra sao?
**Câu hỏi:** Các Order `cancelled`, refunded hoặc disputed có đủ điều kiện review không?  
**Vì sao quan trọng:** Review và complaint là hai luồng khác nhau.  
**Phương án:** Chỉ `completed`; cho disputed completed; cho tất cả non-pending.  
**Khuyến nghị:** Chỉ `completed`, dispute/refund đi luồng complaint riêng.  
**Rủi ro nếu sai:** Rating bị ảnh hưởng bởi đơn chưa hoàn tất.  
**Cần user quyết định:** Có.

## 9. Anonymous users có đọc reviews không?
**Câu hỏi:** Anonymous/anon-key users có được đọc tất cả Restaurant reviews không, hay một số detail cần authenticated access?  
**Vì sao quan trọng:** Public catalogue thường mở, nhưng phải sanitize PII.  
**Phương án:** Anonymous read sanitized reviews; authenticated only; anonymous limited aggregate.  
**Khuyến nghị:** Cho anonymous read sanitized public review fields.  
**Rủi ro nếu sai:** Logged-out browse bị nghèo dữ liệu hoặc lộ private fields.  
**Cần user quyết định:** Có.

## 10. Promotion hiển thị thế nào khi chưa biết subtotal?
**Câu hỏi:** App hiển thị promotions trên Restaurant detail ra sao khi checkout subtotal chưa có?  
**Vì sao quan trọng:** Một số discount phụ thuộc min subtotal.  
**Phương án:** Show điều kiện; chỉ show eligible sau Cart; ẩn promotion chưa tính được.  
**Khuyến nghị:** Show promotion kèm điều kiện áp dụng, không hứa discount chắc chắn.  
**Rủi ro nếu sai:** Customer kỳ vọng giảm giá nhưng checkout không áp dụng.  
**Cần user quyết định:** Không.

## 11. Promotion unavailable có hiển thị không?
**Câu hỏi:** Unavailable promotions nên hiển thị kèm lý do, ẩn hoàn toàn hay tách available/unavailable sections?  
**Vì sao quan trọng:** Thông tin này ảnh hưởng trust và độ rõ của UI.  
**Phương án:** Ẩn; show disabled với lý do; tách sections.  
**Khuyến nghị:** Show available trước, unavailable disabled nếu có lý do rõ.  
**Rủi ro nếu sai:** UI rối hoặc Customer không hiểu vì sao mã không dùng được.  
**Cần user quyết định:** Có.

## 12. Vocabulary cho `discount_type` dùng gì?
**Câu hỏi:** Promotions nên dùng status/vocabulary nào nếu `discount_type` hiện có `rate` nhưng Ordering MVP PRD nói `percent`?  
**Vì sao quan trọng:** Mismatch enum làm mapping và validation dễ sai.  
**Phương án:** Chuẩn hóa `percent`; giữ `rate`; hỗ trợ cả hai trong mapper.  
**Khuyến nghị:** Chọn một vocabulary canonical và migrate/docs trước khi UI phụ thuộc.  
**Rủi ro nếu sai:** Discount tính sai hoặc app không parse được.  
**Cần user quyết định:** Có.

## 13. Mismatch `order_status` giải quyết trước reviews thế nào?
**Câu hỏi:** Plan resolve mismatch giữa `docs/sql.sql` (`ready`, `on_the_way`, `delivered`) và `CONTEXT.md`/Ordering MVP (`ready_for_pickup`, `delivering`, `completed`) ra sao trước khi reviews phụ thuộc completed Orders?  
**Vì sao quan trọng:** Review eligibility dựa vào status.  
**Phương án:** Migrate enum; mapper compatibility; update docs only.  
**Khuyến nghị:** Chuẩn hóa status trong backend/docs trước khi review write path.  
**Rủi ro nếu sai:** Review bị enable/disable sai.  
**Cần user quyết định:** Có.

## 14. Open/closed status lấy từ đâu?
**Câu hỏi:** Restaurant open/closed status nên tin `restaurants.is_open`, tính từ `restaurant_timings`, hay kết hợp cả hai?  
**Vì sao quan trọng:** UI browse và add-to-cart phụ thuộc availability.  
**Phương án:** Tin `is_open`; tính từ timings; kết hợp override + timings.  
**Khuyến nghị:** Kết hợp: `is_open` là manual override, timings tính trạng thái hiện tại.  
**Rủi ro nếu sai:** Restaurant đóng vẫn nhận Order hoặc đang mở bị ẩn.  
**Cần user quyết định:** Có.

## 15. Empty state review copy viết gì?
**Câu hỏi:** Empty state copy nào chấp nhận được khi có aggregate counts thật nhưng chưa có review rows?  
**Vì sao quan trọng:** UI cần giải thích mismatch giữa count và list.  
**Phương án:** "Chưa có đánh giá hiển thị"; ẩn count; show aggregate only.  
**Khuyến nghị:** Nếu không có rows, show copy trung tính và không hứa danh sách chi tiết.  
**Rủi ro nếu sai:** Customer tưởng app load lỗi.  
**Cần user quyết định:** Có.

## 16. Giữ filter `ReviewItem.hasPhoto` không?
**Câu hỏi:** Có giữ filter `ReviewItem.hasPhoto` nếu review schema thật đầu tiên chưa hỗ trợ media không?  
**Vì sao quan trọng:** Filter không có data làm UI giả.  
**Phương án:** Ẩn filter; giữ disabled; thêm media schema ngay.  
**Khuyến nghị:** Ẩn filter tới khi media được hỗ trợ thật.  
**Rủi ro nếu sai:** Customer bấm filter và luôn thấy empty state khó hiểu.  
**Cần user quyết định:** Không.

## 17. Header Restaurant detail có thành real data cùng slice không?
**Câu hỏi:** Restaurant detail header cũng chuyển sang real data trong slice này, hay chỉ child screens?  
**Vì sao quan trọng:** Header mock cạnh child screens real data sẽ làm demo thiếu nhất quán.  
**Phương án:** Làm header real data; chỉ child screens; phase riêng.  
**Khuyến nghị:** Chuyển header sang real data tối thiểu nếu slice này chạm Restaurant detail.  
**Rủi ro nếu sai:** User thấy tên/rating ở header không khớp reviews/promotions.  
**Cần user quyết định:** Có.

## 18. Offline loading xử lý thế nào?
**Câu hỏi:** Real data loading offline nên dùng cached stale data, empty error hay retry-only?  
**Vì sao quan trọng:** Restaurant detail có thể mở từ nhiều entry points.  
**Phương án:** Cached stale data; error + retry; empty state.  
**Khuyến nghị:** Error + retry cho MVP, cache là phase sau nếu repository đã có pattern.  
**Rủi ro nếu sai:** App hiển thị data cũ như data mới.  
**Cần user quyết định:** Không.

## 19. Seed data demo cần gì?
**Câu hỏi:** Cần seed data nào để demo feature này mà không thêm fake fallback trong code?  
**Vì sao quan trọng:** Real data screen cần data đại diện.  
**Phương án:** Một Restaurant + offers + reviews; nhiều Restaurants; dùng mock fallback.  
**Khuyến nghị:** Seed ít nhất hai Restaurants, active offers và vài reviews sanitized.  
**Rủi ro nếu sai:** Demo trống hoặc phải quay lại mock data.  
**Cần user quyết định:** Có.

## 20. Ai sở hữu RLS cho reads mới?
**Câu hỏi:** Implementation worker nào sở hữu RLS policies cho các reads Restaurant/promotion/review mới exposed?  
**Vì sao quan trọng:** Expose read endpoints mà thiếu RLS/sanitization là risk bảo mật.  
**Phương án:** Backend worker; feature worker; security reviewer.  
**Khuyến nghị:** Feature worker viết policy/checklist, reviewer security xác nhận trước merge.  
**Rủi ro nếu sai:** Public reads lộ dữ liệu seller/customer không cần thiết.  
**Cần user quyết định:** Có.
