# LocTroi AgriChain — Hướng dẫn sử dụng & ứng dụng thực tiễn

Tài liệu này hướng dẫn vận hành app demo *LocTroi AgriChain* và phân tích cách hệ thống xử lý bài toán Supply Chain Finance (SCF) mà Tập đoàn Lộc Trời đang đối mặt ở Đồng bằng sông Cửu Long.

---

## 1. App này làm gì?

LocTroi AgriChain là một bản demo mô phỏng nền tảng quản lý chuỗi giá trị lúa gạo của Lộc Trời trên nền Hyperledger (blockchain DLT). Mỗi giao dịch — từ lúc một hộ nông dân đăng ký mã định danh, nhận giống và phân bón trả chậm, đến lúc thu hoạch và Lộc Trời chào bán khoản phải thu cho ngân hàng — đều được ghi bất biến lên sổ cái phân tán.

Người dùng được chia thành **3 nhóm vai chính**:

- **Hộ Nông dân** — sở hữu Hộ chiếu Số (Digital ID), yêu cầu vật tư, theo dõi điểm tín nhiệm.
- **Lộc Trời** — chia tiếp thành 5 nhân sự tác nghiệp: Giám đốc Vùng, Cán bộ 3 Cùng, Phi công Drone, Tài xế giao vật tư, Cán bộ Thu mua.
- **Liên minh Ngân hàng** — thẩm định và giải ngân tiền cho các hóa đơn Lộc Trời chào bán (SCF Underwriter).

Mọi nghiệp vụ đều xoay quanh một ý tưởng cốt lõi: thay vì để hàng vạn hộ nông dân "vô hình" với ngân hàng, AgriChain biến từng hành vi canh tác thành **dữ liệu có thể chấm điểm**, từ đó cho phép Lộc Trời gọi vốn từ ngân hàng dựa trên uy tín nông dân.

---

## 2. Tài khoản demo

Tất cả tài khoản dùng chung mật khẩu `123456`.

| Vai | Mã đăng nhập | Mô tả |
| --- | --- | --- |
| Giám đốc Vùng ĐBSCL | `LT-MGR-001` | Duyệt yêu cầu vật tư, duyệt đơn đăng ký mới, theo dõi KPI |
| Cán bộ 3 Cùng | `LT-FO-002`, `LT-FO-003` | Onboard hộ nông dân tại HTX, kiểm tra SRP thực địa |
| Phi công Drone | `LT-DO-004` | Bay drone, upload ảnh đa phổ cho AI chấm điểm |
| Tài xế giao vật tư | `LT-DR-005` | Quét QR Hộ chiếu Số, ký số xác nhận giao hàng |
| Cán bộ Thu mua | `LT-PR-006` | Cân lúa cuối vụ, tất toán bao tiêu + Premium SRP |
| Liên minh Ngân hàng | (chỉ cần password) | Mua AR, giải ngân SCF, tuyên bố vỡ nợ nếu cần |
| Nông dân mẫu | `LT001` → `LT010` | 10 hộ có sẵn trong hệ thống |

Riêng nông dân **mới**, có thể tự đăng ký từ trang đăng nhập — sẽ trình bày ở mục 4.

---

## 3. Luồng nghiệp vụ tổng thể

Mọi thứ trong app vận hành theo một vòng tròn 5 bước, đặt tên nội bộ là quy trình **A1 → B5**:

1. **A1–A2 — Định danh**: Nông dân được cấp Hộ chiếu Số (Digital ID), trở thành một "địa chỉ" trên blockchain.
2. **B1 — Yêu cầu vật tư**: Đầu vụ, nông dân chọn giống, phân bón, thuốc BVTV trong app, gửi yêu cầu lên Lộc Trời.
3. **B2 — Duyệt theo Tier**: Smart contract `requestSupply()` so điểm tín nhiệm với 4 mức Tier (A/B/C/D) để quyết định trả chậm bao nhiêu phần trăm.
4. **B3 — Giao vật tư**: Tài xế ký số khi đến tận ruộng. Hệ thống tự sinh hóa đơn phải thu (AR) nếu nông dân nợ.
5. **B4 — Giám sát canh tác**: Phi công drone quét đa phổ, AI chấm điểm phủ xanh & phát hiện sâu bệnh. Cán bộ 3 Cùng kiểm tra SRP thực địa.
6. **B5 — Thu hoạch & Tất toán**: Cán bộ thu mua cân lúa, trả phần dư sau khi cấn nợ, cộng thưởng Premium nếu đạt chuẩn SRP.

