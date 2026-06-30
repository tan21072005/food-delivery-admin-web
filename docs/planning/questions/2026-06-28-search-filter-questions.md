# Câu hỏi khó: Search và filter Món/Restaurant

## 1. Câu hỏi 1

**Câu hỏi:** Search mặc định nên hiển thị tất cả kết quả, chỉ Món hay chỉ Restaurant?

**Vì sao quan trọng:** Tất cả kết quả giúp discovery tốt hơn nhưng cần UI và ranking cho nhiều loại result.

**Phương án:** Tất cả kết quả; chỉ Món; chỉ Restaurant.

**Khuyến nghị:** Tất cả kết quả với tabs/chips cho Món và Restaurant.

**Rủi ro nếu sai:** Adapter và empty-state behavior có thể phải rework sau.

**Cần user quyết định?** Có.

## 2. Câu hỏi 2

**Câu hỏi:** MVP có bắt buộc dùng RPC `search_catalog` không, hay Android có thể combine REST calls?

**Vì sao quan trọng:** RPC gom ranking/filter tốt hơn nhưng cần SQL work và RLS review.

**Phương án:** RPC trước; REST trước; REST MVP rồi follow-up RPC.

**Khuyến nghị:** Giữ repository contract ổn định; nếu backend chưa sẵn sàng thì implement REST hoặc mock fallback có kiểm soát trước.

**Rủi ro nếu sai:** UI bị coupling vào query tạm thời.

**Cần user quyết định?** Có.

## 3. Câu hỏi 3

**Câu hỏi:** Bảng canonical cho DishCategory là `categories` hay `menu_categories`?

**Vì sao quan trọng:** Android `FoodCategory` đang map `cat_name`, nhưng `menus.category_id` trong SQL lại tham chiếu `menu_categories`.

**Phương án:** Dùng `categories`; dùng `menu_categories`; giữ cả hai nhưng map rõ vai trò.

**Khuyến nghị:** Dùng `menu_categories` cho filter Món và coi `categories` là legacy/demo cho tới khi refactor.

**Rủi ro nếu sai:** Category filtering trả sai hoặc rỗng mà khó phát hiện.

**Cần user quyết định?** Có.

## 4. Câu hỏi 4

**Câu hỏi:** Có bắt buộc seed Restaurant data trước Search MVP demo không?

**Vì sao quan trọng:** Nếu chỉ có Món mà thiếu Restaurant, search Restaurant sẽ trông giả hoặc không demo được.

**Phương án:** Bắt buộc seed Restaurant; dùng mock Restaurant; demo chỉ search Món.

**Khuyến nghị:** Tạo backend-owned seed task riêng; Android chỉ dùng mock fallback khi có feature flag/debug.

**Rủi ro nếu sai:** Restaurant search không thuyết phục trong viva/demo.

**Cần user quyết định?** Có.

## 5. Câu hỏi 5

**Câu hỏi:** Relevance nghĩa là gì khi kết hợp kết quả Món và Restaurant?

**Vì sao quan trọng:** Món và Restaurant có field/metric khác nhau.

**Phương án:** Exact/prefix keyword trước; rating/order count trước; chia section theo type.

**Khuyến nghị:** MVP relevance là exact/prefix name match, rồi contains match, rồi rating/order count.

**Rủi ro nếu sai:** Thứ tự search result có cảm giác random.

**Cần user quyết định?** Có.

## 6. Câu hỏi 6

**Câu hỏi:** Có bật distance filter/sort khi chưa có Customer GPS đáng tin cậy không?

**Vì sao quan trọng:** Distance cần location permission, coordinates và rule tính khoảng cách.

**Phương án:** Ẩn distance; chỉ show khi có coordinates; dùng mock distance.

**Khuyến nghị:** Chỉ show distance sort khi có coordinates; nếu không thì disable.

**Rủi ro nếu sai:** Customer hiểu nhầm kết quả "near me".

**Cần user quyết định?** Có.

## 7. Câu hỏi 7

**Câu hỏi:** Restaurant đóng cửa nên bị ẩn, disabled hay vẫn hiển thị bình thường?

**Vì sao quan trọng:** Hiển thị Restaurant đóng cửa hỗ trợ discovery, nhưng có thể tạo kỳ vọng đặt hàng sai.

**Phương án:** Hide by default; show với closed badge; show chỉ khi open-only filter tắt.

**Khuyến nghị:** Show Restaurant đóng cửa với closed badge; open-only filter sẽ ẩn chúng.

**Rủi ro nếu sai:** Customer đi tới Restaurant unavailable rồi fail ở checkout/add-to-cart.

**Cần user quyết định?** Có.

## 8. Câu hỏi 8

**Câu hỏi:** Anonymous Customer có được search catalogue không?

**Vì sao quan trọng:** Public catalogue phổ biến, nhưng RLS phải không leak seller/customer private data.

**Phương án:** Cho anonymous search; chỉ authenticated; anonymous limited.

**Khuyến nghị:** Cho anonymous đọc active public catalogue rows.

**Rủi ro nếu sai:** Search fail cho logged-out users hoặc expose data quá mức.

**Cần user quyết định?** Có.

## 9. Câu hỏi 9

**Câu hỏi:** Tap một Món từ Search nên mở Food detail hay Restaurant detail anchored tới Món đó?

**Vì sao quan trọng:** Search hiện có thể navigate tới Food detail, trong khi nhiều flow discovery đi qua Restaurant context.

**Phương án:** Food detail; Restaurant detail; bottom sheet quick add.

**Khuyến nghị:** Food detail cho Món result; Restaurant detail cho Restaurant result.

**Rủi ro nếu sai:** Customer path tới Cart không nhất quán.

**Cần user quyết định?** Có.

## 10. Câu hỏi 10

**Câu hỏi:** Search add-to-Cart dùng `LocalCart`, Supabase Cart RPC hay defer sang Food detail?

**Vì sao quan trọng:** Ordering MVP đang thay Cart semantics và có thể loại bỏ `LocalCart`.

**Phương án:** Giữ `LocalCart` tạm; gọi Supabase Cart RPC; remove quick add từ Search.

**Khuyến nghị:** Giữ Cart path hiện có sau adapter callback để Ordering MVP thay được; tránh business logic trong SearchFragment.

**Rủi ro nếu sai:** Merge conflict hoặc duplicate Cart behavior.

**Cần user quyết định?** Có.

## 11. Câu hỏi 11

**Câu hỏi:** Filter chỉ là inline chips hay cần bottom sheet?

**Vì sao quan trọng:** Bottom sheet có chỗ cho nhiều filter nhưng dễ overbuild MVP.

**Phương án:** Inline chips; bottom sheet; hybrid.

**Khuyến nghị:** Inline chips cho result type/open/sort; defer bottom sheet phức tạp.

**Rủi ro nếu sai:** UI scope phình vượt MVP.

**Cần user quyết định?** Có.

## 12. Câu hỏi 12

**Câu hỏi:** Feature này có nên cleanup mojibake tiếng Việt trong file code được chạm không?

**Vì sao quan trọng:** Sửa encoding cải thiện UX nhưng có thể tạo diff lớn và conflict với worker khác.

**Phương án:** Chỉ fix strings được chạm; giữ nguyên; tạo cleanup task riêng.

**Khuyến nghị:** Chỉ fix strings Search mới/chỉnh sửa; defer cleanup rộng.

**Rủi ro nếu sai:** Diff quá rộng hoặc copy demo không nhất quán.

**Cần user quyết định?** Có.
