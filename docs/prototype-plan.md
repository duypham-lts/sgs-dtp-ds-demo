# Prototype plan: Customer Portal + SGS Operations

Pha 1: scan và lập inventory, chưa code. Tài liệu này dùng để duyệt trước khi dựng lại prototype clickable.

- Nguồn đã đọc: 11 thư mục `designs/*` (198 file `*.dc.html`: đọc cả file, đồng thời xem đủ 198 screenshot, `INDEX.md`, `canvas.json`), `docs/use-cases.md`, `docs/book-a-service.md`, `design-system/graphite/` (README, Open-questions, `dist/components/index.d.ts`, README của component) và `prototype/index.html`, nhưng prototype chỉ dùng để tham khảo hành vi.
- **ER model và UI Guidelines:** hai file `docs/er-model.md` và `docs/ui-guidelines.md` trong repo đang rỗng, vì bản PDF thật ra là file zip chứa ảnh và text từng trang. Mình đã giải nén và đọc text của `DTP_MVP_ER_Overview.pdf` (12 trang) và `EP_UI_Guidelines.pdf` (26 trang). Nội dung ER dùng ở mục 3 được lấy từ bản này.
- Quy ước:
  - "MVP" là sheet **UC List**.
  - "LTS P2" là UC nằm trong UC List nhưng cột *LTS suggestion* ghi Phase 2.
  - "FR" là Future Release, "OOS" là ngoài phạm vi.
  - `(suy ra)` là quy tắc không có trên design mà mình suy từ UC, ER hoặc prototype.

---

## 0. Những điểm cần anh/chị quyết định trước khi code

> **Đã duyệt 2026-09-25.** Quyết định cuối cùng cho D1–D12 nằm ở [decisions.md](decisions.md). Chỗ nào decisions.md khác với cột "Đề xuất" bên dưới thì làm theo decisions.md. Hai điểm khác đáng chú ý:
> - D1: **không dựng** Trust Passport.
> - D7: customer chỉ được trả lời information request, không chat tự do (chờ client).
>
> Các điểm design lệch guideline được ghi ở [design-questions.md](design-questions.md), và prototype làm đúng như design.

Brief của Pha 1 giả định một số luồng mà **design hiện tại không có, hoặc có nhưng khác**. Mình liệt kê trước để duyệt. Chi tiết nằm ở mục 3 và 4.

| # | Chủ đề | Design thực tế | Đề xuất mặc định cho prototype |
|---|---|---|---|
| D1 | **Trust Passport** | Không có màn nào trong `designs/`. Sidebar customer không có mục Passport. Toàn bộ UC-PSP-001…007 nằm trong UC List nhưng đều ghi **LTS P2**. ER không có bảng share link hay access log. Chỉ `prototype/index.html` có (share link, hạn dùng, revoke, access log). | Dựng theo *hành vi* của prototype cũ, dùng Graphite (ListPage + Modal + DataTable), gắn nhãn "chưa có design". Hoặc bỏ khỏi prototype nếu coi là P2. **Cần chọn.** |
| D2 | **Certification request**: 08 và 09 vẽ hai luồng khác nhau | 08 đi từ workspace qua Submitted → Assigned → In progress → Audit completed → Certificate issued. 09 đi từ catalog qua Submitted → Assigned / Rejected. Hai module cùng route `req-cert` nhưng khác bộ tab. | Gộp thành một luồng. Dùng state machine và tab SGS của 08 vì 08 bao trùm 09. Giữ cả hai lối vào: từ catalog (09, có Scope + Type) và từ workspace (08, điền sẵn). |
| D3 | **Information requested / Action required** trên SR | Bộ Mvp của 06 và 07 không có. Chỉ có ở bộ 06 cũ (Phase 2: ConsultantRequestDoc, UploadRequested) và module 11 ("Awaiting Information"). UC-SRQ-009/010 là MVP. | Thêm trạng thái `information_requested` chung cho mọi loại SR. Customer trả lời thì SR quay về trạng thái trước đó. UI mượn DocumentItem `actions-required` (bộ 06 cũ) cộng với panel trả lời (11/CustAwaitingInfo). |
| D4 | **Cancel / Withdraw** | Chỉ có `06/WithdrawModal` (bộ cũ). Bộ Mvp 06, 07, 08 và 09 không có. | Dùng WithdrawModal cho mọi loại SR. Chỉ cho huỷ khi chưa bắt đầu delivery (xem 3.1). |
| D5 | **DocumentItem**: completed / needs description / under review / missing info | Guideline DocumentItem được viết cho sản phẩm EP (có "Affected Products", mô tả tài liệu lúc tạo SR). Trong design DTP MVP, "Needs Description" không xuất hiện ở đâu. Vòng missing info → upload → under review chỉ có trong bộ 06 cũ. | Dựng state machine như mục 3.2, đánh dấu `(suy ra)`. Bỏ "Affected Products". Luồng "hết item missing info thì SR quay lại chờ SGS" không có trên design, mình suy ra từ brief. |
| D6 | **Owner cho từng requirement** (UC-EVD-016, MVP) | Không có màn gán owner. Chỉ hiển thị "owner Linh Tran" ở workspace của consultant (07). ER có `EVIDENCE_MAPPING.requirement_owner_id`. | Thêm một Select "Owner" trên card requirement ở Workspace, theo hành vi của prototype cũ, kèm snackbar "{name} now owns {code}". |
| D7 | **Comment thread** (module 11) | Module 11 không dùng Graphite (hex inline, font IBM Plex, sai lưới 4×4). Nó cho customer trả lời consultant, trái với UC-CNS-002 ("no chat or reply"). Module 08 vẫn dùng một thread "Internal notes" riêng. | Lấy quy tắc hiển thị của 11 (shared/internal, filter, composer 2 tab) nhưng dựng bằng `Graphite.CommentThread` mở rộng. Customer reply: **cần quyết định** (UC nói không, design nói có). |
| D8 | **Ai triage SR** | Design dùng SGS Admin, UC-SRQ-005 ghi SGS User. | Cho cả SGS Admin và SGS User. |
| D9 | **Ai đóng SR GA/IS** | Design để Consultant bấm Complete, nhưng UC-SRQ-007 không liệt kê Consultant. | Giữ theo design (Consultant hoàn tất). |
| D10 | **Tier do ai đặt** | 04 ghi "SGS assigns each scope a tier", còn 05 cho Customer Admin chọn và đổi tier. | Theo 05 (customer chọn), vì 05 là màn nghiệp vụ trực tiếp. **Đã chốt 2026-09-25** (Q11). |
| D11 | **Email** | Copy ở 06, 07, 08, 09 hứa "You'll get an email", nhưng UC-NTF-001 ghi email là P2. | Prototype chỉ có in-app (NotificationCenter trên bell). Sửa copy thành "in the portal". |
| D12 | **02-sgs-ops-login** | Là bản thăm dò cũ (DS cũ, 3 phiên bản layout, có SSO và Forgot password đều không thuộc MVP). | Dùng 01 cho login. Từ 02 chỉ lấy system-error, snackbar session-timeout và layout mobile 412. |

---

## 1. Inventory màn hình

### 1.0 Quy ước viết tắt và khung chung

**Component:** TB=TopBar · SB=AppSidebar · PH=PageHeader · SN=SectionNav · BC=Breadcrumb · DT=DataTable · T=Table · ST=StatusTag · Tg=Tag · IN=InlineNotification · M=Modal · Dr=Drawer · ES=EmptyState · DI=DocumentItem · RN=RequirementNavigator · TI=TextInput · TA=Textarea · Sel=Select · MS=MultiSelect · CB=Combobox · DP=DatePicker · FU=FileUpload · Cb=Checkbox · Rd=Radio · Btn=Button · Lk=Link · Av=Avatar · PB=ProgressBar · RR=ReadinessRing · SI=SearchInput · CT=CommentThread · LS=LanguageSelector · OM=OverflowMenu · IB=IconButton · Ic=Icon.

**Khung chung** (không lặp lại trong bảng):
- Mọi màn sau đăng nhập đều có TB + SB.
- Trang danh sách: BC + h1 + DT, sidebar mở rộng.
- Trang chi tiết: PH (nút back) + lưới `14fr 62fr 21fr` (SN | các card đánh số | panel phải), sidebar thu gọn.
- Wizard: PH (Draft + autosave) + SN bước 220px + một card.
- Modal và Drawer luôn vẽ đè lên màn nền.

**Cột "MVP?":**
- ✅ = dựng.
- ⚠️ = dựng nhưng phải chỉnh.
- ⛔ = không dựng (Phase 2, FR hoặc OOS, hoặc bị thay thế).
- 📎 = chỉ để tham khảo.

### 1.1 `01-authentication` (16 màn, DS v1): bản login hiện hành

Không có TB/SB. Layout là card 960px chia hai: panel thương hiệu 440px và form; LanguageSelector compact ở góc phải trên. Customer dùng `data-theme="customer"`; SGS dùng `sgs-ops`, panel trái `inverse`.

| File | Portal | Role | Component | UC | Đi tới | MVP? |
|---|---|---|---|---|---|---|
| Main | customer | Mọi user customer | LS, Logo, TI×2, Cb "Keep me signed in", Btn, Lk | AUTH-001 | Sign in → Home customer (chưa có design) hoặc các trạng thái lỗi; "Contact SGS support" → # | ✅ |
| CustomerLoginWrongPassword | customer | 〃 | như Main + lỗi field "Incorrect email or password." | AUTH-001 | như Main | ✅ |
| CustomerLoginLocked | customer | 〃 | + IN error "Sign-in is temporarily locked", Btn disabled | AUTH-001 | — | ✅ |
| CustomerLoginInactive | customer | user bị deactivate | + IN error "Your account is not active" | AUTH-001 | — | ✅ |
| SgsLogin | sgs-ops | Mọi user SGS | LS, Logo (sub "Operations Console"), TI×2, Cb, Btn, Lk | AUTH-001 | Sign in → Home Ops (chưa có design) | ✅ |
| SgsLoginWrongPassword | sgs-ops | 〃 | + lỗi field | AUTH-001 | — | ✅ |
| SgsLoginLocked | sgs-ops | 〃 | + IN error, Btn disabled | AUTH-001 | — | ✅ |
| SgsLoginInactive | sgs-ops | 〃 | + IN error | AUTH-001 | — | ✅ |
| InviteEmail | email | Người được mời | Logo, Lk; CTA là thẻ `<a class="gr-btn">` | USR-003, AUTH-005 | "Activate my account" → **Activate** (link thật duy nhất trong 01/02) | ✅ (email mẫu) |
| Activate | customer | Người được mời | LS, TI Email read-only, TI Full name, TI password ×2, danh sách rule (Ic), Cb terms, Btn disabled, Lk "Sign in" | AUTH-005 | → ActivateSuccess / ActivateMismatch; "Sign in" → Main | ✅ |
| ActivatePassword | customer | 〃 | rule hiện check / warning | AUTH-005 | 〃 | ✅ |
| ActivateMismatch | customer | 〃 | lỗi "Passwords don’t match." | AUTH-005 | 〃 | ✅ |
| ActivateSuccess | customer | User mới kích hoạt | Ic, dl tóm tắt, Btn "Continue to the portal" | AUTH-005 | → Home customer | ✅ |
| ActivateExpired | customer | Link hết hạn | Logo, Ic, Btn "Ask for a new invitation", Btn "Sign in instead" | AUTH-005 | "Ask…" không có UC; → Main | ⚠️ (nút "Ask…" không có UC) |
| ActivateUsed | customer | Link đã dùng | Logo, Ic, Btn "Sign in" | AUTH-005 | → Main | ✅ |
| SgsActivate | sgs-ops | User SGS được mời | như Activate, Cb "SGS acceptable use policy…" | AUTH-005 | → Home Ops | ⚠️ (thiếu help text, `type=submit`, các trạng thái khác) |

### 1.2 `02-sgs-ops-login` (11 màn, DS v0 cũ): bản thăm dò, bị 01 thay thế

| File | Portal | Nội dung | UC | MVP? |
|---|---|---|---|---|
| Main | SGS (hex tự vẽ) | Login v1 + nút SSO + "Forgot your password?" | AUTH-001, **AUTH-006 (FR)**, AUTH-003 (LTS P2) | ⛔ |
| SignInError | SGS | Lỗi field + **snackbar "You have been signed out after 30 minutes of inactivity."** | AUTH-001/002 | 📎 lấy snackbar |
| SignInMobile | SGS | Layout 412px | AUTH-001 | 📎 lấy layout mobile |
| CustomerLogin / SgsOpsLogin | lồng theme | Login v3: tiêu đề "Sign in" gần như không nhìn thấy do lồng theme | AUTH-001 | ⛔ |
| CustomerLoginWrongPassword / SgsOpsLoginWrongPassword | 〃 | "…You have 4 attempts left." | AUTH-001 | 📎 lấy bộ đếm số lần thử còn lại |
| CustomerLoginError / SgsOpsLoginError | 〃 | IN "We couldn’t sign you in" … mã **ERR-AUTH-503** | AUTH-001 | 📎 lấy trạng thái system error |
| CustomerLoginSplit / SgsOpsLoginSplit | 〃 | Login v4 split, có SSO, "Request access" (không có UC) | AUTH-001, AUTH-006 FR | ⛔ |

### 1.3 `03-user-management` (19 màn, DS v2)

