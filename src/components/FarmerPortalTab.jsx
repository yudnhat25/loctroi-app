import { useState, useMemo } from "react";
import {
  getTier,
  getOverallScore,
  getNextTierGap,
  getPremiumPerKg,
  MAX_FARMING,
  MAX_CREDIT,
} from "../lib/scoring";

// ─── Tokens cho mỗi Tier (hero solid + chip) ──────────────────────────────────
const TIER_TOKENS = {
  A: { bg: "bg-brand-700",  hi: "bg-brand-600",  ringSoft: "ring-brand-200",  text: "text-brand-800",  shadow: "shadow-[0_24px_48px_-24px_rgba(37,91,59,0.45)]" },
  B: { bg: "bg-sky-800",    hi: "bg-sky-600",    ringSoft: "ring-sky-200",    text: "text-sky-800",    shadow: "shadow-[0_24px_48px_-24px_rgba(7,89,133,0.45)]" },
  C: { bg: "bg-amber-700",  hi: "bg-amber-500",  ringSoft: "ring-amber-200",  text: "text-amber-800",  shadow: "shadow-[0_24px_48px_-24px_rgba(180,83,9,0.45)]" },
  D: { bg: "bg-rose-800",   hi: "bg-rose-600",   ringSoft: "ring-rose-200",   text: "text-rose-800",   shadow: "shadow-[0_24px_48px_-24px_rgba(159,18,57,0.4)]" },
};

const STATUS_STYLE = {
  "Chờ xác nhận":       { dot: "bg-amber-500",  label: "Chờ xác nhận",       cls: "text-amber-800 bg-amber-50 ring-amber-200" },
  "Đã token hóa":       { dot: "bg-sky-500",    label: "Đã token hóa",        cls: "text-sky-800 bg-sky-50 ring-sky-200" },
  "Chào bán ngân hàng": { dot: "bg-amber-600",  label: "Chào bán ngân hàng",  cls: "text-amber-900 bg-amber-50 ring-amber-200" },
  "Đã giải ngân":       { dot: "bg-brand-600",  label: "Đã giải ngân",        cls: "text-brand-800 bg-brand-50 ring-brand-200" },
  "Nợ xấu":             { dot: "bg-rose-600",   label: "Nợ xấu",              cls: "text-rose-800 bg-rose-50 ring-rose-200" },
  "Đã tất toán":        { dot: "bg-slate-400",  label: "Đã tất toán",         cls: "text-slate-600 bg-surface-100 ring-surface-200" },
  "Từ chối duyệt vay":  { dot: "bg-slate-500",  label: "Bị từ chối",          cls: "text-slate-700 bg-surface-100 ring-surface-200" },
};

// ─── Tính 5 bước tiến độ vụ mùa từ on-chain events ──────────────────────────
function computeProgress(farmer, blockchainLog, supplyRequests, transactions, invoices) {
  const isMine = (l) => l?.data?.includes(farmer.hoTen) || l?.data?.includes(farmer.id);
  const firstLog = (action) => blockchainLog.slice().reverse().find(l => l.action === action && isMine(l));

  const pendingReq = supplyRequests.find(r => r.farmer.id === farmer.id);
  const supplyRequestedLog = firstLog("SUPPLY_REQUESTED");
  const supplyApprovedLog  = firstLog("SUPPLY_APPROVED");
  const deliveryLog        = firstLog("DELIVERY_CONFIRMED");
  const inspectionLog      = firstLog("FIELD_INSPECTION");
  const harvestLog         = firstLog("HARVEST_SETTLED");

  const step1Date = pendingReq?.date ?? supplyRequestedLog?.timestamp;
  const step2Date = supplyApprovedLog?.timestamp;
  const step3Date = deliveryLog?.timestamp ?? transactions.find(t => t.nongHoId === farmer.id)?.ngay;
  const step4Date = inspectionLog?.timestamp;
  const step5Date = harvestLog?.timestamp;

  return [
    { key: "supply",     label: "Đăng ký vật tư",            done: !!step1Date, date: step1Date },
    { key: "contract",   label: "HĐ smart contract duyệt",   done: !!step2Date, date: step2Date },
    { key: "delivery",   label: "Giao vật tư và ký số",      done: !!step3Date, date: step3Date },
    { key: "inspection", label: "Kiểm tra SRP thực địa",     done: !!step4Date, date: step4Date },
    { key: "harvest",    label: "Thu hoạch và tất toán",     done: !!step5Date, date: step5Date },
  ];
}

