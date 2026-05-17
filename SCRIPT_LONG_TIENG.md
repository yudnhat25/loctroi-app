# 🎙️ Kịch bản lồng tiếng — Demo LocTroi AgriChain V3

> **Bài cuối kỳ FinTech CLDMST K49 · Đề: Blockchain SCF cho nông nghiệp Việt Nam**
>
> **Trục chính của bài:**
> 1. **SRP bền vững** — biến chuẩn canh tác từ "kỹ thuật khó cảm nhận" thành "thu nhập rõ ràng"
> 2. **Minh bạch on-chain** — mọi giao dịch ghi bất biến, ai cũng kiểm chứng được
> 3. **Hộ chiếu Số** — chuyển hóa lịch sử canh tác thành tài sản tín dụng cho 200k hộ nông dân
>
> Phần **Buyer-SCF với ngân hàng** sẽ demo có dẫn chứng ở cuối như *hướng phát triển pha 2* — chứng minh nền tảng SRP+minh bạch ở pha 1 có thể mở rộng thành mô hình tài chính phức tạp hơn.
>
> Thời lượng đề xuất: **6 phút 45 giây** · Tốc độ chậm rãi, rõ ràng, nhấn mạnh số liệu thực tế.
>
> Ký hiệu: **[ACTION]** = thao tác trên màn hình · *(in nghiêng)* = chỉ dẫn diễn xuất.

---

## 🎬 CẢNH 0 — MỞ ĐẦU & ĐẶT VẤN ĐỀ (0:00 – 0:35) — 35s

**[ACTION] Mở landing page http://localhost:5174 — màn hình login với hero "Lúa gạo Việt Nam trên Blockchain"**

> *(giọng đầm, rõ)*
>
> "Một thực tế đau lòng: **70% hộ nông dân Đồng bằng sông Cửu Long không tiếp cận được tín dụng ngân hàng**. Không phải vì họ không đáng tin — mà vì họ **không có hồ sơ tín nhiệm chuẩn**: không dòng tiền minh bạch, không lịch sử giao dịch kiểm chứng được."
>
> "Đồng thời, ngành lúa gạo Việt Nam đang đối mặt áp lực phát triển bền vững — chuẩn quốc tế **SRP — Sustainable Rice Platform**. Nhưng với nông dân, *SRP chỉ là bộ tiêu chuẩn kỹ thuật xa lạ, khó hiểu, khó cảm nhận lợi ích*."
>
> "**LocTroi AgriChain V3** giải hai bài toán đó cùng lúc — bằng cách: biến mỗi hành vi canh tác đúng chuẩn SRP thành **một con số tiền cụ thể trên ví của nông dân**, và mọi giao dịch ghi minh bạch lên blockchain để bất kỳ ai — nông dân, Lộc Trời, ngân hàng tương lai — đều kiểm chứng được."

---

## 🎬 CẢNH 1 — HỘ CHIẾU SỐ & QUYỀN LỢI MINH BẠCH (0:35 – 1:30) — 55s

**[ACTION] Tab "Nông dân" → nhập mã `LT001` · mật khẩu `123456` → Đăng nhập**

> "Đây là hộ ông Nguyễn Văn An, mã số trên chuỗi **LT001**, canh tác 12,5 hecta ở Thoại Sơn, An Giang. Ông đang ở **Tier A — VIP**, với Overall Score 760 trên 1000 điểm — nhờ tích lũy qua nhiều vụ canh tác đúng chuẩn SRP."

**[ACTION] Bấm "Hộ chiếu" → mở passport modal với QR code + DID**

> "Đây là **Hộ chiếu Số** của ông — một Digital ID gắn với CCCD, không thể chỉnh sửa. Mỗi lần giao dịch — nhận vật tư, kiểm tra ruộng, bán lúa — đều quét QR này, ghi lên chain."

**[ACTION] Đóng modal → cuộn xuống section "🎁 Quyền lợi Tier A của bạn"**

> "Đây là **đổi mới quan trọng nhất** của hệ thống. Trước đây, nông dân không biết SRP cho mình lợi ích gì cụ thể. Bây giờ, hệ thống **hiển thị thẳng bằng tiền mặt**:"

**[ACTION] Chỉ vào ô "Tiền premium nhận thêm: 37.500.000 VNĐ"**

