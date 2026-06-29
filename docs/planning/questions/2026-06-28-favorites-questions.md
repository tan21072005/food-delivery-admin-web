# Câu hỏi thiết kế: Favorites / Yêu thích

## 1. Entity nào được favorite?
**Câu hỏi:** MVP nên favorite Restaurants, Món hay cả hai?  
**Vì sao quan trọng:** UI đang nói "Quán yêu thích", Ordering MVP centered theo Restaurant, nhưng `nav_favorites.xml` hiện route tới `FoodDetailFragment`.  
**Phương án:** Chỉ Restaurant; chỉ Món; cả hai với tabs.  
**Khuyến nghị:** Chỉ Restaurant.  
**Rủi ro nếu sai:** Nếu chọn Món, Favorites đụng mock state của Menu/Food detail và không hỗ trợ Cart theo Restaurant tự nhiên.  
**Cần user quyết định:** Có.

## 2. Customer chưa đăng nhập thấy Favorites thế nào?
**Câu hỏi:** Favorites tab nên navigate ngay tới Login hay hiển thị màn cần đăng nhập?  
**Vì sao quan trọng:** Bottom navigation tab không nên tạo cảm giác hỏng, còn auto Login có thể gây bất ngờ.  
**Phương án:** Hiển thị login-required state; auto-navigate Login; local anonymous favorites.  
**Khuyến nghị:** Hiển thị login-required state với Login CTA.  
**Rủi ro nếu sai:** Auto-navigation có thể trap user; anonymous favorites kéo thêm merge complexity.  
**Cần user quyết định:** Có.

## 3. Favorite toggle có optimistic không?
**Câu hỏi:** Heart icon có update trước khi Supabase confirm success không?  
**Vì sao quan trọng:** Food app cần phản hồi nhanh, nhưng failed write cần rollback.  
**Phương án:** Optimistic with rollback; wait for server; disable favorite tới lần refresh sau.  
**Khuyến nghị:** Optimistic with rollback và disable state khi request in-flight.  
**Rủi ro nếu sai:** Không rollback thì UI nói dối; không optimistic thì UI chậm.  
**Cần user quyết định:** Có.

## 4. Dùng table name và ownership column nào?
**Câu hỏi:** Schema nên dùng `customer_favorite_restaurants.user_id` hay `customer_id`?  
**Vì sao quan trọng:** Domain docs ưu tiên Customer, live schema dùng `users.id` và code dùng User models.  
**Phương án:** `user_id`; `customer_id`; separate `customers` table.  
**Khuyến nghị:** Dùng `user_id` để tương thích schema, code/docs mô tả là Customer-owned.  
**Rủi ro nếu sai:** `customer_id` khi chưa có Customer table sẽ tạo foreign key lệch.  
**Cần user quyết định:** Có.

## 5. REST endpoint hay RPC?
**Câu hỏi:** Android list favorites bằng PostgREST joins hay RPC?  
**Vì sao quan trọng:** Retrofit/Gson có thể khó parse nested PostgREST, RPC trả JSON sạch hơn.  
**Phương án:** REST table calls; RPC `get_favorite_restaurants`; cả hai.  
**Khuyến nghị:** REST cho add/remove/state; RPC hoặc view cho list nếu nested join quá rối.  
**Rủi ro nếu sai:** RPC `SECURITY DEFINER` có thể bypass RLS nếu viết cẩu thả.  
**Cần user quyết định:** Không.

## 6. RLS cho Favorites thiết kế thế nào?
**Câu hỏi:** Policies nào bảo vệ favorites?  
**Vì sao quan trọng:** Favorites là account data và không được cho Customer khác đọc/ghi.  
**Phương án:** RLS với `(select auth.uid())` join `users.auth_uid`; app-provided `user_id`; no RLS trong demo.  
**Khuyến nghị:** RLS dùng authenticated role và ownership predicate từ `auth.uid()`.  
**Rủi ro nếu sai:** App-provided `user_id` gây IDOR/BOLA; no RLS leak hành vi user.  
**Cần user quyết định:** Không.

## 7. Duplicate taps xử lý thế nào?
**Câu hỏi:** Điều gì xảy ra nếu Customer bấm heart liên tục trước khi network trả về?  
**Vì sao quan trọng:** Insert/delete lặp có thể flicker và sai final state.  
**Phương án:** Disable heart khi request in-flight; queue last desired state; cho phép mọi taps.  
**Khuyến nghị:** Disable theo từng Restaurant khi request đang chạy.  
**Rủi ro nếu sai:** Race condition và Toast khó hiểu.  
**Cần user quyết định:** Không.

## 8. Restaurant bị xóa hoặc inactive thì sao?
**Câu hỏi:** Favorites có hiển thị inactive/deleted Restaurants không?  
**Vì sao quan trọng:** Restaurant đã lưu có thể đóng, ẩn hoặc soft-delete.  
**Phương án:** Ẩn deleted/inactive; show disabled card; auto-remove.  
**Khuyến nghị:** Ẩn `deleted_at is not null`, hiển thị inactive/open-closed state cho Restaurant chưa deleted.  
**Rủi ro nếu sai:** Auto-remove gây bất ngờ; show deleted rows trông hỏng.  
**Cần user quyết định:** Có.

## 9. Empty state CTA đi đâu?
**Câu hỏi:** Favorites rỗng nên đưa Customer tới đâu?  
**Vì sao quan trọng:** Favorites là bottom tab và cần recovery path tự nhiên.  
**Phương án:** Navigate Home; open Search; open Menu category sheet.  
**Khuyến nghị:** Navigate Home.  
**Rủi ro nếu sai:** Search/Menu có thể phụ thuộc flow chưa hoàn thiện.  
**Cần user quyết định:** Có.

## 10. Heart state xuất hiện ở card nào?
**Câu hỏi:** Mọi Restaurant/card list có cần show heart state trong MVP không?  
**Vì sao quan trọng:** Consistency tốt nhưng Home cards hiện dựa trên mock `FoodItem` Restaurant cards.  
**Phương án:** Chỉ Restaurant detail; detail + Favorites list; mọi Home/Menu Restaurant cards.  
**Khuyến nghị:** Detail + Favorites list cho MVP, sau đó thêm vào Home/Menu khi Restaurant model ổn định.  
**Rủi ro nếu sai:** Thêm heart vào mock `FoodItem` cards có thể wire sai IDs.  
**Cần user quyết định:** Có.

## 11. Favorites xử lý mock data thế nào?
**Câu hỏi:** Favorites có support mock Restaurants khi Supabase trả empty/fail không?  
**Vì sao quan trọng:** Screen hiện fallback mock data, nhưng persistence không có nghĩa với fake IDs.  
**Phương án:** Không mock favorites; yêu cầu demo seed data; mock-only developer mode.  
**Khuyến nghị:** Không mock favorites; yêu cầu seeded Restaurants cho demo.  
**Rủi ro nếu sai:** Mock favorites pass UI demo nhưng che lỗi backend integration.  
**Cần user quyết định:** Không.

## 12. Favorites có block Ordering MVP không?
**Câu hỏi:** Favorites có chặn Ordering MVP acceptance hay là discovery enhancement riêng?  
**Vì sao quan trọng:** Favorites cải thiện demo flow nhưng không bắt buộc để place Order.  
**Phương án:** Release blocker; separate ready-for-agent issue; future scope.  
**Khuyến nghị:** Separate ready-for-agent issue, không coupling Cart/Checkout.  
**Rủi ro nếu sai:** Xem là blocker có thể phân tán khỏi Cart/Checkout reliability.  
**Cần user quyết định:** Có.
