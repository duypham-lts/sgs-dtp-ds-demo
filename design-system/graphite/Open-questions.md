# Open questions

Những điểm cần client hoặc designer xác nhận trước khi chốt hệ thống.

1. **Màu tương tác:** các token button, link, border và icon interactive trong Figma vẫn là xanh Carbon #0F62FE. Hệ thống này đã map sang cam #CA4300 theo UI Guidelines. Nếu client muốn giữ xanh thì cần báo lại.
2. **Màu focus:** tạm giữ xanh #0F62FE để tách khỏi lỗi cam. Cần xác nhận.
3. **Nhãn và swatch lệch nhau:** `background-brand` ghi "Blue 60" nhưng swatch là cam; `text-secondary` ghi #525252 nhưng swatch là charcoal. Hệ thống đang lấy theo swatch.
4. **Màu error:** Support error trong Figma là #DA1E28, nhưng UI Guidelines dùng #CA4300 cho validation. Đề xuất: đỏ cho status, cam cho lỗi form.
5. **Line-height của 20px:** 28 hay 32? Guideline ghi hai cách mâu thuẫn nhau.
6. **Thang chữ theo role:** hiện là đề xuất. Cần text styles chính thức trong Figma. Style `xsmall` 10/Auto vi phạm quy tắc 4x4.
7. **Weight:** các role dùng Medium 500 hay Semibold 600?
8. **Radius và shadow:** toàn bộ đang là giả định từ mockup.
9. **Lề trang:** Desktop Guidelines ghi 94dp, bảng spacing ghi 96px. Đang dùng 96px.
10. **Bảng spacing** mang tiêu đề "DBO Design System". Cần xác nhận DTP có áp dụng chính thức không.
11. **Status icon:** icon đồng hồ (Under Review) và vòng tròn vàng rỗng cần xác nhận.
12. **Theme SGS Operations:** các giá trị background và shell là đề xuất, chưa có trong Figma.
13. **Logo SVG:** cần export `SGSlogo_Final` ra SVG. Figma hiện chỉ cho view, không cho copy.