Song song với B3–B5, **Lộc Trời gom các AR thành lô, token hóa và chào bán cho ngân hàng** để có dòng tiền ngay thay vì đợi 3–6 tháng đến cuối vụ. Đây là phần SCF — sẽ mổ xẻ ở mục 9.

---

## 4. Đăng ký hộ nông dân mới

Có hai con đường:

### 4.1 Nông dân tự đăng ký từ trang Login

Đây là luồng dành cho hộ chủ động liên hệ Lộc Trời (qua quảng cáo, qua người quen, qua HTX giới thiệu).

1. Mở app → tab **Nông dân** → chọn **Đăng ký mới**.
2. Nhập đầy đủ: Họ tên, CCCD, SĐT, địa chỉ ruộng, HTX đang sinh hoạt, diện tích (ha), giống lúa thường dùng.
3. Bấm **Gửi đơn đăng ký**. Hệ thống trả về mã đơn dạng `APP-XXXXX` và ghi sự kiện `REGISTRATION_SUBMITTED` lên blockchain.
4. Đơn vào hàng chờ duyệt của Giám đốc Vùng. Trong thời gian chờ, nông dân có thể dùng tab **Tra cứu đơn** + SĐT để xem trạng thái.
5. Khi được duyệt, app tự cấp **Hộ chiếu Số dạng LT-XXX** và hiển thị nút "Dùng mã này đăng nhập" ngay trên kết quả tra cứu.

### 4.2 Cán bộ 3 Cùng đến tận HTX hỗ trợ đăng ký

Một bộ phận hộ nông dân lớn tuổi không quen smartphone hoặc ở vùng sâu không có sóng. Lộc Trời giữ lại lực lượng **Cán bộ 3 Cùng** (cùng ăn, cùng ở, cùng làm) để xuống tận nơi:

1. Cán bộ đăng nhập (`LT-FO-002`) → tab **Onboard nông dân**.
2. Điền form thay nông dân và bấm **Tạo Hộ chiếu Số và ghi blockchain**. Không cần qua bước duyệt — vì chính cán bộ đã xác minh trực tiếp.
3. Smart contract `createPassport()` chạy: cấp Digital ID, sinh QR code in ra giấy cho nông dân cầm.

Hai luồng cùng dẫn về một đích — nhưng phân quyền khác nhau: tự đăng ký phải qua xét duyệt, cán bộ onboard thì tin cậy ngay.

### 4.3 Giám đốc duyệt đơn

1. Đăng nhập `LT-MGR-001` → sidebar có mục **Duyệt đơn đăng ký** (có badge đỏ hiển thị số đơn đang chờ).
2. Mỗi đơn hiện đủ thông tin: CCCD ẩn 4 số cuối, SĐT, địa chỉ, HTX, diện tích, giống lúa.
3. Hai lựa chọn: **Duyệt & cấp Hộ chiếu Số** (chạy smart contract, gán mã LT-XXX) hoặc **Từ chối** kèm lý do để nông dân tra cứu được.

Lý do tách quyền duyệt cho Giám đốc Vùng: với 100% hộ tự đăng ký, dữ liệu chưa được xác minh thực địa, nên cần một lớp gatekeeper kinh doanh để tránh tài khoản ảo.

---

## 5. Vận hành theo vai

### 5.1 Hộ Nông dân (vai `farmer`)

Sau khi đăng nhập bằng mã `LT-XXX`, nông dân thấy duy nhất tab **Hồ sơ cá nhân** với:

- Thẻ Hộ chiếu Số kèm QR code in ra giấy.
- Số dư điểm: **Credit Score** (đo uy tín tài chính, max 400) và **Farming Score** (đo chất lượng canh tác, max 600).
- Tier hiện tại (A/B/C/D) — quyết định mức trả chậm khi mua vật tư.
- Hạn mức tín dụng còn lại.
- Nút **Yêu cầu vật tư** → mở chợ vật tư (giống, phân, thuốc) để chốt đơn cho vụ tới.
- Nút **Báo cáo thu hoạch** dùng cuối vụ.
- Mục **Chào bán Khoản phải thu** — đây là điểm khác biệt: chính nông dân chủ động chào bán hóa đơn của mình cho ngân hàng SCF (xem mục 9).
- Sổ cái cá nhân: chỉ thấy các giao dịch liên quan đến chính mình, không thấy của người khác.