| File | Portal | Role | Component chính | UC | Đi tới |
|---|---|---|---|---|---|
| Main | customer | Customer Admin | DT "6 users", Av, ST, Btn "Invite user", row OM | USR-001 | Tên → CaUserDetail / CaUserPending; "Invite user" → CaInvite; menu: View / Resend / Revoke → CaRevoke / Assign scopes → CaAssignScopes |
| CaInvite | customer | CA | M, TI×2 (size l), MS "Scope access" | USR-003, USR-006 | "Send invitation" / "Cancel" |
| CaUserPending | customer | CA | PH (Invitation pending, OM), SN, IN info, Btn, T | USR-002/003 | Resend; Revoke → CaRevoke |
| CaRevoke | customer | CA | M danger | USR-003 | "Revoke invitation" / "Cancel" |
| CaUserDetail | customer | CA | PH Active, SN (Status/Profile/Role/Scope access/History), T | USR-002/006 | "Assign scopes" → CaAssignScopes |
| CaChangeRole | customer | CA | **Bản vẽ lỗi**: không có Modal, bảng rỗng | USR-005 | ⚠️ không dùng được |
| CaAssignScopes | customer | CA | M, checkbox thuần (`gr-check`), Tg | USR-006 | "Save access" |
| CaUsersEmpty | customer | CA | DT empty-state "You’re the only user so far" | USR-001 | → CaInvite |
| SgsUsers | sgs-ops | SGS Admin | Tabs (SGS users / Customer users) → DT, Av, ST | USR-001 | "Invite SGS user" → SgsInviteSgs; Anna Lee → SgsUserDetail |
| SgsInviteSgs | sgs-ops | SGS Admin | M, TI×3 (Affiliate read-only), Sel Role (4 role SGS) | USR-003/005 | "Send invitation" |
| SgsInviteCustomer | sgs-ops | SGS Admin | M, Sel Customer, TI, Role read-only "Customer Admin" | ACC-007 | ⚠️ trùng với TenantCreateAdmin |
| SgsUserDetail | sgs-ops | SGS Admin | PH, SN, T, ST | USR-002 | chỉ có Back |
| TenantList | sgs-ops | SGS Admin | DT, ST, Btn "Create customer", Btn cell "Create admin" | ACC-001 | → TenantCreate; ABC → TenantDetail; Riyadh → TenantNew |
| TenantCreate | sgs-ops | SGS Admin | M, TI, Sel Country, TI affiliate read-only, TA | ACC-003/005 | "Create customer" → TenantNew |
| TenantNew | sgs-ops | SGS Admin | PH "No admin yet", SN, ES×3 | ACC-002/007 | "Create admin" → TenantCreateAdmin |
| TenantCreateAdmin | sgs-ops | SGS Admin | M, TI×2, IN "One admin per customer" | ACC-007 | "Send invitation" |
| TenantDetail | sgs-ops | SGS Admin | PH Active, SN (có href), Av, ST, T, Lk | ACC-002 | "Edit" → TenantEdit; "Open in Users" → SgsUsers; "View scopes" → TenantScopes |
| TenantEdit | sgs-ops | SGS Admin | M, TI, Sel, TA | ACC-004 | "Save" |
| TenantScopes | sgs-ops | SGS Admin | DT scopes (read-only), Tg | ACC-002, SCP-001 | SN ↔ TenantDetail |

### 1.4 `04-framework-management` (7 màn, DS dist), SGS Admin

| File | Component chính | UC | Đi tới |
|---|---|---|---|
| Main (Frameworks) | DT, ST, Btn "Download template" / "Import framework", IB | FWK-001 | Draft → FwPreview; Active → FwDetail; Import → FwImport |
| FwImport | M, FU .xlsx, Btn | FWK-009 | "Check file" → FwPreview (qua) / FwErrors (lỗi) |
| FwErrors | M, IN error, T lỗi (Sheet/Row/Column/Problem), FU | FWK-009 | "Check file" lại |
| FwPreview | PH Draft, SN, T tiers, RN, Tg, IN success | FWK-009/002 | "Discard draft"; "Activate" → FwActivate |
| FwActivate | M xác nhận | FWK-013 (LTS P2, nhưng SGS comment cần có ở P1) | → FwDetail |
| FwDetail | PH Active + OM "Import new version", SN, T tiers, 4 tile KPI | FWK-002 | "Other versions" → **FwVersions.dc.html (file không tồn tại)**; tile → FwRequirements |
| FwRequirements | PH, SN, RN, BC, Tg | FWK-002/008 | chỉ đọc |

### 1.5 `05-scope-workspace-evidence` (15 màn, DS dist), customer

| File | Role | Component chính | UC | Đi tới |
|---|---|---|---|---|
| ScopesEmpty | Customer Admin | DT empty-state | SCP-001 | → ScopeCreate |
| Main (Scopes) | CA | DT, Tg loại scope | SCP-001 | Head office → ScopeDetail; → ScopeCreate |
| ScopeCreate | CA | M, radio card, TI, Sel×2, TA×2 | SCP-003 | "Create scope" |
| ScopeDetail | CA | PH Active + OM, SN, DT frameworks, PB, ST, T users | SCP-002/004/006, USR-006 | framework → Workspace; "Link framework" → LinkFramework; "Assign users" → AssignUsers; "Edit" → (chưa có design) |
| AssignUsers | CA | M, checkbox | USR-006 | "Save" |
| LinkFramework | CA | M, Sel Framework, Sel Version, radio card tier | SCP-006, EVD-002 | "Link and create workspace" |
| ChangeTier | CA | M, radio card, IN info (coverage giảm) | không có UC | "Change to High"; **không màn nào mở tới đây** |
| ChangeTierLocked | CA | M, IN warning, Btn disabled | — | "Close" |
| Workspaces | Customer User | DT, PB, ST | EVD-003 | → Workspace |
| Workspace | CU | PH "Preparing · 62% coverage", RN, BC, ST, Tg, DI, Btn | EVD-004/005 | "Evidence library" → EvidenceLibrary; "Upload evidence" → UploadEvidence; "Link existing evidence" → LinkEvidence; DI view → EvidenceDetail |
| UploadEvidence | CU | M, FU (scanning), TI, DP×2, MS "Also use for" | EVD-008/011 | "Upload" |
| LinkEvidence | CU | M, SI, checkbox | EVD-011 | "Link 1 item" |
| EvidenceDetail | CU | Dr lg, T "Used for", T "Versions" | EVD-007/012/013 | "Unlink from R.1.1.1" / "Download" / "Upload new version" |
| EvidenceLibrary | CU | Lk back, Sel Workspace, Tabs, DT, ST, Tg, IB | EVD-006 | "Back to workspace"; tên → EvidenceDetail |
| Documents | CU | như trên, filter "All workspaces" | EVD-006 | tên → EvidenceDetail |

### 1.6 `06-gap-analysis` (53 màn, DS v2)

**Kết luận: bộ `Mvp*` là bản MVP.** Các board này nằm ở các hàng "[MVP] …" trên canvas và được thêm vào sau. Bộ còn lại (34 màn + Main) là bản đầy đủ cũ và được xếp vào Phase 2.

**Bộ MVP (17 màn):**

| File | Portal | Role | Component chính | UC | Đi tới |
|---|---|---|---|---|---|
| MvpListEmpty | customer | Customer | ES | SRQ-002 | → MvpWizard1 |
| MvpList | customer | Customer | DT, ST | SRQ-002 | ID → MvpDetail{Submitted/Progress/Completed/Rejected}; → MvpWizard1 |
| MvpWizard1 | customer | Customer | PH Draft + autosave, SN, radio card (8 framework), Sel Scope, IN "Workspace linked automatically" | SRQ-001 | "Next" → MvpWizard2 |
| MvpWizard2 | customer | Customer | PH, SN, Lk Edit, TA, Rd, DP, Sel, Cb×2 | SRQ-001 | "Submit request" → MvpDetailSubmitted |
| MvpDetailSubmitted | customer | Customer | PH, SN, ES sm, IN info, Btn | SRQ-003 | "Contact support" |
| MvpDetailProgress | customer | Customer | + Av, Lk mailto | SRQ-003, EVD-020 | mailto consultant |
| MvpDetailCompleted | customer | Customer | DI `sgs` ×2 (report + attachment), IN success | SRQ-003 | mở / tải report |
| MvpDetailRejected | customer | Customer | IN error "Reason: …", Btn "Request again" | SRQ-003/005 | → MvpWizard1 (điền sẵn) |
| MvpAdminQueue | sgs-ops | SGS Admin | Tabs (To review / In progress / Closed) → DT, ST | SRQ-002/005/006 | → MvpAdminReview / Approve / Reject |
| MvpAdminReview | sgs-ops | SGS Admin | PH + actions, SN, Lk | SRQ-003/005 | "Reject" → MvpAdminReject; "Approve & assign" → MvpAdminApprove |
| MvpAdminApprove | sgs-ops | SGS Admin | M, Sel Consultant, DP×2, TA | SRQ-005/006 | → In progress |
| MvpAdminReject | sgs-ops | SGS Admin | M danger, Sel Reason, TA | SRQ-005 | → Rejected |
| MvpConsAssignments | sgs-ops | Consultant | Tabs → DT, ST | SRQ-002 | → MvpConsDetail; Open workspace; Upload report |
| MvpConsDetail | sgs-ops | Consultant | PH, SN, Btn, ES | SRQ-003, EVD-020 | → MvpConsWorkspace; → MvpConsUpload |
| MvpConsUpload | sgs-ops | Consultant | M, FU×2, TA, Cb "This report is final…" | SRQ-007 | "Complete request" → Completed |
| MvpConsWorkspace | sgs-ops | Consultant | PH "Read only", IN, RN, ST, DI×3 (chỉ download) | EVD-020 | Back → MvpConsDetail |
| MvpConsWorkspaceEnded | sgs-ops | Consultant | ES "Your access to this workspace ended on …" | EVD-020, ROL-001 | → MvpConsDetail |

**Bộ đầy đủ cũ (Phase 2), để tham khảo:**

| File | Nội dung | MVP? |
|---|---|---|
| Main, EmptyList | List cũ (có row action Withdraw, banner "needs your input") | ⛔ (thay bằng MvpList) |
| Step1Framework … Step5Review | Wizard 5 bước | ⛔ |
| SubmitSuccess | Trang "Request sent" | 📎 |
| DetailSubmitted | Detail kèm OM "Withdraw request" | 📎 |
| **WithdrawModal** | M danger "Withdraw this request?": Reason (optional), Comment, "Withdraw request" / "Keep request" | ✅ **dùng cho UC-SRQ-004** |
| DetailScheduled, AdminAccessWindow, ConsultantScheduled | Trạng thái Scheduled, access window | ⛔ |
| Detail (In progress · Action required), **UploadRequested**, ConsultantRequestDoc, ConsultantReviewUpload | Vòng yêu cầu tài liệu (DI `actions-required`) | 📎 **mẫu cho D3/D5** |
| DetailReport, DetailResults, ConsultantAssess, ConsultantSubmit(Blocked), ConsultantCompleted | Đánh giá có cấu trúc theo requirement | ⛔ (UC-CNS-001 loại trừ) |
| DetailHistory | Bảng audit của request + Export CSV | 📎 |
| DetailRejected, AdminReject, AdminRejectReasons | Reject kèm lý do + internal note | 📎 |
| AdminQueue, AdminReview, AdminApprove, AdminMonitor, AdminChangeConsultant, AdminCancel, AdminTriageNotSure | Queue 4 tab, monitor, đổi consultant, huỷ | ⛔ |
| AdminApproveCOI | Chặn khi có conflict of interest | ⛔ **OOS** |
| ConsultantAssignments | Assignments cũ | ⛔ |

### 1.7 `07-implementation-support` (18 màn, DS v2): tất cả đều là MVP

Cấu trúc giống hệt 06 Mvp, dùng chung mảng nav. Mã request là `IS-YYYY-NNN`.

| File | Portal | Role | Khác biệt so với 06 Mvp | UC | Đi tới |
|---|---|---|---|---|---|
| Main, IsListEmpty | customer | Customer | Cột "Period" | SRQ-002 | → IsDetail*, → IsWizard1 |
| IsWizard1 | customer | Customer | Framework dạng **Sel** (7 option, không có Cybersecurity Management Act) | SRQ-001 | → IsWizard2 |
| IsWizard2 | customer | Customer | Cb×4 "What do you need help with?", TA Goal, DP start/end, Sel Delivery (có Hybrid), FU, Cb consent + attest | SRQ-001 | → IsDetailSubmitted |
| IsDetailSubmitted / Progress / Completed / Rejected | customer | Customer | Mục "Deliverables" (DI `sgs`) | SRQ-003 | mailto; "Request again" |
| IsAdminQueue / Review / Approve / Reject | sgs-ops | SGS Admin | Approve dùng "Period from/to"; thứ tự reason khác 06 | SRQ-002/005/006 | như 06 |
| IsConsAssignments | sgs-ops | Consultant | Cột Period, Deliverables | SRQ-002 | → IsConsDetail / Workspace / Deliverable |
| IsConsDetail | sgs-ops | Consultant | Btn "Share deliverable" + "Complete request" | SRQ-003 | → IsConsDeliverable / IsConsComplete / IsConsWorkspace |
| IsConsDeliverable | sgs-ops | Consultant | M: TI Title, FU, TA note | **không có UC** | "Share with customer" |
| IsConsComplete | sgs-ops | Consultant | M: TA closing summary, FU, Cb | SRQ-007 | → Completed |
| IsConsWorkspace / IsConsWorkspaceEnded | sgs-ops | Consultant | như 06 | EVD-020 | → IsConsDetail |

### 1.8 `08-certification-audit-review` (29 màn, DS dist)

