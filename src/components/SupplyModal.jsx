// SupplyModal.jsx — no <form>, uses div+onClick
const SupplyModal = ({ modal, setModal, supplies, onConfirm, formatVND }) => {
  const { farmer, supplyId, quantity, season } = modal;
  const selectedSupply = supplies.find(s => s.id === supplyId);
  const total = selectedSupply ? Number(quantity) * selectedSupply.donGia : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
          <h3 className="text-base font-bold text-gray-900">Cấp phát vật tư</h3>
          <div onClick={() => setModal(m => ({ ...m, isOpen: false }))} className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors p-1 rounded-lg hover:bg-slate-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-green-50 p-3 rounded-xl border border-green-100">
            <p className="text-xs text-slate-500 font-bold mb-0.5">Hộ Nông dân nhận:</p>
            <p className="font-bold text-green-800">{farmer?.hoTen} <span className="font-mono text-green-600 font-normal">({farmer?.id})</span></p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Loại vật tư</label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {supplies.map(s => (
                <div
                  key={s.id}
                  onClick={() => setModal(m => ({ ...m, supplyId: s.id }))}
                  className={`flex justify-between items-center p-3 rounded-xl border-2 cursor-pointer transition-all select-none ${supplyId === s.id ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <div>
                    <p className="font-bold text-sm text-gray-800">{s.ten}</p>
                    <p className="text-xs text-slate-400">{s.donVi}</p>
                  </div>
                  <p className="font-bold text-green-600 text-sm">{formatVND(s.donGia)}/{s.donVi}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Số lượng</label>
            <div className="flex items-center gap-3">
              <div
                onClick={() => setModal(m => ({ ...m, quantity: Math.max(1, Number(m.quantity) - 1) }))}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center font-bold text-lg cursor-pointer select-none transition-colors"
              >−</div>
              <input
                type="number" min="1" value={quantity}
                onChange={e => setModal(m => ({ ...m, quantity: e.target.value }))}
                className="flex-1 border border-slate-300 rounded-xl py-2.5 px-4 text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div
                onClick={() => setModal(m => ({ ...m, quantity: Number(m.quantity) + 1 }))}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center font-bold text-lg cursor-pointer select-none transition-colors"
              >+</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Vụ mùa</label>
            <input
              type="text" value={season}
              onChange={e => setModal(m => ({ ...m, season: e.target.value }))}
              className="w-full border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {selectedSupply && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-600">Tổng giá trị hóa đơn:</span>
              <span className="text-lg font-bold text-green-600">{formatVND(total)}</span>
            </div>
          )}

          <div
            onClick={onConfirm}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-sm cursor-pointer select-none text-sm"
          >
            ⛓️ Xác nhận &amp; Ghi Blockchain
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyModal;
