# OverflowMenu

A vertical three-dot button that opens a list of actions; per the guideline, when there are **more than 3 actions** they all go here, and at the small breakpoint every action goes here.

- Mỗi vị trí chỉ có **một** overflow control.
- Action nguy hiểm đặt cuối danh sách, dùng `danger` (chữ đỏ).
- Hỗ trợ bàn phím: mũi tên lên/xuống, Home/End, Esc (đóng và trả focus). Click ra ngoài để đóng.

Props: `items [{label,onClick,danger,disabled}]`, `label`, `align` (`end`|`start`), `size`, `defaultOpen`.
