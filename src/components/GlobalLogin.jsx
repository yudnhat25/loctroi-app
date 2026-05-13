import { useMemo, useState } from "react";
import LocTroi30NamHero from "./LocTroi30NamHero";

// Login redesign theo mockup: split-screen, hero trái + form phải, 3 tabs trên đầu.
// Vẫn giữ đủ 3 vai (Nông dân / Lộc Trời / Ngân hàng) + 5 sub-role nội bộ Lộc Trời.

const TABS = [
  { id: "farmer",  vi: "Nông dân",  en: "FARMER",       color: "green"  },
  { id: "loctroi", vi: "Lộc Trời",  en: "STAFF",        color: "emerald"},
  { id: "bank",    vi: "Ngân hàng", en: "BANK SCF",     color: "orange" },
];

const DEMO_PASSWORD = "123456";

const GlobalLogin = ({ farmers, staff, blockchainLog = [], onLogin }) => {
  const [tab, setTab] = useState("farmer");
  const [accountCode, setAccountCode] = useState("");  // Mã đăng nhập (LT001 / LT-MGR-001)
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const accentMap = {
    green:   { btn: "bg-emerald-700 hover:bg-emerald-800", ring: "focus:ring-emerald-200 focus:border-emerald-500", under: "bg-emerald-700", text: "text-emerald-700", check: "accent-emerald-700" },
    emerald: { btn: "bg-emerald-700 hover:bg-emerald-800", ring: "focus:ring-emerald-200 focus:border-emerald-500", under: "bg-emerald-700", text: "text-emerald-700", check: "accent-emerald-700" },
    orange:  { btn: "bg-orange-600 hover:bg-orange-700",   ring: "focus:ring-orange-200 focus:border-orange-500",   under: "bg-orange-600",  text: "text-orange-700",  check: "accent-orange-600" },
  };
  const accent = accentMap[TABS.find(t => t.id === tab).color];

  // ─── Stats — số thực từ state app, tự cập nhật khi onboard farmer mới ────
  const stats = useMemo(() => ({
    hoThamGia: farmers.length,
    haDBSCL:   farmers.reduce((s,f) => s + (f.dienTich || 0), 0),
    blocks:    blockchainLog.length,
  }), [farmers, blockchainLog]);

  // ─── Lookup tài khoản theo mã đã gõ ──────────────────────────────────────
  const matchedFarmer = useMemo(() => {
    const code = accountCode.trim().toUpperCase();
    if (!code) return null;
    return farmers.find(f => f.id.toUpperCase() === code) ?? null;
  }, [accountCode, farmers]);

  const matchedStaff = useMemo(() => {
    const code = accountCode.trim().toUpperCase();
    if (!code) return null;
    return staff.find(s => s.id.toUpperCase() === code) ?? null;
  }, [accountCode, staff]);

  const handleSubmit = () => {
    setError("");
    if (tab === "bank") {
      if (password !== DEMO_PASSWORD) return setError("Sai mật khẩu. Demo: 123456");
      onLogin({ role: "bank", profile: { id: "BANK-001", hoTen: "Liên minh Ngân hàng", chucDanh: "SCF Underwriter" } });
      return;
    }
    if (!accountCode.trim()) return setError(tab === "farmer" ? "Nhập mã nông hộ (vd: LT001)" : "Nhập mã nhân sự (vd: LT-MGR-001)");

    if (tab === "farmer") {
      if (!matchedFarmer) return setError(`Không tìm thấy hộ với mã "${accountCode.toUpperCase()}". Thử LT001…LT010.`);
      if (password !== DEMO_PASSWORD) return setError("Sai mật khẩu. Demo: 123456");
      onLogin({ role: "farmer", profile: matchedFarmer });
    } else if (tab === "loctroi") {
      if (!matchedStaff) return setError(`Không tìm thấy nhân sự với mã "${accountCode.toUpperCase()}".`);
      if (password !== DEMO_PASSWORD) return setError("Sai mật khẩu. Demo: 123456");
      onLogin({ role: "loctroi", subrole: matchedStaff.subrole, profile: matchedStaff });
    }
  };

  const placeholder = tab === "farmer" ? "LT001" : "LT-MGR-001";
  const codeLabel   = tab === "farmer" ? "Mã nông hộ" : "Mã nhân sự";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ─── LEFT: Hero scene 30 năm Lộc Trời + UAV bay ─────────────────── */}
      <div className="relative lg:w-1/2 min-h-[55vh] lg:min-h-screen overflow-hidden bg-emerald-950">
        <LocTroi30NamHero />

        {/* Caption + stats overlay — panel solid để chữ đọc rõ trên nền busy */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          {/* Fade transition mềm từ ảnh xuống panel tối */}
          <div className="h-20 bg-gradient-to-b from-transparent to-emerald-950"></div>
          {/* Panel solid */}
          <div className="bg-emerald-950 px-6 lg:px-10 pb-6 lg:pb-10 pt-0">
            <div className="text-[10px] font-mono font-bold tracking-[0.25em] text-amber-300 uppercase mb-3 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-300" style={{ animation: "ping 1.4s ease-in-out infinite" }}></span>
              Hyperledger · LocTroi-AgriChain-v2
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Lúa gạo Việt Nam<br/>trên Blockchain.
            </h1>
            <p className="text-sm text-emerald-100/85 mt-3 max-w-md leading-relaxed">
              Hệ thống quản lý hộ nông dân, vật tư, tín dụng và bao tiêu —
              từ ruộng đến gạo xuất khẩu — với mọi giao dịch ghi bất biến lên sổ cái phân tán.
            </p>

            <div className="grid grid-cols-3 gap-6 mt-6 max-w-md pt-5 border-t border-emerald-800/60">
              <Stat value={stats.hoThamGia.toLocaleString("vi-VN")} label="hộ tham gia" />
              <Stat value={stats.haDBSCL.toLocaleString("vi-VN")} label="ha · ĐBSCL" />
              <Stat value={stats.blocks.toLocaleString("vi-VN")} label="blocks ghi" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Form ─────────────────────────────────────────────────── */}
      <div className="lg:w-1/2 flex flex-col p-6 lg:p-12 xl:p-16 relative">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 lg:mb-12">
          <div className="w-12 h-12 bg-emerald-700 text-white rounded-xl flex items-center justify-center font-extrabold text-lg shadow-md">LT</div>
          <div>
            <div className="text-xl font-extrabold text-slate-900 tracking-wide leading-none">LỘC TRỜI</div>
            <div className="text-[10px] font-bold text-emerald-700 tracking-[0.2em]">AGRICHAIN GROUP</div>
          </div>
        </div>

        {/* Headline */}
        <div className="mb-6 max-w-md">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">
            Xác minh tài khoản Lộc Trời<br/>
            để truy cập hệ thống AgriChain
          </h2>
          <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] mt-3">DÀNH CHO ĐỐI TÁC HỆ THỐNG</p>
          <p className="text-xs text-slate-400 italic">Verify your LocTroi account to access the AgriChain platform</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-6 max-w-md">
          {TABS.map(t => {
            const active = tab === t.id;
            const a = accentMap[t.color];
            return (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setError(""); setAccountCode(""); }}
                className={`flex-1 pb-3 text-center transition-all relative ${active ? a.text : "text-slate-400 hover:text-slate-700"}`}
              >
                <div className={`text-base font-bold ${active ? "" : "font-semibold"}`}>{t.vi}</div>
                <div className="text-[10px] font-bold tracking-[0.15em] mt-0.5">{t.en}</div>
                {active && <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${a.under} rounded-full`}></div>}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <div className="max-w-md w-full space-y-5">
          {/* Account code text input — cho farmer & loctroi staff */}
          {tab !== "bank" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {codeLabel} <span className="text-slate-400 italic font-normal">/ {tab === "farmer" ? "Farmer ID" : "Staff ID"}</span>
              </label>
              <input
                type="text"
                value={accountCode}
                onChange={e => { setAccountCode(e.target.value.toUpperCase()); setError(""); }}
                onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
                placeholder={placeholder}
                spellCheck={false}
                autoComplete="off"
                className={`w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 text-base font-bold tracking-widest focus:outline-none focus:ring-4 transition-all bg-white uppercase ${accent.ring}`}
              />
            </div>
          )}

          {tab === "bank" && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl flex items-center justify-center text-2xl shadow-md">🏦</div>
              <div>
                <div className="text-sm font-bold text-orange-900">Liên minh Ngân hàng</div>
                <div className="text-[11px] text-orange-700">SCF Underwriter · Giải ngân Token hoá AR</div>
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Mật khẩu <span className="text-slate-400 italic font-normal">/ Password</span>
            </label>
            <input
              type="password"
              value={password}
              autoFocus
              maxLength={20}
              placeholder="••••••"
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
              className={`w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 text-lg font-bold tracking-[0.4em] focus:outline-none focus:ring-4 transition-all bg-white ${accent.ring}`}
            />
            {error && <p className="text-red-500 text-xs font-bold mt-2">⚠ {error}</p>}
          </div>

          {/* Remember + forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className={`w-4 h-4 rounded ${accent.check}`} />
              <span className="text-sm text-slate-700">Nhớ đăng nhập</span>
            </label>
            <a href="#" onClick={e => e.preventDefault()} className={`text-sm font-semibold ${accent.text} hover:underline`}>
              Quên mật khẩu?
            </a>
          </div>

          {/* Sign in */}
          <button
            onClick={handleSubmit}
            className={`w-full ${accent.btn} text-white font-bold py-4 rounded-xl text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all`}
          >
            Đăng nhập <span className="opacity-70 italic font-normal text-sm">/ Sign in</span>
          </button>

          {/* Demo hint */}
          <p className="text-center text-xs text-slate-500">
            Demo · mọi tài khoản có mật khẩu <span className="font-mono font-bold text-slate-900">{DEMO_PASSWORD}</span>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 max-w-md">
          <a href="#" onClick={e => e.preventDefault()} className="text-[10px] font-bold text-slate-500 tracking-[0.2em] hover:text-emerald-700">
            QUẢN LÝ TÀI KHOẢN LỘC TRỜI <span className="text-slate-300">/</span> ACCOUNT MANAGEMENT
          </a>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ value, label }) => (
  <div>
    <div className="text-2xl lg:text-3xl font-extrabold text-amber-300 leading-none drop-shadow">{value}</div>
    <div className="text-[11px] text-emerald-50/90 mt-1 font-semibold">{label}</div>
  </div>
);


export default GlobalLogin;
