# OverflowMenu

Nút ba chấm dọc mở danh sách action; theo guideline, khi có **nhiều hơn 3 action** thì gom hết vào đây, và ở breakpoint nhỏ mọi action đều vào đây.

- Mỗi vị trí chỉ có **một** overflow control.
- Action nguy hiểm đặt cuối danh sách, dùng `danger` (chữ đỏ).
- Hỗ trợ bàn phím: mũi tên lên/xuống, Home/End, Esc (đóng và trả focus). Click ra ngoài để đóng.

Props: `items [{label,onClick,danger,disabled}]`, `label`, `align` (`end`|`start`), `size`, `defaultOpen`.
