# DataTable

Bảng dữ liệu đầy đủ: tìm kiếm, sort, chọn dòng kèm thanh bulk action, menu action trên từng dòng, phân trang, và các trạng thái loading, empty, error. Trên màn hẹp, bảng tự chuyển thành danh sách card (pattern mobile trong UI Guidelines).

## Anatomy

| Part | Class · attribute | Vai trò |
|---|---|---|
| Root | `.gr-dt.gr-tbl` `[data-density]` `[data-layout="table\|cards"]` | Khung chung, dùng lại style của Table |
| Toolbar | `.gr-dt__toolbar` | Cao tối thiểu 64px: Heading bên trái, Tools bên phải |
| Heading | `.gr-dt__title` · `.gr-dt__desc` | Tiêu đề 16/24 Medium và mô tả 12/20 |
| Tools | `.gr-dt__tools` | SearchInput cỡ S và các nút (ví dụ "New request") |
| Batch bar | `.gr-dt__batch` | Thay chỗ toolbar khi có dòng được chọn: nền `background-inverse`, "n selected", các bulk action, Cancel |
| Select-all cell | `th.gr-tbl__check` | Checkbox chọn cả trang; ở trạng thái **indeterminate** khi mới chọn một phần |
| Sortable header | `button.gr-tbl__sort` `[data-sort="asc\|desc\|none"]` + `th[aria-sort]` | Bấm lần lượt đổi asc → desc → none. Icon mờ khi chưa sort |
| Row | `tr.gr-tbl__row` `[data-state="selected"]` `[aria-selected]` | |
| Row actions cell | `td.gr-tbl__actions` | Một OverflowMenu cho mỗi dòng (guideline: nhiều hơn 3 action thì gom vào menu) |
| States | `.gr-dt__state` · `.gr-dt__empty` · `.gr-skel` | Loading hiện 5 dòng skeleton (`aria-busy`); Empty có tiêu đề, mô tả, action; Error dùng InlineNotification. Tìm kiếm không ra kết quả có thông điệp riêng |
| Cards | `.gr-dt__cards` › `.gr-dt__card` | Mỗi dòng thành một card: tiêu đề (`cardTitleKey`), status (`cardStatusKey`), lưới 2 cột label/giá trị, và menu ⋮ |
| Footer | Pagination | Chỉ hiện khi có dữ liệu |

## Mật độ và khoảng cách
- Ô trong bảng có padding **8px trên dưới, 16px hai bên**. Chiều cao dòng tối thiểu 48px (default) hoặc 40px (compact). Nội dung hai dòng (tên + vai trò) vẫn có khoảng thở.
- **Chỉ kẻ vạch ngang** giữa các dòng; dòng cuối không có vạch, và giữa bảng với pagination không có vạch ngăn.
- **Bộ lọc và ô tìm kiếm trong toolbar** tự chuyển sang cỡ **compact**: cao 40px, chữ 14/20, label ẩn khỏi mắt (vẫn còn cho screen reader, nên placeholder phải nói rõ nội dung như "From", "To"), không có help text.

## Quy tắc

- **Không có toolbar rỗng:** nếu không truyền `title`, `description`, `searchable` hoặc `toolbarActions`, toolbar không được render, và bảng nằm ngay dưới tab hoặc tiêu đề phía trên.

- Status luôn dùng **StatusTag `sm`** trong cột. Không tô màu cả dòng.
- Cột đầu tiên là định danh (mã SR, tên file). Trên card, đó là tiêu đề.
- Chuyển sang dạng card khi **container** hẹp hơn 640px (`cardBreakpoint`), không đo theo cửa sổ. Nhờ vậy bảng nằm trong cột hẹp cũng tự chuyển đúng.
- Bảng dài: truyền `maxHeight` để bảng tự cuộn bên trong, header dính trên cùng (guideline §12, cột giữa màn SR).

## Map sang code (Radix + TanStack Table)

| Graphite | Triển khai |
|---|---|
| Sort, filter, pagination, selection | **TanStack Table**: `getSortedRowModel`, `getFilteredRowModel`, `getPaginationRowModel`, `rowSelection` |
| Checkbox chọn dòng | Radix `Checkbox` (`checked="indeterminate"` cho ô chọn tất cả) |
| Menu ⋮ trên dòng | Radix `DropdownMenu` |
| Vùng cuộn | Radix `ScrollArea` (tuỳ chọn) |
| Style | Dùng lại class và `data-*` attribute ở bảng Anatomy |

Props: `columns [{key, header, sortable, sortValue, searchValue, align, width, render, hideOnCard}]`, `rows`, `getRowId`, `title`, `description`, `searchable`, `searchPlaceholder`, `toolbarActions`, `selectable`, `bulkActions [{label, onClick(rows)}]`, `rowActions(row) → items`, `defaultSort {key, dir}`, `pageSize`, `pageSizeOptions`, `paginate`, `loading`, `error {title, message}`, `emptyState {title, body, action}`, `layout ('auto'|'table'|'cards')`, `cardBreakpoint`, `cardTitleKey`, `cardStatusKey`, `density`, `maxHeight`.
