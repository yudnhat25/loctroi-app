const SCFModal = ({ modal, onClose, formatVND }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-md fade-in">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden">
      {modal.status === "loading" ? (
        <div className="p-10 text-center space-y-6">
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 text-blue-500 spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span className="absolute text-2xl">🏦</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Đang xử lý Smart Contract...</h3>
            <p className="text-sm text-slate-500">Mạng Blockchain đang thực thi lệnh chuyển tiền tự động đến tài khoản nông hộ.</p>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center space-y-5 fade-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto border-8 border-green-50 shadow-inner">
            <span className="text-5xl">🎉</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-green-700 mb-1">Giải ngân thành công!</h3>
          </div>
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-left space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-600">Số tiền:</span>
              <span className="font-bold text-green-600 text-base">{formatVND(modal.data?.amount)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200 pt-3">
              <span className="text-sm font-semibold text-slate-600">Thời gian xử lý:</span>
              <span className="font-bold text-gray-800 bg-yellow-100 px-2 py-0.5 rounded text-sm">2 giây</span>
            </div>
            <p className="text-xs text-slate-400 text-right italic">(thay vì 90–120 ngày theo quy trình thủ công)</p>
            <div className="border-t border-slate-200 pt-3">
              <p className="text-xs font-semibold text-slate-600 mb-1">Hash giao dịch:</p>
              <p className="font-mono text-xs text-cyan-700 bg-cyan-50 px-3 py-2 rounded-lg break-all">{modal.hash}</p>
            </div>
          </div>
          <div
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-colors cursor-pointer select-none text-sm"
          >
            Đóng
          </div>
        </div>
      )}
    </div>
  </div>
);

export default SCFModal;
