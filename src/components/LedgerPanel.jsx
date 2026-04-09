const ACTION_STYLE = {
  GENESIS_BLOCK:        "bg-slate-200 text-slate-700",
  SUPPLY_ISSUED:        "bg-green-100 text-green-800",
  INVOICE_TOKENIZED:    "bg-cyan-100 text-cyan-800",
  SCF_SUBMITTED:        "bg-orange-100 text-orange-800",
  LOAN_DISBURSED:       "bg-emerald-100 text-emerald-800",
  SCF_REJECTED:         "bg-red-100 text-red-700",
  BANK_SYNC:            "bg-blue-100 text-blue-700",
  // Risk & Insurance actions
  LOAN_DEFAULT:         "bg-red-200 text-red-800",
  INSURANCE_TRIGGERED:  "bg-amber-100 text-amber-800",
  RECOURSE_SETTLED:     "bg-purple-100 text-purple-800",
};

const LedgerPanel = ({ blockchainLog, onClose }) => (
  <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-[480px] max-w-[98vw] max-h-[70vh] flex flex-col overflow-hidden fade-in">
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-base">⛓️</span>
        <h3 className="text-sm font-bold text-gray-800">Blockchain Ledger — {blockchainLog.length} blocks</h3>
      </div>
      <div onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </div>
    </div>
    <div className="overflow-y-auto flex-1">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
          <tr>
            <th className="px-4 py-2.5 text-left text-slate-500 font-bold uppercase tracking-wider">Hash</th>
            <th className="px-4 py-2.5 text-left text-slate-500 font-bold uppercase tracking-wider">Action</th>
            <th className="px-4 py-2.5 text-left text-slate-500 font-bold uppercase tracking-wider">Time</th>
          </tr>
        </thead>
        <tbody>
          {blockchainLog.map((log, idx) => (
            <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-green-50/40 transition-colors">
              <td className="px-4 py-3">
                <span className="font-mono text-green-700 font-bold">#{log.hash}</span>
              </td>
              <td className="px-4 py-3">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold whitespace-nowrap ${ACTION_STYLE[log.action] ?? "bg-slate-100 text-slate-600"}`}>
                  {log.action}
                </span>
                <p className="text-slate-500 mt-0.5 text-[10px] truncate max-w-[140px]" title={log.data}>{log.data}</p>
              </td>
              <td className="px-4 py-3 text-slate-400 whitespace-nowrap font-medium">
                {new Date(log.timestamp).toLocaleTimeString("vi-VN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default LedgerPanel;