> "Với Farming Score 80% hiện tại, ông An nhận thêm **37 triệu rưỡi đồng** Premium SRP cho riêng mùa này. Đây không phải con số ước lượng mơ hồ — mà tính ra cụ thể: 75 tấn lúa nhân với 500 đồng phụ trội mỗi kg."

**[ACTION] Cuộn xuống "🏆 So sánh 4 Tier" → chỉ vào card Tier D / B / A**

> "Đồng thời ông thấy rõ lộ trình: Tier D không premium — Tier B cộng 200 đồng/kg — Tier A cộng 500 đồng/kg. SRP không còn là *bộ tiêu chuẩn kỹ thuật* — **nó là công thức kiếm thêm tiền**."

---

## 🎬 CẢNH 2 — ĐẶT VẬT TƯ & SMART CONTRACT DUYỆT (1:30 – 2:10) — 40s

**[ACTION] Bấm "Đặt vật tư" → modal hiện ra**

> "Ông An đặt vật tư đầu vụ. AI gợi ý gói chuẩn theo diện tích — 1.250 kg giống, 2.500 kg phân NPK, 25 chai thuốc BVTV. Vì là Tier A, ông được **trả sau 100% với lãi 0%** — không cần cọc trước. Lưu ý: ở mô hình V3, **nông dân KHÔNG vay ngân hàng** — Lộc Trời tự ứng vốn trực tiếp."

**[ACTION] Bấm "Gửi yêu cầu lên Lộc Trời" → toast xanh xuất hiện**

> "Yêu cầu được ký số, ghi lên chain. Hệ thống tự động cộng **5 điểm Credit** — đúng theo quy định trong đề bài: *đăng ký mua vật tư qua app — cộng 5 điểm*."

**[ACTION] Đăng xuất → đăng nhập `LT-MGR-001` (Giám đốc Tuấn) → tab "Hộ Nông dân & Vật tư"**

> "Chuyển vai Giám đốc Vùng — ông Nguyễn Quốc Tuấn. Smart contract `requestSupply` đã đối chiếu Tier tự động, ông chỉ cần xác nhận."

**[ACTION] Bấm "Duyệt" → lệnh giao chuyển đến tài xế**

---

## 🎬 CẢNH 3 — TÀI XẾ KÝ SỐ MINH BẠCH (2:10 – 2:35) — 25s

**[ACTION] Đăng xuất → đăng nhập `LT-DR-005` (Tài xế Sang) → tab "Giao vật tư"**

> "Tài xế Hoàng Văn Sang nhận lệnh. Trên xe, anh quét QR Hộ chiếu Số của ông An, đối chiếu danh sách lô vật tư, rồi **ký số 2 bên ngay trên blockchain**."

**[ACTION] Bấm "Quét QR → Xác nhận giao"**

> "Cả ông An và anh Sang cùng ký — smart contract `confirmDelivery` chạy ngay. Hệ thống ghi nợ vật tư vào sổ, sẽ tự cấn trừ vào tiền lúa cuối vụ. Ông An được **cộng 10 điểm Credit** vì đã ký nhận. Không thể có chuyện *giao nhầm — giao thiếu — ghi sổ sai* như mô hình giấy tờ cũ."

---

## 🎬 CẢNH 4 — CÁN BỘ ĐỒNG RUỘNG · ĐÁNH GIÁ SRP THỰC ĐỊA (2:35 – 3:35) — 60s

**[ACTION] Đăng xuất → đăng nhập `LT-FO-002` (Trần Minh Đức) → tab "Kiểm tra SRP"**

> "Đây là **trái tim của hệ thống**. Sau khi giao vật tư, cán bộ Trần Minh Đức xuống đồng. Vai trò này **gộp Phi công drone và Cán bộ 3 Cùng** vào một người — vì thực tế, một chuyến xuống đồng nên làm cả hai việc."

**[ACTION] Bấm sub-tab "🚁 Bước 1 · Bay drone & AI scan" → chọn hộ LT001 → Auto-pilot**

> "Bước 1: drone DJI Agras T40 bay tự động, chụp 3 ảnh đa phổ ô ruộng. Gemini AI phân tích từng ảnh — chấm chỉ số NDVI, đếm phần trăm phủ xanh, phát hiện dấu hiệu sâu bệnh — tất cả ghi `DRONE_REPORT` lên chain."

