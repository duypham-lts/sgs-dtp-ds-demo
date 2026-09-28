# TextInput

A single-line input built on FormField; the value is shown at 16/24 Regular (Roboto 16, about 9px per character).

- Chọn `size` theo nội dung: `s` cho mã, ID, postal code; `m` (mặc định) cho tên, reference; `l` cho tên công ty, text dài.
- `type="password"` tự có nút hiện/ẩn mật khẩu, kèm label cho screen reader.
- Placeholder chỉ để gợi ý, không thay cho label.

Props: `label`, `required`, `helpText`, `error`, `size`, `width`, `hideLabel`, `trailing`, và mọi thuộc tính của `<input>`.
