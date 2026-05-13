const OverviewTab = ({ farmers, invoices, blockchainLog, disbursedAmount, pendingAmount, totalArea, stateCounts, formatVND, GIA_LUA }) => {
  const totalReceivables = invoices.reduce((s, i) => s + i.amount, 0);

  const kpiCards = [
    { label: "Hộ nông dân",       value: farmers.length,        unit: "hộ liên kết",     accent: "text-brand-700",  dot: "bg-brand-600" },
    { label: "Diện tích",          value: totalArea.toFixed(1),  unit: "ha · ĐBSCL",      accent: "text-sky-700",    dot: "bg-sky-600" },
    { label: "Khoản phải thu",     value: formatVND(totalReceivables), unit: "tổng AR đang quản lý", accent: "text-amber-700",  dot: "bg-amber-600",  wide: true },
    { label: "Block đã ghi",       value: blockchainLog.length,  unit: "Hyperledger v2",  accent: "text-slate-900",  dot: "bg-slate-700" },
  ];

  const stateChartData = [
    { label: "Chờ xác nhận",       amount: stateCounts["Chờ xác nhận"],       color: "bg-amber-400" },
    { label: "Đã token hóa",       amount: stateCounts["Đã token hóa"],       color: "bg-sky-500" },
    { label: "Chào bán ngân hàng", amount: stateCounts["Chào bán ngân hàng"], color: "bg-amber-600" },
    { label: "Đã giải ngân",       amount: disbursedAmount,                   color: "bg-brand-600" },
  ];
  const maxAmount = Math.max(...stateChartData.map(d => d.amount), 1);

  const recentLogs = blockchainLog.slice(0, 5);

  return (
    <div className="space-y-8 fade-in pb-10">
      {/* KPI Strip — divided grid, không card riêng đồng phục */}
      <section className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-px bg-surface-200">
          {kpiCards.map((k, i) => (
            <div key={i} className={`bg-white px-5 py-5 ${k.wide ? "" : ""}`}>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${k.dot}`}></span>
                <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">{k.label}</span>
              </div>
              <div className={`font-display text-[30px] xl:text-[32px] font-semibold tabular leading-none mt-3 ${k.accent}`}>{k.value}</div>
              {k.unit && <div className="text-[12px] text-slate-500 mt-1.5">{k.unit}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Bar chart */}
      <section className="bg-white rounded-2xl border border-surface-200 px-6 py-5">
        <div className="flex items-baseline justify-between mb-5">
          <h3 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight">Phân bổ khoản phải thu</h3>
          <span className="text-[12px] text-slate-500">theo trạng thái smart contract</span>
        </div>
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-[14px] text-slate-500">Chưa có dữ liệu. Cấp vật tư để tạo khoản phải thu.</div>
        ) : (
          <div className="space-y-3">
            {stateChartData.map((bar, i) => {
              const pct = maxAmount > 0 ? (bar.amount / maxAmount) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-40 text-[14px] font-medium text-slate-600 text-right shrink-0">{bar.label}</div>
                  <div className="flex-1 bg-surface-100 rounded-full h-6 overflow-hidden relative">
                    <div className={`${bar.color} h-full rounded-full transition-all duration-700`} style={{ width: `${Math.max(pct, bar.amount > 0 ? 3 : 0)}%` }}></div>
                    {bar.amount > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-slate-700 tabular">{formatVND(bar.amount)}</span>
                    )}
                  </div>
                  {bar.amount === 0 && <span className="text-[12px] text-slate-400 w-20">—</span>}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent logs */}
      <section className="bg-white rounded-2xl border border-surface-200 px-6 py-5">
        <div className="flex items-baseline justify-between mb-5">
          <h3 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-brand-500/40 ping"></span>
              <span className="relative w-2 h-2 rounded-full bg-brand-600"></span>
            </span>
            5 block gần nhất
          </h3>
          <span className="text-[12px] font-mono text-slate-400">{blockchainLog.length} total</span>
        </div>
        <ol className="relative space-y-4 before:absolute before:left-[7px] before:top-1 before:bottom-1 before:w-px before:bg-surface-200">
          {recentLogs.map((log, idx) => (
            <li key={idx} className="relative pl-6">
              <span className="absolute left-0 top-1 w-[15px] h-[15px] rounded-full bg-brand-600 ring-2 ring-white" />
              <div className="bg-surface-50/80 rounded-lg px-3.5 py-2.5 ring-1 ring-surface-200">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="bg-brand-50 text-brand-800 ring-1 ring-brand-200 text-[11px] px-1.5 py-0.5 rounded-md font-semibold">{log.action}</span>
                  <span className="font-mono text-[11px] text-slate-500">#{log.hash}</span>
                  <span className="text-[11px] text-slate-400 ml-auto">{new Date(log.timestamp).toLocaleString("vi-VN")}</span>
                </div>
                <p className="text-[14px] text-slate-700 truncate" title={log.data}>{log.data}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-surface-200 rounded-2xl overflow-hidden border border-surface-200">
        <div className="bg-slate-900 text-white p-5 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-brand-700" />
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">Giá lúa thị trường</p>
          <p className="font-display text-[30px] font-semibold tabular mt-3 leading-none">{GIA_LUA.toLocaleString("vi-VN")}<span className="text-[14px] text-slate-400 font-normal ml-1">đ/kg</span></p>
        </div>
        <div className="bg-white p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Đang chờ giải ngân</p>
          <p className="font-display text-[22px] font-semibold tabular text-amber-700 mt-3 leading-none">{formatVND(pendingAmount)}</p>
        </div>
        <div className="bg-white p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Đã giải ngân thực tế</p>
          <p className="font-display text-[22px] font-semibold tabular text-brand-700 mt-3 leading-none">{formatVND(disbursedAmount)}</p>
        </div>
        <div className="bg-white p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Tổng giao dịch</p>
          <p className="font-display text-[30px] font-semibold tabular text-slate-900 mt-3 leading-none">{invoices.length}<span className="text-[14px] text-slate-400 font-normal ml-1">hoá đơn</span></p>
        </div>
      </section>
    </div>
  );
};

export default OverviewTab;