### 5.2 Cán bộ 3 Cùng (`fieldOfficer`)

Hai nhiệm vụ chính:

**Onboard hộ mới** — như đã mô tả ở 4.2.

**Kiểm tra SRP thực địa** — sau khi drone đã bay, cán bộ xuống ruộng cầm checklist 8 tiêu chí SRP (Sustainable Rice Platform): mật độ gieo, quản lý nước, sử dụng thuốc đúng liều, IPM, an toàn lao động, v.v. Điểm SRP ảnh hưởng trực tiếp đến Farming Score và Premium giá thu mua.

Mỗi lần kiểm tra ghi một block `SRP_INSPECTED` lên chain, kèm mã cán bộ và thời gian — minh chứng rằng dữ liệu không bị nông dân tự khai khống.

### 5.3 Phi công Drone (`droneOperator`)

Tab **Bay drone & AI scan**:

1. Chọn hộ cần quét trong danh sách hộ thuộc khu vực mình phụ trách.
2. Upload ảnh đa phổ (NDVI/NDRE) — trong demo là mô phỏng, thực tế tích hợp với DJI Agras T40.
3. AI Gemini chấm điểm:
   - **Độ phủ xanh** (canopy coverage) → quy ra điểm sinh trưởng.
   - **Phát hiện sâu bệnh** sớm 7–10 ngày trước khi mắt thường thấy.
4. Kết quả ghi xuống chain dưới dạng `DRONE_REPORT_xxx`, là **Oracle dữ liệu canh tác** cho các smart contract khác (vd: điều chỉnh hạn mức tín dụng theo điểm sinh trưởng).

### 5.4 Tài xế giao vật tư (`driver`)

Tab **Giao vật tư**:

1. Xem hàng chờ giao do Giám đốc đã duyệt từ B2.
2. Đến tận ruộng, **quét QR Hộ chiếu Số** của nông dân trên giấy.
3. Cả 2 bên ký số xác nhận đã giao đủ số lượng đúng người.
4. App tự động:
   - Sinh giao dịch `TX-xxx` trạng thái "Đã giao".
   - Cộng **+10 Credit Score** cho nông dân (thưởng vì đã ký nhận đầy đủ).
   - Tạo invoice `INV-xxx` cho phần trả chậm — đây chính là khoản phải thu (AR) mà Lộc Trời sẽ token hóa cho ngân hàng.

### 5.5 Cán bộ Thu mua (`procurement`)

Tab **Thu hoạch & Tất toán** — chạy cuối vụ:

1. Hộ nông dân báo đã thu hoạch (sản lượng kg + giá tham chiếu).
2. Cán bộ thu mua xác nhận, app tự cấn nợ:
   - Tổng tiền lúa thu mua = sản lượng × (giá cơ sở + Premium SRP nếu đạt chuẩn).
   - Trừ các invoice còn nợ.
   - Phần dư trả lại nông dân.
3. Các invoice liên quan tự chuyển trạng thái "Đã tất toán".
4. Cập nhật **+30 Credit Score** cuối vụ nếu trả nợ đúng hạn.

Premium SRP rất quan trọng cho thị trường xuất khẩu — gạo đạt SRP được trả thêm 200–500 đồng/kg ở thị trường EU/Nhật. Tích hợp Premium vào đúng nhánh tất toán giúp nông dân thấy ngay "làm sạch thì được trả thêm".

### 5.6 Giám đốc Vùng (`manager`)

Là người **không tác nghiệp tay chân**, chỉ ngồi xem dashboard và phê duyệt. Tabs:

