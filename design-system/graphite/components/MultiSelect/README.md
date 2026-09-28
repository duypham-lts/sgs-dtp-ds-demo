# MultiSelect

Select several values (Role/s, Collector/s, Frameworks); selected values appear as chips with a remove control.

## Anatomy
| Part | Class | Triển khai |
|---|---|---|
| Field | FormField (`kind: select`) + `button.gr-ms__trigger` | Radix `Popover.Trigger` |
| Chips | `.gr-ms__chips` › `.gr-chip` › `.gr-chip__x` | Mỗi chip có nút "Remove …" |
| Listbox | `ul.gr-list[aria-multiselectable]` | Radix `Popover.Content` + cmdk |
| Option | `li.gr-list__opt` chứa Checkbox | Radix `Checkbox` |

- Placeholder theo mockup: "No roles selected".
- Danh sách vẫn mở khi đang chọn; bấm ra ngoài hoặc Esc để đóng.
