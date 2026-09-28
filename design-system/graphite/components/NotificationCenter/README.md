# NotificationCenter

A notification inbox **shared** by the Customer Portal and SGS Operations, opened from the **bell on the TopBar**. There is no separate page. It covers UC-NTF-002 (View Notification Inbox and History); the content is produced by UC-NTF-001 (the system generates notifications).

## Dùng trong TopBar
Truyền `notificationItems` cho TopBar. Chuông tự hiện số chưa đọc, và bấm vào sẽ mở NotificationCenter trong Popover rộng 420px (căn phải).

```jsx
<TopBar variant="home" notificationItems={items} />
```

## Anatomy
| Part | Class | Vai trò |
|---|---|---|
| Header | `.gr-ntf__head` | Tiêu đề và **Mark all as read** (chỉ hiện khi có thông báo chưa đọc) |
| Tabs | `.gr-ntf__tabs` `[role=tablist]` | **Unread** (kèm số đếm cam) và **All** (lịch sử) |
| Group | `.gr-ntf__group` | Nhóm theo thời gian: Today / Earlier (giá trị `group` do backend trả về) |
| Item | `a.gr-ntf__item` `.is-unread` | Icon theo loại, tiêu đề (đậm khi chưa đọc), mô tả tối đa 2 dòng, dòng meta "mã tham chiếu · thời gian", chấm cam chưa đọc |
| More | `.gr-ntf__more` | "Show older notifications", chỉ ở tab All khi `hasMore` |
| Empty | `.gr-ntf__empty` | "You're all caught up" (Unread) / "No notifications yet" (All) |

## Loại thông báo (`type`) và sắc thái (`tone`)
- `status`: trạng thái service request đổi (CP-35)
- `review`: phản hồi khi duyệt evidence (CP-28)
- `certificate`: mốc gia hạn hoặc surveillance của chứng chỉ (CP-42)
- `assignment`, `document`, `user`: được assign, có tài liệu mới, thay đổi người dùng
- `tone`: `success` / `warning` / `error` / `info` tô màu vòng icon. Nội dung luôn có chữ, không dùng màu làm tín hiệu duy nhất.

## Quy tắc
- Bấm vào một thông báo thì **đánh dấu đã đọc** và mở đúng đối tượng liên quan (`href`).
- Thông báo được lọc theo **role, tenant và scope** ở phía backend. Component chỉ hiển thị những gì nhận được.
- Email (CP-45) là P2 và không nằm trong component này.
- Trên mobile: mở toàn màn hình thay vì Popover (P2).
