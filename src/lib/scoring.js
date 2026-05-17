// Hệ thống chấm điểm 2 lớp + tier-based finance cho LocTroi AgriChain
// Credit Score (40%, max 400)  + Farming Score (60%, max 600) = Overall (0-1000)

export const MAX_CREDIT = 400;
export const MAX_FARMING = 600;
export const MAX_OVERALL = 1000;

// 4 Tier với quyền lợi tài chính khác biệt
export const TIERS = {
  A: {
    code: "A",
    label: "Tier A — VIP",
    range: [700, 1000],
    color: "from-emerald-600 to-green-700",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    payment: "Trả sau 100% cuối vụ",
    deposit: 0,            // % cọc trước
    creditPct: 100,        // % được ghi nợ (trả sau)
    bonusBaoTieu: true,    // bao tiêu lúa
    rateLabel: "5.5%/năm",
    rate: 0.055,
    perks: [
      "Vật tư trả sau 100%",
      "Bao tiêu giá cao + Premium SRP",
      "Drone phun thuốc miễn phí",
      "Lãi suất ưu đãi 5.5%",
    ],
  },
  B: {
    code: "B",
    label: "Tier B — Tin cậy",
    range: [500, 699],
    color: "from-cyan-600 to-blue-600",
    badge: "bg-cyan-100 text-cyan-800 border-cyan-200",
    payment: "Trả sau 50% + tiền mặt 50%",
    deposit: 50,
    creditPct: 50,
    bonusBaoTieu: true,
    rateLabel: "7%/năm",
    rate: 0.07,
    perks: [
      "Trả sau 50% giá trị vật tư",
      "Bao tiêu giá chuẩn",
      "Ưu tiên dịch vụ kỹ thuật",
      "Lãi 0% cho phần trả sau",
    ],
  },
  C: {
    code: "C",
    label: "Tier C — Phổ thông",
    range: [300, 499],
    color: "from-amber-500 to-orange-500",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    payment: "Trả tiền mặt 100%",
    deposit: 100,
    creditPct: 0,
    bonusBaoTieu: false,
    rateLabel: "—",
    rate: 0,
    perks: [
      "Mua vật tư thông thường",
      "Tư vấn 3 Cùng đầy đủ",
      "Có thể nâng tier sau 1-2 vụ",
    ],
  },
  D: {
    code: "D",
    label: "Tier D — Cảnh báo / Mới",
    range: [0, 299],
    color: "from-rose-500 to-red-600",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
    payment: "Cọc 30% trước, không bao tiêu",
    deposit: 30,
    creditPct: 70,
    bonusBaoTieu: false,
    rateLabel: "9%/năm",
    rate: 0.09,
    perks: [
      "Bắt buộc cọc 30% trước",
      "Không bao tiêu đầu ra",
      "Cần cải thiện điểm để lên Tier C",
    ],
  },
};

export const TIER_ORDER = ["D", "C", "B", "A"];

export const getOverallScore = (farmer) => {
  const c = farmer.creditScore ?? 0;
  const f = farmer.farmingScore ?? 0;
  return Math.min(MAX_OVERALL, c + f);
};

export const getTier = (farmer) => {
  const score = getOverallScore(farmer);
  if (score >= 700) return TIERS.A;
  if (score >= 500) return TIERS.B;
  if (score >= 300) return TIERS.C;
  return TIERS.D;
};

// Khoảng cách điểm để lên tier kế tiếp
export const getNextTierGap = (farmer) => {
  const score = getOverallScore(farmer);
  if (score < 300) return { next: TIERS.C, gap: 300 - score };
  if (score < 500) return { next: TIERS.B, gap: 500 - score };
  if (score < 700) return { next: TIERS.A, gap: 700 - score };
  return { next: null, gap: 0 };
};

// Premium SRP cộng vào giá lúa cuối vụ (đ/kg) dựa theo Farming Score
// FS < 60% max → 0 ; 60-80% → +200đ/kg ; >=80% → +500đ/kg
export const getPremiumPerKg = (farmingScore) => {
  const pct = (farmingScore / MAX_FARMING) * 100;
  if (pct >= 80) return 500;
  if (pct >= 60) return 200;
  return 0;
};