| File | Portal | Role | Component chính | UC | Đi tới |
|---|---|---|---|---|---|
| Main (Request certification) | customer | Customer Admin | PH workspace + Btn, PB coverage, M (Sel period, TA, FU) | SRQ-001 | "Send request" → SR Submitted |
| ReqAssigned | customer | CA | PH "Assigned", SN, dl, timeline, Av, Lk | SRQ-003 | mailto auditor |
| ReqInProgress | customer | CA | PH "Audit in progress · 3 items need you", PB, 3 tile, Btn | SRQ-003, REV-004/011 | "Open review" → ReviewFeedback; "Open workspace (locked)" → WorkspaceLocked |
| WorkspaceLocked | customer | Customer User | PH "Locked", IN info, RN, ST, card "From the auditor", Tg Due, DI "In review" | EVD-004, REV-011/013 | "Submit corrective action" → SubmitCorrectiveAction |
| ReviewFeedback | customer | CU | BC, DT "3 need your response", ST, Tg overdue, Btn | REV-004/011 | "Respond" → RespondClarification; "Submit corrective action" → SubmitCorrectiveAction |
| RespondClarification | customer | CU | M: TA "Your answer", FU | REV-012 | "Send response" |
| SubmitCorrectiveAction | customer | CU | M: TA, DP, FU (bắt buộc), TA | REV-013 | "Submit" |
| ReqCompleted | customer | CA | 4 tile, DI `sgs` "Audit report" | SRQ-003 | mở / tải report |
| ReqCertIssued | customer | CA | IN success "Certificate TW26/1142 issued…", Btn | SRQ-003, CRT-003 | "View certificate" → Certifications |
| Certifications | customer | CA | SI, danh sách card + panel chi tiết, ST "Active" | CRT-003 (+ CRT-004 **FR**) | master/detail |
| SgsCertRequests | sgs-ops | SGS Admin/User | Tabs (To assign / In audit / Ready for certificate / Closed) → DT | SRQ-002/005/006 | "Assign auditor" → SgsAssignAuditor; "Reject" (modal ở 09); "Create certification record" → SgsCreateCert; "Change auditor" (chưa có modal) |
| SgsAssignAuditor | sgs-ops | SGS Admin/User | M: Sel Auditor, TA | SRQ-006, REV-002 | "Assign" |
| SgsCreateCert | sgs-ops | SGS User | M: TI số chứng chỉ, Sel Accreditation, DP×2, TA scope, TA sites, TI contract, TI "Certified by" read-only | CRT-001 | "Create and notify customer" |
| SgsCertifications | sgs-ops | SGS Admin/User | DT "4 certificates", ST | CRT-003 | không có action |
| AudMyAudits | sgs-ops | Auditor | Tabs (Assigned / In review / Closed) → DT | REV-003 | → AudRequest / AudReview |
| AudRequest | sgs-ops | Auditor | PH "Assigned to you" + Btn, SN | SRQ-003, EVD-020 | "Start audit review" → AudStartReview |
| AudStartReview | sgs-ops | Auditor | M xác nhận | REV-001, SRQ-007 | → AudReview |
| AudReview | sgs-ops | Auditor | PH "Waiting for customer · 40 of 61", RN "Review items", Btn Accept / Request clarification / Raise finding, DI, **CT "Internal notes"** | REV-004/005/006/016, SRQ-008 | → AudClarification / AudRaiseFinding / AudEvaluate / AudFindings / AudCloseReview |
| AudClarification | sgs-ops | Auditor | M: TA, Rd, DP Due | REV-007 | "Send to customer" |
| AudRaiseFinding | sgs-ops | Auditor | M: Sel Classification, TA, MS evidence, Cb "Corrective action required" + DP, TA internal note | REV-008 | "Raise finding" |
| AudEvaluate | sgs-ops | Auditor | Dr: DI×2, Rd Decision, TA | REV-014 | "Save decision" |
| AudFindings | sgs-ops | Auditor | DT "3 findings" | REV-004/008 | Back |
| AudCloseReview | sgs-ops | Auditor | M: 4 tile, IN success, FU report, Cb | REV-015/016 | "Close review" |
| Reviews | customer | CU | Tabs Open / Closed → DT | REV-004/011 | → ReviewFeedback |
| WorkspaceAfterReview | customer | CU | IN "workspace unlocked", RN, ST "Closed with finding", DI | EVD-004, REV-004 | Upload / Link evidence (luồng 05) |
| CorrectiveNotAccepted | customer | CU | ST "Open · resubmit", IN error | REV-013/014 | → SubmitCorrectiveAction |
| ReviewOverdue | customer | CU | IN error "1 response is overdue", Tg overdue | REV-011 | như ReviewFeedback |
| AudEvaluateClarification | sgs-ops | Auditor | Dr: Rd "Accept / Ask a follow-up / Raise a finding instead"; **CT "Comments" có tin nhắn của customer** | REV-014/006 | "Save" |
| AudChangeDueDate | sgs-ops | Auditor | M: DP, TA "Reason (shown to the customer)" | (không có UC riêng) | "Save due date" |

### 1.9 `09-certification-training` (12 màn, DS v2)

| File | Portal | Role | Component chính | UC | Đi tới |
|---|---|---|---|---|---|
| Main (Certification Services) | customer | Customer | Tabs Services 13 / My requests → DT, ST | SRQ-001/002 | "Request" → CertRequest; ID → CertDetail / CertDetailAssigned |
| CertRequest | customer | Customer | M: Sel Scope, Rd Type, Sel period, TA, FU | SRQ-001 | "Send request" → CertDetail |
| CertDetail | customer | Customer | PH "Submitted · waiting for SGS", SN, IN | SRQ-003 | — |
| CertDetailAssigned | customer | Customer | + Av, Lk | SRQ-003 | mailto |
| TrainList | customer | Customer | Tabs Services 33 / My requests → DT, Tg category | TRN-009, SRQ-001/002 | → TrainRequest / TrainDetail |
| TrainRequest | customer | Customer | M: TI Participants, Sel×3, TA | SRQ-001 | → TrainDetail |
| TrainDetail | customer | Customer | PH Submitted | SRQ-003 | — |
| CertAdminQueue | sgs-ops | SGS Admin | Tabs To assign / Assigned / Rejected → DT | SRQ-002/005/006 | "Assign" → CertAdminAssign; "Reject" → AdminReject |
| CertAdminAssign | sgs-ops | SGS Admin | M: Sel "Assign to", TA | SRQ-006 | "Assign" |
| AdminReject | sgs-ops | SGS Admin | M danger: Sel Reason, TA | SRQ-005 | "Reject request" |
| TrainAdminQueue / TrainAdminAssign | sgs-ops | SGS Admin | như cert | SRQ-002/005/006 | — |

### 1.10 `10-audit-trail` (5 màn, DS dist)

| File | Portal | Role | Component chính | UC | Đi tới |
|---|---|---|---|---|---|
| Main (Audit trail) | sgs-ops | SGS Admin | SI, Sel Action, Sel Customer, DP×2, Btn "Clear filters", Btn "Export CSV", DT (pageSize 8), Tg category | AUD-002 | "View details" → SgsAuditDetail; "Show related events" (chưa có design) |
| SgsAuditConsultant | sgs-ops | SGS Admin | filter "Consultant activity" | AUD-002 | — |
| SgsAuditDetail | sgs-ops | SGS Admin | Dr lg, T Before/After | AUD-002 | — |
| CaActivity | customer | Customer Admin | như Main, không có filter Customer | AUD-004 | → CaActivityDetail |
| CaActivityDetail | customer | CA | Dr, T | AUD-004 | — |

### 1.11 `11-unified-comment-thread` (13 board, **không dùng Graphite**)

| File | Nội dung | UC | MVP? |
|---|---|---|---|
| Main | Thread SGS tương tác được: filter Everything / Shared / Internal, composer 2 tab | SRQ-003/008, CNS-001/002 | ✅ lấy quy tắc |
| Customer | Cùng thread nhưng đã lọc cho customer (chỉ shared), composer "Reply to SGS" | CNS-002, SRQ-010 | ⚠️ xung đột UC-CNS-002 |
| Roles | Bảng màu role và quyền post | spec | ✅ quy tắc |
| States | Empty, unread, collapsed, withdrawn, sealed, filter-empty; Viewer read-only | spec | ✅ quy tắc |
| Migration | Gộp 4 khối thành 1 thread | lý do thiết kế | 📎 |
| FullPage | Trang SR SGS đầy đủ, thread nằm cuối trang | SRQ-003/007/008/009 | 📎 (layout sai 3 cột) |
| Submitted | Accept / Reject / Request info, không có bước triage | SRQ-005/009 | 📎 |
| Accepted | Gán consultant (2 ứng viên) | SRQ-006 | 📎 (vi phạm rule 1 consultant) |
| Queue, CustomerList | Canvas ghi rõ "reference only" | — | ⛔ |
| CustDetail, CustAwaitingInfo, CustRejected | Detail customer kiểu cũ, **không có thread** | SRQ-003/010 | 📎 panel trả lời info |

---

## 2. Sơ đồ điều hướng tổng

### 2.1 TopBar (lấy từ design)

| Portal | Props |
|---|---|
| Customer | `variant="home" site-name="Digital Trust Platform" site-sub="Customer Portal" user-name user-email notifications={3}`. Không truyền `home-links`, nên component tự hiện mặc định **"Request Applications"** (cam) và **"Communications"**, khớp guideline §11. Không design nào định nghĩa hai link này dẫn tới đâu. |
| SGS Ops | `variant="home" tone="dark" site-name="Digital Trust Platform" site-sub="Operations Console" badge="Internal" home-links={[]} notifications={n}` |
| Chung | Bell = NotificationCenter (dist). **Không design nào dùng `notificationItems`.** Menu avatar có "Sign out" (bundle). |

Đã chốt (design-questions Q18): truyền `homeLinks` tường minh, chỉ gồm "Request Applications" → `/service-requests`. Bỏ "Communications", vì comment giữa khách hàng và SGS đã bị loại khỏi MVP.

### 2.2 AppSidebar: các module vẽ không thống nhất, đề xuất bản hợp nhất

Customer nav có 3 biến thể:

| Biến thể | Có ở module | Điểm khác |
|---|---|---|
| (a) | 03, 06, 07, 09, 10 | Administration có Users **và Workspace access**; không có Reviews / Certifications |
| (b) | 05 | Administration chỉ có Users |
| (c) | 08 | Thêm **Reviews** (badge) và **Certifications**; Administration chỉ có Users |

Customer User không có nhóm Administration.

SGS nav:
- 08 thêm **Certifications**.
- 03 thêm nhóm Administration › Users.
- Icon Customers khi là `category` (03, 08), khi là `user--multiple` (các module khác).
- Consultant và Auditor có nav riêng.

**Nav hợp nhất đề xuất:**

```
CUSTOMER PORTAL (Customer Admin; Customer User bỏ nhóm Administration; Viewer: xem mục 3.10)
  Home                       dashboard            /                      (chưa có design)
  Scopes                     category             /scopes
  Workspaces                 folders              /workspaces
  Documents                  document--multiple-01 /documents
  Reviews            [badge] view                 /reviews
  Service Requests   [badge] task
    All requests                                  /service-requests      (chưa có design)
    Certification Services                        /service-requests/certification
    Training Courses                              /service-requests/training
    ─ Other services
    Gap Analysis     [badge]                      /service-requests/gap-analysis
    Implementation Support                        /service-requests/implementation-support
  Certifications             checkmark            /certifications
  (Trust Passport)           ?                    /passport              ← D1, không có trên design
  Training                   education            /training              (chưa có design: Academy)
  Audit Logs                 catalog              /audit-logs            (chỉ Customer Admin, UC-AUD-004)
  Settings                   settings             /settings              (chưa có design)
  ─ Administration
  Users                      user--multiple       /admin/users
  (Workspace access bị bỏ theo design-questions Q17: quyền đã gán theo scope)

SGS OPERATIONS: SGS Admin / SGS User
  Home                       dashboard            /ops                   (chưa có design)
  Requests           [badge] task
    All requests                                  /ops/requests          (chưa có design)
    Certification                                 /ops/requests/certification
    Training                                      /ops/requests/training
    ─ Other services
    Gap Analysis     [badge]                      /ops/requests/gap-analysis
    Implementation Support                        /ops/requests/implementation-support
  Certifications             checkmark            /ops/certifications
  Customers                  user--multiple       /ops/customers
  Frameworks                 catalog              /ops/frameworks
  Assignments                user--access         /ops/assignments       (chưa có design, UC-ACC-006)
  Audit Logs                 document             /ops/audit-logs
  Settings                   settings             /ops/settings          (chưa có design)
  ─ Administration (SGS Admin)
  Users                      user--multiple       /ops/admin/users

SGS CONSULTANT
  Home · My assignments [badge] (Gap Analysis, Implementation Support) · Frameworks · Settings
  /ops/my-assignments/gap-analysis · /ops/my-assignments/implementation-support
  (dùng "my-assignments" để khỏi trùng với "Assignments" của Admin)

SGS AUDITOR / CERTIFICATION
  Home · My audits [badge] · Settings          /ops/audits
```

Quy tắc chung: trang danh sách có sidebar mở rộng; trang chi tiết, wizard và workspace có sidebar thu gọn.

### 2.3 Route map và luồng đi (màn → màn)

```
/login ─(wrong/locked/inactive: state)─ → /            /ops/login → /ops (theo role → /ops/my-assignments | /ops/audits)
email mời → /activate?token → success → /  | expired | used → /login        /ops/activate?token

CUSTOMER
/scopes ─Create(modal)→ /scopes/[id] ─Link framework(modal)→ tạo workspace → /workspaces/[id]
                                     ─Assign users(modal) ─Change tier(modal | locked)
/workspaces → /workspaces/[id]?req=… ─Upload(modal) ─Link existing(modal) ─Evidence(drawer)
            ─Evidence library → /documents?workspace=…   ─Request certification(modal) → SR cert
            ─(đang audit) locked → Submit corrective action(modal)
/documents (tabs All | Expiring or expired | Not linked) → drawer evidence
/service-requests/{category} → /new (wizard GA/IS | modal Cert/Training) → /[id] (render theo status)
     /[id]: Withdraw(modal) · Respond to info request · Request again → /new?from=[id]
/reviews → /reviews/[id] ─Respond(modal) ─Submit corrective action(modal)
/certifications → /certifications/[id]      (/passport → share link modal → /p/[token] public)
/audit-logs?event=… (drawer)   /admin/users → /admin/users/[id] (modal invite / assign scopes / revoke)

SGS OPS
/ops/customers → /ops/customers/[id] (/scopes, modal edit / create admin)   /ops/admin/users?tab=sgs|customers
/ops/frameworks ─Import(modal: check → errors | preview) → /ops/frameworks/[code]/versions/[v] → Activate(modal)
/ops/requests/{gap-analysis|implementation-support}?tab=todo|prog|closed → /[id] ─Approve&assign ─Reject
/ops/requests/certification?tab=to-assign|in-audit|ready|closed ─Assign auditor ─Reject ─Create certification record
/ops/requests/training?tab=to-assign|assigned|rejected ─Assign ─Reject
/ops/my-assignments/{ga|is} → /[id] ─Upload report & complete | Share deliverable ─Complete → /[id]/workspace (| ended)
/ops/audits?tab=… → /ops/audits/[id] ─Start review → /ops/audits/[id]/review?item=…  → /findings
/ops/certifications   /ops/audit-logs?…&event=… (drawer)
```