- **Trang chủ Quản lý** — KPI vùng: số hộ, số ha, số block ghi, dư nợ AR, tỷ lệ giao vật tư đúng hạn.
- **Duyệt đơn đăng ký** — gatekeeper cho nông dân tự đăng ký (mục 4.3).
- **Tổng quan mạng lưới** — biểu đồ phân bố Tier, top hộ, vùng có rủi ro cao.
- **Hộ Nông dân & Vật tư** — duyệt từng yêu cầu vật tư (B2). Có thể từ chối nếu nghi ngờ.
- **Khoản phải thu** — quản lý các invoice, đẩy chúng vào nhánh SCF chào bán ngân hàng.

### 5.7 Liên minh Ngân hàng (`bank`)

Đăng nhập không cần mã, chỉ password — mô phỏng việc nhiều ngân hàng tham gia chung qua API gateway. Tab duy nhất **Liên minh Ngân hàng**:

- Xem các lô hóa đơn Lộc Trời đang chào bán.
- Mỗi lô có thông tin nông dân, lịch sử Credit Score, riskLevel (LOW/MEDIUM/HIGH), maturityDate (kỳ hạn).
- Bấm **Giải ngân**: smart contract chuyển token AR sang ví ngân hàng, tiền chảy về tài khoản Lộc Trời tức thì (T+0 thay vì T+90 → T+180).
- Bấm **Tuyên bố vỡ nợ** nếu quá hạn: kích hoạt nhánh bảo hiểm + recourse đối với Lộc Trời (xem mục disasterModal).

---

## 6. Luồng end-to-end thử nghiệm

Một kịch bản demo trọn vẹn để chạy từ đầu đến cuối:

**Bước 1.** Logout. Tab Nông dân → **Đăng ký mới**. Điền `Trần Văn Demo`, CCCD `012345678901`, SĐT `0911222333`, địa chỉ `Thoại Sơn, An Giang`, HTX `HTX Thoại Sơn`, diện tích `6.5`, giống `OM 5451` → Gửi.

**Bước 2.** Lấy mã `APP-XXXXX`. Mở tab **Tra cứu đơn**, nhập `0911222333` → thấy trạng thái "Chờ duyệt".

**Bước 3.** Login `LT-MGR-001` / `123456`. Vào **Duyệt đơn đăng ký** → bấm Duyệt → app cấp mã `LT011` (hoặc số kế tiếp).

**Bước 4.** Logout → Tra cứu lại với SĐT `0911222333` → thấy "Đã duyệt", nhận mã `LT011` → bấm "Dùng mã này đăng nhập".

**Bước 5.** Ở Hồ sơ cá nhân, bấm **Yêu cầu vật tư**, chọn 50kg giống OM5451 + 200kg phân NPK + 5 chai thuốc → Gửi. Vì là hộ mới (Tier D, Credit Score 0), hệ thống mặc định bắt **đặt cọc cao**, trả chậm thấp.

**Bước 6.** Login lại `LT-MGR-001` → tab Hộ Nông dân & Vật tư → duyệt yêu cầu của LT011.

**Bước 7.** Login `LT-DR-005` (tài xế) → tab Giao vật tư → quét QR → ký số. Invoice phần trả chậm được tạo.

**Bước 8.** Login `LT-DO-004` (drone) → quét ruộng LT011 → AI chấm điểm phủ xanh.

**Bước 9.** Login `LT-FO-002` (cán bộ 3 cùng) → kiểm tra SRP thực địa → điểm Farming cộng thêm.

**Bước 10.** Login lại LT011 → Hồ sơ cá nhân → mục **Chào bán khoản phải thu**, chọn invoice vừa tạo → Chào bán cho ngân hàng. Invoice chuyển trạng thái "Chào bán ngân hàng".

**Bước 11.** Login Ngân hàng → tab Liên minh Ngân hàng → thấy invoice → Giải ngân → tiền chảy về Lộc Trời.

**Bước 12.** Cuối vụ: nông dân báo thu hoạch 9 tấn × 8500đ → Login `LT-PR-006` (thu mua) → tất toán → cấn nợ → trả phần dư + Premium SRP.

Mỗi bước đều thấy block mới xuất hiện ở **Ledger Panel** (nút tròn đen góc dưới phải) — chứng minh mọi sự kiện đều ghi sổ cái không thể sửa.

---

## 7. Hộ chiếu Số và hai chỉ số chấm điểm

Hai chỉ số là xương sống của toàn bộ logic tín dụng:

