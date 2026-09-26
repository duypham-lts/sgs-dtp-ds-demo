# Pagination

Thanh phân trang ở chân bảng, theo mẫu trong mockup SR: "Items per page" → "1–10 of 100 items" ở bên trái; ô chọn trang → "of 10 pages" → nút trước/sau ở bên phải.

## Anatomy

| Part | Class | Vai trò |
|---|---|---|
| Root | `nav.gr-pg` | Cao 48px, vạch ngăn phía trên. Có `aria-label="Pagination"` |
| Page size | `.gr-pg__group` › `select.gr-pg__select` | Chỉ hiện khi có `onPageSizeChange` |
| Range | `.gr-pg__text` | "from–to of total items", `aria-live="polite"` |
| Page picker | `select.gr-pg__select` + "of N pages" | Nhảy thẳng tới một trang |
| Prev / Next | IconButton `md` | Disabled ở trang đầu và trang cuối, có tooltip |

- Radix không có Pagination; phần chọn trang có thể dùng Radix `Select` với cùng class.
- Trên mobile (dạng card) có thể ẩn phần "Items per page".

Props: `totalItems`, `page`, `pageSize`, `onPageChange`, `onPageSizeChange`, `pageSizeOptions`, `label`.
