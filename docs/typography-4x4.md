# SGS DTP – Typography "4x4 combo" (Graphite DS)

Nguồn: frame "4x4 combo – Guidelines" trong file Figma Graphite DS Foundations.
Phần 1–3 ghi lại nguyên tắc của client. Phần 4 là **thang chữ đề xuất** được tính từ các nguyên tắc đó (Figma chưa có bảng cỡ chữ cho từng role), cần designer xác nhận.

## 1. Nguyên tắc gốc

1. **Font:** Roboto. Tiếng Trung, Ả Rập, Hebrew… dùng **Noto Sans** (Noto Sans TC cho tiếng Trung phồn thể).
2. Mọi component dựng khớp **lưới 4x4**: **font-size và line-height đều chia hết cho 4**.
3. **Ngoại lệ duy nhất:** font-size **14px**.
4. Font-size và line-height tăng/giảm cùng một tỷ lệ; tỷ lệ này dùng để tăng cỡ chữ theo bước 4.
5. **Line-height = font-size × 1.5** (tỷ lệ dễ đọc theo WCAG), rồi làm tròn về bội số của 4:
   - font-size **< 20px** → làm tròn **lên** (big scale).
   - font-size **≥ 20px** → làm tròn **xuống** (small scale).
   - **Ngoại lệ:** 14px dùng **14/20** (lấy từ small scale, không phải 14/24).
6. Mục tiêu: không phải tính lại cỡ chữ mỗi lần, chữ luôn khớp lưới → làm nhanh và nhất quán.

## 2. Công thức

```
lineHeight(size) =
  size == 14 → 20
  size <  20 → ceil (size × 1.5 / 4) × 4
  size >= 20 → floor(size × 1.5 / 4) × 4
```

| font-size | × 1.5 | line-height |
|---|---|---|
| 12 | 18 | **20** |
| 14 | 21 | **20** (ngoại lệ) |
| 16 | 24 | **24** |
| 20 | 30 | **28** ⚠ hoặc 32 – xem mục 5 |
| 24 | 36 | **36** |
| 28 | 42 | **40** |
| 32 | 48 | **48** |
| 36 | 54 | **52** |
| 40 | 60 | **60** |
| 44 | 66 | **64** |
| 48 | 72 | **72** |
| 56 | 84 | **84** |

## 3. Thứ bậc (type roles)

Hierarchy thể hiện qua font weight, font size và line-height. 5 role, không phụ thuộc thiết bị, mỗi role có 3 cỡ Large / Medium / Small:

- **Display** – chữ ngắn, quan trọng hoặc con số; hợp nhất với màn lớn.
- **Headline** – chữ ngắn, nhấn mạnh cao trên màn nhỏ; đánh dấu đoạn văn chính hoặc vùng nội dung quan trọng.
- **Title** – nhỏ hơn Headline, nhấn vừa, chữ tương đối ngắn; chia các đoạn/vùng nội dung phụ.
- **Body** – đoạn văn dài.
- **Label** – chữ nhỏ, tính tiện ích: chữ trong component (nút, tag, tab) hoặc chữ rất nhỏ trong nội dung như caption.
- **Link** – chỉ dùng weight **Regular (400)** hoặc **Semibold (600)**.

## 4. Thang chữ đề xuất (cần xác nhận)

Dựa trên cấu trúc Material 3, làm tròn về bội số của 4 và áp công thức ở mục 2.

| Token | Size / Line-height | Weight | Dùng cho (ví dụ trong DTP) |
|---|---|---|---|
| `display-large` | 56 / 84 | 400 | Số KPI lớn trên dashboard |
| `display-medium` | 44 / 64 | 400 | Hero headline (landing) |
| `display-small` | 36 / 52 | 400 | Headline màn login / welcome |
| `headline-large` | 32 / 48 | 400 | Tiêu đề trang lớn |
| `headline-medium` | 28 / 40 | 400 | Tiêu đề trang ("New Service Request") |
| `headline-small` | 24 / 36 | 400 | Tiêu đề trang trên tablet/mobile, tiêu đề modal |
| `title-large` | 20 / 28 | 500 | Tiêu đề card ("Trade parties") |
| `title-medium` | 16 / 24 | 500 | Tiêu đề sub-card ("Seller", "Buyer"), tên cột phải |
| `title-small` | 14 / 20 | 500 | Tiêu đề nhóm nhỏ, header bảng |
| `body-large` | 16 / 24 | 400 | Giá trị trong input, đoạn văn chính |
| `body-medium` | 14 / 20 | 400 | Nội dung bảng, mô tả, text mặc định |
| `body-small` | 12 / 20 | 400 | Help text dưới field, metadata (ngày, dung lượng file) |
| `label-large` | 14 / 20 | 500 | Chữ trên nút, tab |
| `label-medium` | 12 / 20 | 500 | Label trong input, tag, status |
| `label-small` | 12 / 20 | 400 | Caption, eyebrow (có thể UPPERCASE + letter-spacing) |

Ghi chú:
- Không có cỡ 10, 11, 13, 15, 18, 22, 26, 30… (không chia hết cho 4 và không phải 14).
- `label-small` trùng cỡ với `label-medium` vì 11px (Material) không hợp lệ; phân biệt bằng weight/case.
- Input field Figma dùng Roboto Regular 16 (khớp `body-large`; UI Guidelines: 1 ký tự ≈ 9px). Nếu UAT thấy chật có thể hạ xuống 14 (`body-medium`).
- Roboto trên Google Fonts có weight 600 (Semibold) – dùng cho link semibold.

### CSS tokens mẫu

```css
:root {
  --font-family: Roboto, "Noto Sans", "Noto Sans TC", "Helvetica Neue", Arial, sans-serif;
  --display-lg: 400 56px/84px var(--font-family);
  --display-md: 400 44px/64px var(--font-family);
  --display-sm: 400 36px/52px var(--font-family);
  --headline-lg: 400 32px/48px var(--font-family);
  --headline-md: 400 28px/40px var(--font-family);
  --headline-sm: 400 24px/36px var(--font-family);
  --title-lg: 500 20px/28px var(--font-family);
  --title-md: 500 16px/24px var(--font-family);
  --title-sm: 500 14px/20px var(--font-family);
  --body-lg: 400 16px/24px var(--font-family);
  --body-md: 400 14px/20px var(--font-family);
  --body-sm: 400 12px/20px var(--font-family);
  --label-lg: 500 14px/20px var(--font-family);
  --label-md: 500 12px/20px var(--font-family);
  --label-sm: 400 12px/20px var(--font-family);
}
/* dùng: font: var(--title-lg); */
```

## 5. Điểm cần client xác nhận

1. **Cỡ 20px:** guideline vừa ghi "less than 20px" (→ làm tròn lên cho <20), vừa ghi "until 20px included" (→ 20 thuộc nhóm làm tròn lên). Tức 20px có line-height **28** hay **32**? File này tạm dùng **28**.
2. **Thang cỡ cho từng role** (mục 4) là đề xuất; Figma chưa có bảng chính thức.
3. **Semibold 600 vs Medium 500:** guideline chỉ nhắc semibold cho link; các role khác dùng 500 hay 600?

## 6. Checklist khi thiết kế

- [ ] Mọi font-size chia hết cho 4, hoặc là 14.
- [ ] Mọi line-height chia hết cho 4 và đúng theo bảng mục 2.
- [ ] Chỉ dùng các token ở mục 4, không tạo cỡ lẻ.
- [ ] Label input màu #3C525D, help text Regular (không bold) – theo UI Guidelines.
- [ ] Nội dung đa ngôn ngữ có fallback Noto Sans.
