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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm fade-in">
      <div className="bg-white rounded-2xl shadow-[0_24px_64px_-16px_rgba(15,23,42,0.45)] w-full max-w-sm border border-surface-200 text-center px-5 sm:px-7 py-6 sm:py-7">
        {modal.status === "loading" ? (
          <div className="space-y-5">
            <div className="relative mx-auto w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 text-brand-700 spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-700">Oracle 3 Cùng + IoT</div>
              <h3 className="text-[19px] font-display font-semibold text-slate-900 tracking-tight mt-1.5">Đang đối soát thực địa</h3>
              <p className="text-[12px] text-slate-500 mt-1">Cảm biến IoT-04A · UAV NDVI · ký số 3 lớp</p>
            </div>
            <div className="text-left text-[12px] font-mono space-y-2 bg-surface-50 ring-1 ring-surface-200 px-4 py-3.5 rounded-xl">
              {metrics.map((m, i) => {
                const isTarget = modal.nongHoId === "LT004";
                const isFailStep = isTarget && i === 2 && step >= 2;
                const isPast = step > i && !isFailStep;

                return (
                  <div key={i} className={`flex items-center gap-2.5 transition-all duration-300 ${
                    isFailStep ? "text-rose-700"
                    : isPast ? "text-brand-800"
                    : "text-slate-400 opacity-50"
                  }`}>
                    <span className={`w-4 h-4 flex items-center justify-center rounded-full ring-1 ${
                      isFailStep ? "bg-rose-50 ring-rose-200 text-rose-700"
                      : isPast ? "bg-brand-50 ring-brand-200 text-brand-700"
                      : "ring-surface-300"
                    }`}>
                      {isFailStep
                        ? <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12"/></svg>
                        : isPast
                          ? <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          : null}
                    </span>
                    <span className="font-semibold tracking-tight font-sans text-[14px]">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : modal.status === "failed" ? (
          <div className="space-y-4 fade-in">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </div>
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-rose-700">Cảnh báo vi phạm</div>
              <h3 className="text-[20px] font-display font-semibold text-slate-900 tracking-tight mt-1.5">Không đạt tiêu chuẩn SRP</h3>
              <p className="text-[14px] text-slate-500 mt-2 leading-relaxed">
                Phát hiện lúa không đạt tiêu chuẩn độ sạch. Ngừng token hóa để xử lý.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 fade-in">
            <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            </div>
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-700">Kiểm định hoàn tất</div>
              <h3 className="text-[20px] font-display font-semibold text-slate-900 tracking-tight mt-1.5">Dữ liệu hợp lệ</h3>
              <p className="text-[14px] text-slate-500 mt-2 leading-relaxed">Đang khởi tạo Smart Contract Tokenization…</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OracleModal;
