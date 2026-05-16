# TRÌNH BÀY Ý TƯỞNG ĐỔI MỚI SÁNG TẠO

**Dự án:** LocTroi AgriChain — Nền tảng tài chính chuỗi cung ứng nông nghiệp trên Blockchain

---

## 1. Ý tưởng cốt lõi

LocTroi AgriChain ra đời để giải quyết một nghịch lý lâu nay của ngành lúa Việt Nam: nông dân làm tốt nhưng vẫn nghèo, doanh nghiệp có nhiều khoản phải thu nhưng thiếu vốn lưu động, ngân hàng có vốn nhưng không dám cho nông nghiệp vay vì sợ rủi ro thiên tai. Nguyên nhân gốc rễ là **toàn chuỗi thiếu một sổ cái chung và một cơ chế đánh giá chuẩn xác từng hộ nông dân** — mỗi bên giữ một nửa thông tin, không bên nào tin bên nào.

Ý tưởng cốt lõi của dự án là xây dựng **một nền tảng app trên blockchain để minh bạch hóa toàn bộ thông tin vụ mùa giữa ba bên (nông dân, Lộc Trời, ngân hàng)**, đồng thời tạo ra một bộ máy chấm điểm chuẩn xác và khách quan cho từng hộ nông dân dựa trên cả hành vi tài chính lẫn chất lượng canh tác thực tế. Từ bộ điểm này, hệ thống tự đưa ra phần thưởng tương xứng: nông dân làm chuẩn được vay rẻ hơn, được thưởng giá lúa cao hơn, được thăng Hạng để vụ sau hưởng lợi nhiều hơn — tạo động lực kinh tế trực tiếp để duy trì canh tác bền vững mà không cần ai ép buộc.

Để biến ý tưởng này thành sản phẩm chạy thật, app được thiết kế với **bảy cơ chế nối tiếp nhau theo vòng đời vụ mùa**, mỗi cơ chế giải quyết một mắt xích trong chuỗi giá trị và sinh ra dữ liệu nuôi cơ chế kế tiếp.

---

## 2. Bảy cơ chế thực hiện ý tưởng

### Cơ chế 1 — Hộ chiếu Số nông dân

**Chức năng:** Cấp danh tính số bất biến cho nông dân, làm cơ sở để mọi giao dịch sau này có chủ thể rõ ràng.

**Đầu vào:**
- CCCD của nông dân (để hash thành danh tính ẩn danh)
- Thông tin cá nhân cơ bản: họ tên, số điện thoại, địa chỉ
- Thông tin canh tác: HTX trực thuộc, diện tích ruộng, giống lúa định trồng
- Chữ ký xác nhận của cán bộ 3 Cùng tại HTX

**Xử lý:**
- Cán bộ 3 Cùng mở app, nhập dữ liệu nông dân trên máy tính bảng
- Smart contract `createPassport()` chạy trong khoảng 1,5 giây: sinh mã định danh DID dạng `LT###`, tạo thẻ QR
- Ghi bản ghi `PASSPORT_CREATED` với hash bất biến lên sổ cái blockchain

**Đầu ra:**
- Một Hộ chiếu Số bất biến trên blockchain, thuộc sở hữu của chính nông dân
- Thẻ QR dùng xuyên suốt vòng đời vụ mùa (quét khi nhận vật tư, kiểm tra ruộng, cân lúa)
- Mặc định ở Hạng D với Điểm 0/1000, sẵn sàng tích lũy lịch sử giao dịch

**Dùng tiếp ở đâu:** Hộ chiếu Số là chủ thể được chấm điểm ở Cơ chế 2. Không có Hộ chiếu thì không có ai để đánh giá tín dụng, mọi cơ chế sau đều không thể chạy.

---

### Cơ chế 2 — Điểm kép và Vay theo Hạng

**Chức năng:** Đánh giá chuẩn xác từng hộ nông dân qua thang điểm 1.000, từ đó tự cấp điều kiện vay vốn tương xứng — không cần nhân viên ngân hàng phê duyệt thủ công.

