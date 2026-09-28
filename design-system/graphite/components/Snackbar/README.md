# Snackbar

Feedback after an action (saved, submitted); per the guideline it is a Material snackbar, **centred at the bottom of the screen, temporary, and auto-dismissing**.

- Mặc định tự ẩn sau 5 giây. Đặt `duration: 0` khi snackbar có action người dùng cần kịp bấm.
- Tối đa **một** action dạng text (màu `link-inverse` để đạt tương phản trên nền tối) và một nút đóng.
- Không dùng cho lỗi cần người dùng xử lý. Khi đó dùng InlineNotification `error` hoặc lỗi ngay dưới field.
- Mỗi lúc chỉ hiện một snackbar. Snackbar mới thay thế snackbar cũ.

Props: `message`, `action {label,onClick}`, `open`, `onClose`, `duration`, `inline` (hiện tại chỗ, dùng khi demo).