---

## 3. State machine

Mỗi state machine ghi rõ nguồn: design, UC, ER, hoặc `(suy ra)`. Nhãn copy giữ nguyên tiếng Anh như trên design.

### 3.1 Service Request (bảng `SERVICE_REQUEST.status`, `category`)

Enum backend đề xuất, dùng chung cho mọi category:
`draft · submitted · information_requested · assigned · in_progress · audit_completed · completed · certificate_issued · rejected · cancelled`

Mỗi category chỉ dùng một tập con:

| Category | Đường chính (design) | Nhánh |
|---|---|---|
| Gap Analysis (06 Mvp) | draft → submitted → in_progress → completed | submitted → rejected |
| Implementation Support (07) | draft → submitted → in_progress (thêm deliverable nhiều lần) → completed | submitted → rejected |
| Certification (08 ∪ 09) | submitted → assigned → in_progress → audit_completed → certificate_issued | submitted → rejected |
| Training (09) | submitted → assigned | submitted → rejected. Sau assigned không có trạng thái nào (DTP không quản lý việc tổ chức đào tạo, UC-TRN-009) |
| Mọi category `(suy ra)` | submitted \| in_progress → information_requested → (customer trả lời) → quay lại trạng thái trước | D3 |
| Mọi category | submitted (và assigned với cert/training, khi chưa Start review) → cancelled | D4, UC-SRQ-004 "before SGS delivery begins" |

Transition, ai kích hoạt, và hệ quả:

| Transition | Actor | UI | Hệ quả (theo copy) |
|---|---|---|---|
| ∅ → draft | Customer Admin / User | "Request a gap analysis" / "Request support" | autosave "All changes saved" |
| draft → submitted | Customer | "Submit request" / "Send request" | Bắt buộc tick 2 checkbox consent + attest (GA/IS). Cert/training không có draft. |
| submitted → in_progress (GA/IS) | SGS Admin (+ SGS User, D8) | Modal "Approve and assign consultant" | Gán 1 consultant, ngày on-site hoặc period. Consultant có quyền **đọc** workspace ngay từ lúc này. |
| submitted → assigned (Cert) | SGS Admin / User | "Assign auditor" (chỉ user SGS Auditor/Certification) | Customer thấy "Your SGS auditor" |
| submitted → assigned (Training) | SGS Admin | "Assign" (SGS Academy coordinator) | |
| submitted → rejected | SGS Admin | Modal danger, Reason* + Message* | Customer thấy "Reason: …" và message. Rejected là trạng thái cuối. Có "Request again" để tạo draft mới điền sẵn. |
| assigned → in_progress (Cert) | Auditor | "Start audit review" | Tạo REVIEW và REVIEW_ITEM (1 item / requirement của tier), **khóa workspace** |
| in_progress → audit_completed | Auditor | "Close review" | Mở khóa workspace, auditor hết quyền truy cập |
| audit_completed → certificate_issued | SGS User | "Create certification record" → "Create and notify customer" | Tạo CERTIFICATION ở trạng thái Active |
| in_progress → completed (GA) | Consultant | "Upload report and complete" (PDF + tick "This report is final") | Không undo được. Consultant hết quyền truy cập workspace. |
| in_progress → completed (IS) | Consultant | "Complete this request" | Như trên. Deliverable vẫn còn cho customer. |
| submitted/assigned → cancelled | Customer | WithdrawModal "Withdraw request" / "Keep request" | Snackbar `(suy ra)` |
| * → information_requested | SGS User / Consultant / Auditor `(suy ra)` | Modal "Request information" (chưa có design) | Sidebar hiện badge "needs action" |

Nhãn StatusTag trên design:

| Trạng thái | StatusTag `status` | Nhãn trong list | Nhãn trên PageHeader |
|---|---|---|---|
| draft | `draft` | — | "Draft" |
| submitted | `under-review` | "Submitted" | "Submitted · waiting for SGS" |
| assigned | `info` | "Assigned" | "Assigned · SGS contact {name}" (09) / "Assigned" (08) |
| in_progress | `info` (GA/IS) / `under-review` (Cert) | "In progress" | "Audit in progress · N items need you" |
| audit_completed | `completed` | "Audit completed" | |
| completed | `completed` | "Completed" | |
| certificate_issued | `completed` | "Certificate issued" | short "Issued" |
| rejected | `rejected` | "Rejected" | |
| information_requested `(suy ra)` | `missing-info` | "Action required" | "In progress · Action required" (06 cũ) |
| cancelled `(suy ra)` | `draft` | "Withdrawn" (06 cũ) | |

Quyền truy cập:
- Customer chỉ thấy scope được gán ("Only scopes assigned to you are listed.").
- Consultant chỉ thấy request của mình.
- Auditor chỉ thấy workspace khi request đang gán cho mình.
- Mọi lượt view hoặc download của consultant và auditor đều ghi AUDIT_EVENT.

### 3.2 Document Item (component `DocumentItem`, guideline EP §5)

Design và guideline định nghĩa: variant `standard | under-review | actions-required | sgs`; status `completed | needs-description | under-review | missing-info | rejected`. Dưới đây là đề xuất cho DTP, phần lớn là `(suy ra)` vì design MVP chỉ dùng một phần.

```
[customer đính kèm khi tạo SR]  needs-description ──(nhập mô tả)──▶ completed
                                    (Actions: Edit description, Open, Delete)
[SR submitted]                   under-review (read-only: View description, Open)
[SGS yêu cầu tài liệu]           actions-required / missing-info  (viền cam dashed; action: Upload)
     └─(customer upload)──▶ under-review ──(SGS accept)──▶ completed
                                          └─(SGS ask again)──▶ missing-info (kèm comment và due mới)
                                          └─(SGS reject)──▶ rejected (hiện "Rejected Reason")
[tài liệu SGS phát hành]         variant sgs, không có status (Gap Analysis Report, Deliverable, Audit report)
```

- **Quy tắc SR** `(suy ra, theo brief)`: khi SR còn ≥1 item `missing-info`, SR ở `information_requested`. Khi item cuối cùng rời `missing-info` (customer đã upload), SR quay lại trạng thái chờ SGS trước đó: `submitted` hoặc `in_progress`.
  - Design cũ mâu thuẫn nhau về thời điểm xoá "Action required": UploadRequested xoá khi customer upload, ConsultantReviewUpload xoá khi consultant accept. **Đề xuất: xoá khi upload**, vì "chờ SGS" đúng là tình trạng lúc đó.
- File upload phải qua virus scan: "Scanning for viruses…" rồi "Scanned · clean". Giới hạn ≤ 20 MB.
- Guideline có "Affected Products" (Area 5), đó là khái niệm của EP, **không áp dụng cho DTP**. Accordion đổi thành "Requested for {requirement}" (06 cũ).
- ER **không có bảng DOCUMENT_ITEM hay DOCUMENT_REQUEST**. Tài liệu của SR hiện chỉ có thể là EVIDENCE hoặc comment, nên cần bổ sung vào model.

### 3.3 Evidence (bảng `EVIDENCE`, `EVIDENCE_VERSION`, `EVIDENCE_MAPPING`)

| Khía cạnh | Quy tắc | Nguồn |
|---|---|---|
| Upload | File bất kỳ, ≤ 20 MB. Có virus scan (`scan_state`: scanning → clean). Trường: Name*, Valid from, Valid until (để trống = không hết hạn), "Also use for" (các requirement khác trong cùng workspace). | 05 UploadEvidence |
| Map nhiều control | "Linking doesn’t copy the file; a new version updates every requirement that uses it." Chỉ link được evidence trong **cùng workspace** ("Each file belongs to one workspace"). UC-EVD-011 thì cho phép cross-framework. | 05, UC |
| Gỡ mapping | "Unlink from R.x" trong drawer. **File vẫn nằm trong library**, tab "Not linked". Snackbar "Mapping removed from {code}. The file stays in your library." | 05 + prototype |
| Version | Upload new version làm version_no + 1, giữ lịch sử. Review status bị reset Accepted → Under review. | 05 Versions, 10 audit diff |
| Outdated | `expires_at` dẫn tới Validity: **Valid / Expires soon / Expired** (`completed / needs-description / missing-info`). Tab "Expiring or expired". Ngưỡng "soon" chưa định nghĩa, mặc định 30 ngày (`// TODO`). UC-RDN-003 là LTS P2 nên chỉ hiển thị, không tính vào coverage. | 05 Documents |
| Requirement status | **Missing / Partial / Provided** (`missing-info / needs-description / completed`). Coverage = requirement đã có đủ evidence *mandatory* ÷ số requirement của tier. Luôn ghi kèm "not a compliance decision". | 05 RN |
| Owner | Owner cho từng requirement (`EVIDENCE_MAPPING.requirement_owner_id`) chưa có UI gán, xem **D6**. Evidence có `owner_user_id`. | ER, UC-EVD-016 |
| Workflow status | UC-EVD-014 định nghĩa draft / submitted / reviewed / rejected / accepted / archived. Design chỉ có "Not reviewed by SGS yet", "In review" (locked), "Accepted", "Under review". **Đề xuất:** `not_reviewed → in_review → accepted`, bỏ "draft/submitted" vì không có Evidence Package (FR). | mâu thuẫn |
| Khóa | Khi đang có audit review, không upload / replace / delete được; chỉ thêm file qua response cho auditor. Không đổi được tier, không unlink framework, không sửa scope. | 08, 05 ChangeTierLocked |
| Xoá / Archive | UC-EVD-015 và UC-EVD-019 là MVP nhưng chưa có design. | gap |

### 3.4 Review / Finding / Corrective action (08; bảng `REVIEW`, `REVIEW_ITEM`, `FINDING`)

**Review** (chỉ có loại Audit Review; Readiness Assessment Review chưa có design):
`(Start audit review) in_review ↔ waiting_for_customer → ready_to_close (derived: mọi item đã final và không còn finding open) → closed`
- Nhãn: "Waiting for customer · 40 of 61 reviewed", "Ready to close · 61 of 61 reviewed", "Closed".
- Nút "Close review" disabled cho đến khi review ở `ready_to_close` (UC-REV-016).
- Close: có thể upload audit report (PDF, customer xem được) và phải tick "The review is complete. Closing unlocks the customer’s workspace and ends my access."

**Review item** (một item cho mỗi requirement):

```
not_reviewed ──Accept──▶ accepted
             ──Request clarification (question*, expected: answer+files | answer only, due*)──▶ clarification_requested
                    └─customer "Send response"──▶ response_submitted
                           └─Evaluate: Accept ▶ accepted | Follow-up ▶ clarification_requested | Raise finding ▶ finding_raised
             ──Raise finding──▶ finding_raised
                    └─(finding closed)──▶ closed_with_finding
```

- Nhãn auditor: Not reviewed / Accepted / Clarification requested / Finding raised / Response submitted / Closed with finding.
- Nhãn customer: Not reviewed / Accepted / Clarification / Finding / **Response sent**; sau review thêm "Not in last audit".

**Finding:**
- Classification: Major nonconformity ("blocks certification") · Minor nonconformity · Observation ("no response needed") · Opportunity for improvement ("no response needed").
- Trạng thái: `open → response_submitted → closed`, hoặc `→ open ("Open · resubmit")` nếu corrective action bị "Not accepted" (bắt buộc có comment cho customer).
- Observation và OFI đóng ngay, không cần response.
- Due date: hiển thị "{date} · overdue" và banner "1 response is overdue". Auditor đổi được due date của finding (reason hiện cho customer).
- **Corrective action** (customer): Action taken*, Completed on*, Evidence of the correction* (file được thêm vào workspace dưới requirement đó), Note.

### 3.5 Gap Analysis (06 Mvp) và Implementation Support (07)

Cả hai theo state machine ở 3.1. Nên dựng thành **một module "consulting request" dùng chung, tham số hoá theo loại**.

| | Gap Analysis | Implementation Support |
|---|---|---|
| Wizard bước 1 | Framework* (radio card 8 option) + Scope*; workspace tự suy từ scope + framework | Framework* (Select 7 option) + Scope* |
| Wizard bước 2 | Goal*, Delivery* (On site/Remote), Earliest start*, Contact person*, 2 checkbox | Support needed* (≥1), Goal*, Preferred start/end*, Delivery* (+Hybrid), Documents, 2 checkbox |
| Approve | Consultant*, On site from/to*, message | Consultant*, Period from/to*, message |
| Reject reason | Scope not ready or unclear · Duplicate of an open request · Framework not offered · No commercial agreement · Other | cùng 5 giá trị, khác thứ tự; **dùng chung một danh sách** |
| Output của consultant | 1 report PDF (đổi tên thành "{GA id} – Gap Analysis Report.pdf") + attachment; upload đồng thời là hoàn tất | Nhiều deliverable (hiện với customer ngay khi share), sau đó Complete riêng |
| Consultant access | Read-only (view + download), từ lúc approve đến lúc completed; sau đó hiện màn "access ended" | Như GA. Màn ended ghi theo "period end", **mâu thuẫn**, đề xuất chỉ theo completion |

Quy tắc chung:
- Mỗi request có đúng 1 framework và 1 scope.
- Không có COI (OOS).
- UC-ACC-006 giới hạn "≤ 1 consultant active / customer", nhưng modal không kiểm tra điều này. Đề xuất hiện cảnh báo `// TODO`.

