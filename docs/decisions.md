# Decisions: prototype Customer Portal + SGS Operations

Plan Pha 1 ([prototype-plan.md](prototype-plan.md)) đã được duyệt ngày 2026-09-25. File này ghi lại các quyết định đã chốt.

Mỗi mục gồm: **Quyết định**, **Lý do**, và **Trạng thái**. Trạng thái có hai giá trị:
- *Chốt*: đã quyết.
- *Chờ client*: tạm làm theo mặc định cho tới khi client xác nhận.

Khi code phụ thuộc vào một mục *chờ client*, để lại comment `// TODO(decision Dn)`.

---

## Quy tắc phân xử chung

- **Quyết định:**
  - Phạm vi và logic nghiệp vụ theo **UC List**. Giao diện theo **`designs/`**.
  - Nếu design có mà UC không có: vẫn dựng, và ghi "cần bổ sung UC" (mục G1 bên dưới).
  - Nếu UC thuộc MVP nhưng chưa có design: chỉ dựng khi cần để flow liền mạch. Dựng bằng Graphite và gắn nhãn **"Chưa có design"**.
  - Nếu design lệch guideline (wizard 2 cột, độ rộng field lẻ, nút danger màu đỏ…): **làm đúng như design**. Ghi điểm lệch vào [design-questions.md](design-questions.md) để hỏi designer. Không tự thêm cột, không tự đổi layout.
  - Không làm UC Phase 2 hoặc OOS.
  - Khi design chưa rõ: theo `design-system/graphite/Open-questions.md` và để `TODO`. Không tự nghĩ ra màn mới.
- **Lý do:** UC List là phạm vi hợp đồng, còn `designs/` là nguồn giao diện đã duyệt. Tách hai trục như vậy để tránh tranh cãi khi hai nguồn lệch nhau.
- **Trạng thái:** Chốt.

## Stack

- **Quyết định:**
  - Prototype là **Next.js (App Router, TypeScript)**, đặt trong `apps/prototype`.
  - Graphite được port thành `packages/graphite`, giữ nguyên tên component, props (`index.d.ts`), token và CSS.
  - Mock data và mock API nằm riêng ở `apps/prototype/src/mock`.
  - Không dùng Vite.
- **Lý do:** dùng cùng stack với sản phẩm thật (CLAUDE.md), để các màn prototype chuyển sang app thật được.
- **Trạng thái:** Chốt.

## Màn dựng bù (không có design)

- **Quyết định:**
  - Chỉ dựng bù các màn sau: Home tối giản cho cả hai portal, Log out, Notification inbox (`NotificationCenter`), Withdraw, Request information và Respond information.
  - Các mục sau chỉ có trang placeholder "Chưa có design": Settings, Academy catalogue, ma trận quyền (UC-ROL-002), sửa framework.
  - Bỏ "Communications" (link trên TopBar và placeholder), vì comment giữa khách hàng và SGS đã bị loại khỏi MVP ([design-questions](design-questions.md) Q18, 2026-09-25).
- **Lý do:** đây là những màn cần để các flow MVP nối được với nhau. Ngoài ra không tự nghĩ thêm màn.
- **Trạng thái:** Chốt.

---

## D1: Trust Passport

- **Quyết định:** **Không dựng.** Không có mục Passport trong sidebar, không có share link, không có trang public.
- **Lý do:** toàn bộ UC-PSP-001…007 đều mang nhãn LTS Phase 2 và không có design. ER cũng chưa có bảng share link hay access log.
- **Trạng thái:** Chốt.

## D2: Certification request

- **Quyết định:**
  - Gộp thành một luồng, lấy **08 làm chuẩn**.
    - State machine: Submitted → Assigned → In progress → Audit completed → Certificate issued, cộng nhánh Rejected.
    - Tab phía SGS: To assign / In audit / Ready for certificate / Closed.
    - Thuật ngữ: "auditor".
  - Giữ **2 lối vào**:
    - Từ catalog (09): chọn Scope + Type.
    - Từ workspace (08): điền sẵn scope, framework và tier.
- **Lý do:** 08 là tập bao trùm của 09. UC-SRQ-006 yêu cầu gán auditor cho các request audit.
- **Trạng thái:** Chốt.

## D3: Information requested

- **Quyết định:**
  - Thêm trạng thái `information_requested` cho **mọi loại SR** (GA, IS, Certification, Training), theo mục 3.1 của plan.
  - SGS (SGS User, Admin, Consultant hoặc Auditor, tuỳ loại) mở modal "Request information". SR chuyển sang "Action required".
  - Customer trả lời bằng panel phản hồi, có thể kèm file. Sau đó SR quay về trạng thái trước khi bị yêu cầu.
