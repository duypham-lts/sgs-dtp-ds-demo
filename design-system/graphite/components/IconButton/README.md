# IconButton

Nút tròn chỉ có icon; bắt buộc có `label` (dùng làm `aria-label` và tooltip, theo UI Guidelines §8).

- Mặc định là `ghost`, màu `icon-secondary`. Dùng `primary` hoặc `secondary` khi IconButton thay cho một Button có chữ (header ở breakpoint tablet: Keep as Draft, Submit).
- Vùng bấm toàn bộ 48px, không chỉ phần glyph.
- Icon lấy từ bộ Carbon, render ở 20px.

Props: `icon`, `label` (bắt buộc), `variant`, `size`.