// Xác định vụ mùa hiện tại + giống lúa + ngày thứ X/110 từ activity
function deriveCurrentSeason(farmer, supplyRequests, invoices, blockchainLog) {
  const mySupplyReq = supplyRequests.find(r => r.farmer.id === farmer.id);
  const myInvoice   = invoices.find(i => i.nongHoId === farmer.id && i.trangThai !== "Đã tất toán");
  const season = mySupplyReq?.season ?? myInvoice?.vuMua ?? "Vụ Đông Xuân 2026-2027";

  // Giống: ưu tiên field giong, nếu không có thì parse từ supplyRequest items
  let giong = farmer.giong;
  if (!giong && mySupplyReq?.items) {
    const giongItem = mySupplyReq.items.find(it => it.ten?.toLowerCase().includes("giống"));
    giong = giongItem?.ten?.replace(/Giống lúa\s+/i, "").trim();
  }
  giong = giong ?? "OM 5451";

  // Ngày thứ X/110: tính từ ngày Đăng ký vật tư (step 1)
  const startLog = blockchainLog.slice().reverse().find(l =>
    l.action === "SUPPLY_REQUESTED" && (l.data?.includes(farmer.hoTen) || l.data?.includes(farmer.id))
  );
  const startISO = mySupplyReq?.date ?? startLog?.timestamp;
  const day = startISO
    ? Math.min(110, Math.max(0, Math.floor((Date.now() - new Date(startISO).getTime()) / 86_400_000)))
    : 0;

  return { season: season.replace(/^Vụ\s+/i, ""), giong, day, totalDays: 110 };
}

// Status badge cho vụ hiện tại (theo trạng thái farmer + tiến độ)
function deriveSeasonStatus(farmer, progress) {
  const harvested = progress.find(p => p.key === "harvest")?.done;
  const inspected = progress.find(p => p.key === "inspection")?.done;
  const delivered = progress.find(p => p.key === "delivery")?.done;
  const requested = progress.find(p => p.key === "supply")?.done;

  if (farmer.trangThai === "Cảnh báo")    return { label: "Cảnh báo",         dot: "bg-rose-500",   cls: "text-rose-800 bg-rose-50 ring-rose-200" };
  if (harvested)                          return { label: "Đã tất toán vụ này", dot: "bg-slate-500", cls: "text-slate-700 bg-surface-100 ring-surface-200" };
  if (delivered && inspected)             return { label: "Sẵn sàng thu hoạch", dot: "bg-brand-500", cls: "text-brand-800 bg-brand-50 ring-brand-200" };
  if (delivered)                          return { label: "Đang canh tác",      dot: "bg-brand-500", cls: "text-brand-800 bg-brand-50 ring-brand-200" };
  if (requested)                          return { label: "Chờ giao vật tư",    dot: "bg-amber-500", cls: "text-amber-800 bg-amber-50 ring-amber-200" };
  return { label: "Chưa khởi động vụ", dot: "bg-slate-400", cls: "text-slate-600 bg-surface-100 ring-surface-200" };
}

const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }) : null;

