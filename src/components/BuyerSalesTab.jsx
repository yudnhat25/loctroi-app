import { useMemo, useState } from "react";
import { BUYER_EXPORT_PRICE, calcBankDiscount, BUYER_INV_STATUS } from "../lib/scoring";

// Tab dành cho Giám đốc Vùng (Manager) — quản lý vòng đời Buyer Invoice:
//   1. Gom các harvestLots (lúa đã thu mua từ farmer) chưa được gán buyer
//   2. Chọn buyer xuất khẩu (Vinafood / Cargill / HSBC) → ký HĐ → token hóa
//   3. Chào bán cho liên minh ngân hàng → bank duyệt giải ngân T+1
//   4. Đến hạn T+30/60/90 → buyer trả vào bank → đốt token
//
// Đây là CƠ CHẾ CỐT LÕI giải quyết tắc nghẽn dòng tiền của Lộc Trời:
// thay vì đợi buyer trả 30-90 ngày, LT có tiền NGAY để trả nông dân.

const STATUS_TONE = {
  "Hợp đồng nháp":      { dot: "bg-slate-400",  cls: "text-slate-700 bg-surface-100 ring-surface-200" },
  "Buyer đã ký":        { dot: "bg-amber-500",  cls: "text-amber-800 bg-amber-50 ring-amber-200" },
  "Đã token hóa":       { dot: "bg-sky-500",    cls: "text-sky-800 bg-sky-50 ring-sky-200" },
  "Chào bán ngân hàng": { dot: "bg-amber-600",  cls: "text-amber-900 bg-amber-50 ring-amber-200" },
  "Đã giải ngân":       { dot: "bg-brand-600",  cls: "text-brand-800 bg-brand-50 ring-brand-200" },
  "Buyer đã thanh toán":{ dot: "bg-emerald-700",cls: "text-emerald-800 bg-emerald-50 ring-emerald-200" },
  "Buyer trễ hạn":      { dot: "bg-rose-600",   cls: "text-rose-800 bg-rose-50 ring-rose-200" },
  "Bank từ chối":       { dot: "bg-slate-500",  cls: "text-slate-700 bg-surface-100 ring-surface-200" },
};

const RATING_TONE = {
  "A+":   "text-emerald-700 bg-emerald-50 ring-emerald-200",
  "A":    "text-emerald-700 bg-emerald-50 ring-emerald-200",
  "BBB+": "text-sky-700 bg-sky-50 ring-sky-200",
  "BBB":  "text-amber-700 bg-amber-50 ring-amber-200",
  "BB":   "text-rose-700 bg-rose-50 ring-rose-200",
};

