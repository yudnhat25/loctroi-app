const Toast = ({ message }) => {
  // Detect tone từ ký tự đầu để render trạng thái phù hợp
  const kind = message.startsWith("✅") ? "ok"
            : message.startsWith("📤") ? "info"
            : message.startsWith("❌") ? "err"
            : message.startsWith("🌾") || message.startsWith("🚛") || message.startsWith("🛒") ? "ok"
            : "info";
  const clean = message.replace(/^([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}✅❌]|✅|📤|❌|🔔|🌾|🚛|🛒|🪪|🚁|🧑‍🌾|📞|💵|🛡️|🌊)\s*/u, "");
  const tone = {
    ok:   { dot: "bg-brand-400",   ring: "ring-brand-700/40" },
    info: { dot: "bg-sky-400",     ring: "ring-sky-700/40" },
    err:  { dot: "bg-rose-400",    ring: "ring-rose-700/40" },
  }[kind];

  return (
    <div
      className="fixed left-4 right-4 sm:left-auto sm:right-6 z-50 fade-in select-none flex sm:block justify-center"
      style={{ bottom: "max(5rem, calc(env(safe-area-inset-bottom) + 5rem))" }}
    >
      <div className={`bg-slate-900 text-white px-4 py-3 rounded-xl ring-1 ${tone.ring} shadow-[0_12px_32px_-12px_rgba(15,23,42,0.5)] flex items-start gap-3 w-full sm:w-auto sm:min-w-[260px] max-w-sm`}>
        <span className="relative flex w-2 h-2 mt-1.5 shrink-0">
          <span className={`absolute inset-0 rounded-full ${tone.dot} opacity-40 ping`}></span>
          <span className={`relative w-2 h-2 rounded-full ${tone.dot}`}></span>
        </span>
        <span className="leading-snug text-[13px] sm:text-[14px] font-medium">{clean}</span>
      </div>
    </div>
  );
};

export default Toast;
