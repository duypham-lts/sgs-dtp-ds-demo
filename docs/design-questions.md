# Design questions (cần hỏi designer)

Đây là danh sách các chỗ design lệch guideline (CLAUDE.md, EP UI Guidelines) hoặc lệch nhau giữa các module. Theo [decisions.md](decisions.md), khi chưa có câu trả lời thì **prototype làm đúng như design**. Nếu một điểm đã có trong `design-system/graphite/Open-questions.md`, bảng dẫn số câu tương ứng.

Designer đã trả lời Q1–Q26 ngày 2026-09-25. Mỗi câu có hai cột:
- **Kết luận:** câu trả lời của designer.
- **Prototype làm gì:** việc prototype thực hiện theo câu trả lời đó.

Trạng thái:
- **Đóng:** đã chốt. Prototype áp dụng ngay, hoặc ở màn tương ứng khi dựng ở Pha 3.
- **Chờ design:** designer sẽ sửa file. Prototype làm theo kết luận luôn, không chờ bản export mới.
- **Chờ DS:** chờ Graphite bổ sung API.
- **Hỏi client:** chưa chốt. Prototype làm như design và để `TODO`.

Tổng hợp theo loại kết luận:
- Sửa design (14): Q4 (một phần), Q5 (một phần), Q6, Q11–Q19, Q23, Q24.
- Bổ sung DS (2): Q25, Q26. Đã có trong Graphite 1790347709-dd39.
- Hỏi client (2): Q7, Q10.
- Giữ nguyên (8): Q1, Q2, Q3, Q8, Q9, Q20, Q21, Q22.

## Layout

| # | Chỗ lệch | Module / màn | Kết luận | Prototype làm gì | Trạng thái |
|---|---|---|---|---|---|
| Q1 | Wizard tạo SR chỉ có 2 cột (bước + nội dung), không có cột phải | 06 MvpWizard1/2, 07 IsWizard1/2 | Giữ. Quy tắc 3 cột dành cho màn làm việc trên SR, khi đã có cột Communications. Wizard chạy trước khi gửi nên chưa có trao đổi gì với SGS | Wizard dùng 2 cột như design. Bỏ đề xuất thêm cột phải ở plan §4 | Đóng |
| Q2 | Cột phải của các trang detail cũng `overflow:auto` | 03, 06, 07, 08, 09 detail | Giữ. Guideline §12 cho phép cột thứ ba có vùng cuộn riêng. Header và vị trí cột vẫn cố định | Cột giữa và cột phải cuộn độc lập. Header và cột trái cố định | Đóng |
| Q3 | Chỉ có board 1440×900, không có breakpoint 1280 / 1178 / 768 / 412 / 320 | Mọi module (trừ 02/SignInMobile) | Giữ hướng của prototype. Designer có thể bổ sung bản tablet cho màn phức tạp nếu cần | Pha 4 làm theo phần Breakpoints của guideline. Chỗ nào chưa rõ thì để `TODO(design-questions Q3)` | Đóng |

## Field width

| # | Chỗ lệch | Module / màn | Kết luận | Prototype làm gì | Trạng thái |
|---|---|---|---|---|---|
| Q4 | Dùng px tự đặt: 552px (modal), 268px (DatePicker), 312px, 640px, 588px, 720px (dải tóm tắt wizard) | 05, 06, 07, 08 | 552, 268 và 588 đúng là token: L text 520 + 32, S dropdown 200 + 68, L dropdown 520 + 68. 312 và 640 (modal Create scope) lệch token, designer đổi về 552 và 268. 720 là dải tóm tắt, không phải input | Giữ 552 / 268 / 588 / 720. Modal Create scope dùng 552 và 268 | Chờ design (một phần) |
| Q5 | Dùng `width="100%"` | 01 login, 05 LinkEvidence SearchInput, 08 AudEvaluateClarification Textarea | Giữ login (field lấp cột form, khoảng 376px, nằm trong 360–512 của Account Creation). Giữ SearchInput (thanh tìm kiếm của danh sách). Textarea trong drawer đổi về 552 | Login và SearchInput giữ 100%. Textarea AudEvaluateClarification dùng 552 | Chờ design (một phần) |
| Q6 | Trộn size M và L trong cùng một container | 03 SgsInviteSgs, SgsInviteCustomer, TenantCreate | Sửa design. Đây là vi phạm Field Width Standard | Mỗi container dùng một độ rộng, theo field rộng nhất | Chờ design |

