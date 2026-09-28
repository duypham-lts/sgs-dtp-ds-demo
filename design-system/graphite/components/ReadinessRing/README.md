# ReadinessRing

A ring that shows readiness: the share of requirements in a framework that have accepted evidence.

## Anatomy
| Part | Class |
|---|---|
| Root | `.gr-ring[role=img]` với `aria-label` "Readiness: 82%" |
| Visual | `.gr-ring__viz` › SVG `.gr-ring__track` · `.gr-ring__fill` |
| Number | `.gr-ring__num` |
| Text | `.gr-ring__label` · `.gr-ring__cap` |

- Cỡ `md` 80px cho card, `lg` 120px cho dashboard.
- Luôn hiện con số và câu mô tả ("63 of 77 requirements ready"). **Hệ thống không tự kết luận compliance**; readiness chỉ là chỉ báo.
- **Giả định:** vòng luôn màu xanh success, chưa đổi màu theo ngưỡng. Nếu cần chia ngưỡng, chờ client quyết định.
