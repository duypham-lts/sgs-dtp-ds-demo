# CommentThread

The conversation between the customer and SGS (the Messages pane in the right column of an SR screen, review comments, clarification).

## Anatomy
| Part | Class |
|---|---|
| Root | `section.gr-thread` |
| Header | `.gr-thread__title` và badge số lượng |
| List | `.gr-thread__list[role=log]`, **cuộn bên trong** khi có `maxHeight` (guideline §12, phần Messages) |
| Message | `article.gr-msg` `.gr-msg--customer|sgs` `.gr-msg--internal` |
| Composer | Textarea (label ẩn) · gợi ý phím tắt · Button Send |

- Tin nhắn của SGS có nền `tag-info-bg` và tag "SGS reviewer".
- **Internal note** (`visibility` của SERVICE_REQUEST_COMMENT) có nền `tag-warning-bg` và tag "Internal note". Loại này **chỉ hiện ở SGS Operations**.
- Ctrl/⌘ + Enter để gửi. Khi chưa có tin nhắn thì hiện EmptyState `sm`.
