# Graphite DS

Graphite DS là nền tảng thiết kế cho **SGS Digital Trust Platform (DTP)**, gồm hai portal dùng chung một bộ component nhưng mang hai theme riêng: **Customer Portal** cho khách hàng và **SGS Operations** cho đội ngũ SGS. Hệ thống dựa trên cấu trúc token của IBM Carbon, đã map sang màu thương hiệu SGS, và tuân theo *EP UI Guidelines* (18/08/2026).

> **Trạng thái: bản nháp.** Được dựng từ ảnh chụp file Figma "II Graphite DS Foundations (Customer Portal)" và EP UI Guidelines. Chưa đọc trực tiếp được Figma (chỉ có quyền view). Mọi giá trị có ghi **GIẢ ĐỊNH** trong phần usage đều cần client xác nhận. Xem mục *Open questions*. **Figma luôn là nguồn chuẩn (single source of truth).**

## Nền tảng sản phẩm

DTP là nền tảng B2B quản lý hành trình assurance: xác định framework, tạo scope, thu thập evidence, theo dõi readiness, làm việc với reviewer/auditor SGS, tới certification và Digital Trust Passport. Giao diện cần **rõ ràng, có cấu trúc, đáng tin cậy**. Đây là công cụ làm việc, không phải trang marketing. Màn càng phức tạp thì nền càng phải ít nổi bật.

## Hai theme

| | Customer Portal (`customer`) | SGS Operations (`sgs-ops`) |
|---|---|---|
| Tính cách | Ấm, thân thiện, hướng dẫn | Chuyên nghiệp, "công cụ nội bộ" |
| Shell (top bar, panel thương hiệu) | Trắng, `background-shell` | Charcoal đậm #1F2C32 |
| Accent | `brand-burgundy` | `brand-slate` |
| Hero / login | Gradient `gradient-start` → `gradient-end` | Panel charcoal + nền sáng |
| Nút chính (`button-primary`) | Cam #CA4300 | Charcoal đậm #28373E |
| Nút phụ (`button-secondary`) | Charcoal #3C525D | Slate đậm #4F6F7E |
| Shell (TopBar và AppSidebar) | **Sáng**: trắng | **Tối**: nền `shell-dark` #2E4049 (`tone="dark"`, theme `inverse`), dải burgundy dưới TopBar, tag "Internal". Nền trang SGS Ops đậm hơn (#DCE3E7) để giảm độ chênh |
| Dải nhận diện (`brand-band`) | Cam | Burgundy – báo hiệu môi trường nội bộ |
| Link | Cam #CA4300 (cả hai portal, theo UI Guidelines) | Cam #CA4300 |

Hai theme khác nhau ở các token có giá trị theo theme: `background`, `background-shell`, `brand-band`, `text-on-shell*`, `accent*`, `button-primary*`, `button-secondary*`, `button-tertiary`. Mọi token khác dùng chung. Muốn áp theme cho một vùng, đặt `data-theme="customer"` hoặc `data-theme="sgs-ops"` trên phần tử bao ngoài. Màu nút SGS Ops là **đề xuất** để phân biệt 2 portal, cần client duyệt.

### Theme bề mặt tối (`inverse`)

`inverse` không phải một portal. Nó là **ngữ cảnh bề mặt tối**, dùng được trong cả hai portal: đặt `data-theme="inverse"` lên vùng nền tối, và mọi component bên trong sẽ tự đổi sang chữ sáng, field tối, link và lỗi màu peach (`brand-peach`, đạt tương phản trên nền tối), focus trắng. Muốn đặt lại một vùng sáng bên trong (ví dụ card trắng trên nền tối của SGS Ops), bọc vùng đó bằng `data-theme="sgs-ops"` hoặc `data-theme="customer"`.

