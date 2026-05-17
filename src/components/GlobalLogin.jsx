import { useMemo, useState } from "react";
import LocTroi30NamHero from "./LocTroi30NamHero";
import { User, Briefcase, Landmark, Eye, EyeOff, UserPlus, Search, CheckCircle2, Clock, XCircle } from "lucide-react";

// Login redesign theo mockup: split-screen, hero trái + form phải, 3 tabs trên đầu.
// Vẫn giữ đủ 3 vai (Nông dân / Lộc Trời / Ngân hàng) + 5 sub-role nội bộ Lộc Trời.
// Tab Nông dân thêm 3 mode: Đăng nhập | Đăng ký mới | Tra cứu đơn.

const TABS = [
  { id: "farmer",  vi: "Nông dân",  en: "FARMER",       color: "green",   Icon: User },
  { id: "loctroi", vi: "Lộc Trời",  en: "STAFF",        color: "emerald", Icon: Briefcase },
  { id: "bank",    vi: "Ngân hàng", en: "BANK SCF",     color: "orange",  Icon: Landmark },
];

const DEMO_PASSWORD = "123456";

const HTX_OPTIONS = [
  "HTX Thoại Sơn", "HTX Châu Phú", "HTX Tri Tôn", "HTX Vĩnh Thạnh",
  "HTX Cờ Đỏ", "HTX Tân Hiệp", "HTX Châu Thành", "HTX Thanh Bình",
  "HTX Hòn Đất", "HTX Long Xuyên",
];
const GIONG_OPTIONS = ["Lộc Trời 28", "OM 5451", "Đài Thơm 8", "Jasmine 85", "ST25"];

const emptyRegForm = {
  hoTen: "", cccd: "", sdt: "", diaChi: "",
  htx: HTX_OPTIONS[0], dienTich: "5", giong: GIONG_OPTIONS[0],
};