**[ACTION] Đợi xong → bấm sub-tab "✅ Bước 2 · Tick SRP & ký số" → chọn LT001**

> "Bước 2: vào checklist SRP. AI **tự tick sẵn** các tiêu chí dựa trên ảnh drone — sạ đúng mật độ, dùng giống khuyến cáo, quản lý nước tốt, không bệnh nặng. Cán bộ chỉ xác nhận hoặc chỉnh sửa, rồi ký số."

**[ACTION] Tick đầy đủ checklist → bấm "Ký số & Ghi Blockchain"**

> "Đây là điểm minh bạch then chốt: **mọi đánh giá SRP đều được ký số bởi 3 bên — drone, AI, và cán bộ thực địa — và ghi lên blockchain**. Không thể có chuyện chấm điểm cảm tính hay vận động cá nhân. Farming Score được cập nhật real-time."

**[ACTION] Nếu tier thay đổi → toast hiện "Tier C → Tier B"**

> "Đây là cơ chế **re-tier liên tục** — không phải đợi cuối vụ. Farmer làm tốt hôm nay, hôm sau quyền lợi đã tăng ngay. Đó là cách *biến SRP từ tiêu chuẩn thành động lực kinh tế hàng ngày*."

---

## 🎬 CẢNH 5 — THU HOẠCH & TẤT TOÁN (3:35 – 4:30) — 55s

**[ACTION] Đăng nhập lại Farmer LT001 → bấm "Báo thu hoạch"**

> "Cuối vụ, ông An mở app, bấm một nút *Báo Lộc Trời tới cân lúa*. Tự động gửi notification đến Giám đốc."

**[ACTION] Đăng xuất → Đăng nhập Manager LT-MGR-001 → tab "Thu hoạch & Tất toán"**

> "Giám đốc mở phiên thu mua. Trên màn hình hiện rõ: ông An đủ điều kiện thu hoạch — đã giao vật tư, đã có kiểm tra SRP thực địa, chưa tất toán vụ này."

**[ACTION] Bấm "Thu hoạch và tất toán" trên thẻ LT001**

> "Hệ thống tự tính minh bạch từng dòng:"
>
> "Một: sản lượng dự kiến **75 tấn**, từ công thức diện tích nhân với 6 tấn/ha trung bình."
>
> "Hai: giá bao tiêu cơ sở **8.500 đồng/kg**, cộng **Premium SRP 500 đồng/kg** vì Farming Score đạt 80% — thành **9.000 đồng/kg**."
>
> "Ba: doanh thu lúa **675 triệu**, trừ công nợ vật tư đã ghi sổ, ra số tiền ròng trả ông An."

**[ACTION] Chỉ vào dòng "Tác động Credit Score: +200 đủ SL + +100 trả nợ = +300"**

> "Đặc biệt — hệ thống tự cộng **300 điểm Credit Score** cho ông An: 200 điểm vì giao đủ sản lượng cam kết, 100 điểm vì trả nợ đúng hạn. Và cứ mỗi 3 vụ liên tục, hệ thống còn **bonus thêm 50 điểm ổn định** — đúng theo công thức trong đề bài."

**[ACTION] Bấm "Ký số và tất toán Smart Contract" → animation thành công**

> "Smart contract `harvestSettlement` chạy. Tiền chuyển khoản, Credit Score cập nhật, lịch sử vụ mùa khóa cứng trên chain. Đây là **vòng kép** của một vụ canh tác — toàn bộ từ đăng ký vật tư đến tất toán đều **minh bạch, kiểm chứng được**."

---

## 🎬 CẢNH 6 — GIÁ TRỊ THỰC TẾ CỦA MINH BẠCH (4:30 – 4:55) — 25s

**[ACTION] Đăng xuất → đăng nhập lại Farmer LT001 → cuộn xuống "Lịch sử trên blockchain"**

> "Quay lại vai ông An. Đây là **toàn bộ lịch sử vụ mùa** của ông — từ đăng ký vật tư, tài xế giao, drone bay, kiểm tra SRP, đến thu hoạch tất toán. Mỗi block có **hash định danh**, có thể truy xuất độc lập."

**[ACTION] Chỉ vào timeline 5 bước hoàn thành ✓**

> "Đây chính là **Hộ chiếu Số tín nhiệm** mà đề bài nói tới: lịch sử canh tác minh bạch, có thể trở thành tài sản thẩm định cho ngân hàng trong tương lai — *không còn chuyện nông dân không có hồ sơ để vay vốn*."