### 3.6 Certification (08) và Training (09)

- **Certificate** (bảng `CERTIFICATION`):
  - Trường: Certificate number*, Accreditation* (TAF / UKAS / Not accredited), Certificate date*, Valid to*, Certificate scope*, Certified sites*, Contract number, Certified by (affiliate, read-only).
  - Trạng thái trên design: **chỉ có "Active"**. Suspend / Withdraw / Expire / Reinstate (UC-CMT-*) đều LTS P2 và chưa có design.
  - Đề xuất: `active` và `expired` (suy ra từ `valid_to < today`). Chỉ thế.
  - Mâu thuẫn: 08 tạo cert thứ hai còn hiệu lực cho cùng scope + framework (TW26/1150 so với TW25/0877). Cần có quy tắc recertification.
- **Certification request, form hợp nhất:**
  - Từ catalog (09): Scope*, Type* (Initial certification / Recertification / Transfer from another body), Preferred audit period*, Message, Documents.
  - Từ workspace (08): điền sẵn scope, framework và tier. Kèm cảnh báo "When the audit review starts, this workspace is locked…".
- **Training request:** Participants*, Format* (Public class / In-house / Online), Preferred month*, Language* (繁體中文 / English), Message. Không có scope.
  - Catalog 33 course lấy từ `book-a-service.md`, nhưng design thiếu tên zh-Hant cho course.
  - Top-level "Training" (Academy API, UC-TRN-001/002) chưa có design.

### 3.7 User và Tenant (03)

- **User** (bảng `APP_USER.status`): `invited ("Invitation pending") → active` khi người được mời kích hoạt; `invited → expired ("Invitation expired")` sau 7 ngày (suy từ ngày mẫu); `invited/expired → revoked` (dòng bị xoá khỏi list; link mời hết hiệu lực); `active → deactivated` (chỉ hiển thị, UC-USR-008 là LTS P2).
  - Resend tạo link mới.
  - Customer Admin chỉ mời được Customer User, không đổi được role (CaChangeRole là bản vẽ lỗi).
  - SGS Admin mời 4 role SGS; affiliate cố định theo admin.
- **Tenant** (`TENANT.status`): `no_admin ("No admin yet") → admin_invited → active` khi Customer Admin kích hoạt. Mỗi customer có 1 Customer Admin. Suspend / offboard là LTS P2.
- **Login:** khóa 15 phút sau khi sai quá số lần (5 lần theo 02). Session timeout sau 30 phút không hoạt động. Mật khẩu ≥12 ký tự, có chữ hoa và thường, số, ký hiệu, và không trùng email.

### 3.8 Framework, Scope, Workspace

- **Framework version:**
  - `draft ("Draft · not active") → active` qua "Activate framework"; hoặc `draft → discarded`.
  - Import kiểm tra toàn bộ, nếu có lỗi thì không import gì.
  - Sau khi active, nội dung bị khoá; muốn sửa thì "Import new version". Phần versioning đụng tới UC-FWK-010 (FR).
- **Scope:** Organization / Product / System. System có thể thuộc một Organization và một Product. Trạng thái chỉ có "Active".
- **Workspace** (bảng `EVIDENCE_WORKSPACE.status`):
  - `preparing → audit_in_progress (locked) → audited` ("Audit completed · {date}"), sau đó quay lại chỉnh sửa được.
  - Được tạo tự động khi link framework: mỗi scope + framework + cycle có 1 workspace.
  - Tier: Basic ⊂ Medium ⊂ High (44 / 61 / 79). Đổi tier thì evidence giữ nguyên, coverage được tính lại. Không đổi được tier khi đang audit.

### 3.9 Trust Passport (không có design, xem D1)

Quy tắc theo brief và prototype cũ, dựng lại bằng Graphite:
- **Chỉ chứng chỉ Active** mới bật được "Visible to external stakeholders". Chứng chỉ khác thì toggle disabled và snackbar "Only issued certificates can be shared."
- **Share link:**
  - Trường: "Shared with"* (nhãn nội bộ) và "Link expires after" 7 / 30 / 90 ngày (mặc định 30).
  - Trạng thái: `active → expired` (khi quá `expires_at`) hoặc `active → revoked` ("Link revoked. It no longer opens.").
  - Link dạng token, read-only, không cần đăng nhập.
- **Access log:** When / Link / Activity, và số lượt xem cho mỗi link. Có notification "Your share link was viewed".
- **Trang public `/p/[token]`:** chỉ hiện chứng chỉ Active đang bật visible. Link hết hạn hoặc bị revoke thì hiện trang lỗi.
- ER **chưa có bảng** SHARE_LINK và SHARE_ACCESS_LOG; có sẵn `CERTIFICATION.provenance`.

### 3.10 Comment thread (11)

**Hai loại visibility:** `SHARED` ("Visible to customer") và `INTERNAL` ("Internal · SGS only", có hatch và ổ khoá). Lọc ở server: session customer không bao giờ nhận dòng internal.

| Role | Đọc shared | Đọc internal | Post |
|---|---|---|---|
| Customer Admin / User | ✓ | ✗ (chỉ được biết là "internal notes exist") | shared (**D7**: UC-CNS-002 không cho reply) |
| Customer Viewer | ✓ | ✗ | không post. "Your role can read this discussion. Ask a Customer Admin…" |
| SGS Admin | ✓ | ✓ | shared + internal |
| SGS Consultant (đang được gán) | ✓ | ✓ | shared + internal |
| SGS Auditor / Assessor | ✓ | ✓ (thread review) | trong thread review. Module 08 hiện là CT "Internal notes" riêng |
| SGS User | ? | ? | **chưa được định nghĩa**. Đề xuất: giống SGS Admin (UC-SRQ-008 liệt kê SGS User) |
| System | — | — | chỉ sinh sự kiện trạng thái, không gõ tay |

- Composer có 2 tab: "Reply to customer" / "Internal note".
  - Mặc định SHARED.
  - Khi SR còn `submitted` và chưa có consultant, mặc định INTERNAL ("SGS Admin only until a Consultant is assigned").
- Không sửa được tin nhắn; tác giả chỉ có thể "withdraw" (Audit Trail vẫn giữ bản gốc).
- SR đã đóng thì thread bị khoá ("nothing more can be posted").
- Filter chỉ có phía SGS: Everything / Shared with customer / Internal only.
- Lý do reject và nội dung request-info được đăng vào thread dưới dạng shared.

### 3.11 Notification (UC-NTF-001/002, MVP)

- Chưa có design nội dung; component `NotificationCenter` có trong dist.
- Loại: `status | review | certificate | assignment | user | document`. Tab: Unread / All.
- Bấm vào thông báo thì đánh dấu đã đọc và mở đối tượng.
- Mỗi transition ở mục 3.1–3.9 sinh một notification cho bên liên quan `(suy ra)`.

---

## 4. Mâu thuẫn và lỗ hổng

### 4.1 Phiên bản DS trong `ds/` của từng module

| Bản | Module | Khác so với `design-system/graphite/dist` | Ảnh hưởng |
|---|---|---|---|
| v0 (rất cũ) | 02 | Thiếu Logo, TopBar, AppSidebar, PageHeader, Card, Drawer, DataTable, EmptyState…; thiếu token `--shell-dark`, `--surface-*`, `--layer-extension`; `--background` là #E7EDF0 thay vì #DCE3E7 | 02 đã bị thay thế, không dùng |
| v1 | 01 | `--surface-card` khác; thiếu `--surface-card-inset`; thiếu NotificationCenter | Không ảnh hưởng màn login |
| v2 | 03, 06, 07, 09 | Token và CSS giống dist; `bundle.js` thiếu NotificationCenter và prop `TopBar.notificationItems / notificationsOpen / notificationsTab / notificationsHasMore` | Không màn nào dùng, nên build theo dist là an toàn |
| v3 = dist | 04, 05, 08, 10 | Giống hệt từng byte | — |
| không có | 11 | Không dùng Graphite; `support.js` và `ds/` không có trong repo | Phải dựng lại toàn bộ |

→ **Chỉ port từ `dist`.**

### 4.2 Mâu thuẫn giữa các module

1. **Cert request 08 và 09:** khác form, khác trạng thái, khác tab, khác thuật ngữ ("SGS auditor" so với "SGS contact"). Mã mẫu CR-2026-012 và CR-2026-004 trùng nhau nhưng mang ý nghĩa khác. Xem D2.
2. **Sidebar customer/SGS có 3 biến thể:** xem 2.2. Icon `catalog` được dùng cho "Audit Logs" (customer) và "Frameworks" (SGS).
3. **Tier:** 04 ghi SGS đặt; 05 và 03 (TenantEdit "Tier (set by customer)") ghi customer đặt; 03 TenantNew lại ghi "SGS sets the tier". Xem D10.
4. **GA và IS:** cùng khung nhưng khác control (radio card / Select), khác lựa chọn framework, delivery, ngày, thứ tự reason, tên section ("Decision" / "Status").
5. **Reject reason:** 06 có 5 lý do kèm internal note; 09 có 4 lý do khác ("Service not offered by this affiliate", "Not enough information") và không có internal note. → gom vào một bảng cấu hình theo category.
6. **CommentThread:** 08 dùng thread "Internal notes" riêng (và "Comments" trộn tin customer ở AudEvaluateClarification); 11 muốn gộp làm một; 06/07 dùng Textarea "Message to the customer" trong modal.
7. **"Closed with finding":** tone xanh phía auditor, vàng phía customer. **Nhãn lệch:** "Response submitted" (auditor) và "Response sent" (customer).
8. **Scope type "Site"** (03, 06, 07) không có trong UC-SCP-003 (chỉ có organization / product / system). Tên scope viết lúc "Head office · Taipei", lúc "Head office, Taipei".
9. **Vai trò của David Wu:** "Certification coordinator" (09), "SGS Auditor" (10), "SGS Auditor/Certification" (08).
10. **Truy cập của consultant:** 07 Ended ghi hết theo period, còn mọi chỗ khác ghi hết khi completed.
11. **Badge sidebar không khớp số trong tab:** 3 so với 2 (admin), 1 so với 2 (consultant); IS dùng lại badge của GA.
12. **Dữ liệu mẫu:** ABC Trading có 2–3 consultant active cùng lúc, vi phạm UC-ACC-006. Workspace 27001 lúc có 77 requirement, lúc 116. FwDetail có 76 requirement nhưng bảng tier ghi 79.

### 4.3 Design so với use case

| Design | UC | Đề xuất |
|---|---|---|
| Triage/approve do SGS Admin | UC-SRQ-005 chỉ ghi SGS User | Cho cả hai (D8) |
| Consultant bấm Complete | UC-SRQ-007 không có Consultant | Giữ theo design (D9) |
| Consultant workspace read-only, không có comment | UC-CNS-001: consultant **thêm comment** customer thấy được, trên requirement/evidence | Thêm CT dạng shared trên card requirement ở workspace consultant |
| 11 cho customer reply | UC-CNS-002: "no chat or reply"; UC-SRQ-010: chỉ trả lời information request | D7 |
| Email "You’ll get an email" | UC-NTF-001: email là P2 | D11 |
| Customer Certifications có panel chi tiết | UC-CRT-004 là **FR** | Giữ ở dạng tối giản, gắn nhãn |
| Versioning framework ("Import new version", "Other versions") | UC-FWK-010/011 là FR | Chỉ hiển thị list version, không làm migration |
| Share deliverable (07) | Không có UC | Giữ (có design), ghi chú cần bổ sung UC |
| Export CSV audit trail (10), "Download summary (PDF)" (06 cũ) | Không có UC (không có UC-AUD-003) | Nút giả, snackbar "prototype" |
| UC-AUD-002 được design | SGS comment ghi "Phase 2?" | Giữ |
| Readiness caption và ReadinessRing | UC-RDN-001/004 là LTS P2 | Chỉ hiển thị coverage, ghi "not a compliance decision" |
| Evidence workflow status | UC-EVD-014 có 6 trạng thái | Xem 3.3 |
| Link evidence chỉ trong cùng workspace | UC-EVD-011 cho phép cross-framework | Theo design (cùng workspace); ghi chú |
| Consultant request tài liệu (06 cũ) | UC-SRQ-009 không có Consultant | Cho Consultant và Auditor (D3) |
| DocumentItem "Affected Products" | Khái niệm của EP | Bỏ |
| 11 Accepted: 2 consultant cho 1 customer | UC-ACC-006 giới hạn ≤1 | Cảnh báo |

### 4.4 Design so với guideline (CLAUDE.md và EP UI Guidelines)

1. **Layout SR create 3 cột:** tất cả wizard (06, 07) chỉ có 2 cột (bước + nội dung), thiếu cột phải. Trang detail dùng 3 cột nhưng cột phải cũng `overflow:auto`. → ~~Wizard thêm cột phải~~. Designer đã trả lời (design-questions Q1, Q2): wizard giữ 2 cột. Trên trang detail, cột phải được cuộn riêng.
2. **Field width:** dùng px tự đặt (552, 268, 312, 640, 720, 588px), `width="100%"` (01, LinkEvidence, AudEvaluateClarification), trộn M và L trong cùng container (03). → Designer đã trả lời (Q4–Q6): 552 / 268 / 588 là token. Modal Create scope đổi về 552 / 268. Chỉ Textarea AudEvaluateClarification đổi về 552. Trong container trộn M và L thì căn theo field rộng nhất.
3. **Snackbar:** **không có màn nào vẽ** snackbar sau action (trừ 02). → Phải viết copy (mục 5.3).
4. **Đỏ và cam:**
   - Lỗi kiểm tra file import (04 FwErrors) và lỗi locked/inactive ở login (01) dùng IN error màu đỏ.
   - Nút primary của modal danger (Reject / Revoke / Withdraw) màu đỏ. CLAUDE.md không nói gì về nút destructive → Open question #4.
   - Module 11 dùng cam #CA4300 cho status ("Awaiting Information"), cho màu role Consultant và cho chấm trạng thái, trái rule.