**Đầu vào:**
- Điểm Tài chính (tối đa 400 điểm): tham gia hệ thống, ký nhận vật tư, trả nợ đúng hạn
- Điểm Canh tác (tối đa 600 điểm): dữ liệu drone (từ Cơ chế 3) và kết quả SRP (từ Cơ chế 4)
- Yêu cầu vật tư đầu vụ của nông dân: vụ mùa, danh sách vật tư, số lượng

**Xử lý:**
- Hệ thống tự cộng hai loại điểm thành Tổng điểm trên thang 1.000
- Tự suy ra Hạng theo ngưỡng: A (700-1000), B (500-699), C (300-499), D (0-299)
- Khi nông dân đặt vật tư, smart contract `requestSupply()` đọc Hạng từ blockchain, áp dụng bộ điều kiện tài chính tương ứng:
  - Hạng A: trả sau 100% với lãi 5,5%/năm
  - Hạng B: cọc 50% + trả sau 50% với lãi 7%/năm
  - Hạng C: trả tiền mặt 100%
  - Hạng D: cọc 30% bắt buộc với lãi 9%/năm
- UI tự khóa các phương thức của Hạng cao hơn — nông dân Hạng thấp không thể chọn điều kiện của Hạng cao

**Đầu ra:**
- Hạng tín dụng + điều kiện vay được áp dụng tự động
- Bản ghi `SUPPLY_REQUESTED` và `SUPPLY_APPROVED` ghi sổ
- Đơn vật tư được chia thành các lô riêng, đẩy vào hàng chờ giao của tài xế

**Dùng tiếp ở đâu:** Đơn vật tư đã duyệt được chuyển sang khâu giao hàng vật lý. Sau khi giao xong, hệ thống sinh khoản phải thu (AR) — đây là nguyên liệu đầu vào cho Cơ chế 5 (token hóa). Đồng thời, Hạng quyết định lãi suất giải ngân ở Cơ chế 5.

---

### Cơ chế 3 — Drone AI quét đồng

**Chức năng:** Thu thập dữ liệu canh tác định lượng, khách quan, liên tục — thay vì khảo sát giấy thủ công 1-2 lần/vụ.

**Đầu vào:**
- Lịch bay định kỳ trong vụ (3 lần ở tuần 4, 7, 10)
- Tọa độ ruộng nông dân (từ Hộ chiếu Số)
- Drone công nghiệp DJI Agras T40 + phi công có giấy phép UAV (theo Thông tư 35/2017/TT-BQP)
- API Google Gemini Vision

**Xử lý:**
- Phi công mở tab "Drone Upload", chọn ruộng, bấm "Bay"
- Drone tự cất cánh, bay theo đường hình chữ S quét toàn bộ diện tích trong khoảng 15 phút
- Chụp 3 ảnh đa phổ ở 3 vị trí khác nhau trong ruộng
- Mỗi ảnh được gửi qua Gemini API → AI trả về JSON metric với 4 chỉ số định lượng:
  - Tỷ lệ phủ xanh (%)
  - Chỉ số NDVI (sức khỏe cây)
  - Tỷ lệ úa nâu (%)
  - Phát hiện sâu bệnh (đạo ôn, khô vằn, bạc lá, sâu cuốn lá)
- Phi công xem kết quả, ký số xác nhận

**Đầu ra:**
- 3 báo cáo drone với chỉ số định lượng cho mỗi ruộng
- Bản ghi `DRONE_REPORT` ghi sổ với hash IPFS của ảnh (ảnh có thể audit lại bất kỳ lúc nào)
- Notification gửi đến cán bộ 3 Cùng để xử lý tiếp ở Cơ chế 4

**Dùng tiếp ở đâu:** Báo cáo drone là **lớp bằng chứng số 1** trong cơ chế kiểm tra SRP ba lớp (Cơ chế 4). Đồng thời, các chỉ số định lượng nuôi trực tiếp Điểm Canh tác trong Cơ chế 2.

---

### Cơ chế 4 — AI chấm SRP ba lớp bằng chứng

**Chức năng:** Tự động hóa việc đánh giá chuẩn lúa bền vững SRP với cơ chế kiểm tra chéo chống gian lận — tổng hợp ba nguồn dữ liệu độc lập rồi mới ra kết luận.