## Màu

Quy tắc chung được chốt ở Q8 và Q9:
- **Cam** là lỗi của một field, hiện ngay dưới input. Ví dụ: "Incorrect email or password".
- **Đỏ** là thông báo trạng thái (InlineNotification). Ví dụ: file import lỗi, tài khoản bị khoá.

| # | Chỗ lệch | Module / màn | Kết luận | Prototype làm gì | Trạng thái |
|---|---|---|---|---|---|
| Q7 | Nút primary của modal danger màu đỏ ("Reject request", "Revoke invitation", "Withdraw request") | 03, 06, 07, 09 | Giữ. Đỏ cho hành động phá huỷ là quy ước của Carbon, nền của Graphite. Cam dành cho lỗi validation và link. Vẫn cần hỏi client | Nút đỏ như design, kèm `TODO(open-question #4)` | Hỏi client |
| Q8 | Lỗi kiểm tra file import dùng InlineNotification error màu đỏ | 04 FwErrors | Giữ. Đây là thông báo trạng thái | Như design | Đóng |
| Q9 | Lỗi locked/inactive ở màn login dùng InlineNotification error màu đỏ | 01 | Giữ. Đây là thông báo trạng thái. Lỗi sai mật khẩu vẫn là lỗi field, màu cam | Locked/inactive dùng InlineNotification đỏ. Sai email hoặc mật khẩu hiện lỗi cam dưới field | Đóng |
| Q10 | Primary CTA ở theme sgs-ops màu charcoal, không phải cam | mọi màn SGS | Charcoal là chủ ý, để tách SGS Operations khỏi Customer Portal. Client chưa duyệt | Như design, kèm `TODO(open-question #12)` | Hỏi client |

## Nội dung và copy

| # | Chỗ lệch | Module / màn | Kết luận | Prototype làm gì | Trạng thái |
|---|---|---|---|---|---|
| Q11 | Ai đặt tier: 04 ghi "SGS assigns each scope a tier", còn 05 cho customer chọn | 04 FwPreview/FwActivate, 03 TenantNew | Đã chốt: khách hàng chọn tier. Designer sửa copy ở FwPreview, FwActivate, TenantNew | Khách hàng chọn tier. Copy ở 04 và 03 không nói SGS gán tier. D10 chuyển sang đã chốt | Chờ design |
| Q12 | Copy hứa email ("You’ll get an email…"), trong khi email là P2 | 06, 07, 08, 09 | Sửa design, đồng ý với prototype | Mọi câu này đổi thành "You'll be notified in the portal" | Chờ design |
| Q13 | Nhãn customer và auditor không khớp: "Response sent" / "Response submitted"; "Clarification" / "Clarification requested" | 08 | Sửa design. Hai phía dùng chung một bộ nhãn | Dùng "Response submitted" và "Clarification requested" ở cả hai portal | Chờ design |
| Q14 | "Closed with finding" màu xanh bên auditor, màu vàng bên customer | 08 | Sửa design. Đây là trạng thái cuối | Màu xanh ở cả hai phía | Chờ design |
| Q15 | Thời điểm consultant hết quyền truy cập khác nhau: 07 IsConsWorkspaceEnded ghi theo period, các chỗ khác ghi theo lúc completed | 07 | Quyết định MVP: quyền của consultant kết thúc khi request chuyển sang Completed | Access rule và copy của IsConsWorkspaceEnded ghi theo thời điểm Completed | Chờ design |
| Q16 | Placeholder "e.g. David will call you…" bị copy nhầm vào màn assign của training | 09 TrainAdminAssign | Sửa design. Lỗi copy | Dùng "e.g. Mei will confirm dates and price with you." | Chờ design |

## Điều hướng