// Bộ checklist SRP mẫu (rút gọn 6 trong 41 tiêu chí thực tế)
export const SRP_CRITERIA = [
  { id: "density",   label: "Sạ đúng mật độ (60-70 kg/ha)",     points: 50 },
  { id: "seed",      label: "Dùng giống được khuyến cáo",         points: 30 },
  { id: "fert",      label: "Bón phân đúng quy trình",            points: 80 },
  { id: "pesticide", label: "Thuốc BVTV trong danh mục",          points: 80 },
  { id: "water",     label: "Quản lý nước tốt (drone NDVI)",      points: 70 },
  { id: "disease",   label: "Không dấu hiệu bệnh nặng",           points: 70 },
  { id: "withdrawal",label: "Tuân thủ thời gian cách ly thuốc",  points: 50 },
  { id: "ppe",       label: "An toàn lao động (PPE)",             points: 30 },
];

export const SRP_MAX = SRP_CRITERIA.reduce((s, c) => s + c.points, 0);

// Tính delta Farming Score từ checklist (số điểm + / − so với baseline)
export const calcFarmingDelta = (checked, baseline) => {
  const earned = SRP_CRITERIA
    .filter(c => checked[c.id])
    .reduce((s, c) => s + c.points, 0);
  // Quy đổi về thang 600 dựa trên tỷ lệ checklist
  const targetScore = Math.round((earned / SRP_MAX) * MAX_FARMING);
  return targetScore - (baseline ?? 0);
};

// ─── Tier rank: A=4 > B=3 > C=2 > D=1 ─────────────────────────────────────
// Nông dân tier cao có thể chọn phương thức tier thấp; tier thấp KHÔNG được chọn tier cao.
export const TIER_RANK = { A: 4, B: 3, C: 2, D: 1 };
export const canPickTier = (currentTierCode, targetTierCode) =>
  TIER_RANK[targetTierCode] <= TIER_RANK[currentTierCode];

// ─── SCF Track: phân luồng cấp vốn dựa trên track record ─────────────────────
//   FAST    — Hộ cũ (≥ 1 vụ) + Tier A/B  → token hóa & chào bán bank NGAY sau giao
//             vì bank đã tin track record, không cần đợi drone/inspect vụ này.
//   TRANCHED — Hộ mới (0 vụ) hoặc Tier C/D
//              → bán Senior tranche 70% face ngay (LT có recourse + insurance wrap)
//              → giữ Junior tranche 30%, chờ drone+inspect verify → mới bán bank.
//
// Tỷ lệ tranche & insurance fee có thể tinh chỉnh theo deal thực tế.
export const SCF_TRACK = {
  FAST:     { code: "FAST",     label: "Track 1 — Auto-SCF",  desc: "Hộ cũ Tier A/B · chào bán bank ngay" },
  TRANCHED: { code: "TRANCHED", label: "Track 2 — Tranching", desc: "Hộ mới hoặc Tier C/D · Senior 70% bán ngay, Junior 30% chờ verify" },
};

export const SENIOR_PCT = 70;   // % face value bán Senior tranche ngay
export const JUNIOR_PCT = 30;   // % face value giữ Junior chờ verify
export const INSURANCE_FEE_PCT = 5; // % face value trích vào insurance pool mỗi invoice

export const getScfTrack = (farmer) => {
  const completedSeasons = farmer?.vuMuaHoanThanh ?? 0;
  const tier = getTier(farmer).code;
  if (completedSeasons >= 1 && (tier === "A" || tier === "B")) return SCF_TRACK.FAST;
  return SCF_TRACK.TRANCHED;
};

// ─── AI gợi ý gói vật tư đầu vụ theo diện tích ──────────────────────────────
// Định mức bình quân ĐBSCL: 100kg giống/ha · 200kg NPK/ha · 2 chai BVTV/ha · 3 bao hữu cơ/ha
// AI chỉ gợi ý — nông dân vẫn có quyền sửa số lượng & chọn vật tư khác.
export const SUGGESTION_RATES = {
  S001: { perHa: 100, label: "Giống lúa OM5451",          unit: "kg" },
  S002: { perHa: 200, label: "Phân NPK 20-20-15",         unit: "kg" },
  S003: { perHa: 2,   label: "Thuốc BVTV sinh học",       unit: "chai" },
  S006: { perHa: 3,   label: "Phân hữu cơ vi sinh",       unit: "bao" },
};