5. **Border:** 11 có border ở gần như mọi container. Selected radio card, DocumentItem, InlineNotification có stroke là do component (chấp nhận được).
6. **Typography:** 02 v1 và 11 dùng size lệch lưới (11/13/15/19/26px…), 11 dùng IBM Plex Sans. 10 (SGS) không load Noto Sans TC.
7. **Primary CTA ở theme sgs-ops** màu xám đậm, không cam → Open question #12.
8. **Status chỉ bằng màu:** chấm timeline (06/07/08/09) và chấm trạng thái ở 11. Icon-only action của DocumentItem thiếu `label`. Touch target < 48px ở 11 và 02.
9. **Checkbox và radio trong screenshot** hiện chưa tick dù source có `checked` (plain `<input>` trong runtime). → Làm theo source, không theo ảnh.
10. **Không có breakpoint** nào ngoài 1440 (trừ 02/SignInMobile 412).

### 4.5 UC trong MVP (UC List, không LTS P2) chưa có màn design

| Nhóm | UC chưa có màn |
|---|---|
| Auth | AUTH-002 Log out (chỉ có trong menu avatar của bundle); các trạng thái activate phía SGS; email mời SGS user và Customer Admin đầu tiên |
| User / Role | USR-005 đổi role (CaChangeRole lỗi); **ROL-002 ma trận quyền**; màn Customer Viewer (không design nào có role Viewer) |
| Account | ACC-006 gán nhân sự SGS cho customer (nav "Assignments" không có màn); ACC-001/002 góc nhìn SGS User và Consultant |
| Home / điều hướng | **Home customer, Home SGS**, "All requests" (cả 2 portal), Settings (Workspace access và "Communications" đã bỏ theo Q17 và Q18) |
| Framework | FWK-004 sửa metadata, FWK-005/007 tạo/retire requirement, FWK-008 chỉ hiển thị; trang "Other versions" |
| Scope | SCP-004 form sửa scope, SCP-007 unlink framework |
| Evidence | EVD-001 tạo workspace thủ công, EVD-010 sửa metadata, EVD-014 workflow status, EVD-015 xoá, **EVD-016 owner**, EVD-019 archive workspace |
| Service request | **SRQ-004 cancel** (chỉ có 06 cũ), SRQ-008 internal comment (ngoài 08/11), **SRQ-009/010 request/respond info** (ngoài 06 cũ/11), SRQ-003 phía SGS cho cert/training, trạng thái Rejected phía customer của cert/training, detail consultant sau khi completed |
| Review | REV-001 Readiness Assessment Review; REV-006 comment ở cấp evidence; góc nhìn Viewer |
| Consulting | **CNS-001/002 consulting comment** trên requirement/evidence |
| Certification | CRT-002 sửa certificate (LTS P2) |
| Training | **TRN-001/002 Academy catalogue + course detail** (có trạng thái "catalogue unavailable") |
| Notification | **NTF-002 inbox** (NotificationCenter chưa được dùng ở đâu) |
| Audit | "Show related events" |
| LTS P2 (chưa có design, hợp lý) | PSP-001…007 (**Trust Passport**, D1), CMT-001…007, ASM-001…003, RDN-001…005, CKP, JRN, USR-004/007–010, ACC-008–010, SCP-005/008, FWK-003/006/013/014, SCH-*, CFG-*, ORG-*, TRN-004–008 |

Design đang làm những thứ **không thuộc MVP** (không dựng):
- SSO (AUTH-006 FR), Forgot password (AUTH-003 LTS P2): 02
- Toàn bộ COI (OOS): 06 cũ
- Scheduled, access window, change consultant, đánh giá theo requirement: 06 cũ
- Reopen request: 11
- "Request access", "Cookie settings": 02

---

## 5. Hướng dựng prototype (sau khi duyệt)

1. **Stack cho prototype clickable** (đã chỉnh theo decisions.md):
   - Next.js (App Router, TypeScript) đặt trong `apps/prototype`.
   - Graphite port vào `packages/graphite`, giữ API của `index.d.ts`, token và CSS.
   - Mock data và mock API nằm trong `apps/prototype/src/mock`. Không dùng Vite.
   - Route theo mục 2.3; mock data và state machine ở mục 3 viết thành reducer thuần, có unit test.
   - Có "role switcher" để đổi giữa 7 persona (CA, CU, CV, SGS Admin, SGS User, Consultant, Auditor): mỗi role nhìn đúng dữ liệu của mình. Không có External, vì Trust Passport không dựng (D1).
   - Không dùng UI nào của `prototype/index.html`.
2. **Thứ tự dựng:**
   1. Shell + auth (01)
   2. Users/Tenant (03)
   3. Framework (04)
   4. Scope/Workspace/Evidence (05)
   5. Consulting request GA+IS (06 Mvp, 07)
   6. Certification + Audit review (08 ∪ 09)
   7. Training (09)
   8. Audit trail (10)
   9. Comment thread (11, sau khi chốt D7)
   10. Notification (Trust Passport không dựng, D1)
3. **Snackbar:** copy lấy theo prototype cũ khi có, còn lại tự viết, ví dụ "Request submitted", "Request approved · {consultant} assigned", "Request rejected", "Deliverable shared with the customer", "Evidence uploaded and mapped to N controls", "Mapping removed from {code}. The file stays in your library.", "Link copied", "Link revoked. It no longer opens."
4. **Kiểm tra:** mỗi màn so với screenshot ở 1440×900 trước khi báo xong. Các chỗ dựa vào Open question để `// TODO(open-question #N)`.
5. **Không publish** `docs/` và `designs/*.dc.html`. Bản preview vẫn chạy qua `scripts/build-site.sh`, sau Entra.

**Việc phụ đề xuất:** ghi lại text trích từ hai "PDF" (thật ra là zip) vào `docs/er-model.md` và `docs/ui-guidelines.md` để các session sau đọc được.

---

## 6. Tiến độ

### Pha 2: Nền tảng (xong 2026-09-25)

**`packages/graphite`: port Graphite sang TypeScript.**
- Có 50 component. Tên, props (`types/index.d.ts` chép từ `dist/components/index.d.ts`, chỉ bỏ khối `window.Graphite` global), token và CSS giữ đúng như `design-system/graphite/dist`.
- Mỗi component là một module trong `src/components`. Các module này được `scripts/port-bundle.mjs` sinh ra từ bundle tham chiếu, giữ logic 1:1, nên DOM và class khớp với `components.css`.
- Kiểm tra:
  - `check-api` xác nhận API, CSS và token giống hệt `dist`.
  - `verify-render` render 52/52 demo chính thức bằng cả bundle gốc lẫn bản port: HTML ra giống nhau từng ký tự.

**`apps/prototype`: Next.js 16 (App Router, TS strict).**
- `/_components` hiển thị toàn bộ component và page template ở 3 theme.
- Shell hai portal có nav hợp nhất theo role (§2.2).
- Home tối giản gắn nhãn "Chưa có design". Các route chưa dựng thì hiện placeholder "Pha 3".

**`src/mock`: dữ liệu và API giả.**
- Type theo ER.
- Seed có 5 tenant trên 2 affiliate, cùng 17 user trải đủ 7 role.
- Có quy tắc truy cập (tenant / affiliate / scope / assignment) và 15 unit test.
- Store lưu vào localStorage và reset được. API là async.

**Nút Demo.** Chuyển persona và portal, hoặc reset dữ liệu mock.

**Playwright.** 3 smoke test đều pass.

### Cập nhật 2026-09-25: designer trả lời Q1–Q26

- Câu trả lời được ghi trong [design-questions.md](design-questions.md), kèm việc prototype làm cho từng câu.
- Đã áp dụng vào code:
  - Q17: bỏ "Workspace access" khỏi sidebar.
  - Q18: TopBar customer chỉ còn "Request Applications".
  - Q24: Audit Logs chỉ Customer Admin thấy.
- Các câu còn lại áp dụng khi dựng màn tương ứng ở Pha 3.
- Q25 và Q26 chờ Graphite phát hành bản mới. Cho tới lúc đó, port vẫn giống hệt `dist`.

### Cập nhật 2026-09-25: Graphite 1790347709-dd39 (TopBar hooks)

- **Đồng bộ DS.** Snapshot mới ([CHANGELOG-graphite.md](CHANGELOG-graphite.md)) được chép vào `design-system/graphite`, gồm cả `dist/components`. Thay đổi so với bản cũ:
  - `bundle.js`: 2 dòng trong `TopBar`.
  - `index.d.ts`: thêm 7 prop cho `TopBarProps`.
  - `TopBar/README.md`, `design-system.json`.
  - 7 file SVG trong `assets/Status-icons`.
  - `bundle.css` và tokens không đổi.
- **Port.** `pnpm graphite:port` sinh lại package. Chỉ `TopBar.ts` và `types/index.d.ts` thay đổi.
- **Kiểm tra.**
  - check-api: 50 component; styles và types giống hệt `dist`.
  - Render check: 52/52 demo giống hệt.
  - **Interaction check (mới, `scripts/verify-interaction.mjs`):** 5 scenario TopBar chạy trên happy-dom, với cả bundle gốc lẫn bản port. Sau mỗi bước click, DOM và callback phải giống nhau. Mỗi scenario còn tự assert hành vi đúng theo changelog. Chạy thử với TopBar cũ thì 4/5 fail, nên bước này bắt được lỗi thật.
- **App.**
  - `PortalShell` dùng `onSignOut`, `accountLinks`, `onNotificationOpen`, `onMarkAllRead`.
  - Thêm `/login`: trang tạm cho tới khi designs/01 được dựng ở Pha 3.
  - Portal tự chuyển về `/login` khi chưa đăng nhập.
  - Bỏ kế hoạch bắt click tạm cho Q25/Q26.
  - Playwright: 5/5 pass, trong đó có 2 test mới: Sign out, và trạng thái đã đọc của thông báo được lưu.


### Pha 3: dựng module (xong)

**Cách so với design.**
- `pnpm --filter @sgs/prototype visual` render mỗi board ở đúng kích thước trong `canvas.json`, rồi đưa trang về trạng thái của design bằng thao tác thật (gõ, bấm, mở modal).
- Sau đó chụp màn hình và so với `designs/<module>/screenshots/<board>.png` bằng pixelmatch.
- Khi chụp, Google Fonts bị chặn, vì ảnh design được render bằng font fallback. Chuột được đưa ra ngoài và bỏ focus.
- Ảnh ghép (design | prototype | diff) nằm ở `apps/prototype/visual-results/`.
- Bảng dưới đây do `scripts/visual-report.mjs` sinh ra.
- "Pixel khác" gồm cả phần chênh do font fallback của máy chạy: nét chữ lệch khoảng 1px, vào khoảng 0,3–0,8% ở màn đăng nhập. Mỗi board đều được xem lại bằng mắt trên ảnh ghép.

