import { getTier, getOverallScore, MAX_FARMING } from "../lib/scoring";

const FarmersTab = ({ farmers, supplies, supplyRequests, blockchainLog, onApproveRequest, onRejectRequest, formatVND }) => {
  // Phân bổ tier
  const tierCounts = farmers.reduce((acc, f) => {
    const t = getTier(f).code;
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  return (
    <div className="space-y-6 fade-in pb-10">
      {/* Tier distribution summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {["A", "B", "C", "D"].map(code => {
          const colors = {
            A: "from-emerald-500 to-green-600",
            B: "from-cyan-500 to-blue-500",
            C: "from-amber-400 to-orange-500",
            D: "from-rose-500 to-red-600",
          };
          const labels = { A: "VIP — Trả sau 100%", B: "Tin cậy — Trả sau 50%", C: "Phổ thông — Tiền mặt", D: "Cảnh báo — Cọc 30%" };
          return (
            <div key={code} className={`bg-gradient-to-br ${colors[code]} rounded-2xl p-4 text-white shadow-md`}>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">Tier {code}</span>
                <span className="text-3xl font-bold">{tierCounts[code] || 0}</span>
              </div>
              <p className="text-[11px] mt-1 opacity-90">{labels[code]}</p>
            </div>
          );
        })}
      </div>

      {/* Farmer Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-base font-bold text-gray-800">Danh sách Hộ Nông dân liên kết</h2>
          <span className="text-xs text-slate-500 font-semibold">{farmers.length} hộ đăng ký · Hộ chiếu số trên blockchain</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left">Digital ID</th>
                <th className="px-4 py-3 text-left">Họ tên / HTX</th>
                <th className="px-4 py-3 text-center">Diện tích</th>
                <th className="px-4 py-3 text-center">Tier</th>
                <th className="px-4 py-3 text-center">Credit / Farming</th>
                <th className="px-4 py-3 text-center">Overall</th>
                <th className="px-4 py-3 text-right">Hạn mức</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map(f => {
                const tier = getTier(f);
                const overall = getOverallScore(f);
                const fsPct = Math.round(((f.farmingScore ?? 0) / MAX_FARMING) * 100);
                return (
                  <tr key={f.id} className="border-b border-slate-50 last:border-0 hover:bg-green-50/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700 text-[11px]">{f.digitalId ?? f.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-800 whitespace-nowrap text-sm">{f.hoTen}</div>
                      <div className="text-[10px] text-slate-400 whitespace-nowrap">{f.htx ?? f.diaChi}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-xs">{f.dienTich} ha</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-bold ${tier.badge}`}>Tier {tier.code}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="text-[10px]">
                          <div className="text-cyan-700 font-bold">C: {f.creditScore ?? 0}/400</div>
                          <div className="text-emerald-700 font-bold">F: {f.farmingScore ?? 0}/600</div>
                        </div>
                        <div className="w-16 space-y-1">
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500" style={{ width: `${((f.creditScore ?? 0) / 400) * 100}%` }} />
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${fsPct}%` }} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="font-bold text-gray-900">{overall}</div>
                      <div className="text-[10px] text-slate-400">/1000</div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-700 whitespace-nowrap text-xs">{formatVND(f.hanMucTinDung)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supply Catalog */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-base font-bold text-gray-800">Danh mục Vật tư</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
          {supplies.map(s => (
            <div key={s.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="font-bold text-gray-800 mb-1">{s.ten}</p>
              <p className="text-xs text-slate-500 mb-2">Đơn vị: {s.donVi}</p>
              <p className="text-lg font-bold text-green-600">{formatVND(s.donGia)}<span className="text-xs text-slate-500 font-normal ml-1">/{s.donVi}</span></p>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Supply Requests (Lộc Trời view) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-orange-50/30">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
             🔔 Yêu cầu vật tư chờ duyệt
          </h2>
          {supplyRequests?.length > 0 && <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{supplyRequests.length} pending</span>}
        </div>
        {supplyRequests?.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
             Hoàn tất tất cả. Không có yêu cầu vật tư nào cần duyệt từ Hộ Nông dân.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {supplyRequests.map(req => {
              const items = req.items ?? [];
              return (
                <div key={req.id} className="p-4 hover:bg-green-50/40">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono font-bold text-slate-700 text-xs">{req.id}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">Tier {req.chosenTier}</span>
                        <span className="text-[10px] text-slate-400">{req.season}</span>
                      </div>
                      <div className="font-bold text-gray-900 text-sm">{req.farmer.hoTen}</div>
                      <div className="text-[11px] text-slate-500">{req.farmer.htx ?? req.farmer.diaChi} · {req.farmer.dienTich} ha · {req.farmer.digitalId ?? req.farmer.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Tổng giá trị</div>
                      <div className="text-base font-bold text-orange-600">{formatVND(req.total ?? 0)}</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 mb-3">
                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">{items.length} loại vật tư:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((it, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded px-2 py-0.5 text-xs">
                          <b>{it.quantity}</b> {it.donVi} {it.ten}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <div
                      onClick={() => onRejectRequest(req)}
                      className="inline-flex items-center justify-center border border-red-200 text-red-600 hover:bg-red-50 px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm select-none"
                    >
                      Từ chối
                    </div>
                    <div
                      onClick={() => onApproveRequest(req)}
                      className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm select-none"
                    >
                      Duyệt cấp phát → Tài xế giao
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Blockchain Ledger Timeline */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-800 mb-6">⛓️ Sổ cái Blockchain</h3>
        <div className="relative border-l-2 border-slate-100 ml-4 space-y-6">
          {blockchainLog.map((log, idx) => (
            <div key={idx} className="relative pl-7">
              <div className="absolute -left-[13px] top-0.5 w-6 h-6 bg-white border-2 border-green-100 rounded-full flex items-center justify-center text-green-600 shadow-sm">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-3">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded font-bold">{log.action}</span>
                  <span className="font-mono text-[10px] text-green-700 font-bold">#{log.hash}</span>
                  <span className="text-[10px] text-slate-400 ml-auto">{new Date(log.timestamp).toLocaleString("vi-VN")}</span>
                </div>
                <p className="text-xs text-slate-600">{log.data}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FarmersTab;
