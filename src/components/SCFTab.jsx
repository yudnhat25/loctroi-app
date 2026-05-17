import { useState } from "react";

// V3 SCFTab — Bank CHỈ duyệt Buyer Receivables (factoring khoản phải thu xuất khẩu)
// từ Lộc Trời. KHÔNG còn duyệt từng khoản nhỏ lẻ của hộ nông dân — vì rủi ro hộ nhỏ
// quá cao và quá vụn vặt cho bank. Rủi ro của Buyer Receivable nằm ở pháp nhân
// buyer (Vinafood / Cargill / HSBC) có credit rating, lịch sử thanh toán quốc tế.

const ratingTone = (r) => {
  if (r === "A+" || r === "A") return "text-emerald-700 bg-emerald-50 ring-emerald-200";
  if (r === "BBB+" || r === "BBB") return "text-sky-700 bg-sky-50 ring-sky-200";
  return "text-amber-700 bg-amber-50 ring-amber-200";
};

const SCFTab = ({ farmers, formatVND, blockchainLog, droneReports, buyerInvoices = [], harvestLots = [], buyers = [], onDisburseBuyer, onRejectBuyer, onBuyerPayoff }) => {
  const [viewing, setViewing] = useState(null);

  const pendingBuyer   = buyerInvoices.filter(i => i.trangThai === "Đã token hóa" || i.trangThai === "Chào bán ngân hàng");
  const disbursedBuyer = buyerInvoices.filter(i => i.trangThai === "Đã giải ngân");
  const closedBuyer    = buyerInvoices.filter(i => i.trangThai === "Buyer đã thanh toán" || i.trangThai === "Buyer trễ hạn" || i.trangThai === "Bank từ chối");

  const totalDisbursed = [...disbursedBuyer, ...closedBuyer]
    .filter(i => i.trangThai !== "Bank từ chối")
    .reduce((s, i) => s + (i.bankDiscount?.disbursedAmount ?? 0), 0);
  const totalFaceClosed = closedBuyer
    .filter(i => i.trangThai === "Buyer đã thanh toán")
    .reduce((s, i) => s + (i.faceValue ?? 0), 0);

  return (
    <div className="space-y-6 sm:space-y-8 fade-in pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 text-white">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-indigo-500" />
        <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-5 sm:pb-6">
          <div className="flex items-start justify-between gap-4 sm:gap-6 flex-wrap">
            <div className="min-w-0">
              <div className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">Liên minh Ngân hàng · Buyer-SCF V3</div>
              <h2 className="text-[20px] sm:text-[28px] font-display font-semibold tracking-tight mt-1.5 leading-tight">
                Token AR Buyer xuất khẩu — giải ngân T+1 cho Lộc Trời
              </h2>
              <p className="text-[13px] sm:text-[14px] text-slate-300 mt-2 max-w-3xl leading-relaxed">
                Thành viên: <span className="text-white">VietinBank · HSBC · Agribank</span>. Lộc Trời bán lúa cho buyer xuất khẩu (Vinafood / Cargill / HSBC) — buyer trả T+30/60/90.
                Token AR cho phép bank giải ngân ngay cho LT (chiết khấu theo credit rating buyer), giải tỏa tắc nghẽn dòng tiền để LT trả nông dân kịp thời.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:gap-x-8 gap-x-4 gap-y-3 shrink-0 w-full sm:w-auto">
              <div>
                <div className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">Tổng hạn mức</div>
                <div className="font-display text-[20px] sm:text-[26px] font-semibold tabular text-white mt-1.5 leading-none">
                  50<span className="text-[12px] sm:text-[14px] text-slate-400 font-normal ml-1">tỷ VNĐ</span>
                </div>
              </div>
              <div>
                <div className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">Đã giải ngân cho LT</div>
                <div className="font-display text-[16px] sm:text-[26px] font-semibold tabular text-amber-300 mt-1.5 leading-none break-words">
                  {formatVND(totalDisbursed)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pending — token buyer chào bán */}
      <section>
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight">
              ⚡ Token AR Buyer chờ duyệt giải ngân
            </h3>
            <p className="text-[12px] text-slate-500 mt-0.5">Tài sản đảm bảo: khoản phải thu từ pháp nhân buyer có credit rating. Bank duyệt theo discount rate phụ thuộc hạng buyer.</p>
          </div>
          {pendingBuyer.length > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200 text-[12px] px-2 py-1 rounded-md font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {pendingBuyer.length} hồ sơ
            </span>
          )}
        </div>
        {pendingBuyer.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-surface-300 p-10 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mb-3">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 17h6M9 13h6M5 21V5a2 2 0 012-2h7l5 5v13a2 2 0 01-2 2H7a2 2 0 01-2-2z"/></svg>
            </div>
            <p className="text-[14px] text-slate-500 font-medium">Chưa có token buyer nào chào bán.</p>
            <p className="text-[12px] text-slate-400 mt-1">Giám đốc Vùng cần ký HĐ với buyer và token hóa ở tab <b>HĐ Buyer & Factoring</b>.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pendingBuyer.map(inv => (
              <div key={inv.id} className="bg-white rounded-2xl border-2 border-indigo-200 overflow-hidden hover:border-indigo-300 transition-colors flex flex-col">
                <div className="px-5 py-4 border-b border-surface-200 bg-indigo-50/40">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <span className="font-mono text-[12px] bg-sky-50 text-sky-800 ring-1 ring-sky-200 px-1.5 py-0.5 rounded-md font-semibold truncate">{inv.tokenId}</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ring-1 ${ratingTone(inv.buyerRating)}`}>{inv.buyerRating}</span>
                  </div>
                  <h4 className="font-display font-semibold text-slate-900 text-[16px] tracking-tight">{inv.buyerName}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">HĐ <span className="font-mono">{inv.contractRef}</span> · T+{inv.paymentTermDays} · đáo hạn {new Date(inv.maturityAt).toLocaleDateString("vi-VN")}</p>
                  <p className="font-display text-[24px] font-semibold tabular text-slate-900 mt-2 leading-none">{formatVND(inv.faceValue)}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{inv.lotCount} lô · {(inv.totalKg/1000).toFixed(2)} tấn FOB</p>
                </div>
                <div className="px-5 py-4 space-y-3 flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-medium text-slate-600">Bank giải ngân (T+1)</span>
                    <span className="font-display font-semibold tabular text-brand-700">{formatVND(inv.bankDiscount.disbursedAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-slate-500">Chiết khấu ({(inv.bankDiscount.annualRate*100).toFixed(1)}%/năm × {inv.paymentTermDays}d)</span>
                    <span className="text-amber-700 tabular">− {formatVND(inv.bankDiscount.discountAmount)}</span>
                  </div>
                  <div className="flex gap-2 pt-1 mt-auto">
                    <button onClick={() => setViewing(inv)} className="flex-1 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold py-2 rounded-lg transition-colors text-[13px]">Hồ sơ</button>
                    <button onClick={() => onRejectBuyer(inv)} className="flex-[0.8] border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold py-2 rounded-lg transition-colors text-[13px]">Từ chối</button>
                    <button onClick={() => onDisburseBuyer(inv)} className="flex-[1.2] bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-2 rounded-lg transition-colors text-[13px] shadow-sm">Giải ngân T+1</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Disbursed — chờ buyer payoff */}
      {disbursedBuyer.length > 0 && (
        <section>
          <h3 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight mb-4">💰 Đã giải ngân — chờ buyer thanh toán đúng hạn</h3>
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
            <ul className="divide-y divide-surface-200">
              {disbursedBuyer.map(inv => (
                <li key={inv.id} className="px-4 sm:px-6 py-4 flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[12px] font-semibold text-sky-700">{inv.tokenId}</span>
                      <span className="text-[14px] font-semibold text-slate-900">{inv.buyerName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ring-1 ${ratingTone(inv.buyerRating)}`}>{inv.buyerRating}</span>
                    </div>
                    <div className="text-[12px] text-slate-500 mt-1">
                      Face <b>{formatVND(inv.faceValue)}</b> · giải ngân <b className="text-brand-700">{formatVND(inv.bankDiscount.disbursedAmount)}</b>
                      {inv.disbursedAt && ` · ${new Date(inv.disbursedAt).toLocaleDateString("vi-VN")}`}
                      {` · đáo hạn ${new Date(inv.maturityAt).toLocaleDateString("vi-VN")}`}
                    </div>
                  </div>
                  <button onClick={() => onBuyerPayoff(inv)} className="text-[13px] bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-3 py-2 rounded-lg shrink-0">
                    Buyer đã thanh toán (đóng deal)
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Closed history */}
      {closedBuyer.length > 0 && (
        <section>
          <h3 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight mb-4">📜 Lịch sử đóng deal</h3>
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
            <ul className="divide-y divide-surface-200">
              {closedBuyer.map(inv => (
                <li key={inv.id} className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[12px] font-semibold text-sky-700">{inv.tokenId}</span>
                      <span className="text-[14px] font-semibold text-slate-900">{inv.buyerName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Face {formatVND(inv.faceValue)} · {inv.lotCount} lô · {(inv.totalKg/1000).toFixed(2)} tấn</div>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ring-1 shrink-0 ${
                    inv.trangThai === "Buyer đã thanh toán" ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                    : inv.trangThai === "Bank từ chối" ? "bg-surface-100 text-slate-600 ring-surface-200"
                    : "bg-rose-50 text-rose-800 ring-rose-200"
                  }`}>
                    {inv.trangThai}
                  </span>
                </li>
              ))}
            </ul>
            {totalFaceClosed > 0 && (
              <div className="px-5 py-3 border-t border-surface-200 bg-surface-50/60 text-[12px] text-slate-600 flex justify-between">
                <span>Tổng face đã thu hồi từ buyer:</span>
                <b className="text-emerald-700 tabular">{formatVND(totalFaceClosed)}</b>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Dossier modal */}
      {viewing && (() => {
        const lots = harvestLots.filter(l => viewing.lotIds?.includes(l.id));
        const relatedFarmers = [...new Set(lots.map(l => l.farmerId))];
        const logs = blockchainLog.filter(l => l.data?.includes(viewing.tokenId) || l.data?.includes(viewing.id) || l.data?.includes(viewing.contractRef));
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4 fade-in" onClick={() => setViewing(null)}>
            <div onClick={e => e.stopPropagation()} className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-200 flex items-center justify-between bg-slate-50 gap-3">
                <div className="min-w-0">
                  <h3 className="text-[15px] sm:text-[18px] font-display font-semibold text-slate-900 truncate">Hồ sơ Buyer Receivable: {viewing.tokenId}</h3>
                  <p className="text-[12px] sm:text-[13px] text-slate-500 mt-1 truncate">
                    Buyer: <b className="text-slate-700">{viewing.buyerName}</b> ({viewing.buyerRating}) — Face <b className="text-brand-700">{formatVND(viewing.faceValue)}</b>
                  </p>
                </div>
                <button onClick={() => setViewing(null)} className="text-slate-400 hover:text-slate-700 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 shrink-0">&times;</button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-surface-50">
                {/* Discount breakdown */}
                <div className="bg-white p-5 rounded-xl border border-surface-200">
                  <h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-3">💰 Cấu trúc giải ngân</h4>
                  <div className="grid grid-cols-3 gap-3 text-[13px]">
                    <Cell label="Face value" value={formatVND(viewing.faceValue)} tone="text-slate-900" />
                    <Cell label={`Chiết khấu (${(viewing.bankDiscount.annualRate*100).toFixed(1)}%/năm × ${viewing.paymentTermDays}d)`} value={`− ${formatVND(viewing.bankDiscount.discountAmount)}`} tone="text-amber-700" />
                    <Cell label="Giải ngân T+1" value={formatVND(viewing.bankDiscount.disbursedAmount)} tone="text-brand-700" />
                  </div>
                </div>

                {/* Source lots */}
                <div className="bg-white p-5 rounded-xl border border-surface-200">
                  <h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-3">🌾 {lots.length} lô lúa nguồn ({relatedFarmers.length} hộ)</h4>
                  {lots.length === 0 ? (
                    <p className="text-[13px] text-slate-500">Không có dữ liệu lô.</p>
                  ) : (
                    <ul className="divide-y divide-surface-200 max-h-60 overflow-y-auto">
                      {lots.map(lot => (
                        <li key={lot.id} className="py-2 grid grid-cols-4 gap-2 text-[12px] items-center">
                          <span className="font-mono text-slate-700">{lot.id}</span>
                          <span className="text-slate-900 font-semibold truncate">{lot.farmerName}</span>
                          <span className="text-slate-700 tabular">{(lot.yieldKg/1000).toFixed(2)} tấn</span>
                          <span className="text-right text-emerald-700 font-semibold">Tier {lot.tier} · FS {lot.farmingScore}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Audit trail */}
                <div className="bg-white p-5 rounded-xl border border-surface-200">
                  <h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-3">⛓️ Audit trail</h4>
                  <div className="space-y-2">
                    {logs.slice(0, 10).map((l, i) => (
                      <div key={i} className="flex gap-3 text-[12px] bg-surface-50 p-2.5 rounded-lg">
                        <div className="text-[10px] text-slate-400 font-mono shrink-0 w-20">{new Date(l.timestamp).toLocaleTimeString("vi-VN")}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-indigo-700 text-[11px] uppercase">{l.action}</div>
                          <div className="text-slate-700 mt-0.5">{l.data}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-6 py-3 border-t border-surface-200 bg-white flex justify-end gap-2">
                <button onClick={() => setViewing(null)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 text-[13px]">Đóng</button>
                {(viewing.trangThai === "Đã token hóa" || viewing.trangThai === "Chào bán ngân hàng") && (
                  <>
                    <button onClick={() => { onRejectBuyer(viewing); setViewing(null); }} className="px-4 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg font-semibold text-[13px]">Từ chối</button>
                    <button onClick={() => { onDisburseBuyer(viewing); setViewing(null); }} className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-semibold text-[13px] shadow-sm">Giải ngân T+1</button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

const Cell = ({ label, value, tone }) => (
  <div>
    <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">{label}</div>
    <div className={`text-[15px] font-semibold tabular mt-1 ${tone}`}>{value}</div>
  </div>
);

export default SCFTab;