| # | Chỗ lệch | Module / màn | Kết luận | Prototype làm gì | Trạng thái |
|---|---|---|---|---|---|
| Q17 | Customer sidebar có 3 biến thể (có hoặc không có Reviews / Certifications / Workspace access) | 03/06/07/09/10 so với 05 so với 08 | Dùng bản hợp nhất của prototype và bỏ "Workspace access", vì quyền đã gán theo scope. Designer cập nhật design cho khớp | **Đã áp dụng.** Thứ tự sidebar: Home · Scopes · Workspaces · Documents · Reviews · Service Requests ▾ · Certifications · Training · Audit Logs (chỉ CA) · Settings · Administration › Users (chỉ CA). Xem `apps/prototype/src/shell/nav.ts` | Chờ design |
| Q18 | TopBar customer có sẵn "Request Applications" và "Communications" nhưng không có đích | mọi màn customer | Bỏ "Communications", vì comment giữa khách hàng và SGS đã bị loại khỏi MVP. "Request Applications" trỏ tới danh sách Service Requests | **Đã áp dụng.** `homeLinks` chỉ còn "Request Applications" → `/service-requests`. Bỏ placeholder `/communications` | Chờ design |
| Q19 | Không màn nào mở modal Change tier | 05 | Sửa design. Thêm nút Change tier trên dòng framework trong bảng Frameworks ở màn Scope detail | Scope detail có nút Change tier trên dòng framework, bấm vào mở modal Change tier | Chờ design |
| Q20 | Link "Other versions" trỏ tới FwVersions.dc.html, file này không có trong repo | 04 FwDetail | FwVersions có trên canvas Framework Management (artboard "Active version · Other versions"). Có thể bản export trong repo được xuất ra trước khi thêm màn này | Cần bản export mới. Chưa có thì link dẫn tới placeholder "Chưa có design", kèm `TODO(design-questions Q20)` | Chờ export |
| Q24 | Customer User vẫn thấy "Audit Logs" trong sidebar (designs/05), trong khi UC-AUD-004 chỉ dành cho Customer Admin | 05 | Đồng ý với prototype. Designer sửa sidebar | **Đã áp dụng.** Customer User và Customer Viewer không thấy Audit Logs | Chờ design |

## Kỹ thuật

