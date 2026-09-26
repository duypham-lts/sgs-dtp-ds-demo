# SGS DTP – Status Icons (Graphite DS)

Nguồn: frame "Status icon Utility" (Carbon Design System) trong file Figma Graphite DS Foundations.
Icon lấy từ `@carbon/icons` v11.89.0 (Apache-2.0), viewBox 0 0 32 32, dùng ở cỡ 16px (trong tag/bảng) hoặc 20px.
Mọi SVG dưới đây đã có `fill="currentColor"` — đặt `color` để tô màu.

## 1. Bộ icon trong Figma (đọc từ ảnh chụp)

Hàng 1 = light theme (nền sáng). Hàng 2–3 = biến thể inverse (màu sáng hơn, dùng trên nền tối) + vài icon bổ sung.

| # | Hình dạng | Carbon icon | Màu | Token | Ý nghĩa |
|---|---|---|---|---|---|
| 1 | Tròn đặc + check | `checkmark--filled` | #24A148 | support-success | Success / hoàn thành |
| 2 | Tròn viền + check | `checkmark--outline` | #24A148 | support-success | Success nhẹ (đã xong, không nhấn mạnh) |
| 3 | Tròn đặc + check, cam | `checkmark--filled` | #FF832B | support-caution-major | Hoàn thành có lưu ý (hạn chế dùng – dễ lẫn brand orange) |
| 4 | Tam giác + ! | `warning--alt--filled` | #F1C21B, glyph #161616 | support-warning | Warning |
| 5 | Tròn đặc + ! | `warning--filled` | #DA1E28 | support-error | Error / thiếu thông tin |
| 6 | Tròn viền + X | `misuse--outline` | #DA1E28 | support-error | Failed / Rejected (dạng nhẹ) |
| 7 | Tròn đặc + gạch chéo | `error--filled` | #DA1E28 | support-error | Blocked / Not allowed |
| 8 | Tròn đặc + i | `information--filled` | #0043CE | support-info | Info |
| 9 | Check (sáng) | `checkmark--filled` | #42BE65 | support-success-inverse | Success trên nền tối |
| 10 | Tròn đặc + ! (vàng) | `warning--filled` | #F1C21B, glyph #161616 | support-warning | Warning dạng tròn |
| 11 | Tròn + đồng hồ | `time--filled` | #F1C21B (≈ vàng/cam) | support-warning | Pending / chờ xử lý |
| 12 | ! và gạch chéo (sáng) | `warning--filled`, `error--filled` | #FA4D56 | support-error-inverse | Error trên nền tối |
| 13 | i (sáng) | `information--filled` | #4589FF | support-info-inverse | Info trên nền tối |
| 14 | Tròn đặc + X | `misuse` | #DA1E28 | support-error | Rejected / Failed (dạng đặc) |
| 15 | Vòng tròn rỗng vàng | `circle--outline` (hoặc `circle-dash`) | #F1C21B | support-warning | In progress / Not started – **cần xác nhận với designer** |

Ghi chú: icon #11 và #15 đọc từ ảnh độ phân giải thấp; tên Carbon là suy luận gần nhất.

## 2. Map sang status của DTP (đề xuất)

| Status DTP (UI Guidelines / mockup) | Icon | Màu icon | Nền tag |
|---|---|---|---|
| Completed · Certificate issued | `checkmark--filled` | #24A148 | Green 90 #D9F3E4 |
| Under Review · Awaiting SGS review | `time--filled` | #3C525D (hoặc info #0043CE) | Trong suốt + stroke, chữ italic secondary |
| Needs Description | `warning--alt--filled` | #F1C21B + glyph tối | Vàng nhạt |
| Missing Info · Action required | `warning--filled` | #DA1E28 | Red 95 #FEE7E7 |
| Rejected | `misuse` | #DA1E28 | Red 95 #FEE7E7 |
| Draft · Not started | `circle-dash` | #3C525D | Trong suốt |
| Thông báo trung tính | `information--filled` | #0043CE | Xanh nhạt |