**Đầu vào:**
- Lớp 1: Ảnh drone đa phổ (từ Cơ chế 3) — góc nhìn từ trên cao, diện rộng
- Lớp 2: Ảnh thực địa cận cảnh do cán bộ chụp tại ruộng — chi tiết mặt đất
- Lớp 3: Chữ ký số của cán bộ kỹ thuật — xác nhận trách nhiệm cá nhân
- 8 tiêu chí SRP rút gọn từ 41 tiêu chí chuẩn quốc tế

**Xử lý:**
- Cán bộ 3 Cùng chọn ruộng cần kiểm tra → app tự kéo toàn bộ drone reports đã có
- Cán bộ xuống đồng, chụp 2-3 ảnh thực địa, upload lên app
- AI Gemini phân tích tổng hợp cả hai loại ảnh theo nguyên tắc **AND nghiêm**: một tiêu chí chỉ được tick pass nếu **mọi ảnh** đều cho thấy đạt — ngăn chặn cán bộ chỉ chụp những phần tốt của ruộng
- AI tự tick 4 trên 8 ô SRP có thể chấm được từ ảnh (mật độ sạ, quản lý nước, phòng bệnh, bón phân)
- Cán bộ tick thủ công 4 ô còn lại cần kiểm tra mắt người (giống lúa, thuốc BVTV trong danh mục, thời gian cách ly, an toàn lao động)
- Cán bộ ký số xác nhận

**Đầu ra:**
- Bản ghi `FIELD_INSPECTION` với metadata đan chéo 3 lớp: `drone#xxx · field#xxx · sig#xxx` — không thể giả mạo
- Điểm Canh tác mới được cập nhật vào Hộ chiếu Số của nông dân
- Kết quả pass/fail SRP làm điều kiện kích hoạt Cơ chế 5

**Dùng tiếp ở đâu:** Pass SRP là **điều kiện tiên quyết** để khoản phải thu được token hóa ở Cơ chế 5. Không pass SRP thì không có token, không có token thì không có vốn từ ngân hàng. Đồng thời, Điểm Canh tác cập nhật quay về nuôi Hạng ở Cơ chế 2 cho vụ sau.

---

### Cơ chế 5 — Token hóa khoản phải thu và Liên minh Ngân hàng

**Chức năng:** Biến khoản phải thu nông nghiệp từ tài sản chết trong sổ kế toán thành dòng vốn sống được giao dịch giữa nhiều ngân hàng.

**Đầu vào:**
- Hóa đơn AR đã được giao và ký số 2 bên (từ Cơ chế 2)
- Điều kiện: AR đã pass Oracle SRP (từ Cơ chế 4)
- Metadata kèm theo: số dư nợ, ngày đáo hạn, Điểm Canh tác, hash ảnh ruộng IPFS, mã hợp đồng bảo hiểm, cam kết bảo lãnh của Lộc Trời
- Hạng tín nhiệm của nông dân (từ Cơ chế 2)

**Xử lý:**
- Quản lý Lộc Trời mở tab "Hoá đơn", bấm "Xác nhận thực địa" trên hóa đơn chờ
- Oracle SRP chạy animation khoảng 5 giây để kiểm tra điều kiện
- Pass → smart contract đúc NFT mã `TKN-XXXXXX` mang toàn bộ metadata
- Quản lý bấm "Chào bán" → token xuất hiện đồng thời trên dashboard 3 ngân hàng: VietinBank, HSBC, Agribank
- Hệ thống tự đề xuất lãi suất theo KPI tín nhiệm:
  - KPI > 80/100 → 5,5%/năm
  - KPI 60-80/100 → 7%/năm
  - KPI < 60/100 → 9%/năm
- Ngân hàng nào duyệt nhanh nhất được nhận token và trả tiền

**Đầu ra:**
- NFT đại diện cho AR được bán cho ngân hàng
- Lộc Trời nhận tiền giải ngân vào tài khoản ngay
- Chuỗi bản ghi `INVOICE_TOKENIZED` → `SCF_SUBMITTED` → `LOAN_DISBURSED`
- Tổng hạn mức cam kết của liên minh ngân hàng: 50 tỷ đồng

