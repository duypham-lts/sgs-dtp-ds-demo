# Select

A dropdown that selects one value, following the **Radix Select** anatomy: the trigger sits inside FormField, and the list opens directly below, the same width as the field.

## Anatomy
| Part | Class | Radix |
|---|---|---|
| Field | FormField (`kind: select`) | — |
| Trigger | `button.gr-sel__btn[aria-haspopup=listbox]` | `Select.Trigger` + `Select.Value` |
| Chevron | `.gr-sel__chev` `.is-open` (xoay 180°) | `Select.Icon` |
| Listbox | `ul.gr-list[role=listbox]` | `Select.Content` › `Select.Viewport` |
| Option | `li.gr-list__opt[role=option]` `.is-active` `.is-selected` + check cam | `Select.Item` + `Select.ItemIndicator` |

- Độ rộng cộng 68px (48px vùng icon + 4px lề phải + 16px lề trái). Field không bao giờ rộng hơn khung chứa nó (`max-width: min(640px, 100%)`).
- Placeholder dạng "Select a payer...", "No roles selected".
- Bàn phím: ↓ để mở, ↑/↓ để di chuyển, Home/End, Enter hoặc Space để chọn, Esc để đóng.
- `onChange(event, value)`: `event.target.value` vẫn dùng được như select gốc.
- Chọn nhiều giá trị thì dùng MultiSelect. Cần gõ để lọc danh sách dài thì dùng Combobox.

Props: `options [{value, label, description}]`, `placeholder`, `value` / `defaultValue`, `onChange`, `defaultOpen`, cùng các prop của FormField.
