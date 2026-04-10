const STATUS_CONFIG = {
  "Chờ xác nhận":       { badge: "🟡 Chờ xác nhận",       cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  "Đã token hóa":       { badge: "🔵 Đã token hóa",       cls: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  "Chào bán ngân hàng": { badge: "🟠 Chào bán ngân hàng",  cls: "bg-orange-50 text-orange-700 border-orange-200" },
  "Đã giải ngân":       { badge: "🟢 Đã giải ngân",       cls: "bg-green-50 text-green-700 border-green-200" },
  "Nợ xấu":            { badge: "🔴 Nợ xấu",             cls: "bg-red-50 text-red-700 border-red-200" },
  "Đã tất toán":        { badge: "⚪ Đã tất toán",        cls: "bg-slate-100 text-slate-500 border-slate-200" },
  "Từ chối duyệt vay":  { badge: "⚫ Bị từ chối",        cls: "bg-gray-100 text-gray-600 border-gray-300" },
};

const RISK_CONFIG = {
  LOW:    { label: "Thấp",   cls: "bg-green-100 text-green-700" },
  MEDIUM: { label: "Trung",  cls: "bg-yellow-100 text-yellow-700" },
  HIGH:   { label: "Cao",    cls: "bg-red-100 text-red-700" },
};

const InvoicesTab = ({ farmers, invoices, pendingAmount, disbursedAmount, formatVND, onVerifyField, onSubmitSCF, onSettleInvoice }) => {
  const getAction = (inv) => {
    switch (inv.trangThai) {
      case "Chờ xác nhận":
        return <div onClick={() => onVerifyField(inv)} className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm select-none whitespace-nowrap">Xác nhận thực địa</div>;
      case "Đã token hóa":
        return <span className="text-blue-500 text-xs font-bold italic whitespace-nowrap">✍️ Chờ hộ nông dân ký lệnh SCF...</span>;
      case "Chào bán ngân hàng":
        return <span className="text-slate-400 text-xs italic font-medium whitespace-nowrap">(chờ ngân hàng duyệt)</span>;
      case "Đã giải ngân":
        return <div onClick={() => onSettleInvoice(inv)} className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm select-none whitespace-nowrap">💵 Quét báo thu hoạch & Tất toán</div>;
      case "Nợ xấu":
        return (
          <div className="space-y-1">
            <span className="bg-red-50 text-red-600 text-xs font-bold border border-red-200 px-3 py-1.5 rounded-lg whitespace-nowrap block text-center">🌊 Thiên tai</span>
            {inv.recourseStatus === "INSURANCE_CLAIMED" && <span className="text-orange-500 text-[10px] font-bold whitespace-nowrap block text-center">🛡️ BH đang xử lý...</span>}
          </div>
        );
      case "Đã tất toán":
        return (
          <div className="text-center">
            <span className="bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200 px-3 py-1.5 rounded-lg whitespace-nowrap">⚪ Đóng sổ</span>
            {inv.insurancePayout && <div className="text-[10px] text-green-600 font-bold mt-0.5">BH: {(inv.insurancePayout/1e6).toFixed(1)}M</div>}
          </div>
        );
      case "Từ chối duyệt vay":
        return <span className="bg-gray-100 text-gray-500 text-xs font-bold border border-gray-200 px-3 py-1.5 rounded-lg whitespace-nowrap">🚫 Đã hủy lệnh</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 fade-in pb-10">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">📄 Quản lý Khoản phải thu</h2>
          <span className="text-xs text-slate-500 font-semibold">{invoices.length} hóa đơn</span>
        </div>
        {invoices.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <div className="text-5xl mb-4">📭</div>
            <p className="font-semibold">Chưa có hóa đơn. Hãy cấp vật tư ở tab <b>Hộ Nông dân & Vật tư</b>.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-left whitespace-nowrap">Mã HĐ / Token</th>
                  <th className="px-5 py-3 text-left whitespace-nowrap">Hộ Nông dân</th>
                  <th className="px-5 py-3 text-left whitespace-nowrap">Vụ mùa</th>
                  <th className="px-5 py-3 text-right whitespace-nowrap">Giá trị</th>
                  <th className="px-5 py-3 text-left whitespace-nowrap">Rủi ro</th>
                  <th className="px-5 py-3 text-left whitespace-nowrap">Trạng thái</th>
                  <th className="px-5 py-3 text-right whitespace-nowrap">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => {
                  const farmer = farmers.find(f => f.id === inv.nongHoId);
                  const cfg = STATUS_CONFIG[inv.trangThai] || {};
                  return (
                    <tr key={inv.id} className="border-b border-slate-50 last:border-0 hover:bg-green-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-slate-700 text-xs">{inv.id}</div>
                        {inv.tokenId && <div className="text-[10px] bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded mt-1 font-bold inline-block">{inv.tokenId}</div>}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-800">{farmer?.hoTen ?? inv.nongHoId}</div>
                        <div className="text-xs text-slate-400 font-mono">{inv.nongHoId}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium whitespace-nowrap">{inv.vuMua || "—"}</td>
                      <td className="px-5 py-4 text-right font-bold text-green-700 whitespace-nowrap">{formatVND(inv.amount)}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {inv.riskLevel ? (
                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${RISK_CONFIG[inv.riskLevel]?.cls ?? "bg-slate-100 text-slate-500"}`}>
                            ⚠ {RISK_CONFIG[inv.riskLevel]?.label}
                          </span>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`text-xs px-2.5 py-1.5 rounded-full font-bold border ${cfg.cls}`}>{cfg.badge}</span>
                      </td>
                      <td className="px-5 py-4 text-right">{getAction(inv)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">⏳</div>
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Đang chờ giải ngân</div>
            <div className="text-xl font-bold text-orange-600">{formatVND(pendingAmount)}</div>
          </div>
        </div>
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">✅</div>
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Đã giải ngân</div>
            <div className="text-xl font-bold text-green-600">{formatVND(disbursedAmount)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicesTab;