**Dùng tiếp ở đâu:** Lộc Trời có vốn tươi để tái đầu tư cho vụ kế tiếp (giải phóng vốn lưu động bị đóng băng). Ngân hàng giữ token chờ đến cuối vụ tất toán ở Cơ chế 7. Nếu rủi ro thiên tai xảy ra trong giai đoạn này, Cơ chế 6 được kích hoạt.

---

### Cơ chế 6 — Bảo hiểm 80/20 chống thiên tai

**Chức năng:** Bảo vệ ngân hàng trước rủi ro thiên tai — đảm bảo ngân hàng luôn thu đủ 100% gốc lãi dù nông dân không trả được, từ đó giữ niềm tin để liên minh dám cam kết hạn mức lớn.

**Đầu vào:**
- Token AR đang ở trạng thái "Đã giải ngân" (từ Cơ chế 5)
- Hợp đồng bảo hiểm tham số đính kèm token (mã `INS-XXXXX`)
- Tín hiệu thiên tai từ Oracle IoT (cảm biến mưa lũ, độ mặn, độ ẩm + UAV xác minh hình ảnh)
- Cam kết bảo lãnh recourse 20% của Lộc Trời

**Xử lý:**
- Ngân hàng phát hiện hóa đơn có dấu hiệu default, bấm "Khai báo thiên tai" trên invoice
- Oracle IoT chạy animation xác minh sự kiện tại tọa độ ruộng trong khoảng 2,5 giây
- Sau khi xác minh đạt ngưỡng định trước, smart contract atomic ghi 3 bản ghi **đồng thời** trong cùng một giao dịch:
  - `LOAN_DEFAULT` — đánh dấu khoản vay default
  - `INSURANCE_TRIGGERED` — Quỹ Bảo hiểm chi 80% dư nợ
  - `RECOURSE_SETTLED` — Lộc Trời chi 20% còn lại
- Nguyên tắc atomic: nếu một trong ba thất bại, cả ba bị hủy — không có trường hợp bảo hiểm chi mà recourse không chi

**Đầu ra:**
- Ngân hàng nhận đủ 100% dư nợ (80% từ Quỹ Bảo hiểm + 20% từ Lộc Trời) trong vài ngày
- Nông dân không bị nợ xấu trong hệ thống, chỉ bị giảm Điểm Canh tác do mất sản lượng
- Modal hiển thị waterfall phân bổ rõ ràng cho ngân hàng audit

**Dùng tiếp ở đâu:** Cơ chế này là tấm khiên bảo vệ toàn hệ thống. Nó giữ vững niềm tin của ngân hàng để họ tiếp tục cấp vốn cho các vụ sau ở Cơ chế 5 — vòng tuần hoàn không bị đứt gãy bởi thiên tai. Nông dân vẫn có thể tham gia vụ sau qua Cơ chế 2 với Điểm Canh tác đã giảm.

---

### Cơ chế 7 — Thưởng giá SRP và Thăng Hạng

**Chức năng:** Khép vòng tuần hoàn bằng cách biến chứng nhận canh tác bền vững thành tiền mặt thực tế cộng với điểm tín dụng cho vụ sau — tạo động lực kinh tế trực tiếp để nông dân duy trì canh tác chuẩn.

**Đầu vào:**
- Lúa thu hoạch của nông dân
- Dữ liệu cân điện tử: sản lượng (kg), độ ẩm (%), tỷ lệ tạp chất (%)
- Điểm Canh tác hiện tại của nông dân (từ Cơ chế 4)
- Công nợ vật tư đầu vụ (các hóa đơn AR chưa tất toán)
- Giá bao tiêu cơ sở của Lộc Trời

**Xử lý:**
- Cán bộ thu mua mở tab "Thu hoạch", chọn hộ đủ điều kiện
- Cân điện tử tại ruộng tự ghi 3 chỉ số vào app (animation ~2 giây)
- Smart contract `harvestSettlement()` tính tự động:
  - Thưởng SRP theo Điểm Canh tác:
    - ≥ 80% (480-600 điểm) → **+500 đ/kg**
    - 60-80% (360-479 điểm) → +200 đ/kg
    - < 60% → 0 đ
  - Doanh thu = Sản lượng × (Giá bao tiêu + Thưởng SRP)
  - Tiền nông dân nhận = Doanh thu − Công nợ vật tư
