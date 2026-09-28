# Table

A static, read-only table for a small data set inside a card: General Information, Accessible Group(s), Affected Products. For sort, filter, row selection, or pagination, use **DataTable**.

## Anatomy

| Part | Class · attribute | Vai trò |
|---|---|---|
| Root | `.gr-tbl` `[data-density]` | Khung nền `layer-02`, bo `radius-md`, **padding 8px 16px 16px** để bảng không chạm mép khung. `data-density` = `default` 48px · `compact` 40px · `relaxed` 56px |
| Scroll area | `.gr-tbl__scroll` | Vùng cuộn **bên trong** bảng (UI Guidelines §12). Khi truyền `maxHeight` thì header dính trên cùng |
| Table | `table.gr-tbl__table` | `<table>` gốc, có `caption` ẩn cho screen reader |
| Header cell | `th.gr-tbl__th` `[data-align]` | Nền `layer-extension`, chữ 14/20 Medium, `position: sticky` |
| Row | `tr.gr-tbl__row` `[data-state="selected"]` | Hover dùng `background-hover`, dòng được chọn dùng `background-selected` |
| Cell | `td.gr-tbl__td` `[data-align]` | Chữ 14/20, padding ngang 16px, vạch ngăn dưới `border-subtle-00` |

- Số liệu, tiền tệ, số lượng canh phải (`align: 'end'`). Chữ canh trái.
- Không kẻ viền dọc giữa các cột; chỉ có vạch ngăn giữa các dòng.
- Khi dev dùng Radix: Radix không có Table, nên dùng `<table>` gốc với cùng các class này.

Props: `columns [{key, header, align, width, render}]`, `rows`, `density`, `caption`, `maxHeight`, `getRowId`.
