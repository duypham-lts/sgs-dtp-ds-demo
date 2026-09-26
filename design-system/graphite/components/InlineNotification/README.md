# InlineNotification

Khung thông báo nằm trong trang, không tự ẩn, dùng cho thông tin người dùng cần thấy khi đang làm việc: "Required Information", "Action required", "Need help?".

| `kind` | Khi nào |
|---|---|
| `warning` | Còn thiếu thông tin bắt buộc (checklist `items` ở cột phải màn SR) |
| `error` | Cần hành động trước khi đi tiếp: tài liệu bị yêu cầu bổ sung, bị reject |
| `info` | Hướng dẫn, trợ giúp |
| `success` | Kết quả lâu dài: certificate đã cấp |

- Viền mỏng bao quanh toàn khung, **không** dùng kiểu thanh viền bên trái.
- `live` thông báo cho screen reader khi khung xuất hiện động.
- **Giả định:** kiểu viền và nền lấy theo khung "Required Information" trong mockup SR, chưa có spec Figma.
