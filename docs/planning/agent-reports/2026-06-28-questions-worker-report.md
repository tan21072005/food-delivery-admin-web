# Báo cáo worker câu hỏi khó - 2026-06-28

## Vai trò

Worker phụ trách bộ câu hỏi khó cho 12 luồng Customer app còn thiếu.

## Phạm vi

- Dịch và làm sạch các file `docs/planning/questions/2026-06-28-*-questions.md`.
- Đảm bảo mỗi file có ít nhất 10 câu hỏi.
- Không sửa app code.

## Kết quả

- 12 file questions đã có đủ câu hỏi để Coordinator dùng khi chốt scope với user hoặc giao code worker.
- File `2026-06-28-search-filter-questions.md` đã được Coordinator chuẩn hóa heading sang dạng `## N. ...` để script audit đếm đúng.

## Artifact chính

- `docs/planning/questions/2026-06-28-discovery-home-browse-menu-questions.md`
- `docs/planning/questions/2026-06-28-search-filter-questions.md`
- `docs/planning/questions/2026-06-28-favorites-questions.md`
- `docs/planning/questions/2026-06-28-delivery-address-management-questions.md`
- `docs/planning/questions/2026-06-28-restaurant-info-promotions-reviews-questions.md`
- `docs/planning/questions/2026-06-28-post-order-rating-review-questions.md`
- `docs/planning/questions/2026-06-28-non-cod-payment-gateway-questions.md`
- `docs/planning/questions/2026-06-28-order-status-push-notifications-questions.md`
- `docs/planning/questions/2026-06-28-realtime-order-tracking-shipper-gps-questions.md`
- `docs/planning/questions/2026-06-28-refund-dispute-complaint-questions.md`
- `docs/planning/questions/2026-06-28-advanced-reorder-questions.md`
- `docs/planning/questions/2026-06-28-topping-size-options-questions.md`

## Coordinator ghi chú

- Các câu hỏi là decision log chưa được user duyệt.
- Khi bắt đầu implementation, Coordinator nên chọn và chốt câu hỏi của đúng flow trước, đặc biệt cho Payment, Tracking/GPS, Refund/Dispute và Topping/options.
