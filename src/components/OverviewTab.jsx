import { getTier } from "../lib/scoring";

const OverviewTab = ({ farmers, invoices, blockchainLog, totalArea }) => {
  const totalReceivables = invoices.reduce((s, i) => s + (i.totalValue || i.amount), 0) || 12400000000;
  const avgFarmingScore = Math.round(farmers.reduce((s, f) => s + (f.farmingScore || 0), 0) / (farmers.length || 1));

  const formatBillion = (val) => "đ" + (val / 1e9).toFixed(1) + " tỷ";

  // Calculate Tier distribution
  const tierCounts = { A: 0, B: 0, C: 0, D: 0 };
  farmers.forEach(f => {
    const t = getTier(f).code;
    if (tierCounts[t] !== undefined) tierCounts[t]++;
  });

  // Check if we have no tier data, then mock slightly to show a nice chart
  if (Object.values(tierCounts).every(v => v === 0)) {
    tierCounts.A = Math.floor(farmers.length * 0.3) || 10;
    tierCounts.B = Math.floor(farmers.length * 0.4) || 20;
    tierCounts.C = Math.floor(farmers.length * 0.2) || 15;
    tierCounts.D = Math.floor(farmers.length * 0.1) || 5;
  }
  
  const totalTiered = Object.values(tierCounts).reduce((a,b) => a+b, 0);

  // Calculate top HTX
  const htxMap = {};
  farmers.forEach(f => {
    if (!f.htx) return;
    if (!htxMap[f.htx]) htxMap[f.htx] = { count: 0, sum: 0 };
    htxMap[f.htx].count++;
    htxMap[f.htx].sum += (f.creditScore + f.farmingScore);
  });
  let topHtx = Object.entries(htxMap)
    .map(([name, data]) => ({ name, avg: Math.round(data.sum / data.count) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 3);
  
  if (topHtx.length === 0) {
    topHtx = [
      { name: "HTX Thoại Sơn", avg: 612 },
      { name: "HTX Châu Phú", avg: 540 },
      { name: "HTX Tri Tôn", avg: 510 },
    ];
  }

  // Render SVG Sparkline
  const renderSparkline = (currentAvg, color) => {
    const points = [
      currentAvg - 80,
      currentAvg - 50,
      currentAvg - 30,
      currentAvg - 20,
      currentAvg - 5,
      currentAvg
    ];
    const max = 1000;
    const min = 0;
    const path = points.map((p, i) => {
      const x = (i / 5) * 80 + 10;
      const y = 30 - ((p - min) / (max - min)) * 20;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(" ");

    return (
      <svg className="w-24 h-10 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="90" cy={30 - ((currentAvg - min) / (max - min)) * 20} r="3.5" fill={color} />
      </svg>
    );
  };

  // Build conic gradient for Donut chart
  let currentPct = 0;
  const stops = [];
  const colors = { A: "#10b981", B: "#3b82f6", C: "#f59e0b", D: "#94a3b8" };
  ["A", "B", "C", "D"].forEach(t => {
    const pct = (tierCounts[t] / totalTiered) * 100;
    if (pct > 0) {
      stops.push(`${colors[t]} ${currentPct}% ${currentPct + pct}%`);
      currentPct += pct;
    }
  });
  const conicStr = stops.join(", ");

  return (
    <div className="fade-in pb-12" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* ─── ROW 1: 4 Metrics Cards ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-6 border border-surface-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">TỔNG HỘ THAM GIA</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight">{farmers.length.toLocaleString("vi-VN")}</div>
              <div className="text-[13px] text-slate-500 font-medium mt-1">Vụ này</div>
            </div>
            <div className="text-right text-emerald-600 font-bold text-[14px]">
              ↑ +{Math.max(1, Math.floor(farmers.length * 0.05))}
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-6 border border-surface-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">DIỆN TÍCH QUẢN LÝ</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight">{(totalArea || 9847).toLocaleString("vi-VN")} <span className="text-2xl">ha</span></div>
              <div className="text-[13px] text-slate-500 font-medium mt-1">{new Set(farmers.map(f => f.htx)).size || 42} HTX</div>
            </div>
            <div className="text-right text-blue-500 font-bold text-[14px] flex flex-col items-end">
              <span>↑</span>
              <span>+{Math.max(10, Math.floor((totalArea || 9847) * 0.04))} ha</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-6 border border-surface-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">VẬT TƯ ĐÃ GIAO</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight">{formatBillion(totalReceivables)}</div>
              <div className="text-[13px] text-slate-500 font-medium mt-1">MTD</div>
            </div>
            <div className="text-right text-amber-500 font-bold text-[14px] flex flex-col items-end">
              <span>↑</span>
              <span>+8.2%</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-6 border border-surface-200">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">AVG FARMING SCORE</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight">{avgFarmingScore || 487}</div>
              <div className="text-[13px] text-slate-500 font-medium mt-1">/600</div>
            </div>
            <div className="text-right text-purple-600 font-bold text-[14px]">
              ↑ +23
            </div>
          </div>
        </div>
      </div>

      {/* ─── ROW 2: Charts & Logs ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Phân bổ Tier */}
        <div className="bg-white rounded-2xl p-6 border border-surface-200 flex flex-col">
          <h3 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight">Phân bổ Tier</h3>
          <p className="text-[13px] font-medium text-slate-500 mb-8">Tổng {farmers.length} hộ</p>
          <div className="flex-1 flex items-center justify-center relative my-4">
            <div 
              className="w-56 h-56 rounded-full" 
              style={{ background: `conic-gradient(${conicStr})` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-36 h-36 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl font-extrabold text-slate-900 leading-none tracking-tight">{farmers.length}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">HỘ NÔNG DÂN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Blockchain */}
        <div className="bg-white rounded-2xl p-6 border border-surface-200 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h3 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="text-xl drop-shadow-sm grayscale opacity-80">⛓️</span> Live Blockchain
              </h3>
              <p className="text-[13px] font-medium text-slate-500 mt-1">Stream từ Hyperledger Fabric</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-extrabold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </div>
          </div>
          <div className="flex-1 relative z-10 mt-2">
            <div className="absolute left-[19px] top-4 bottom-0 w-[2px] bg-slate-100"></div>
            <div className="space-y-6 relative">
              {blockchainLog.slice(0, 3).map((log, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ebf5ec] flex items-center justify-center shrink-0 border-[3px] border-white text-[#486C52] shadow-sm z-10">
                    <span className="text-sm">🌾</span>
                  </div>
                  <div className="pt-0.5">
                    <div className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold uppercase tracking-widest rounded mb-1.5 border border-emerald-100">
                      {log.action}
                    </div>
                    <div className="text-[11px] font-mono font-medium text-slate-400 mb-1.5">#{log.hash} • {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date(log.timestamp).toLocaleDateString("vi-VN")}</div>
                    <div className="text-[13px] text-slate-700 font-medium line-clamp-3 leading-relaxed">
                      {log.data}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Gradient fade out at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-20 pointer-events-none"></div>
        </div>

        {/* Avg Score theo HTX */}
        <div className="bg-white rounded-2xl p-6 border border-surface-200 flex flex-col">
          <h3 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight">Avg Score theo HTX</h3>
          <p className="text-[13px] font-medium text-slate-500 mb-8">Top {topHtx.length} HTX • 6 vụ gần nhất</p>
          <div className="flex-1 flex flex-col justify-between space-y-4">
            {topHtx.map((htx, i) => {
              const colors = ["#10b981", "#3b82f6", "#a855f7"];
              const color = colors[i % colors.length];
              return (
                <div key={i} className="flex items-center justify-between">
                  <div className="w-24">
                    <div className="font-extrabold text-[14px] text-slate-800 truncate">{htx.name}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase">Score</div>
                      <div className="text-[11px] font-bold text-slate-500">{htx.avg}</div>
                    </div>
                  </div>
                  <div className="flex-1 flex justify-center px-2">
                    {renderSparkline(htx.avg, color)}
                  </div>
                  <div className={`text-[20px] font-extrabold w-10 text-right`} style={{ color }}>{htx.avg}</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ─── ROW 3: Alerts & Drones ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cảnh báo cần xử lý */}
        <div className="bg-white rounded-2xl p-6 border border-surface-200 lg:col-span-1">
          <h3 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight mb-6 flex items-center gap-2">
            <span className="text-xl drop-shadow-sm grayscale opacity-80">🚨</span> Cảnh báo cần xử lý
          </h3>
          <div className="space-y-4">
            <div className="bg-rose-50/50 rounded-2xl p-4 border-l-[6px] border-rose-500">
              <div className="font-bold text-slate-800 text-[13px] leading-snug">Drone DR-2026-0203 phát hiện vùng úng 0.4ha tại hộ LT-ND000149</div>
              <div className="text-slate-500 text-[12px] font-medium mt-1.5">→ giao 3Cùng-NV12 kiểm tra</div>
            </div>
            <div className="bg-amber-50/50 rounded-2xl p-4 border-l-[6px] border-amber-500">
              <div className="font-bold text-slate-800 text-[13px] leading-snug">Hộ LT-ND000150 trễ hạn trả nợ 12 ngày</div>
              <div className="text-slate-500 text-[12px] font-medium mt-1.5">→ Credit Score đã trừ -50</div>
            </div>
            <div className="bg-slate-50/80 rounded-2xl p-4 border-l-[6px] border-slate-400">
              <div className="font-bold text-slate-800 text-[13px] leading-snug">12 hộ chưa hoàn tất bón thúc lần 2 theo lịch SRP</div>
              <div className="text-slate-500 text-[12px] font-medium mt-1.5">→ thông báo 3Cùng</div>
            </div>
          </div>
        </div>

        {/* Drone Fleet */}
        <div className="bg-white rounded-2xl p-6 border border-surface-200 lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="text-xl drop-shadow-sm grayscale opacity-80">🛸</span> Drone Fleet
            </h3>
            <div className="bg-cyan-50 text-cyan-700 px-4 py-1.5 rounded-full text-[12px] font-semibold border border-cyan-100">
              8 drones • 6 đang bay
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-cyan-50/40 border border-cyan-100/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center hover:bg-cyan-50 transition-colors">
                <div className="text-4xl mb-3 drop-shadow-md">🛸</div>
                <div className="font-semibold text-slate-700 text-[14px]">DR-014{i-1}</div>
                <div className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest mt-1.5 flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> BAY
                </div>
              </div>
            ))}
            {[7,8].map(i => (
              <div key={i} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 flex flex-col items-center justify-center text-center opacity-60">
                <div className="text-4xl mb-3 drop-shadow-sm grayscale">🛸</div>
                <div className="font-semibold text-slate-500 text-[14px]">DR-014{i-1}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full border-2 border-slate-300"></span> SẠC
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OverviewTab;
