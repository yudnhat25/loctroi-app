const DisasterModal = ({ modal, onClose, formatVND }) => {
  const { step, data, insuranceAmount, recourseAmount } = modal;

  const steps = [
    {
      icon: "🌊",
      spinColor: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      titleColor: "text-blue-800",
      title: "Oracle IoT đang xác minh thiên tai...",
      desc: "Hệ thống UAV & cảm biến đang đo chỉ số lũ, hạn hán, xâm nhập mặn tại vùng canh tác.",
      loading: true,
    },
    {
      icon: "🛡️",
      spinColor: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      titleColor: "text-orange-700",
      title: "Bảo hiểm Nông nghiệp kích hoạt!",
      desc: "Smart contract tự động phân bổ bồi thường. Đang trình Lộc Trời xác nhận nghĩa vụ truy đòi.",
      loading: true,
    },
    {
      icon: "✅",
      spinColor: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      titleColor: "text-green-700",
      title: "Recourse Tất toán hoàn tất",
      desc: "Ngân hàng đã xác nhận thu đủ gốc và lãi. Hồ sơ ghi lên Blockchain — không thể sửa đổi.",
      loading: false,
    },
  ];

  const current = steps[step] ?? steps[2];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-md fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden">

        {/* Progress bar */}
        <div className="flex">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex-1 h-1 transition-all duration-700 ${
                i <= step ? "bg-green-500" : "bg-slate-100"
              }`}
            />
          ))}
        </div>

        <div className="p-8 text-center space-y-5">

          {/* Step indicator */}
          <div className="flex justify-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  i < step ? "bg-green-500" : i === step ? "bg-blue-500 scale-125" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          {current.loading && step < 2 ? (
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <svg className={`w-24 h-24 ${current.spinColor} spin`} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span className="absolute text-3xl">{current.icon}</span>
            </div>
          ) : (
            <div className={`w-24 h-24 ${current.bgColor} rounded-full flex items-center justify-center mx-auto border-4 ${current.borderColor} shadow-inner`}>
              <span className="text-5xl">{current.icon}</span>
            </div>
          )}

          {/* Title & desc */}
          <div className="fade-in">
            <h3 className={`text-xl font-bold mb-2 ${current.titleColor}`}>{current.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{current.desc}</p>
          </div>

          {/* Waterfall breakdown — step 1+ */}
          {step >= 1 && insuranceAmount != null && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-left space-y-3 fade-in">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phân bổ bồi thường</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 flex items-center gap-1.5">🛡️ Quỹ bảo hiểm (80%)</span>
                <span className="font-bold text-orange-600">{formatVND(insuranceAmount)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                <span className="text-sm text-slate-600 flex items-center gap-1.5">🏢 Lộc Trời bảo lãnh (20%)</span>
                <span className="font-bold text-blue-600">{formatVND(recourseAmount)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                <span className="text-sm font-bold text-slate-700">Tổng tất toán</span>
                <span className="font-bold text-green-600">{formatVND((insuranceAmount ?? 0) + (recourseAmount ?? 0))}</span>
              </div>
            </div>
          )}

          {/* Blockchain actions log */}
          {step === 2 && (
            <div className="space-y-1.5 text-left fade-in">
              {["LOAN_DEFAULT", "INSURANCE_TRIGGERED", "RECOURSE_SETTLED"].map((action, i) => (
                <div key={i} className="flex items-center gap-2 text-xs bg-green-50 border border-green-100 px-3 py-2 rounded-lg font-mono">
                  <span className="text-green-500">✓</span>
                  <span className="text-green-800 font-bold">{action}</span>
                  <span className="text-slate-400 ml-auto">ghi Blockchain</span>
                </div>
              ))}
            </div>
          )}

          {/* Guarantor badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-green-400 ping inline-block"></span>
            Bảo lãnh bởi <span className="font-bold text-slate-700">Tập đoàn Lộc Trời</span>
          </div>

          {/* Close button — only at final step */}
          {step === 2 && (
            <div
              onClick={onClose}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-colors cursor-pointer select-none text-sm fade-in"
            >
              Đóng — Xem Ledger
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisasterModal;
