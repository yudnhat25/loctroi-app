import { getTier, getOverallScore, MAX_FARMING } from "../lib/scoring";

const FarmersTab = ({ farmers, supplies, supplyRequests, blockchainLog, onApproveRequest, onRejectRequest, formatVND }) => {
  // Phân bổ tier
  const tierCounts = farmers.reduce((acc, f) => {
    const t = getTier(f).code;
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  return (
    <div className="space-y-6 sm:space-y-8 fade-in pb-10">
      {/* Tier distribution — flat dots, không gradient cards */}
      <section className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-200 flex items-baseline justify-between gap-3">
          <h3 className="text-[15px] sm:text-[17px] font-display font-semibold text-slate-900 tracking-tight">Phân bố Tier nông dân</h3>
          <span className="text-[12px] text-slate-500 shrink-0">{farmers.length} hộ liên kết</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-surface-200">
          {["A", "B", "C", "D"].map(code => {
            const accents = {
              A: { dot: "bg-brand-600",  ink: "text-brand-800",  label: "VIP · Trả sau 100%" },
              B: { dot: "bg-sky-600",    ink: "text-sky-800",    label: "Tin cậy · Trả sau 50%" },
              C: { dot: "bg-amber-600",  ink: "text-amber-800",  label: "Phổ thông · Tiền mặt" },
              D: { dot: "bg-rose-600",   ink: "text-rose-800",   label: "Cảnh báo · Cọc 30%" },
            }[code];
            return (
              <div key={code} className="bg-white px-4 sm:px-5 py-3 sm:py-4">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${accents.dot}`}></span>
                  <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Tier {code}</span>
                </div>
                <div className={`font-display text-[26px] sm:text-[34px] font-semibold tabular leading-none mt-2 sm:mt-3 ${accents.ink}`}>
                  {tierCounts[code] || 0}
                </div>
                <p className="text-[11px] sm:text-[12px] text-slate-500 mt-1.5 sm:mt-2">{accents.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Farmer List */}
      <section className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-200 gap-3">
          <div className="min-w-0">
            <h2 className="text-[15px] sm:text-[17px] font-display font-semibold text-slate-900 tracking-tight">Danh sách hộ liên kết</h2>
            <p className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5">Hộ chiếu số trên blockchain Hyperledger</p>
          </div>
          <span className="text-[11px] sm:text-[12px] font-mono text-slate-400 shrink-0">{farmers.length} entries</span>
        </div>

        {/* Mobile: card list */}
        <ul className="md:hidden divide-y divide-surface-200">
          {farmers.map(f => {
            const tier = getTier(f);
            const overall = getOverallScore(f);
            const fsPct = Math.round(((f.farmingScore ?? 0) / MAX_FARMING) * 100);
            const tierAccent = { A: "text-brand-700 bg-brand-50 ring-brand-200", B: "text-sky-700 bg-sky-50 ring-sky-200", C: "text-amber-800 bg-amber-50 ring-amber-200", D: "text-rose-700 bg-rose-50 ring-rose-200" }[tier.code];
            return (
              <li key={f.id} className="px-4 py-3.5 hover:bg-surface-50/60 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 text-[14px] truncate">{f.hoTen}</span>
                      <span className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-md font-semibold ring-1 ${tierAccent}`}>Tier {tier.code}</span>
                    </div>
                    <div className="text-[12px] text-slate-500 mt-0.5 truncate">{f.htx ?? f.diaChi} · {f.dienTich} ha</div>
                    <div className="font-mono text-[11px] text-slate-400 mt-0.5">{f.digitalId ?? f.id}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display font-semibold text-slate-900 tabular text-[16px] leading-tight">{overall}<span className="text-[10px] text-slate-400 font-normal">/1000</span></div>
                    <div className="text-[12px] font-semibold text-brand-700 tabular mt-1 whitespace-nowrap">{formatVND(f.hanMucTinDung)}</div>
                  </div>
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="text-sky-700 font-semibold">Credit</span>
                      <span className="text-slate-500 tabular">{f.creditScore ?? 0}/400</span>
                    </div>
                    <div className="h-1 bg-surface-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-600 rounded-full" style={{ width: `${((f.creditScore ?? 0) / 400) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="text-brand-700 font-semibold">Farming</span>
                      <span className="text-slate-500 tabular">{f.farmingScore ?? 0}/{MAX_FARMING}</span>
                    </div>
                    <div className="h-1 bg-surface-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-600 rounded-full" style={{ width: `${fsPct}%` }} />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Tablet+: full table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead className="bg-surface-50 text-slate-500 text-[11px] font-semibold uppercase tracking-[0.14em] border-b border-surface-200">
              <tr>
                <th className="px-5 py-3 text-left">Digital ID</th>
                <th className="px-5 py-3 text-left">Họ tên · HTX</th>
                <th className="px-5 py-3 text-center">Diện tích</th>
                <th className="px-5 py-3 text-center">Tier</th>
                <th className="px-5 py-3 text-center">Credit / Farming</th>
                <th className="px-5 py-3 text-center">Overall</th>
                <th className="px-5 py-3 text-right">Hạn mức</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map(f => {
                const tier = getTier(f);
                const overall = getOverallScore(f);
                const fsPct = Math.round(((f.farmingScore ?? 0) / MAX_FARMING) * 100);
                const tierAccent = { A: "text-brand-700 bg-brand-50 ring-brand-200", B: "text-sky-700 bg-sky-50 ring-sky-200", C: "text-amber-800 bg-amber-50 ring-amber-200", D: "text-rose-700 bg-rose-50 ring-rose-200" }[tier.code];
                return (
                  <tr key={f.id} className="border-b border-surface-200 last:border-0 hover:bg-surface-50/60 transition-colors">
                    <td className="px-5 py-3 font-mono font-semibold text-slate-700 text-[12px]">{f.digitalId ?? f.id}</td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-900 whitespace-nowrap text-[14px]">{f.hoTen}</div>
                      <div className="text-[12px] text-slate-500 whitespace-nowrap">{f.htx ?? f.diaChi}</div>
                    </td>
                    <td className="px-5 py-3 text-center text-slate-700 tabular">{f.dienTich} ha</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-[12px] px-2 py-0.5 rounded-md font-semibold ring-1 ${tierAccent}`}>Tier {tier.code}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="text-[11px] tabular text-right leading-tight">
                          <div className="text-sky-700 font-semibold">C: {f.creditScore ?? 0}</div>
                          <div className="text-brand-700 font-semibold">F: {f.farmingScore ?? 0}</div>
                        </div>
                        <div className="w-20 space-y-1">
                          <div className="h-1 bg-surface-100 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-600 rounded-full" style={{ width: `${((f.creditScore ?? 0) / 400) * 100}%` }} />
                          </div>
                          <div className="h-1 bg-surface-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-600 rounded-full" style={{ width: `${fsPct}%` }} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="font-display font-semibold text-slate-900 tabular text-[17px]">{overall}</div>
                      <div className="text-[11px] text-slate-400">/1000</div>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-brand-700 tabular whitespace-nowrap text-[14px]">{formatVND(f.hanMucTinDung)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Supply Catalog */}
      <section className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-200">
          <h2 className="text-[15px] sm:text-[17px] font-display font-semibold text-slate-900 tracking-tight">Danh mục vật tư</h2>
          <p className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5">{supplies.length} loại đang phân phối</p>
        </div>
        <ul className="divide-y divide-surface-200">
          {supplies.map(s => (
            <li key={s.id} className="px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-surface-50/60 transition-colors">
              <div className="min-w-0">
                <p className="text-[13px] sm:text-[14px] font-semibold text-slate-900">{s.ten}</p>
                <p className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5">Đơn vị: {s.donVi}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-[15px] sm:text-[18px] font-semibold tabular text-brand-700 whitespace-nowrap">
                  {formatVND(s.donGia)}<span className="text-[11px] sm:text-[12px] text-slate-400 font-normal ml-1">/{s.donVi}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Pending Supply Requests */}
      <section className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-200 gap-3">
          <div className="min-w-0">
            <h2 className="text-[15px] sm:text-[17px] font-display font-semibold text-slate-900 tracking-tight">Yêu cầu vật tư chờ duyệt</h2>
            <p className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5">Smart contract đối chiếu Tier, bạn xác nhận hoặc từ chối</p>
          </div>
          {supplyRequests?.length > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 ring-1 ring-amber-200 text-[12px] px-2 py-1 rounded-md font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {supplyRequests.length} pending
            </span>
          )}
        </div>
        {supplyRequests?.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-brand-50 flex items-center justify-center text-brand-700 mb-3">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            </div>
            <p className="text-[14px] text-slate-500">Hoàn tất tất cả yêu cầu.</p>
            <p className="text-[12px] text-slate-400 mt-1">Không có yêu cầu vật tư nào cần duyệt.</p>
          </div>
        ) : (
          <ul className="divide-y divide-surface-200">
            {supplyRequests.map(req => {
              const items = req.items ?? [];
              return (
                <li key={req.id} className="px-4 sm:px-6 py-3.5 sm:py-4 hover:bg-surface-50/60">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono font-semibold text-slate-700 text-[13px] sm:text-[14px]">{req.id}</span>
                        <span className="text-[11px] bg-brand-50 text-brand-800 ring-1 ring-brand-200 px-1.5 py-0.5 rounded-md font-semibold">Tier {req.chosenTier}</span>
                        <span className="text-[11px] sm:text-[12px] text-slate-400">{req.season}</span>
                      </div>
                      <div className="font-semibold text-slate-900 text-[14px] sm:text-[15px]">{req.farmer.hoTen}</div>
                      <div className="text-[11px] sm:text-[12px] text-slate-500">{req.farmer.htx ?? req.farmer.diaChi} · {req.farmer.dienTich} ha · {req.farmer.digitalId ?? req.farmer.id}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Tổng giá trị</div>
                      <div className="font-display text-[17px] sm:text-[20px] font-semibold tabular text-amber-700 mt-1 leading-none whitespace-nowrap">{formatVND(req.total ?? 0)}</div>
                    </div>
                  </div>

                  <div className="bg-surface-50 rounded-lg ring-1 ring-surface-200 px-3 py-2 mb-3">
                    <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5">{items.length} loại vật tư</div>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((it, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-white ring-1 ring-surface-200 rounded-md px-2 py-0.5 text-[11px] sm:text-[12px] text-slate-700">
                          <b className="tabular">{it.quantity}</b> {it.donVi} {it.ten}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:flex sm:justify-end gap-2">
                    <button
                      onClick={() => onRejectRequest(req)}
                      className="inline-flex items-center justify-center border border-rose-200 text-rose-700 hover:bg-rose-50 px-3 sm:px-4 py-2 rounded-lg text-[13px] sm:text-[14px] font-semibold transition-colors"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() => onApproveRequest(req)}
                      className="inline-flex items-center justify-center bg-brand-700 hover:bg-brand-800 text-white px-3 sm:px-4 py-2 rounded-lg text-[13px] sm:text-[14px] font-semibold transition-colors"
                    >
                      <span className="sm:hidden">Duyệt</span>
                      <span className="hidden sm:inline">Duyệt và chuyển tài xế</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Blockchain Ledger Timeline */}
      <section className="bg-white rounded-2xl border border-surface-200 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-baseline justify-between mb-4 sm:mb-5 gap-3">
          <h3 className="text-[15px] sm:text-[17px] font-display font-semibold text-slate-900 tracking-tight">Sổ cái blockchain</h3>
          <span className="text-[11px] sm:text-[12px] font-mono text-slate-400 shrink-0">{blockchainLog.length} blocks</span>
        </div>
        <ol className="relative space-y-3 sm:space-y-3.5 before:absolute before:left-[7px] before:top-1 before:bottom-1 before:w-px before:bg-surface-200">
          {blockchainLog.map((log, idx) => (
            <li key={idx} className="relative pl-6">
              <span className="absolute left-0 top-1 w-[15px] h-[15px] rounded-full bg-brand-600 ring-2 ring-white" />
              <div className="bg-surface-50/70 rounded-lg ring-1 ring-surface-200 px-3 sm:px-3.5 py-2 sm:py-2.5">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="bg-brand-50 text-brand-800 ring-1 ring-brand-200 text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md font-semibold">{log.action}</span>
                  <span className="font-mono text-[10px] sm:text-[11px] text-slate-500">#{log.hash}</span>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 ml-auto">{new Date(log.timestamp).toLocaleString("vi-VN")}</span>
                </div>
                <p className="text-[13px] sm:text-[14px] text-slate-700 leading-relaxed break-words">{log.data}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};

export default FarmersTab;
