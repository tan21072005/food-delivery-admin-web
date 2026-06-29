# Câu hỏi planning: Discovery / Home / Browse Restaurant / Full Menu

## 1. Home discovery chips đại diện cho gì?
**Câu hỏi:** Home chips nên đại diện cho Cuisine, DishCategory hay editorial categories?  
**Vì sao quan trọng:** Quyết định này ảnh hưởng data model, API filters và kỳ vọng của Customer.  
**Phương án:** Cuisine chips; DishCategory chips; mixed editorial chips.  
**Khuyến nghị:** Dùng Cuisine chips cho Restaurant discovery, DishCategory chỉ dùng bên trong Restaurant Menu.  
**Rủi ro nếu sai:** Customer bấm "Pho" mong thấy Restaurants nhưng lại thấy Món rời rạc không có context Restaurant.  
**Cần user quyết định:** Có.

## 2. Tap một Home Món mở màn nào?
**Câu hỏi:** Home Món nên mở Food detail hay Restaurant detail?  
**Vì sao quan trọng:** Code hiện route một số Home item click sang Restaurant detail bằng `restaurant_id`.  
**Phương án:** Mở Food detail; mở Restaurant detail; mở Food detail kèm Restaurant context.  
**Khuyến nghị:** Mở Food detail kèm Restaurant context và có entry sang Restaurant.  
**Rủi ro nếu sai:** Customer không xem được chi tiết Món trước khi thêm, hoặc mất context Restaurant.  
**Cần user quyết định:** Có.

## 3. Restaurant đóng cửa hiển thị thế nào?
**Câu hỏi:** Restaurant đang đóng nên bị ẩn, hiển thị disabled, hay vẫn browse được đầy đủ?  
**Vì sao quan trọng:** Ảnh hưởng conversion, trust và nguy cơ tạo Cart không hợp lệ.  
**Phương án:** Ẩn; hiển thị disabled; cho browse nhưng disable add-to-cart.  
**Khuyến nghị:** Cho browse nhưng disable add-to-cart trong MVP.  
**Rủi ro nếu sai:** Customer có thể thêm món từ Restaurant không nhận Order.  
**Cần user quyết định:** Có.

## 4. Nguồn canonical cho popularity là gì?
**Câu hỏi:** Top-selling nên dùng `soldCount`, `total_orders`, `rating` hay giá trị do RPC tính?  
**Vì sao quan trọng:** `FoodItem.soldCount` hiện chỉ là local-only.  
**Phương án:** Sort theo rating; aggregate order count; manual featured list.  
**Khuyến nghị:** Dùng order count do RPC tính khi có; tạm dùng rating như tín hiệu tham khảo.  
**Rủi ro nếu sai:** "Top selling" gây hiểu nhầm hoặc không verify được.  
**Cần user quyết định:** Không cho MVP; có trước release polish.

## 5. Distance có bắt buộc trong MVP không?
**Câu hỏi:** Home có nên sort Restaurants theo khoảng cách vật lý không?  
**Vì sao quan trọng:** Cần location permission, coordinates và distance calculation.  
**Phương án:** Không distance; approximate distance từ saved address; GPS distance.  
**Khuyến nghị:** Không distance trong MVP; sort open first rồi rating.  
**Rủi ro nếu sai:** Scope mở rộng sang permissions, geocoding và delivery fee.  
**Cần user quyết định:** Có.

## 6. Món unavailable hiển thị thế nào?
**Câu hỏi:** Món unavailable nên bị ẩn hay hiển thị disabled?  
**Vì sao quan trọng:** Ảnh hưởng độ đầy đủ của Restaurant Menu và safety khi add-to-cart.  
**Phương án:** Ẩn; hiển thị disabled; hiển thị với nhãn "sold out".  
**Khuyến nghị:** Hiển thị disabled với status label trong Restaurant Menu; ẩn khỏi Home top lists.  
**Rủi ro nếu sai:** Customer cố đặt món không còn bán hoặc nghĩ Menu bị thiếu.  
**Cần user quyết định:** Có.

## 7. Add-to-cart có cần login không?
**Câu hỏi:** Customer anonymous có được tạo local draft không, hay phải login trước khi thêm món?  
**Vì sao quan trọng:** Ordering MVP Cart được persist theo Customer.  
**Phương án:** Require login before add; allow local draft then merge; allow browse only.  
**Khuyến nghị:** Require login before add trong MVP.  
**Rủi ro nếu sai:** Local/remote Cart merge trở thành project ẩn.  
**Cần user quyết định:** Có.

