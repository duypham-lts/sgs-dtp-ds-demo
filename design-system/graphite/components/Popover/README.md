# Popover

Khung nổi gắn vào một trigger, dùng cho bộ lọc, form nhỏ hoặc thông tin phụ; không làm tối nền như Modal.

## Anatomy
| Part | Class | Radix |
|---|---|---|
| Root | `.gr-pop` | `Popover.Root` |
| Trigger | phần tử con được truyền vào (`trigger`) | `Popover.Trigger asChild` |
| Panel | `.gr-pop__panel` (`role="dialog"`) | `Popover.Content` |
| Title | `.gr-pop__title` | — |

- Click ra ngoài hoặc Esc để đóng. Cần chặn người dùng, hoặc nội dung dài, thì dùng Modal hoặc Drawer.
- `align: 'end'` khi trigger nằm sát mép phải.
