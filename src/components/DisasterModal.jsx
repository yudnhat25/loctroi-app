const DisasterModal = ({ modal, onClose, formatVND }) => {
  const { step, insuranceAmount, recourseAmount } = modal;

  const steps = [
    {
      accent: "bg-sky-700",
      ink:    "text-sky-800",
      eyebrow: "Oracle IoT",
      title: "Đang xác minh thiên tai",
      desc:  "UAV và cảm biến đo chỉ số lũ, hạn hán, xâm nhập mặn tại vùng canh tác.",
      loading: true,
    },
    {
      accent: "bg-amber-600",
      ink:    "text-amber-800",
      eyebrow: "Bảo hiểm nông nghiệp",
      title: "Bồi thường đang phân bổ",
      desc:  "Smart contract phân bổ bảo hiểm. Đang trình Lộc Trời xác nhận nghĩa vụ truy đòi.",
      loading: true,
    },
    {
      accent: "bg-brand-700",
      ink:    "text-brand-800",
      eyebrow: "Recourse",
      title: "Tất toán hoàn tất",
      desc:  "Ngân hàng đã xác nhận thu đủ gốc và lãi. Hồ sơ ghi blockchain, không thể sửa đổi.",
      loading: false,
    },
  ];

  const current = steps[step] ?? steps[2];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md fade-in">
      <div className="bg-white rounded-2xl shadow-[0_24px_64px_-16px_rgba(15,23,42,0.45)] w-full max-w-md border border-surface-200 overflow-hidden">

        {/* Progress bar */}
        <div className="flex">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex-1 h-[3px] transition-colors duration-500 ${i <= step ? s.accent : "bg-surface-200"}`}
            />
          ))}
        </div>

        <div className="px-8 py-7 text-center space-y-5">

          {/* Step indicator */}
          <div className="flex justify-center gap-2">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i < step ? "bg-brand-600" : i === step ? "bg-slate-900 w-6" : "bg-surface-300"
                }`}
              />
            ))}
          </div>

          {/* Icon — spinner or check */}
          {current.loading && step < 2 ? (
            <div className="relative mx-auto w-14 h-14 flex items-center justify-center">
              <svg className={`w-14 h-14 ${current.ink} spin`} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            </div>
          )}

          <div className="fade-in">
            <div className={`text-[12px] font-semibold uppercase tracking-[0.14em] ${current.ink}`}>{current.eyebrow}</div>
            <h3 className="text-[20px] font-display font-semibold text-slate-900 tracking-tight mt-1.5">{current.title}</h3>
            <p className="text-[14px] text-slate-500 mt-2 leading-relaxed max-w-sm mx-auto">{current.desc}</p>
          </div>

          {/* Waterfall breakdown */}
          {step >= 1 && insuranceAmount != null && (
            <div className="bg-surface-50 rounded-xl ring-1 ring-surface-200 px-4 py-4 text-left space-y-2.5 fade-in">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Phân bổ bồi thường</p>
              <div className="flex justify-between items-baseline">
                <span className="text-[14px] text-slate-600">Quỹ bảo hiểm (80%)</span>
                <span className="font-display font-semibold tabular text-amber-700 text-[15px]">{formatVND(insuranceAmount)}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-surface-200 pt-2.5">
                <span className="text-[14px] text-slate-600">Lộc Trời bảo lãnh (20%)</span>
                <span className="font-display font-semibold tabular text-sky-700 text-[15px]">{formatVND(recourseAmount)}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-surface-200 pt-2.5">
                <span className="text-[14px] font-semibold text-slate-700">Tổng tất toán</span>
                <span className="font-display font-semibold tabular text-brand-700 text-[17px]">{formatVND((insuranceAmount ?? 0) + (recourseAmount ?? 0))}</span>
              </div>
            </div>
          )}

          {/* Blockchain actions */}
          {step === 2 && (
            <div className="space-y-1.5 text-left fade-in">
              {["LOAN_DEFAULT", "INSURANCE_TRIGGERED", "RECOURSE_SETTLED"].map((action, i) => (
                <div key={i} className="flex items-center gap-2 text-[12px] bg-brand-50 ring-1 ring-brand-200 px-3 py-2 rounded-lg font-mono">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 text-brand-700" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  <span className="text-brand-800 font-semibold">{action}</span>
                  <span className="text-slate-500 ml-auto">ghi blockchain</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-[12px] text-slate-500">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full bg-brand-500/40 ping"></span>
              <span className="relative w-1.5 h-1.5 rounded-full bg-brand-600"></span>
            </span>
            Bảo lãnh bởi <span className="font-semibold text-slate-700">Tập đoàn Lộc Trời</span>
          </div>

          {step === 2 && (
            <button
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg transition-colors text-[14px] fade-in"
            >
              Đóng và xem Ledger
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisasterModal;
