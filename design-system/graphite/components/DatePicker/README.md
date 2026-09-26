# DatePicker

Chọn một ngày qua lịch bật ra; hiển thị dạng **DD MMM YYYY** (12 Oct 2026) để tránh nhầm giữa định dạng ngày/tháng của các nước.

## Anatomy
| Part | Class | Triển khai |
|---|---|---|
| Field | FormField (`kind: select`, cỡ `s`) + `button.gr-date__btn` | Icon lịch ở vùng 48px bên phải |
| Calendar | `.gr-cal[role=dialog]` | Radix `Popover.Content` + **react-day-picker** |
| Header | `.gr-cal__head` › IconButton · `.gr-cal__month` | Chuyển tháng |
| Day | `button.gr-cal__day` `.is-today` `.is-selected` `:disabled` | Viền mỏng là hôm nay, nền cam là ngày đang chọn |

- Tuần bắt đầu từ thứ Hai. Dùng phím mũi tên để đi giữa các ngày. Ngày ngoài khoảng `min`/`max` bị disable.
- Giá trị lưu dạng ISO `YYYY-MM-DD`.
- **Giả định:** bản này chưa cho gõ tay ngày. Bản production nên cho phép cả hai cách.