**Credit Score (0–400)** đo *hành vi tài chính*. Tăng khi nông dân trả nợ đúng hạn, ký nhận vật tư đầy đủ, tham gia đều các vụ. Giảm khi quá hạn invoice hoặc khai báo gian dối bị cán bộ phát hiện.

**Farming Score (0–600)** đo *chất lượng canh tác*. Tăng khi điểm SRP cao, ảnh drone tốt, không có cảnh báo sâu bệnh nghiêm trọng. Đây là chỉ số mới — bình thường ngân hàng không có cách nào nhìn vào, nhưng giờ có drone + AI thì lượng hóa được.

Tổng hai điểm + diện tích → quy ra **Tier**:

| Tier | Tổng điểm | Đặt cọc | Trả chậm | Premium SRP |
| --- | --- | --- | --- | --- |
| A | ≥ 800 | 0% | 100% | +500đ/kg |
| B | 600–799 | 20% | 80% | +300đ/kg |
| C | 400–599 | 50% | 50% | +100đ/kg |
| D | < 400 | 100% (tiền mặt) | 0% | 0 |

Đây không phải con số phát minh ra — Lộc Trời thực tế có chương trình phân loại hộ theo quy mô và lịch sử hợp tác, app chỉ chuẩn hóa và blockchain hóa nó.

---

## 8. Vấn đề thực tiễn của Lộc Trời

Trước khi nói AgriChain giải gì, cần nhìn lại bài toán mà Lộc Trời đang gánh:

**Vốn lưu động khổng lồ bị chôn.** Lộc Trời ứng giống, phân, thuốc cho hơn **245.000 hộ nông dân** ở ĐBSCL mỗi vụ. Tiền vật tư đi ra ngay, nhưng tiền lúa chỉ về sau 3–6 tháng cuối vụ. Cộng dồn cả vùng, số dư nợ phải thu của Lộc Trời rơi vào nghìn tỷ đồng tại mọi thời điểm.

**Ngân hàng không dám cho vay đối với AR nông nghiệp.** Lý do đơn giản: con nợ là nông dân — không có lương cố định, không có tài sản thế chấp đáng tin, không có lịch sử tín dụng CIC. Khi Lộc Trời mang sổ phải thu đến ngân hàng đề nghị factoring, ngân hàng nhìn vào "phải thu từ 245 ngàn hộ nông dân vô danh" và lắc đầu.

**Thiên tai và bệnh hại làm cả lô vỡ nợ cùng lúc.** Khác cho vay tiêu dùng có thể "spread risk" qua hàng triệu cá nhân ở nhiều ngành, AR nông nghiệp tập trung địa lý — một trận hạn mặn ở An Giang quật ngã đồng loạt cả ngàn hộ. Ngân hàng sợ correlation risk này.

**Gian lận khai báo.** Trước đây cán bộ kinh doanh tự khai số liệu vào Excel, không có chứng cứ. Nông dân khai diện tích 10ha nhận giống cho 10ha rồi thực ra chỉ trồng 6ha — phần dư bán chợ đen. Lộc Trời lỗ ngấm ngầm nhiều năm.

**Premium SRP khó truy xuất.** Thị trường EU đòi gạo có chứng chỉ bền vững. Lộc Trời thực sự làm SRP, nhưng không có cách chứng minh từng bao gạo xuất khẩu thuộc đúng ruộng đã áp dụng SRP. Không truy xuất được → không được trả Premium → không có động lực cho nông dân làm sạch.

---

## 9. AgriChain giải bài toán SCF như thế nào

Phần này là trọng tâm. Chia thành 6 nhóm giải pháp:

### 9.1 Định danh không thể giả mạo cho nông dân

**Hộ chiếu Số** đặt mọi nông dân vào một địa chỉ trên blockchain. CCCD được hash SHA-256 trước khi ghi chain — vừa định danh được, vừa không leak thông tin riêng tư (đáp ứng yêu cầu của Nghị định 13/2023 về bảo vệ dữ liệu cá nhân).

Tác động trực tiếp cho ngân hàng: hôm trước con nợ là "ông Năm ở xóm 3 huyện X", giờ là `LT00789` với toàn bộ lịch sử hành vi 5 năm, không trùng, không giả được. Đây là điều kiện *prerequisite* — không có nó thì mọi cuộc nói chuyện về SCF với ngân hàng đều bế tắc.