---

## 🎬 CẢNH 7 — HƯỚNG PHÁT TRIỂN TƯƠNG LAI · BUYER-SCF (4:55 – 6:15) — 80s

### 7A. Đặt vấn đề thực tế Lộc Trời (15s)

**[ACTION] Hiện slide tĩnh / màn hình overview Manager — chuyển bối cảnh**

> *(chuyển giọng: trầm, dẫn dắt sang tương lai)*
>
> "Trên nền tảng minh bạch đã xây được, hệ thống mở ra **hướng phát triển pha 2** — giải bài toán dòng tiền cho chính Lộc Trời."
>
> "Năm 2024, Lộc Trời từng **nợ 472 tỷ đồng tiền lúa của nông dân An Giang**, **dòng tiền kinh doanh âm 434 tỷ chỉ trong quý 1**. Nguyên nhân: buyer xuất khẩu như Vinafood, Cargill thường trả chậm 30 đến 90 ngày — Lộc Trời không xoay kịp vốn để trả nông dân."

### 7B. Demo Manager — gom lúa, token hóa AR (25s)

**[ACTION] Đăng nhập Manager LT-MGR-001 → tab "HĐ Buyer & Factoring"**

> "Hệ thống đề xuất giải pháp **Buyer Receivables Factoring**. Giám đốc gom các lô lúa vừa thu mua được — đây là lô vụ ông An vừa tất toán — chọn buyer **Vinafood II**, credit rating BBB+, payment term T+60."

**[ACTION] Tick 1-2 lots có sẵn → chọn Vinafood trong dropdown → nhập contract ref "LT-VNF-2026Q2" → bấm "Token hóa & chào bank"**

> "Bấm Token hóa. Hệ thống tự động làm 3 việc cùng lúc: phát hành token AR trên chain, **đính kèm đủ 9 chứng từ trade finance theo chuẩn quốc tế**, và chào bán cho liên minh ngân hàng."

**[ACTION] Cuộn xuống invoice vừa tạo — chỉ vào panel "📋 Chứng từ Trade Finance: 9/9 ✅"**

> "Đây là 9 chứng từ bắt buộc: **Bill of Lading, Vinacontrol giám định, Phytosanitary, Certificate of Origin, Assignment Clause, Buyer Acknowledgment, Escrow Account, Recourse Agreement, Trade Credit Insurance Atradius cover 85%**. Đầy đủ — vì back-office đã chuẩn bị sẵn, hash các PDF commit on-chain."

### 7C. Demo Bank — verify, giải ngân T+1 (25s)

**[ACTION] Đăng xuất → tab "Ngân hàng" → mật khẩu `123456` → tab "Liên minh Ngân hàng"**

> "Chuyển vai liên minh ngân hàng — VietinBank, HSBC, Agribank. Họ thấy ngay token Lộc Trời vừa phát hành."

**[ACTION] Chỉ vào card token TKN-BR-xxx**

> "Mặt giá khoản phải thu — chiết khấu **5% năm tính theo 60 ngày** ra phí khoảng vài chục triệu — bank giải ngân ròng cho Lộc Trời. Quan trọng: nút **Giải ngân T+1 chỉ enable khi chứng từ đủ 9 trên 9** — nếu thiếu là khóa."

**[ACTION] Bấm "Hồ sơ" → modal hiện 3 cột Shipping / Legal / Insurance đầy đủ**

> "Đây là **điểm khác biệt mà bank truyền thống không có**: ngoài 9 chứng từ trade finance chuẩn, bank còn thấy **traceability đến tận từng hộ nông dân** — lô lúa này từ hộ nào, Tier nào, Farming Score bao nhiêu, đạt SRP chuẩn nào. Lúa Tier A được giá cao hơn, bank cũng cho discount rate ưu đãi hơn."

**[ACTION] Đóng modal → bấm "Giải ngân T+1" → toast xanh xuất hiện**

> "Bấm Giải ngân — **Lộc Trời nhận tiền NGAY trong ngày T+1**, không phải đợi 60 ngày như trước. Trên lý thuyết, khủng hoảng 472 tỷ năm 2024 đã được giải."

### 7D. Khép Cảnh 7 — đặt vào bối cảnh roadmap (15s)