export const suggestSupplyPackage = (farmer) => {
  const ha = Math.max(0.1, farmer?.dienTich ?? 1);
  return Object.entries(SUGGESTION_RATES).map(([id, r]) => ({
    supplyId: id,
    quantity: Math.max(1, Math.round(ha * r.perHa)),
    rateLabel: `${r.perHa} ${r.unit}/ha × ${ha} ha`,
  }));
};

// ─── Ước lượng sản lượng cuối vụ (kg) ───────────────────────────────────────
// Năng suất ĐBSCL trung bình: 6 tấn/ha (Đông Xuân ~7t · Hè Thu ~5.5t · Thu Đông ~5t)
export const YIELD_PER_HA = 6000; // kg/ha
export const estimateYield = (farmer) => Math.round((farmer?.dienTich ?? 0) * YIELD_PER_HA);

// Số tiền nông dân nhận từ bao tiêu (bao gồm Premium SRP)
export const calcHarvestRevenue = (farmer, basePrice) => {
  const yieldKg = estimateYield(farmer);
  const premium = getPremiumPerKg(farmer?.farmingScore ?? 0);
  const pricePerKg = basePrice + premium;
  return {
    yieldKg,
    premium,
    pricePerKg,
    grossPay: yieldKg * pricePerKg,
  };
};

// ─── BUYER RECEIVABLES FACTORING (Buyer-SCF) ────────────────────────────────
// Lộc Trời bán lúa cho buyer (Vinafood/Cargill/HSBC). Buyer trả T+30/60/90.
// LT token hóa khoản phải thu, bán cho liên minh ngân hàng để có tiền NGAY
// trả nông dân. Đây là điểm CỐT LÕI giải quyết tắc nghẽn dòng tiền.

// Giá xuất khẩu (đ/kg) — buyer trả cao hơn giá nội địa vì đã chuẩn SRP
export const BUYER_EXPORT_PRICE = 11500; // VNĐ/kg (giá benchmark FOB ĐBSCL)

// Chiết khấu bank áp lên face value khi factoring — phụ thuộc payment term
// Công thức ước lượng: discount = annualRate × (days / 365)
// Annual rate ngầm 4-8% tùy credit rating của buyer
export const BANK_FACTORING_RATE_BY_RATING = {
  "A+":  0.04,  // 4%/năm — buyer hạng A+ (HSBC, JPM, …)
  "A":   0.05,
  "BBB+":0.06,
  "BBB": 0.07,
  "BB":  0.085,
};

export const calcBankDiscount = (faceValue, paymentTermDays, creditRating) => {
  const annualRate = BANK_FACTORING_RATE_BY_RATING[creditRating] ?? 0.07;
  const discountPct = annualRate * (paymentTermDays / 365);
  const discountAmount = Math.round(faceValue * discountPct);
  const disbursedAmount = faceValue - discountAmount;
  return { annualRate, discountPct, discountAmount, disbursedAmount };
};

// Ước lượng giá trị buyer invoice từ 1 batch lô lúa (nhiều farmer gom 1 lot)
export const estimateBuyerInvoiceFromLots = (lots, exportPrice = BUYER_EXPORT_PRICE) => {
  const totalKg = lots.reduce((s, l) => s + (l.yieldKg ?? 0), 0);
  return {
    totalKg,
    faceValue: totalKg * exportPrice,
    lotCount: lots.length,
  };
};

// Status enum cho BuyerInvoice
export const BUYER_INV_STATUS = {
  DRAFT:        "Hợp đồng nháp",
  SIGNED:       "Buyer đã ký",
  TOKENIZED:    "Đã token hóa",
  OFFERED:      "Chào bán ngân hàng",
  DISBURSED:    "Đã giải ngân",
  BUYER_PAID:   "Buyer đã thanh toán",
  OVERDUE:      "Buyer trễ hạn",
  RECOURSED:    "LT đã recourse",
};
