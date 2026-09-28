# Accordion

Collapsible sections; used for Seller/Buyer cards ("Edit / Collapse") and "Affected Products" in Document Item.

- Mỗi item là một khối nền `layer-extension`, bo `radius-md`, các khối cách nhau 8px, **không dùng đường kẻ**.
- Góc phải hiện chữ hành động (Expand/Collapse) và chevron. `showActionLabel:false` khi chỉ cần chevron.
- `meta` để gắn Tag (ví dụ "Required") cạnh tiêu đề.
- Mở một item không đẩy các phần tử cùng hàng sang ngang; chỉ chiều cao tăng lên.

Props: `items [{id,title,content,meta,defaultOpen}]`, `allowMultiple`, `showActionLabel`, `expandLabel`, `collapseLabel`.
