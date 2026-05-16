const ACTION_STYLE = {
  GENESIS_BLOCK:        "bg-surface-100 text-slate-700 ring-surface-200",
  SUPPLY_ISSUED:        "bg-brand-50  text-brand-800   ring-brand-200",
  SUPPLY_REQUESTED:     "bg-amber-50  text-amber-800   ring-amber-200",
  SUPPLY_APPROVED:      "bg-brand-50  text-brand-800   ring-brand-200",
  SUPPLY_REJECTED:      "bg-rose-50   text-rose-800    ring-rose-200",
  DELIVERY_CONFIRMED:   "bg-amber-50  text-amber-800   ring-amber-200",
  PASSPORT_CREATED:     "bg-brand-50  text-brand-800   ring-brand-200",
  DRONE_REPORT:         "bg-sky-50    text-sky-800     ring-sky-200",
  FIELD_INSPECTION:     "bg-brand-50  text-brand-800   ring-brand-200",
  HARVEST_REPORTED:     "bg-rose-50   text-rose-800    ring-rose-200",
  HARVEST_SETTLED:      "bg-rose-50   text-rose-800    ring-rose-200",
  INVOICE_TOKENIZED:    "bg-sky-50    text-sky-800     ring-sky-200",
  ORACLE_REJECTED:      "bg-rose-50   text-rose-800    ring-rose-200",
  SCF_SUBMITTED:        "bg-amber-50  text-amber-800   ring-amber-200",
  LOAN_DISBURSED:       "bg-brand-50  text-brand-800   ring-brand-200",
  SCF_REJECTED:         "bg-rose-50   text-rose-800    ring-rose-200",
  LOAN_REPAID_ON_TIME:  "bg-brand-50  text-brand-800   ring-brand-200",
  LOAN_DEFAULT:         "bg-rose-50   text-rose-800    ring-rose-200",
  INSURANCE_TRIGGERED:  "bg-amber-50  text-amber-800   ring-amber-200",
  RECOURSE_SETTLED:     "bg-surface-100 text-slate-700 ring-surface-200",
  CREDIT_DELIVERY:      "bg-sky-50    text-sky-800     ring-sky-200",
  CREDIT_HARVEST:       "bg-sky-50    text-sky-800     ring-sky-200",
  CREDIT_UPDATED:       "bg-sky-50    text-sky-800     ring-sky-200",
  TIER_UPGRADE:         "bg-brand-50  text-brand-800   ring-brand-200",
  CASH_PAYMENT:         "bg-surface-100 text-slate-700 ring-surface-200",
};

const LedgerPanel = ({ blockchainLog, onClose }) => (
  <div className="bg-white border border-surface-200 shadow-[0_24px_64px_-16px_rgba(15,23,42,0.35)] rounded-2xl w-[480px] max-w-[calc(100vw-2rem)] max-h-[70vh] sm:max-h-[70vh] flex flex-col overflow-hidden fade-in">
    <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200 shrink-0">
      <div className="flex items-center gap-2.5">
        <span className="relative flex w-2 h-2">
          <span className="absolute inset-0 rounded-full bg-brand-500/40 ping"></span>
          <span className="relative w-2 h-2 rounded-full bg-brand-600"></span>
        </span>
        <div>
          <h3 className="text-[16px] font-display font-semibold text-slate-900 tracking-tight">Blockchain Ledger</h3>
          <p className="text-[11px] text-slate-500 font-mono">{blockchainLog.length} blocks · Hyperledger Fabric</p>
        </div>
      </div>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-surface-50 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div className="overflow-y-auto flex-1">
      <ul className="divide-y divide-surface-200">
        {blockchainLog.map((log, idx) => (
          <li key={idx} className="px-5 py-3 hover:bg-surface-50/60 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold whitespace-nowrap ring-1 ${ACTION_STYLE[log.action] ?? "bg-surface-100 text-slate-700 ring-surface-200"}`}>
                {log.action}
              </span>
              <span className="font-mono text-[11px] text-slate-500">#{log.hash}</span>
              <span className="text-[11px] text-slate-400 ml-auto font-mono">{new Date(log.timestamp).toLocaleTimeString("vi-VN")}</span>
            </div>
            <p className="text-[12px] text-slate-600 leading-snug line-clamp-2" title={log.data}>{log.data}</p>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default LedgerPanel;
