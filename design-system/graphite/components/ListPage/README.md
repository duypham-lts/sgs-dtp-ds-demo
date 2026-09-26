# ListPage (page template)

Trang liệt kê bản ghi: Service Requests, Gap Analysis, Workspaces, Documents, Users, Audit Logs.

| Vùng | Nội dung |
|---|---|
| Header | Breadcrumb → tiêu đề `headline-medium` → mô tả một câu; **một** nút chính bên phải |
| Thông báo (tuỳ chọn) | InlineNotification cho việc cần xử lý ngay |
| Nội dung | DataTable (search, sort, action trên dòng, pagination), chiếm phần còn lại của vùng nội dung |

- Trang trống thì dùng EmptyState của DataTable, có nút hành động chính.
- Trên mobile, DataTable tự chuyển thành danh sách card.
