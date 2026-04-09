const OverviewTab = ({ farmers, invoices, blockchainLog, disbursedAmount, pendingAmount, totalArea, stateCounts, formatVND, GIA_LUA }) => {
  const totalReceivables = invoices.reduce((s, i) => s + i.amount, 0);

  const kpiCards = [
    { label: "Tổng hộ nông dân", value: farmers.length, unit: "hộ", color: "text-green-600", bg: "bg-green-50", icon: "👨‍🌾" },
    { label: "Tổng diện tích", value: totalArea.toFixed(1), unit: "ha", color: "text-blue-600", bg: "bg-blue-50", icon: "🌾" },
    { label: "Tổng khoản phải thu", value: formatVND(totalReceivables), unit: "", color: "text-orange-600", bg: "bg-orange-50", icon: "📄", wide: true },
    { label: "Số block đã ghi", value: blockchainLog.length, unit: "blocks", color: "text-purple-600", bg: "bg-purple-50", icon: "⛓️" },
  ];

  const stateChartData = [
    { label: "Chờ xác nhận", amount: stateCounts["Chờ xác nhận"], color: "bg-yellow-400" },
    { label: "Đã token hóa", amount: stateCounts["Đã token hóa"], color: "bg-cyan-500" },
    { label: "Chào bán NH", amount: stateCounts["Chào bán ngân hàng"], color: "bg-orange-500" },
    { label: "Đã giải ngân", amount: disbursedAmount, color: "bg-green-500" },
  ];
  const maxAmount = Math.max(...stateChartData.map(d => d.amount), 1);

  const recentLogs = blockchainLog.slice(0, 5);

  return (
    <div className="space-y-6 fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((k, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-2 hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold">{k.label}</span>
              <span className={`text-xl ${k.bg} w-9 h-9 flex items-center justify-center rounded-xl`}>{k.icon}</span>
            </div>
            <div className={`text-2xl xl:text-3xl font-bold ${k.color} leading-tight`}>{k.value}</div>
            {k.unit && <div className="text-xs text-slate-400 font-medium">{k.unit}</div>}
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-800 mb-6">📊 Phân bổ khoản phải thu theo trạng thái</h3>
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">Chưa có dữ liệu. Hãy cấp vật tư để tạo khoản phải thu.</div>
        ) : (
          <div className="space-y-4">
            {stateChartData.map((bar, i) => {
              const pct = maxAmount > 0 ? (bar.amount / maxAmount) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-36 text-xs font-semibold text-slate-600 text-right shrink-0">{bar.label}</div>
                  <div className="flex-1 bg-slate-100 rounded-full h-7 overflow-hidden relative">
                    <div className={`${bar.color} h-full rounded-full transition-all duration-700`} style={{ width: `${Math.max(pct, bar.amount > 0 ? 3 : 0)}%` }}></div>
                    {bar.amount > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600">{formatVND(bar.amount)}</span>
                    )}
                  </div>
                  {bar.amount === 0 && <span className="text-xs text-slate-400 w-24">—</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Logs Timeline */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" style={{ animation: "ping 1.2s ease-in-out infinite" }}></span>
          5 Block gần nhất
        </h3>
        <div className="relative border-l-2 border-slate-100 ml-4 space-y-6">
          {recentLogs.map((log, idx) => (
            <div key={idx} className="relative pl-7">
              <div className="absolute -left-[13px] top-0.5 w-6 h-6 bg-white border-2 border-green-200 rounded-full flex items-center justify-center text-green-600 text-[10px] font-bold shadow-sm">
                {idx + 1}
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-3">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded font-bold">{log.action}</span>
                  <span className="font-mono text-[10px] text-green-700 font-bold">#{log.hash}</span>
                  <span className="text-[10px] text-slate-400 ml-auto">{new Date(log.timestamp).toLocaleString("vi-VN")}</span>
                </div>
                <p className="text-xs text-slate-600 truncate" title={log.data}>{log.data}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extra stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
        <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-5 rounded-2xl shadow-md">
          <p className="text-green-100 text-xs font-bold mb-1">Giá lúa thị trường</p>
          <p className="text-2xl font-bold">{GIA_LUA.toLocaleString()} đ/kg</p>
        </div>
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
          <p className="text-slate-500 text-xs font-bold mb-1">Đang chờ giải ngân</p>
          <p className="text-xl font-bold text-orange-600">{formatVND(pendingAmount)}</p>
        </div>
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
          <p className="text-slate-500 text-xs font-bold mb-1">Đã giải ngân thực tế</p>
          <p className="text-xl font-bold text-green-600">{formatVND(disbursedAmount)}</p>
        </div>
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
          <p className="text-slate-500 text-xs font-bold mb-1">Tổng giao dịch</p>
          <p className="text-2xl font-bold text-purple-600">{invoices.length}</p>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
