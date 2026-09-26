# SGS DTP – Starter kit

Bộ khởi đầu cho repo code của **SGS Digital Trust Platform**. Kit gồm toàn bộ design (198 màn hình, 11 module), Graphite DS, tài liệu dự án, prototype clickable và cấu hình deploy bản preview. File `CLAUDE.md` đã viết sẵn quy tắc nên Claude Code đọc là làm được ngay.

## Cấu trúc

```
CLAUDE.md                 Quy tắc cho Claude Code (đọc mỗi session)
designs/<module>/         Design từng module: *.dc.html (nguồn), screenshots/*.png, INDEX.md, canvas.json, ds/
design-system/graphite/   Graphite DS: README, Open-questions, tokens, component docs, dist/ (tokens.css, bundle React tham chiếu, index.d.ts)
docs/                     UI Guidelines, ER model, use case list (Markdown) + source/ (PDF, XLSX gốc)
prototype/index.html      Prototype clickable Customer Portal
gallery.html              Trang xem nhanh mọi màn hình
scripts/build-site.sh     Gom prototype + screenshots vào _site/ để deploy
staticwebapp.config.json  Bắt đăng nhập Entra ID cho bản preview
.github/workflows/        Deploy preview lên Azure Static Web Apps
```

## Các module design

| Thư mục | Module | Số màn | Bản gốc |
|---|---|---|---|
| `designs/01-authentication/` | DTP – Authentication | 16 | [mở trên claude.ai](https://claude.ai/artifact/3yrLoqbXXfeXzXq92dp9fT) |
| `designs/02-sgs-ops-login/` | SGS Operations – Login Redesign | 11 | [mở trên claude.ai](https://claude.ai/artifact/4LKKSGoJ3NPGCucvqS12kG) |
| `designs/03-user-management/` | DTP – User Management | 19 | [mở trên claude.ai](https://claude.ai/artifact/YWigd2nG3dDGS63QBqtHFZ) |
| `designs/04-framework-management/` | DTP – Framework Management | 7 | [mở trên claude.ai](https://claude.ai/artifact/NZKJMKQ6BfPQNYeVBuHbV4) |
| `designs/05-scope-workspace-evidence/` | DTP – Scope, Workspace & Evidence | 15 | [mở trên claude.ai](https://claude.ai/artifact/25puixK1xDRkwwCvS8RMR4) |
| `designs/06-gap-analysis/` | DTP – Gap Analysis | 53 | [mở trên claude.ai](https://claude.ai/artifact/RfaNnFBXsDc6HPy8GBMaeM) |
| `designs/07-implementation-support/` | DTP – Implementation Support | 18 | [mở trên claude.ai](https://claude.ai/artifact/Uk1yVWh152i3ZN2VV8oUcB) |
| `designs/08-certification-audit-review/` | DTP – Certification & Audit Review | 29 | [mở trên claude.ai](https://claude.ai/artifact/GGE4jGAwwAQqGgUrZZKUzM) |
| `designs/09-certification-training/` | DTP – Certification & Training | 12 | [mở trên claude.ai](https://claude.ai/artifact/YcRHreLL6KPDcEHiFBqHNy) |
| `designs/10-audit-trail/` | DTP – Audit Trail | 5 | [mở trên claude.ai](https://claude.ai/artifact/5Z8kNMFYN2ADAES8z5fDvh) |
| `designs/11-unified-comment-thread/` | Unified Comment Thread — Role Design | 13 | [mở trên claude.ai](https://claude.ai/artifact/FfhtdScVpjFRzXn8YYidSA) |

Bản gốc trên claude.ai vẫn là nơi chỉnh sửa design. Khi design thay đổi, tải lại kit hoặc cập nhật thư mục tương ứng.

## Bắt đầu với Claude Code

1. Giải nén, rồi đẩy lên GitHub (nên để **private**, vì kit chứa tài liệu của client):
   ```bash
   cd sgs-dtp-starter
   git init && git add . && git commit -m "Starter kit: designs, Graphite DS, docs, prototype"
   git branch -M main
   git remote add origin git@github.com:<org>/sgs-dtp-portal.git
   git push -u origin main
   ```
2. Mở repo bằng Claude Code: chạy `claude` trong thư mục repo, hoặc chọn repo tại claude.ai/code.
3. Prompt gợi ý cho session đầu:
   > Đọc CLAUDE.md. Dựng Next.js app (App Router, TypeScript) trong `apps/customer-portal`, port Graphite DS từ `design-system/graphite/dist` thành thư viện `packages/graphite` giữ nguyên tên và props. Sau đó làm màn đăng nhập theo `designs/01-authentication/`, so sánh với screenshot trước khi báo xong.

## Deploy bản preview (prototype + gallery)

Workflow `.github/workflows/deploy-preview.yml` deploy lên **Azure Static Web Apps** mỗi khi push vào `main`. Bản preview chỉ chứa prototype và screenshot, không chứa `docs/` hay file nguồn design.

1. Trên Azure Portal, tạo một Static Web App, chọn deployment source là **Other**.
2. Copy **deployment token**, thêm vào GitHub repo: Settings → Secrets and variables → Actions → `AZURE_STATIC_WEB_APPS_API_TOKEN`.
3. Push lên `main`. Xong sẽ có URL dạng `https://<tên>.azurestaticapps.net`.

`staticwebapp.config.json` yêu cầu đăng nhập Microsoft Entra ID trước khi xem. Muốn chỉ cho một số người vào, mời họ và gán role trong mục **Role management** của Static Web App, rồi đổi `"authenticated"` thành role đó. Muốn mở công khai thì xoá hai route trong file này.

## Lưu ý

- File `*.dc.html` cần runtime của Design canvas trên claude.ai mới hiển thị được. Runtime này không có trong kit, nên hãy xem design qua `screenshots/` hoặc `gallery.html`.
- Screenshot được render bằng font dự phòng, không phải Roboto thật, nên chữ có thể hơi khác bản trên claude.ai.
- Mỗi thư mục design giữ phiên bản Graphite DS mà nó được vẽ (`ds/`). `design-system/graphite/dist` là bản mới nhất; khi code, dùng bản này.
- Các điểm design còn chờ client xác nhận: `design-system/graphite/Open-questions.md`.
