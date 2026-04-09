const getKPIBadge = (score) => {
  if (score < 60) return <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-bold">{score}</span>;
  if (score <= 80) return <span className="bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full font-bold">{score}</span>;
  return <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold">{score}</span>;
};

const FarmersTab = ({ farmers, supplies, supplyRequests, blockchainLog, onApproveRequest, formatVND }) => {
  return (
    <div className="space-y-6 fade-in pb-10">
      {/* Farmer Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-base font-bold text-gray-800">Danh sách Nông hộ liên kết</h2>
          <span className="text-xs text-slate-500 font-semibold">{farmers.length} hộ đăng ký</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 text-left">Mã ID</th>
                <th className="px-5 py-3 text-left">Họ tên</th>
                <th className="px-5 py-3 text-left">Địa chỉ</th>
                <th className="px-5 py-3 text-center">Diện tích</th>
                <th className="px-5 py-3 text-center">KPI</th>
                <th className="px-5 py-3 text-right">Hạn mức TD</th>
                <th className="px-5 py-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map(f => (
                <tr key={f.id} className="border-b border-slate-50 last:border-0 hover:bg-green-50/40 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-slate-700 text-xs">{f.id}</td>
                  <td className="px-5 py-4 font-bold text-gray-800 whitespace-nowrap">{f.hoTen}</td>
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap text-xs">{f.diaChi}</td>
                  <td className="px-5 py-4 text-center font-semibold">{f.dienTich} ha</td>
                  <td className="px-5 py-4 text-center">{getKPIBadge(f.kpiScore)}</td>
                  <td className="px-5 py-4 text-right font-bold text-green-700 whitespace-nowrap">{formatVND(f.hanMucTinDung)}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold ${f.trangThai === "Đang canh tác" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${f.trangThai === "Đang canh tác" ? "bg-green-500" : "bg-red-500"}`}></span>
                      {f.trangThai}
                    </span>
                  </td>
                </tr>
              ))}
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
             Hoàn tất tất cả. Không có yêu cầu vật tư nào cần duyệt từ Nông hộ.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-left">Mã YC</th>
                  <th className="px-5 py-3 text-left">Nông hộ</th>
                  <th className="px-5 py-3 text-left">Vật tư requested</th>
                  <th className="px-5 py-3 text-left">Vụ mùa</th>
                  <th className="px-5 py-3 text-right">Tổng giá trị</th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {supplyRequests.map(req => {
                  const supply = supplies.find(s => s.id === req.supplyId);
                  const total = req.quantity * (supply?.donGia || 0);
                  return (
                    <tr key={req.id} className="border-b border-slate-50 last:border-0 hover:bg-green-50/40">
                      <td className="px-5 py-4 font-mono font-bold text-slate-500 text-xs">{req.id}</td>
                      <td className="px-5 py-4 font-bold text-gray-900">{req.farmer.hoTen}</td>
                      <td className="px-5 py-4 text-slate-700">
                        <span className="font-bold">{req.quantity}</span> {supply?.donVi} {supply?.ten}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">{req.season}</td>
                      <td className="px-5 py-4 text-right font-bold text-orange-600">{formatVND(total)}</td>
                      <td className="px-5 py-4 text-center">
                        <div
                          onClick={() => onApproveRequest(req)}
                          className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm whitespace-nowrap select-none"
                        >
                          Duyệt cấp phát
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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
