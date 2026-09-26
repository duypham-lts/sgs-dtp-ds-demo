# DocumentItem

Một tài liệu trong SR, theo đúng spec "Document Item UI Guidelines", gồm 5 vùng.

## Anatomy (theo guideline)
| Vùng | Part | Class |
|---|---|---|
| 1 | Icon loại tài liệu | `.gr-doc__icon`, chỉ có ở Standard và Under Review trên desktop/tablet |
| 2 | Thông tin | `.gr-doc__type` (dòng 1) · `.gr-doc__meta` (dòng 2: file • ngày • dung lượng) hoặc `.gr-doc__acc` "Affected Products" |
| 3 | Status | StatusTag `md`; ở `compact` thì chỉ còn icon, kèm tooltip |
| 4a–4c | Actions | Tối đa 3 IconButton; **nhiều hơn 3, hoặc ở `compact`, thì gom vào một OverflowMenu** |
| 5 | Nội dung mở rộng | `.gr-doc__panel`, **chỉ có ở Actions Required** |

## Biến thể
| `variant` | Viền | Nhấn |
|---|---|---|
| `standard` | 1px `border-outline` #7A8285, nền `surface-document` | Status Completed nền Green 90 |
| `under-review` | Viền nhạt | Thông tin mờ, status trong suốt chữ italic |
| `actions-required` | **1px dashed** `brand-orange` | Tên loại tài liệu và nút Upload màu cam, status Missing Info nền Red 95 |
| `sgs` | 1px `border-sgs-document` #085CC2 | Tên loại tài liệu và các action màu xanh |
| `compact` (breakpoint nhỏ) | Giữ viền của biến thể | Bỏ vùng 1, status chỉ icon, action gom vào ⋮, metadata bị cắt và xem đầy đủ qua tooltip |

`actions[].type`: `edit` · `view` · `open` · `delete` · `upload` · `download`. Có thể tự đặt `icon` và `label` riêng.