### 9.2 Chấm điểm tín dụng on-chain thay cho CIC

Credit Score + Farming Score giải quyết câu hỏi "làm sao ngân hàng tin nông dân?".

CIC truyền thống chỉ có lịch sử vay ngân hàng. Nông dân chưa từng vay ngân hàng → CIC trắng → ngân hàng từ chối. Vòng luẩn quẩn này tồn tại 30 năm.

AgriChain tạo ra một **CIC mới** dựa trên hành vi sản xuất: ký nhận vật tư đúng hạn (+10), thu hoạch đủ sản lượng (+30), điểm SRP cao (+50). Khi ngân hàng nhìn vào LT00789 thấy điểm 720/1000, có biểu đồ tăng đều qua 6 vụ, có ảnh drone NDVI tươi tốt — họ tự tin hơn nhiều so với "không có gì".

Quan trọng hơn: dữ liệu này **không sửa được** vì đã ghi blockchain. Lộc Trời không thể "trang điểm" hồ sơ trước khi đem chào bán cho ngân hàng.

### 9.3 Token hóa khoản phải thu theo mô hình 2-Track

Đây là cơ chế SCF cốt lõi. Khi tài xế giao vật tư xong và sinh invoice, hệ thống tự định tuyến vào 1 trong 2 luồng dựa trên track record của nông dân:

#### Track 1 — Auto-SCF (hộ cũ Tier A/B)

Điều kiện: hộ đã có ≥ 1 vụ hoàn thành + đang ở Tier A hoặc B.

Smart contract tự động:
1. Đúc token AR full face value ngay tại thời điểm giao (`createTokenFast()`).
2. Đẩy thẳng vào hàng chợ ngân hàng (status "Chào bán ngân hàng") — **bỏ qua bước verify field/drone của vụ này**.
3. Bank đã pre-approve hạn mức tổng → duyệt trong 24h → tiền về Lộc Trời.

Lý do an toàn: bank đã có **track record đầy đủ vụ trước** ghi trên blockchain — Credit Score, Farming Score, tỷ lệ trả nợ đúng hạn, điểm SRP — đủ để định giá rủi ro mà không cần đợi dữ liệu vụ hiện tại. Drone + 3 Cùng vẫn bay/inspect vụ này nhưng dữ liệu thu được dùng cho **vụ sau** (quyết định Tier kế tiếp), không gating SCF vụ hiện tại.

#### Track 2 — Tranching (hộ mới hoặc Tier C/D)

Điều kiện: hộ chưa có vụ nào (vừa đăng ký) hoặc đang ở Tier C/D.

Hệ thống chia invoice thành 2 lớp tài sản:

```
Invoice face value 10 triệu
  ├── Senior tranche 70% (7 tr) → chào bán bank NGAY
  │     - Token TKN-SR-xxxxx, status "Chào bán ngân hàng"
  │     - Rủi ro thấp vì có LT recourse + insurance wrap + tỷ lệ nhỏ
  └── Junior tranche 30% (3 tr) → LT giữ làm "skin in the game"
        - Status "Junior chờ verify"
        - Khi drone + 3 Cùng inspect OK → đúc token TKN-JR-xxxxx → bán bank
```

Cấu trúc này giải quyết nghịch lý "không có lịch sử thì không cho vay" — bank vẫn mua được 70% face value ngay từ đầu vì có 30% LT giữ làm bảo lãnh. Junior tranche được "release" sau khi vụ canh tác chứng minh được chất lượng. Đây là kỹ thuật **securitization 2 lớp** mà các deal MBS, ABS lớn của Goldman, JPMorgan đều dùng.

#### Cấu trúc token chung

```
INV-A7B3 = {
  con_nợ: LT00789,
  face_value: 12.500.000đ,
  amount: 8.750.000đ (Senior 70%),
  kỳ_hạn: 2026-08-15,
  rủi_ro: MEDIUM (vì Tier B),
  bảo_lãnh: LOC-TROI-CORP,
  bảo_hiểm: INS-XX44 (Bảo Việt),
  insurance_fee: 437.500đ (5% face → Insurance Pool),
  scf_track: "TRANCHED",
  tranche: "Senior" | "Junior",
  tranche_pct: 70 | 30
}
```

