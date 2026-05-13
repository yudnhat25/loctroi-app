const RISK_CONFIG = {
  LOW:    { label: "Rủi ro Thấp",  cls: "text-brand-800 bg-brand-50 ring-brand-200",  dot: "bg-brand-600" },
  MEDIUM: { label: "Rủi ro Trung", cls: "text-amber-800 bg-amber-50 ring-amber-200",  dot: "bg-amber-500" },
  HIGH:   { label: "Rủi ro Cao",   cls: "text-rose-800 bg-rose-50 ring-rose-200",     dot: "bg-rose-600" },
};

const SCFTab = ({ farmers, invoices, disbursedAmount, formatVND, onDisburse, onReject, onDeclareDefault }) => {
  const pending   = invoices.filter(i => i.trangThai === "Chào bán ngân hàng");
  const disbursed = invoices.filter(i => i.trangThai === "Đã giải ngân" || i.trangThai === "Nợ xấu" || i.trangThai === "Đã tất toán" || i.trangThai === "Từ chối duyệt vay");

  const getRate = (kpi) => kpi > 80 ? "5.5%/năm" : kpi >= 60 ? "7%/năm" : "9%/năm";
  const rateInk = (kpi) => kpi > 80 ? "text-brand-700" : kpi >= 60 ? "text-amber-700" : "text-rose-700";

  return (
    <div className="space-y-8 fade-in pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 text-white">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-amber-600" />
        <div className="px-7 pt-7 pb-6">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="min-w-0">
              <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">Liên minh Ngân hàng SCF</div>
              <h2 className="text-[28px] font-display font-semibold tracking-tight mt-1.5 leading-tight">
                Token AR và giải ngân khoản phải thu
              </h2>
              <p className="text-[14px] text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Thành viên: <span className="text-white">VietinBank · HSBC · Agribank</span> · Lộc Trời là Leading Peer
                kiêm bên bảo lãnh recourse khi nông dân default vì thiên tai.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 shrink-0">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">Tổng hạn mức</div>
                <div className="font-display text-[26px] font-semibold tabular text-white mt-1.5 leading-none">
                  50<span className="text-[14px] text-slate-400 font-normal ml-1">tỷ VNĐ</span>
                </div>
              </div>
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">Đã giải ngân</div>
                <div className="font-display text-[26px] font-semibold tabular text-amber-300 mt-1.5 leading-none">
                  {formatVND(disbursedAmount)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pending Queue */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight">Chờ duyệt giải ngân</h3>
          {pending.length > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 ring-1 ring-amber-200 text-[12px] px-2 py-1 rounded-md font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {pending.length} hồ sơ
            </span>
          )}
        </div>
        {pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-surface-300 p-10 text-center">
            <p className="text-[14px] text-slate-500">Không có hóa đơn nào chờ duyệt.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pending.map(inv => {
              const farmer = farmers.find(f => f.id === inv.nongHoId);
              const kpi = farmer?.kpiScore ?? 0;
              return (
                <div key={inv.id} className="bg-white rounded-2xl border border-surface-200 overflow-hidden hover:border-surface-300 transition-colors">
                  <div className="px-5 py-4 border-b border-surface-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-[12px] bg-sky-50 text-sky-800 ring-1 ring-sky-200 px-1.5 py-0.5 rounded-md font-semibold">{inv.tokenId}</span>
                      <span className="font-mono text-[12px] text-slate-500">{inv.id}</span>
                    </div>
                    <h4 className="font-display font-semibold text-slate-900 text-[17px] tracking-tight">{farmer?.hoTen ?? inv.nongHoId}</h4>
                    <p className="font-display text-[26px] font-semibold tabular text-slate-900 mt-2 leading-none">{formatVND(inv.amount)}</p>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    <div>
                      <div className="flex justify-between text-[12px] mb-1.5">
                        <span className="text-slate-500 font-medium">Mức độ tín nhiệm</span>
                        <span className="font-semibold text-slate-900 tabular">{kpi}/100</span>
                      </div>
                      <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${kpi > 80 ? "bg-brand-600" : kpi >= 60 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${kpi}%` }}></div>
                      </div>
                    </div>
                    {inv.riskLevel && (
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-semibold ring-1 ${RISK_CONFIG[inv.riskLevel]?.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${RISK_CONFIG[inv.riskLevel]?.dot}`}></span>
                        {RISK_CONFIG[inv.riskLevel]?.label}
                        <span className="ml-auto text-slate-500 font-mono text-[11px]">{inv.insurancePolicyId ?? "—"}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="font-medium text-slate-600">Lãi suất đề xuất</span>
                      <span className={`font-display font-semibold tabular ${rateInk(kpi)}`}>{getRate(kpi)}</span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => onReject(inv)} className="flex-1 border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold py-2 rounded-lg transition-colors text-[14px]">
                        Từ chối
                      </button>
                      <button onClick={() => onDisburse(inv)} className="flex-1 bg-brand-700 hover:bg-brand-800 text-white font-semibold py-2 rounded-lg transition-colors text-[14px]">
                        Duyệt giải ngân
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* History */}
      <section>
        <h3 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight mb-4">Lịch sử giải ngân</h3>
        {disbursed.length === 0 ? (
          <div className="bg-white rounded-2xl border border-surface-200 p-8 text-center text-[14px] text-slate-500">
            Chưa có lịch sử giải ngân.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[14px]">
                <thead className="bg-surface-50 text-slate-500 text-[11px] font-semibold uppercase tracking-[0.14em] border-b border-surface-200">
                  <tr>
                    <th className="px-5 py-3 text-left">Mã Token</th>
                    <th className="px-5 py-3 text-left">Hộ nông dân</th>
                    <th className="px-5 py-3 text-right">Số tiền</th>
                    <th className="px-5 py-3 text-left">Ngày xử lý</th>
                    <th className="px-5 py-3 text-center">Trạng thái</th>
                    <th className="px-5 py-3 text-center">Rủi ro</th>
                  </tr>
                </thead>
                <tbody>
                  {disbursed.map(inv => {
                    const farmer = farmers.find(f => f.id === inv.nongHoId);
                    const rowTint = inv.trangThai === "Nợ xấu" ? "hover:bg-rose-50/40"
                                  : inv.trangThai === "Đã tất toán" ? "hover:bg-surface-50/60"
                                  : "hover:bg-surface-50/60";
                    return (
                      <tr key={inv.id} className={`border-b border-surface-200 last:border-0 transition-colors ${rowTint}`}>
                        <td className="px-5 py-3.5 font-mono font-semibold text-sky-700 text-[14px]">{inv.tokenId}</td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900 whitespace-nowrap">{farmer?.hoTen ?? inv.nongHoId}</td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="font-display font-semibold tabular text-slate-900">{formatVND(inv.amount)}</div>
                          {inv.insurancePayout && (
                            <div className="text-[11px] text-amber-700 font-semibold tabular">BH {formatVND(inv.insurancePayout)}</div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-[12px] text-slate-500 whitespace-nowrap">{new Date(inv.date).toLocaleString("vi-VN")}</td>
                        <td className="px-5 py-3.5 text-center">
                          {inv.trangThai === "Đã giải ngân" && (
                            <div className="flex flex-col items-center gap-1.5">
                              <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-800 ring-1 ring-brand-200 text-[12px] px-2 py-0.5 rounded-md font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
                                Hoàn tất
                              </span>
                              <button onClick={() => onDeclareDefault(inv)} className="text-[11px] text-rose-700 hover:underline font-semibold whitespace-nowrap">
                                Khai báo thiên tai
                              </button>
                            </div>
                          )}
                          {inv.trangThai === "Nợ xấu" && (
                            <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-800 ring-1 ring-rose-200 text-[12px] px-2 py-0.5 rounded-md font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                              Nợ xấu
                            </span>
                          )}
                          {inv.trangThai === "Đã tất toán" && (
                            <span className="inline-flex items-center gap-1.5 bg-surface-100 text-slate-600 ring-1 ring-surface-200 text-[12px] px-2 py-0.5 rounded-md font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              Tất toán
                            </span>
                          )}
                          {inv.trangThai === "Từ chối duyệt vay" && (
                            <span className="inline-flex items-center gap-1.5 bg-surface-100 text-slate-600 ring-1 ring-surface-200 text-[12px] px-2 py-0.5 rounded-md font-semibold">
                              Từ chối
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {inv.riskLevel && (
                            <span className={`text-[12px] px-2 py-0.5 rounded-md font-semibold ring-1 ${RISK_CONFIG[inv.riskLevel]?.cls}`}>
                              {RISK_CONFIG[inv.riskLevel]?.label.replace("Rủi ro ", "")}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default SCFTab;
