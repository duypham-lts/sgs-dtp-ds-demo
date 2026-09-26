# ProgressBar

Thanh tiến độ cho upload, readiness và các bước xử lý; luôn hiện kèm số % hoặc nội dung.

## Anatomy
| Part | Class | Radix |
|---|---|---|
| Root | `.gr-prog` `[data-status="active\|success\|error"]` | — |
| Top | `.gr-prog__label` · `.gr-prog__val` | — |
| Track | `.gr-prog__track[role=progressbar]` | `Progress.Root` |
| Fill | `.gr-prog__fill` | `Progress.Indicator` |
| Helper | `.gr-prog__help` | — |

- Fill mặc định màu cam; khi đạt 100% thì chuyển xanh (success); lỗi thì đỏ, và help text chuyển cam.
- Cỡ `sm` 4px dùng trong dòng file.
