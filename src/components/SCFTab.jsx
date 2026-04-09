const RISK_CONFIG = {
  LOW:    { label: "Rủi ro Thấp",  cls: "bg-green-100 text-green-700",  dot: "bg-green-500" },
  MEDIUM: { label: "Rủi ro Trung", cls: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" },
  HIGH:   { label: "Rủi ro Cao",   cls: "bg-red-100 text-red-700",    dot: "bg-red-500" },
};

const SCFTab = ({ farmers, invoices, disbursedAmount, formatVND, onDisburse, onReject, onDeclareDefault }) => {
  const pending   = invoices.filter(i => i.trangThai === "Chào bán ngân hàng");
  const disbursed = invoices.filter(i => i.trangThai === "Đã giải ngân" || i.trangThai === "Nợ xấu" || i.trangThai === "Đã tất toán");

  const getRate = (kpi) => kpi > 80 ? "5.5%/năm" : kpi >= 60 ? "7%/năm" : "9%/năm";
  const getRateColor = (kpi) => kpi > 80 ? "text-green-600" : kpi >= 60 ? "text-orange-600" : "text-red-600";

  return (
    <div className="space-y-6 fade-in pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-6 text-white shadow-lg flex flex-col xl:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold mb-1 flex items-center gap-2">🏦 Liên minh Blockchain SCF</h2>
          <p className="text-green-100 text-sm font-medium">Thành viên: VietinBank, HSBC, Agribank | <b className="text-white">Lộc Trời (Leading Peer)</b></p>
        </div>
        <div className="flex gap-6 xl:text-right">
          <div>
            <div className="text-green-200 text-xs font-bold uppercase tracking-wider">Tổng hạn mức</div>
            <div className="text-2xl font-bold">50,000,000,000 VNĐ</div>
          </div>
          <div>
            <div className="text-green-200 text-xs font-bold uppercase tracking-wider">Đã giải ngân</div>
            <div className="text-2xl font-bold">{formatVND(disbursedAmount)}</div>
          </div>
        </div>
      </div>

      {/* Pending Queue */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          ⏳ Chờ duyệt giải ngân
          {pending.length > 0 && <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-bold">{pending.length}</span>}
        </h3>
        {pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
            <p className="font-semibold">Không có hóa đơn nào chờ duyệt.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {pending.map(inv => {
              const farmer = farmers.find(f => f.id === inv.nongHoId);
              const kpi = farmer?.kpiScore ?? 0;
              return (
                <div key={inv.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-5 bg-orange-50/50 border-b border-orange-100">
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-mono text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded font-bold">{inv.tokenId}</span>
                      <span className="text-xs font-bold text-slate-500">{inv.id}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-base">{farmer?.hoTen ?? inv.nongHoId}</h4>
                    <p className="text-2xl font-bold text-green-600 mt-1">{formatVND(inv.amount)}</p>
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-600 font-semibold">Mức độ tín nhiệm (KPI)</span>
                        <span className="font-bold text-gray-900">{kpi}/100</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${kpi > 80 ? "bg-green-500" : kpi >= 60 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: `${kpi}%` }}></div>
                      </div>
                    </div>
                    {/* Risk Level Badge */}
                    {inv.riskLevel && (
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${RISK_CONFIG[inv.riskLevel]?.cls}`}>
                        <span className={`w-2 h-2 rounded-full ${RISK_CONFIG[inv.riskLevel]?.dot}`}></span>
                        {RISK_CONFIG[inv.riskLevel]?.label} | Bảo hiểm: {inv.insurancePolicyId ?? "—"}
                      </div>
                    )}
                    <div className="flex justify-between items-center bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                      <span className="text-xs font-semibold text-slate-600">Lãi suất đề xuất</span>
                      <span className={`font-bold text-sm ${getRateColor(kpi)}`}>{getRate(kpi)}</span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <div
                        onClick={() => onReject(inv)}
                        className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 font-bold py-2.5 rounded-xl transition-colors text-sm text-center cursor-pointer select-none"
                      >❌ Từ chối</div>
                      <div
                        onClick={() => onDisburse(inv)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition-colors text-sm text-center cursor-pointer select-none shadow-sm"
                      >✅ Duyệt giải ngân</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* History */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">📋 Lịch sử giải ngân</h3>
        {disbursed.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 shadow-sm">
            <p>Chưa có lịch sử giải ngân.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-left">Mã Token</th>
                    <th className="px-5 py-3 text-left">Nông hộ</th>
                    <th className="px-5 py-3 text-right">Số tiền</th>
                    <th className="px-5 py-3 text-left">Ngày xử lý</th>
                    <th className="px-5 py-3 text-center">Trạng thái</th>
                    <th className="px-5 py-3 text-center">Rủi ro</th>
                  </tr>
                </thead>
                <tbody>
                  {disbursed.map(inv => {
                    const farmer = farmers.find(f => f.id === inv.nongHoId);
                    return (
                      <tr key={inv.id} className={`border-b border-slate-50 last:border-0 transition-colors ${
                          inv.trangThai === "Nợ xấu" ? "bg-red-50/40 hover:bg-red-50/60" :
                          inv.trangThai === "Đã tất toán" ? "bg-slate-50/60 hover:bg-slate-100/60" :
                          "hover:bg-green-50/30"
                        }`}>
                        <td className="px-5 py-4 font-mono font-bold text-cyan-700 text-xs">{inv.tokenId}</td>
                        <td className="px-5 py-4 font-bold text-gray-800 whitespace-nowrap">{farmer?.hoTen ?? inv.nongHoId}</td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="font-bold text-green-700">{formatVND(inv.amount)}</div>
                          {inv.insurancePayout && (
                            <div className="text-[10px] text-orange-600 font-bold">🛡️ BH: {formatVND(inv.insurancePayout)}</div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">{new Date(inv.date).toLocaleString("vi-VN")}</td>
                        <td className="px-5 py-4 text-center">
                          {inv.trangThai === "Đã giải ngân" && (
                            <div className="flex flex-col items-center gap-1.5">
                              <span className="bg-green-100 text-green-800 border border-green-200 text-xs px-2.5 py-1 rounded-full font-bold">✓ Hoàn tất</span>
                              <div
                                onClick={() => onDeclareDefault(inv)}
                                className="text-[10px] text-red-500 hover:text-red-700 font-bold cursor-pointer hover:underline whitespace-nowrap select-none transition-colors"
                              >
                                🌊 Khai báo thiên tai
                              </div>
                            </div>
                          )}
                          {inv.trangThai === "Nợ xấu" && (
                            <span className="bg-red-100 text-red-700 border border-red-200 text-xs px-2.5 py-1 rounded-full font-bold">🔴 Nợ xấu</span>
                          )}
                          {inv.trangThai === "Đã tất toán" && (
                            <span className="bg-slate-100 text-slate-600 border border-slate-200 text-xs px-2.5 py-1 rounded-full font-bold">⚪ Tất toán</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          {inv.riskLevel && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${RISK_CONFIG[inv.riskLevel]?.cls}`}>
                              {RISK_CONFIG[inv.riskLevel]?.label}
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
      </div>
    </div>
  );
};

export default SCFTab;
