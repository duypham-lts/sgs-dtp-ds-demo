# Link

Liên kết văn bản màu cam `link-primary` (#CA4300), weight chỉ Regular hoặc Semibold.

- Link đứng riêng (ví dụ *Forgot your password?*): không gạch chân, gạch chân khi hover.
- Link trong câu hoặc help text: `inline`, luôn gạch chân. Chỉ phần tương tác có màu cam, phần còn lại giữ `text-secondary`. **Không bao giờ in đậm** trong help text.
- Không dùng Link cho hành động thay đổi dữ liệu; khi đó dùng Button `ghost`.

Props: `href`, `inline`, `weight` (`regular`|`semibold`).
