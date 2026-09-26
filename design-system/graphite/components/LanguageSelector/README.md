# LanguageSelector

Chọn ngôn ngữ giao diện; hiện có 2 lựa chọn là **English** và **繁體中文** (Traditional Chinese), đặt ở góc phải top bar.

- Mỗi ngôn ngữ hiện bằng **mã ngôn ngữ** (EN / 中) cùng **tên bản ngữ** ("English", "繁體中文"), luôn viết bằng chính ngôn ngữ đó để người đọc được ngôn ngữ ấy nhận ra ngay. Tên ngôn ngữ có thuộc tính `lang` đúng, nên screen reader đọc đúng giọng.
- **Không dùng cờ quốc gia:** cờ đại diện cho quốc gia, không đại diện cho ngôn ngữ. Tiếng Anh thì phải chọn cờ Anh hay cờ Mỹ; tiếng Trung phồn thể thì phải chọn giữa Đài Loan, Hồng Kông hay Macau. Riêng với tiếng Trung, lựa chọn cờ còn nhạy cảm về chính trị. Nếu client vẫn muốn dùng cờ, có thể thêm qua prop `languages`.
- `compact` dùng cho breakpoint nhỏ: chỉ hiện icon và mã ngôn ngữ.
- Bàn phím: ↓ để mở, ↑/↓ để di chuyển, Esc để đóng. Nhãn của nút là "Language: <tên>".
- Chữ Trung dùng font fallback **Noto Sans TC** (theo typography guideline).

Props: `value`, `defaultValue`, `onChange(code)`, `languages [{code,label,short,hint}]`, `compact`, `align`.
