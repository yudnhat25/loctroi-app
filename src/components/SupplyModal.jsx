// SupplyModal — B1: Đăng ký vật tư đầu vụ
// AI gợi ý gói theo ha (chỉ là gợi ý, user có quyền thêm/sửa/bỏ vật tư bất kỳ)
// Tier cao có thể chọn phương thức thanh toán tier thấp hơn; tier thấp KHÔNG được chọn cao hơn.
import { useEffect, useMemo, useState } from "react";
import {
  TIERS, TIER_ORDER, getTier, getOverallScore, getNextTierGap,
  canPickTier, suggestSupplyPackage,
} from "../lib/scoring";

const SEASONS = ["Vụ Đông Xuân 2026-2027", "Vụ Hè Thu 2027", "Vụ Thu Đông 2027"];

const SupplyModal = ({ modal, setModal, supplies, onConfirm, formatVND }) => {
  const { farmer, season } = modal;
  const farmerTier = farmer ? getTier(farmer) : TIERS.D;
  const overall = farmer ? getOverallScore(farmer) : 0;
  const nextGap = farmer ? getNextTierGap(farmer) : { next: null, gap: 0 };

  // ─── Cart: { supplyId: quantity } ───
  const [cart, setCart] = useState({});
  const [chosenTier, setChosenTier] = useState(farmerTier.code); // user có thể đổi sang tier thấp hơn
  const [aiApplied, setAiApplied] = useState(false);

  // Reset khi modal mở với farmer mới
  useEffect(() => {
    if (modal.isOpen) {
      setCart({});
      setChosenTier(farmerTier.code);
      setAiApplied(false);
    }
  }, [modal.isOpen, farmer?.id]);

  const aiSuggestion = useMemo(() => farmer ? suggestSupplyPackage(farmer) : [], [farmer]);

  const total = useMemo(() => {
    return Object.entries(cart).reduce((sum, [sid, qty]) => {
      const s = supplies.find(x => x.id === sid);
      return sum + (s ? s.donGia * (qty || 0) : 0);
    }, 0);
  }, [cart, supplies]);

  const tierToUse = TIERS[chosenTier];
  const deposit = Math.round(total * tierToUse.deposit / 100);
  const credit  = total - deposit;

  const applyAI = () => {
    const next = {};
    aiSuggestion.forEach(s => { next[s.supplyId] = s.quantity; });
    setCart(next);
    setAiApplied(true);
  };

  const setQty = (id, q) => {
    const n = Math.max(0, Math.floor(Number(q) || 0));
    setCart(prev => {
      const next = { ...prev };
      if (n === 0) delete next[id];
      else next[id] = n;
      return next;
    });
  };

  const inc = (id) => setQty(id, (cart[id] || 0) + 1);
  const dec = (id) => setQty(id, Math.max(0, (cart[id] || 0) - 1));

  const itemCount = Object.values(cart).filter(q => q > 0).length;
  const canSubmit = itemCount > 0 && season;

  if (!modal.isOpen) return null;

  const tierAccent = { A: "bg-brand-700", B: "bg-sky-700", C: "bg-amber-600", D: "bg-rose-700" }[farmerTier.code] ?? "bg-brand-700";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm fade-in">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-[0_24px_64px_-16px_rgba(15,23,42,0.45)] w-full max-w-3xl overflow-hidden border border-surface-200 max-h-[95vh] sm:max-h-[92vh] flex flex-col">
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-200 gap-3">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Tier-based Finance</div>
            <h3 className="text-[15px] sm:text-[18px] font-display font-semibold text-slate-900 tracking-tight mt-0.5">Đăng ký vật tư đầu vụ</h3>
          </div>
          <button aria-label="Đóng" onClick={() => setModal(m => ({ ...m, isOpen: false }))} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-surface-50 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5 safe-pb">
          {/* Tier card — slate-900, accent line */}
          {farmer && (
            <section className="relative overflow-hidden rounded-xl bg-slate-900 text-white">
              <div className={`absolute inset-x-0 top-0 h-[3px] ${tierAccent}`} />
              <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Tier hiện tại</div>
                  <div className="font-display text-[20px] font-semibold tracking-tight mt-1">{farmerTier.label}</div>
                  <div className="text-[12px] text-slate-400 mt-0.5">{farmer.hoTen} · {farmer.htx ?? farmer.diaChi} · {farmer.dienTich} ha</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Overall</div>
                  <div className="font-display text-[28px] font-semibold tabular leading-none mt-1">
                    {overall}<span className="text-[14px] text-slate-400 font-normal ml-1">/1000</span>
                  </div>
                  {nextGap.next && <div className="text-[11px] text-slate-400 mt-1">Còn {nextGap.gap} điểm lên Tier {nextGap.next.code}</div>}
                </div>
              </div>
            </section>
          )}

          {/* Season picker */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">Chọn vụ mùa</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {SEASONS.map(s => (
                <button
                  key={s}
                  onClick={() => setModal(m => ({ ...m, season: s }))}
                  className={`p-2.5 rounded-lg border cursor-pointer text-[14px] font-semibold text-center transition-colors select-none ${
                    season === s ? "border-brand-600 bg-brand-50 text-brand-800 ring-1 ring-brand-200" : "border-surface-200 hover:border-surface-300 text-slate-600 bg-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* AI suggestion — bỏ purple/pink gradient */}
          <section className="rounded-xl bg-surface-50 ring-1 ring-surface-200 px-5 py-4">
            <div className="flex items-start gap-3 flex-wrap">
              <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-200 flex items-center justify-center text-base shrink-0">✨</div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[16px] font-display font-semibold text-slate-900 tracking-tight">AI gợi ý gói vật tư cho {farmer?.dienTich} ha</h4>
                <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                  Theo định mức ĐBSCL: 100kg giống + 200kg NPK + 2 chai BVTV + 3 bao hữu cơ / ha.
                  Đây chỉ là gợi ý, bạn vẫn được quyền chọn vật tư khác hoặc số lượng khác bên dưới.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-surface-200 mt-3 rounded-lg overflow-hidden">
                  {aiSuggestion.map(s => {
                    const sup = supplies.find(x => x.id === s.supplyId);
                    if (!sup) return null;
                    return (
                      <div key={s.supplyId} className="bg-white px-2.5 py-2">
                        <div className="text-[11px] text-slate-500 truncate">{sup.ten}</div>
                        <div className="font-display text-[17px] font-semibold tabular text-slate-900 mt-0.5">{s.quantity} <span className="text-[11px] text-slate-500 font-normal">{sup.donVi}</span></div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{s.rateLabel}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={applyAI} className="flex-1 bg-brand-700 hover:bg-brand-800 text-white text-[14px] font-semibold py-2 rounded-lg transition-colors">
                {aiApplied ? "Đã áp dụng — có thể sửa thêm" : "Áp dụng gợi ý của AI"}
              </button>
              <button onClick={() => { setCart({}); setAiApplied(false); }} className="px-3 py-2 border border-surface-200 text-slate-600 text-[14px] font-semibold rounded-lg hover:bg-white transition-colors">
                Xóa giỏ
              </button>
            </div>
          </section>

          {/* Catalog */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">Chọn vật tư và số lượng</label>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {supplies.map(s => {
                const qty = cart[s.id] || 0;
                const isSelected = qty > 0;
                const isAiSuggested = aiSuggestion.some(a => a.supplyId === s.id);
                return (
                  <div key={s.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${isSelected ? "border-brand-600 bg-brand-50/60 ring-1 ring-brand-200" : "border-surface-200 hover:border-surface-300 bg-white"}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-[14px] text-slate-900 truncate">{s.ten}</p>
                        {isAiSuggested && <span className="text-[10px] bg-brand-50 text-brand-700 ring-1 ring-brand-200 px-1.5 py-0.5 rounded font-semibold">AI gợi ý</span>}
                      </div>
                      <p className="text-[12px] text-slate-500 mt-0.5 tabular">{formatVND(s.donGia)}/{s.donVi}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => dec(s.id)} className="w-7 h-7 bg-white hover:bg-surface-50 border border-surface-200 rounded-md flex items-center justify-center font-semibold text-slate-700 transition-colors">−</button>
                      <input
                        type="number" min="0" value={qty}
                        onChange={e => setQty(s.id, e.target.value)}
                        className="w-14 bg-white text-slate-900 border border-surface-200 rounded-md py-1 px-2 text-center font-semibold text-[14px] tabular focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                      />
                      <button onClick={() => inc(s.id)} className="w-7 h-7 bg-white hover:bg-surface-50 border border-surface-200 rounded-md flex items-center justify-center font-semibold text-slate-700 transition-colors">+</button>
                    </div>
                    <div className="text-right w-24 shrink-0">
                      <div className="text-[14px] font-semibold tabular text-brand-800">{qty > 0 ? formatVND(qty * s.donGia) : "—"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tier-based payment selection */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">Hình thức thanh toán</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {TIER_ORDER.slice().reverse().map(code => {
                const t = TIERS[code];
                const allowed = canPickTier(farmerTier.code, code);
                const isChosen = chosenTier === code;
                const tAccent = { A: "text-brand-800 bg-brand-50 ring-brand-200", B: "text-sky-800 bg-sky-50 ring-sky-200", C: "text-amber-800 bg-amber-50 ring-amber-200", D: "text-rose-800 bg-rose-50 ring-rose-200" }[code];
                return (
                  <button
                    key={code}
                    onClick={() => allowed && setChosenTier(code)}
                    disabled={!allowed}
                    className={`text-left rounded-lg px-3.5 py-3 border transition-colors select-none ${
                      isChosen ? "border-brand-600 bg-brand-50/60 ring-1 ring-brand-200" :
                      allowed ? "border-surface-200 bg-white hover:border-surface-300 cursor-pointer" :
                      "border-surface-200 bg-surface-50 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          {isChosen
                            ? <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-brand-700" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                            : allowed
                              ? <span className="w-3.5 h-3.5 rounded-full border border-slate-300"></span>
                              : <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>}
                          <span className={`text-[12px] font-semibold px-1.5 py-0.5 rounded-md ring-1 ${tAccent}`}>Tier {code}</span>
                          {!allowed && <span className="text-[11px] text-rose-700 font-semibold">cần Score &gt; {t.range[0]}</span>}
                        </div>
                        <p className="text-[14px] font-semibold text-slate-900 mt-1.5">{t.payment}</p>
                        <p className="text-[12px] text-slate-500 mt-0.5">Lãi: {t.rateLabel}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-slate-400 font-mono">{t.range[0]}–{t.range[1]}</div>
                        {t.bonusBaoTieu && <div className="text-[11px] text-brand-700 font-semibold mt-1">+ bao tiêu</div>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {chosenTier !== farmerTier.code && (
              <p className="text-[12px] text-amber-800 bg-amber-50 ring-1 ring-amber-200 rounded-lg px-3 py-2 mt-2">
                Bạn đang chọn tier <b>{chosenTier}</b> thấp hơn tier hiện tại <b>{farmerTier.code}</b>, quyền lợi giảm tương ứng.
              </p>
            )}
          </div>

          {/* Summary */}
          {itemCount > 0 && (
            <div className="bg-surface-50 rounded-xl ring-1 ring-surface-200 px-4 py-4 space-y-2.5">
              <div className="flex justify-between items-baseline">
                <span className="text-[14px] text-slate-600">Tổng giá trị vật tư <span className="text-slate-400">({itemCount} loại)</span></span>
                <span className="font-display text-[20px] font-semibold tabular text-slate-900">{formatVND(total)}</span>
              </div>
              {tierToUse.deposit > 0 && (
                <div className="flex justify-between items-baseline text-amber-800">
                  <span className="text-[14px]">Trả ngay/cọc {tierToUse.deposit}% (Tier {tierToUse.code})</span>
                  <span className="text-[15px] font-semibold tabular">{formatVND(deposit)}</span>
                </div>
              )}
              {tierToUse.creditPct > 0 && (
                <div className="flex justify-between items-baseline text-brand-800">
                  <span className="text-[14px]">Ghi nợ blockchain {tierToUse.creditPct}% (Tier {tierToUse.code})</span>
                  <span className="text-[15px] font-semibold tabular">{formatVND(credit)}</span>
                </div>
              )}
              <div className="text-[12px] text-slate-500 pt-2 border-t border-surface-200">
                {tierToUse.payment} · Lãi {tierToUse.rateLabel}
              </div>
            </div>
          )}

          <button
            onClick={() => canSubmit && onConfirm({ farmer, season, cart, chosenTier })}
            disabled={!canSubmit}
            className={`w-full font-semibold py-3 rounded-lg select-none text-[14px] transition-colors ${
              canSubmit ? "bg-brand-700 hover:bg-brand-800 text-white cursor-pointer" : "bg-surface-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {canSubmit ? "Gửi yêu cầu và ký Smart Contract bao tiêu" : "Chọn ít nhất 1 vật tư và vụ mùa"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplyModal;