**[ACTION] Quay lại Manager → bấm "Buyer đã thanh toán" (hoặc bỏ qua nếu tiết kiệm thời gian)**

> "60 ngày sau, Vinafood thanh toán mặt giá đầy đủ vào tài khoản escrow của bank. Token bị đốt — vòng vốn hoàn tất."
>
> "Cách tiếp cận này có **tiền lệ thực tế tại Việt Nam**: deal **HSBC — Nhựa Duy Tân năm 2019** từng dùng blockchain Voltron rút thời gian xử lý L/C từ 10 ngày xuống 24 giờ. Hệ thống này đảo chiều cho **seller-side** — phù hợp với bài toán dòng tiền của Lộc Trời."
>
> "Đây là **pha 2 — chỉ khả thi khi nền tảng SRP minh bạch ở pha 1 đã đủ uy tín** để ngân hàng tin tưởng tham gia. Hai pha bổ sung cho nhau, không tách rời được."

---

## 🎬 CẢNH 8 — KẾT LUẬN (6:15 – 6:45) — 30s

**[ACTION] Quay lại Farmer LT001 → màn hình hero Tier A**

> *(giọng chốt, mạnh)*
>
> "**Tổng kết — LocTroi AgriChain V3 mang lại 3 đổi mới cốt lõi:**"
>
> "**Một — SRP bền vững trở thành thu nhập cụ thể:** Premium 200 hay 500 đồng/kg, tính được bằng tiền mặt ngay trên màn hình nông dân — không còn là *tiêu chuẩn kỹ thuật xa lạ*."
>
> "**Hai — Minh bạch on-chain triệt để:** Mọi hành vi — từ ký giao vật tư, bay drone, đến tất toán — đều ghi blockchain bất biến, ký số đa bên, kiểm chứng được."
>
> "**Ba — Hộ chiếu Số biến nông dân thành chủ thể tín dụng:** Lịch sử canh tác tích lũy qua nhiều vụ trở thành tài sản tín nhiệm — mở cánh cửa cho 70% hộ nông dân chưa từng tiếp cận được tín dụng ngân hàng."
>
> "Trên nền tảng minh bạch đó, **Buyer-SCF với liên minh ngân hàng là bước phát triển tự nhiên tiếp theo** — giải bài toán dòng tiền cho cả Lộc Trời lẫn 200 nghìn hộ đối tác."
>
> "Xin cảm ơn."

---

# 📋 PHỤ LỤC — CHEAT SHEET CHO NGƯỜI LỒNG TIẾNG

## Các con số phải đọc chậm và nhấn mạnh

| Con số | Vì sao quan trọng |
|---|---|
| **70%** | Tỷ lệ hộ không tiếp cận được tín dụng (nêu ngay từ Cảnh 0) |
| **37,5 triệu** | Premium SRP cụ thể ông An nhận thêm — minh chứng *"SRP = tiền mặt"* |
| **500 đồng/kg** vs **200 đồng/kg** | 2 mức premium theo Tier — show ladder |
| **+5 / +10 / +300** | Credit Score events theo PDF đề bài |
| **+50** | Bonus ổn định mỗi 3 vụ — đúng PDF |
| **472 tỷ** | Nợ thật LT với nông dân An Giang 2024 — chỉ nhắc ở Cảnh 7 (roadmap) |
| **200 nghìn hộ** | Quy mô mạng lưới nông dân đối tác |

## Mật khẩu & tài khoản demo

| Vai | Mã đăng nhập | Mật khẩu |
|---|---|---|
| Nông dân | `LT001` – `LT010` | `123456` |
| Giám đốc Vùng | `LT-MGR-001` | `123456` |
| Cán bộ Đồng ruộng | `LT-FO-002` / `LT-FO-003` | `123456` |
| Tài xế | `LT-DR-005` | `123456` |
| Ngân hàng | (tab Ngân hàng) | `123456` |

## Trước khi quay

1. **Hard refresh** trình duyệt (Ctrl+Shift+R)
2. **Reset Firebase** — nút "⚠ Reset toàn bộ dữ liệu demo" ở footer login → cho data sạch
3. **Setup data** trước khi quay (chạy nhanh 1 lần để có sẵn):
   - LT001 đã đăng ký vật tư cho 1 vụ
   - Manager đã duyệt
   - Driver đã giao
   - Field Officer đã có 3 drone reports cho LT001
   - **Để dành** bước "Tick SRP & Tất toán" cho khi quay
