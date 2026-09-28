# SectionNav

Vertical navigation between sections of a long form (the left column of SR creation), with a completion state for each section.

## Anatomy
| Part | Class |
|---|---|
| Root | `nav.gr-snav` `.gr-snav--text` / `--icon` |
| Item | `a.gr-snav__item` `.is-current` (`aria-current="step"`) |
| Icon | `.gr-snav__icon` (chỉ ở biến thể `icon`) |
| Status | `.gr-snav__ok` (check xanh = xong) · `.gr-snav__dot` (chấm cam = còn thiếu thông tin bắt buộc) · `.gr-snav__bad` (lỗi) |

- Theo breakpoint: **text** từ 1440px trở lên; **icon** (icon trên, chữ dưới) từ 1280 đến 1439px và trên tablet.
- Mục đang chọn có nền `background-brand-subtle` (peach nhạt, theo mockup).
- Trạng thái luôn có chữ ẩn cho screen reader ("Required information missing").
