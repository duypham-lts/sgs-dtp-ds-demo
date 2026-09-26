# PageHeader

Tiêu đề trang của các màn làm việc (SR creation, edit, review): nút quay lại, tiêu đề và mô tả, status, autosave, và các action.

## Anatomy
| Part | Class |
|---|---|
| Root | `.gr-ph` `.gr-ph--compact` |
| Back | IconButton `arrow--left`, dạng tròn có viền mảnh |
| Titles | `.gr-ph__title` (24/36) · `.gr-ph__sub` (12/20) |
| Status | StatusTag `sm` |
| Autosave | `.gr-ph__save--saved|saving|error`, `role="status"` |
| Actions | `.gr-ph__actions` (Keep as Draft · Submit Request) |

| Breakpoint | Khoảng cách | Status | Autosave | Action |
|---|---|---|---|---|
| ≥1440 và 1280–1439 | 32px (desktop) · 20px (small desktop, dùng `compact` hoặc tự đặt) | Có icon, nhãn đầy đủ | Icon và chữ | Button có chữ |
| Tablet (`compact`) | 20px | **Không icon**, nhãn ngắn (`shortLabel`) | **Chỉ icon** | IconButton (`compactActions`) |
