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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
          <h3 className="text-base font-bold text-gray-900">🛒 Đăng ký vật tư đầu vụ — Tier-based finance</h3>
          <div onClick={() => setModal(m => ({ ...m, isOpen: false }))} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          {/* Tier badge */}
          {farmer && (
            <div className={`bg-gradient-to-r ${farmerTier.color} rounded-xl p-4 text-white shadow-md`}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">Tier hiện tại của bạn</div>
                  <div className="text-xl font-bold">🌟 {farmerTier.label}</div>
                  <div className="text-xs opacity-90 mt-0.5">{farmer.hoTen} · {farmer.htx ?? farmer.diaChi} · {farmer.dienTich} ha</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">Overall Score</div>
                  <div className="text-2xl font-bold">{overall}<span className="text-sm font-normal">/1000</span></div>
                  {nextGap.next && <div className="text-[10px] opacity-90 mt-0.5">Còn {nextGap.gap} điểm để lên Tier {nextGap.next.code}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Season picker */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">📅 Chọn vụ mùa</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {SEASONS.map(s => (
                <div
                  key={s}
                  onClick={() => setModal(m => ({ ...m, season: s }))}
                  className={`p-2.5 rounded-xl border-2 cursor-pointer text-xs font-bold text-center transition-all select-none ${
                    season === s ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* AI suggestion */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 p-4">
            <div className="flex items-start gap-3 flex-wrap">
              <div className="text-3xl">🤖</div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-purple-900">AI gợi ý gói vật tư cho {farmer?.dienTich} ha</h4>
                <p className="text-[11px] text-purple-700 mt-0.5">
                  Tính theo định mức ĐBSCL: 100kg giống + 200kg NPK + 2 chai BVTV + 3 bao hữu cơ / ha.
                  <b> Đây chỉ là gợi ý</b> — bạn vẫn được quyền chọn vật tư khác / số lượng khác bên dưới.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                  {aiSuggestion.map(s => {
                    const sup = supplies.find(x => x.id === s.supplyId);
                    if (!sup) return null;
                    return (
                      <div key={s.supplyId} className="bg-white rounded-lg p-2 border border-purple-100">
                        <div className="text-[10px] font-bold text-purple-700 truncate">{sup.ten}</div>
                        <div className="text-base font-bold text-gray-900">{s.quantity} {sup.donVi}</div>
                        <div className="text-[10px] text-slate-400">{s.rateLabel}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <div onClick={applyAI} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 rounded-lg text-center cursor-pointer shadow-sm transition-colors select-none">
                {aiApplied ? "✓ Đã áp dụng gợi ý — bạn có thể sửa thêm" : "✨ Áp dụng gợi ý của AI"}
              </div>
              <div onClick={() => { setCart({}); setAiApplied(false); }} className="px-3 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg cursor-pointer hover:bg-slate-50 select-none">
                Xoá giỏ
              </div>
            </div>
          </div>

          {/* Catalog: tự chọn vật tư + số lượng */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">📦 Chọn vật tư &amp; số lượng (tự do)</label>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {supplies.map(s => {
                const qty = cart[s.id] || 0;
                const isSelected = qty > 0;
                const isAiSuggested = aiSuggestion.some(a => a.supplyId === s.id);
                return (
                  <div key={s.id} className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all ${isSelected ? "border-green-400 bg-green-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-sm text-gray-800 truncate">{s.ten}</p>
                        {isAiSuggested && <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">🤖 AI</span>}
                      </div>
                      <p className="text-[10px] text-slate-500">{formatVND(s.donGia)}/{s.donVi}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div onClick={() => dec(s.id)} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center font-bold cursor-pointer select-none">−</div>
                      <input
                        type="number" min="0" value={qty}
                        onChange={e => setQty(s.id, e.target.value)}
                        className="w-16 border border-slate-300 rounded-lg py-1 px-2 text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <div onClick={() => inc(s.id)} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center font-bold cursor-pointer select-none">+</div>
                    </div>
                    <div className="text-right w-24 shrink-0">
                      <div className="text-xs font-bold text-emerald-700">{qty > 0 ? formatVND(qty * s.donGia) : "—"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tier-based payment selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">💳 Hình thức thanh toán (chọn tier ≤ Tier hiện tại)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {TIER_ORDER.slice().reverse().map(code => {
                const t = TIERS[code];
                const allowed = canPickTier(farmerTier.code, code);
                const isChosen = chosenTier === code;
                return (
                  <div
                    key={code}
                    onClick={() => allowed && setChosenTier(code)}
                    className={`rounded-xl p-3 border-2 transition-all select-none ${
                      isChosen ? "border-emerald-500 bg-emerald-50 shadow-md ring-1 ring-emerald-300" :
                      allowed ? "border-slate-200 bg-white hover:border-emerald-300 cursor-pointer" :
                      "border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{isChosen ? "✅" : allowed ? "○" : "🔒"}</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${t.badge}`}>Tier {code}</span>
                          {!allowed && <span className="text-[9px] text-rose-600 font-bold">Cần Score &gt; {t.range[0]}</span>}
                        </div>
                        <p className="text-xs font-bold text-gray-900 mt-1">{t.payment}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Lãi: {t.rateLabel}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-mono">{t.range[0]}-{t.range[1]}</div>
                        {t.bonusBaoTieu && <div className="text-[9px] text-emerald-600 font-bold mt-1">+ Bao tiêu</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {chosenTier !== farmerTier.code && (
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                ℹ️ Bạn đang chọn tier <b>{chosenTier}</b> thấp hơn tier hiện tại <b>{farmerTier.code}</b> — quyền lợi giảm tương ứng.
              </p>
            )}
          </div>

          {/* Summary */}
          {itemCount > 0 && (
            <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600">Tổng giá trị vật tư ({itemCount} loại):</span>
                <span className="text-base font-bold text-slate-900">{formatVND(total)}</span>
              </div>
              {tierToUse.deposit > 0 && (
                <div className="flex justify-between items-center text-amber-700">
                  <span className="text-xs font-semibold">→ Trả ngay/cọc {tierToUse.deposit}% (Tier {tierToUse.code}):</span>
                  <span className="text-sm font-bold">{formatVND(deposit)}</span>
                </div>
              )}
              {tierToUse.creditPct > 0 && (
                <div className="flex justify-between items-center text-emerald-700">
                  <span className="text-xs font-semibold">→ Ghi nợ blockchain {tierToUse.creditPct}% (Tier {tierToUse.code}):</span>
                  <span className="text-sm font-bold">{formatVND(credit)}</span>
                </div>
              )}
              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                {tierToUse.payment} · Lãi {tierToUse.rateLabel}
              </div>
            </div>
          )}

          <div
            onClick={() => canSubmit && onConfirm({ farmer, season, cart, chosenTier })}
            className={`w-full font-bold py-3 rounded-xl flex justify-center items-center gap-2 shadow-sm select-none text-sm transition-all ${
              canSubmit ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer" : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {canSubmit ? "⛓️ Gửi yêu cầu & Ký Smart Contract bao tiêu" : "Chọn ít nhất 1 vật tư + vụ mùa"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyModal;