// ─────────────────────────────────────────────────────────────────────────────
const FarmerPortalTab = ({ farmer, supplyRequests = [], invoices, transactions, droneReports, blockchainLog, formatVND, onSubmitSCF, onRequestSupply, onReportHarvest }) => {
  const [showPassport, setShowPassport] = useState(false);

  const myInvoices = invoices.filter(i => i.nongHoId === farmer.id);
  const myLogs     = blockchainLog.filter(l => l.data?.includes(farmer.hoTen) || l.data?.includes(farmer.id));

  const tier = getTier(farmer);
  const tok = TIER_TOKENS[tier.code] ?? TIER_TOKENS.D;
  const overall = getOverallScore(farmer);
  const nextGap = getNextTierGap(farmer);
  const credit = farmer.creditScore ?? 0;
  const farming = farmer.farmingScore ?? 0;
  const creditPct = (credit / MAX_CREDIT) * 100;
  const farmingPct = (farming / MAX_FARMING) * 100;
  const premium = getPremiumPerKg(farming);

  const progress = useMemo(
    () => computeProgress(farmer, blockchainLog, supplyRequests, transactions ?? [], invoices),
    [farmer, blockchainLog, supplyRequests, transactions, invoices]
  );
  const doneCount = progress.filter(s => s.done).length;
  const harvestEligible = progress[2].done && progress[3].done && !progress[4].done;

  const season = useMemo(
    () => deriveCurrentSeason(farmer, supplyRequests, invoices, blockchainLog),
    [farmer, supplyRequests, invoices, blockchainLog]
  );
  const seasonStatus = useMemo(() => deriveSeasonStatus(farmer, progress), [farmer, progress]);

  const tierLabel = (tier.label.split("—")[1] ?? tier.label).trim();

  return (
    <div className="space-y-6 fade-in pb-10">

      {/* ─── HERO TIER (solid theo Tier, dáng cards mobile) ─────────────────── */}
      <section className={`relative rounded-3xl ${tok.bg} ${tok.shadow} text-white overflow-hidden`}>
        {/* texture: chỉ 2 vòng nhẹ trên góc, không ảnh hưởng readability */}
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/[0.06]"></div>
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white/[0.04]"></div>

        <div className="relative px-7 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/75">
                Hộ chiếu Số · Lộc Trời
              </div>
              <div className="flex items-end gap-3 mt-3">
                <span className="font-display font-bold text-[88px] leading-[0.85] tabular">{tier.code}</span>
                <span className="text-[16px] font-semibold tracking-wide text-white/85 pb-3">{tierLabel}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">Overall Score</div>
              <div className="font-display text-[44px] font-bold tabular leading-none mt-1.5">
                {overall}<span className="text-[15px] text-white/65 font-normal ml-1">/1000</span>
              </div>
            </div>
          </div>

          {/* Progress strip: FARMING + CREDIT */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <ScorePill icon="leaf"   label="FARMING" value={farming} max={MAX_FARMING} pct={farmingPct} />
            <ScorePill icon="bank"   label="CREDIT"  value={credit}  max={MAX_CREDIT}  pct={creditPct} />
          </div>

          {/* Perks message: VIP hoặc nextGap */}
          <div className="mt-4 bg-white/[0.13] ring-1 ring-white/15 rounded-xl px-4 py-3 flex items-center gap-2.5">
            {tier.code === "A" ? (
              <>
                <span className="text-[18px]">👑</span>
                <span className="text-[14px] font-semibold text-white/95">
                  Đã đạt tier cao nhất, nhận đầy đủ quyền lợi VIP
                </span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                <span className="text-[13px] text-white/90">
                  Còn <b className="tabular text-white">{nextGap.gap}</b> điểm để lên Tier {nextGap.next?.code}
                </span>
                {premium > 0 && (
                  <span className="ml-auto text-[11px] text-white/70">Premium SRP +{premium}đ/kg</span>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── QUICK ACTIONS (3 ô, không gồm Drone) ───────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <QuickAction
          icon="cart"
          label="Đặt vật tư"
          sub="Đầu vụ mới"
          onClick={() => onRequestSupply(farmer)}
          accent="bg-brand-50 text-brand-700 ring-brand-200"
        />
        <QuickAction
          icon="wheat"
          label="Thu hoạch"
          sub={harvestEligible ? "Sẵn sàng báo" : progress[4].done ? "Đã tất toán" : "Cần đủ điều kiện"}
          onClick={harvestEligible ? () => onReportHarvest(farmer) : undefined}
          disabled={!harvestEligible}
          accent="bg-amber-50 text-amber-700 ring-amber-200"
        />
        <QuickAction
          icon="id"
          label="Hộ chiếu"
          sub={showPassport ? "Đang hiện" : "Xem QR + DID"}
          onClick={() => setShowPassport(v => !v)}
          accent="bg-sky-50 text-sky-700 ring-sky-200"
          active={showPassport}
        />
      </section>

      {/* ─── CURRENT SEASON ─────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-surface-200 px-6 py-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`w-12 h-12 rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-200 flex items-center justify-center shrink-0`}>
              <SeedlingIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Vụ hiện tại</div>
              <div className="font-display text-[20px] font-semibold tracking-tight text-slate-900 mt-0.5">{season.season}</div>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold ring-1 ${seasonStatus.cls} shrink-0`}>
            <span className={`w-1.5 h-1.5 rounded-full ${seasonStatus.dot}`}></span>
            {seasonStatus.label}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-px bg-surface-200 rounded-xl overflow-hidden mt-5">
          <SeasonStat label="Diện tích" value={`${farmer.dienTich} ha`} />
          <SeasonStat label="Giống"      value={season.giong} small />
          <SeasonStat label="Ngày thứ"   value={`${season.day}/${season.totalDays}`} />
        </div>
      </section>

      {/* ─── PROGRESS TIMELINE 5 BƯỚC ───────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-surface-200 px-6 py-5">
        <div className="flex items-baseline justify-between mb-5">
          <h3 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight">Tiến độ vụ mùa</h3>
          <span className="text-[12px] font-semibold px-2.5 py-1 rounded-md bg-brand-50 text-brand-800 ring-1 ring-brand-200 tabular">
            {doneCount}/5 bước
          </span>
        </div>

        <ol className="relative space-y-4">
          {/* Đường nối dọc */}
          <span className="absolute left-[18px] top-3 bottom-3 w-[2px] bg-surface-200" aria-hidden></span>
          {progress.map((step, i) => {
            const isNext = !step.done && progress.slice(0, i).every(s => s.done);
            return (
              <li key={step.key} className="relative pl-12 flex items-center justify-between gap-4 min-h-[40px]">
                {/* Step dot */}
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center ring-2 ring-white ${
                    step.done
                      ? "bg-brand-600 text-white"
                      : isNext
                        ? "bg-white ring-brand-600 text-brand-700 ring-2"
                        : "bg-surface-100 text-slate-400"
                  }`}
                >
                  {step.done ? (
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  ) : (
                    <span className="text-[13px] font-semibold tabular">{i + 1}</span>
                  )}
                </span>
                <div className="min-w-0">
                  <p className={`text-[15px] ${step.done ? "font-semibold text-slate-900" : isNext ? "font-semibold text-brand-800" : "text-slate-500"}`}>
                    {step.label}
                  </p>
                  {step.done && step.date && (
                    <p className="text-[12px] text-slate-500 mt-0.5 tabular">{fmtDate(step.date)}</p>
                  )}
                  {isNext && (
                    <p className="text-[12px] text-amber-700 mt-0.5">Đang chờ bước này</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {harvestEligible && (
          <button
            onClick={() => onReportHarvest(farmer)}
            className="mt-5 w-full bg-rose-700 hover:bg-rose-800 text-white font-semibold py-3 rounded-xl text-[14px] transition-colors"
          >
            Báo Lộc Trời tới cân lúa và tất toán
          </button>
        )}
      </section>

      {/* ─── DIGITAL ID POP-UP (Hộ chiếu số) ────────────────────────────── */}
      {showPassport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm fade-in" onClick={() => setShowPassport(false)}>
          <div className="relative max-w-[400px] w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowPassport(false)}
              className="absolute -top-12 right-0 text-white hover:text-slate-200 transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <section className="bg-[#486C52] rounded-[24px] p-3 sm:p-5 relative overflow-hidden shadow-2xl">
              <div className="bg-white rounded-[20px] overflow-hidden">
                {/* Top White Section */}
                <div className="px-6 pt-6 pb-5 relative">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#486C52] rounded-lg flex items-center justify-center text-white font-bold text-[16px]">
                        LT
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TẬP ĐOÀN LỘC TRỜI</div>
                        <div className="text-[14px] font-bold text-slate-800 mt-0.5">Hộ chiếu Số · AgriChain v2</div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-white font-bold text-[13px] ${tok.bg}`}>
                      Tier {tier.code}
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="mt-8 flex flex-col items-center">
                    <div className="w-[180px] h-[180px] bg-white p-2">
                      <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-900">
                        <path d="M0,0 h30 v30 h-30 z M5,5 v20 h20 v-20 z M10,10 h10 v10 h-10 z" />
                        <path d="M70,0 h30 v30 h-30 z M75,5 v20 h20 v-20 z M80,10 h10 v10 h-10 z" />
                        <path d="M0,70 h30 v30 h-30 z M5,75 v20 h20 v-20 z M10,80 h10 v10 h-10 z" />
                        <rect x="40" y="0" width="20" height="10" />
                        <rect x="40" y="20" width="10" height="10" />
                        <rect x="50" y="40" width="40" height="10" />
                        <rect x="0" y="40" width="30" height="10" />
                        <rect x="40" y="40" width="10" height="30" />
                        <rect x="80" y="60" width="20" height="10" />
                        <rect x="50" y="80" width="20" height="20" />
                        <rect x="80" y="80" width="20" height="20" />
                        <rect x="60" y="60" width="10" height="10" />
                        <rect x="20" y="55" width="10" height="10" />
                        <rect x="35" y="85" width="10" height="10" />
                      </svg>
                    </div>
                    <div className="mt-4 text-center">
                      <div className="text-[22px] font-display font-bold text-slate-900">{farmer.hoTen}</div>
                      <div className="text-[14px] font-mono font-semibold text-brand-700 mt-1">{farmer.digitalId ?? farmer.id}</div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-dashed border-slate-200 my-5"></div>

                  {/* Details */}
                  <div className="space-y-3 text-[14px]">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">HTX</span>
                      <span className="font-semibold text-slate-900">{farmer.htx ?? "—"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Địa chỉ</span>
                      <span className="font-semibold text-slate-900 text-right max-w-[200px] truncate">{farmer.diaChi ?? "—"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Diện tích</span>
                      <span className="font-semibold text-slate-900">{farmer.dienTich} ha</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Tham gia hệ thống</span>
                      <span className="font-semibold text-slate-900">15/3/2024</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Mạng</span>
                      <span className="font-semibold text-slate-900">LocTroi-AgriChain-v2</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Trạng thái</span>
                      <div className={`flex items-center gap-1.5 font-bold ${farmer.trangThai === "Đang canh tác" ? "text-[#486C52]" : "text-rose-600"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${farmer.trangThai === "Đang canh tác" ? "bg-[#486C52]" : "bg-rose-600"}`}></span>
                        {farmer.trangThai === "Đang canh tác" ? "ACTIVE" : "WARNED"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Green Section */}
                <div className="bg-[#5A7E62] px-6 py-5 text-white/95 text-[13px] leading-relaxed">
                  <div className="font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-[16px]">📌</span> Hướng dẫn sử dụng
                  </div>
                  <ul className="space-y-2 font-medium">
                    <li>• Đưa QR cho tài xế Lộc Trời khi giao vật tư</li>
                    <li>• Đưa QR cho cán bộ 3 Cùng khi kiểm tra ruộng</li>
                    <li>• Đưa QR khi cân lúa thu hoạch cuối vụ</li>
                    <li>• Mọi giao dịch quét QR đều ghi vào blockchain</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ─── INVOICES + SCF ACTIONS ─────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-200 flex items-baseline justify-between gap-4 flex-wrap">
          <div className="flex items-baseline gap-3">
            <h3 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight">Hóa đơn và khoản phải thu</h3>
            <span className="text-[12px] font-mono text-slate-400">{myInvoices.length} hoá đơn</span>
          </div>
          <div className="flex items-center gap-3 text-[12px]">
            <span className="text-slate-500">Đã nhận <b className="text-brand-700 font-display tabular text-[14px] ml-1">{formatVND(myInvoices.filter(i => i.trangThai === "Đã giải ngân").reduce((s,i)=>s+i.amount,0))}</b></span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">Đang chờ <b className="text-amber-700 font-display tabular text-[14px] ml-1">{formatVND(myInvoices.filter(i => !["Đã giải ngân","Đã tất toán"].includes(i.trangThai)).reduce((s,i)=>s+i.amount,0))}</b></span>
          </div>
        </div>
        {myInvoices.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-surface-100 flex items-center justify-center text-slate-400 mb-3">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12h6M9 16h6M5 20V6a2 2 0 012-2h8l4 4v12a2 2 0 01-2 2H7a2 2 0 01-2-2z"/></svg>
            </div>
            <p className="text-[14px] text-slate-600">Chưa có hóa đơn cho vụ mùa này.</p>
            <button onClick={() => onRequestSupply(farmer)} className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold text-brand-700 hover:text-brand-800">
              Đặt vật tư đầu vụ ngay
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-surface-200">
            {myInvoices.map(inv => {
              const cfg = STATUS_STYLE[inv.trangThai] ?? STATUS_STYLE["Chờ xác nhận"];
              return (
                <li key={inv.id} className="px-6 py-4 hover:bg-surface-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-[13px] font-semibold text-slate-700">{inv.id}</span>
                        {inv.tokenId && (
                          <span className="text-[11px] bg-sky-50 text-sky-800 ring-1 ring-sky-200 px-1.5 py-0.5 rounded-md font-semibold font-mono">{inv.tokenId}</span>
                        )}
                      </div>
                      <div className="text-[13px] text-slate-500">{inv.vuMua} · {new Date(inv.date).toLocaleDateString("vi-VN")}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-[19px] font-semibold tabular text-slate-900">{formatVND(inv.amount)}</div>
                      <span className={`mt-1 inline-flex items-center gap-1.5 text-[12px] px-2 py-0.5 rounded-md font-semibold ring-1 ${cfg.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                  {inv.trangThai === "Đã token hóa" && (
                    <div className="mt-3 pt-3 border-t border-surface-200 flex justify-end">
                      <button
                        onClick={() => onSubmitSCF(inv)}
                        className="bg-sky-700 hover:bg-sky-800 text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
                      >
                        Ký yêu cầu vay vốn SCF
                      </button>
                    </div>
                  )}
                  {inv.trangThai === "Chào bán ngân hàng" && (
                    <div className="mt-3 pt-3 border-t border-surface-200 text-right">
                      <span className="text-[12px] text-amber-700 font-semibold">
                        Đang chờ ngân hàng duyệt hợp đồng…
                      </span>
                    </div>
                  )}
                  {inv.recourseStatus && (
                    <div className="mt-3 px-3 py-2 rounded-lg bg-rose-50 ring-1 ring-rose-200 text-[12px] text-rose-800">
                      {inv.recourseStatus === "DEFAULTED" && "Đã khai báo thiên tai, chờ Oracle xác minh"}
                      {inv.recourseStatus === "INSURANCE_CLAIMED" && `Bảo hiểm đang xử lý: ${formatVND(inv.insurancePayout ?? 0)}`}
                      {inv.recourseStatus === "RECOURSE_SETTLED" && "Đã tất toán, Lộc Trời đã bảo lãnh cho bạn"}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ─── BLOCKCHAIN TIMELINE (compact) ──────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-surface-200 px-6 py-5">
        <div className="flex items-baseline justify-between mb-5">
          <h3 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight">Lịch sử trên blockchain</h3>
          <span className="text-[12px] font-mono text-slate-400">{myLogs.length} blocks</span>
        </div>
        {myLogs.length === 0 ? (
          <p className="text-[14px] text-slate-500 text-center py-6">Chưa có giao dịch nào.</p>
        ) : (
          <ol className="relative space-y-3.5 before:absolute before:left-[7px] before:top-1 before:bottom-1 before:w-px before:bg-surface-200">
            {myLogs.slice(0, 8).map((log, idx) => (
              <li key={idx} className="relative pl-6">
                <span className={`absolute left-0 top-1 w-[15px] h-[15px] rounded-full ring-2 ring-white ${logDot(log.action)}`} />
                <div className="bg-surface-50/80 rounded-lg px-3.5 py-2.5 ring-1 ring-surface-200">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ring-1 ${logBadge(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">#{log.hash}</span>
                    <span className="text-[11px] text-slate-400 ml-auto">{new Date(log.timestamp).toLocaleString("vi-VN")}</span>
                  </div>
                  <p className="text-[13px] text-slate-700 leading-relaxed">{log.data}</p>
                </div>
              </li>
            ))}
            {myLogs.length > 8 && (
              <li className="pl-6 text-[12px] text-slate-500">+ {myLogs.length - 8} block trước đó</li>
            )}
          </ol>
        )}
      </section>

    </div>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────
const ScorePill = ({ icon, label, value, max, pct }) => (
  <div className="bg-white/[0.12] ring-1 ring-white/10 rounded-xl px-4 py-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon === "leaf"
          ? <LeafIcon className="w-3.5 h-3.5 text-white/85" />
          : <BankIcon className="w-3.5 h-3.5 text-white/85" />}
        <span className="text-[12px] font-semibold tracking-[0.14em] text-white/85">{label}</span>
      </div>
      <div className="font-display text-[18px] font-semibold tabular text-white leading-none">
        {value}<span className="text-[11px] text-white/65 font-normal ml-0.5">/{max}</span>
      </div>
    </div>
    <div className="h-1.5 bg-white/15 rounded-full overflow-hidden mt-2.5">
      <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  </div>
);

const QuickAction = ({ icon, label, sub, onClick, accent, disabled, active }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`group relative bg-white rounded-2xl border ${active ? "border-brand-600 ring-1 ring-brand-200" : "border-surface-200"} px-3 py-4 flex flex-col items-center text-center transition-colors ${
      disabled ? "opacity-50 cursor-not-allowed" : "hover:border-surface-300 cursor-pointer"
    }`}
  >
    <span className={`w-12 h-12 rounded-xl ring-1 ${accent} flex items-center justify-center`}>
      {icon === "cart"  && <CartIcon  className="w-6 h-6" />}
      {icon === "wheat" && <WheatIcon className="w-6 h-6" />}
      {icon === "id"    && <IdIcon    className="w-6 h-6" />}
    </span>
    <span className="text-[14px] font-semibold text-slate-900 mt-3">{label}</span>
    <span className="text-[11px] text-slate-500 mt-0.5">{sub}</span>
  </button>
);

const SeasonStat = ({ label, value, small }) => (
  <div className="bg-white px-4 py-3.5">
    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div>
    <div className={`font-display ${small ? "text-[15px]" : "text-[20px]"} font-semibold tabular text-slate-900 mt-1.5 leading-tight`}>
      {value}
    </div>
  </div>
);

const Row = ({ k, v, color = "text-slate-200" }) => (
  <div className="flex items-baseline justify-between gap-3">
    <span className="text-slate-500 shrink-0">{k}</span>
    <span className={`font-semibold ${color} truncate`}>{v}</span>
  </div>
);

const logDot = (action) => {
  if (action === "LOAN_DEFAULT")        return "bg-rose-500";
  if (action === "INSURANCE_TRIGGERED") return "bg-amber-500";
  if (action === "RECOURSE_SETTLED")    return "bg-slate-700";
  if (action === "LOAN_DISBURSED")      return "bg-brand-600";
  if (action === "INVOICE_TOKENIZED")   return "bg-sky-600";
  if (action === "HARVEST_SETTLED")     return "bg-rose-600";
  return "bg-brand-500";
};
const logBadge = (action) => {
  if (action === "LOAN_DEFAULT")        return "bg-rose-50 text-rose-800 ring-rose-200";
  if (action === "INSURANCE_TRIGGERED") return "bg-amber-50 text-amber-800 ring-amber-200";
  if (action === "RECOURSE_SETTLED")    return "bg-surface-100 text-slate-700 ring-surface-200";
  if (action === "LOAN_DISBURSED")      return "bg-brand-50 text-brand-800 ring-brand-200";
  if (action === "INVOICE_TOKENIZED")   return "bg-sky-50 text-sky-800 ring-sky-200";
  if (action === "HARVEST_SETTLED")     return "bg-rose-50 text-rose-800 ring-rose-200";
  return "bg-brand-50 text-brand-800 ring-brand-200";
};

// ─── Inline icons (no external lib) ─────────────────────────────────────────
const CartIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h2l.4 2M7 13h11l3-8H6"/>
    <circle cx="9" cy="20" r="1.5"/>
    <circle cx="17" cy="20" r="1.5"/>
  </svg>
);
const WheatIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22V8"/>
    <path d="M12 8c-2 0-4-1.5-4-4 2 0 4 1.5 4 4z"/>
    <path d="M12 8c2 0 4-1.5 4-4-2 0-4 1.5-4 4z"/>
    <path d="M12 14c-2.5 0-4.5-2-4.5-4.5 2.5 0 4.5 2 4.5 4.5z"/>
    <path d="M12 14c2.5 0 4.5-2 4.5-4.5-2.5 0-4.5 2-4.5 4.5z"/>
    <path d="M12 20c-2.5 0-4.5-2-4.5-4.5 2.5 0 4.5 2 4.5 4.5z"/>
    <path d="M12 20c2.5 0 4.5-2 4.5-4.5-2.5 0-4.5 2-4.5 4.5z"/>
  </svg>
);
const IdIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2"/>
    <circle cx="9" cy="12" r="2.5"/>
    <path d="M14 10h4M14 14h4"/>
  </svg>
);
const LeafIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34 4.78 21 5.79 21 6.78 21c7.18 0 13-5.82 13-13V8h-2.78z"/>
  </svg>
);
const BankIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 22h18v-2H3v2zM3 10v8h2v-8H3zm6 0v8h2v-8H9zm4 0v8h2v-8h-2zm6 0v8h2v-8h-2zM12 1L1 7v2h22V7L12 1z"/>
  </svg>
);
const SeedlingIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22V11"/>
    <path d="M12 11c-3 0-5-2-5-5h1c3 0 5 2 5 5z"/>
    <path d="M12 11c3 0 5-2 5-5h-1c-3 0-5 2-5 5z"/>
  </svg>
);

export default FarmerPortalTab;