| # | Chỗ lệch | Module / màn | Kết luận | Prototype làm gì | Trạng thái |
|---|---|---|---|---|---|
| Q21 | Screenshot hiển thị checkbox/radio chưa tick, trong khi source có `checked` | 03, 05, 06 | Làm theo source. Screenshot không phản ánh trạng thái mặc định | Làm theo source. Khi so screenshot ở Pha 3, chỗ lệch này được ghi là lệch đã biết | Đóng |
| Q22 | Module 11 không dùng Graphite (IBM Plex Sans, hex inline, sai lưới 4×4, có border) | 11 | Đồng ý với prototype. Graphite là chuẩn. Với module không dùng Graphite, chỉ lấy quy tắc nghiệp vụ | Giao diện dùng CommentThread | Đóng |
| Q23 | DataTable của 10 dùng `pageSize 8`, nhưng pager ghi "Items per page 10" | 10 | Sửa design | `pageSize` = 10 | Chờ design |
| Q25 | Menu tài khoản của TopBar có "Profile", "Settings", "Sign out", nhưng cả ba là `Link href="#"` và không có callback | Graphite TopBar | Bổ sung vào DS: `onSignOut`, `signOutHref`, `signOutLabel`, `accountLinks`. Có từ Graphite 1790347709-dd39 | **Đã áp dụng.** Đã port. `PortalShell` truyền `onSignOut` (thoát session rồi về `/login`) và `accountLinks` (xem Q27). Không còn phần bắt click tạm | Đóng |
| Q26 | TopBar không truyền `onOpen` / `onMarkAllRead` xuống NotificationCenter, nên trạng thái đã đọc không lưu được về server | Graphite TopBar | Bổ sung vào DS: `onNotificationOpen`, `onMarkAllRead`, `onNotificationsLoadMore`. Có từ Graphite 1790347709-dd39 | **Đã áp dụng.** `onNotificationOpen` và `onMarkAllRead` gọi mock API. Trạng thái đã đọc vẫn giữ sau khi reload. Chưa dùng `onNotificationsLoadMore`, vì mock chưa phân trang thông báo | Đóng |
| Q27 | Menu tài khoản mặc định có "Profile", nhưng MVP không có UC nào cho trang hồ sơ cá nhân (UC-ORG-001 Organization Profile là Phase 2), và cũng không có design | Graphite TopBar, mọi màn | Chưa hỏi | Truyền `accountLinks` chỉ gồm Settings (placeholder "Chưa có design"). Bỏ Profile | Mở |
| Q28 | Trên các board có nội dung dài hơn khung 900px, TopBar bị co từ 56px xuống khoảng 40px. Nguyên nhân: board là flex column và TopBar không có `flex-shrink: 0`, nên cả trang bên dưới lệch lên khoảng 16px | 03 TenantNew, TenantDetail, CaUserDetail và các trang detail dài khác | Chưa hỏi | Giữ TopBar 56px theo CSS của DS. Trong bảng so screenshot, đây được ghi là sai khác đã biết | Mở |
| Q29 | Dữ liệu mẫu 09 không khớp giữa hai phía: TrainList (khách) có TR-2026-009 "Rejected", còn TrainAdminQueue (SGS) ghi Rejected = 0. TrainAdminQueue có TR-2026-022 của Lotus Cosmetics, nhưng ở 02 tenant Lotus chưa có user active. Design cũng không có tab cho yêu cầu Withdrawn | 09 TrainList, TrainAdminQueue | Chưa hỏi | Một bộ seed chung cho hai portal: tab Rejected của SGS có 1 (TR-2026-009). Yêu cầu Withdrawn được liệt kê trong tab Rejected. TR-2026-022 ghi người gửi là admin Lotus đang được mời | Mở |
| Q30 | Dữ liệu mẫu của 10 lệch với các module khác. Ngày 26–30 Sep muộn hơn ngày demo. GA-2026-005 vẫn Submitted (06). Deliverable IS-2026-003 do Anna Lee chia sẻ (07). Nguyen Thi Ha (Lotus) chưa kích hoạt nên không thể đăng nhập sai. David Wu audit ABC, không audit Formosa (08) | 10 Main, CaActivity | Chưa hỏi | Seed audit trail giữ thứ tự và loại sự kiện, nhưng dời ngày về trước 25 Sep. Sự kiện được gắn vào đối tượng có thật: GA-2026-004, Anna Lee, Wei Chen, CR-2026-015. Ngoài ra, mọi thao tác thật trong prototype đều sinh sự kiện, nên số sự kiện khác design (14/12) | Mở |
| Q31 | `CommentThread` giữ `messages` làm state ban đầu, nên khi `messages` đổi sau lúc mount (dữ liệu tải xong hoặc có người khác thêm ghi chú), component không cập nhật. Khi gửi, nó tự thêm tin vào danh sách, không đợi server | Graphite CommentThread (08 AudReview, SR internal notes) | Chưa hỏi | Chỉ mount thread khi đã có dữ liệu, dùng `key` theo request. Đề nghị DS làm `messages` thành prop có điều khiển (controlled) | Mở |
| Q32 | Module 12 (dashboard) không có `INDEX.md` và `screenshots/`, nên không so được bằng ảnh. Số liệu trong design lệch với seed của các module khác, ví dụ: Wei Lin là auditor, Mei Chang là "SGS Trainer/Assessor", GA-2026-007 và IS-2026-005 không có, ngày tháng 11–12. Danh sách "Needs your attention" trong design chỉ có 5 mục | 12 Main, CustomerUserHome, SgsAdminHome, ConsultantHome, AuditorHome | Chưa hỏi | Mọi số liệu và mục đều tính từ mock data, nên nhất quán với các flow. "Needs your attention" hiện 5 mục đầu, kèm nút "Show all N" (design không có nút này). Customer Viewer dùng bố cục của Customer User, nút hành động đổi thành "Open". Lời chào đổi theo giờ (morning / afternoon / evening). Xin designer gửi screenshot để đưa vào bảng so sánh | Mở |
| Q33 | Top bar của Customer Portal có nút "Request Applications", dẫn tới Service Requests. Nút này trùng với mục Service Requests trong sidebar | Mọi màn của Customer Portal (designs/03–12) | Theo yêu cầu của team ngày 2026-09-26: bỏ nút ở mọi role | Top bar không còn home link nào (`homeLinks={[]}`). Service Requests vẫn vào được từ sidebar. Trong bảng so screenshot, các board phía khách lệch ở góc phải top bar: đây là lệch đã biết. Cần báo designer để sửa Figma | Chờ design |