const GlobalLogin = ({ farmers, staff, blockchainLog = [], onLogin, onSubmitRegistration, onLookupApplication }) => {
  const [tab, setTab] = useState("farmer");
  const [farmerMode, setFarmerMode] = useState("login"); // login | register | lookup
  const [accountCode, setAccountCode] = useState("");  // Mã đăng nhập (LT001 / LT-MGR-001)
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  // Đăng ký mới
  const [regForm, setRegForm] = useState(emptyRegForm);
  const [regErrors, setRegErrors] = useState({});
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regResult, setRegResult] = useState(null); // { id, hoTen, sdt }

  // Tra cứu đơn
  const [lookupSdt, setLookupSdt] = useState("");
  const [lookupResult, setLookupResult] = useState(null); // app object hoặc { notFound: true }

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

  // ─── Đăng ký mới (nông dân tự gửi đơn) ───────────────────────────────────
  const validateReg = () => {
    const e = {};
    if (!regForm.hoTen.trim()) e.hoTen = "Họ tên bắt buộc";
    if (!/^\d{9,12}$/.test(regForm.cccd)) e.cccd = "CCCD 9-12 số";
    if (!/^0\d{9,10}$/.test(regForm.sdt)) e.sdt = "SĐT 10 số bắt đầu 0";
    if (!regForm.diaChi.trim()) e.diaChi = "Địa chỉ bắt buộc";
    const ha = parseFloat(regForm.dienTich);
    if (!ha || ha <= 0) e.dienTich = "Diện tích > 0";
    setRegErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegSubmit = () => {
    if (!validateReg() || !onSubmitRegistration) return;
    setRegSubmitting(true);
    setTimeout(() => {
      const result = onSubmitRegistration(regForm);
      setRegSubmitting(false);
      if (result?.ok) {
        setRegResult({ id: result.app.id, hoTen: result.app.hoTen, sdt: result.app.sdt });
        setRegForm(emptyRegForm);
        setRegErrors({});
      } else {
        setRegErrors({ _form: result?.error || "Không gửi được đơn" });
      }
    }, 600);
  };

  const handleLookup = () => {
    if (!onLookupApplication) return;
    const result = onLookupApplication(lookupSdt);
    setLookupResult(result ?? { notFound: true });
  };

  const switchTab = (id) => {
    setTab(id);
    setError("");
    setAccountCode("");
    setFarmerMode("login");
    setRegResult(null);
    setLookupResult(null);
  };

  const switchFarmerMode = (m) => {
    setFarmerMode(m);
    setError("");
    setRegErrors({});
    if (m !== "register") setRegResult(null);
    if (m !== "lookup") setLookupResult(null);
  };

  const placeholder = tab === "farmer" ? "LT001" : "LT-MGR-001";
  const codeLabel   = tab === "farmer" ? "Mã nông hộ" : "Mã nhân sự";
  const showLoginForm = tab !== "farmer" || farmerMode === "login";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white" style={{ fontFamily: "'Inter', sans-serif", minHeight: "100dvh" }}>
      {/* ─── LEFT: Hero scene 30 năm Lộc Trời + UAV bay ─────────────────── */}
      <div className="relative lg:w-1/2 min-h-[38vh] sm:min-h-[48vh] lg:min-h-screen overflow-hidden bg-emerald-950">
        <LocTroi30NamHero />

        {/* Caption + stats overlay — panel solid để chữ đọc rõ trên nền busy */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          {/* Fade transition mềm từ ảnh xuống panel tối */}
          <div className="h-12 sm:h-20 bg-gradient-to-b from-transparent to-emerald-950"></div>
          {/* Panel solid */}
          <div className="bg-emerald-950 px-5 sm:px-6 lg:px-10 pb-5 sm:pb-6 lg:pb-10 pt-0">
            <div className="text-[10px] font-mono font-bold tracking-[0.25em] text-amber-300 uppercase mb-2 sm:mb-3 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-300" style={{ animation: "ping 1.4s ease-in-out infinite" }}></span>
              <span className="truncate">Hyperledger · LocTroi-AgriChain-v2</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Lúa gạo Việt Nam<br/>trên Blockchain.
            </h1>
            <p className="text-[13px] sm:text-sm text-emerald-100/85 mt-2 sm:mt-3 max-w-md leading-relaxed hidden sm:block">
              Hệ thống quản lý hộ nông dân, vật tư, tín dụng và bao tiêu —
              từ ruộng đến gạo xuất khẩu — với mọi giao dịch ghi bất biến lên sổ cái phân tán.
            </p>

            <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-4 sm:mt-6 max-w-md pt-4 sm:pt-5 border-t border-emerald-800/60">
              <Stat value={stats.hoThamGia.toLocaleString("vi-VN")} label="hộ tham gia" />
              <Stat value={stats.haDBSCL.toLocaleString("vi-VN")} label="ha · ĐBSCL" />
              <Stat value={stats.blocks.toLocaleString("vi-VN")} label="blocks ghi" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Form ─────────────────────────────────────────────────── */}
      <div className="lg:w-1/2 flex flex-col p-5 sm:p-6 lg:p-12 xl:p-16 relative w-full items-center lg:items-start safe-pb">
        <div className="w-full max-w-full sm:max-w-md flex flex-col h-full flex-1">
        {/* Logo */}
        <div className="flex items-end gap-3 mb-5 sm:mb-8 lg:mb-12">
          <img src="/loctroi-logo.png" alt="Lộc Trời" className="h-16 sm:h-20 lg:h-24 w-auto shrink-0" />
          <div className="pb-1 sm:pb-2">
            <div className="text-[10px] sm:text-[11px] font-bold text-emerald-700 tracking-[0.2em]">LOCTROI AGRICHAIN</div>
          </div>
        </div>

        {/* Headline */}
        <div className="mb-5 sm:mb-6 max-w-md">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">
            Xác minh tài khoản Lộc Trời<br className="hidden sm:inline"/>
            <span className="sm:hidden"> </span>để truy cập hệ thống AgriChain
          </h2>
          <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] mt-2 sm:mt-3">DÀNH CHO ĐỐI TÁC HỆ THỐNG</p>
          <p className="text-xs text-slate-400 italic hidden sm:block">Verify your LocTroi account to access the AgriChain platform</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-6 max-w-md">
          {TABS.map(t => {
            const active = tab === t.id;
            const a = accentMap[t.color];
            return (
              <button
                key={t.id}
                onClick={() => switchTab(t.id)}
                className={`flex-1 pb-2.5 sm:pb-3 text-center transition-all relative ${active ? a.text : "text-slate-400 hover:text-slate-700"}`}
              >
                <div className="flex flex-col items-center gap-1 sm:gap-1.5">
                  <t.Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${active ? a.text : "text-slate-400"}`} />
                  <div className={`text-[13px] sm:text-base font-bold ${active ? "" : "font-semibold"}`}>{t.vi}</div>
                </div>
                <div className={`text-[9px] sm:text-[10px] font-bold tracking-[0.12em] sm:tracking-[0.15em] mt-1 transition-colors ${active ? a.text : "text-slate-400"}`}>{t.en}</div>
                {active && <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${a.under} rounded-full transition-colors duration-300`}></div>}
              </button>
            );
          })}
        </div>

        {/* Farmer sub-mode switcher */}
        {tab === "farmer" && (
          <div className="max-w-md w-full mb-5 grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-surface-100 border border-surface-200">
            {[
              { id: "login",    label: "Đăng nhập",  Icon: User },
              { id: "register", label: "Đăng ký mới", Icon: UserPlus },
              { id: "lookup",   label: "Tra cứu đơn", Icon: Search },
            ].map(m => {
              const active = farmerMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => switchFarmerMode(m.id)}
                  className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[12px] sm:text-[13px] font-semibold transition-all ${
                    active ? "bg-emerald-700 text-white shadow-sm" : "text-slate-600 hover:bg-white"
                  }`}
                >
                  <m.Icon className="w-4 h-4" />
                  {m.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Form */}
        <div className="max-w-md w-full space-y-5">
          {/* Account code text input — cho farmer login & loctroi staff */}
          {tab !== "bank" && showLoginForm && (
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
                style={{ colorScheme: 'light' }}
                className={`w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 text-base font-bold tracking-widest focus:outline-none focus:ring-4 transition-all bg-white text-slate-900 uppercase ${accent.ring}`}
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

          {showLoginForm && (
            <>
              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Mật khẩu <span className="text-slate-400 italic font-normal">/ Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    maxLength={20}
                    placeholder="••••••"
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
                    style={{ colorScheme: 'light' }}
                    className={`w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 text-lg font-bold tracking-[0.4em] focus:outline-none focus:ring-4 transition-all bg-white text-slate-900 ${accent.ring} pr-12`}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
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
                {tab === "farmer" && <> · Chưa có mã? <button onClick={() => switchFarmerMode("register")} className="font-bold text-emerald-700 hover:underline">Đăng ký mới</button></>}
              </p>
            </>
          )}

          {/* ─── Form đăng ký mới (chỉ farmer) ─────────────────────────── */}
          {tab === "farmer" && farmerMode === "register" && !regResult && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                <p className="text-[12px] text-emerald-900 leading-relaxed">
                  Điền đầy đủ thông tin. Đơn sẽ được <b>Giám đốc Vùng</b> xét duyệt. Khi duyệt xong, bạn nhận Mã nông hộ <span className="font-mono font-bold">LT-XXX</span> để đăng nhập.
                </p>
              </div>
              <RegField label="Họ và tên" error={regErrors.hoTen}>
                <input value={regForm.hoTen} onChange={e => setRegForm({ ...regForm, hoTen: e.target.value })} placeholder="VD: Nguyễn Văn An" className="login-input" />
              </RegField>
              <div className="grid grid-cols-2 gap-3">
                <RegField label="CCCD (9-12 số)" error={regErrors.cccd}>
                  <input value={regForm.cccd} onChange={e => setRegForm({ ...regForm, cccd: e.target.value.replace(/\D/g, "") })} placeholder="087xxxxxxxxx" maxLength={12} className="login-input" />
                </RegField>
                <RegField label="Số điện thoại" error={regErrors.sdt}>
                  <input value={regForm.sdt} onChange={e => setRegForm({ ...regForm, sdt: e.target.value.replace(/\D/g, "") })} placeholder="0987654321" maxLength={11} className="login-input" />
                </RegField>
              </div>
              <RegField label="Địa chỉ ruộng" error={regErrors.diaChi}>
                <input value={regForm.diaChi} onChange={e => setRegForm({ ...regForm, diaChi: e.target.value })} placeholder="Thoại Sơn, An Giang" className="login-input" />
              </RegField>
              <div className="grid grid-cols-2 gap-3">
                <RegField label="HTX">
                  <select value={regForm.htx} onChange={e => setRegForm({ ...regForm, htx: e.target.value })} className="login-input">
                    {HTX_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </RegField>
                <RegField label="Diện tích (ha)" error={regErrors.dienTich}>
                  <input type="number" min="0.1" step="0.1" value={regForm.dienTich} onChange={e => setRegForm({ ...regForm, dienTich: e.target.value })} className="login-input" />
                </RegField>
              </div>
              <RegField label="Giống lúa thường dùng">
                <select value={regForm.giong} onChange={e => setRegForm({ ...regForm, giong: e.target.value })} className="login-input">
                  {GIONG_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </RegField>
              {regErrors._form && <p className="text-rose-600 text-xs font-bold">⚠ {regErrors._form}</p>}
              <button
                onClick={handleRegSubmit}
                disabled={regSubmitting}
                className={`w-full font-bold py-3.5 rounded-xl text-base shadow-lg hover:shadow-xl transition-all ${regSubmitting ? "bg-slate-400 cursor-wait text-white" : "bg-emerald-700 hover:bg-emerald-800 text-white hover:-translate-y-0.5"}`}
              >
                {regSubmitting ? "Đang gửi đơn lên Giám đốc…" : "Gửi đơn đăng ký"}
              </button>
              <p className="text-center text-[11px] text-slate-400">Sau khi gửi, dùng <b>Tra cứu đơn</b> với SĐT để xem trạng thái.</p>
            </div>
          )}

          {/* ─── Đăng ký thành công ────────────────────────────────────── */}
          {tab === "farmer" && farmerMode === "register" && regResult && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-700 text-white flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-display font-bold text-emerald-900">Đơn đã gửi thành công</h3>
                <p className="text-[13px] text-emerald-800 mt-1.5">
                  Cảm ơn <b>{regResult.hoTen}</b>. Giám đốc Vùng sẽ xét duyệt trong 1-2 ngày làm việc.
                </p>
                <div className="mt-4 inline-flex flex-col items-center gap-1 bg-white rounded-lg border border-emerald-200 px-4 py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Mã đơn của bạn</div>
                  <div className="font-mono font-bold text-emerald-800 text-lg">{regResult.id}</div>
                </div>
                <p className="text-[11px] text-slate-500 mt-3">Lưu mã & SĐT <span className="font-mono">{regResult.sdt}</span> để tra cứu trạng thái.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setRegResult(null); setRegForm(emptyRegForm); }} className="py-3 rounded-xl border border-surface-300 text-slate-700 font-semibold text-[13px] hover:bg-surface-50">Gửi đơn khác</button>
                <button onClick={() => { switchFarmerMode("lookup"); setLookupSdt(regResult.sdt); }} className="py-3 rounded-xl bg-emerald-700 text-white font-semibold text-[13px] hover:bg-emerald-800">Tra cứu đơn này</button>
              </div>
            </div>
          )}

          {/* ─── Tra cứu đơn (chỉ farmer) ──────────────────────────────── */}
          {tab === "farmer" && farmerMode === "lookup" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Số điện thoại đã đăng ký</label>
                <input
                  type="tel"
                  value={lookupSdt}
                  onChange={e => { setLookupSdt(e.target.value.replace(/\D/g, "")); setLookupResult(null); }}
                  onKeyDown={e => { if (e.key === "Enter") handleLookup(); }}
                  placeholder="0987654321"
                  maxLength={11}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 text-base font-bold tracking-wider focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 bg-white text-slate-900"
                />
              </div>
              <button onClick={handleLookup} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-xl text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Tra cứu trạng thái đơn
              </button>

              {lookupResult?.notFound && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center text-[13px] text-amber-900">
                  Không tìm thấy đơn nào với SĐT này. Kiểm tra lại hoặc <button onClick={() => switchFarmerMode("register")} className="font-bold text-emerald-700 hover:underline">đăng ký mới</button>.
                </div>
              )}

              {lookupResult && !lookupResult.notFound && (
                <LookupResultCard app={lookupResult} onLoginAs={() => { switchFarmerMode("login"); setAccountCode(lookupResult.assignedFarmerId || ""); }} />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8">
          <a href="#" onClick={e => e.preventDefault()} className="text-[10px] font-bold text-slate-500 tracking-[0.2em] hover:text-emerald-700 block text-center lg:text-left">
            QUẢN LÝ TÀI KHOẢN LỘC TRỜI <span className="text-slate-300">/</span> ACCOUNT MANAGEMENT
          </a>
        </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ value, label }) => (
  <div>
    <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-amber-300 leading-none drop-shadow">{value}</div>
    <div className="text-[10px] sm:text-[11px] text-emerald-50/90 mt-1 font-semibold">{label}</div>
  </div>
);

const RegField = ({ label, error, children }) => (
  <div>
    <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600 mb-1.5">{label}</label>
    {children}
    {error && <p className="text-rose-600 text-[11px] font-semibold mt-1">{error}</p>}
    <style dangerouslySetInnerHTML={{__html: `.login-input{width:100%;border:2px solid #e2e8f0;border-radius:10px;padding:11px 14px;font-size:14px;font-weight:500;outline:none;transition:border-color .15s, box-shadow .15s;background:#fff;color:#0f172a}.login-input:focus{border-color:#047857;box-shadow:0 0 0 4px rgba(4,120,87,0.12)}.login-input::placeholder{color:#94a3b8;font-weight:400}`}} />
  </div>
);

const LookupResultCard = ({ app, onLoginAs }) => {
  const map = {
    "Chờ duyệt": { Icon: Clock,        cls: "bg-amber-50 border-amber-200 text-amber-900",   iconCls: "bg-amber-500" },
    "Đã duyệt":  { Icon: CheckCircle2, cls: "bg-emerald-50 border-emerald-200 text-emerald-900", iconCls: "bg-emerald-700" },
    "Từ chối":   { Icon: XCircle,      cls: "bg-rose-50 border-rose-200 text-rose-900",      iconCls: "bg-rose-600" },
  };
  const { Icon, cls, iconCls } = map[app.status] || map["Chờ duyệt"];

  return (
    <div className={`border-2 rounded-2xl p-4 ${cls}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full ${iconCls} text-white flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] font-bold">{app.id}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/60 font-bold uppercase tracking-wide">{app.status}</span>
          </div>
          <h3 className="text-[15px] font-display font-bold mt-1">{app.hoTen}</h3>
          <p className="text-[12px] mt-0.5 opacity-80">{app.htx} · {app.dienTich} ha</p>
          <p className="text-[11px] mt-1 opacity-70">Gửi: {new Date(app.submittedAt).toLocaleString("vi-VN")}</p>

          {app.status === "Đã duyệt" && app.assignedFarmerId && (
            <div className="mt-3 bg-white/70 rounded-lg p-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Mã nông hộ của bạn</div>
              <div className="font-mono font-bold text-emerald-800 text-base mt-0.5">{app.assignedFarmerId}</div>
              <button onClick={onLoginAs} className="mt-2 w-full bg-emerald-700 hover:bg-emerald-800 text-white text-[12px] font-bold py-2 rounded-md">
                Dùng mã này đăng nhập →
              </button>
            </div>
          )}
          {app.status === "Từ chối" && app.rejectReason && (
            <div className="mt-3 bg-white/70 rounded-lg p-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">Lý do từ chối</div>
              <p className="text-[12px] mt-0.5 text-slate-800">{app.rejectReason}</p>
            </div>
          )}
          {app.status === "Chờ duyệt" && (
            <p className="text-[11px] mt-2 opacity-80 italic">Giám đốc Vùng đang xem xét. Vui lòng đợi 1-2 ngày làm việc.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalLogin;
