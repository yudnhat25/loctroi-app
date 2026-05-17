import { useState } from "react";
import { getTier, MAX_FARMING, calcHarvestRevenue, getPremiumPerKg } from "../lib/scoring";

// Cán bộ thu mua lúa cuối vụ.
// Điều kiện UNLOCK harvest cho 1 nông dân:
//   1. Nông dân đã nhận ít nhất 1 lô vật tư (transactions có "Đã giao")
//   2. Đã có ít nhất 1 lần kiểm tra SRP trên blockchain
// Khi cả 2 điều kiện thoả → cho phép thu hoạch.
// Tính: Sản lượng (kg) = diện tích × YIELD_PER_HA. Tiền lúa = SL × (giá + premium SRP). Trừ công nợ vật tư → ròng.
const HarvestTab = ({ staff, farmers, transactions, invoices, blockchainLog, onSettleHarvest, formatVND, basePrice }) => {
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [moisture, setMoisture] = useState(14); // %
  const [impurity, setImpurity] = useState(2);  // %
  const [step, setStep] = useState("idle"); // idle | weighing | confirm | done

  const myHarvests = blockchainLog.filter(l => l.action === "HARVEST_SETTLED" && l.data.includes(staff.id)).length;

  // Tính eligibility cho từng farmer
  const eligibility = farmers.map(f => {
    const hasDelivery = transactions.some(t => t.nongHoId === f.id && t.trangThai === "Đã giao");
    const hasInspection = blockchainLog.some(l => l.action === "FIELD_INSPECTION" && l.data.includes(f.hoTen));
    const alreadyHarvested = blockchainLog.some(l => l.action === "HARVEST_SETTLED" && l.data.includes(f.hoTen));
    return { farmer: f, hasDelivery, hasInspection, alreadyHarvested, eligible: hasDelivery && hasInspection && !alreadyHarvested };
  });

  const eligibleCount = eligibility.filter(e => e.eligible).length;

  const startHarvest = (f) => {
    setSelectedFarmer(f);
    setStep("weighing");
    setMoisture(14);
    setImpurity(2);
    setTimeout(() => setStep("confirm"), 1800);
  };

  const finalize = () => {
    if (!selectedFarmer) return;
    const farmerInvoices = invoices.filter(i => i.nongHoId === selectedFarmer.id && !["Đã tất toán"].includes(i.trangThai));
    const debt = farmerInvoices.reduce((s, i) => s + (i.amount ?? 0), 0);
    const rev = calcHarvestRevenue(selectedFarmer, basePrice);
    const netPay = rev.grossPay - debt;
    onSettleHarvest({
      farmer: selectedFarmer,
      yieldKg: rev.yieldKg,
      pricePerKg: rev.pricePerKg,
      premium: rev.premium,
      grossPay: rev.grossPay,
      debt,
      netPay,
      moisture,
      impurity,
      operator: staff,
      relatedInvoices: farmerInvoices.map(i => i.id),
    });
    setStep("done");
    setTimeout(() => { setStep("idle"); setSelectedFarmer(null); }, 2500);
  };

  return (
    <div className="space-y-5 sm:space-y-6 fade-in pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 text-white">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-rose-700" />
        <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-5 sm:pb-6">
          <div className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">Giám đốc Vùng · điều phối thu mua (V3)</div>
          <h2 className="text-[22px] sm:text-[28px] font-display font-semibold tracking-tight mt-1.5 leading-tight">
            Thu hoạch và tất toán bao tiêu
          </h2>
          <p className="text-[13px] sm:text-[14px] text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Cuối vụ: cân lúa, tính tiền theo công thức <b className="text-white">Sản lượng × (Giá bao tiêu + Premium SRP)</b>,
            trừ công nợ vật tư, chuyển khoản, cập nhật
            <b className="text-white"> +200/+100 Credit Score</b>. Mỗi phiên cân tạo 1 lô lúa sẵn sàng gom vào HĐ buyer xuất khẩu ở tab <b className="text-white">HĐ Buyer & Factoring</b>.
          </p>
          <div className="mt-5 sm:mt-6 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-xl overflow-hidden">
            <Stat label="Hộ đủ điều kiện" value={eligibleCount} />
            <Stat label="Tổng hộ liên kết" value={farmers.length} />
            <Stat label="Hộ đã tất toán" value={myHarvests} />
            <Stat label="Giá bao tiêu" value={`${basePrice.toLocaleString("vi-VN")}`} sub="đ/kg" />
          </div>
        </div>
      </section>

      {/* Eligibility legend */}
      <section className="bg-white rounded-2xl border border-surface-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2 sm:mb-3">Điều kiện mở khoá thu hoạch</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[13px] sm:text-[14px]">
          <CondTag ok={true} label="Vật tư đã giao (B3 ký số)" />
          <CondTag ok={true} label="Ít nhất 1 lần kiểm tra SRP" />
          <CondTag ok={true} label="Chưa tất toán vụ này" />
        </div>
      </section>

      {/* Farmer list with eligibility */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-[13px] sm:text-sm font-bold text-gray-800">Danh sách hộ — chọn để thu hoạch</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 p-3 sm:p-4">
          {eligibility.map(({ farmer: f, hasDelivery, hasInspection, alreadyHarvested, eligible }) => {
            const tier = getTier(f);
            const fs = f.farmingScore ?? 0;
            const premium = getPremiumPerKg(fs);
            const yieldKg = Math.round(f.dienTich * 6000);
            const grossPay = yieldKg * (basePrice + premium);
            return (
              <div key={f.id} className={`border-2 rounded-xl p-3 transition-all ${eligible ? "border-rose-200 bg-rose-50/40 hover:border-rose-400" : "border-slate-200 bg-slate-50 opacity-75"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm text-gray-900">{f.hoTen}</p>
                    <p className="text-[11px] font-mono text-slate-500">{f.digitalId ?? f.id}</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${tier.badge}`}>Tier {tier.code}</span>
                </div>
                <div className="text-[12px] text-slate-600 mb-2">{f.htx} · {f.dienTich} ha</div>

                {/* Conditions */}
                <div className="space-y-1 mb-3">
                  <CondLine ok={hasDelivery} label="Vật tư đã giao" />
                  <CondLine ok={hasInspection} label="SRP đã kiểm tra" />
                  {alreadyHarvested && <CondLine ok={false} label="Đã thu hoạch (vụ này)" warn />}
                </div>

                {/* Yield estimate */}
                <div className="bg-white rounded-lg p-2 border border-slate-200 mb-3 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ước SL ({f.dienTich}ha × 6t):</span>
                    <span className="font-bold text-gray-900">{(yieldKg/1000).toFixed(1)}t</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Premium SRP (FS {Math.round(fs/MAX_FARMING*100)}%):</span>
                    <span className="font-bold text-emerald-700">+{premium}đ/kg</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1 mt-1">
                    <span className="text-slate-500 font-bold">Doanh thu lúa:</span>
                    <span className="font-bold text-rose-700">{formatVND(grossPay)}</span>
                  </div>
                </div>

                <div
                  onClick={() => eligible && step === "idle" && startHarvest(f)}
                  className={`text-[14px] font-semibold rounded-lg py-2 text-center transition-colors select-none ${
                    eligible && step === "idle" ? "bg-rose-700 hover:bg-rose-800 text-white cursor-pointer" : "bg-surface-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {alreadyHarvested ? "Đã tất toán" : eligible ? "Thu hoạch và tất toán" : "Chưa đủ điều kiện"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weighing / settlement modal */}
      {selectedFarmer && step !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/60 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 max-h-[95vh] sm:max-h-[92vh] flex flex-col">
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-slate-100 bg-rose-50/40 gap-3">
              <h3 className="text-[14px] sm:text-base font-bold text-gray-900 truncate">🌾 Thu hoạch — {selectedFarmer.hoTen}</h3>
              <button aria-label="Đóng" onClick={() => { setStep("idle"); setSelectedFarmer(null); }} className="text-slate-400 hover:text-slate-700 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 shrink-0">&times;</button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-5 space-y-4 safe-pb">
              {step === "weighing" && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-8 text-center">
                  <div className="text-5xl mb-3">⚖️</div>
                  <h3 className="text-base font-bold">Cân điện tử đang đo sản lượng + chất lượng...</h3>
                  <p className="text-xs text-slate-400 mt-1">Tự động ghi: Sản lượng · Độ ẩm · Tỷ lệ tạp chất</p>
                  <div className="mt-4 max-w-md mx-auto h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-rose-400 to-amber-400" style={{ width: "85%", animation: "pulse 1.2s ease-in-out infinite" }} />
                  </div>
                </div>
              )}

              {step === "confirm" && (() => {
                const farmerInvoices = invoices.filter(i => i.nongHoId === selectedFarmer.id && !["Đã tất toán"].includes(i.trangThai));
                const debt = farmerInvoices.reduce((s, i) => s + (i.amount ?? 0), 0);
                const rev = calcHarvestRevenue(selectedFarmer, basePrice);
                const netPay = rev.grossPay - debt;
                return (
                  <>
                    {/* Weight readout */}
                    <div className="bg-slate-900 text-white rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-[11px] text-slate-400 font-bold uppercase">Sản lượng cân được</div>
                        <div className="text-2xl font-bold text-emerald-400">{(rev.yieldKg/1000).toFixed(2)}<span className="text-xs"> t</span></div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-bold uppercase">Độ ẩm</div>
                        <input type="number" min="10" max="20" step="0.5" value={moisture} onChange={e => setMoisture(parseFloat(e.target.value))}
                          className="w-full bg-white text-slate-900 border border-surface-200 rounded-md py-1.5 px-3" />
                        <div className="text-[11px] text-slate-500 mt-0.5">%</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400 font-bold uppercase">Tạp chất</div>
                        <input type="number" min="0" max="10" step="0.1" value={impurity} onChange={e => setImpurity(parseFloat(e.target.value))}
                          className="w-full bg-white text-slate-900 border border-surface-200 rounded-md py-1.5 px-3" />
                        <div className="text-[11px] text-slate-500 mt-0.5">%</div>
                      </div>
                    </div>

                    {/* Settlement table */}
                    <div className="bg-slate-50 rounded-xl border-2 border-slate-200 p-4 space-y-2 text-sm">
                      <Row label={`Sản lượng ${selectedFarmer.dienTich} ha × 6 tấn/ha:`} value={`${rev.yieldKg.toLocaleString("vi-VN")} kg`} />
                      <Row label={`Giá bao tiêu cơ sở:`} value={formatVND(basePrice) + "/kg"} />
                      <Row label={`Premium SRP (Farming Score ${Math.round((selectedFarmer.farmingScore/MAX_FARMING)*100)}%):`} value={`+${rev.premium}đ/kg`} hi={rev.premium > 0} />
                      <Row label={`→ Giá thanh toán = ${basePrice.toLocaleString("vi-VN")} + ${rev.premium}:`} value={formatVND(rev.pricePerKg) + "/kg"} />
                      <hr className="border-slate-200" />
                      <Row label={`💰 Doanh thu lúa (${rev.yieldKg.toLocaleString("vi-VN")} kg × ${rev.pricePerKg.toLocaleString("vi-VN")}đ):`} value={formatVND(rev.grossPay)} bold />
                      <Row label={`💸 Trừ công nợ vật tư (${farmerInvoices.length} hoá đơn):`} value={`− ${formatVND(debt)}`} red />
                      <hr className="border-slate-300" />
                      <Row label={`💵 Nông dân nhận thực tế:`} value={formatVND(netPay)} bold green={netPay > 0} red={netPay < 0} />
                    </div>

                    {/* Credit Score impact */}
                    <div className="bg-cyan-50 rounded-xl p-3 border border-cyan-200 text-xs text-cyan-900">
                      <b>📈 Tác động Credit Score sau khi tất toán:</b><br/>
                      <span className="text-emerald-700">+200</span> đ giao đủ sản lượng cam kết ·
                      <span className="text-emerald-700"> +100</span> trả nợ đúng hạn ·
                      tổng <b className="text-emerald-700">+300 Credit</b> → có thể lên Tier kế tiếp.
                    </div>

                    <div className="flex gap-3">
                      <div onClick={() => { setStep("idle"); setSelectedFarmer(null); }} className="flex-1 text-center py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm cursor-pointer hover:bg-slate-50 select-none">
                        Hủy
                      </div>
                      <div onClick={finalize} className="flex-1 text-center py-3 rounded-lg text-white font-semibold text-[14px] cursor-pointer select-none bg-rose-700 hover:bg-rose-800 transition-colors">
                        Ký số và tất toán Smart Contract
                      </div>
                    </div>
                  </>
                );
              })()}

              {step === "done" && (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-8 text-center">
                  <div className="text-6xl mb-3">🎉</div>
                  <h3 className="text-lg font-bold text-emerald-900">Tất toán thành công!</h3>
                  <p className="text-sm text-emerald-700 mt-1">Tiền đã chuyển khoản · Credit Score đã +300 · Có thể đã lên Tier.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Row = ({ label, value, bold, green, red, hi }) => (
  <div className="flex justify-between items-center">
    <span className={`text-xs ${bold ? "font-bold text-gray-800" : "text-slate-600"}`}>{label}</span>
    <span className={`${bold ? "text-base font-bold" : "text-sm font-semibold"} ${green ? "text-emerald-700" : red ? "text-red-700" : hi ? "text-emerald-700" : "text-gray-800"}`}>{value}</span>
  </div>
);

const CondLine = ({ ok, label, warn }) => (
  <div className="flex items-center gap-1.5 text-[11px]">
    <span className={ok ? "text-emerald-600" : warn ? "text-amber-600" : "text-slate-400"}>{ok ? "✅" : warn ? "⚠️" : "⏳"}</span>
    <span className={ok ? "text-emerald-700 font-bold" : warn ? "text-amber-700" : "text-slate-500"}>{label}</span>
  </div>
);

const CondTag = ({ ok, label }) => (
  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] ${ok ? "bg-brand-50 text-brand-800 ring-1 ring-brand-200" : "bg-surface-50 text-slate-500 ring-1 ring-surface-200"}`}>
    {ok ? (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
    ) : <span className="w-3.5 h-3.5 rounded-full border border-current"></span>}
    <span className="font-medium">{label}</span>
  </div>
);

const Stat = ({ label, value, sub }) => (
  <div className="bg-slate-900 px-3 sm:px-4 py-3 sm:py-3.5">
    <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
    <div className="font-display text-[20px] sm:text-[26px] font-semibold tabular leading-none mt-2 sm:mt-2.5 text-white break-words">{value}</div>
    {sub && <div className="text-[11px] sm:text-[12px] text-slate-500 mt-1 sm:mt-1.5">{sub}</div>}
  </div>
);

export default HarvestTab;