Mỗi token có 3 đặc tính làm ngân hàng yên tâm: truy xuất 100% lịch sử, bảo lãnh kép (LT recourse + insurance), và có thể chia nhỏ tiếp cho nhiều bank cùng mua phân tán rủi ro.

#### Timeline cải thiện

| Mốc | Truyền thống | Track 1 (hộ cũ) | Track 2 (hộ mới) |
| --- | --- | --- | --- |
| Giao vật tư + invoice | T+0 | T+0 | T+0 |
| Token + chào bán | — | T+0 (auto) | Senior T+0 (auto) · Junior chờ verify |
| Bank duyệt + giải ngân | — | T+1 đến T+3 | Senior T+1-3 · Junior T+45-60 (sau verify) |
| **Tiền về Lộc Trời** | **T+120 đến T+180** | **T+1 đến T+3** (full amount) | **T+1 đến T+3** (70%) + **T+45-60** (30% còn lại) |

Track 1 rút 95% thời gian. Track 2 đưa được 70% tiền về sớm dù hộ chưa có lịch sử — sau khi inspect xong, 30% còn lại về tiếp.

### 9.4 Marketplace SCF nhiều ngân hàng

Tab **Liên minh Ngân hàng** đặt nền cho mô hình SCF nhiều người chơi. Vì token AR là tài sản số chuẩn hóa, không chỉ một ngân hàng được chào bán — bất kỳ ngân hàng nào có ví tham gia mạng đều có thể "đấu giá".

Tác động: Lộc Trời không phụ thuộc vào một bank duy nhất, lãi suất chào bán cạnh tranh hơn, dòng tiền về nhanh hơn. Khi ngân hàng A đang full hạn mức, ngân hàng B vào thay. Đối với một tập đoàn cần xoay vốn cả ngàn tỷ một lúc, có chợ thay vì có một quầy là khác biệt sống còn.

### 9.5 Oracle drone + AI giảm fraud

Toàn bộ vấn đề "khai khống diện tích" trong mục 8 được dập tắt nhờ drone định kỳ bay quét và AI chấm độ phủ xanh. Nếu nông dân khai 10ha nhưng ảnh chỉ thấy 6ha cây lúa, AI raise cờ → Cán bộ 3 Cùng xuống xác minh → nếu sai, Credit Score bị trừ + có thể bị hủy Tier.

Đối với SCF, fraud detection chính là *risk pricing*. Ngân hàng không sợ rủi ro cao, họ sợ rủi ro **không đo được**. AgriChain biến biến số mờ này thành chỉ số có thể tính.

### 9.6 Insurance Pool — đệm rủi ro hệ thống

Mỗi invoice phát hành đều bị trích **5% face value** chảy vào một quỹ chung gọi là Insurance Pool, ghi log `INSURANCE_FEE_COLLECTED` lên blockchain. Quỹ này do Lộc Trời quản lý chung với liên minh ngân hàng, không thuộc về một invoice cụ thể nào.

Mục đích sử dụng:

- **Đệm vỡ nợ tập trung**: khi 1 vùng vài trăm hộ cùng vỡ nợ vì thiên tai (correlation risk), quỹ này cover phần thiếu sau khi bảo hiểm parametric đã chi trả, trước khi đẩy recourse sang Lộc Trời.
- **Risk pricing động**: nếu pool đầy → bank có thể discount lãi suất xuống. Nếu pool cạn → bank tăng lãi để bù.
- **Bảo vệ Junior tranche**: phần Junior tranche mà Lộc Trời giữ trong Track 2 được pool back-stop một phần — giảm áp lực vốn của LT.

Số dư pool hiển thị real-time trên trang chủ Giám đốc Vùng, là một KPI sức khỏe tài chính của toàn portfolio.

### 9.7 Continuous re-scoring

Mỗi lần drone bay quét hoặc 3 Cùng inspect xong, Farming Score của hộ cập nhật ngay. Hệ thống đối chiếu Tier trước/sau, nếu Tier thay đổi:

- **Tier UP** (vd C → B): ghi blockchain `TIER_UPGRADED`, hộ đủ điều kiện SCF Track 1 cho vụ tới, vật tư trả chậm % cao hơn, lãi suất ưu đãi.
- **Tier DOWN** (vd B → C): ghi `TIER_DOWNGRADED`, vụ tới có thể phải qua tranching, hạn mức bị siết.

