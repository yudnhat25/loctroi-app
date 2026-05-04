import { useMemo, useState } from "react";
import { LT_SUBROLES } from "../lib/staff";
import { getTier } from "../lib/scoring";
import LocTroi30NamHero from "./LocTroi30NamHero";

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
      {/* ─── LEFT: Hero scene 30 năm Lộc Trời + UAV bay ─────────────────── */}
      <div className="relative lg:w-1/2 min-h-[55vh] lg:min-h-screen overflow-hidden">
        <LocTroi30NamHero />

        {/* Caption + stats overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10 z-20 bg-gradient-to-t from-emerald-950/85 via-emerald-900/55 to-transparent">
          <div className="text-[10px] font-mono font-bold tracking-[0.25em] text-amber-200/90 uppercase mb-3">
            ⛓ Hyperledger · LocTroi-AgriChain-v2
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
            Lúa gạo Việt Nam<br/>trên Blockchain.
          </h1>
          <p className="text-sm text-emerald-50/90 mt-3 max-w-md leading-relaxed">
            Hệ thống quản lý hộ nông dân, vật tư, tín dụng và bao tiêu —
            từ ruộng đến gạo xuất khẩu — với mọi giao dịch ghi bất biến lên sổ cái phân tán.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-5 max-w-md">
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
    <div className="text-2xl lg:text-3xl font-extrabold text-amber-300 leading-none drop-shadow">{value}</div>
    <div className="text-[11px] text-emerald-50/90 mt-1 font-semibold">{label}</div>
  </div>
);


export default GlobalLogin;
