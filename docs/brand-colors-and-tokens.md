# Brand colours & semantic tokens

Bảng màu thương hiệu (từ ảnh cover COPIA Graphite)

Tên	Hex	Vai trò
Charcoal SGS	
#3C525D	Màu chủ đạo trung tính, text phụ, nền đậm
Orange SGS	
#CA4300	Màu brand chính, CTA, link, error
Peach	
#FF9966	Accent sáng, đầu gradient
Burgundy	
#8E0B3D	Accent đậm, nhấn mạnh
Slate (Charcoal 50)	
#65899A	Màu phụ lạnh, trạng thái active
Charcoal Light	
#EDF2F7	Nền trang mặc định
Gradient banner	
#FF9966 → ~
#A3B8C2	Hero/welcome banner, chuyển ngang

Token ngữ nghĩa (cấu trúc Carbon, đã chỉnh cho SGS)

Nhóm	Token → giá trị
Background	background 
#EDF2F7 · background-active 
#65899A @40% · background-hover 
#65899A @12% · background-selected 
#8D8D8D @20% · background-selected-hover 
#8D8D8D @32% · background-brand (swatch cam 
#CA4300) · background-inverse 
#393939 · inverse-hover 
#4C4C4C
Text	primary 
#161616 · secondary 
#525252 (swatch hiển thị charcoal ~
#3C525D) · placeholder 
#A8A8A8 · helper 
#6F6F6F · error 
#DA1E28 · on-color / inverse 
#FFFFFF · disabled 
#161616 @25% · on-color-disabled 
#8D8D8D
Button	primary 
#0F62FE / hover 
#0353E9 / active 
#002D9C · secondary 
#393939 / hover 
#4C4C4C / active 
#6F6F6F · tertiary 
#0F62FE · danger 
#DA1E28 / hover 
#B81921 / active 
#750E13 · disabled 
#C6C6C6 · separator 
#E0E0E0
Layer	layer-01 
#F4F4F4 · layer-02 
#FFFFFF · layer-03 
#F4F4F4, các trạng thái hover/active/selected theo gray 10–30 của Carbon
Field	field-01 
#F4F4F4 · field-02 / field-03 
#FFFFFF · hover 
#E8E8E8
Border	subtle 
#E0E0E0 / 
#C6C6C6 · strong 
#8D8D8D · inverse 
#161616 · interactive 
#0F62FE · disabled 
#C6C6C6
Link	primary 
#0F62FE · hover 
#0043CE · secondary 
#0043CE · inverse 
#78A9FF · visited 
#8A3FFC
Icon	primary 
#161616 · secondary 
#525252 · on-color 
#FFFFFF · interactive 
#0F62FE · disabled 
#161616 @25%
Support	error 
#DA1E28 · success 
#24A148 · warning 
#F1C21B · info 
#0043CE · caution-major 
#FF832B · undefined 
#8A3FFC
Focus	focus 
#0F62FE · focus-inset / inverse 
#FFFFFF
Tag	Bộ 10 màu Carbon (blue, cyan, green, magenta, purple, red, teal, gray, cool-gray, warm-gray), mỗi màu có background 20 / text 70 / hover
AI	Aura gradient Blue 50 
#4589FF @10–16% → trắng, border 
#A6C8FF → 
#78A9FF, skeleton 
#4589FF / 
#D0E2FF, overlay Blue 100 @50%

Lưới và khoảng cách (Desktop Guidelines)

Lưới cơ sở vuông 4dp.
12 cột ở chế độ stretch, áp dụng cho màn từ 840dp trở lên.
Margin 94dp, gutter 24dp.
Padding tăng theo bậc 8dp hoặc 4dp: 24dp trong container này, 16dp trong container kia.
Khoảng cách dọc giữa các container dùng bội số của 4dp: 32, 48, 64.
Touch target tối thiểu 48dp, cách nhau ít nhất 8dp.
Font trên màn hình là Roboto, dù template gốc là của Carbon.

Những chỗ cần client xác nhận

Màu tương tác vẫn là xanh Carbon. Button, link, focus, interactive vẫn là Blue 60 
#0F62FE mặc định. Trong khi đó UI Guidelines quy định link và CTA dùng cam 
#CA4300. Khi thiết kế, tôi sẽ map các token này sang cam SGS, trừ khi bạn muốn giữ xanh.
Giá trị ghi và swatch không khớp. background-brand ghi "Blue 60 
#0F62FE" nhưng swatch là cam. text-secondary ghi 
#525252 nhưng swatch là charcoal. Tôi coi swatch là ý đồ thật: cam 
#CA4300 và 
#3C525D (đúng với guideline label 
#3C525D).
Màu error lệch nhau. Support error là 
#DA1E28, còn UI Guidelines lại dùng cam 
#CA4300 cho validation. Tôi sẽ theo UI Guidelines.

Hướng chia theme cho 2 portal, dùng cho yêu cầu login trước đó

Customer Portal: tông ấm và thân thiện. Nền dùng gradient Peach 
#FF9966 → Slate. CTA cam 
#CA4300, accent Burgundy 
#8E0B3D, layer trắng.
SGS Operations Portal: tông chuyên nghiệp, "công cụ nội bộ". Nền charcoal 
#3C525D, accent Slate 
#65899A. CTA vẫn cam 
#CA4300 để giữ nhận diện, cộng thêm dải Burgundy để phân biệt môi trường nội bộ.