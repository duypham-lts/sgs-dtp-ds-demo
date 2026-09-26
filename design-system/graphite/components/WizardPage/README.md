# WizardPage (page template)

Luồng tạo mới gồm nhiều bước: Gap Analysis (5 bước), Service Request, tạo Scope.

| Vùng | Nội dung |
|---|---|
| PageHeader | Back · tiêu đề và "Step n of N" · status Draft · autosave · Keep as Draft / Submit |
| Cột bước (220px) | SectionNav: ✓ đã xong, chấm cam là còn thiếu, mục đang chọn nền peach nhạt |
| Cột nội dung | **Một** Card cho bước hiện tại, có `extend`; footer Back / Next |

- Sidebar thu gọn. Chỉ cột nội dung cuộn.
- Được quay lại bất kỳ bước nào. Nút Submit chỉ bật khi mọi bước bắt buộc đã xong.
- Tự lưu nháp (autosave), trạng thái hiện trên PageHeader.
