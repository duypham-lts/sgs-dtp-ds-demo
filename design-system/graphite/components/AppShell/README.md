# AppShell (page template)

Shared shell for every screen after sign-in: **TopBar** (`home`) on top, **AppSidebar** on the left, and the **content area** in the middle.

- Nền trang dùng `background`. TopBar và sidebar nằm trên các khối `layer-02` bo `radius-md`, cách nhau 12px.
- **Chỉ vùng nội dung cuộn**; TopBar và sidebar luôn đứng yên (guideline §12).
- Sidebar thu gọn còn 72px trên các màn nhiều cột (Wizard, Request detail) để cột nội dung vẫn đủ rộng.
- Độ rộng tổng: tối thiểu 960, mặc định 1440, tối đa 1980px. Lớn hơn 1980px thì nội dung không giãn thêm, nền lấp hai bên.
- Đây là **template trang**, không phải component export. Dev dựng nó thành layout route (ví dụ `app/(portal)/layout.tsx` trong Next.js).