## 8. Payload MVP cho Restaurant detail gồm gì?
**Câu hỏi:** Restaurant detail bắt buộc hiển thị những field nào?  
**Vì sao quan trọng:** Quyết định shape của RPC/REST select và UI binding.  
**Phương án:** Tối thiểu name/address/open/menu; thêm rating/reviews/promos; full seller profile.  
**Khuyến nghị:** Name, address, cover/logo, open status, rating, review count, active Menu và links tới reviews/promotions.  
**Rủi ro nếu sai:** Screen quá trống hoặc kéo dữ liệu seller-only.  
**Cần user quyết định:** Không, trừ khi design muốn polish promo/review.

## 9. Home dùng RPC hay REST riêng lẻ?
**Câu hỏi:** Home nên load qua `get_home_data` hay nhiều REST requests?  
**Vì sao quan trọng:** Ảnh hưởng error handling, performance và test seams.  
**Phương án:** Single RPC; multiple REST calls; hybrid.  
**Khuyến nghị:** Single RPC cho Home aggregate, REST/RPC focused cho detail screens.  
**Rủi ro nếu sai:** Home flicker, load một phần không nhất quán hoặc over-fetch.  
**Cần user quyết định:** Không.

## 10. Có rename `FoodItem` thành `Mon` không?
**Câu hỏi:** Có nên rename legacy `FoodItem` ngay bây giờ không?  
**Vì sao quan trọng:** Cân bằng domain clarity với regression risk.  
**Phương án:** Rename now; keep DTO but document as Mon; introduce wrapper model.  
**Khuyến nghị:** Giữ `FoodItem` cho MVP và document là legacy Mon DTO.  
**Rủi ro nếu sai:** Rename rộng gây regression across adapters/navigation.  
**Cần user quyết định:** Không.

## 11. Browse screen là Restaurant list hay Món list?
**Câu hỏi:** Browse là Restaurant list, Món list hay cả hai?  
**Vì sao quan trọng:** `MenuFragment` hiện là Món list nhưng flow name có Browse Restaurant.  
**Phương án:** Restaurant browse screen; Món browse screen; tabbed browse.  
**Khuyến nghị:** Restaurant browse cho Cuisine; Món list chỉ trong Restaurant Menu hoặc Search.  
**Rủi ro nếu sai:** Customer thêm Món mà không hiểu grouping theo Restaurant.  
**Cần user quyết định:** Có.

## 12. Chuyển từ `LocalCart` sang Cart thật thế nào?
**Câu hỏi:** Khi Ordering MVP land, discovery nên thay `LocalCart` bằng gì?  
**Vì sao quan trọng:** Home/Menu/Food detail hiện add vào in-memory Cart.  
**Phương án:** Direct `CartRepository` calls; shared `CartViewModel`; feature flag transition.  
**Khuyến nghị:** Shared Cart ViewModel backed by CartRepository, repository enforce server calls.  
**Rủi ro nếu sai:** Sticky Cart, Checkout và Order draft diverge.  
**Cần user quyết định:** Không, trừ khi Ordering worker chọn public interface khác.

## 13. Seed data demo cần gì?
**Câu hỏi:** Cần bao nhiêu Restaurants, Cuisines, DishCategories và Món để demo?  
**Vì sao quan trọng:** Chất lượng demo thủ công phụ thuộc data đại diện.  
**Phương án:** Một Restaurant tối thiểu; hai Restaurants; full demo set.  
**Khuyến nghị:** Ít nhất hai Restaurants, ba DishCategories, hai Cuisines và tám Món active.  
**Rủi ro nếu sai:** Không demo được per-Restaurant Cart và filtering.  
**Cần user quyết định:** Không.

## 14. Reviews/promotions có cần real data trong MVP không?
**Câu hỏi:** Restaurant detail review/promo links có cần load real backend data không?  
**Vì sao quan trọng:** Navigation hiện đã có links tới các màn này.  
**Phương án:** Giữ links nhưng static/empty; real read-only data; ẩn tới khi sẵn sàng.  
**Khuyến nghị:** Giữ links nếu screens đã tồn tại, nhưng show empty/read-only states trừ khi có data.  
**Rủi ro nếu sai:** Customer thấy navigation hỏng từ Restaurant detail.  
**Cần user quyết định:** Có.