| Module | Trạng thái | Ghi chú |
|---|---|---|
| 01 Authentication | Xong | 16/16 board. `/login`, `/ops/login`, `/activate`, `/ops/activate`, hộp thư demo `/mail`. Khoá sau 5 lần sai (15 phút). Hết phiên sau 30 phút không hoạt động, có snackbar lấy từ 02. SGS activate xong thì vào thẳng `/ops`, vì không có design màn thành công. |
| 03 User management | Xong | 17/19 board. Không dựng CaChangeRole (design vẽ lỗi, không có modal) và SgsInviteCustomer (trùng TenantCreateAdmin, không có lối vào). Customer: `/admin/users`, `/admin/users/[id]`. SGS: `/ops/admin/users`, `/ops/customers`, `/ops/customers/[id]`, `/ops/customers/[id]/scopes`. Mời thì sinh email trong hộp thư demo, thu hồi thì dòng biến mất. Đổi scope được ghi vào lịch sử. Tạo customer rồi tạo admin thì status là "Admin invited"; admin kích hoạt thì "Active". Sidebar có badge số request chờ xử lý. Sai khác đã biết: TopBar trong design bị co (Q28). |
| 04 Framework management | Xong | 7/7 board. `/ops/frameworks`, `/ops/frameworks/[id]` (draft = preview + Activate/Discard; active = overview), `/requirements`, `/versions`. "Other versions" chưa có bản export (Q20), nên dựng bảng version từ cột có sẵn trong FwPreview và gắn nhãn "Chưa có design". Catalogue requirement: Appendix 10 đủ 7 khía cạnh, 27 biện pháp, 76 và 79 requirement, tên lấy từ design khi có. ISO/IEC 27001:2022 dùng tên control thật. Các framework khác là dữ liệu mẫu theo chương (`src/mock/catalog`). Import được mock theo tên file: tên có "bcm" thì ra 3 lỗi của FwErrors; `.xlsx` khác thì tạo draft Appendix 10 bản sửa đổi. Copy về tier theo Q11. |
| 05 Scope, workspace, evidence | Xong | 15/15 board. Route: `/scopes`, `/scopes/[id]`, `/workspaces`, `/workspaces/[id]?req=…&evidence=…`, `/documents?workspace=…`. Coverage tính từ evidence: Provided khi mọi expected evidence bắt buộc có file còn hạn và đã quét virus, Partial khi file hết hạn hoặc đang quét, Missing khi chưa có file. Seed khớp design (38/61 = 62%, 74/116 = 64%), có unit test. Quét virus được mock bất đồng bộ (2 giây). Unlink thì file vẫn nằm trong thư viện (tab Not linked). Upload new version làm version tăng 1, và evidence đã được SGS accept sẽ quay lại chờ review. Change tier nằm trên dòng framework (Q19), bị khoá khi đang audit. Owner cho từng requirement (D6) gắn nhãn "Chưa có design". Hai kịch bản seed: **Audit in progress** (mặc định, theo 08) và **Before the audit** (theo 05), chọn khi reset ở nút Demo. Seed chỉ còn 4 scope như 05 (bỏ Plant · Taichung). |
| 06 Gap Analysis (bộ Mvp) | Xong | 17/17 board. Customer: `/service-requests/gap-analysis`, `/new` (wizard 2 bước, tự lưu draft), `/[id]`. SGS Admin/User (D8): `/ops/requests/gap-analysis`, `/[id]`. Consultant (D9): `/ops/my-assignments/gap-analysis`, `/[id]`, `/[id]/workspace`. Approve kiểm tra quy tắc một consultant active cho mỗi customer (UC-ACC-006). Upload report thì request hoàn tất và consultant hết quyền truy cập workspace (Q15). Có thêm Withdraw (D4) và Request/Respond information (D3), cả hai gắn nhãn "Chưa có design". Copy "You'll get an email" đổi thành thông báo trong portal (Q12). Khối "Customer self-assessment" ở workspace của consultant không dựng, vì UC-ASM là Phase 2. |
| 07 Implementation Support | Xong | 18/18 board. Dùng chung module với 06 (`src/features/consulting`). Share deliverable thì customer thấy ngay. Complete có closing summary. Period thay cho On site. |
| 08 Certification & audit review | Xong | 29/29 board. Customer: `/service-requests/certification/[id]`, `/reviews`, `/reviews/[id]`, `/certifications`, cùng workspace ở chế độ locked và after-review ngay trên `/workspaces/[id]`. SGS: `/ops/requests/certification` (4 tab), `/ops/certifications`. Auditor: `/ops/audits`, `/[id]` (Start review), `/[id]/review?item=`, `/[id]/findings`. Có đủ: clarification (answer + files; file thêm vào workspace kể cả khi đang khoá), finding (observation/OFI đóng ngay; major/minor cần corrective action), đánh giá accept/not accepted, đổi hạn kèm lý do cho customer, ghi chú nội bộ (session customer không bao giờ nhận), đóng review khi mọi item đã có kết luận, tạo chứng chỉ. Kịch bản seed thêm: Ready to close, Audit closed, Certificate issued (D13). Nhãn theo Q13; "Closed with finding" màu xanh (Q14). Mốc thời gian audit dời về tháng 9/2026. Không màn nào vẽ modal "Change auditor", nên không dựng. |
| 09 Certification (catalogue) | Xong | 7 board gộp vào luồng 08 theo D2: `/service-requests/certification` (tab Services 13 và My requests), modal request từ catalogue (Scope, Type), chi tiết request và các màn SGS dùng chung với 08. |
| 09 Training | Xong | 5 board. Customer `/service-requests/training` gồm tab Services (33 khoá SGS Academy, phân trang 10) và My requests. Modal "Request a training course" kiểm tra đủ trường bắt buộc. Chi tiết request ở `/[id]` (trạng thái Submitted, Assigned, Rejected, Withdrawn; Withdraw và Request again). SGS `/ops/requests/training` có 3 tab: To assign, Assigned, Rejected. Thao tác gồm Assign (SGS Academy coordinator xếp trước) và Reject (modal chung). Chi tiết phía SGS chưa có design, đánh dấu "Chưa có design". Placeholder của modal Assign viết cho training, không nói về audit (Q16). Seed hai phía chưa khớp nhau, ghi ở Q29. |
| 10 Audit trail | Xong | 5 board. SGS Admin dùng `/ops/audit-logs` (UC-AUD-002). Customer Admin dùng `/audit-logs` (UC-AUD-004): không có cột và bộ lọc Customer, không thấy ghi chú nội bộ của review. Có bộ lọc Search, Action, Customer, From và To; Clear filters; drawer chi tiết gồm facts và bảng Change; "Show related events" lọc theo context; pageSize 10 (Q23). Mọi thao tác thật đều ghi AUDIT_EVENT. Consultant mở workspace, xem requirement hoặc tải evidence cũng được ghi, gắn tag "Consultant activity". Export CSV chỉ báo bằng snackbar vì không có UC. Menu Audit Logs phía SGS chỉ hiện cho SGS Admin. Seed dời ngày và đổi đối tượng cho khớp các module khác (Q30). |
| 11 Comment thread | Xong (theo D7) | Không dựng board nào, vì 11 không dùng Graphite và board Customer trái UC-CNS-002 (Q22, D7). Chỉ lấy quy tắc: internal note có gạch chéo và khoá, chỉ SGS thấy; thread chỉ đọc khi request đã đóng ("sealed"); customer trả lời SGS chỉ qua information request (D3). `InternalNotes` (CommentThread) có trên trang chi tiết SGS của Certification và Training, là các trang chưa có design. Review 08 vẫn giữ thread "Internal notes" riêng. Mỗi ghi chú ghi một AUDIT_EVENT với category `internal`, customer không bao giờ tải được. Chưa gắn vào trang chi tiết 06/07 vì design của hai module này không có thread. Tin nhắn shared chờ client (TODO(decision D7)). CommentThread không nhận `messages` sau khi mount (Q31). |
| Màn bù | Xong | All requests (UC-SRQ-002) ở `/service-requests` và `/ops/requests`: một danh sách cho mọi loại dịch vụ; phía SGS có cột Customer. Placeholder "Chưa có design" có nêu UC: Settings của customer, `/ops/settings` (UC-CFG-001), `/training` (SGS Academy, UC-TRN-001/002/004/006/008), `/ops/assignments` (UC-ACC-006). Notification inbox là NotificationCenter trên chuông, không có trang riêng. Home, Log out, Withdraw và Request/Respond information đã có từ các module trước. |
| 12 Dashboard | Xong (chưa so ảnh) | Home theo 6 board. Customer Admin (Main), Customer User (CustomerUserHome), Customer Admin chưa có scope (CustomerHomeEmpty: "Get started" mở thẳng modal Create scope / Invite users bằng `?new=1` / `?invite=1`), SGS Admin và SGS User (SgsAdminHome), Consultant (ConsultantHome), Auditor (AuditorHome). Số liệu tính từ mock (`mock/api/dashboard.ts`): tile, "Needs your attention" / "Next up" (mỗi dòng dẫn tới đúng chỗ xử lý, ví dụ `?action=report`, `/review?item=`), suggested next step, coverage theo nhóm control, stepper Preparing → Requested → In audit → Certified, workload, onboarding, triage. Board không có screenshot nên chưa có trong bảng visual (Q32). |

<!-- visual:start -->
Chạy lần cuối: 2026-09-26 12:06 UTC · 136 board. Ảnh so sánh (design | prototype | diff) nằm ở `apps/prototype/visual-results/<module>/<board>.side.png`.

