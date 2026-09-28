# StatusTag

The status of a document, SR, or evidence, always icon plus text; the icon and colour come from the Status icons set.

| `status` | Nhãn mặc định | Nền |
|---|---|---|
| `completed` | Completed | `tag-success-bg` |
| `under-review` | Under Review | trong suốt, viền mảnh, chữ italic `text-secondary` |
| `needs-description` | Needs Description | `tag-warning-bg` |
| `missing-info` | Missing Info | `tag-error-bg` |
| `rejected` | Rejected | `tag-error-bg` |
| `draft` | Draft | trong suốt, viền mảnh |
| `info` | Info | `tag-info-bg` |

- Truyền `label` để dùng câu cụ thể hơn: "Certificate issued", "Action required: Upload requested documents".
- `compact` dùng cho breakpoint nhỏ: chỉ còn icon, nhãn chuyển thành `aria-label` và tooltip. Không bao giờ truyền đạt trạng thái chỉ bằng màu.
- Đỏ ở đây chỉ dành cho **trạng thái**; lỗi form dùng cam (FormField).
