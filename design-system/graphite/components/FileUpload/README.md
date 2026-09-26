# FileUpload

Vùng kéo-thả file kèm danh sách file và trạng thái từng file; là trung tâm của Evidence Management.

## Anatomy
| Part | Class · attribute | Vai trò |
|---|---|---|
| Label | `.gr-upload__label` | Như label của field, có `*` nếu bắt buộc |
| Dropzone | `.gr-upload__zone` `[data-state="dragover"]` | Viền đứt nét; khi kéo file vào thì viền cam, nền `background-brand-subtle` |
| Browse | `button.gr-upload__browse` | Mở hộp chọn file, dùng được bằng bàn phím |
| Hint | `.gr-upload__hint` | Loại file và dung lượng tối đa |
| File row | `li.gr-upload__file` `[data-status]` | Tên file, trạng thái hoặc dung lượng, icon kết quả, nút Remove |

| `status` | Hiển thị |
|---|---|
| `uploading` | ProgressBar `sm` và "Uploading…" |
| `scanning` | "Scanning for viruses…", khớp với `scan_state` của EVIDENCE trong ER |
| `complete` | Check xanh |
| `error` | Lỗi màu cam (lỗi nhập liệu, theo UI Guidelines) và viền cam |

- Khi dev triển khai: dùng **react-dropzone** cho vùng thả, cùng các class này.
