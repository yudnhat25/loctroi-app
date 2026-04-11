import { useState, useEffect } from "react";

const OracleModal = ({ modal }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (modal.status === "loading") {
      setStep(0);
      const interval = setInterval(() => {
        setStep(s => (s < 3 ? s + 1 : s));
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [modal.status]);

  const metrics = [
    { label: "Tỉ lệ nảy mầm giống chuẩn", icon: "🌱" },
    { label: "UAV: Tuân thủ lịch phun", icon: "🛸" },
    { label: "Độ sạch lúa (Khoanh vùng SRP)", icon: "🌾" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100 text-center p-8">
        {modal.status === "loading" ? (
          <div className="space-y-4">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center mb-2">
              <svg className="w-16 h-16 text-indigo-500 spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span className="absolute text-xl">🛸</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Oracle đang đối soát</h3>
              <p className="text-[11px] text-slate-500 font-medium">Lực lượng 3 Cùng & Cảm biến IoT IoT-04A</p>
            </div>
            <div className="text-left mt-4 text-[10px] font-mono space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100 w-full overflow-hidden">
              {metrics.map((m, i) => {
                const isTarget = modal.nongHoId === "#LT-004";
                const isFailStep = isTarget && i === 2 && step >= 2;
                const isPast = step > i && !isFailStep;
                
                return (
                <div key={i} className={`flex items-center gap-2.5 transition-all duration-300 ${
                  isFailStep ? "text-red-600 opacity-100 translate-x-0" 
                  : isPast ? "text-green-700 opacity-100 translate-x-0" 
                  : "text-slate-400 opacity-40 -translate-x-2"
                }`}>
                  <span className={`w-4 h-4 flex items-center justify-center rounded-full border ${
                    isFailStep ? "bg-red-100 border-red-300"
                    : isPast ? "bg-green-100 border-green-300" 
                    : "border-slate-300"
                  }`}>
                    {isFailStep ? "✗" : isPast ? "✓" : ""}
                  </span>
                  <span className="text-sm">{m.icon}</span>
                  <span className="font-bold tracking-tight">{m.label}</span>
                </div>
              )})}
            </div>
          </div>
        ) : modal.status === "failed" ? (
          <div className="space-y-5 fade-in">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto border-4 border-red-50">
              <span className="text-4xl">❌</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-700 mb-1">Cảnh báo vi phạm!</h3>
              <p className="text-[13px] text-slate-500">Phát hiện lúa không đạt tiêu chuẩn độ sạch SRP. Ngừng token hóa để xử lý.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5 fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto border-4 border-green-50">
              <span className="text-4xl">✅</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-700 mb-1">Kiểm định hoàn tất</h3>
              <p className="text-sm text-slate-500">Dữ liệu hợp lệ. Đang khởi tạo Smart Contract Tokenization...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OracleModal;
