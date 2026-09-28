# FormField

The shared frame for every input control: a label, a filled field (with an underline), and **one** message underneath.

- **Label:** 12/20 Regular, màu `text-secondary` #3C525D. Field bắt buộc có dấu `*` cam ở **cuối** label.
- **Help text:** nằm ngay dưới field, canh trái trùng với label và nội dung field (lùi 16px), 12/20 Regular `text-secondary`. Không lặp lại thông tin đã có trong label.
- **Error:** thay chỗ help text, màu `text-error` (cam), underline 2px cam. Khi người dùng bắt đầu sửa, lỗi biến mất ngay và help text quay lại (TextInput, Textarea, Select đã tự làm việc này).
- **Focus:** underline 2px `focus`.
- **Độ rộng:** không giãn theo card hay màn hình. `s` 232 · `m` 392 · `l` 552 · `xl` 632 (tức 200/360/520/600 cộng 32px padding). Dropdown, hoặc field có icon, cộng 68px thay vì 32px. Trong cùng một container, mọi field lấy độ rộng của field dài nhất.
- **Giả định:** cỡ XS (1–5 chữ số) chưa có số đo chính xác, nên dùng prop `width`.

Dùng trực tiếp `FormField` chỉ khi bọc một control tuỳ biến; còn lại dùng TextInput, Textarea, Select.
