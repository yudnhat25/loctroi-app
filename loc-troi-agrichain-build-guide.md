# Lộc Trời AgriChain — AI Build Guide v1.0

> **Mục đích file**: Đây là tài liệu instruction dành cho AI agent (Claude, GPT, Cursor agent, v.v.) hoặc developer thực thi việc build prototype web/mobile cho hệ thống Lộc Trời AgriChain — nền tảng Blockchain SCF cho chuỗi cung ứng lúa gạo. File chứa toàn bộ context, kiến trúc, data model, smart contract spec, API spec, screen spec, workflow, và acceptance criteria. Đọc file này tuần tự từ trên xuống dưới trước khi viết bất kỳ dòng code nào.

---

## Mục lục

0. [Tóm tắt thực thi](#0-tóm-tắt-thực-thi)
1. [Bối cảnh & Mục tiêu Project](#1-bối-cảnh--mục-tiêu-project)
2. [Stakeholder & User Personas](#2-stakeholder--user-personas)
3. [Tech Stack](#3-tech-stack)
4. [Kiến trúc Hệ thống](#4-kiến-trúc-hệ-thống)
5. [Data Model](#5-data-model)
6. [Smart Contract Specifications](#6-smart-contract-specifications)
7. [API Specifications](#7-api-specifications)
8. [Tier & Scoring Engine](#8-tier--scoring-engine)
9. [Screen Specifications](#9-screen-specifications)
10. [Workflow Implementation 6 pha](#10-workflow-implementation-6-pha)
11. [Mock Data & Test Scenarios](#11-mock-data--test-scenarios)
12. [UI/UX Design System](#12-uiux-design-system)
13. [Build Order — 3 Sprint](#13-build-order--3-sprint)
14. [Demo Script](#14-demo-script)
15. [Definition of Done](#15-definition-of-done)
16. [Out of Scope](#16-out-of-scope)
17. [Appendix](#appendix)

---

## 0. Tóm tắt thực thi

**Lộc Trời AgriChain** là nền tảng Consortium Blockchain (Hyperledger Fabric) số hóa toàn bộ vòng đời khoản phải thu trong chuỗi cung ứng lúa gạo của Tập đoàn Lộc Trời. Nền tảng kết nối 4 nhóm actor — nông dân, kỹ thuật viên 3 Cùng, ban quản trị Lộc Trời, ngân hàng liên minh — vào một sổ cái chung, từ đó:

- **Token hóa khoản phải thu** sau khi vật tư được giao, tạo Asset Token AR có thể đem ra marketplace cho ngân hàng giải ngân tự động (thay vì chờ thẩm định thủ công vài tháng).
- **Tính điểm uy tín 2 tầng** (Credit Score on-chain trustless 40%, Farming Score có Oracle người 60%) để xếp Tier nông dân (A/B/C/D), từ đó quyết định điều khoản thanh toán và premium SRP.
- **Tự động hóa settlement cuối vụ** qua smart contract: tính tiền theo sản lượng × (giá bao tiêu + premium SRP) − công nợ vật tư.

**Phạm vi prototype**: build được demo end-to-end của 1 vụ mùa cho 1 nông dân + 1 ngân hàng đối tác, với 4 app/portal (2 mobile + 2 web), 9 chaincode function, và mock Oracle (drone, IoT, cân điện tử). **Không** build production-ready (không cần load test, không cần multi-tenant, không cần tích hợp SAP thật).

**Thời lượng**: 12 tuần, 3 sprint × 4 tuần.

---

## 1. Bối cảnh & Mục tiêu Project

### 1.1 Vấn đề thực tế

Tập đoàn Lộc Trời (Việt Nam, niêm yết HOSE: LTG) là doanh nghiệp nông nghiệp với 256.000 ha vùng nguyên liệu và 200.000+ hộ nông dân ĐBSCL. Mô hình kinh doanh đặc thù: **ứng trước vật tư** (giống, phân, thuốc) cho nông dân đầu vụ → bao tiêu lúa cuối vụ. Hệ quả:

- Nợ ngắn hạn cuối 2023: **8.312 tỷ đồng** (tăng 52% YoY)
- Chi phí lãi vay 2023: **582 tỷ đồng** (gấp 2.5× 2022)
- Lợi nhuận sau thuế hợp nhất 2023 chỉ còn **16.5 tỷ đồng** sau kiểm toán

Nguyên nhân cốt lõi: **khoản phải thu** từ nông dân tồn tại dạng chứng từ giấy rời rạc, không thanh khoản, không thế chấp được → Lộc Trời phải dùng đòn bẩy nợ ngắn hạn lãi cao để tài trợ vốn lưu động.

### 1.2 Giá trị giải pháp

AgriChain chuyển khoản phải thu thành **Asset Token** trên Hyperledger Fabric. Token mang đầy đủ bằng chứng số (ảnh drone, checklist SRP, chữ ký 3 Cùng, GPS, timestamp) → ngân hàng có thể bỏ thẩm định thủ công, giải ngân trong vài giờ thay vì vài tháng. Lộc Trời chuyển từ vay nợ ngân hàng truyền thống sang **Supply Chain Financing (SCF)** dựa trên dòng tiền thực, giảm trực tiếp chi phí tài chính.

**Mô phỏng tài chính (kịch bản cơ sở)**:
- Đầu tư: 20 tỷ VNĐ (24 tháng triển khai)
- Khơi thông 20% dư nợ SCF ≈ 1.662 tỷ
- Tiết kiệm lãi vay sau thuế: ~100 tỷ/năm
- Payback period: ~2.4 tháng
- ROI 3 năm: ~1.385%

### 1.3 Phạm vi MVP (Minimum Viable Product)

| Hạng mục | In Scope | Out of Scope |
|---|---|---|
| Blockchain | Hyperledger Fabric local network (1 org × 2 peer) | Multi-org consortium production |
| Smart contracts | 9 chaincode function | Carbon credit, ESG reporting |
| Frontend | Farmer mobile (RN), 3 Cùng mobile (RN), 2 web portals (Next.js) | Public traceability portal cho consumer |
| Oracle | Mock drone + mock IoT (upload manual) | Tích hợp DJI thật, IoT realtime |
| Banking | Mock core banking API | Tích hợp ngân hàng thật |
| ERP | Mock SAP API | Tích hợp SAP S/4HANA |
| Bảo hiểm | Mock parametric trigger | Hợp đồng bảo hiểm thật |
| Data | Seed 10 farmer, 1 HTX, 1 bank | Full 200K farmer |

### 1.4 Success Criteria (Definition of Success)

Demo 5-7 phút chạy được end-to-end:
1. Nông dân onboard → nhận Hộ chiếu số QR
2. Đặt vật tư → smart contract duyệt theo Tier
3. Giao vật tư + 2 bên ký → mint Asset Token AR
4. Bank thấy token trên marketplace → duyệt → giải ngân
5. 3 Cùng kiểm tra SRP → Farming Score cập nhật
6. Thu hoạch → settlement tự động → Tier nâng cấp

---

## 2. Stakeholder & User Personas

### 2.1 Persona 1 — Nông dân (Anh Tư)

- **Demographic**: Nam, 45 tuổi, ĐBSCL, có smartphone Android tầm trung
- **Tech literacy**: Trung bình thấp, dùng được Zalo và Facebook, không quen web app phức tạp
- **Pain points**: Thiếu vốn đầu vụ, phụ thuộc đại lý cho mua chịu, không biết giá lúa cuối vụ
- **Goals**: Mua được vật tư đầu vụ không cần tiền mặt, bán lúa giá tốt cuối vụ, có "uy tín số" để dễ vay vốn
- **Devices**: Mobile only (Android, màn hình 5.5"-6.5")
- **Constraints**: Sóng yếu, ngại nhập liệu nhiều, ngại đọc text dài

### 2.2 Persona 2 — Kỹ thuật viên 3 Cùng (Chị Lan)

- **Demographic**: Nữ, 32 tuổi, kỹ sư nông nghiệp Lộc Trời, sống cùng vùng nguyên liệu
- **Tech literacy**: Tốt, đã quen dùng app nội bộ Lộc Trời và iPad cho công việc
- **Pain points**: Phải làm checklist giấy, nhập liệu lại lên SAP, mất thời gian đối soát
- **Goals**: Kiểm tra ruộng nhanh, ghi nhận chính xác, đồng bộ ngay lên hệ thống
- **Devices**: Mobile primary (Android/iOS), thỉnh thoảng tablet
- **Constraints**: Offline-first vì vùng sóng kém, cần camera + GPS chính xác

### 2.3 Persona 3 — Ban điều hành Lộc Trời (Anh Hùng — CFO)

- **Demographic**: Nam, 50 tuổi, làm việc tại văn phòng TP.HCM
- **Tech literacy**: Cao, đọc báo cáo SAP hằng ngày, hiểu blockchain ở mức khái niệm
- **Pain points**: Áp lực dòng tiền, không nhìn được real-time trạng thái khoản phải thu theo HTX
- **Goals**: Dashboard tổng quan dòng tiền SCF, drill-down rủi ro công nợ, báo cáo cho hội đồng
- **Devices**: Web (desktop primary, laptop), thỉnh thoảng mobile
- **Constraints**: Cần báo cáo xuất Excel/PDF được

### 2.4 Persona 4 — Banker liên minh (Chị Hà — MB Bank)

- **Demographic**: Nữ, 38 tuổi, trưởng phòng tín dụng doanh nghiệp lớn
- **Tech literacy**: Cao, quen dùng nền tảng tín dụng nội bộ MB
- **Pain points**: Thẩm định hồ sơ SCF nông nghiệp thiếu bằng chứng số → rủi ro cao → từ chối nhiều
- **Goals**: Có bằng chứng số đáng tin cậy để giải ngân nhanh, đa dạng portfolio, sinh lời
- **Devices**: Web (desktop primary)
- **Constraints**: Cần audit trail đầy đủ cho compliance

---

## 3. Tech Stack

### 3.1 Blockchain Layer

| Component | Technology | Version | Lý do chọn |
|---|---|---|---|
| Blockchain platform | Hyperledger Fabric | 2.5.x | Consortium, permissioned, channels riêng, chaincode Go/Node |
| BaaS (MVP) | Kaleido Free Tier hoặc local Docker Compose | latest | Rút ngắn setup dev environment |
| Chaincode language | Go (primary), JavaScript fallback | Go 1.21+ | Performance tốt nhất với Fabric |
| Wallet/Identity | Fabric CA + MSP | bundled | Permissioned identity |

**Decision rule**: Nếu dev environment local, dùng Docker Compose theo `fabric-samples`. Nếu deploy cloud demo, dùng Kaleido (free tier 30 ngày đủ cho demo).

### 3.2 Backend

| Component | Technology | Lý do |
|---|---|---|
| Application server | Node.js + Express (hoặc Fastify) | Quen thuộc, ecosystem lớn |
| Fabric SDK | `fabric-network` npm package | Official SDK |
| Auth | JWT + bcrypt | Standard |
| ORM | Prisma | Type-safe, migration tốt |
| Database | PostgreSQL 15+ | Off-chain master data |
| Cache | Redis 7+ | Session + token cache |
| Storage off-chain | IPFS via Pinata SDK | Lưu ảnh drone, ảnh thực địa, CCCD |
| Queue | BullMQ (Redis-based) | Async chaincode submission |

### 3.3 Frontend Web

| Component | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand (cho local) + React Query (cho server state) |
| Form | React Hook Form + Zod |
| Charts | Recharts |
| Maps | Mapbox GL JS hoặc Leaflet |
| Icons | Lucide React |

### 3.4 Frontend Mobile

| Component | Technology |
|---|---|
| Framework | React Native + Expo SDK 50+ |
| Navigation | Expo Router |
| Styling | NativeWind (Tailwind RN) |
| Camera | expo-camera |
| Location | expo-location |
| Offline | expo-sqlite + custom sync layer |
| Crypto | react-native-crypto-js (cho ký số demo) |
| QR | expo-barcode-scanner + react-native-qrcode-svg |

### 3.5 DevOps

| Component | Technology |
|---|---|
| Container | Docker + Docker Compose |
| Orchestration (production) | Kubernetes (out of MVP scope) |
| CI/CD | GitHub Actions |
| Monitoring | Loki + Grafana (optional) |

### 3.6 Cấu trúc thư mục monorepo

```
loc-troi-agrichain/
├── apps/
│   ├── farmer-mobile/        # React Native (Expo)
│   ├── three-cung-mobile/    # React Native (Expo)
│   ├── admin-web/            # Next.js
│   ├── bank-web/             # Next.js
│   └── api/                  # Node.js Express backend
├── packages/
│   ├── shared-types/         # TypeScript interfaces dùng chung
│   ├── ui/                   # Shared components (web)
│   └── chaincode-client/     # Fabric SDK wrapper
├── chaincode/
│   ├── agrichain/            # Go chaincode
│   └── test/                 # Chaincode tests
├── infra/
│   ├── fabric-network/       # Docker Compose Fabric setup
│   └── scripts/              # Seed, migration, etc.
└── docs/
    └── this-file.md
```

---

## 4. Kiến trúc Hệ thống

### 4.1 Sơ đồ kiến trúc 4 lớp

```
┌─────────────────────────────────────────────────────────┐
│ Lớp 4 — Application Layer                               │
│ ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐    │
│ │ Farmer   │ │ 3 Cùng   │ │ LT      │ │ Bank     │    │
│ │ Mobile   │ │ Mobile   │ │ Admin   │ │ Portal   │    │
│ └────┬─────┘ └────┬─────┘ └────┬────┘ └────┬─────┘    │
└──────┼────────────┼────────────┼───────────┼──────────┘
       │            │            │           │
       └────────────┴─────┬──────┴───────────┘
                          │ REST API (HTTPS)
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Lớp 3 — Backend API + Smart Contract Gateway           │
│  Node.js Express → Fabric SDK → Chaincode               │
│  • Auth (JWT)                                           │
│  • Business logic (scoring, tier, validation)           │
│  • Off-chain DB (PostgreSQL) cho master data           │
│  • Queue (BullMQ) cho async tx                         │
└──────┬─────────────────────────────────────────┬────────┘
       │                                         │
       ▼                                         ▼
┌──────────────────────┐              ┌─────────────────────┐
│ Lớp 2 — Blockchain  │              │ Lớp 1 — Oracle Layer│
│ Hyperledger Fabric  │              │ • Drone images      │
│ • 9 chaincode fn    │◄─────────────┤ • IoT scale (cân)   │
│ • Asset Token       │   off-chain  │ • GPS               │
│ • Genesis Records   │     hash     │ • Weather API mock  │
│ • Score/Tier ledger │              │ • IPFS (Pinata)     │
└──────────────────────┘              └─────────────────────┘
```

### 4.2 Data Flow tổng quát

**Flow đi từ thực địa lên chain**:
1. User action (ví dụ 3 Cùng tick checklist SRP) → mobile app
2. App gọi API `POST /api/inspections`
3. Backend validate payload → upload ảnh lên IPFS → nhận `cid`
4. Backend ghép payload + `cid` thành transaction proposal
5. Backend submit qua Fabric SDK → chaincode `recordInspection()` chạy
6. Chaincode cập nhật state DB → emit event
7. Backend nghe event → cập nhật PostgreSQL (off-chain mirror) → trả response cho app

**Flow đi từ chain xuống app**:
1. App load màn hình → gọi API `GET /api/farmers/:id`
2. Backend đọc PostgreSQL mirror (nhanh) → trả về
3. Nếu cần verify thật trên chain → backend gọi chaincode `getFarmer()` → trả về cả `txHash` để app hiển thị

### 4.3 Integration Points (Mock cho MVP)

| External System | Mock Strategy |
|---|---|
| SAP S/4HANA | REST API mock trả về order data tĩnh từ JSON |
| Drone DJI | Manual upload ảnh qua API, gán plot_id |
| Cân điện tử IoT | Manual nhập sản lượng qua 3 Cùng app |
| Weather Oracle | Cron job giả lập weather event mỗi 5 phút |
| Bank Core Banking | Mock endpoint `POST /bank-mock/disburse` |
| Control Union (audit) | Pre-seed signed certificates trong DB |

---

## 5. Data Model

### 5.1 On-chain entities (Hyperledger Fabric state)

Toàn bộ entity on-chain định nghĩa dưới dạng TypeScript interface (cho shared-types package). Chaincode Go sẽ implement struct tương ứng.

```typescript
// packages/shared-types/src/blockchain.ts

interface Farmer {
  id: string;                    // LT-NDxxxxxx, immutable
  cccdHash: string;              // SHA-256 of CCCD, raw không lưu on-chain
  hashedName: string;            // Hash để bảo mật
  hxtId: string;                 // ID hợp tác xã
  region: string;                // "An Giang", "Đồng Tháp", ...
  primaryRiceVariety: string[];  // ["OM5451", "LT28"]
  farmingScore: number;          // 0-600
  creditScore: number;           // -∞ to 1000 (có thể âm)
  overallScore: number;          // computed: 0.6*FS + 0.4*CS
  tier: 'A' | 'B' | 'C' | 'D';
  digitalPassportCID: string;    // IPFS CID của file hộ chiếu PDF
  createdAt: number;             // unix timestamp
  lastUpdatedTx: string;         // txHash gần nhất
}

interface Order {
  id: string;                    // ORD-xxxxxxxxxx
  farmerId: string;
  seasonCode: string;            // "DX-2026-2027" (Đông Xuân)
  items: OrderItem[];
  totalAmount: number;           // VNĐ
  paymentTerm: PaymentTerm;
  status: OrderStatus;
  contractCID: string;           // IPFS CID hợp đồng số
  createdAt: number;
  approvedAt?: number;
  deliveredAt?: number;
  settledAt?: number;
}

interface OrderItem {
  sku: string;                   // "GIONG-LT28", "PHAN-NPK", "THUOC-XYZ"
  name: string;
  quantity: number;
  unit: string;                  // "kg", "L"
  unitPrice: number;
}

type PaymentTerm =
  | 'POST_PAID_100'    // Tier A: trả sau 100%
  | 'POST_PAID_50'     // Tier B: trả sau 50%, trả ngay 50%
  | 'CASH_FULL'        // Tier C: tiền mặt 100%
  | 'DEPOSIT_30';      // Tier D: cọc 30% trước

type OrderStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DELIVERED'
  | 'TOKENIZED'        // sau khi mint AR token
  | 'FINANCED'         // sau khi bank giải ngân
  | 'HARVESTED'
  | 'SETTLED'
  | 'CANCELLED';

interface AssetToken {
  id: string;                    // TKN-xxxxxxxxxx
  orderId: string;
  farmerId: string;
  faceValue: number;             // giá trị AR — VNĐ
  status: TokenStatus;
  bankId?: string;               // sau khi được duyệt
  disbursedAt?: number;
  disbursedAmount?: number;      // sau chiết khấu
  discountRate?: number;         // ví dụ 0.075 = 7.5%/năm
  createdAt: number;
  evidenceCID: string;           // IPFS CID gói bằng chứng (zip)
}

type TokenStatus =
  | 'LISTED'           // đang chào bán trên marketplace
  | 'APPROVED'         // bank đã duyệt
  | 'DISBURSED'        // bank đã giải ngân
  | 'SETTLED';         // đã tất toán cho bank

interface Inspection {
  id: string;
  farmerId: string;
  plotId: string;                // mã ruộng
  seasonCode: string;
  inspectorId: string;           // 3 Cùng technician ID
  srpChecklist: SRPChecklistItem[];  // 41 items
  fieldPhotosCIDs: string[];
  dronePhotosCIDs: string[];
  ndviValue?: number;            // từ drone, 0-1
  inspectorSignature: string;    // base64 signature
  gpsCoords: { lat: number; lng: number };
  timestamp: number;
  txHash: string;
}

interface SRPChecklistItem {
  code: string;                  // "SRP-1.1", "SRP-2.3", ...
  category: string;              // "Seed", "Fertilizer", "Pesticide", ...
  passed: boolean;
  notes?: string;
  evidencePhotoCID?: string;
}

interface ScoreUpdate {
  farmerId: string;
  type: 'CREDIT' | 'FARMING';
  delta: number;                 // ví dụ +10, -50
  reason: string;                // "delivery_confirmed", "srp_violation"
  triggeredBy: string;           // function name + tx
  timestamp: number;
}

interface Settlement {
  id: string;
  orderId: string;
  farmerId: string;
  yieldKg: number;
  qualityGrade: 'A' | 'B' | 'C';
  basePrice: number;             // VNĐ/kg
  premiumPerKg: number;          // theo Farming Score tier
  grossAmount: number;           // yield × (base + premium)
  debtDeducted: number;          // công nợ vật tư
  insurancePayout?: number;      // nếu parametric trigger
  netToFarmer: number;
  netToBank: number;             // tất toán SCF
  timestamp: number;
}
```

### 5.2 Off-chain entities (PostgreSQL)

Off-chain DB là **mirror** + **master data** không cần on-chain. Schema Prisma:

```prisma
model FarmerProfile {
  id              String   @id           // matching on-chain Farmer.id
  fullName        String                   // raw, encrypted at rest
  cccd            String                   // raw, encrypted at rest
  phone           String
  address         String
  hxtId           String
  
  // metadata
  totalArea       Float                    // hectare
  plotBoundaries  Plot[]
  
  // mirror from chain
  farmingScore    Int      @default(0)
  creditScore     Int      @default(0)
  tier            String   @default("D")
  digitalPassportCID String?
  
  // audit
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Plot {
  id              String   @id @default(cuid())
  farmerId        String
  farmer          FarmerProfile @relation(fields: [farmerId], references: [id])
  
  name            String                    // "Ruộng Tây", "Ruộng Đông"
  area            Float                    // hectare
  geoJson         Json                      // polygon coordinates
  centerLat       Float
  centerLng       Float
}

model OrderMirror {
  id              String   @id              // matching on-chain Order.id
  farmerId        String
  seasonCode      String
  totalAmount     Float
  paymentTerm     String
  status          String
  contractCID     String?
  
  items           Json                      // array of OrderItem
  
  createdAt       DateTime @default(now())
  approvedAt      DateTime?
  deliveredAt     DateTime?
  settledAt       DateTime?
}

model InspectionMirror {
  id              String   @id
  farmerId        String
  plotId          String
  seasonCode      String
  inspectorId     String
  
  passedCount     Int                      // số tiêu chí SRP đạt
  totalCount      Int @default(41)
  ndviValue       Float?
  
  fieldPhotos     String[]                 // array of IPFS CIDs
  dronePhotos     String[]
  
  gpsLat          Float
  gpsLng          Float
  timestamp       DateTime
  txHash          String
}

model BankRelation {
  id              String   @id @default(cuid())
  name            String                    // "MB Bank", "HSBC"
  organizationId  String                    // MSP ID
  apiEndpoint     String                    // mock core banking URL
  active          Boolean  @default(true)
}

model TokenMarketplace {
  tokenId         String   @id
  orderId         String
  farmerId        String
  faceValue       Float
  status          String
  listedAt        DateTime @default(now())
  approvedBankId  String?
  disbursedAt     DateTime?
  disbursedAmount Float?
}

model AuditLog {
  id              String   @id @default(cuid())
  actorId         String
  actorType       String                    // "FARMER", "TECHNICIAN", "ADMIN", "BANKER"
  action          String                    // "CREATE_PASSPORT", "SIGN_DELIVERY"
  entityType      String
  entityId        String
  payload         Json
  txHash          String?
  createdAt       DateTime @default(now())
}
```

### 5.3 IPFS Storage Strategy

| Data type | Lưu off-chain (IPFS) | Lưu on-chain |
|---|---|---|
| Ảnh CCCD nông dân | ✅ encrypted | hash only |
| Ảnh chân dung | ✅ | hash only |
| GeoJSON ranh giới ruộng | ✅ | hash + center coords |
| Ảnh drone (mỗi 15-20 ngày) | ✅ | CID array |
| Ảnh thực địa 3 Cùng | ✅ | CID array |
| File PDF hợp đồng số | ✅ | CID + parties + total |
| Chữ ký số (base64) | trên chain (~500 bytes mỗi cái) | full data |
| Score, Tier, Token | ❌ | full data |
| SRP checklist | ❌ | full data (41 items) |
| Transaction events | ❌ | emitted events |

**Encryption rule**: Ảnh CCCD, ảnh chân dung phải encrypt trước khi up IPFS (AES-256-GCM với key derive từ farmer ID + master key). Mọi entity khác có thể up plain.

---

## 6. Smart Contract Specifications

Toàn bộ 9 function chaincode triển khai trên Hyperledger Fabric channel `agrichain-channel`. Chaincode name: `agrichain`. Tất cả function emit event để backend listen và sync về PostgreSQL.

### 6.1 createPassport

```
Function: createPassport
Caller: Backend (proxy for Farmer/3-Cung onboarding)
Params:
  - farmerId: string (must be unique, format LT-NDxxxxxx)
  - cccdHash: string (SHA-256)
  - hashedName: string
  - hxtId: string
  - region: string
  - varieties: string[]
  - passportCID: string (IPFS CID của hộ chiếu PDF)

Validation:
  - farmerId không tồn tại trên chain
  - cccdHash không trùng (1 CCCD = 1 farmer)
  - hxtId tồn tại trong whitelist HTX

State changes:
  - Tạo Farmer entity với:
    - tier = 'D'
    - farmingScore = 0
    - creditScore = 0
    - overallScore = 0
  - Tạo Genesis Record (immutable block) chứa CCCD hash + timestamp

Events emitted:
  - PassportCreated { farmerId, hxtId, timestamp, txHash }

Errors:
  - DUPLICATE_FARMER_ID
  - DUPLICATE_CCCD
  - INVALID_HTX
```

### 6.2 requestSupply

```
Function: requestSupply
Caller: Backend (proxy for Farmer ordering)
Params:
  - farmerId: string
  - seasonCode: string ("DX-2026-2027")
  - items: OrderItem[]
  - totalAmount: number

Validation:
  - farmerId tồn tại
  - không có order PENDING khác cùng seasonCode
  - totalAmount = sum(items)

Logic:
  - Đọc tier hiện tại của farmer
  - Tier A → paymentTerm = POST_PAID_100
  - Tier B → paymentTerm = POST_PAID_50
  - Tier C → paymentTerm = CASH_FULL
  - Tier D → paymentTerm = DEPOSIT_30

State changes:
  - Tạo Order với status = APPROVED
  - Generate contract PDF (off-chain) → CID

Events emitted:
  - SupplyRequested { orderId, farmerId, tier, paymentTerm, totalAmount }

Errors:
  - FARMER_NOT_FOUND
  - DUPLICATE_PENDING_ORDER
  - AMOUNT_MISMATCH
```

### 6.3 confirmDelivery

```
Function: confirmDelivery
Caller: Backend (proxy for Driver + Farmer dual signature)
Params:
  - orderId: string
  - driverSignature: string (base64)
  - farmerSignature: string (base64)
  - deliveryTimestamp: number

Validation:
  - orderId tồn tại, status = APPROVED
  - cả 2 chữ ký có
  - timestamp hợp lý (không phải tương lai)

State changes:
  - Order.status = DELIVERED
  - Order.deliveredAt = timestamp
  - Farmer.creditScore += 10
  - Recompute Farmer.overallScore
  - Tạo AR record với faceValue = Order.totalAmount

Events emitted:
  - DeliveryConfirmed { orderId, farmerId, creditScoreDelta: 10 }

Auto chain call:
  - Sau khi success → automatically call tokenizeAR(orderId)

Errors:
  - ORDER_NOT_FOUND
  - INVALID_STATUS
  - MISSING_SIGNATURE
```

### 6.4 tokenizeAR

```
Function: tokenizeAR
Caller: Auto từ confirmDelivery (hoặc backend gọi tay nếu cần)
Params:
  - orderId: string
  - evidenceCID: string (IPFS CID của zip bằng chứng: hợp đồng + 2 chữ ký + ảnh giao hàng)

Validation:
  - orderId tồn tại, status = DELIVERED
  - chưa có token nào cho orderId này

State changes:
  - Tạo AssetToken với:
    - status = LISTED
    - faceValue = Order.totalAmount
  - Order.status = TOKENIZED

Events emitted:
  - TokenMinted { tokenId, orderId, faceValue, evidenceCID }
  - TokenListed { tokenId } → marketplace event

Errors:
  - ORDER_NOT_DELIVERED
  - TOKEN_ALREADY_EXISTS
```

### 6.5 approveDisbursement

```
Function: approveDisbursement
Caller: Backend (proxy for Bank user)
Params:
  - tokenId: string
  - bankId: string
  - discountRate: number (ví dụ 0.075)
  - bankSignature: string

Validation:
  - tokenId tồn tại, status = LISTED
  - bankId trong whitelist
  - discountRate hợp lệ (0 < x < 0.2)

Logic:
  - disbursedAmount = faceValue × (1 - discountRate × (timeToMaturity/365))

State changes:
  - AssetToken.status = APPROVED → DISBURSED (sau khi mock core banking trả OK)
  - AssetToken.bankId, disbursedAt, disbursedAmount, discountRate
  - Order.status = FINANCED

Events emitted:
  - TokenApproved { tokenId, bankId, discountRate }
  - DisbursementCompleted { tokenId, amount, bankTxRef }

Errors:
  - TOKEN_NOT_LISTED
  - BANK_NOT_WHITELISTED
  - INVALID_DISCOUNT_RATE
```

### 6.6 recordInspection

```
Function: recordInspection
Caller: Backend (proxy for 3-Cung technician)
Params:
  - farmerId: string
  - plotId: string
  - seasonCode: string
  - inspectorId: string
  - srpChecklist: SRPChecklistItem[] (length = 41)
  - fieldPhotosCIDs: string[]
  - dronePhotosCIDs: string[]
  - ndviValue?: number
  - gpsCoords: { lat, lng }
  - inspectorSignature: string
  - timestamp: number

Validation:
  - farmerId tồn tại
  - inspectorId trong whitelist 3-Cung
  - srpChecklist.length === 41
  - ít nhất 1 field photo
  - gpsCoords nằm trong bbox của plot (tolerance ±50m)

Logic:
  - passedCount = srpChecklist.filter(i => i.passed).length
  - Cập nhật Farming Score theo công thức Section 8.2
  - Lưu Inspection record on-chain

State changes:
  - Tạo Inspection
  - Cập nhật Farmer.farmingScore
  - Recompute overallScore

Events emitted:
  - InspectionRecorded { inspectionId, farmerId, passedCount, scoreDelta }

Errors:
  - INVALID_CHECKLIST_LENGTH
  - GPS_OUT_OF_PLOT
  - INSPECTOR_NOT_AUTHORIZED
```

### 6.7 harvestSettlement

```
Function: harvestSettlement
Caller: Backend (proxy for LT operations team)
Params:
  - orderId: string
  - yieldKg: number
  - qualityGrade: 'A' | 'B' | 'C'
  - basePrice: number (VNĐ/kg, từ thị trường)
  - timestamp: number

Validation:
  - orderId tồn tại, status = TOKENIZED hoặc FINANCED
  - yieldKg > 0
  - basePrice trong khoảng hợp lý (5.000-20.000 VNĐ/kg)

Logic:
  - Đọc farmer.farmingScore hiện tại
  - premiumPerKg theo bảng:
    - farmingScore < 60: 0
    - 60 ≤ farmingScore < 80: 200 VNĐ/kg
    - 80 ≤ farmingScore ≤ 100: 500 VNĐ/kg
  (NOTE: Original spec dùng thang điểm khác, áp dụng tỷ lệ % của max 600)
  - grossAmount = yieldKg × (basePrice + premiumPerKg)
  - debtDeducted = Order.totalAmount (nếu chưa trả, theo paymentTerm)
  - netToFarmer = grossAmount - debtDeducted
  - Nếu Token đã FINANCED → netToBank = disbursedAmount + interest
  
State changes:
  - Tạo Settlement record
  - Order.status = HARVESTED → SETTLED
  - AssetToken.status = SETTLED
  - Update credit score theo Section 8.1:
    - +200 if đủ sản lượng cam kết
    - +100 if trả nợ đúng hạn
    - -500 if vi phạm bao tiêu (bán ngoài)

Auto chain call:
  - updateTier(farmerId)

Events emitted:
  - HarvestSettled { settlementId, orderId, netToFarmer, netToBank }

Errors:
  - ORDER_NOT_READY_FOR_HARVEST
  - INVALID_YIELD
```

### 6.8 updateTier

```
Function: updateTier
Caller: Auto từ harvestSettlement (hoặc backend chạy batch định kỳ)
Params:
  - farmerId: string

Logic:
  - Đọc farmer.overallScore
  - Tier theo bảng:
    - 700 ≤ overallScore ≤ 1000 → Tier A
    - 500 ≤ overallScore < 700 → Tier B
    - 300 ≤ overallScore < 500 → Tier C
    - overallScore < 300 → Tier D
  - Nếu tier thay đổi, emit event

State changes:
  - Farmer.tier = newTier (nếu khác)

Events emitted:
  - TierChanged { farmerId, oldTier, newTier, overallScore }
  - Hoặc TierUnchanged nếu không đổi

Errors:
  - FARMER_NOT_FOUND
```

### 6.9 triggerInsurance

```
Function: triggerInsurance
Caller: Backend (từ weather oracle cron)
Params:
  - plotId: string
  - weatherEventType: 'DROUGHT' | 'FLOOD' | 'SALINITY'
  - severity: number (0-1, từ oracle)
  - threshold: number (ngưỡng đã định)

Validation:
  - plotId tồn tại
  - severity > threshold
  - chưa có insurance claim active cho plot trong vụ này

Logic:
  - Tính payout = baseCoverage × severity
  - Ưu tiên chuyển vào escrow account để tất toán SCF token

State changes:
  - Tạo InsuranceClaim record
  - Nếu có token đang FINANCED → trừ trực tiếp vào nghĩa vụ với bank
  - Update farmer credit score: +0 (không phạt vì lý do thiên tai)

Events emitted:
  - InsuranceTriggered { claimId, plotId, payout, eventType }

Errors:
  - SEVERITY_BELOW_THRESHOLD
  - DUPLICATE_CLAIM_THIS_SEASON
```

### 6.10 Pseudocode mẫu (Go) cho chaincode

```go
// chaincode/agrichain/contract.go

type AgriChainContract struct {
    contractapi.Contract
}

func (c *AgriChainContract) CreatePassport(
    ctx contractapi.TransactionContextInterface,
    farmerId string,
    cccdHash string,
    hashedName string,
    hxtId string,
    region string,
    varieties []string,
    passportCID string,
) error {
    // 1. Check existence
    exists, err := c.farmerExists(ctx, farmerId)
    if err != nil { return err }
    if exists {
        return fmt.Errorf("DUPLICATE_FARMER_ID: %s", farmerId)
    }
    
    // 2. Check CCCD uniqueness via composite key
    cccdKey, _ := ctx.GetStub().CreateCompositeKey("cccd", []string{cccdHash})
    cccdExists, _ := ctx.GetStub().GetState(cccdKey)
    if cccdExists != nil {
        return fmt.Errorf("DUPLICATE_CCCD")
    }
    
    // 3. Build farmer
    farmer := Farmer{
        ID:              farmerId,
        CccdHash:        cccdHash,
        HashedName:      hashedName,
        HxtId:           hxtId,
        Region:          region,
        Varieties:       varieties,
        FarmingScore:    0,
        CreditScore:     0,
        OverallScore:    0,
        Tier:            "D",
        PassportCID:     passportCID,
        CreatedAt:       time.Now().Unix(),
    }
    
    // 4. Save
    farmerJSON, _ := json.Marshal(farmer)
    err = ctx.GetStub().PutState(farmerId, farmerJSON)
    if err != nil { return err }
    
    // 5. Save CCCD index
    ctx.GetStub().PutState(cccdKey, []byte(farmerId))
    
    // 6. Emit event
    eventPayload, _ := json.Marshal(map[string]interface{}{
        "farmerId": farmerId,
        "hxtId":    hxtId,
        "timestamp": time.Now().Unix(),
    })
    return ctx.GetStub().SetEvent("PassportCreated", eventPayload)
}

// ... 8 functions còn lại theo cùng pattern
```

---

## 7. API Specifications

Backend Node.js Express expose REST API tại `https://api.agrichain.local/api/v1`. Auth bằng JWT trừ public endpoints. Mọi response theo schema chuẩn:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: any };
  meta?: { txHash?: string; timestamp: number };
}
```

### 7.1 Auth Endpoints

```
POST   /api/v1/auth/login                   { phone, otp } → { token, user, role }
POST   /api/v1/auth/refresh                 { refreshToken } → { token }
POST   /api/v1/auth/request-otp             { phone } → { otpId, expiresIn }
GET    /api/v1/auth/me                      → { user, role, permissions }
POST   /api/v1/auth/logout                  → { success }
```

**Role**: `FARMER` | `TECHNICIAN` | `ADMIN` | `BANKER` | `DRIVER`

### 7.2 Farmer Endpoints

```
POST   /api/v1/farmers                      Create new farmer (TECHNICIAN role)
GET    /api/v1/farmers/:id                  Get farmer detail
GET    /api/v1/farmers/:id/passport         Get passport (with QR)
PATCH  /api/v1/farmers/:id                  Update profile
GET    /api/v1/farmers/:id/score-history    Score change events
GET    /api/v1/farmers/:id/orders           List orders
POST   /api/v1/farmers/:id/plots            Add plot (GeoJSON)
GET    /api/v1/farmers/:id/plots            List plots
```

**Example: Create farmer**

Request:
```json
POST /api/v1/farmers
Authorization: Bearer <technician-token>
{
  "fullName": "Nguyễn Văn Tư",
  "cccd": "001234567890",
  "phone": "0901234567",
  "address": "Ấp Mỹ An, Châu Thành, An Giang",
  "hxtId": "HTX-AG-001",
  "region": "An Giang",
  "primaryRiceVariety": ["LT28"],
  "plots": [{
    "name": "Ruộng chính",
    "area": 1.5,
    "geoJson": { "type": "Polygon", "coordinates": [[...]] }
  }],
  "frontCccdImageBase64": "...",
  "backCccdImageBase64": "...",
  "portraitImageBase64": "..."
}
```

Response:
```json
{
  "success": true,
  "data": {
    "farmer": {
      "id": "LT-ND000123",
      "tier": "D",
      "farmingScore": 0,
      "creditScore": 0,
      "digitalPassportCID": "QmXyz...",
      "passportQrCodeUrl": "https://api.../qr/LT-ND000123.png"
    }
  },
  "meta": { "txHash": "0xabc...", "timestamp": 1709876543 }
}
```

### 7.3 Order Endpoints

```
POST   /api/v1/orders                       Create order (FARMER or TECHNICIAN-proxy)
GET    /api/v1/orders/:id                   Get detail
GET    /api/v1/orders                       List with filter (farmerId, status, season)
POST   /api/v1/orders/:id/confirm-delivery  Confirm + 2 signatures
GET    /api/v1/orders/:id/contract.pdf      Download contract PDF
POST   /api/v1/orders/:id/cancel            Cancel pending order
```

**Example: Create order**

Request:
```json
POST /api/v1/orders
{
  "farmerId": "LT-ND000123",
  "seasonCode": "DX-2026-2027",
  "items": [
    { "sku": "GIONG-LT28", "name": "Giống LT28", "quantity": 100, "unit": "kg", "unitPrice": 25000 },
    { "sku": "PHAN-NPK", "name": "Phân NPK 16-16-8", "quantity": 500, "unit": "kg", "unitPrice": 12000 },
    { "sku": "THUOC-BVTV-001", "name": "Thuốc trừ sâu", "quantity": 8, "unit": "L", "unitPrice": 250000 }
  ]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "ORD-20261015-0042",
      "totalAmount": 10500000,
      "paymentTerm": "DEPOSIT_30",
      "status": "APPROVED",
      "contractCID": "QmAbc...",
      "depositRequired": 3150000
    }
  }
}
```

### 7.4 Token (SCF) Endpoints

```
POST   /api/v1/tokens/mint                  Mint AR token (system-internal, called by confirmDelivery handler)
GET    /api/v1/tokens                       List with filter (status, bankId)
GET    /api/v1/tokens/:id                   Detail with evidence drill-down
POST   /api/v1/tokens/:id/approve           Bank approve & disburse
GET    /api/v1/tokens/:id/evidence          Get evidence bundle (IPFS links)
GET    /api/v1/tokens/marketplace           Marketplace listing (BANKER view)
```

**Example: Bank approve**

Request:
```json
POST /api/v1/tokens/TKN-20261020-0042/approve
Authorization: Bearer <banker-token>
{
  "discountRate": 0.075,
  "bankSignature": "base64..."
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": {
      "id": "TKN-20261020-0042",
      "status": "DISBURSED",
      "faceValue": 10500000,
      "discountRate": 0.075,
      "disbursedAmount": 10434375,
      "bankTxRef": "MB-DISB-20261020-001",
      "disbursedAt": 1729382400
    }
  }
}
```

### 7.5 Inspection Endpoints

```
POST   /api/v1/inspections                  Submit inspection (TECHNICIAN)
GET    /api/v1/inspections/:id              Detail
GET    /api/v1/inspections                  List (filter by farmerId, season, plotId)
GET    /api/v1/inspections/srp-template     Get SRP 41-item template
POST   /api/v1/inspections/upload-photo     Upload photo → IPFS, return CID
GET    /api/v1/inspections/ai-suggestion    AI alert for plot (mocked)
```

### 7.6 Settlement Endpoints

```
POST   /api/v1/settlements                  Create settlement (ADMIN)
GET    /api/v1/settlements/:id              Detail
GET    /api/v1/settlements                  List
GET    /api/v1/settlements/preview          Preview calculation (no commit)
```

### 7.7 Bank Endpoints

```
GET    /api/v1/bank/portfolio               Bank's token portfolio
GET    /api/v1/bank/dashboard               KPIs (total exposure, NPL, ROI)
GET    /api/v1/bank/marketplace             Available tokens
POST   /api/v1/bank/disburse-callback       Mock core banking webhook
```

### 7.8 Admin Endpoints

```
GET    /api/v1/admin/dashboard              KPIs
GET    /api/v1/admin/scf-report             SCF cash flow
GET    /api/v1/admin/farmers                Bulk farmer list
GET    /api/v1/admin/tx-log                 Blockchain transaction log
POST   /api/v1/admin/contract/retry         Retry failed chaincode call
```

### 7.9 Public Endpoints (no auth)

```
GET    /api/v1/public/passport/:id          QR code lookup (limited info)
GET    /api/v1/public/health                Health check
GET    /api/v1/public/srp-criteria          SRP 41 tiêu chí (cho transparency)
```

---

## 8. Tier & Scoring Engine

### 8.1 Credit Score (trustless, 40% trọng số)

**Range**: -∞ đến 1000 (cho phép âm trong trường hợp vi phạm nặng)

| Hành động | Điểm | Logic trigger |
|---|---|---|
| Đăng ký mua vật tư qua app | +5 | trên `requestSupply` success |
| Nhận vật tư + ký số 2 bên | +10 | trên `confirmDelivery` success |
| Trả nợ vật tư đúng hạn | +100 | trên `harvestSettlement`, debt cleared trong hạn |
| Trả nợ trước hạn | +150 | trên `harvestSettlement`, debt cleared trước hạn |
| Bán lúa đủ sản lượng cam kết | +200 | trên `harvestSettlement`, yieldKg ≥ committedKg |
| Giao dịch ổn định 1 năm liên tục | +50 | batch job hằng năm |
| Trễ hạn trả nợ < 30 ngày | -50 | cron job phát hiện overdue |
| Trễ hạn trả nợ > 30 ngày | -200 | cron job phát hiện overdue |
| Bán lúa ra ngoài (vi phạm bao tiêu) | -500 | ADMIN flag manual + verify |

**Pseudocode**:
```javascript
function applyCreditScoreUpdate(farmerId, eventType) {
  const deltaMap = {
    'SUPPLY_REQUESTED': 5,
    'DELIVERY_CONFIRMED': 10,
    'DEBT_PAID_ON_TIME': 100,
    'DEBT_PAID_EARLY': 150,
    'YIELD_COMMITMENT_MET': 200,
    'YEAR_STABLE': 50,
    'DEBT_LATE_LT30': -50,
    'DEBT_LATE_GT30': -200,
    'CONTRACT_VIOLATION': -500,
  };
  const delta = deltaMap[eventType];
  // chaincode: farmer.creditScore += delta, recompute overallScore
}
```

### 8.2 Farming Score (Oracle người, 60% trọng số)

**Range**: 0 đến 600 (theo 41 SRP criteria, mỗi tiêu chí có weight khác nhau)

| Tiêu chí SRP | Weight (điểm tối đa) | Cách đo |
|---|---|---|
| Sạ đúng mật độ (60-70 kg/ha) | 50 | 3 Cùng kiểm tra + đối chiếu hóa đơn giống on-chain |
| Sử dụng giống được khuyến cáo | 30 | Match SKU với danh mục giống Lộc Trời |
| Bón phân đúng quy trình | 80 | 3 Cùng + ảnh drone NDVI |
| Sử dụng thuốc BVTV trong danh mục | 80 | Match SKU + đối chiếu hóa đơn |
| Quản lý nước (không úng/khô) | 70 | Drone đa phổ |
| Không có dấu hiệu bệnh nặng | 70 | AI ảnh + 3 Cùng xác nhận |
| Tuân thủ thời gian cách ly thuốc | 50 | Nhật ký + 3 Cùng |
| An toàn lao động (PPE) | 30 | 3 Cùng quan sát |
| 33 tiêu chí khác | 140 (tổng) | Theo SRP standard |
| **TỔNG MAX** | **600** | — |

**Algorithm sau mỗi inspection**:
```javascript
function calculateFarmingScore(inspection, previousScore) {
  let totalEarned = 0;
  for (const item of inspection.srpChecklist) {
    const weight = SRP_WEIGHTS[item.code];  // pre-defined map
    if (item.passed) {
      totalEarned += weight;
    }
  }
  // Weighted average với previous score (smooth update)
  // Mới: 70% inspection mới, 30% historical
  const newScore = Math.round(totalEarned * 0.7 + previousScore * 0.3);
  return Math.min(600, Math.max(0, newScore));
}
```

### 8.3 Overall Score & Tier

```
overallScore = farmingScore × 0.6 + creditScore × 0.4
```

Vì creditScore có thể đạt 1000 còn farmingScore max 600, ta normalize trước khi compute:

```javascript
function computeOverallScore(creditScore, farmingScore) {
  const normalizedFarming = (farmingScore / 600) * 1000;  // 0-1000
  const normalizedCredit = Math.max(0, Math.min(1000, creditScore));  // clip 0-1000
  return Math.round(normalizedFarming * 0.6 + normalizedCredit * 0.4);
}
```

**Tier boundaries**:

| Tier | Overall Score | Quyền lợi |
|---|---|---|
| A | 700-1000 | Vật tư trả sau 100% + bao tiêu giá cao + premium SRP + drone phun miễn phí |
| B | 500-699 | Vật tư trả sau 50% + giá bao tiêu chuẩn + ưu tiên dịch vụ |
| C | 300-499 | Mua vật tư thông thường + tư vấn 3 Cùng |
| D | 0-299 | Cọc 30% trước, không bao tiêu (mới vào hoặc vi phạm) |

### 8.4 Premium SRP (giá bao tiêu cộng thêm)

```javascript
function getPremiumPerKg(farmingScore) {
  const farmingScorePercent = (farmingScore / 600) * 100;
  if (farmingScorePercent < 60) return 0;
  if (farmingScorePercent < 80) return 200;  // VNĐ/kg
  return 500;  // VNĐ/kg
}
```

---

## 9. Screen Specifications

### 9.1 Farmer App (Mobile, React Native)

**Navigation**: Bottom tab (4 tab) + Stack navigators

```
- Tab 1: Home (Dashboard)
- Tab 2: Orders (Vật tư)
- Tab 3: Inspections (Ruộng)
- Tab 4: Profile
```

#### Screen F-01: Login

- Components: phone input, OTP input, large submit button
- Action: `POST /auth/request-otp` → input OTP → `POST /auth/login`
- Edge: nông dân chưa có account → nút "Liên hệ kỹ thuật viên 3 Cùng"

#### Screen F-02: Onboarding Wizard (chỉ chạy lần đầu)

- 4 steps: Thông tin cá nhân → Upload CCCD → Vẽ ruộng (map) → Xác nhận
- Có thể skip nếu 3 Cùng đã setup giúp
- Sau khi complete → animate transition vào F-03

#### Screen F-03: Home Dashboard

- Layout:
  - Top: Greeting "Chào anh Tư" + avatar
  - Card lớn: 3 số liệu — **Tier hiện tại** (chữ to A/B/C/D + màu), **Farming Score** (progress 0/600), **Credit Score**
  - Sub-card: "Còn 180 điểm để lên Tier B"
  - Current season info: "Vụ Đông Xuân 2026-2027 — đang canh tác"
  - Quick actions: 3 nút lớn — "Đặt vật tư", "Xem ruộng", "Lịch sử"
- Data: `GET /farmers/:id`, `GET /farmers/:id/score-history?limit=1`

#### Screen F-04: Order Wizard

- Step 1: Chọn vụ mùa (radio: Đông Xuân / Hè Thu / Thu Đông) — auto-select vụ đang mở
- Step 2: Chọn giống lúa (chip list, gợi ý theo lịch sử)
- Step 3: Gói gợi ý
  - Hiển thị: "Phân: 500kg | Thuốc: 8L | Giống: 100kg | Tổng: 12.500.000đ"
  - Có thể edit số lượng từng item
- Step 4: Hình thức thanh toán (4 cards theo Tier — disable card không đủ điều kiện, highlight card hiện tại)
- Step 5: Review & Sign
  - PDF preview hợp đồng
  - Nút "Ký số" → mở dialog nhập PIN/vân tay
- After submit → success screen + redirect F-03

#### Screen F-05: Order Detail

- Header: Order ID, status badge, total amount
- Timeline: tạo đơn → duyệt → giao hàng → token hóa → bank giải ngân → thu hoạch → tất toán
- Each step: timestamp + tx hash (clickable → IPFS/explorer)
- Bottom CTA dynamic theo status:
  - APPROVED: "Chờ giao hàng"
  - DELIVERED nhưng chưa ký → "Ký xác nhận đã nhận"
  - HARVESTED → "Xem chi tiết settlement"

#### Screen F-06: Sign Delivery

- Title: "Anh Tư xác nhận đã nhận vật tư"
- List items đã giao + tổng tiền
- Driver name + driver signature already on top
- Signature pad cho farmer (touch-draw) + nút "Dùng PIN thay vì ký"
- Submit → `POST /orders/:id/confirm-delivery`
- Success → "+10 Credit Score" animation

#### Screen F-07: Plots List

- Map view với polygon ruộng
- List view bên dưới: tên ruộng, diện tích, last inspection date

#### Screen F-08: Inspection History

- Filter: theo vụ mùa
- List card: inspection date, inspector name, passed/total ratio
- Tap → detail với photos, checklist breakdown

#### Screen F-09: Profile

- Avatar, full info, QR Hộ chiếu số (xem to)
- Settings: language, notification, logout

#### Screen F-10: Notification Center

- List notification: tier change, order status, payment, alert
- Tap → relevant screen

### 9.2 3 Cùng App (Mobile, React Native)

**Navigation**: Bottom tab (4)

```
- Tab 1: Today (lịch hôm nay)
- Tab 2: Farmers (danh sách phụ trách)
- Tab 3: Inspect (form kiểm tra)
- Tab 4: Profile
```

#### Screen T-01: Login (same as F-01 nhưng role TECHNICIAN)

#### Screen T-02: Today Dashboard

- Top: AI alert banner (nếu có): "Ruộng anh A có dấu hiệu đạo ôn — đi kiểm tra"
- Section 1: Lịch giao vật tư hôm nay (list farmer + items)
- Section 2: Lịch kiểm tra ruộng hôm nay
- Section 3: Pending tasks (khoản chưa hoàn thành tuần trước)

#### Screen T-03: Farmer List

- Search bar
- Filter: HTX, Tier, status
- List item: name, tier badge, last activity

#### Screen T-04: Farmer Detail (with onboarding mode)

- Full info xem được
- Nếu farmer chưa onboard → nút lớn "Bắt đầu Onboarding"
  - Wizard 4 step như F-02 nhưng technician nhập thay

#### Screen T-05: Delivery Confirmation

- Scan QR code Hộ chiếu số của farmer → load order list
- Tick items đã giao
- Driver signature pad
- Pass to farmer device để ký

#### Screen T-06: SRP Inspection Form

- Section header: farmer name, plot name, season
- 6 cụm (collapsible):
  1. Giống (Seed) — 5 tiêu chí
  2. Phân bón (Fertilizer) — 7 tiêu chí
  3. Thuốc BVTV (Pesticide) — 9 tiêu chí
  4. Nước (Water) — 6 tiêu chí
  5. Sau thu hoạch (Post-harvest) — 8 tiêu chí
  6. An toàn (Safety) — 6 tiêu chí
- Mỗi tiêu chí: tick pass/fail + ghi chú + camera button (upload ảnh evidence)
- Bottom: "View drone photos" — modal hiện ảnh drone gần nhất + NDVI heatmap
- Submit: signature pad + GPS auto-capture → `POST /inspections`

#### Screen T-07: Offline Queue

- Hiện list inspection chưa sync (do offline)
- Manual retry button

### 9.3 Lộc Trời Admin Portal (Web, Next.js)

**Layout**: Sidebar navigation + top bar

```
Sidebar:
- Dashboard
- Farmers
- Orders
- Tokens / SCF
- Inspections
- Settlements
- Smart Contract Logs
- Reports
- Settings
```

#### Screen A-01: Dashboard

- 6 KPI cards: total farmers, active orders, AR outstanding (VNĐ), AR financed, NPL ratio, avg SRP score
- Chart 1: SCF flow theo tháng (stacked bar: outstanding / financed / settled)
- Chart 2: Tier distribution (donut)
- Chart 3: Farming Score histogram
- Recent transactions feed (last 20)

#### Screen A-02: Farmer Management

- DataTable với 200K row (virtual scrolling)
- Cols: ID, name, HTX, tier, FS, CS, last activity
- Filters: HTX, tier, region, score range
- Bulk action: export CSV

#### Screen A-03: Farmer Detail

- Same data as F-09 plus admin-only: edit profile, force tier override (with reason), audit log

#### Screen A-04: SCF Cash Flow Report

- Time range picker
- Table breakdown by bank:
  - MB Bank: outstanding X, disbursed Y, fees Z
- Drill-down → list tokens
- Export PDF/Excel

#### Screen A-05: Smart Contract Logs

- Live feed of all chaincode invocations
- Filter by function, status (success/fail), farmer
- For failed: "Retry" button (admin only)
- Detail modal: full payload + event log

#### Screen A-06: Inspections Map

- Map view với heatmap Farming Score by region
- Click marker → modal inspection summary
- Date range filter

### 9.4 Bank Portal (Web, Next.js)

**Layout**: Sidebar simpler than admin

```
- Dashboard
- Marketplace
- Portfolio
- Risk Reports
```

#### Screen B-01: Dashboard

- KPI cards: Total exposure, Active tokens, Avg discount rate, Expected returns, NPL
- Chart: Portfolio composition by HTX/region
- Watchlist: tokens approaching maturity

#### Screen B-02: Marketplace

- Token list with filters: face value range, farmer tier, region, days to harvest
- Each row: token ID, farmer (anonymized + tier), faceValue, current SRP score, days to maturity, expected discount
- Action: "View evidence" → modal → drill-down

#### Screen B-03: Token Evidence Drill-down (modal)

- Tab 1: Order summary (contract PDF link)
- Tab 2: Delivery evidence (driver sig, farmer sig, items list)
- Tab 3: Field evidence (drone photos thumbnail grid, click → fullscreen)
- Tab 4: SRP checklist (41 items pass/fail with notes)
- Tab 5: Score history (timeline)
- Bottom CTA: "Approve & Disburse" → opens approval dialog

#### Screen B-04: Approval Dialog

- Input: discount rate slider (default 7.5%)
- Calculation preview: face value, fee, disbursed amount, expected return
- Sign with bank certificate (mock)
- Submit → `POST /tokens/:id/approve`
- After success → toast notification + redirect Portfolio

#### Screen B-05: Portfolio

- Same as marketplace but only owned tokens
- Status filter: APPROVED / DISBURSED / SETTLED
- For DISBURSED: countdown to maturity
- For SETTLED: realized return

#### Screen B-06: Risk Report

- Export-ready report: portfolio breakdown by tier, region, days outstanding
- Stress test simulator (mock): "What if 10% farmers drop a tier?"

---

## 10. Workflow Implementation 6 pha

Mỗi pha mô tả dưới dạng **sequence diagram bằng prose**, dễ để AI agent implement.

### Pha A — Onboarding

```
[Farmer + Technician at field]
1. Technician opens 3-Cung app, tab Farmers, button "+ New Farmer"
2. App opens onboarding wizard (T-04)
3. Step 1: Technician nhập thông tin cá nhân của Farmer (full name, CCCD, phone, address, HTX)
4. Step 2: Capture front + back CCCD via camera (resize → 1024px max)
5. Step 3: Capture portrait photo của Farmer
6. Step 4: Mở map → Technician + Farmer cùng vẽ polygon ruộng (dùng GPS để hỗ trợ)
7. Step 5: Confirm screen — Farmer ký số (touchpad) trên màn hình
8. Technician tap "Submit"

[Backend]
9. POST /api/v1/farmers receives payload
10. Backend validate (CCCD unique, HTX valid)
11. Backend gọi IPFS upload (encrypted):
    - frontCccd → cidA
    - backCccd → cidB
    - portrait → cidC
    - geoJson → cidD
12. Backend tạo PDF "Hộ chiếu số" (template: avatar + ID + QR) → up IPFS → cidE
13. Backend gọi chaincode createPassport(farmerId, cccdHash, hashedName, hxtId, region, varieties, passportCID=cidE)
14. Chaincode emit PassportCreated event
15. Backend nhận event → cập nhật PostgreSQL FarmerProfile
16. Backend trả response cho Technician app
17. App hiển thị success screen với QR code → có thể print hoặc save

[Farmer receives Digital Passport]
18. Farmer scan QR bằng Farmer app để link account (hoặc OTP-based login)
```

### Pha B1 — Đăng ký vật tư

```
[Farmer at home, mở Farmer app]
1. F-03 Dashboard → tap "Đặt vật tư"
2. F-04 Step 1: app auto-fill current season → confirm
3. Step 2: Chọn giống (gợi ý theo lịch sử)
4. Step 3: App gọi GET /farmers/:id để biết Tier hiện tại → hiển thị gói gợi ý + giá theo Tier
5. Step 4: 4 cards payment hiện ra, card hợp lệ theo Tier được enable
6. Step 5: Review hợp đồng PDF preview → tap "Ký số"
7. PIN dialog → input PIN → submit

[Backend]
8. POST /api/v1/orders
9. Backend validate (no pending order same season)
10. Backend chuẩn bị OrderItem list, compute totalAmount
11. Backend gọi chaincode requestSupply
12. Chaincode đọc tier → assign paymentTerm → tạo Order
13. Backend nhận SupplyRequested event
14. Backend generate hợp đồng PDF → up IPFS → save contractCID
15. Cập nhật PostgreSQL OrderMirror
16. Response → app

[Notification]
17. Backend trigger notification:
    - Farmer: "Đơn được duyệt — vật tư giao trong 2 ngày"
    - Technician phụ trách: "Có đơn mới của anh Tư"
    - LT logistics: "Schedule delivery"
```

### Pha B2 — Giao + Mint Token

```
[Driver delivers to farm]
1. Driver app: scan QR Hộ chiếu số của Farmer → load order list (hoặc chọn order ID)
2. Driver verify items → tick each
3. Driver signs (signature pad)
4. Driver hands tablet to Farmer
5. Farmer signs (or PIN)
6. Driver taps "Confirm delivery"

[Backend]
7. POST /api/v1/orders/:id/confirm-delivery
8. Validate both signatures, order status = APPROVED
9. Upload signatures + photos giao hàng to IPFS → evidence bundle CID
10. Call chaincode confirmDelivery(orderId, driverSig, farmerSig, timestamp)
11. Chaincode:
    - Update Order.status = DELIVERED
    - Increment Farmer.creditScore += 10
    - Recompute overallScore
12. Auto chain call: tokenizeAR(orderId, evidenceCID)
13. Chaincode:
    - Create AssetToken (status = LISTED, faceValue = totalAmount)
    - Update Order.status = TOKENIZED
14. Emit events: DeliveryConfirmed, TokenMinted, TokenListed
15. Backend updates PostgreSQL TokenMarketplace

[Notifications]
16. Farmer app: "+10 Credit Score" toast + score animation
17. Bank Portal: real-time marketplace update (websocket optional, or polling)
```

### Pha B3 — Bank giải ngân SCF

```
[Banker on Bank Portal]
1. B-02 Marketplace → see new token
2. Click → B-03 Evidence drill-down
3. Banker reviews 5 tabs: order, delivery, field, SRP, score
4. Click "Approve & Disburse"
5. B-04 Approval dialog: adjust discount rate (default 7.5%)
6. Preview calculation:
   - Face value: 10,500,000 VND
   - Discount: 10,500,000 × 0.075 × (60/365) = 129,452 VND
   - Disbursed: 10,370,548 VND
7. Bank signs → submit

[Backend]
8. POST /api/v1/tokens/:id/approve
9. Validate bank in whitelist, token status = LISTED
10. Call chaincode approveDisbursement(tokenId, bankId, discountRate, bankSig)
11. Chaincode: token status APPROVED → mock bank API call
12. Mock POST to /bank-mock/disburse → returns OK + bankTxRef
13. Chaincode: token status = DISBURSED, order status = FINANCED
14. Emit DisbursementCompleted event
15. Backend updates DB

[Lộc Trời receives cash]
16. LT Admin sees in A-04 SCF Cash Flow: +10,370,548 VND from MB Bank
17. This money goes to LT working capital → can fund next season
```

### Pha B4 — Drone + 3 Cùng monitoring

```
[Periodic — every 15-20 days during growing season]
1. Drone team uploads ảnh đa phổ via web admin (mock)
2. Backend stores ảnh in IPFS → ndvi computed (mock: random 0.6-0.9 trong vụ healthy)
3. Backend AI mock: phân tích NDVI → nếu < 0.5 → generate alert
4. Alert pushed to Technician app (T-02)

[Technician inspects]
5. Technician opens T-02 → see alert "Ruộng anh Tư NDVI 0.45 — đi kiểm tra"
6. Navigate to farm using GPS
7. Open T-06 SRP Inspection Form
8. Walk through 6 cụm × 41 items, tick + add notes + photos
9. Sub-modal: view drone photos for evidence
10. Sign + submit

[Backend]
11. POST /api/v1/inspections
12. Validate GPS within plot, checklist length = 41
13. Upload all photos → IPFS, collect CIDs
14. Call chaincode recordInspection(...)
15. Chaincode:
    - Create Inspection record
    - Compute farmingScoreDelta theo công thức Section 8.2
    - Update Farmer.farmingScore
    - Recompute overallScore
    - Trigger updateTier nếu cần
16. Emit InspectionRecorded event
17. Update DB mirror

[Farmer receives update]
18. Farmer app push notification: "Farming Score: 320 → 365"
19. Score animation in F-03
```

### Pha B5 — Thu hoạch + Settlement

```
[Farmer notifies harvest]
1. Farmer app → F-05 Order Detail → button "Báo thu hoạch"
2. POST /api/v1/orders/:id/notify-harvest → backend schedules LT logistics

[Harvest day — at farm]
3. LT truck arrives với cân điện tử IoT
4. Lúa được cân → IoT scale auto-pushes yield to Admin app (mocked: 3-Cung nhập manual)
5. Quality grade assessed (3-Cung tick A/B/C)
6. Admin app: review numbers → confirm

[Backend]
7. POST /api/v1/settlements
8. Validate order status TOKENIZED or FINANCED
9. Call chaincode harvestSettlement(orderId, yieldKg, qualityGrade, basePrice)
10. Chaincode:
    - Read farmingScore
    - Compute premiumPerKg
    - grossAmount = yield × (base + premium)
    - debtDeducted = order.totalAmount (chưa trả)
    - Nếu Token FINANCED → netToBank = disbursedAmount + interest từ disbursement date
    - netToFarmer = gross - debt - netToBank (nếu LT đã nhận tiền từ bank thì khoản này về LT)
    - Update credit scores theo Section 8.1
11. Auto chain call: updateTier(farmerId)
12. Chaincode: if overallScore crosses threshold → tier changes
13. Emit HarvestSettled + possibly TierChanged events
14. Backend: trigger payouts
    - Send VND to farmer's bank account (mocked)
    - Send VND to bank account (close SCF — mocked)

[Notifications]
15. Farmer app: "🎉 Vụ Đông Xuân hoàn tất! Bạn nhận được X VNĐ. Đã nâng Tier B!"
16. Bank Portal: token SETTLED, realized return shown
17. Admin Dashboard: cycle closed
```

---

## 11. Mock Data & Test Scenarios

### 11.1 Seed Data

Đặt trong `infra/scripts/seed.ts`. Chạy `npm run seed` để populate DB + chaincode.

**HTX**:
```javascript
[
  { id: "HTX-AG-001", name: "HTX Mỹ Hòa", region: "An Giang" },
  { id: "HTX-DT-001", name: "HTX Tân Thạnh", region: "Đồng Tháp" },
]
```

**Banks**:
```javascript
[
  { id: "BANK-MB", name: "MB Bank", msp: "MBBankMSP", apiEndpoint: "http://localhost:4001/disburse" },
  { id: "BANK-HSBC", name: "HSBC Vietnam", msp: "HSBCMSP", apiEndpoint: "http://localhost:4002/disburse" },
]
```

**Farmers (10 hộ)**:
```javascript
[
  // Tier A example
  { fullName: "Nguyễn Văn A", cccd: "001234567001", hxtId: "HTX-AG-001", tier: "A", farmingScore: 540, creditScore: 850, totalArea: 5.2 },
  // Tier B
  { fullName: "Trần Thị B", cccd: "001234567002", hxtId: "HTX-AG-001", tier: "B", farmingScore: 420, creditScore: 600 },
  // Tier C
  { fullName: "Lê Văn C", cccd: "001234567003", hxtId: "HTX-DT-001", tier: "C", farmingScore: 280, creditScore: 350 },
  // Tier D (new)
  { fullName: "Phạm Thị D", cccd: "001234567004", hxtId: "HTX-DT-001", tier: "D", farmingScore: 0, creditScore: 0 },
  // ... 6 more
]
```

**SRP Template (41 items)**: Tham khảo `sustainablerice.org/SRP-Standard` — giả lập 41 item với weight phân bổ theo Section 8.2. Lưu trong `packages/shared-types/src/srp-template.ts`.

### 11.2 Test Scenarios

#### Scenario 1: Happy path — Tier-D farmer hoàn thành 1 vụ → lên Tier C
- Farmer D mới onboard (score 0)
- Đặt order với cọc 30% (DEPOSIT_30)
- Giao + ký → +10 credit (10)
- Inspect lần 1: 30/41 pass → farming +210
- Inspect lần 2: 35/41 pass → farming ~300
- Harvest: yield đủ → +200 credit (210), on-time payment → +100 (310)
- Overall = (300/600)*1000*0.6 + 310*0.4 = 300 + 124 = 424 → Tier C ✓

#### Scenario 2: SCF disbursement
- Tier B farmer → đặt 50 triệu VND (POST_PAID_50, 25 triệu đặt cọc)
- Delivery confirmed → token minted (face value 50M)
- Bank approves at 7.5% discount, 90 days to maturity
- Disbursed = 50M × (1 - 0.075 × 90/365) = 50M - 925k = 49,075,000 VND
- Lộc Trời receives 49M trong 2 giờ thay vì 90 ngày

#### Scenario 3: Insurance trigger (parametric)
- Weather oracle reports NDVI drop 60% trong 1 tuần
- Severity = 0.65, threshold = 0.5 → triggerInsurance
- Mock insurance pays 30% face value
- Money goes to escrow → settle bank early
- Farmer not penalized (force majeure)

#### Scenario 4: Contract violation
- Tier A farmer bán lúa ra ngoài (báo cáo manual từ HTX)
- Admin flag violation → applyCreditScoreUpdate(-500)
- overallScore drops below 700 → demoted to Tier B/C
- Notification gửi farmer + lock các quyền lợi Tier A

### 11.3 Edge Cases cần handle

| Edge case | Behavior |
|---|---|
| Farmer mất điện thoại | Technician có thể proxy mọi action, signature thay |
| Mất sóng giữa inspection | Cache local SQLite, sync khi có mạng |
| Bank reject token | Token quay về LISTED, có thể list bank khác |
| Drone không bay được (mưa) | Skip inspection round, không penalize |
| GPS lệch (sóng kém) | Tolerance ±50m từ plot center, fallback manual confirm |
| Yield thấp hơn cam kết | Settlement vẫn chạy, credit score giảm theo bậc |
| Race condition (2 inspections same plot same day) | Chaincode reject duplicate via composite key |

---

## 12. UI/UX Design System

### 12.1 Color Palette (theme Lộc Trời)

Primary palette dựa trên brand Lộc Trời (xanh lá đậm) + supportive colors.

```css
:root {
  /* Primary — Lộc Trời green */
  --lt-primary: #2D6A4F;
  --lt-primary-light: #74C69D;
  --lt-primary-dark: #1B4332;
  
  /* Secondary — Rice gold */
  --lt-gold: #F4A261;
  --lt-gold-light: #FFD89D;
  
  /* Semantic */
  --lt-success: #16A34A;
  --lt-warning: #F59E0B;
  --lt-danger: #DC2626;
  --lt-info: #2563EB;
  
  /* Tier colors */
  --tier-a: #D4AF37;  /* gold */
  --tier-b: #C0C0C0;  /* silver */
  --tier-c: #CD7F32;  /* bronze */
  --tier-d: #6B7280;  /* gray */
  
  /* Neutral */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-900: #111827;
}
```

### 12.2 Typography

```css
font-family: 'Inter', 'Be Vietnam Pro', -apple-system, sans-serif;

/* Mobile */
- h1: 24px / 600 / 1.2
- h2: 20px / 600 / 1.3
- h3: 18px / 500 / 1.4
- body: 16px / 400 / 1.5
- caption: 14px / 400 / 1.4
- micro: 12px / 400 / 1.3

/* Web (16px base) */
- h1: 32px / 600
- h2: 24px / 600
- h3: 20px / 500
- body: 16px / 400
- caption: 14px
```

### 12.3 Component patterns

- **Tier Badge**: Pill shape, color theo tier, text white
- **Score Card**: Border-left 4px solid color, large number, label small below
- **Order Status Pill**: Different colors per status, with icon
- **Evidence Card** (bank portal): Image preview + tap to enlarge
- **Signature Pad**: Full-width canvas, "Clear" + "Submit" buttons

### 12.4 Mobile UX principles

- **One thumb operation**: CTA buttons placed bottom 1/3 of screen
- **Confirmation first**: All destructive/financial actions require dual-tap or PIN
- **Loading states**: Skeleton screens, no spinners > 2s
- **Offline indicator**: Persistent top banner when offline
- **Vietnamese first**: All text Vietnamese, English as fallback

### 12.5 Accessibility

- Min touch target 44×44px
- Contrast ratio ≥ 4.5:1 (WCAG AA)
- Screen reader labels for all icons
- Numeric input shows large number pad
- Font size respects system settings (no fixed px for body)

### 12.6 Tone of voice

- **Farmer app**: Thân mật ("anh/chị"), simple words, avoid jargon. Bad: "Khoản phải thu đã được tokenize" → Good: "Hợp đồng số đã sẵn sàng để ngân hàng xem xét"
- **3 Cùng app**: Professional but warm, technical terms OK
- **Admin/Bank**: Formal, full technical terms

---

## 13. Build Order — 3 Sprint

### Sprint 1 (Tuần 1-4): Core Onboarding & Ordering

**Goals**: Demo được pha A và B1 + B2 (đến confirm delivery).

**Tasks**:

1. Setup monorepo (Turborepo or Nx) — 0.5 day
2. Hyperledger Fabric local network via Docker Compose — 1 day
3. Implement chaincode 1, 2, 3 (createPassport, requestSupply, confirmDelivery) — 4 days
4. Backend API: auth + farmer + order endpoints — 3 days
5. Farmer app: F-01, F-02, F-03, F-04, F-05, F-06 — 5 days
6. 3 Cùng app: T-01, T-02, T-04 (onboarding mode), T-05 — 4 days
7. Admin web: A-01, A-02, A-03 — 3 days
8. Seed data + test E2E scenario 1 — 1 day
9. Demo prep + bug fixes — 1.5 days

**Acceptance**:
- ✓ Onboard 1 farmer end-to-end → see QR code
- ✓ Farmer orders 1 supply package → smart contract assigns Tier-based payment
- ✓ Driver+farmer dual-sign delivery → credit score +10 shown live

### Sprint 2 (Tuần 5-8): SCF Financial Loop

**Goals**: Pha B3 hoàn chỉnh + Bank Portal.

**Tasks**:

1. Chaincode 4, 5 (tokenizeAR, approveDisbursement) — 2 days
2. Mock core banking endpoint — 1 day
3. Bank web portal: B-01 to B-05 — 5 days
4. Token marketplace integration with admin web — 2 days
5. Notification system (websocket or polling) — 2 days
6. Test scenario 2 — 1 day
7. Polish UX + edge cases — 3 days
8. Buffer + demo prep — 4 days

**Acceptance**:
- ✓ After delivery confirmed → token auto-listed on marketplace
- ✓ Banker reviews evidence → approves with discount rate slider
- ✓ Mock disbursement → LT admin sees cash arriving
- ✓ Realistic discount calculation (face value × discount × time-to-maturity)

### Sprint 3 (Tuần 9-12): Farming Score + Settlement

**Goals**: Pha B4 + B5 đầy đủ.

**Tasks**:

1. Chaincode 6, 7, 8, 9 (recordInspection, harvestSettlement, updateTier, triggerInsurance) — 4 days
2. SRP template + scoring logic — 2 days
3. 3 Cùng inspection UI (T-06) — 4 days
4. Drone photo mock upload + AI alert simulator — 2 days
5. Weather oracle cron job — 1 day
6. Settlement flow in admin web (A-04 enhanced) — 2 days
7. Farmer score animations + tier upgrade celebration UX — 2 days
8. Full end-to-end demo run-through — 2 days
9. Final polish + documentation — 1 day

**Acceptance**:
- ✓ Technician completes inspection → score updates live
- ✓ Multiple inspections → score trends correctly
- ✓ Harvest → settlement → tier upgrade with celebration
- ✓ Insurance trigger (manual test) → bank settled early
- ✓ Full 6-phase cycle demos in 7 minutes

---

## 14. Demo Script

**Audience**: Hội đồng giảng viên + đại diện ngân hàng (giả lập)
**Duration**: 7 phút
**Setup**: 4 màn hình (Farmer phone, 3-Cung phone, Admin web, Bank web)

### Phút 0:00 — Mở đầu (15s)

Người dẫn: "Anh Tư là nông dân An Giang vừa được Lộc Trời mời vào hệ thống. Đây là vụ đầu tiên của anh. Hãy theo dõi 1 vụ mùa của anh diễn ra trong 7 phút."

### Phút 0:15 — Pha A Onboarding (45s)

- Mở 3-Cung phone: Chị Lan nhập thông tin anh Tư
- Live drag map vẽ ruộng
- Capture CCCD + portrait
- Anh Tư ký
- Submit → QR Hộ chiếu số xuất hiện
- "Anh Tư bây giờ là Tier D, score 0"

### Phút 1:00 — Pha B1 Đặt vật tư (1 phút)

- Switch to Farmer phone (anh Tư's): Login → Dashboard
- Tap "Đặt vật tư" → wizard
- Step qua đến payment: chỉ option "DEPOSIT_30" enabled
- "Vì là Tier D, anh phải cọc 30%"
- Ký số → success
- Switch sang Admin web: thấy order vừa tạo trên dashboard

### Phút 2:00 — Pha B2 Giao + Mint (1 phút)

- 3-Cung phone (đóng vai driver): scan QR
- Tick items → driver sign
- Pass to Farmer phone → anh Tư sign
- Submit → animation "+10 Credit Score"
- Switch Admin: thấy "Token TKN-xxx vừa được mint, face value 10.5M"

### Phút 3:00 — Pha B3 Bank giải ngân (1 phút)

- Switch Bank web (chị Hà — MB Bank)
- Marketplace: new token appears
- Click → evidence drill-down (show tabs: contract → signatures → field photos placeholder)
- Approve at 7.5% discount
- Live calculation: "Disbursed 10.37M VND"
- Submit → mock API roundtrip → success
- Switch Admin: SCF report: "+10.37M from MB Bank"
- "Lộc Trời vừa nhận tiền tươi trong 30 giây, không phải chờ 90 ngày"

### Phút 4:00 — Pha B4 Drone + 3-Cùng (1 phút)

- Admin: trigger drone upload (mock — pre-uploaded photo)
- AI alert: "NDVI 0.45 — kiểm tra ruộng anh Tư"
- 3-Cung phone: receives alert → T-06 Inspection
- Quickly scroll 41 items, click "All pass" demo button
- Sign + submit
- Live: Farming Score "0 → 392"
- Farmer phone: notification + animation

### Phút 5:00 — Pha B5 Thu hoạch (1 phút)

- Admin: input harvest data (yield 6 tấn, grade A, base price 8.000)
- Click "Compute settlement"
- Preview: gross = 6000 × (8000 + 500 premium) = 51M
- Deduct debt = 10.5M
- Net to LT (via bank) = 10.37M
- Net to farmer = 30.13M
- Submit settlement
- Farmer phone: "🎉 Bạn nhận 30.130.000 VNĐ. Lên Tier C!"
- Admin: tier change event in log

### Phút 6:00 — Tổng kết (1 phút)

- Quay lại Farmer dashboard: Tier C, Farming 392, Credit 310
- Bank dashboard: realized return X% trong 60 ngày
- "Vụ tới anh Tư sẽ được Tier C — không cần cọc nữa, chỉ trả tiền mặt"
- "Lộc Trời đã giải tỏa 10.4M dòng tiền trong khi xưa phải vay nợ chịu lãi"

### Phút 7:00 — Q&A

---

## 15. Definition of Done

Một feature/screen được coi là DONE khi đạt tất cả checklist sau:

### General checklist

- [ ] Code merged vào `main` branch (sau code review)
- [ ] TypeScript không có error
- [ ] Lint pass (ESLint + Prettier)
- [ ] Unit test cho business logic (coverage ≥ 60%)
- [ ] E2E test (Playwright cho web, Detox cho mobile) cho happy path
- [ ] No console error/warning trong dev mode
- [ ] Documented trong README của module

### Smart contract checklist

- [ ] Chaincode test (Go test) cho từng function, coverage ≥ 80%
- [ ] Validation rules đầy đủ (xem section 6)
- [ ] Events emit đúng schema
- [ ] Error codes consistent
- [ ] Tested với `peer chaincode invoke` từ CLI

### UI/UX checklist

- [ ] Match design spec (Section 12)
- [ ] Tested trên Android (mobile) hoặc Chrome+Firefox (web)
- [ ] Mobile: tested portrait orientation min screen 360×640
- [ ] Loading states implemented
- [ ] Error states implemented (toast hoặc inline)
- [ ] Vietnamese text correct (không lỗi chính tả)
- [ ] Accessibility: keyboard nav cho web, screen reader labels

### API checklist

- [ ] Request/response match TypeScript interface
- [ ] Validation với Zod schema
- [ ] Auth + role check
- [ ] Audit log entry created
- [ ] Tx hash returned khi liên quan chain

---

## 16. Out of Scope

Các tính năng được nhắc trong báo cáo nhưng **không** build trong MVP, để rõ ràng tránh scope creep:

| Feature | Lý do out of scope |
|---|---|
| Carbon credit tokenization | Cần MRV system riêng, market chưa rõ |
| Real SAP S/4HANA integration | Cần SAP license + 1-2 tháng setup |
| Real drone DJI integration | Cần SDK + hardware, chỉ mock |
| Real bank core banking API | Cần partnership thật, mock đủ demo |
| Multi-tenant (nhiều LT-like company) | Outside scope, focus 1 doanh nghiệp |
| Real Control Union audit integration | Pre-seed signed certs |
| AI vision cho drone analysis | Mock với pre-defined rules |
| Public traceability portal cho consumer | Chỉ trong rộng portal admin, không expose B2C |
| Mobile push notification production | Dùng in-app only |
| Multi-language (English UI) | Vietnamese only |
| Production-grade monitoring (Datadog, Sentry) | Console log đủ |
| Load testing > 1000 concurrent | Demo với < 10 users |

---

## Appendix

### A. Glossary

- **AR (Accounts Receivable)**: Khoản phải thu — số tiền nông dân nợ Lộc Trời sau khi nhận vật tư
- **AR Token / Asset Token**: Token số trên Hyperledger Fabric đại diện AR, có thể trade
- **Chaincode**: Smart contract trên Hyperledger Fabric (~ Solidity của Ethereum)
- **Consortium Blockchain**: Mạng permissioned do nhóm tổ chức quản trị (đối lập Public)
- **Digital ID / Hộ chiếu số**: Định danh số duy nhất của nông dân trên chain
- **HTX**: Hợp tác xã
- **IPFS**: InterPlanetary File System — distributed storage cho file lớn
- **MRV**: Measurement, Reporting, Verification — chuẩn đo lường carbon
- **NDVI**: Normalized Difference Vegetation Index — chỉ số xanh tươi cây trồng (0-1)
- **Oracle**: Cầu nối đưa dữ liệu thực tế lên blockchain
- **Parametric Insurance**: Bảo hiểm chi trả tự động theo chỉ số (không cần claim)
- **SCF**: Supply Chain Finance — tài trợ chuỗi cung ứng
- **SRP**: Sustainable Rice Platform — chuẩn quốc tế canh tác lúa bền vững (41 tiêu chí)
- **Tier**: Hạng nông dân A/B/C/D dựa trên overall score
- **3 Cùng**: Lực lượng kỹ thuật viên Lộc Trời (cùng ăn, cùng ở, cùng làm với nông dân)

### B. Tham khảo

- Báo cáo gốc nhóm 3 UEH 2026 — "Ứng dụng Blockchain trong quản lý chuỗi cung ứng tài chính - Lộc Trời AgriChain"
- Hyperledger Fabric Docs — https://hyperledger-fabric.readthedocs.io/
- IBM Food Trust whitepaper
- Sustainable Rice Platform Standard v2.1 — https://www.sustainablerice.org/
- Tập đoàn Lộc Trời Báo cáo thường niên 2023

### C. Naming Conventions

- Branch: `feat/<sprint>-<short-desc>`, `fix/<short-desc>`, `chore/<short-desc>`
- Commit: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- File: kebab-case (`order-detail.tsx`), Component: PascalCase (`OrderDetail`)
- API path: kebab-case (`/farmer-profiles`)
- DB column: snake_case
- Smart contract function: camelCase
- Env vars: SCREAMING_SNAKE (`FABRIC_CHANNEL_NAME`)

### D. Environment Variables (.env example)

```bash
# Backend API
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:pass@localhost:5432/agrichain
REDIS_URL=redis://localhost:6379
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>

# Hyperledger Fabric
FABRIC_CHANNEL_NAME=agrichain-channel
FABRIC_CHAINCODE_NAME=agrichain
FABRIC_CONNECTION_PROFILE_PATH=./fabric-network/connection.json
FABRIC_USER_ID=admin
FABRIC_USER_SECRET=adminpw

# IPFS (Pinata)
PINATA_API_KEY=<key>
PINATA_API_SECRET=<secret>
PINATA_GATEWAY=https://gateway.pinata.cloud

# Mock services
MOCK_BANK_API=http://localhost:4001
MOCK_SAP_API=http://localhost:4002
MOCK_WEATHER_API=http://localhost:4003

# Encryption
ENCRYPTION_MASTER_KEY=<32-byte-base64-key>
```

---

## END OF FILE

> **Phiên bản**: 1.0
> **Cập nhật cuối**: 2026-05-13
> **Maintainer**: Nhóm 3 — Project Lộc Trời AgriChain
> **License**: Educational use only

> **Hướng dẫn cho AI agent đọc file này**: Đọc tuần tự từ Section 0 đến 16. Khi bắt đầu một task cụ thể (ví dụ "build screen F-04"), tham chiếu chéo Section 9.1 (UI spec) + Section 5 (Data Model) + Section 7 (API) + Section 10 (Workflow) + Section 12 (Design system). Không bỏ qua Section 8 (Scoring) khi implement bất kỳ logic liên quan đến score/tier. Luôn kiểm tra Section 11 (test scenarios) trước khi commit code.
