const SCFModal = ({ modal, onClose, formatVND }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md fade-in">
    <div className="bg-white rounded-2xl shadow-[0_24px_64px_-16px_rgba(15,23,42,0.45)] w-full max-w-md border border-surface-200 overflow-hidden">
      {modal.status === "loading" ? (
        <div className="px-5 sm:px-8 py-8 sm:py-10 text-center space-y-5 sm:space-y-6">
          <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 text-brand-600 spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Smart Contract</div>
            <h3 className="text-[19px] font-display font-semibold text-slate-900 tracking-tight mt-1.5">Đang xử lý giải ngân</h3>
            <p className="text-[14px] text-slate-500 mt-2 leading-relaxed">
              Mạng blockchain thực thi lệnh chuyển tiền tự động đến tài khoản hộ nông dân.
            </p>
          </div>
        </div>
      ) : (
        <div className="px-5 sm:px-8 py-6 sm:py-8 text-center space-y-4 sm:space-y-5 fade-in">
          <div className="w-14 h-14 mx-auto rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          </div>
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-700">Hoàn tất</div>
            <h3 className="text-[22px] font-display font-semibold text-slate-900 tracking-tight mt-1.5">Giải ngân thành công</h3>
          </div>
          <div className="bg-surface-50 rounded-xl ring-1 ring-surface-200 px-5 py-4 text-left space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-[14px] text-slate-600">Số tiền</span>
              <span className="font-display text-[22px] font-semibold tabular text-brand-700">{formatVND(modal.data?.amount)}</span>
            </div>
            <div className="flex justify-between items-baseline border-t border-surface-200 pt-3">
              <span className="text-[14px] text-slate-600">Thời gian xử lý</span>
              <span className="font-mono text-[14px] font-semibold text-slate-900 tabular">2 giây</span>
            </div>
            <p className="text-[11px] text-slate-400 text-right">thay vì 90–120 ngày theo quy trình thủ công</p>
            <div className="border-t border-surface-200 pt-3">
              <p className="text-[12px] font-semibold text-slate-600 mb-1.5">Hash giao dịch</p>
              <p className="font-mono text-[12px] text-sky-800 bg-sky-50 ring-1 ring-sky-200 px-3 py-2 rounded-lg break-all">{modal.hash}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg transition-colors text-[14px]"
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  </div>
);

export default SCFModal;
