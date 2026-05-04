import { useState } from "react";
import {
  getTier,
  getOverallScore,
  getNextTierGap,
  getPremiumPerKg,
  MAX_FARMING,
  MAX_CREDIT,
} from "../lib/scoring";

const STATUS_STYLE = {
  "Chờ xác nhận":       { badge: "🟡 Chờ xác nhận",       cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  "Đã token hóa":       { badge: "🔵 Đã token hóa",        cls: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  "Chào bán ngân hàng": { badge: "🟠 Chào bán ngân hàng",  cls: "bg-orange-50 text-orange-700 border-orange-200" },
  "Đã giải ngân":       { badge: "🟢 Đã giải ngân",        cls: "bg-green-50 text-green-700 border-green-200" },
  "Nợ xấu":            { badge: "🔴 Nợ xấu",              cls: "bg-red-50 text-red-700 border-red-200" },
  "Đã tất toán":        { badge: "⚪ Đã tất toán",         cls: "bg-slate-100 text-slate-500 border-slate-200" },
  "Từ chối duyệt vay":  { badge: "⚫ Bị từ chối",          cls: "bg-gray-100 text-gray-500 border-gray-200" },
};

// ─── Farmer Dashboard ─────────────────────────────────────────────────────────
const FarmerDashboard = ({ farmer, invoices, transactions, blockchainLog, droneReports, formatVND, onLogout, onSubmitSCF, onRequestSupply, onReportHarvest }) => {
  const myInvoices = invoices.filter(i => i.nongHoId === farmer.id);
  const myLogs     = blockchainLog.filter(l => l.data?.includes(farmer.hoTen) || l.data?.includes(farmer.id));
  const totalReceived = myInvoices.filter(i => i.trangThai === "Đã giải ngân").reduce((s, i) => s + i.amount, 0);
  const totalPending  = myInvoices.filter(i => !["Đã giải ngân","Đã tất toán"].includes(i.trangThai)).reduce((s, i) => s + i.amount, 0);

  // Thu hoạch — điều kiện 3-trong-1 (đối chiếu với HarvestTab)
  const hasDelivery   = (transactions ?? []).some(t => t.nongHoId === farmer.id && t.trangThai === "Đã giao");
  const hasInspection = blockchainLog.some(l => l.action === "FIELD_INSPECTION" && l.data?.includes(farmer.hoTen));
  const hasDroneReport = (droneReports ?? []).some(r => r.farmerId === farmer.id);
  const alreadyHarvested = blockchainLog.some(l => l.action === "HARVEST_SETTLED" && l.data?.includes(farmer.hoTen));
  const harvestEligible = hasDelivery && hasInspection && !alreadyHarvested;

  const tier = getTier(farmer);
  const overall = getOverallScore(farmer);
  const nextGap = getNextTierGap(farmer);
  const credit = farmer.creditScore ?? 0;
  const farming = farmer.farmingScore ?? 0;
  const creditPct = (credit / MAX_CREDIT) * 100;
  const farmingPct = (farming / MAX_FARMING) * 100;
  const premium = getPremiumPerKg(farming);

  return (
    <div className="space-y-6 fade-in pb-10">
      {/* Profile header — Tier theme */}
      <div className={`bg-gradient-to-r ${tier.color} rounded-2xl p-6 text-white shadow-lg`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-inner">
              {farmer.hoTen.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{farmer.hoTen}</h2>
              <p className="text-white/80 text-sm">{farmer.htx ?? farmer.diaChi}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="font-mono text-white/90 text-xs bg-white/15 px-2 py-0.5 rounded">{farmer.digitalId ?? farmer.id}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${tier.badge}`}>🌟 {tier.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tier KPIs */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">Overall Score</div>
            <div className="text-2xl font-bold">{overall}<span className="text-sm font-normal">/1000</span></div>
            {nextGap.next && <div className="text-[10px] text-white/80">còn {nextGap.gap}đ → Tier {nextGap.next.code}</div>}
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">Hạn mức</div>
            <div className="text-lg font-bold">{(farmer.hanMucTinDung/1e6).toFixed(0)}M VNĐ</div>
            <div className="text-[10px] text-white/80">{farmer.dienTich} ha</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">Quyền lợi</div>
            <div className="text-sm font-bold leading-tight">{tier.payment}</div>
            <div className="text-[10px] text-white/80">Lãi {tier.rateLabel}</div>
          </div>
        </div>
      </div>

      {/* 2-score breakdown card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4">📊 Hai lớp điểm tín dụng</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Credit Score */}
          <div className="border border-cyan-100 rounded-xl p-4 bg-cyan-50/30">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs font-bold text-cyan-700">🔗 Credit Score (40% trọng số)</div>
                <div className="text-[10px] text-slate-500">100% on-chain · trustless · không giả mạo được</div>
              </div>
              <div className="text-2xl font-bold text-cyan-700">{credit}<span className="text-xs">/{MAX_CREDIT}</span></div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${creditPct}%` }} />
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Tự động: ký nhận vật tư (+10), trả nợ đúng hạn (+100), bao tiêu đủ sản lượng (+200)</p>
          </div>

          {/* Farming Score */}
          <div className="border border-emerald-100 rounded-xl p-4 bg-emerald-50/30">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs font-bold text-emerald-700">🌾 Farming Score (60% trọng số)</div>
                <div className="text-[10px] text-slate-500">Oracle người (Lộc Trời 3 Cùng + drone NDVI)</div>
              </div>
              <div className="text-2xl font-bold text-emerald-700">{farming}<span className="text-xs">/{MAX_FARMING}</span></div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${farmingPct}%` }} />
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Premium SRP: {premium > 0 ? `+${premium}đ/kg lúa cuối vụ` : "chưa đạt — cần FS ≥ 360 (60%)"}</p>
          </div>
        </div>

        {/* Quyền lợi tier */}
        <div className="mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="text-xs font-bold text-slate-700 mb-2">✨ Quyền lợi Tier {tier.code} hiện tại:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {tier.perks.map((p, i) => (
              <div key={i} className="text-[11px] text-slate-600 flex items-center gap-2">
                <span className="text-emerald-500">✓</span>{p}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">💰</div>
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Đã nhận vốn</div>
            <div className="text-xl font-bold text-green-600">{formatVND(totalReceived)}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">⏳</div>
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Đang chờ giải ngân</div>
            <div className="text-xl font-bold text-orange-600">{formatVND(totalPending)}</div>
          </div>
        </div>
      </div>

      {/* B5 — Báo thu hoạch */}
      <div className={`rounded-2xl border-2 shadow-sm p-5 ${harvestEligible ? "border-rose-300 bg-rose-50/40" : "border-slate-200 bg-slate-50"}`}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${harvestEligible ? "bg-rose-100" : "bg-slate-200"}`}>🌾</div>
            <div>
              <div className="text-sm font-bold text-gray-900">B5 — Báo thu hoạch &amp; Tất toán</div>
              <div className="text-xs text-slate-500">Cuối vụ: cân lúa, nhận tiền theo bao tiêu + Premium SRP, +300 Credit Score.</div>
            </div>
          </div>
          {alreadyHarvested ? (
            <div className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-bold">✅ Đã tất toán</div>
          ) : harvestEligible ? (
            <div onClick={() => onReportHarvest?.(farmer)} className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-sm select-none">
              📞 Báo Lộc Trời tới thu hoạch
            </div>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-slate-200 text-slate-500 text-xs font-bold">🔒 Chưa đủ điều kiện</div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 text-[11px]">
          <CondLine ok={hasDelivery} label="① Vật tư đã giao (B3 ký số)" />
          <CondLine ok={hasInspection} label="② Đã kiểm tra SRP (B4)" />
          <CondLine ok={hasDroneReport} label="③ Có ảnh drone (khuyến nghị)" optional />
        </div>
        {harvestEligible && (
          <div className="mt-3 bg-white rounded-lg p-3 border border-rose-200 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Ước SL ({farmer.dienTich} ha × 6 tấn/ha):</span>
              <span className="font-bold">{(farmer.dienTich * 6).toFixed(1)} tấn</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Premium SRP:</span>
              <span className="font-bold text-emerald-700">+{premium}đ/kg</span>
            </div>
          </div>
        )}
      </div>


      {/* My Invoices */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-gray-800">📄 Hóa đơn & Khoản phải thu</h3>
            <span className="text-xs text-slate-400 font-semibold">{myInvoices.length} hóa đơn</span>
          </div>
          <div
            onClick={() => onRequestSupply(farmer)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-sm select-none"
          >
            🛒 Yêu cầu vật tư vụ mới
          </div>
        </div>
        {myInvoices.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm font-semibold">Chưa có hóa đơn. Lộc Trời chưa cấp vật tư cho vụ mùa này.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {myInvoices.map(inv => {
              const cfg = STATUS_STYLE[inv.trangThai] ?? {};
              return (
                <div key={inv.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-slate-600">{inv.id}</span>
                        {inv.tokenId && (
                          <span className="text-[10px] bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded font-bold">{inv.tokenId}</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{inv.vuMua} · {new Date(inv.date).toLocaleDateString("vi-VN")}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-700 text-base">{formatVND(inv.amount)}</div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${cfg.cls}`}>{cfg.badge}</span>
                    </div>
                  </div>
                  {/* Actions for Farmer */}
                  {inv.trangThai === "Đã token hóa" && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                      <div
                        onClick={() => onSubmitSCF(inv)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm inline-flex items-center gap-2 select-none"
                      >
                        <span>🏦</span> Ký yêu cầu vay vốn SCF
                      </div>
                    </div>
                  )}
                  {inv.trangThai === "Chào bán ngân hàng" && (
                     <div className="mt-3 pt-3 border-t border-slate-100 text-right">
                       <span className="text-xs text-orange-500 font-bold italic animate-pulse">Đang chờ ngân hàng duyệt hợp đồng...</span>
                     </div>
                  )}

                  {/* Recourse info */}
                  {inv.recourseStatus && (
                    <div className="mt-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs">
                      <span className="font-bold text-red-700">
                        {inv.recourseStatus === "DEFAULTED" && "🌊 Đã khai báo thiên tai — chờ Oracle xác minh"}
                        {inv.recourseStatus === "INSURANCE_CLAIMED" && `🛡️ Bảo hiểm đang xử lý — ${formatVND(inv.insurancePayout ?? 0)}`}
                        {inv.recourseStatus === "RECOURSE_SETTLED" && "✅ Đã tất toán — Lộc Trời đã bảo lãnh cho bạn"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Blockchain activity */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" style={{animation:"ping 1.2s ease-in-out infinite"}}></span>
          ⛓️ Lịch sử Blockchain của tôi
        </h3>
        {myLogs.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Chưa có giao dịch blockchain cho hộ này.</p>
        ) : (
          <div className="relative border-l-2 border-slate-100 ml-3 space-y-4">
            {myLogs.map((log, idx) => (
              <div key={idx} className="relative pl-6">
                <div className="absolute -left-[11px] top-0.5 w-5 h-5 bg-white border-2 border-green-200 rounded-full flex items-center justify-center shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-3">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold whitespace-nowrap ${
                      log.action === "LOAN_DEFAULT" ? "bg-red-200 text-red-800" :
                      log.action === "INSURANCE_TRIGGERED" ? "bg-amber-100 text-amber-800" :
                      log.action === "RECOURSE_SETTLED" ? "bg-purple-100 text-purple-800" :
                      log.action === "LOAN_DISBURSED" ? "bg-emerald-100 text-emerald-800" :
                      log.action === "INVOICE_TOKENIZED" ? "bg-cyan-100 text-cyan-800" :
                      "bg-green-100 text-green-800"
                    }`}>{log.action}</span>
                    <span className="font-mono text-[10px] text-green-700 font-bold">#{log.hash}</span>
                    <span className="text-[10px] text-slate-400 ml-auto">{new Date(log.timestamp).toLocaleString("vi-VN")}</span>
                  </div>
                  <p className="text-xs text-slate-600">{log.data}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Digital ID card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🪪</span>
          <span className="text-sm font-bold text-slate-300">Digital ID — Hyperledger Fabric</span>
        </div>
        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">DID</span>
            <span className="text-green-400 font-bold">{farmer.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Guarantor</span>
            <span className="text-cyan-400">LOC-TROI-CORP</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Network</span>
            <span className="text-purple-300">LocTroi-AgriChain-v2</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status</span>
            <span className={`font-bold ${farmer.trangThai === "Đang canh tác" ? "text-green-400" : "text-red-400"}`}>
              {farmer.trangThai === "Đang canh tác" ? "ACTIVE" : "WARNED"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">MSP</span>
            <span className="text-slate-300">FarmerMSP</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Helper ──────────────────────────────────────────────────────────────────
const CondLine = ({ ok, label, optional }) => (
  <div className="flex items-center gap-1.5">
    <span className={ok ? "text-emerald-600" : optional ? "text-slate-400" : "text-rose-500"}>
      {ok ? "✅" : optional ? "○" : "⏳"}
    </span>
    <span className={ok ? "text-emerald-700 font-bold" : "text-slate-500"}>{label}</span>
  </div>
);

// ─── Main export ─────────────────────────────────────────────────────────────
const FarmerPortalTab = ({ farmer, invoices, transactions, droneReports, blockchainLog, formatVND, onSubmitSCF, onRequestSupply, onReportHarvest }) => {
  return (
    <FarmerDashboard
      farmer={farmer}
      invoices={invoices}
      transactions={transactions}
      droneReports={droneReports}
      blockchainLog={blockchainLog}
      formatVND={formatVND}
      onSubmitSCF={onSubmitSCF}
      onRequestSupply={onRequestSupply}
      onReportHarvest={onReportHarvest}
      onLogout={() => {}} // Logout now handled globally
    />
  );
};


export default FarmerPortalTab;
