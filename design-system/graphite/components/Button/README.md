# Button

Nút hành động dạng pill; mỗi màn chỉ có **một** nút `primary` (cam) cho hành động chính.

| Variant | Khi nào | Ví dụ DTP |
|---|---|---|
| `primary` | Hành động chính của màn | Submit Request, Sign in |
| `secondary` | Hành động phụ quan trọng | Keep as Draft |
| `tertiary` | Hành động phụ, viền cam | Add another party |
| `ghost` | Hành động nhẹ, Cancel | Cancel, Back |
| `danger` | Xoá, huỷ không hoàn tác | Delete document |

- Cỡ `lg` 48px là mặc định (touch target 48px). Dùng `md` 40px trong card/bảng dày đặc và `sm` 32px chỉ trong bảng.
- Disabled luôn dùng `button-disabled`, không tự chế style riêng (UI Guidelines §1).
- Ở breakpoint tablet (1178–1279px), nút trên page header chuyển thành `IconButton`.
- Thứ tự: nút primary ở bên phải nhóm.
- **Giả định:** màu hover/active, chiều cao và radius pill là suy ra từ mockup SR, chưa có spec Figma.

Props: `variant`, `size` (`lg`|`md`|`sm`), `icon` (tên Carbon), `iconPosition` (`left`|`right`), `fullWidth`, và mọi thuộc tính của `<button>`.
