# Drawer

A panel that slides in from the right for detail or a quick edit without leaving the page: evidence detail, review comment, history.

## Anatomy
| Part | Class | Radix |
|---|---|---|
| Overlay | `.gr-drawer` | `Dialog.Overlay` |
| Panel | `.gr-drawer__panel--md` (480) / `--lg` (640) | `Dialog.Content` |
| Header | `.gr-drawer__title` · `.gr-drawer__sub` · IconButton Close | `Dialog.Title`, `Dialog.Close` |
| Body | `.gr-drawer__body` | Tự cuộn bên trong |
| Footer | `.gr-drawer__foot` | Nút ghost bên trái, nút primary bên phải |

- Giữ focus bên trong, Esc để đóng, trả focus về chỗ cũ, khoá cuộn nền (giống Modal).