- **Lý do:** UC-SRQ-009/010 là MVP, nhưng bộ design MVP chưa có luồng này. Mẫu UI lấy từ 06 bản cũ (UploadRequested) và 11 (CustAwaitingInfo).
- **Trạng thái:** Chốt. UI là màn dựng bù, gắn nhãn "Chưa có design".

## D4: Withdraw

- **Quyết định:**
  - Dùng `06/WithdrawModal` cho mọi loại SR.
  - Dùng từ **"Withdraw"** nhất quán ở mọi nơi: nút "Withdraw request", trạng thái "Withdrawn", snackbar, audit event. Không dùng "Cancel request".
  - Chỉ cho withdraw khi SGS chưa bắt đầu delivery:
    - GA/IS: khi còn Submitted.
    - Certification/Training: khi còn Submitted hoặc Assigned (Certification thì phải trước "Start audit review").
- **Lý do:** UC-SRQ-004 ("before SGS delivery begins"). WithdrawModal là design duy nhất có cho use case này.
- **Trạng thái:** Chốt.

## D5: Document Item

- **Quyết định:**
  - State machine theo mục 3.2 của plan:
    - needs-description → completed
    - under-review (read-only sau khi submit)
    - missing-info (actions-required) → upload → under-review → completed | missing-info | rejected
    - variant `sgs` cho tài liệu do SGS phát hành.
  - **"Action required" được xoá ngay khi customer upload**, không chờ SGS accept. Khi item `missing-info` cuối cùng đã được upload, SR quay về trạng thái chờ SGS như trước đó.
  - Bỏ "Affected Products", vì đây là khái niệm của EP. Accordion đổi thành "Requested for {requirement}".
- **Lý do:** sau khi customer upload, bên cần xử lý tiếp là SGS, nên SR phải hiện là đang chờ SGS.
- **Trạng thái:** Chốt.
- **Việc cho backend:** ER hiện **không có bảng tài liệu của SR**. Không có DOCUMENT_ITEM, không có DOCUMENT_REQUEST, và SERVICE_REQUEST cũng không có liên kết tới file. Cần bổ sung, ví dụ:
  - `SR_DOCUMENT`: id, affiliate_id, tenant_id, service_request_id, evidence_id?, blob ref, doc_type, description, status (`needs_description | completed | under_review | missing_info | rejected`), source (`customer | sgs`), requested_by, requested_at, due_on, requirement_id?, rejected_reason, uploaded_by, uploaded_at.
  - Hoặc `DOCUMENT_REQUEST` tách riêng khỏi file.
  - Mọi thay đổi phải ghi AUDIT_EVENT.
  - Prototype mock theo shape này.

## D6: Owner cho từng requirement

- **Quyết định:**
  - Trên card requirement ở Workspace, thêm Select "Owner" (người dùng của tenant có quyền trên scope). Chọn xong hiện snackbar "{name} now owns {code}".
  - Chỉ Customer Admin được đổi owner (UC-EVD-016). Customer User chỉ xem.
  - Gắn nhãn "Chưa có design".
- **Lý do:** UC-EVD-016 thuộc MVP. ER đã có `EVIDENCE_MAPPING.requirement_owner_id`. Hành vi lấy theo prototype cũ.
- **Trạng thái:** Chốt.

## D7: Comment thread

- **Quyết định (tạm):**
  - Theo UC: customer **chỉ trả lời information request** (panel phản hồi của D3), **không chat tự do**.
  - Customer Viewer chỉ đọc.
  - Phía SGS có internal note (chỉ SGS thấy) và tin nhắn shared (customer thấy).
  - Dựng bằng `Graphite.CommentThread`, dùng `internal` và `role` sẵn có của component.
  - Quy tắc hiển thị lấy từ module 11: lọc ở phía server, session customer không bao giờ nhận dòng internal.
  - Consultant comment (UC-CNS-001) là shared và customer không trả lời được (UC-CNS-002).
- **Lý do:** UC-CNS-002 ghi "no chat or reply", còn UC-SRQ-010 chỉ cho trả lời information request. Trong khi đó design 11 cho customer reply. Hai nguồn mâu thuẫn nhau.
- **Trạng thái:** **Chờ client.** `// TODO(decision D7)`.
- **Cập nhật 2026-09-25:** trả lời Q18 của designer cho biết comment giữa khách hàng và SGS đã bị loại khỏi MVP. Như vậy phía design đã nghiêng về mặc định ở trên. Vẫn chờ client xác nhận, trước khi bỏ hẳn tin nhắn shared và chỉ giữ internal note của SGS cùng information request (D3).