- **Login Customer:** trang sáng (`background` #EDF2F7), card tối (`inverse`), nút chính cam.
- **Login SGS Ops:** trang tối (`inverse`), card trắng (`sgs-ops`), nút chính charcoal, dải burgundy.

Toàn bộ giá trị của `inverse` là **giả định**, cần client duyệt.

## Màu

Năm màu nhận diện: **Charcoal** `brand-charcoal` #3C525D, **Orange** `brand-orange` #CA4300, **Peach** `brand-peach` #FF9966, **Burgundy** `brand-burgundy` #8E0B3D, **Slate** `brand-slate` #65899A. Nền trang mặc định là `charcoal-light` #EDF2F7.

**Quy tắc sử dụng**

- **Cam = hành động.** Dùng cho CTA chính (`button-primary`), link (`link-primary`), dấu `*` bắt buộc ở cuối label, và lỗi validation dưới field (`text-error`). Tất cả token tương tác trong Carbon gốc là Blue 60 #0F62FE. Ở đây chúng đã được map sang cam, **trừ `focus`**: focus vẫn giữ xanh để không trùng với lỗi form.
- **Đỏ = trạng thái hồ sơ, cam = lỗi nhập liệu.** `support-error` #DA1E28 dùng cho status (Missing Info, Rejected). `text-error` #CA4300 dùng cho lỗi dưới input. Không trộn hai loại.
- **Chữ:** `text-primary` #28373E (theo UI Guidelines; Carbon gốc là #161616). Label input và help text luôn dùng `text-secondary` #3C525D, weight Regular.
- **Peach không mang chữ trắng.** Tương phản quá thấp. Chữ trên nền peach hoặc gradient phải dùng `text-primary`.
- **Không dùng viền mặc định.** Container, top bar, menu, section không có stroke, trừ khi Figma có. Khi cần phân tách, dùng lớp nền (`layer-01/02/03`).
- **Disabled:** luôn dùng `button-disabled` và `text-disabled`, không tự chế style riêng.

## Typography

Font **Roboto**; tiếng Trung, Ả Rập, Hebrew dùng **Noto Sans** (Noto Sans TC cho tiếng Trung phồn thể). Quy tắc **4x4**: font-size và line-height đều chia hết cho 4, ngoại lệ duy nhất là 14/20. Line-height = size × 1.5, làm tròn **lên** bội số 4 nếu size < 20px, làm tròn **xuống** nếu size ≥ 20px. Năm role: Display, Headline, Title, Body, Label; mỗi role có 3 cỡ. Link chỉ dùng weight 400 hoặc 600.

Ví dụ: tiêu đề trang "New Service Request" dùng `headline-medium` 28/40; tiêu đề card "Trade parties" dùng `title-large`; giá trị trong input dùng `body-large` 16/24; help text dưới field dùng `body-small` 12/20.

Thang theo role hiện là **đề xuất**. Figma có text styles chính thức (Label, Body, Title, Headline, Display) nhưng chưa đọc được. Style `xsmall` 10px trong Figma vi phạm quy tắc 4x4, cần hỏi lại.

## Spacing và layout

Lưới cơ sở 4px, 12 cột (stretch từ 840px), gutter `spacing-04` 24px, lề trang `spacing-10` 96px. Khoảng cách dọc chính là `spacing-05` 32px giữa các container và `spacing-09` 64px từ header xuống content, cũng như từ content xuống footer. Label cách input `spacing-01` 4px.

- **Input không giãn theo màn hình.** Dùng `field-s`/`field-m`/`field-l`, cộng 32px cho text field hoặc 68px cho dropdown, tối đa `field-max` 640px. Mỗi container lấy input rộng nhất làm chuẩn để layout vuông vức. Cần thêm chỗ thì thêm cột, không kéo dài input.
- **Màn SR (3 cột)** ghi đè gap cột theo breakpoint: 20px, rồi 12px, rồi 8px. Chỉ cột giữa cuộn; top bar, header, cột trái và cột phải đứng yên.
- **Responsive:** vùng lớn 960 → 1980px; khối nội dung bằng `content-ratio` 95%. Các breakpoint: `bp-*`.

## Iconography

Icon lấy từ **@carbon/icons v11.89.0** (Apache-2.0), viewBox 32, render ở 16/20/24/32px, `fill="currentColor"`. Bộ 228 icon data/analytics của Figma có sẵn dưới dạng gói SVG riêng, nằm ngoài hệ thống này. Status icon ở nhóm **Status icons**: 16px trong tag và bảng, 20px trong card header. Không bao giờ truyền đạt status chỉ bằng màu: luôn kèm text; khi chỉ còn icon thì phải có `aria-label` và tooltip.

## Logo

Component `SGSlogo_Final` có 3 biến thể: **chữ xám + đường cam** cho nền sáng; **chữ trắng + đường cam** cho nền tối (top bar màn login, shell SGS Ops, footer); **toàn trắng** cho nền màu brand (cam, peach, burgundy, gradient). **Chưa có file SVG** trong hệ thống. Tạm thời chỉ viết chữ "SGS" và thay bằng logo thật khi có.

## Component (quy tắc từ UI Guidelines)

- **Feedback:** dùng snackbar Material, đặt giữa phía dưới màn hình, tự ẩn.
- **Modal:** làm tối toàn bộ nền bằng `overlay`.
- **Help text:** nằm ngay dưới field, canh trái theo label; mỗi lúc chỉ hiện một thông điệp. Khi có lỗi, lỗi thay chỗ help text; khi người dùng bắt đầu sửa, bỏ lỗi ngay.
- **Document Item:** nền `surface-document`, viền `border-outline`. Biến thể Actions Required dùng viền dashed `brand-orange`; SGS Documents dùng `border-sgs-document`. Ở breakpoint nhỏ: ẩn icon loại file, status chỉ còn icon, các action gom vào menu ba chấm.
- **Top bar:** Landing (trắng, có link), Log In (trong suốt, logo trắng, không link), Home (trắng, có Request Applications, Communications, Notifications, Profile).

## Danh mục component

Hiện có **48 component**, chia 3 tầng. Tầng trên ghép từ tầng dưới.

| Tầng | Nhóm | Component |
|---|---|---|
| 1 · Primitive | Actions | Button · IconButton · Link |
| | Forms | FormField · TextInput · Textarea · SearchInput · Select |
| | Selection | Checkbox · Radio · Toggle |
| | Status | Tag · StatusTag |
| 2 · Composite | Forms | Combobox · MultiSelect · DatePicker · FileUpload |
| | Feedback | NotificationCenter · Tooltip · Snackbar · InlineNotification · ProgressBar · ReadinessRing · Skeleton · EmptyState |
| | Overlay | Modal · Drawer · Popover |
| | Actions | OverflowMenu |
| | Navigation | Tabs · Breadcrumb · LanguageSelector · SectionNav · Avatar · NotificationBadge |
| | Containers | Accordion · Separator |
| | Data | Table · DataTable · Pagination · TreeView · RequirementNavigator |
| 3 · Pattern | Patterns | TopBar · AppSidebar · PageHeader · Card · DocumentItem · CommentThread |

Triển khai trong code: dựng trên **Radix UI**, cộng TanStack Table (bảng), cmdk (Combobox, MultiSelect), react-day-picker (DatePicker), react-dropzone (FileUpload). Style dùng lại class và `data-*` attribute ghi trong mục Anatomy của từng component.

### Page templates

Nhóm **Page templates** (card dạng *page*, không export trong bundle) gồm các khung bố cục dùng chung: **AppShell**, **ListPage**, **WizardPage**, **RequestDetailPage**. Màn thật của sản phẩm được thiết kế trên canvas Design và dựng từ các template này.
