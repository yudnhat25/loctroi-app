const STATUS_CONFIG = {
  "Chờ xác nhận":       { dot: "bg-amber-500",  label: "Chờ xác nhận",       cls: "text-amber-800 bg-amber-50 ring-amber-200" },
  "Đã token hóa":       { dot: "bg-sky-500",    label: "Đã token hóa",        cls: "text-sky-800 bg-sky-50 ring-sky-200" },
  "Chào bán ngân hàng": { dot: "bg-amber-600",  label: "Chào bán ngân hàng",  cls: "text-amber-900 bg-amber-50 ring-amber-200" },
  "Đã giải ngân":       { dot: "bg-brand-600",  label: "Đã giải ngân",        cls: "text-brand-800 bg-brand-50 ring-brand-200" },
  "Nợ xấu":             { dot: "bg-rose-600",   label: "Nợ xấu",              cls: "text-rose-800 bg-rose-50 ring-rose-200" },
  "Đã tất toán":        { dot: "bg-slate-400",  label: "Đã tất toán",         cls: "text-slate-600 bg-surface-100 ring-surface-200" },
  "Từ chối duyệt vay":  { dot: "bg-slate-500",  label: "Bị từ chối",          cls: "text-slate-700 bg-surface-100 ring-surface-200" },
};

const RISK_CONFIG = {
  LOW:    { label: "Thấp",   cls: "text-brand-800 bg-brand-50 ring-brand-200" },
  MEDIUM: { label: "Trung",  cls: "text-amber-800 bg-amber-50 ring-amber-200" },
  HIGH:   { label: "Cao",    cls: "text-rose-800 bg-rose-50 ring-rose-200" },
};

const InvoicesTab = ({ farmers, invoices, pendingAmount, disbursedAmount, formatVND, onVerifyField, onSubmitSCF, onSettleInvoice }) => {
  const getAction = (inv) => {
    switch (inv.trangThai) {
      case "Chờ xác nhận":
        return <button onClick={() => onVerifyField(inv)} className="bg-brand-700 hover:bg-brand-800 text-white px-3 py-1.5 rounded-lg text-[14px] font-semibold transition-colors whitespace-nowrap">Xác nhận thực địa</button>;
      case "Đã token hóa":
        return <span className="text-sky-700 text-[12px] font-semibold whitespace-nowrap">Chờ hộ nông dân ký SCF…</span>;
      case "Chào bán ngân hàng":
        return <span className="text-slate-500 text-[12px] font-medium whitespace-nowrap">(chờ ngân hàng duyệt)</span>;
      case "Đã giải ngân":
        return <button onClick={() => onSettleInvoice(inv)} className="bg-brand-700 hover:bg-brand-800 text-white px-3 py-1.5 rounded-lg text-[14px] font-semibold transition-colors whitespace-nowrap">Tất toán</button>;
      case "Nợ xấu":
        return (
          <div className="text-right space-y-1">
            <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-800 ring-1 ring-rose-200 text-[12px] font-semibold px-2 py-1 rounded-md whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
              Thiên tai
            </span>
            {inv.recourseStatus === "INSURANCE_CLAIMED" && <div className="text-[11px] text-amber-700 font-semibold whitespace-nowrap">BH đang xử lý</div>}
          </div>
        );
      case "Đã tất toán":
        return (
          <div className="text-right">
            <span className="text-[12px] font-semibold text-slate-500 whitespace-nowrap">Đóng sổ</span>
            {inv.insurancePayout && <div className="text-[11px] text-brand-700 font-semibold tabular">BH {(inv.insurancePayout/1e6).toFixed(1)}M</div>}
          </div>
        );
      case "Từ chối duyệt vay":
        return <span className="text-[12px] text-slate-500 font-semibold whitespace-nowrap">Đã hủy</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-8 fade-in pb-10">
      <section className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-200 flex items-baseline justify-between">
          <h2 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight">Khoản phải thu</h2>
          <span className="text-[12px] font-mono text-slate-400">{invoices.length} hoá đơn</span>
        </div>
        {invoices.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-surface-100 flex items-center justify-center text-slate-400 mb-3">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12h6M9 16h6M5 20V6a2 2 0 012-2h8l4 4v12a2 2 0 01-2 2H7a2 2 0 01-2-2z"/></svg>
            </div>
            <p className="text-[14px] text-slate-500">Chưa có hóa đơn nào.</p>
            <p className="text-[12px] text-slate-400 mt-1">Cấp vật tư ở tab Hộ Nông dân và Vật tư.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead className="bg-surface-50 text-slate-500 text-[11px] font-semibold uppercase tracking-[0.14em] border-b border-surface-200">
                <tr>
                  <th className="px-5 py-3 text-left whitespace-nowrap">Mã / Token</th>
                  <th className="px-5 py-3 text-left whitespace-nowrap">Hộ nông dân</th>
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
                  const cfg = STATUS_CONFIG[inv.trangThai] ?? STATUS_CONFIG["Chờ xác nhận"];
                  return (
                    <tr key={inv.id} className="border-b border-surface-200 last:border-0 hover:bg-surface-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-mono font-semibold text-slate-700 text-[14px]">{inv.id}</div>
                        {inv.tokenId && <div className="text-[11px] bg-sky-50 text-sky-800 ring-1 ring-sky-200 px-1.5 py-0.5 rounded-md mt-1 font-semibold inline-block font-mono">{inv.tokenId}</div>}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{farmer?.hoTen ?? inv.nongHoId}</div>
                        <div className="text-[12px] text-slate-400 font-mono">{inv.nongHoId}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{inv.vuMua || "—"}</td>
                      <td className="px-5 py-3.5 text-right font-display font-semibold tabular text-slate-900 whitespace-nowrap">{formatVND(inv.amount)}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {inv.riskLevel ? (
                          <span className={`inline-flex items-center text-[12px] px-2 py-0.5 rounded-md font-semibold ring-1 ${RISK_CONFIG[inv.riskLevel]?.cls ?? "bg-surface-100 text-slate-500 ring-surface-200"}`}>
                            {RISK_CONFIG[inv.riskLevel]?.label}
                          </span>
                        ) : <span className="text-slate-300 text-[14px]">—</span>}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-[12px] px-2 py-0.5 rounded-md font-semibold ring-1 ${cfg.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">{getAction(inv)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Summary */}
      <section className="grid grid-cols-2 gap-px bg-surface-200 rounded-2xl overflow-hidden border border-surface-200">
        <div className="bg-white p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Đang chờ giải ngân</p>
          <p className="font-display text-[28px] font-semibold tabular text-amber-700 mt-3 leading-none">{formatVND(pendingAmount)}</p>
        </div>
        <div className="bg-white p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Đã giải ngân</p>
          <p className="font-display text-[28px] font-semibold tabular text-brand-700 mt-3 leading-none">{formatVND(disbursedAmount)}</p>
        </div>
      </section>
    </div>
  );
};

export default InvoicesTab;
