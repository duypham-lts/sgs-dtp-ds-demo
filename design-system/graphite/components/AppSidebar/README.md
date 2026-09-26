# AppSidebar

Điều hướng chính của Customer Portal, nằm dọc bên trái. Có 2 cấp: mục chính, và mục con dưới một nhóm. Các mục hiện ra khác nhau tuỳ theo role.

## Mục theo role

| Mục | Icon | Customer User | Customer Admin |
|---|---|---|---|
| Home (Cockpit) | `dashboard` | ✓ | ✓ |
| Scopes | `category` | ✓ | ✓ |
| Workspaces | `folders` | ✓ (chỉ các workspace được assign) | ✓ |
| Documents | `document--multiple-01` | ✓ | ✓ |
| Service Requests ▾ | `task` | ✓ | ✓ |
| ↳ All requests · Certification Services · Training Courses · *Other services* (nhãn nhóm) · Gap Analysis · Implementation Support | — | ✓ | ✓ |
| Training | `education` | ✓ | ✓ |
| Audit Logs | `catalog` | ✓ | ✓ |
| Settings | `settings` | ✓ | ✓ |
| **Administration** (nhãn section) | — | — | ✓ |
| ↳ Users (thêm, sửa, xoá Customer User) | `user--multiple` | — | ✓ |
| ↳ Workspace access (assign workspace cho user) | `user--access` | — | ✓ |

Sidebar chỉ **ẩn** các mục mà role không có quyền. Việc cấp quyền thật sự vẫn do backend thực hiện (RBAC, USER_SCOPE).

## Anatomy
| Part | Class · attribute |
|---|---|
| Root | `nav.gr-side` `.gr-side--collapsed` (256px, thu gọn còn 72px) |
| Header (tuỳ chọn) | `.gr-side__header` |
| Section | `.gr-side__section` › `.gr-side__slabel` (ví dụ "ADMINISTRATION"; khi thu gọn thì thành Separator) |
| Item | `a.gr-side__item` `.is-current` (`aria-current="page"`) |
| Group | `button.gr-side__item[aria-expanded]` · `.is-within` khi mục con đang được chọn · `.gr-side__chev` |
| Sub-item | `a.gr-side__item--child` (lùi 44px để thẳng hàng với chữ của mục cha) |
| Group label | `.gr-side__glabel` (ví dụ "Other services"; không bấm được) |
| Badge | `.gr-side__badge` · `--attn` (cam, cho số việc cần xử lý) |
| Footer | IconButton thu gọn / mở rộng |

## Hành vi
- Mục đang chọn có nền `background-brand-subtle` (cùng kiểu với SectionNav). Mục cha đậm lên khi có mục con đang được chọn.
- Nhóm tự mở nếu mục đang chọn nằm trong nhóm đó.
- **Khi thu gọn:** chỉ còn icon; tên mục hiện qua tooltip bên phải; bấm vào nhóm sẽ mở **flyout** (Popover) chứa các mục con; badge chuyển thành chấm cam.
- **Màn SR creation** đã có 3 cột. Khi vào màn này, sidebar nên **tự thu gọn** để cột giữa vẫn đủ rộng cho các field theo spec.
- Trên mobile (412–767px), dùng thanh icon ở dưới cùng theo UI Guidelines. Thanh này là một component riêng, sẽ làm sau.

## Cần xác nhận với client
1. **"Training" và "Training Courses"**: hai tên dễ gây nhầm. Đề xuất: mục chính **Training** là các khoá đã đăng ký, tiến độ và chứng chỉ (SGS Academy); mục con trong Service Requests đổi thành **"Book a training course"**.
2. **Audit Logs cho Customer User:** trong phần lớn hệ thống GRC, mục này chỉ dành cho admin. Nếu user thường cũng thấy, nên giới hạn ở các thao tác của chính họ, hoặc của workspace được assign.
3. **Quan hệ với TopBar:** khi có sidebar, TopBar `home` chỉ giữ logo, Communications, Notifications và Profile. Link "Request Applications" chuyển xuống sidebar.

Props: `sections [{label?, items}]` hoặc `items`, với mỗi item `{id, label, icon, href, badge, badgeTone, badgeLabel, children}`; mục con `{id, label, badge}` hoặc `{type:'label', label}`; `active` / `defaultActive`, `onSelect(id)`, `collapsed` / `defaultCollapsed`, `onCollapsedChange`, `collapsible`, `header`, `label`.
- `tone="dark"`: sidebar nền tối (theme `inverse`). Dùng cho **SGS Operations**, đi cùng TopBar `tone="dark"`. Customer Portal giữ sidebar trắng.