4. **Test trước 1 lần silently** — đảm bảo:
   - LT001 Farming Score ≥ 480 (vào Tier A)
   - Internet ổn định cho Gemini AI scan
5. **Tắt notification** Windows/Mac để không bị popup nhảy
6. **Mở DevTools console** F12 — đảm bảo không lỗi đỏ

## Phương án dự phòng

- **Cảnh 4 (drone)**: nếu Gemini lỗi/chậm → dùng **Auto-pilot mode** sẵn ảnh mock từ `/anhlua` (không cần Gemini)
- **Cảnh 7 (Buyer-SCF)**:
  - **Setup data trước khi quay**: đã có sẵn 2-3 `harvestLots` chưa gom (vì Cảnh 5 vừa tạo 1 lot từ ông An — bổ sung 1-2 lot từ farmer khác trước khi quay để có đủ chọn)
  - Nếu Firestore lag khi token hóa, đợi 2-3 giây sau toast rồi mới đọc câu tiếp
  - Nếu bí thời gian, có thể **bỏ Cảnh 7D** (đóng deal) — chỉ dừng ở bước bank giải ngân

## Style giọng cho từng cảnh

- **Cảnh 0**: Trầm, nghiêm trọng — đặt vấn đề
- **Cảnh 1**: Tự hào, gần gũi — show quyền lợi cụ thể cho farmer
- **Cảnh 2-3**: Nhanh, gọn — luồng nghiệp vụ bình thường
- **Cảnh 4**: Trang trọng, kỹ thuật — đây là *trái tim* của hệ thống, nhấn mạnh "minh bạch 3 bên ký số"
- **Cảnh 5**: Lên cao trào ở câu *"Smart contract harvestSettlement chạy"* — khoảnh khắc đóng vụ
- **Cảnh 6**: Trầm lại, ý nghĩa — *"Hộ chiếu Số tín nhiệm"*
- **Cảnh 7**:
  - **7A** (đặt vấn đề): trầm, dramatic — nhấn vào *"472 tỷ"*, *"434 tỷ âm dòng tiền"*
  - **7B-7C** (demo): nhanh, dứt khoát — thao tác phải mượt, không lúng túng
  - **7D** (khép): mở tầm — *"hai pha bổ sung cho nhau"*, gợi ý sự nối tiếp tự nhiên
- **Cảnh 8**: Quyết liệt, đóng gói 3 đổi mới chính

## Thời lượng tổng

**6 phút 45 giây** — đủ rộng để demo cả Cảnh 7 (Buyer-SCF) như roadmap có dẫn chứng, không chỉ nói suông.

## Phân bổ thời lượng theo trọng số

| Phần | Thời lượng | % video | Trọng số |
|---|---|---|---|
| Cảnh 0 (vấn đề) | 35s | 9% | Setup |
| **Cảnh 1-6 (CORE — SRP + minh bạch + tất toán)** | **4:20** | **64%** | **CHÍNH** |
| Cảnh 7 (roadmap Buyer-SCF có demo) | 80s | 20% | Phụ |
| Cảnh 8 (kết luận) | 30s | 7% | Wrap |

→ 64% video dành cho trục chính (SRP bền vững + minh bạch), 20% dành cho roadmap có dẫn chứng — tỷ lệ hợp lý.

## Sự khác biệt so với bản trước

| Bản đầu (6:30) | Bản hiện tại (6:45) |
|---|---|
| Buyer-SCF là *climax*, dồn 2:30 vào cuối | Buyer-SCF là *roadmap pha 2*, 80s — có demo nhưng có context "tương lai" |
| 472 tỷ nói ngay đầu, dramatic | 472 tỷ chỉ làm context Cảnh 7, không spoil trục chính |
| Nhấn "giải tắc nghẽn dòng tiền LT" | Nhấn "SRP=tiền + minh bạch + Hộ chiếu Số" (Cảnh 0-6) **rồi** mới nhấn dòng tiền LT (Cảnh 7) |
| Cảnh 7 (cũ) demo full bank approve dài | Cảnh 7 (mới) chia 4 sub: vấn đề → Manager token → Bank duyệt → khép roadmap |

---

🎬 **Chúc bài thuyết trình thành công!**
