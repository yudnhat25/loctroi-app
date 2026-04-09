const Toast = ({ message }) => (
  <div className="fixed bottom-20 right-6 z-50 fade-in select-none">
    <div className="bg-gray-900 border border-gray-700 text-white px-5 py-3.5 rounded-xl shadow-2xl font-semibold text-sm flex items-center gap-3 min-w-[260px] max-w-sm">
      <span className="text-xl shrink-0">{message.startsWith("✅") ? "✅" : message.startsWith("📤") ? "📤" : message.startsWith("❌") ? "❌" : "🔔"}</span>
      <span className="leading-tight">{message.replace(/^(✅|📤|❌|🔔)\s*/, "")}</span>
    </div>
  </div>
);

export default Toast;
