Status icon cho DTP, lấy từ Carbon (@carbon/icons 11.89.0) và tô sẵn màu theo trạng thái. Dùng ở 16px trong tag, bảng và Document Item, 20px trong card header. Luôn kèm text, hoặc kèm `aria-label` và tooltip khi chỉ hiện icon.

| File | Carbon icon | Màu | Status |
|---|---|---|---|
| completed.svg | checkmark--filled | support-success #24A148 | Completed · Certificate issued (tag nền tag-success-bg) |
| under-review.svg | time--filled | brand-charcoal #3C525D | Under Review · Awaiting SGS review (tag trong suốt, có viền, chữ italic) |
| needs-description.svg | warning--alt--filled | support-warning #F1C21B, glyph #161616 | Needs Description |
| missing-info.svg | warning--filled | support-error #DA1E28 | Missing Info · Action required (tag nền tag-error-bg) |
| rejected.svg | misuse | support-error #DA1E28 | Rejected |
| draft.svg | circle-dash | brand-charcoal #3C525D | Draft · Not started |
| info.svg | information--filled | support-info #0043CE | Thông báo trung tính |

Khi dùng trong code, lấy bản gốc có `fill="currentColor"` để đổi màu bằng CSS.