| Module | Board | Route | Pixel khác | Ghi chú |
|---|---|---|---|---|
| 01-authentication | Activate | `/activate?token=inv-kevin` | 0.7% | Seed: Kevin Ho instead of Wei Chen. |
| 01-authentication | ActivateExpired | `/activate?token=inv-jason` | 0.58% |  |
| 01-authentication | ActivateMismatch | `/activate?token=inv-kevin` | 0.74% | Seed: Kevin Ho instead of Wei Chen. |
| 01-authentication | ActivatePassword | `/activate?token=inv-kevin` | 0.7% | Seed: Kevin Ho instead of Wei Chen. |
| 01-authentication | ActivateSuccess | `/activate?token=inv-kevin` | 0.48% | Seed: Kevin Ho has 1 scope (design: 2 scopes). |
| 01-authentication | ActivateUsed | `/activate?token=inv-wei` | 0.48% | Seed: Wei Chen activated 21 Sep 2026 (design: 25 Sep). |
| 01-authentication | CustomerLoginInactive | `/login` | 0.58% | Seed: deactivated account is Amy Chou (design shows Linh Tran’s email). |
| 01-authentication | CustomerLoginLocked | `/login` | 0.47% |  |
| 01-authentication | CustomerLoginWrongPassword | `/login` | 0.38% |  |
| 01-authentication | InviteEmail | `/mail/em-kevin` | 2.4% | Seed: invitation for Kevin Ho (design: Wei Chen, who is already active in the seed). |
| 01-authentication | Main | `/login` | 0.34% |  |
| 01-authentication | SgsActivate | `/ops/activate?token=inv-tom` | 0.76% | Seed: Tom Hsu (mock only) instead of Anna Lee, who is active. |
| 01-authentication | SgsLogin | `/ops/login` | 0.37% |  |
| 01-authentication | SgsLoginInactive | `/ops/login` | 0.56% | Seed: deactivated SGS account is Peter Wang (mock only; design shows Minh Nguyen’s email). |
| 01-authentication | SgsLoginLocked | `/ops/login` | 0.5% |  |
| 01-authentication | SgsLoginWrongPassword | `/ops/login` | 0.41% |  |
| 03-user-management | CaAssignScopes | `/admin/users` | 1.6% | Sidebar/TopBar follow Q17/Q18 (no Workspace access, no Communications). |
| 03-user-management | CaInvite | `/admin/users` | 1.51% | Sidebar/TopBar follow Q17/Q18 (no Workspace access, no Communications). |
| 03-user-management | CaRevoke | `/admin/users` | 1.38% | Sidebar/TopBar follow Q17/Q18 (no Workspace access, no Communications). |
| 03-user-management | CaUserDetail | `/admin/users/u-wei` | 2.42% | Sidebar/TopBar follow Q17/Q18 (no Workspace access, no Communications). Seed: Wei Chen’s second scope is Customer data platform (design: Plant · Taichung). |
| 03-user-management | CaUserPending | `/admin/users/u-kevin` | 2.79% | Sidebar/TopBar follow Q17/Q18 (no Workspace access, no Communications). |
| 03-user-management | CaUsersEmpty | `/admin/users` | 1.18% | Sidebar/TopBar follow Q17/Q18 (no Workspace access, no Communications). Formosa Chips (only its admin) instead of ABC Trading. |
| 03-user-management | Main | `/admin/users` | 1.8% | Sidebar/TopBar follow Q17/Q18 (no Workspace access, no Communications). Seed adds Iris Huang (Viewer, mock only). |
| 03-user-management | SgsInviteSgs | `/ops/admin/users` | 2.83% |  |
| 03-user-management | SgsUserDetail | `/ops/admin/users/u-anna` | 2.41% | Seed: Anna Lee’s assignments are ABC requests (one consultant per customer). |
| 03-user-management | SgsUsers | `/ops/admin/users` | 3.67% | Seed has more SGS users; Wei Lin is active (see seed). |
| 03-user-management | TenantCreate | `/ops/customers` | 2.1% |  |
| 03-user-management | TenantCreateAdmin | `/ops/customers/t-riyadh` | 4.48% |  |
| 03-user-management | TenantDetail | `/ops/customers/t-abc` | 4.34% |  |
| 03-user-management | TenantEdit | `/ops/customers/t-abc` | 3.8% |  |
| 03-user-management | TenantList | `/ops/customers` | 2.4% |  |
| 03-user-management | TenantNew | `/ops/customers/t-riyadh` | 5.46% | Copy: the customer sets the tier (Q11). |
| 03-user-management | TenantScopes | `/ops/customers/t-abc/scopes` | 1.77% |  |
| 04-framework-management | FwActivate | `/ops/frameworks/fw-a10-amended` | 5.17% | Copy: the customer chooses the tier (Q11). |
| 04-framework-management | FwDetail | `/ops/frameworks/fw-a10-2022` | 3.25% | Tiers table: 44 / 17 / 15 = 76 (design: 18 / 79 with 76 requirements). |
| 04-framework-management | FwErrors | `/ops/frameworks` | 2.69% | Sidebar: unified SGS nav adds Certifications (plan §2.2). |
| 04-framework-management | FwImport | `/ops/frameworks` | 3.4% | Sidebar: unified SGS nav adds Certifications (plan §2.2). |
| 04-framework-management | FwPreview | `/ops/frameworks/fw-a10-amended` | 6.07% | Sidebar: unified SGS nav adds Certifications (plan §2.2). Copy: the customer chooses the tier (Q11). |
| 04-framework-management | FwRequirements | `/ops/frameworks/fw-a10-2022/requirements` | 6.85% |  |
| 04-framework-management | Main | `/ops/frameworks` | 3.51% | Sidebar: unified SGS nav adds Certifications (plan §2.2). Seed also lists ISO/IEC 27701 and ISO 22301 (linked to scopes in 03/05). |
| 05-scope-workspace-evidence | AssignUsers | `/scopes/s-hq` | 8.46% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). |
| 05-scope-workspace-evidence | ChangeTier | `/scopes/s-cdp` | 2.61% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). |
| 05-scope-workspace-evidence | ChangeTierLocked | `/scopes/s-cdp` | 2.77% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). |
| 05-scope-workspace-evidence | Documents | `/documents` | 3.51% | Seed has more (generated) evidence per workspace. |
| 05-scope-workspace-evidence | EvidenceDetail | `/workspaces/ws-a10-cdp?req=R.1.1.1&evidence=ev-1` | 4.38% |  |
| 05-scope-workspace-evidence | EvidenceLibrary | `/documents?workspace=ws-a10-cdp` | 2.69% | Seed has more (generated) evidence per workspace. |
| 05-scope-workspace-evidence | LinkEvidence | `/workspaces/ws-a10-cdp?req=R.1.1.3` | 9.84% | Opened on R.1.1.3 so the files are not linked yet. |
| 05-scope-workspace-evidence | LinkFramework | `/scopes/s-ai` | 2.41% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Background is AI platform (Customer data platform already has Appendix 10). |
| 05-scope-workspace-evidence | Main | `/scopes` | 2.34% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). |
| 05-scope-workspace-evidence | ScopeCreate | `/scopes` | 7.54% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Widths 552/268 (Q4). |
| 05-scope-workspace-evidence | ScopeDetail | `/scopes/s-hq` | 3.27% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Q19: Change tier column only for tiered frameworks. |
| 05-scope-workspace-evidence | ScopesEmpty | `/scopes` | 2.03% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Saigon Foods (mock) instead of ABC Trading. |
| 05-scope-workspace-evidence | UploadEvidence | `/workspaces/ws-a10-cdp?req=R.1.1.3` | 5.75% | Dates left empty. |
| 05-scope-workspace-evidence | Workspace | `/workspaces/ws-a10-cdp?req=R.1.1.1` | 6.01% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Owner select (D6, no design). |
| 05-scope-workspace-evidence | Workspaces | `/workspaces` | 1.78% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). |
| 06-gap-analysis | MvpAdminApprove | `/ops/requests/gap-analysis/GA-2026-005` | 1.47% | Sidebar: unified SGS nav adds Certifications (plan §2.2). |
| 06-gap-analysis | MvpAdminQueue | `/ops/requests/gap-analysis` | 1.39% | Sidebar: unified SGS nav adds Certifications (plan §2.2). Seed dates are moved before 25 Sep 2026; one active consultant per customer (Anna Lee). |
| 06-gap-analysis | MvpAdminReject | `/ops/requests/gap-analysis/GA-2026-005` | 1.06% | Sidebar: unified SGS nav adds Certifications (plan §2.2). |
| 06-gap-analysis | MvpAdminReview | `/ops/requests/gap-analysis/GA-2026-005` | 1.73% | Sidebar: unified SGS nav adds Certifications (plan §2.2). Adds "Request information" (D3). |
| 06-gap-analysis | MvpConsAssignments | `/ops/my-assignments/gap-analysis` | 1.04% | Consultant nav. Seed dates are moved before 25 Sep 2026; one active consultant per customer (Anna Lee). |
| 06-gap-analysis | MvpConsDetail | `/ops/my-assignments/gap-analysis/GA-2026-006` | 4.32% | Adds "Request information" (D3). |
| 06-gap-analysis | MvpConsUpload | `/ops/my-assignments/gap-analysis/GA-2026-006` | 5.15% |  |
| 06-gap-analysis | MvpConsWorkspace | `/ops/my-assignments/gap-analysis/GA-2026-006/workspace` | 6.69% | No customer self-assessment block (UC-ASM, Phase 2). Sample requirement list. |
| 06-gap-analysis | MvpConsWorkspaceEnded | `/ops/my-assignments/gap-analysis/GA-2026-002/workspace` | 1.03% | Access ends when the request is completed (Q15). |
| 06-gap-analysis | MvpDetailCompleted | `/service-requests/gap-analysis/GA-2026-002` | 3.72% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Seed dates are moved before 25 Sep 2026; one active consultant per customer (Anna Lee). |
| 06-gap-analysis | MvpDetailProgress | `/service-requests/gap-analysis/GA-2026-004` | 3.08% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Seed dates are moved before 25 Sep 2026; one active consultant per customer (Anna Lee). |
| 06-gap-analysis | MvpDetailRejected | `/service-requests/gap-analysis/GA-2026-001` | 1.88% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Scope is Head office (Plant · Taichung removed). |
| 06-gap-analysis | MvpDetailSubmitted | `/service-requests/gap-analysis/GA-2026-005` | 2.8% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Copy: notified in the portal (Q12). |
| 06-gap-analysis | MvpList | `/service-requests/gap-analysis` | 3.11% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Seed dates are moved before 25 Sep 2026; one active consultant per customer (Anna Lee). |
| 06-gap-analysis | MvpListEmpty | `/service-requests/gap-analysis` | 1.2% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Saigon Foods (mock, no requests). |
| 06-gap-analysis | MvpWizard1 | `/service-requests/gap-analysis/new` | 1.42% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). |
| 06-gap-analysis | MvpWizard2 | `/service-requests/gap-analysis/new` | 1.31% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). |
| 07-implementation-support | IsAdminApprove | `/ops/requests/implementation-support/IS-2026-004` | 1.52% | Sidebar: unified SGS nav adds Certifications (plan §2.2). |
| 07-implementation-support | IsAdminQueue | `/ops/requests/implementation-support` | 1.51% | Sidebar: unified SGS nav adds Certifications (plan §2.2). Seed dates are moved before 25 Sep 2026; one active consultant per customer (Anna Lee). |
| 07-implementation-support | IsAdminReject | `/ops/requests/implementation-support/IS-2026-004` | 1.13% | Sidebar: unified SGS nav adds Certifications (plan §2.2). |
| 07-implementation-support | IsAdminReview | `/ops/requests/implementation-support/IS-2026-004` | 2.21% | Sidebar: unified SGS nav adds Certifications (plan §2.2). Adds "Request information" (D3). |
| 07-implementation-support | IsConsAssignments | `/ops/my-assignments/implementation-support` | 0.98% | Consultant nav. Seed dates are moved before 25 Sep 2026; one active consultant per customer (Anna Lee). |
| 07-implementation-support | IsConsComplete | `/ops/my-assignments/implementation-support/IS-2026-003` | 5.57% |  |
| 07-implementation-support | IsConsDeliverable | `/ops/my-assignments/implementation-support/IS-2026-003` | 5.33% |  |
| 07-implementation-support | IsConsDetail | `/ops/my-assignments/implementation-support/IS-2026-003` | 6.55% | Adds "Request information" (D3). |
| 07-implementation-support | IsConsWorkspace | `/ops/my-assignments/implementation-support/IS-2026-003/workspace` | 6.85% | No customer self-assessment block (UC-ASM, Phase 2). Sample requirement list. |
| 07-implementation-support | IsConsWorkspaceEnded | `/ops/my-assignments/implementation-support/IS-2026-001/workspace` | 1.34% | Access ends when the request is completed (Q15). |
| 07-implementation-support | IsDetailCompleted | `/service-requests/implementation-support/IS-2026-001` | 3.88% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Seed dates are moved before 25 Sep 2026; one active consultant per customer (Anna Lee). |
| 07-implementation-support | IsDetailProgress | `/service-requests/implementation-support/IS-2026-003` | 3.88% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Seed dates are moved before 25 Sep 2026; one active consultant per customer (Anna Lee). |
| 07-implementation-support | IsDetailRejected | `/service-requests/implementation-support/IS-2025-009` | 1.81% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Scope is Head office (Plant · Taichung removed). |
| 07-implementation-support | IsDetailSubmitted | `/service-requests/implementation-support/IS-2026-004` | 3.23% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Copy: notified in the portal (Q12). |
| 07-implementation-support | IsListEmpty | `/service-requests/implementation-support` | 1.76% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Saigon Foods (mock, no requests). |
| 07-implementation-support | IsWizard1 | `/service-requests/implementation-support/new` | 1.06% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). |
| 07-implementation-support | IsWizard2 | `/service-requests/implementation-support/new` | 3.06% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). |
| 07-implementation-support | Main | `/service-requests/implementation-support` | 3.02% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Seed dates are moved before 25 Sep 2026; one active consultant per customer (Anna Lee). |
| 08-certification-audit-review | AudChangeDueDate | `/ops/audits/CR-2026-015/review?item=R.4.1.2` | 2.93% |  |
| 08-certification-audit-review | AudClarification | `/ops/audits/CR-2026-015/review?item=R.1.1.4` | 5.61% |  |
| 08-certification-audit-review | AudCloseReview | `/ops/audits/CR-2026-015/review` | 7.81% |  |
| 08-certification-audit-review | AudEvaluate | `/login` | 6.36% | Reached by real actions. |
| 08-certification-audit-review | AudEvaluateClarification | `/ops/audits/CR-2026-015/review?item=R.5.3.4` | 6.87% | Answer of R.5.3.4 (design: R.1.1.4). Textarea 552 (Q5). |
| 08-certification-audit-review | AudFindings | `/ops/audits/CR-2026-015/findings` | 0.8% |  |
| 08-certification-audit-review | AudMyAudits | `/ops/audits` | 0.77% | Auditor nav. |
| 08-certification-audit-review | AudRaiseFinding | `/ops/audits/CR-2026-015/review?item=R.3.2.2` | 6.49% | Opened on R.3.2.2 (R.4.1.2 already has F-004). |
| 08-certification-audit-review | AudRequest | `/ops/audits/CR-2026-017` | 1.47% |  |
| 08-certification-audit-review | AudReview | `/login` | 9.62% | Reached by real actions: the customer submits the corrective action first. |
| 08-certification-audit-review | AudStartReview | `/ops/audits/CR-2026-017` | 1.28% |  |
| 08-certification-audit-review | Certifications | `/certifications` | 1.85% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Certificate dates moved to Sep 2026. |
| 08-certification-audit-review | CorrectiveNotAccepted | `/login` | 7.64% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Reached by real actions: customer submits, auditor does not accept. |
| 08-certification-audit-review | Main | `/workspaces/ws-42001-ai` | 2.67% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). ISO/IEC 42001 · AI platform (Customer data platform already has CR-2026-015). Header also keeps "Evidence library". |
| 08-certification-audit-review | ReqAssigned | `/service-requests/certification/CR-2026-015` | 2.72% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Audit dates moved to Sep 2026 (demo date 25 Sep 2026). |
| 08-certification-audit-review | ReqCertIssued | `/service-requests/certification/CR-2026-015` | 3.02% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Audit dates moved to Sep 2026 (demo date 25 Sep 2026). |
| 08-certification-audit-review | ReqCompleted | `/service-requests/certification/CR-2026-015` | 3.05% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Audit dates moved to Sep 2026 (demo date 25 Sep 2026). |
| 08-certification-audit-review | ReqInProgress | `/service-requests/certification/CR-2026-015` | 3.51% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Audit dates moved to Sep 2026 (demo date 25 Sep 2026). |
| 08-certification-audit-review | RespondClarification | `/reviews/rv-cr015` | 3.28% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). |
| 08-certification-audit-review | ReviewFeedback | `/reviews/rv-cr015` | 4.73% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). The seed has R.1.1.4 overdue, so the overdue banner shows (= ReviewOverdue). |
| 08-certification-audit-review | ReviewOverdue | `/reviews/rv-cr015` | 3.91% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). |
| 08-certification-audit-review | Reviews | `/reviews` | 0.89% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). |
| 08-certification-audit-review | SgsAssignAuditor | `/ops/requests/certification` | 1.06% | Sidebar: unified SGS nav adds Certifications (plan §2.2). |
| 08-certification-audit-review | SgsCertRequests | `/ops/requests/certification` | 1.22% | Sidebar: unified SGS nav adds Certifications (plan §2.2). Seed requests differ (one auditor, ABC recertification). |
| 08-certification-audit-review | SgsCertifications | `/ops/certifications` | 1.33% | Sidebar: unified SGS nav adds Certifications (plan §2.2). |
| 08-certification-audit-review | SgsCreateCert | `/ops/requests/certification?tab=cert` | 3.95% | Sidebar: unified SGS nav adds Certifications (plan §2.2). Dates left empty. |
| 08-certification-audit-review | SubmitCorrectiveAction | `/workspaces/ws-a10-cdp?req=R.3.1.3` | 3.93% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). |
| 08-certification-audit-review | WorkspaceAfterReview | `/workspaces/ws-a10-cdp?req=R.3.1.3` | 6.74% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Audit dates moved to Sep 2026 (demo date 25 Sep 2026). |
| 08-certification-audit-review | WorkspaceLocked | `/workspaces/ws-a10-cdp?req=R.3.1.3` | 5.81% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Audit dates moved to Sep 2026 (demo date 25 Sep 2026). |
| 09-certification-training | AdminReject | `/ops/requests/certification` | 2.74% | Sidebar: unified SGS nav adds Certifications (plan §2.2). One reason list for all categories. |
| 09-certification-training | CertAdminAssign | `/ops/requests/certification` | 6.4% | Sidebar: unified SGS nav adds Certifications (plan §2.2). 08 SgsAssignAuditor (D2). |
| 09-certification-training | CertAdminQueue | `/ops/requests/certification` | 1.65% | Sidebar: unified SGS nav adds Certifications (plan §2.2). Merged with 08 tabs (D2). |
| 09-certification-training | CertDetail | `/service-requests/certification/CR-2026-018` | 2% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Seed: CR-2026-018 recertification ISO 22301 (CR-2026-012 is audit completed, D2). |
| 09-certification-training | CertDetailAssigned | `/service-requests/certification/CR-2026-017` | 1.88% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Formosa CR-2026-017 (08 flow, D2). |
| 09-certification-training | CertRequest | `/service-requests/certification` | 2.75% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). |
| 09-certification-training | Main | `/service-requests/certification` | 4.26% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Copy: "SGS auditor" (08) instead of "SGS contact". |
| 09-certification-training | TrainAdminAssign | `/ops/requests/training` | 1.13% | Sidebar: unified SGS nav adds Certifications (plan §2.2). Placeholder copy about training, not an audit (Q16). |
| 09-certification-training | TrainAdminQueue | `/ops/requests/training` | 1.52% | Sidebar: unified SGS nav adds Certifications (plan §2.2). Rejected tab shows TR-2026-009 (rejected in TrainList, 0 in this board, Q29). |
| 09-certification-training | TrainDetail | `/service-requests/training/TR-2026-021` | 1.34% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). |
| 09-certification-training | TrainList | `/service-requests/training` | 3.8% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). |
| 09-certification-training | TrainRequest | `/service-requests/training` | 2.7% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Fields start empty (design shows sample values filled in). |
| 10-audit-trail | CaActivity | `/audit-logs` | 4.48% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). Q30. |
| 10-audit-trail | CaActivityDetail | `/audit-logs` | 3.19% | Unified customer nav (Reviews, Certifications; plan §2.2, Q17). |
| 10-audit-trail | Main | `/ops/audit-logs` | 5.87% | Sidebar: unified SGS nav adds Certifications (plan §2.2). Seed timeline: design events 26–30 Sep moved before 25 Sep; some objects differ (Q30). |
| 10-audit-trail | SgsAuditConsultant | `/ops/audit-logs` | 2.04% | Sidebar: unified SGS nav adds Certifications (plan §2.2). Q30. |
| 10-audit-trail | SgsAuditDetail | `/ops/audit-logs` | 3.88% | Sidebar: unified SGS nav adds Certifications (plan §2.2). |
<!-- visual:end -->
