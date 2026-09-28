# RequirementNavigator

The requirement list of a framework, grouped by clause or control group; **each row is its own block**. Used in the left column of requirement working screens: the consultant assesses the gap, the customer uploads evidence in the workspace, the reviewer decides.

## Anatomy
| Part | Class | Vai trò |
|---|---|---|
| Framework header | `.gr-rnav__fw` | Tên framework, % tiến độ, ProgressBar `sm`, caption ("42 of 116 assessed") |
| Tools | `.gr-rnav__tools` | SearchInput và Select lọc theo trạng thái, cả hai ở cỡ compact (40px) |
| Group box | `button.gr-rnav__gbtn[aria-expanded]` `.is-within` | Chevron, **mã clause** (chip), tên, %, và thanh tiến độ 4px ở mép dưới |
| Items | `ul.gr-rnav__items` | Lùi vào 16px so với group, các khối cách nhau 4px |
| Requirement box | `button.gr-rnav__item` `.is-current` (`aria-current`) | Mã và tên (tối đa 2 dòng); StatusTag `sm` bên phải, hoặc chữ "Not assessed" |

- Mỗi khối có nền `layer-01`, bo `radius-md`, cao tối thiểu 48px, **không viền**. Khối đang chọn có nền `background-brand-subtle` và viền 1px `brand-orange`.
- Khi tìm kiếm hoặc lọc: chỉ hiện các group có kết quả, và các group đó tự mở ra. Không có kết quả nào thì hiện EmptyState `sm`.
- Trạng thái mặc định: `met`, `partial`, `notmet`, `na`, cùng các trạng thái phía khách hàng `fulfilled`, `review`, `missing`. Có thể đổi nhãn qua `statusLabels`.
- Trạng thái luôn có chữ; không dùng màu làm tín hiệu duy nhất.
- Triển khai: Radix `Collapsible` cho mỗi group. Danh sách dài (trên 200 requirement) nên dùng virtualization.

Props: `framework {name, progress, caption}`, `groups [{id, code, title, progress, children [{id, code, title, status}]}]`, `selected` / `defaultSelected`, `onSelect(id)`, `defaultExpanded`, `searchable`, `filterable`, `filterOptions`, `statusLabels`, `emptyStatusLabel`.