Cơ chế này biến Tier thành **dynamic credit rating** thay vì xếp loại đầu vụ rồi giữ nguyên. Bank nhìn vào dòng `TIER_UPGRADED` mới nhất để re-pricing token AR đang giữ.

### 9.8 Bảo hiểm tham số tích hợp

Modal **Disaster** trong app mô phỏng nhánh xử lý khi xảy ra bão/hạn mặn:

1. Oracle thời tiết (mô phỏng) báo "huyện Tri Tôn ngập lụt 4 ngày".
2. Smart contract tự kích hoạt hợp đồng bảo hiểm parametric — không cần nông dân khai báo, không cần giám định viên xuống.
3. Bảo hiểm chi trả % cố định trên dư nợ vật tư.
4. Phần còn lại Lộc Trời recourse cho ngân hàng.
5. Nông dân được "delay" nghĩa vụ trả nợ sang vụ sau, không bị mất Credit Score.

Đối với ngân hàng SCF, đây là *cushion* quan trọng. Trận lụt làm cả vùng vỡ nợ — bình thường là đại họa với portfolio nông nghiệp — nhưng nhờ bảo hiểm parametric chạy thẳng trong smart contract, ngân hàng nhận thanh toán trong vài giờ thay vì kiện tụng vài năm.

---

## 10. Lợi ích định lượng (ước tính demo)

Dựa trên giả định 245 nghìn hộ × bình quân 50 triệu nợ vật tư/vụ × 3 vụ/năm:

- **Dư nợ AR luôn duy trì**: ~12 nghìn tỷ đồng.
- **Tỷ lệ AR có thể chào bán SCF với điểm Tier A/B**: 60% → ~7,5 nghìn tỷ chào ra ngân hàng.
- **Rút ngắn vòng quay vốn**: từ T+120 (đợi cuối vụ) xuống T+1 (bán token AR ngay sau giao vật tư) → giảm chi phí vốn 8–10%/năm trên phần được giải ngân sớm.
- **Premium SRP truy xuất được**: thêm doanh thu xuất khẩu ~300đ/kg × sản lượng SRP ~ vài trăm tỷ/năm.
- **Giảm fraud diện tích**: ước tính 3–5% sụt thất thoát vật tư trước đây được thu hồi.

Con số mang tính chỉ báo cho mục tiêu của hệ thống, không phải số thực Lộc Trời công bố.

---

## 11. Hướng phát triển tiếp

Demo hiện tại tập trung end-to-end SCF cốt lõi. Một số hướng đáng làm thêm khi có thời gian:

- Tích hợp thật API CIC để hợp nhất điểm AgriChain với điểm CIC truyền thống cho ngân hàng nào còn yêu cầu.
- Bổ sung **NFT chứng chỉ SRP** cho từng lô gạo xuất khẩu, dán mã QR ngoài bao bì để siêu thị EU truy xuất.
- Mở rộng cho **các chuỗi hàng hóa khác**: cà phê, hồ tiêu, điều — bài toán SCF tương tự.
- Multi-chain: hiện demo dùng Hyperledger Fabric (chuỗi private), có thể bridge sang Polygon/Avalanche để mở token AR cho dòng vốn quốc tế.

---

## 12. Kết luận

Bài toán Lộc Trời không phải bài toán công nghệ — là bài toán **niềm tin**. Suốt nhiều thập kỷ, nông dân ĐBSCL ở ngoài hệ thống tài chính chính thống không phải vì họ không xứng đáng, mà vì không có cơ chế nào chứng minh điều đó cho ngân hàng. AgriChain mở đường bằng cách biến mỗi hành vi canh tác — gieo cấy, ký nhận vật tư, đạt SRP, thu hoạch — thành một dấu vết bất biến mà ai cũng đọc được. Khi nông dân có *track record*, ngân hàng có *collateral số*, Lộc Trời có *dòng tiền sớm*, và quan trọng nhất, lúa gạo Việt Nam có *bằng chứng bền vững* để bán giá cao hơn ra thế giới.

Đó là khoản đầu tư hạ tầng số mà ngành nông nghiệp Việt Nam cần — không phải để thay con người, mà để cho con người được tin.
