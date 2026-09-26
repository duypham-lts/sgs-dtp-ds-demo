# Combobox

Ô vừa gõ vừa chọn một giá trị trong danh sách dài: công ty, quốc gia, framework.

## Anatomy
| Part | Class · attribute | Triển khai |
|---|---|---|
| Field | FormField + `input[role=combobox]` | `aria-expanded`, `aria-controls`, `aria-activedescendant` |
| Listbox | `ul.gr-list[role=listbox]` | Radix `Popover.Content` + **cmdk** `Command.List` |
| Option | `li.gr-list__opt[role=option]` `.is-active` `.is-selected` | `Command.Item` |
| Description | `.gr-list__desc` | Dòng phụ (địa chỉ, mã) |
| Empty | `.gr-list__empty` | `Command.Empty` |

- Icon kính lúp nằm trong vùng 48px bên phải, nên độ rộng cộng 68px như dropdown.
- Help text giải thích nguồn dữ liệu ("Results are from companies used in past transactions").
