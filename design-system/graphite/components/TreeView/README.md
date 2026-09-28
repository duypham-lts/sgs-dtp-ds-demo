# TreeView

A hierarchy, for example Framework → Clause → Requirement (the REQUIREMENT table has `parent_id`), used to browse requirements and attach evidence.

## Anatomy
| Part | Class · ARIA |
|---|---|
| Root | `ul.gr-tree[role=tree]` |
| Item | `li[role=treeitem]` `aria-level` `aria-expanded` `aria-selected` |
| Row | `.gr-tree__row` `.is-selected`, lùi vào 24px mỗi cấp |
| Toggle | `.gr-tree__chev` `.is-open` (xoay 90°) |
| Label · Meta | `.gr-tree__label` · `.gr-tree__meta` (số lượng hoặc StatusTag compact) |
| Group | `ul.gr-tree__group[role=group]` |

- Bàn phím theo WAI-ARIA: ↑/↓ để di chuyển, → để mở hoặc vào con, ← để đóng hoặc về cha, Enter để chọn.
- Radix không có Tree; dùng markup ARIA ở trên.
