# Card

Khối nội dung chính ở cột giữa màn SR, gồm số thứ tự bước, tiêu đề và mô tả, rồi nội dung.

## Anatomy
| Part | Class |
|---|---|
| Root | `section.gr-card` `.gr-card--compact` `.gr-card--extend` |
| Number | `.gr-card__num`: vòng tròn charcoal (screen reader đọc là "Step 1:") |
| Title · Subtitle | `.gr-card__title` (20/28 Medium) · `.gr-card__sub` |
| Actions | `.gr-card__actions` |
| Body · Footer | `.gr-card__body` · `.gr-card__foot` |

- Nền `surface-card`: **trắng** ở cả hai portal, để card nổi rõ khỏi nền trang. Bên trong card, `layer-02` tự trỏ về `surface-card-inset` (#F2F5F8), nên các khối con (ô thông tin, lựa chọn dạng thẻ) vẫn tách khỏi card. Radius `radius-card`, **không viền**.
- Padding 24px trên desktop, 16px trên tablet (`compact`), đúng theo guideline breakpoint.
- **Card extension:** dùng `extend` cho card cuối trong cột. Card sẽ giãn ra lấp phần trống còn lại theo cả chiều ngang và dọc (guideline "Card Extension").
- Khoảng cách giữa các card: 20px (desktop), 12px (1280–1439), 8px (tablet). Khoảng cách này do layout cha quy định.