## D8: Ai triage SR

- **Quyết định:** cả SGS Admin và SGS User đều được approve/assign và reject.
- **Lý do:** design vẽ SGS Admin, còn UC-SRQ-005 và UC-SRQ-006 liệt kê SGS User (UC-SRQ-006 có thêm Admin).
- **Trạng thái:** Chốt. Cần bổ sung UC-SRQ-005 actor SGS Admin (mục G1).

## D9: Ai hoàn tất SR GA/IS

- **Quyết định:** SGS Consultant hoàn tất ("Upload report and complete" / "Complete request"), đúng như design.
- **Lý do:** design thể hiện rõ; UC-SRQ-007 chưa liệt kê Consultant.
- **Trạng thái:** Chốt. Cần bổ sung UC (mục G1).

## D10: Tier do ai đặt

- **Quyết định:** Customer Admin chọn tier khi link framework và đổi được tier sau đó, theo module 05. Không đổi được khi đang audit.
- **Lý do:** 05 là màn nghiệp vụ trực tiếp. Copy ở 04 và 03/TenantNew ("SGS assigns…") đi ngược lại điều này.
- **Trạng thái:** Chốt (2026-09-25, [design-questions](design-questions.md) Q11). Designer sẽ sửa copy ở FwPreview, FwActivate, TenantNew. Prototype không dùng câu "SGS assigns…".

## D11: Email

- **Quyết định:**
  - Prototype chỉ có thông báo in-app (NotificationCenter trên bell).
  - Copy hứa email ("You’ll get an email…") đổi sang ý "in the portal" / "you’ll be notified".
- **Lý do:** UC-NTF-001 ghi email là P2 (CP-45).
- **Trạng thái:** Chốt. Mỗi chỗ sửa copy được ghi trong design-questions.md.

## D12: Login

- **Quyết định:**
  - Dùng `01-authentication` làm login.
  - Từ `02-sgs-ops-login` chỉ lấy ba thứ: trạng thái system error (ERR-AUTH-503), snackbar session-timeout, và layout mobile 412.
  - Không làm SSO, không làm "Forgot password".
- **Lý do:** 02 là bản thăm dò cũ, dùng DS cũ. SSO thuộc FR, Forgot password thuộc LTS P2.
- **Trạng thái:** Chốt.

## D13: Hai kịch bản dữ liệu mẫu

- **Quyết định:** seed có hai kịch bản, chọn khi reset ở nút Demo:
  - **Audit in progress** (mặc định): CR-2026-015 đang audit, và workspace Appendix 10 · Customer data platform bị khoá (theo designs/08).
  - **Before the audit**: CR-2026-015 mới ở trạng thái Assigned, workspace đang Preparing (theo designs/05). Từ kịch bản này, auditor có thể bấm "Start audit review" để khoá workspace bằng thao tác thật.
- **Lý do:** 05 và 08 vẽ cùng một workspace ở hai thời điểm khác nhau, nên một seed không thể khớp cả hai.
- **Trạng thái:** Chốt (quyết định kỹ thuật của prototype).

---

## G1: Cần bổ sung UC (design có, UC chưa có)

| Hạng mục | Nguồn design | Ghi chú |
|---|---|---|
| Share deliverable (Implementation Support) | 07 IsConsDeliverable | Chưa có UC nào |
| SGS Admin triage/reject | 06/07/09 | UC-SRQ-005 chỉ ghi SGS User |
| Consultant hoàn tất SR | 06 MvpConsUpload, 07 IsConsComplete | UC-SRQ-007 thiếu actor Consultant |
| Consultant/Auditor yêu cầu thông tin | D3 | UC-SRQ-009 thiếu actor |
| Change tier | 05 ChangeTier(Locked) | Không có UC riêng |
| Change due date (finding) | 08 AudChangeDueDate | Không có UC riêng |
| Export CSV audit trail | 10 | Thiếu UC-AUD-003 |
| Certification record detail phía customer | 08 Certifications | UC-CRT-004 đang là FR |
| Framework versions (Import new version) | 04 | UC-FWK-010 đang là FR. Chỉ hiển thị, không làm migration |

## G2: Việc cho backend / data model

- Bảng tài liệu của SR (xem D5).
- `information_requested` trong `SERVICE_REQUEST.status`, kèm lưu "trạng thái trước đó" để quay lại sau khi customer trả lời (D3).
- `withdrawn` trong `SERVICE_REQUEST.status` (D4).
- Owner requirement: dùng `EVIDENCE_MAPPING.requirement_owner_id` (D6).
- SERVICE_REQUEST_COMMENT.visibility nhận hai giá trị `internal | shared` (D7).