## 3. Quy tắc sử dụng

1. **Không chỉ dùng màu** (UI Guidelines §8): luôn kèm text; ở breakpoint nhỏ tag chỉ còn icon thì bắt buộc có `aria-label` + tooltip.
2. **Đỏ cho status, cam cho lỗi form**: status hồ sơ dùng đỏ Carbon #DA1E28; lỗi validation dưới input dùng cam brand #CA4300 (UI Guidelines). Không trộn.
3. **Icon nền vàng** (warning) phải có glyph tối #161616 bên trong – nền vàng trên trắng tương phản thấp.
4. **Hạn chế check cam** (#3): trùng cảm giác với CTA #CA4300.
5. **Glyph bên trong (inner-path)**: các icon Carbon "filled" có path `data-icon-path="inner-path"` để tô màu riêng cho glyph. Muốn glyph trắng/tối, style path đó: `svg [data-icon-path="inner-path"]{fill:#fff;opacity:1}`.
6. Cỡ: 16px trong tag, bảng, Document Item; 20px trong card header; vùng bấm (nếu icon là nút) tối thiểu 48px.

## 4. SVG nguồn (copy dùng trực tiếp)

### `checkmark--filled`
```svg
<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2ZM14,21.5908l-5-5L10.5906,15,14,18.4092,21.41,11l1.5957,1.5859Z"/><path fill="none" d="M14 21.591 9 16.591 10.591 15 14 18.409 21.41 11 23.005 12.585 14 21.591z" data-icon-path="inner-path"/></svg>
```

### `checkmark--outline`
```svg
<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M14 21.414 9 16.413 10.413 15 14 18.586 21.585 11 23 12.415 14 21.414z"/><path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,26A12,12,0,1,1,28,16,12,12,0,0,1,16,28Z"/></svg>
```

### `circle--outline`
```svg
<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path stroke-width="0" d="m16,2c-7.732,0-14,6.268-14,14s6.268,14,14,14,14-6.268,14-14S23.732,2,16,2Zm0,26c-6.6274,0-12-5.3726-12-12s5.3726-12,12-12,12,5.3726,12,12-5.3726,12-12,12Z"/></svg>
```

### `circle-dash`
```svg
<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M7.7,4.7a14.7,14.7,0,0,0-3,3.1L6.3,9A13.26,13.26,0,0,1,8.9,6.3Z"/><path d="M4.6,12.3l-1.9-.6A12.51,12.51,0,0,0,2,16H4A11.48,11.48,0,0,1,4.6,12.3Z"/><path d="M2.7,20.4a14.4,14.4,0,0,0,2,3.9l1.6-1.2a12.89,12.89,0,0,1-1.7-3.3Z"/><path d="M7.8,27.3a14.4,14.4,0,0,0,3.9,2l.6-1.9A12.89,12.89,0,0,1,9,25.7Z"/><path d="M11.7,2.7l.6,1.9A11.48,11.48,0,0,1,16,4V2A12.51,12.51,0,0,0,11.7,2.7Z"/><path d="M24.2,27.3a15.18,15.18,0,0,0,3.1-3.1L25.7,23A11.53,11.53,0,0,1,23,25.7Z"/><path d="M27.4,19.7l1.9.6A15.47,15.47,0,0,0,30,16H28A11.48,11.48,0,0,1,27.4,19.7Z"/><path d="M29.2,11.6a14.4,14.4,0,0,0-2-3.9L25.6,8.9a12.89,12.89,0,0,1,1.7,3.3Z"/><path d="M24.1,4.6a14.4,14.4,0,0,0-3.9-2l-.6,1.9a12.89,12.89,0,0,1,3.3,1.7Z"/><path d="M20.3,29.3l-.6-1.9A11.48,11.48,0,0,1,16,28v2A21.42,21.42,0,0,0,20.3,29.3Z"/></svg>
```

### `error--filled`
```svg
<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="none" d="M14.9 7.2H17.1V24.799H14.9z" data-icon-path="inner-path" transform="rotate(-45 16 16)"/><path d="M16,2A13.914,13.914,0,0,0,2,16,13.914,13.914,0,0,0,16,30,13.914,13.914,0,0,0,30,16,13.914,13.914,0,0,0,16,2Zm5.4449,21L9,10.5557,10.5557,9,23,21.4448Z"/></svg>
```

### `information--filled`
```svg
<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="none" d="M16,8a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,16,8Zm4,13.875H17.125v-8H13v2.25h1.875v5.75H12v2.25h8Z" data-icon-path="inner-path"/><path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,6a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,16,8Zm4,16.125H12v-2.25h2.875v-5.75H13v-2.25h4.125v8H20Z"/></svg>
```

### `misuse--outline`
```svg
<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M16,2C8.2,2,2,8.2,2,16s6.2,14,14,14s14-6.2,14-14S23.8,2,16,2z M16,28C9.4,28,4,22.6,4,16S9.4,4,16,4s12,5.4,12,12	S22.6,28,16,28z"/><path d="M21.4 23 16 17.6 10.6 23 9 21.4 14.4 16 9 10.6 10.6 9 16 14.4 21.4 9 23 10.6 17.6 16 23 21.4z"/></svg>
```

### `misuse`
```svg
<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14S23.7,2,16,2z M21.4,23L16,17.6L10.6,23L9,21.4l5.4-5.4L9,10.6L10.6,9	l5.4,5.4L21.4,9l1.6,1.6L17.6,16l5.4,5.4L21.4,23z"/><path fill="none" d="M21.4,23L16,17.6L10.6,23L9,21.4l5.4-5.4L9,10.6L10.6,9l5.4,5.4L21.4,9l1.6,1.6L17.6,16	l5.4,5.4L21.4,23z" data-icon-path="inner-path" opacity="0"/></svg>
```

### `time--filled`
```svg
<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="m16,2c-7.6001,0-14,6.3999-14,14s6.3999,14,14,14,14-6.3999,14-14S23.6001,2,16,2Zm4.5872,20l-5.5872-5.5898V7h2v8.582l5,5.0044-1.4128,1.4136Z"/><path fill="none" d="M20.5872 22 15 16.4099 15 7 17 7 17 15.5822 22 20.5866 20.5872 22z"/></svg>
```

### `warning--alt--filled`
```svg
<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="none" d="M16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Zm-1.125-5h2.25V12h-2.25Z" data-icon-path="inner-path"/><path d="M16.002,6.1714h-.004L4.6487,27.9966,4.6506,28H27.3494l.0019-.0034ZM14.875,12h2.25v9h-2.25ZM16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Z"/><path d="M29,30H3a1,1,0,0,1-.8872-1.4614l13-25a1,1,0,0,1,1.7744,0l13,25A1,1,0,0,1,29,30ZM4.6507,28H27.3493l.002-.0033L16.002,6.1714h-.004L4.6487,27.9967Z"/></svg>
```

### `warning--filled`
```svg
<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14C30,8.3,23.7,2,16,2z M14.9,8h2.2v11h-2.2V8z M16,25	c-0.8,0-1.5-0.7-1.5-1.5S15.2,22,16,22c0.8,0,1.5,0.7,1.5,1.5S16.8,25,16,25z"/><path fill="none" d="M17.5,23.5c0,0.8-0.7,1.5-1.5,1.5c-0.8,0-1.5-0.7-1.5-1.5S15.2,22,16,22	C16.8,22,17.5,22.7,17.5,23.5z M17.1,8h-2.2v11h2.2V8z" data-icon-path="inner-path" opacity="0"/></svg>
```

