# SGS DTP – Product context

SGS DTP là một B2B assurance journey platform / lightweight GRC giúp khách hàng quản lý hành trình từ xác định framework áp dụng, tạo scope, thu thập evidence, theo dõi readiness, làm việc với SGS reviewer/auditor cho tới certification và Digital Trust Passport; hệ thống không nhằm thay thế một full GRC và không tự động kết luận compliance.

Các role chính gồm Customer Admin, Customer User ở phía khách hàng và SGS Admin, SGS User, SGS Auditor, SGS Consultant ở phía SGS; quyền truy cập phải bị giới hạn theo tenant, SGS affiliate, scope/service assignment và conflict-of-interest.

Luồng nghiệp vụ chính là: SGS onboard tenant → customer tạo organization/users/scopes → chọn/activate framework → hệ thống tạo evidence workspace → customer upload evidence + self-assess maturity → readiness được tính → SGS review/clarification → service request/audit → certification → publish/share Digital Trust Passport.

Trong P1, trọng tâm cần build gồm foundation/Auth & RBAC, tenant/user/scope management, framework & requirement management, Regulatory Discovery, Evidence Management, readiness indicators, review workflow, service requests, notifications, SGS Operations/Admin Console, certification/Digital Trust Passport và SGS Academy integration; scope hiện được chia thành 70 functions + QA/UAT/go-live.

Về kỹ thuật, baseline hiện tại là Next.js + NestJS modular monolith + worker trên Azure Container Apps, PostgreSQL, Blob Storage, Redis, Entra External ID, với các yêu cầu quan trọng là tenant isolation/RLS, secure evidence storage, audit trail bất biến, asynchronous processing, COI enforcement và production-grade CI/CD/security controls.