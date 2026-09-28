# Modal

A blocking dialog for a confirmation or a short input; while it is open, **the whole background is dimmed** with `overlay` (UI Guidelines §9).

- Cỡ `sm` 400 / `md` 560 / `lg` 800px, hoặc **`fit`**: rộng đúng bằng nội dung cộng 24px mỗi bên, dùng khi form trong modal có độ rộng field cố định (ví dụ Approve & assign). Radius `radius-card`.
- Tiêu đề là câu hỏi hoặc hành động ("Submit service request?"). Nút chính đặt bên phải, nút huỷ (`ghost`) bên trái nó. Thao tác xoá dùng `danger`.
- Focus vào phần tử đầu tiên khi mở, giữ focus bên trong, Esc để đóng, và trả focus về chỗ cũ khi đóng. Khi mở thì khoá cuộn nền.
- Không lồng modal trong modal. Nội dung dài hoặc nhiều bước thì dùng trang riêng hoặc Drawer.

Props: `open`, `title`, `onClose`, `primaryAction`, `secondaryAction`, `danger`, `size`, `dismissOnOverlay`, `inline`.
- Field trong modal tự co theo chiều rộng modal (không tràn ra lề). Footer cách nội dung 16px.
