# Câu hỏi khó: Topping / size / options phức tạp

## 1. MVP option phức tạp đến đâu?
**Câu hỏi:** MVP chỉ cần option group một cấp hay cần nested configurator?  
**Vì sao quan trọng:** Schema và UI phức tạp tăng rất nhanh.  
**Phương án:** One-level groups; nested options; chỉ text label.  
**Khuyến nghị:** One-level groups: size required, topping optional.  
**Rủi ro nếu sai:** Over-engineer và làm chậm Cart/Checkout.  
**Cần user quyết định:** Có.

## 2. Size là field riêng hay option group?
**Câu hỏi:** Size nên được model như option group hay cột riêng của Món?  
**Vì sao quan trọng:** Ảnh hưởng validation và Cart merge key.  
**Phương án:** Option group; field riêng; bảng size riêng.  
**Khuyến nghị:** Size là option group required.  
**Rủi ro nếu sai:** Duplicated validation cho size/topping.  
**Cần user quyết định:** Không.

## 3. Lưu option ID hay label?
**Câu hỏi:** Cart/Order nên lưu selected option bằng ID hay snapshot label?  
**Vì sao quan trọng:** OrderLine phải bất biến sau checkout.  
**Phương án:** ID only; label only; ID + snapshot.  
**Khuyến nghị:** Cart lưu ID + display snapshot; OrderLine lưu snapshot bắt buộc.  
**Rủi ro nếu sai:** Lịch sử Order đổi khi Menu option đổi.  
**Cần user quyết định:** Không.

## 4. Ai tính giá option?
**Câu hỏi:** Android hay backend tính price delta cuối cùng?  
**Vì sao quan trọng:** Client có thể bị sửa request.  
**Phương án:** Android tính; backend tính; cả hai.  
**Khuyến nghị:** Android preview, backend recompute và quyết định cuối.  
**Rủi ro nếu sai:** Sai tổng tiền hoặc bị gian lận giá.  
**Cần user quyết định:** Không.

## 5. Option unavailable sau khi chọn thì sao?
**Câu hỏi:** Nếu Customer chọn topping nhưng backend đã mark unavailable thì xử lý thế nào?  
**Vì sao quan trọng:** Data có thể stale.  
**Phương án:** Cho qua; reject và reload; tự bỏ option.  
**Khuyến nghị:** Backend reject, app reload options và báo Customer.  
**Rủi ro nếu sai:** Order chứa option không bán được.  
**Cần user quyết định:** Không.

## 6. Cart merge key có bao gồm options không?
**Câu hỏi:** Hai CartItem cùng Món nhưng khác size/topping có merge không?  
**Vì sao quan trọng:** Nếu merge sai sẽ trộn hai cấu hình khác nhau.  
**Phương án:** Merge theo menu only; merge theo menu + option set; không merge.  
**Khuyến nghị:** Merge theo menu + option set.  
**Rủi ro nếu sai:** Size nhỏ và size lớn bị cộng quantity chung.  
**Cần user quyết định:** Không.

## 7. Reorder option cũ thế nào?
**Câu hỏi:** Khi reorder, option cũ được replay ra sao?  
**Vì sao quan trọng:** Option có thể bị xóa hoặc đổi giá.  
**Phương án:** Preserve label; validate ID; bỏ option.  
**Khuyến nghị:** Validate ID nếu còn; nếu không thì warn Customer và preserve label tham khảo.  
**Rủi ro nếu sai:** Reorder tạo Cart invalid.  
**Cần user quyết định:** Có.

## 8. Có cần inventory riêng cho topping không?
**Câu hỏi:** Mỗi topping có cần tồn kho riêng không?  
**Vì sao quan trọng:** Inventory làm schema/logic phức tạp.  
**Phương án:** Có inventory; chỉ `is_available`; không tracking.  
**Khuyến nghị:** MVP dùng `is_available`.  
**Rủi ro nếu sai:** Tốn thời gian xây inventory ngoài scope.  
**Cần user quyết định:** Có.

## 9. Search có filter theo option không?
**Câu hỏi:** Search/filter có cần tìm theo topping/size không?  
**Vì sao quan trọng:** Query phức tạp và ít cần cho demo.  
**Phương án:** Không; có; chỉ hiển thị option trong detail.  
**Khuyến nghị:** Không trong MVP.  
**Rủi ro nếu sai:** Search scope phình lớn.  
**Cần user quyết định:** Không.

## 10. Topping/options thuộc nhóm ưu tiên nào?
**Câu hỏi:** Có nên làm trước Ordering MVP không?  
**Vì sao quan trọng:** Nó chạm Menu, Cart, Checkout, OrderLine và Reorder.  
**Phương án:** Group A; Group B; Group C.  
**Khuyến nghị:** Group B sau core Cart/Checkout ổn định.  
**Rủi ro nếu sai:** Làm phức tạp checkout trước khi flow chính chạy.  
**Cần user quyết định:** Có.