const BuyerSalesTab = ({ staff, harvestLots = [], buyerInvoices = [], buyers = [], blockchainLog = [], formatVND, onCreateBuyerInvoice, onBuyerPayoff }) => {
  const [pickedLotIds, setPickedLotIds] = useState([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState(buyers[0]?.id ?? null);
  const [contractRef, setContractRef] = useState("");

  // Lots chưa được gán vào buyer invoice nào
  const availableLots = useMemo(
    () => harvestLots.filter(l => !l.buyerInvoiceId),
    [harvestLots]
  );

  const selectedBuyer = buyers.find(b => b.id === selectedBuyerId);
  const pickedLots = availableLots.filter(l => pickedLotIds.includes(l.id));
  const totalKg = pickedLots.reduce((s, l) => s + l.yieldKg, 0);
  const faceValue = totalKg * BUYER_EXPORT_PRICE;
  const discountPreview = selectedBuyer && totalKg > 0
    ? calcBankDiscount(faceValue, selectedBuyer.paymentTermDays, selectedBuyer.creditRating)
    : null;

  const toggleLot = (id) => {
    setPickedLotIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => setPickedLotIds(availableLots.map(l => l.id));
  const clearAll  = () => setPickedLotIds([]);

  const submit = () => {
    if (!selectedBuyer || pickedLotIds.length === 0) return;
    onCreateBuyerInvoice({
      buyer: selectedBuyer,
      lotIds: pickedLotIds,
      manager: staff,
      contractRef: contractRef.trim() || undefined,
    });
    setPickedLotIds([]);
    setContractRef("");
  };

  // KPI strip
  const active = buyerInvoices.filter(i => ![BUYER_INV_STATUS.BUYER_PAID, "Bank từ chối"].includes(i.trangThai));
  const disbursedTotal = buyerInvoices
    .filter(i => i.trangThai === BUYER_INV_STATUS.DISBURSED || i.trangThai === BUYER_INV_STATUS.BUYER_PAID)
    .reduce((s, i) => s + (i.bankDiscount?.disbursedAmount ?? 0), 0);
  const pendingFace = buyerInvoices
    .filter(i => i.trangThai === BUYER_INV_STATUS.TOKENIZED || i.trangThai === BUYER_INV_STATUS.OFFERED)
    .reduce((s, i) => s + (i.faceValue ?? 0), 0);

  return (
    <div className="space-y-6 fade-in pb-10">
      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 text-white">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-indigo-500" />
        <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-5 sm:pb-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Buyer-SCF · Factoring khoản phải thu xuất khẩu</div>
          <h2 className="text-[22px] sm:text-[28px] font-display font-semibold tracking-tight mt-1.5 leading-tight">
            Hợp đồng Buyer & Token hóa
          </h2>
          <p className="text-[13px] sm:text-[14px] text-slate-300 mt-2 max-w-3xl leading-relaxed">
            Gom các lô lúa đã thu mua thành 1 hợp đồng xuất khẩu cho buyer (Vinafood / Cargill / HSBC),
            token hóa khoản phải thu và chào bán liên minh ngân hàng để
            <b className="text-white"> nhận tiền ngay trong T+1</b> — giải quyết tắc nghẽn dòng tiền khi buyer trả T+30/60/90.
          </p>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-xl overflow-hidden">
            <Stat label="Lô lúa chờ gom" value={availableLots.length} sub="từ phiên thu hoạch" />
            <Stat label="HĐ Buyer đang mở" value={active.length} sub="chưa thanh toán" />
            <Stat label="Face value chờ bank" value={pendingFace > 0 ? `${(pendingFace/1e9).toFixed(2)}T` : "0"} sub="VNĐ" />
            <Stat label="Bank đã giải ngân" value={disbursedTotal > 0 ? `${(disbursedTotal/1e9).toFixed(2)}T` : "0"} sub="VNĐ vào quỹ LT" />
          </div>
        </div>
      </section>

      {/* ─── Builder: gom lots + chọn buyer + token hóa ─────────────────── */}
      <section className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-200 flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-[16px] font-display font-semibold text-slate-900 tracking-tight">Tạo hợp đồng buyer mới</h3>
            <p className="text-[12px] text-slate-500 mt-0.5">Chọn lô lúa + buyer → smart contract phát hành token + chào liên minh bank.</p>
          </div>
          {availableLots.length > 0 && (
            <div className="flex items-center gap-2 text-[12px]">
              <button onClick={selectAll} className="px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 ring-1 ring-brand-200 font-semibold hover:bg-brand-100">Chọn tất cả</button>
              <button onClick={clearAll} className="px-2.5 py-1 rounded-md text-slate-600 ring-1 ring-surface-200 font-semibold hover:bg-surface-100">Bỏ chọn</button>
            </div>
          )}
        </div>

        {availableLots.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-surface-100 flex items-center justify-center text-slate-400 mb-3">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4M5 20V6a2 2 0 012-2h8l4 4v12a2 2 0 01-2 2H7a2 2 0 01-2-2z"/></svg>
            </div>
            <p className="text-[14px] text-slate-600">Chưa có lô lúa nào sẵn sàng gom.</p>
            <p className="text-[12px] text-slate-400 mt-1">Mở tab <b>Thu hoạch & Tất toán</b> để cân lúa cho hộ đủ điều kiện trước.</p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-surface-200 max-h-96 overflow-y-auto">
              {availableLots.map(lot => {
                const checked = pickedLotIds.includes(lot.id);
                return (
                  <li key={lot.id} onClick={() => toggleLot(lot.id)}
                    className={`px-5 py-3 flex items-center gap-4 cursor-pointer transition-colors ${checked ? "bg-brand-50/40" : "hover:bg-surface-50/60"}`}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggleLot(lot.id)} onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-brand-600 rounded" />
                    <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-5 gap-2 items-center">
                      <div className="min-w-0">
                        <div className="font-mono text-[12px] font-semibold text-slate-700">{lot.id}</div>
                        <div className="text-[11px] text-slate-400 truncate">{new Date(lot.date).toLocaleDateString("vi-VN")}</div>
                      </div>
                      <div className="font-semibold text-slate-900 text-[14px] truncate">{lot.farmerName}</div>
                      <div className="text-[13px] tabular text-slate-700">{(lot.yieldKg/1000).toFixed(2)} tấn</div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md ring-1 ring-emerald-200 bg-emerald-50 text-emerald-700">Tier {lot.tier}</span>
                        <span className="text-[11px] text-slate-500">FS {lot.farmingScore}</span>
                      </div>
                      <div className="text-right text-[13px] tabular text-slate-700 hidden md:block">{formatVND(lot.yieldKg * BUYER_EXPORT_PRICE)}</div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Compose form */}
            <div className="px-5 py-4 border-t border-surface-200 bg-surface-50/60 grid gap-3 md:grid-cols-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5">Buyer xuất khẩu</label>
                <select value={selectedBuyerId} onChange={e => setSelectedBuyerId(e.target.value)}
                  className="w-full border border-surface-300 rounded-lg px-3 py-2 text-[14px] bg-white">
                  {buyers.map(b => (
                    <option key={b.id} value={b.id}>{b.hoTen} — {b.creditRating} · T+{b.paymentTermDays}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5">Mã hợp đồng (tùy chọn)</label>
                <input type="text" value={contractRef} onChange={e => setContractRef(e.target.value)}
                  placeholder="LT-VNF-2026Q2" className="w-full border border-surface-300 rounded-lg px-3 py-2 text-[14px] bg-white" />
              </div>
              <div className="flex flex-col justify-end">
                <button onClick={submit} disabled={pickedLotIds.length === 0 || !selectedBuyer}
                  className={`w-full py-2.5 rounded-lg text-[14px] font-semibold transition-colors ${
                    pickedLotIds.length === 0 ? "bg-surface-200 text-slate-400 cursor-not-allowed"
                                              : "bg-indigo-700 hover:bg-indigo-800 text-white shadow-sm"
                  }`}>
                  Token hóa & chào bank
                </button>
              </div>
            </div>

            {/* Preview block */}
            {pickedLotIds.length > 0 && discountPreview && (
              <div className="px-5 py-4 border-t border-surface-200 bg-indigo-50/40">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[13px]">
                  <Preview label="Tổng sản lượng" value={`${(totalKg/1000).toFixed(2)} tấn`} sub={`${pickedLots.length} lô · ${BUYER_EXPORT_PRICE.toLocaleString("vi-VN")}đ/kg FOB`} />
                  <Preview label="Face value" value={formatVND(faceValue)} sub="khoản phải thu từ buyer" />
                  <Preview label={`Chiết khấu bank (${(discountPreview.annualRate*100).toFixed(1)}%/năm)`} value={`− ${formatVND(discountPreview.discountAmount)}`} sub={`= ${(discountPreview.discountPct*100).toFixed(2)}% × ${selectedBuyer.paymentTermDays}d`} negative />
                  <Preview label="LT nhận T+1" value={formatVND(discountPreview.disbursedAmount)} sub="vào quỹ → trả nông dân ngay" highlight />
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ─── Active buyer invoices ───────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-200">
          <h3 className="text-[16px] font-display font-semibold text-slate-900 tracking-tight">Danh mục hợp đồng buyer</h3>
          <p className="text-[12px] text-slate-500 mt-0.5">Theo dõi vòng đời mỗi hợp đồng từ token hóa → bank giải ngân → buyer thanh toán.</p>
        </div>
        {buyerInvoices.length === 0 ? (
          <div className="py-12 text-center text-[14px] text-slate-500">Chưa có hợp đồng buyer nào.</div>
        ) : (
          <ul className="divide-y divide-surface-200">
            {buyerInvoices.map(inv => {
              const tone = STATUS_TONE[inv.trangThai] ?? STATUS_TONE["Hợp đồng nháp"];
              const ratingTone = RATING_TONE[inv.buyerRating] ?? "text-slate-700 bg-surface-100 ring-surface-200";
              const isDisbursed = inv.trangThai === BUYER_INV_STATUS.DISBURSED;
              return (
                <li key={inv.id} className="px-5 py-4 hover:bg-surface-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-[13px] font-semibold text-slate-700">{inv.id}</span>
                        <span className="text-[11px] bg-sky-50 text-sky-800 ring-1 ring-sky-200 px-1.5 py-0.5 rounded-md font-semibold font-mono">{inv.tokenId}</span>
                        <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ring-1 ${ratingTone}`}>{inv.buyerRating}</span>
                      </div>
                      <div className="text-[14px] font-semibold text-slate-900">{inv.buyerName}</div>
                      <div className="text-[12px] text-slate-500 mt-0.5">
                        {inv.lotCount} lô · {(inv.totalKg/1000).toFixed(2)} tấn ·
                        HĐ <span className="font-mono">{inv.contractRef}</span> ·
                        đáo hạn {new Date(inv.maturityAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display text-[19px] font-semibold tabular text-slate-900">{formatVND(inv.faceValue)}</div>
                      <span className={`mt-1 inline-flex items-center gap-1.5 text-[12px] px-2 py-0.5 rounded-md font-semibold ring-1 ${tone.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`}></span>
                        {inv.trangThai}
                      </span>
                    </div>
                  </div>

                  {inv.bankDiscount && (
                    <div className="mt-3 grid grid-cols-3 gap-3 text-[12px]">
                      <Mini label="Bank giải ngân" value={formatVND(inv.bankDiscount.disbursedAmount)} tone="text-brand-700" />
                      <Mini label={`Chiết khấu (${(inv.bankDiscount.annualRate*100).toFixed(1)}%/năm)`} value={`− ${formatVND(inv.bankDiscount.discountAmount)}`} tone="text-amber-700" />
                      <Mini label="T+ ngày" value={`${inv.paymentTermDays}d`} tone="text-slate-700" />
                    </div>
                  )}

                  {isDisbursed && (
                    <div className="mt-3 flex justify-end">
                      <button onClick={() => onBuyerPayoff(inv)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors">
                        Buyer đã thanh toán (đóng deal)
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

const Stat = ({ label, value, sub }) => (
  <div className="bg-slate-900 px-3 sm:px-4 py-3 sm:py-3.5">
    <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
    <div className="font-display text-[20px] sm:text-[26px] font-semibold tabular leading-none mt-2 text-white break-words">{value}</div>
    {sub && <div className="text-[11px] text-slate-500 mt-1">{sub}</div>}
  </div>
);

const Preview = ({ label, value, sub, negative, highlight }) => (
  <div>
    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</div>
    <div className={`font-display text-[18px] font-semibold tabular mt-1 ${highlight ? "text-indigo-700" : negative ? "text-amber-700" : "text-slate-900"}`}>{value}</div>
    {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
  </div>
);

const Mini = ({ label, value, tone }) => (
  <div className="bg-surface-50 rounded-lg px-3 py-2 ring-1 ring-surface-200">
    <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{label}</div>
    <div className={`text-[13px] font-semibold tabular mt-0.5 ${tone}`}>{value}</div>
  </div>
);

export default BuyerSalesTab;
