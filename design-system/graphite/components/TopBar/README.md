# TopBar

Thanh trên cùng của ứng dụng. Có 3 loại theo UI Guidelines §11.

| `variant` | Nền | Bên trái | Bên phải |
|---|---|---|---|
| `landing` | Trắng | Logo SGS và tên site | Services · Contact Us · How It Works · Log In · ngôn ngữ |
| `login` | Trong suốt | Logo (bản trắng khi nằm trong `data-theme="inverse"`) và tên site, bấm được như nút Home | Không có link; chỉ có LanguageSelector (tuỳ chọn) |
| `home` | Trắng | Logo và tên site | **Request Applications** (cam) · Communications · Notifications · Profile |

## Anatomy
| Part | Class |
|---|---|
| Root | `header.gr-top` `.gr-top--{variant}` `.gr-top--compact` |
| Logo | `a.gr-logo` › `.gr-logo__mark` · `.gr-logo__name` · `.gr-logo__sub` |
| Nav link | `a.gr-top__link` (`--brand` cho Request Applications) |
| Notifications | NotificationBadge + IconButton |
| Profile | `button.gr-top__user` (Avatar) mở Popover: tên, email, Profile / Settings / Sign out |

- `compact` (1178–1279px, theo guideline): các link chữ chuyển thành IconButton, dòng phụ dưới tên site bị ẩn.
- **Logo hiện là chữ "SGS" thay tạm.** Khi có SVG `SGSlogo_Final`, thay nội dung của `.gr-logo__mark` và chọn biến thể theo nền (xem README chính).
- `homeLinks` thay các link mặc định của bản `home`: SGS Operations không có "Request Applications" mà dùng sidebar. Truyền `[]` để bỏ hết link. `badge` hiện một Tag cạnh logo (ví dụ "Internal" cho SGS Operations).
- `tone="dark"`: nền tối (theme `inverse`) và dải `brand-band` 3px ở mép dưới. **SGS Operations luôn dùng tone dark** để phân biệt với Customer Portal (nền trắng).
- `notificationItems`: danh sách thông báo. Chuông tự đếm số chưa đọc và mở **NotificationCenter** trong Popover. `notificationsOpen` mở sẵn để minh hoạ; `notificationsTab` chọn tab mặc định.

## Hooks for the app (added in this version)

| Prop | Type | What it does |
|---|---|---|
| `onSignOut` | `() => void` | Called when **Sign out** is clicked (UC-AUTH-002). Without it, Sign out is a plain link to `signOutHref` (default `#`). |
| `signOutHref`, `signOutLabel` | `string` | Optional link target and label for Sign out. |
| `accountLinks` | `{ label, href?, onClick? }[]` | Replaces the default account menu items (Profile, Settings). Sign out always stays last. |
| `onNotificationOpen` | `(item) => void` | Called when a notification is clicked (UC-NTF-002): mark it read on the server and navigate to `item.href`. |
| `onMarkAllRead` | `() => void` | Called by **Mark all as read**. |
| `onNotificationsLoadMore` | `() => void` | Called by **Show older notifications** in the All tab. |

All props are optional; screens that don’t pass them behave exactly as before. NotificationCenter keeps its own read state for instant feedback — pass fresh `notificationItems` (with `unread` from the server) to stay in sync.

```jsx
<TopBar
  variant="home"
  userName="Wei Chen"
  notificationItems={notifications}
  onNotificationOpen={(n) => { markRead(n.id); router.push(n.href); }}
  onMarkAllRead={() => markAllRead()}
  accountLinks={[{ label: 'Settings', href: '/settings' }]}
  onSignOut={() => signOut().then(() => router.push('/login'))}
/>
```