- Cộng +300 điểm Tài chính cho nông dân (+200 vì giao đủ sản lượng cam kết + +100 vì trả nợ đúng hạn)
- Kiểm tra ngưỡng thăng Hạng dựa trên tổng điểm mới

**Đầu ra:**
- Nông dân nhận tiền ròng vào tài khoản (sau khi trừ công nợ)
- Điểm Tài chính tăng +300, có thể thăng Hạng cho vụ kế tiếp
- Chuỗi bản ghi `HARVEST_SETTLED` → `CREDIT_HARVEST` → `TIER_UPGRADE` (nếu vượt ngưỡng)
- Toàn bộ hóa đơn AR liên quan đóng sang trạng thái "Đã tất toán"
- Ngân hàng nhận tiền tất toán khoản vay đã giải ngân ở Cơ chế 5

**Dùng tiếp ở đâu:** Hạng mới cập nhật vào Hộ chiếu Số → vụ sau nông dân quay về Cơ chế 2 với điều kiện vay tốt hơn (lãi rẻ hơn, được trả sau nhiều hơn) → có lợi nhuận cao hơn → tiếp tục động lực canh tác chuẩn. Vòng tuần hoàn khép lại và tự nhân rộng — hộ làm tốt thấy lợi ích kinh tế rõ ràng, các hộ khác noi theo, hệ thống mở rộng mà không tốn ngân sách marketing.

---

## 3. Vì sao bảy cơ chế tạo thành một hệ thống đổi mới

Bảy cơ chế trên không phải bảy tính năng rời rạc ghép vào — mà là **bảy mắt xích nối tiếp nhau** trong cùng một dây chuyền kinh tế khép kín. Mỗi cơ chế **đầu ra** của cái này là **đầu vào** của cái kế tiếp:

```
[CC1] Hộ chiếu Số ──► Chủ thể chấm điểm
                                │
                                ▼
[CC2] Điểm kép · Vay theo Hạng ──► Hạng + Điều kiện vay + Hóa đơn AR
                                                          │
                                                          ▼
[CC3] Drone AI ──┐                                  ──────┘
                 ▼                                  │
[CC4] AI SRP 3 lớp ──► Điểm Canh tác + Pass SRP ──┘
                                │                  │
                                ▼                  ▼
            (về CC2 vụ sau)   [CC5] Token hóa AR · 3 Ngân hàng
                                            │
                                ┌───────────┴────────────┐
                                │                        │
                            (bình thường)          (thiên tai)
                                │                        │
                                │                        ▼
                                │              [CC6] Bảo hiểm 80/20
                                │                        │
                                ▼                        ▼
                        [CC7] Thưởng giá · Thăng Hạng ◄──┘
                                            │
                                            ▼
                                  (Quay về CC2 cho vụ sau)
```

Đặc tính then chốt của hệ thống này là **vòng phản hồi tự nhân**: cơ chế 7 (thưởng giá) cập nhật điểm tín dụng để ảnh hưởng đến cơ chế 2 (điều kiện vay) cho vụ kế tiếp. Càng vận hành lâu, hệ thống càng tích lũy dữ liệu, càng chấm điểm chính xác, càng định giá đúng rủi ro. Mỗi bên tham gia (nông dân, Lộc Trời, ngân hàng, bảo hiểm) đều có động lực kinh tế tự thân để tuân thủ — không cần ép buộc bằng quy định, không cần ngân sách tuyên truyền.

Kiến trúc bảy cơ chế này không chỉ áp dụng cho lúa. Mọi chuỗi nông sản hội đủ ba điều kiện (có doanh nghiệp đầu chuỗi đóng vai bảo lãnh, có chứng nhận chuẩn quốc tế, có khả năng đo đạc bằng IoT/AI) đều có thể triển khai mô hình tương tự — lộ trình mở rộng tự nhiên là **cà phê (4C) → điều (UTZ) → tiêu (RA) → ca cao (Fair Trade)**, biến LocTroi AgriChain thành mô hình mẫu cho toàn bộ nền nông nghiệp số của Việt Nam.

---

*— Hết phần "Trình bày Ý tưởng Đổi mới Sáng tạo" —*
