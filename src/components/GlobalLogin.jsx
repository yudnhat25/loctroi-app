import { useMemo, useState } from "react";
import { LT_SUBROLES } from "../lib/staff";
import { getTier } from "../lib/scoring";

// Login redesign theo mockup: split-screen, hero trái + form phải, 3 tabs trên đầu.
// Vẫn giữ đủ 3 vai (Nông dân / Lộc Trời / Ngân hàng) + 5 sub-role nội bộ Lộc Trời.

const TABS = [
  { id: "farmer",  vi: "Nông dân",  en: "FARMER",       color: "green"  },
  { id: "loctroi", vi: "Lộc Trời",  en: "STAFF",        color: "emerald"},
  { id: "bank",    vi: "Ngân hàng", en: "BANK SCF",     color: "orange" },
];

const DEMO_PASSWORD = "123456";

const GlobalLogin = ({ farmers, staff, onLogin }) => {
  const [tab, setTab] = useState("farmer");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(farmers[0] ?? null);
  const [selectedStaff, setSelectedStaff] = useState(staff[0] ?? null);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const accentMap = {
    green:   { btn: "bg-emerald-700 hover:bg-emerald-800", ring: "focus:ring-emerald-200 focus:border-emerald-500", under: "bg-emerald-700", text: "text-emerald-700", check: "accent-emerald-700" },
    emerald: { btn: "bg-emerald-700 hover:bg-emerald-800", ring: "focus:ring-emerald-200 focus:border-emerald-500", under: "bg-emerald-700", text: "text-emerald-700", check: "accent-emerald-700" },
    orange:  { btn: "bg-orange-600 hover:bg-orange-700",   ring: "focus:ring-orange-200 focus:border-orange-500",   under: "bg-orange-600",  text: "text-orange-700",  check: "accent-orange-600" },
  };
  const accent = accentMap[TABS.find(t => t.id === tab).color];

  // ─── Stats ─────────────────────────────────────────────
  const stats = useMemo(() => ({
    hoThamGia: farmers.length * 124 + 5,            // mock số đẹp gần 1,245
    haDBSCL:  farmers.reduce((s,f)=>s+f.dienTich,0) * 110 + 12,
    blocks:   48000 + Math.floor(Math.random()*600),
  }), [farmers]);

  const handleSubmit = () => {
    if (password !== DEMO_PASSWORD) return setError("Sai mật khẩu. Demo: 123456");
    setError("");
    if (tab === "farmer") {
      if (!selectedFarmer) return setError("Chọn 1 hộ nông dân.");
      onLogin({ role: "farmer", profile: selectedFarmer });
    } else if (tab === "loctroi") {
      if (!selectedStaff) return setError("Chọn nhân sự Lộc Trời.");
      onLogin({ role: "loctroi", subrole: selectedStaff.subrole, profile: selectedStaff });
    } else {
      onLogin({ role: "bank", profile: { id: "BANK-001", hoTen: "Liên minh Ngân hàng", chucDanh: "SCF Underwriter" } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ─── LEFT: Hero illustration + stats ─────────────────────────────── */}
      <div className="relative lg:w-1/2 min-h-[40vh] lg:min-h-screen overflow-hidden bg-gradient-to-br from-amber-100 via-yellow-50 to-emerald-100">
        <HeroSvg />

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10 z-10">
          <div className="text-[10px] font-mono font-bold tracking-[0.25em] text-emerald-800/70 uppercase mb-3">
            ⛓ Hyperledger · LocTroi-AgriChain-v2
          </div>
          <h1 className="text-3xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Lúa gạo Việt Nam<br/>
            trên Blockchain.
          </h1>
          <p className="text-sm text-slate-700 mt-3 max-w-md leading-relaxed">
            Hệ thống quản lý hộ nông dân, vật tư, tín dụng và bao tiêu —
            từ ruộng đến gạo xuất khẩu — với mọi giao dịch ghi bất biến lên sổ cái phân tán.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 max-w-md">
            <Stat value={stats.hoThamGia.toLocaleString("vi-VN")} label="hộ tham gia" />
            <Stat value={stats.haDBSCL.toLocaleString("vi-VN")} label="ha · ĐBSCL" />
            <Stat value={stats.blocks.toLocaleString("vi-VN")} label="blocks ghi" />
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
                onClick={() => { setTab(t.id); setError(""); setPickerOpen(false); }}
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
          {/* Account picker — chỉ hiện cho farmer & loctroi */}
          {tab !== "bank" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Tài khoản <span className="text-slate-400 italic font-normal">/ Account</span>
              </label>
              <AccountPicker
                tab={tab}
                farmers={farmers}
                staff={staff}
                selectedFarmer={selectedFarmer}
                selectedStaff={selectedStaff}
                onPickFarmer={(f) => { setSelectedFarmer(f); setPickerOpen(false); setError(""); }}
                onPickStaff={(s) => { setSelectedStaff(s); setPickerOpen(false); setError(""); }}
                open={pickerOpen}
                setOpen={setPickerOpen}
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

// ─── Account picker dropdown ───────────────────────────────────────────────
const AccountPicker = ({ tab, farmers, staff, selectedFarmer, selectedStaff, onPickFarmer, onPickStaff, open, setOpen }) => {
  const isFarmer = tab === "farmer";
  const sel = isFarmer ? selectedFarmer : selectedStaff;
  const sub = !isFarmer && selectedStaff ? LT_SUBROLES[selectedStaff.subrole] : null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 p-3 border-2 rounded-xl bg-white transition-all hover:border-emerald-300 ${open ? "border-emerald-500 ring-4 ring-emerald-100" : "border-emerald-300"}`}
      >
        {isFarmer ? (
          <FarmerRow f={sel} />
        ) : (
          <StaffRow s={sel} sr={sub} />
        )}
        <svg className={`w-4 h-4 text-slate-400 ml-2 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-30 max-h-80 overflow-y-auto fade-in">
          {isFarmer ? (
            <div className="py-1">
              {farmers.map(f => (
                <div key={f.id} onClick={() => onPickFarmer(f)} className={`px-3 py-2.5 cursor-pointer hover:bg-emerald-50 transition-colors flex items-center ${selectedFarmer?.id === f.id ? "bg-emerald-50/70" : ""}`}>
                  <FarmerRow f={f} small />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-1">
              {Object.keys(LT_SUBROLES).map(srKey => {
                const list = staff.filter(s => s.subrole === srKey);
                if (list.length === 0) return null;
                const sr = LT_SUBROLES[srKey];
                return (
                  <div key={srKey}>
                    <div className="px-3 py-1.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase bg-slate-50 sticky top-0">
                      {sr.icon} {sr.label}
                    </div>
                    {list.map(s => (
                      <div key={s.id} onClick={() => onPickStaff(s)} className={`px-3 py-2.5 cursor-pointer hover:bg-emerald-50 transition-colors flex items-center ${selectedStaff?.id === s.id ? "bg-emerald-50/70" : ""}`}>
                        <StaffRow s={s} sr={sr} small />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const FarmerRow = ({ f, small }) => {
  if (!f) return <div className="text-slate-400 text-sm flex-1 text-left">— Chưa chọn —</div>;
  const tier = getTier(f);
  return (
    <>
      <div className={`${small ? "w-9 h-9" : "w-10 h-10"} bg-emerald-700 text-white rounded-full flex items-center justify-center font-bold shrink-0`}>
        {f.hoTen.charAt(0)}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className={`font-bold text-slate-900 ${small ? "text-sm" : "text-base"} truncate`}>{f.hoTen}</div>
        <div className="text-[11px] text-slate-500 truncate">{f.digitalId ?? f.id} · {f.htx ?? f.diaChi} · {f.dienTich}ha</div>
      </div>
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${tier.badge} shrink-0`}>Tier {tier.code}</span>
    </>
  );
};

const StaffRow = ({ s, sr, small }) => {
  if (!s) return <div className="text-slate-400 text-sm flex-1 text-left">— Chưa chọn —</div>;
  const grad = sr?.color ?? "from-slate-400 to-slate-500";
  return (
    <>
      <div className={`${small ? "w-9 h-9" : "w-10 h-10"} bg-gradient-to-br ${grad} text-white rounded-full flex items-center justify-center font-bold shrink-0 shadow`}>
        {sr?.icon ?? s.hoTen.charAt(0)}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className={`font-bold text-slate-900 ${small ? "text-sm" : "text-base"} truncate`}>{s.hoTen}</div>
        <div className="text-[11px] text-slate-500 truncate">{s.id} · {s.chucDanh}</div>
      </div>
      {sr && <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${sr.bg} ${sr.text} shrink-0`}>{sr.label}</span>}
    </>
  );
};

const Stat = ({ value, label }) => (
  <div>
    <div className="text-2xl lg:text-3xl font-extrabold text-emerald-900 leading-none">{value}</div>
    <div className="text-[11px] text-slate-700 mt-1 font-semibold">{label}</div>
  </div>
);

// ─── Hero illustration (SVG) — 30 năm Lộc Trời + UAV bay animated ─────────
const HeroSvg = () => (
  <>
    <style>{`
      @keyframes droneFly {
        0%   { transform: translate(80px,  220px) rotate(-3deg); }
        25%  { transform: translate(360px, 180px) rotate(2deg); }
        50%  { transform: translate(640px, 230px) rotate(4deg); }
        75%  { transform: translate(420px, 200px) rotate(-2deg); }
        100% { transform: translate(80px,  220px) rotate(-3deg); }
      }
      @keyframes droneRotor {
        from { transform: scaleY(1); }
        50%  { transform: scaleY(0.15); }
        to   { transform: scaleY(1); }
      }
      @keyframes flagWave {
        0%,100% { transform: skewY(0deg) rotate(-2deg); }
        50%     { transform: skewY(-3deg) rotate(2deg); }
      }
      @keyframes flagWaveR {
        0%,100% { transform: skewY(0deg) rotate(2deg); }
        50%     { transform: skewY(3deg) rotate(-2deg); }
      }
      @keyframes cloudDrift {
        from { transform: translateX(0); }
        to   { transform: translateX(60px); }
      }
      @keyframes mascotBob {
        0%,100% { transform: translateY(0); }
        50%     { transform: translateY(-6px); }
      }
      .drone-fly  { animation: droneFly 18s ease-in-out infinite; transform-origin: center; }
      .drone-rotor{ animation: droneRotor 0.08s linear infinite; transform-origin: center; }
      .flag-l { animation: flagWave  4s ease-in-out infinite; transform-origin: 0 0; }
      .flag-r { animation: flagWaveR 4.5s ease-in-out infinite; transform-origin: 0 0; }
      .cloud-drift { animation: cloudDrift 24s ease-in-out infinite alternate; }
      .mascot-bob { animation: mascotBob 2.5s ease-in-out infinite; transform-origin: center; }
      .mascot-bob-2 { animation: mascotBob 3s ease-in-out infinite 0.5s; transform-origin: center; }
      .mascot-bob-3 { animation: mascotBob 2.8s ease-in-out infinite 1s; transform-origin: center; }
    `}</style>
    <svg viewBox="0 0 800 800" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cfeefb" />
          <stop offset="55%" stopColor="#e8f7ff" />
          <stop offset="100%" stopColor="#dff5e3" />
        </linearGradient>
        <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="ricefield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>
        <linearGradient id="banner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="bigtext" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bbf7d0" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
        <linearGradient id="tractor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        <linearGradient id="sunray" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <radialGradient id="haze" cx="50%" cy="20%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sky */}
      <rect width="800" height="800" fill="url(#sky)" />
      <rect width="800" height="800" fill="url(#haze)" />

      {/* Clouds */}
      <g className="cloud-drift" opacity="0.92">
        <ellipse cx="120" cy="120" rx="80" ry="22" fill="#fff" />
        <ellipse cx="170" cy="100" rx="55" ry="20" fill="#fff" />
        <ellipse cx="640" cy="80" rx="90" ry="25" fill="#fff" />
        <ellipse cx="690" cy="60" rx="60" ry="18" fill="#fff" />
        <ellipse cx="400" cy="160" rx="70" ry="18" fill="#fff" opacity="0.7" />
      </g>

      {/* Distant hills */}
      <path d="M0,420 L90,380 L200,410 L320,370 L450,400 L580,365 L720,395 L800,380 L800,800 L0,800 Z" fill="url(#hill)" opacity="0.6"/>
      <path d="M0,460 L120,430 L260,450 L420,420 L580,440 L720,420 L800,430 L800,800 L0,800 Z" fill="url(#hill)" opacity="0.85"/>

      {/* Tree silhouettes on hills */}
      <g opacity="0.55" fill="#15803d">
        <circle cx="60"  cy="425" r="14"/>
        <circle cx="180" cy="445" r="12"/>
        <circle cx="280" cy="430" r="10"/>
        <circle cx="640" cy="430" r="14"/>
        <circle cx="730" cy="420" r="11"/>
      </g>

      {/* Yellow rice fields with perspective lines */}
      <g>
        <rect x="0" y="450" width="800" height="200" fill="url(#ricefield)" />
        {Array.from({length: 24}).map((_, i) => (
          <line key={`pl-${i}`} x1={400 + (i - 12) * 60} y1="450" x2={400 + (i - 12) * 200} y2="650"
                stroke="#a16207" strokeWidth="1" opacity="0.4"/>
        ))}
        {Array.from({length: 5}).map((_, r) => (
          <line key={`hr-${r}`} x1="0" y1={460 + r * 38} x2="800" y2={460 + r * 38}
                stroke="#ca8a04" strokeWidth="1.5" opacity={0.35 + r*0.1}/>
        ))}
      </g>

      {/* Foreground green grass band */}
      <rect x="0" y="630" width="800" height="170" fill="#16a34a"/>
      <rect x="0" y="650" width="800" height="150" fill="#15803d"/>

      {/* ── Centerpiece: 30 NĂM badge with sun logo ── */}
      {/* Sun logo on top */}
      <g transform="translate(400,200)">
        {/* Sun rays */}
        {Array.from({length: 9}).map((_, i) => {
          const a = -90 + (i - 4) * 12;
          const rad = (a * Math.PI) / 180;
          return <line key={i}
            x1={Math.cos(rad)*22} y1={Math.sin(rad)*22}
            x2={Math.cos(rad)*42} y2={Math.sin(rad)*42}
            stroke="url(#sunray)" strokeWidth="6" strokeLinecap="round"/>;
        })}
        {/* Sun semicircle */}
        <path d="M -28,0 A 28,28 0 0 1 28,0 Z" fill="url(#sunray)"/>
        {/* Crescent */}
        <path d="M -8,-4 A 12,12 0 0 1 14,-4 A 18,18 0 0 0 -8,-4 Z" fill="#dc2626"/>
        {/* "LỘC TRỜI" text */}
        <text x="0" y="22" fontSize="13" fontWeight="900" fill="#15803d" textAnchor="middle" letterSpacing="1">LỘC TRỜI</text>
      </g>

      {/* Big "30" */}
      <text x="400" y="430" fontSize="220" fontWeight="900" fill="url(#bigtext)" textAnchor="middle"
            stroke="#14532d" strokeWidth="3" style={{paintOrder: "stroke"}}>30</text>
      {/* "NĂM" subscript */}
      <g transform="translate(530,430)">
        <rect x="-10" y="-22" width="80" height="32" rx="4" fill="#15803d"/>
        <text x="30" y="2" fontSize="22" fontWeight="900" fill="#fef3c7" textAnchor="middle" letterSpacing="2">NĂM</text>
      </g>

      {/* ── Two flags ── */}
      {/* Left flag */}
      <g transform="translate(150,280)">
        <line x1="0" y1="0" x2="0" y2="180" stroke="#92400e" strokeWidth="4"/>
        <g className="flag-l">
          <path d="M0,5 L130,0 Q120,30 130,55 L0,60 Z" fill="#15803d"/>
          <circle cx="50" cy="30" r="14" fill="#fef3c7"/>
          <path d="M 38,30 A 12,12 0 0 1 62,30 Z" fill="#f97316"/>
          {Array.from({length: 6}).map((_, i) => {
            const a = -90 + (i - 2.5) * 18;
            const rad = (a * Math.PI) / 180;
            return <line key={i}
              x1={50 + Math.cos(rad)*8} y1={30 + Math.sin(rad)*8}
              x2={50 + Math.cos(rad)*15} y2={30 + Math.sin(rad)*15}
              stroke="#f97316" strokeWidth="2"/>;
          })}
          <text x="75" y="48" fontSize="9" fontWeight="900" fill="#fef3c7">LỘC TRỜI</text>
        </g>
      </g>

      {/* Right flag */}
      <g transform="translate(680,310)">
        <line x1="0" y1="0" x2="0" y2="160" stroke="#92400e" strokeWidth="4"/>
        <g className="flag-r">
          <path d="M0,5 L100,2 Q90,28 100,50 L0,52 Z" fill="#15803d"/>
          <circle cx="38" cy="28" r="11" fill="#fef3c7"/>
          <path d="M 30,28 A 8,8 0 0 1 46,28 Z" fill="#f97316"/>
        </g>
      </g>

      {/* ── Tractor (right side) ── */}
      <g transform="translate(560,400)">
        {/* Body */}
        <rect x="0" y="20" width="120" height="70" rx="8" fill="url(#tractor)"/>
        <rect x="20" y="0" width="55" height="35" rx="6" fill="#fca5a5"/>
        <rect x="25" y="5" width="45" height="22" rx="3" fill="#dbeafe" opacity="0.85"/>
        {/* Wheels */}
        <circle cx="25" cy="100" r="20" fill="#1f2937"/>
        <circle cx="25" cy="100" r="9" fill="#6b7280"/>
        <circle cx="100" cy="100" r="28" fill="#1f2937"/>
        <circle cx="100" cy="100" r="13" fill="#6b7280"/>
        {/* Exhaust */}
        <rect x="10" y="-5" width="6" height="20" fill="#1f2937"/>
        {/* Cute rice mascot driving */}
        <g className="mascot-bob" transform="translate(50,-12)">
          <ellipse cx="0" cy="0" rx="13" ry="18" fill="#fde047"/>
          <ellipse cx="0" cy="-3" rx="11" ry="14" fill="#fef3c7"/>
          <circle cx="-4" cy="-4" r="1.5" fill="#1f2937"/>
          <circle cx="4" cy="-4" r="1.5" fill="#1f2937"/>
          <path d="M-3,2 Q0,5 3,2" stroke="#1f2937" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <path d="M-2,-15 L0,-22 L2,-15 Z" fill="#16a34a"/>
        </g>
      </g>

      {/* ── 3 Farmers (left side) ── */}
      <g transform="translate(180,440)">
        {/* Farmer 1 */}
        <g transform="translate(0,0)">
          <ellipse cx="0" cy="-15" rx="14" ry="10" fill="#92400e"/>
          <circle cx="0" cy="0" r="14" fill="#fde68a"/>
          <circle cx="-4" cy="-2" r="1.5" fill="#1f2937"/>
          <circle cx="4" cy="-2" r="1.5" fill="#1f2937"/>
          <path d="M-3,4 Q0,7 3,4" stroke="#1f2937" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <rect x="-15" y="14" width="30" height="36" rx="4" fill="#7c2d12"/>
          <circle cx="0" cy="22" r="3" fill="#facc15"/>
        </g>
        {/* Farmer 2 (middle) */}
        <g transform="translate(35,-5)">
          <ellipse cx="0" cy="-16" rx="15" ry="11" fill="#15803d"/>
          <circle cx="0" cy="0" r="15" fill="#fde68a"/>
          <circle cx="-5" cy="-2" r="1.5" fill="#1f2937"/>
          <circle cx="5" cy="-2" r="1.5" fill="#1f2937"/>
          <path d="M-4,5 Q0,8 4,5" stroke="#1f2937" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <rect x="-16" y="15" width="32" height="38" rx="4" fill="#16a34a"/>
        </g>
        {/* Farmer 3 */}
        <g transform="translate(70,2)">
          <ellipse cx="0" cy="-14" rx="13" ry="9" fill="#15803d"/>
          <circle cx="0" cy="0" r="13" fill="#fde68a"/>
          <circle cx="-4" cy="-2" r="1.5" fill="#1f2937"/>
          <circle cx="4" cy="-2" r="1.5" fill="#1f2937"/>
          <path d="M-3,4 Q0,6 3,4" stroke="#1f2937" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <rect x="-14" y="13" width="28" height="36" rx="4" fill="#22c55e"/>
        </g>
      </g>

      {/* ── Banner: CÙNG NÔNG DÂN — PHÁT TRIỂN BỀN VỮNG ── */}
      <g>
        <path d="M50,580 L750,580 L780,610 L750,640 L50,640 L20,610 Z" fill="url(#banner)" stroke="#14532d" strokeWidth="2"/>
        <path d="M50,580 L750,580 L780,610 L750,640 L50,640 L20,610 Z" fill="none" stroke="#fef3c7" strokeWidth="1" strokeDasharray="3 3" opacity="0.6"
              transform="translate(0,4)"/>
        <text x="400" y="618" fontSize="22" fontWeight="900" fill="#fef3c7" textAnchor="middle" letterSpacing="1">
          CÙNG NÔNG DÂN · PHÁT TRIỂN BỀN VỮNG
        </text>
      </g>

      {/* ── Bottom mascots: rice grains + fruits ── */}
      <g transform="translate(0,650)">
        {/* Mascot rice grain 1 */}
        <g className="mascot-bob" transform="translate(180,30)">
          <ellipse cx="0" cy="0" rx="20" ry="28" fill="#fde047"/>
          <ellipse cx="0" cy="-3" rx="16" ry="22" fill="#fef3c7"/>
          <circle cx="-6" cy="-5" r="2.5" fill="#1f2937"/>
          <circle cx="6" cy="-5" r="2.5" fill="#1f2937"/>
          <path d="M-5,3 Q0,8 5,3" stroke="#1f2937" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <ellipse cx="-9" cy="2" rx="3" ry="2" fill="#fda4af" opacity="0.7"/>
          <ellipse cx="9" cy="2" rx="3" ry="2" fill="#fda4af" opacity="0.7"/>
          <path d="M-2,-25 L0,-35 L2,-25 Z" fill="#16a34a"/>
        </g>
        {/* Mango */}
        <g className="mascot-bob-2" transform="translate(260,40)">
          <ellipse cx="0" cy="0" rx="22" ry="18" fill="#fb923c"/>
          <ellipse cx="-3" cy="-4" rx="16" ry="12" fill="#fdba74"/>
          <circle cx="-6" cy="-3" r="2" fill="#1f2937"/>
          <circle cx="6" cy="-3" r="2" fill="#1f2937"/>
          <path d="M-4,4 Q0,8 4,4" stroke="#1f2937" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          <circle cx="-7" cy="3" r="2.5" fill="#fda4af" opacity="0.6"/>
          <circle cx="7" cy="3" r="2.5" fill="#fda4af" opacity="0.6"/>
          <path d="M-3,-17 Q0,-22 3,-17" stroke="#16a34a" strokeWidth="2" fill="none"/>
        </g>
        {/* Watermelon mascot */}
        <g className="mascot-bob-3" transform="translate(540,42)">
          <circle cx="0" cy="0" r="22" fill="#16a34a"/>
          <circle cx="0" cy="0" r="17" fill="#dc2626"/>
          {[-8, -3, 2, 7].map((y, i) => <circle key={i} cx={i*4-6} cy={y+3} r="1.2" fill="#1f2937"/>)}
          <circle cx="-7" cy="-3" r="2" fill="#1f2937"/>
          <circle cx="7" cy="-3" r="2" fill="#1f2937"/>
          <path d="M-5,5 Q0,9 5,5" stroke="#1f2937" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        </g>

        {/* Product bottles (simplified) */}
        <g transform="translate(330,15)">
          <rect x="0" y="0" width="22" height="50" rx="3" fill="#dbeafe" stroke="#1e40af" strokeWidth="1.5"/>
          <rect x="2" y="14" width="18" height="18" fill="#1e40af"/>
          <text x="11" y="27" fontSize="6" fontWeight="900" fill="#fff" textAnchor="middle">LT</text>
          <rect x="6" y="-4" width="10" height="8" fill="#1e3a8a"/>
        </g>
        <g transform="translate(360,12)">
          <rect x="0" y="0" width="22" height="55" rx="3" fill="#fff" stroke="#16a34a" strokeWidth="1.5"/>
          <rect x="2" y="14" width="18" height="22" fill="#16a34a"/>
          <text x="11" y="29" fontSize="6" fontWeight="900" fill="#fff" textAnchor="middle">LT</text>
          <rect x="6" y="-4" width="10" height="8" fill="#15803d"/>
        </g>
        <g transform="translate(390,18)">
          <rect x="0" y="0" width="20" height="48" rx="3" fill="#fee2e2" stroke="#dc2626" strokeWidth="1.5"/>
          <rect x="2" y="12" width="16" height="18" fill="#dc2626"/>
          <text x="10" y="25" fontSize="6" fontWeight="900" fill="#fff" textAnchor="middle">LT</text>
          <rect x="5" y="-4" width="10" height="8" fill="#991b1b"/>
        </g>
        <g transform="translate(420,16)">
          <rect x="0" y="0" width="20" height="50" rx="3" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5"/>
          <rect x="2" y="14" width="16" height="18" fill="#d97706"/>
          <text x="10" y="27" fontSize="6" fontWeight="900" fill="#fff" textAnchor="middle">LT</text>
          <rect x="5" y="-4" width="10" height="8" fill="#92400e"/>
        </g>
        <g transform="translate(450,15)">
          <rect x="0" y="0" width="22" height="52" rx="3" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5"/>
          <rect x="2" y="14" width="18" height="20" fill="#16a34a"/>
          <text x="11" y="28" fontSize="6" fontWeight="900" fill="#fff" textAnchor="middle">LT</text>
          <rect x="6" y="-4" width="10" height="8" fill="#15803d"/>
        </g>
      </g>

      {/* ── ANIMATED DRONE flying across sky ── */}
      <g className="drone-fly">
        {/* Drone body */}
        <rect x="-22" y="-8" width="44" height="16" rx="6" fill="#dc2626"/>
        <rect x="-15" y="-12" width="30" height="6" rx="2" fill="#991b1b"/>
        {/* Camera */}
        <circle cx="0" cy="6" r="4" fill="#1f2937"/>
        <circle cx="0" cy="6" r="2" fill="#60a5fa"/>
        {/* Arms */}
        <line x1="-22" y1="0" x2="-34" y2="-12" stroke="#1f2937" strokeWidth="2"/>
        <line x1="22"  y1="0" x2="34"  y2="-12" stroke="#1f2937" strokeWidth="2"/>
        <line x1="-22" y1="0" x2="-34" y2="12"  stroke="#1f2937" strokeWidth="2"/>
        <line x1="22"  y1="0" x2="34"  y2="12"  stroke="#1f2937" strokeWidth="2"/>
        {/* Rotors (animated spinning blur) */}
        <ellipse className="drone-rotor" cx="-34" cy="-12" rx="14" ry="3" fill="#64748b" opacity="0.7"/>
        <ellipse className="drone-rotor" cx="34"  cy="-12" rx="14" ry="3" fill="#64748b" opacity="0.7"/>
        <ellipse className="drone-rotor" cx="-34" cy="12"  rx="14" ry="3" fill="#64748b" opacity="0.7"/>
        <ellipse className="drone-rotor" cx="34"  cy="12"  rx="14" ry="3" fill="#64748b" opacity="0.7"/>
        {/* Rotor hubs */}
        <circle cx="-34" cy="-12" r="2.5" fill="#1f2937"/>
        <circle cx="34"  cy="-12" r="2.5" fill="#1f2937"/>
        <circle cx="-34" cy="12"  r="2.5" fill="#1f2937"/>
        <circle cx="34"  cy="12"  r="2.5" fill="#1f2937"/>
        {/* LED tail */}
        <circle cx="-26" cy="0" r="1.5" fill="#22d3ee"/>
        <text x="-12" y="-18" fontSize="9" fontWeight="bold" fill="#1f2937" fontFamily="monospace">DJI-T40</text>
      </g>
    </svg>
  </>
);

export default GlobalLogin;
