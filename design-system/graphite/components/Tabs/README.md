# Tabs

Switches between peer groups of content in the same context.

- `line` (mặc định): gạch chân cam 2px dưới tab đang chọn, dùng ở cấp trang.
- `contained`: tab nằm trên card, tab đang chọn liền với panel, dùng cho nhóm field trong card (Client Identification / Contact Person).
- `badge` hiện số đếm (số document). Tab `disabled` cho section chưa mở khoá.
- Vạch dưới dùng `border-subtle-01` và badge dùng `background-active`, nên tab vẫn rõ khi đặt trên nền trắng, trên card `layer-extension` hay trên nền tối. Badge của tab đang chọn có nền `background-brand-subtle`.
- Bàn phím: ←/→, Home/End.
- **Giả định:** hai kiểu tab dựa trên mockup AI settings và Carbon, chưa có spec Figma.
