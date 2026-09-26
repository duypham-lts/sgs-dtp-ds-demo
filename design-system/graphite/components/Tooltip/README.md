# Tooltip

Nhãn ngắn hiện khi hover hoặc focus bằng bàn phím; bắt buộc cho mọi control chỉ có icon và mọi status chỉ có icon (UI Guidelines §8).

- IconButton và StatusTag `compact` đã **tự bọc sẵn** Tooltip. Không cần thêm.
- Dùng để hiện nội dung bị cắt: tên file, metadata dài trong Document Item ở breakpoint nhỏ. Trên mobile, nội dung hiện khi chạm giữ.
- Chỉ chứa text thuần, tối đa khoảng 1 câu. Không đặt link hay nút trong tooltip.
- Esc để ẩn. Nội dung được gắn vào trigger qua `aria-describedby`.

Props: `label`, `placement` (`top`|`bottom`), `open` (ép hiển thị, dùng khi demo).
