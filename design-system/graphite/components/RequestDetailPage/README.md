# RequestDetailPage (page template)

The detail page for one request (SR, Gap Analysis, Implementation Support). It follows the **3-column** layout in the UI Guidelines, section *Responsiveness · SR creation*.

| Cột | Tỷ lệ | Nội dung |
|---|---|---|
| Trái | 14% | SectionNav các phần của request |
| Giữa | 62% | Các Card đánh số (Overview, Documents, Results…); card cuối dùng `extend` |
| Phải | 21% | "SGS Requests & Communications": InlineNotification (các yêu cầu từ SGS), CommentThread (Messages) |

- Khoảng cách giữa các cột: 20px (≥1440), 12px (1280–1439), 8px (tablet).
- **Chỉ cột giữa cuộn.** Cột phải có vùng Messages tự cuộn riêng.
- Kết quả của consultant luôn ghi rõ là *assessment*, không phải kết luận compliance.
