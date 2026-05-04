import { useState } from "react";
import { LT_SUBROLES, SUBROLE_ORDER } from "../lib/staff";

// 3 cổng chính: Lộc Trời / Bank / Farmer
// Lộc Trời chia 5 sub-role × nhiều nhân sự, mỗi nhân sự có account riêng + KPI cá nhân.
const GlobalLogin = ({ farmers, staff, onLogin }) => {
  const [mode, setMode] = useState("portal"); // portal | bank | farmer | loctroi-subrole | loctroi-staff
  const [subrole, setSubrole] = useState(null); // for loctroi
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const reset = () => { setMode("portal"); setSubrole(null); setSelectedStaff(null); setSelectedFarmer(null); setPin(""); setError(""); };

  const handleSubmit = () => {
    if (mode === "farmer" && !selectedFarmer) return setError("Vui lòng chọn tài khoản hộ nông dân.");
    if (mode === "loctroi-staff" && !selectedStaff) return setError("Vui lòng chọn nhân sự.");
    if (pin !== "1234") return setError("Sai mã PIN. (Demo: 1234)");
    setError("");

    if (mode === "loctroi-staff") {
      onLogin({ role: "loctroi", subrole: selectedStaff.subrole, profile: selectedStaff });
    } else if (mode === "farmer") {
      onLogin({ role: "farmer", profile: selectedFarmer });
    } else if (mode === "bank") {
      onLogin({ role: "bank", profile: { id: "BANK-001", hoTen: "Liên minh Ngân hàng", chucDanh: "SCF Underwriter" } });
    }
  };

  // ─── Portal (3 cổng chính) ─────────────────────────────────────────────────
  if (mode === "portal") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 fade-in" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">🌾</div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">LocTroi AgriChain</h1>
          <p className="text-slate-500 mt-3 text-lg">Hệ sinh thái Blockchain Tài trợ Nông nghiệp</p>
          <p className="text-xs text-slate-400 mt-2">Chọn vai trò để truy cập hệ thống</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          <div onClick={() => setMode("loctroi-subrole")} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center cursor-pointer hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group ring-2 ring-transparent hover:ring-blue-100 select-none">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">🏢</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Tập đoàn Lộc Trời</h2>
            <p className="text-sm text-slate-500">5 vai trò: Quản lý · 3 Cùng · Drone · Tài xế · Thu mua</p>
            <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {staff?.length ?? 6} nhân sự
            </div>
          </div>

          <div onClick={() => setMode("bank")} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center cursor-pointer hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group ring-2 ring-transparent hover:ring-orange-100 select-none">
            <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">🏦</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Liên Minh Ngân Hàng</h2>
            <p className="text-sm text-slate-500">Cấp vốn ưu đãi, thẩm định hồ sơ điện tử và giải ngân tự động qua Smart Contract.</p>
          </div>

          <div onClick={() => setMode("farmer")} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center cursor-pointer hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group ring-2 ring-transparent hover:ring-green-100 select-none">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">👨‍🌾</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Cổng Hộ Nông dân</h2>
            <p className="text-sm text-slate-500">Hộ chiếu Số (Digital ID), đặt vật tư, ký SCF & báo thu hoạch.</p>
            <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {farmers?.length ?? 0} hộ liên kết
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-xs text-slate-400 font-mono tracking-widest uppercase">
          Powered by Hyperledger Fabric · Chainlink Oracles · Computer Vision AI
        </div>
      </div>
    );
  }

  // ─── Lộc Trời: chọn sub-role (5 vai trò nội bộ) ───────────────────────────
  if (mode === "loctroi-subrole") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 fade-in" style={{ fontFamily: "'Inter', sans-serif" }}>
        <BackButton onClick={reset} />
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🏢</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Tập đoàn Lộc Trời</h1>
          <p className="text-slate-500 mt-2">Chọn vai trò nghiệp vụ của bạn — mỗi vai trò có dashboard & KPI riêng</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
          {SUBROLE_ORDER.map(code => {
            const sr = LT_SUBROLES[code];
            const count = staff.filter(s => s.subrole === code).length;
            return (
              <div
                key={code}
                onClick={() => { setSubrole(code); setMode("loctroi-staff"); }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all group select-none"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${sr.color} rounded-xl flex items-center justify-center text-2xl mb-3 shadow-md`}>
                  {sr.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900">{sr.label}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed min-h-[3em]">{sr.desc}</p>
                <div className={`mt-3 inline-flex items-center gap-1 text-[10px] font-bold ${sr.text} ${sr.bg} px-2 py-1 rounded-full`}>
                  {count} nhân sự
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Lộc Trời: chọn nhân sự cụ thể trong sub-role + nhập PIN ──────────────
  if (mode === "loctroi-staff") {
    const sr = LT_SUBROLES[subrole];
    const list = staff.filter(s => s.subrole === subrole);
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 fade-in" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-6 relative">
            <div onClick={() => { setMode("loctroi-subrole"); setError(""); setPin(""); setSelectedStaff(null); }} className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white shadow-sm border border-slate-200 hover:bg-slate-50 rounded-full cursor-pointer">
              <span className="text-slate-600 font-bold">←</span>
            </div>
            <div className={`w-20 h-20 bg-gradient-to-br ${sr.color} rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              <span className="text-4xl">{sr.icon}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{sr.label}</h1>
            <p className="text-sm text-slate-500 mt-1">Chọn tài khoản nhân sự</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. Chọn nhân sự</p>
              <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                {list.map(s => (
                  <div
                    key={s.id}
                    onClick={() => { setSelectedStaff(s); setError(""); }}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                      selectedStaff?.id === s.id ? "border-blue-400 bg-blue-50 shadow-sm ring-1 ring-blue-300" : "border-slate-100 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 bg-gradient-to-br ${sr.color} text-white shadow`}>
                      {s.hoTen.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm truncate">{s.hoTen}</div>
                      <div className="text-[10px] text-slate-500 truncate">{s.chucDanh}</div>
                      <div className="text-[10px] text-slate-400 truncate font-mono">{s.id}</div>
                    </div>
                    {selectedStaff?.id === s.id && <span className="text-blue-600 text-lg mr-2">✓</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">2. Nhập Mã PIN</p>
              <PinInput pin={pin} setPin={setPin} setError={setError} onEnter={handleSubmit} accent="blue" />
              {error && <p className="text-red-500 text-xs font-bold mb-3 text-center">{error}</p>}
              <div onClick={handleSubmit} className={`w-full bg-gradient-to-r ${sr.color} text-white font-bold py-4 rounded-xl text-sm text-center cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all select-none`}>
                🔑 Xác thực &amp; Đăng nhập
              </div>
              <p className="text-center text-xs text-slate-400 mt-4 font-mono">Demo PIN: 1234</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Farmer / Bank ─────────────────────────────────────────────────────────
  const isFarmer = mode === "farmer";
  const title = isFarmer ? "Đăng nhập Hộ Nông dân" : "Đăng nhập Liên Minh Ngân Hàng";
  const subtitle = isFarmer ? "Truy cập Hộ chiếu Số của bạn" : "Xác thực lớp truy cập tổ chức";
  const icon = isFarmer ? "👨‍🌾" : "🏦";
  const grad = isFarmer ? "from-green-500 to-emerald-600" : "from-orange-500 to-red-600";
  const accent = isFarmer ? "green" : "orange";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 fade-in" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6 relative">
          <div onClick={reset} className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white shadow-sm border border-slate-200 hover:bg-slate-50 rounded-full cursor-pointer">
            <span className="text-slate-600 font-bold">←</span>
          </div>
          <div className={`w-20 h-20 bg-gradient-to-br ${grad} rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
            <span className="text-4xl">{icon}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
          {isFarmer && (
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. Chọn hộ nông dân</p>
              <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                {farmers.map(f => (
                  <div
                    key={f.id}
                    onClick={() => { setSelectedFarmer(f); setError(""); }}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                      selectedFarmer?.id === f.id ? "border-green-400 bg-green-50 ring-1 ring-green-400" : "border-slate-100 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${selectedFarmer?.id === f.id ? "bg-green-600 text-white border-green-700" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                      {f.hoTen.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm truncate">{f.hoTen}</div>
                      <div className="text-xs text-slate-400 truncate font-mono">{f.digitalId ?? f.id} · {f.dienTich} ha</div>
                    </div>
                    {selectedFarmer?.id === f.id && <span className="text-green-600 text-lg mr-2">✓</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{isFarmer ? "2. Nhập Mã PIN" : "Nhập Mã PIN truy cập"}</p>
            <PinInput pin={pin} setPin={setPin} setError={setError} onEnter={handleSubmit} accent={accent} />
            {error && <p className="text-red-500 text-xs font-bold mb-3 text-center">{error}</p>}
            <div onClick={handleSubmit} className={`w-full bg-gradient-to-r ${grad} text-white font-bold py-4 rounded-xl text-sm text-center cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all select-none`}>
              🔑 Xác thực &amp; Đăng nhập
            </div>
            <p className="text-center text-xs text-slate-400 mt-4 font-mono">Demo PIN: 1234</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PinInput = ({ pin, setPin, setError, onEnter, accent }) => {
  const ringMap = {
    blue: "focus:ring-blue-100 focus:border-blue-500",
    green: "focus:ring-green-100 focus:border-green-500",
    orange: "focus:ring-orange-100 focus:border-orange-500",
  };
  return (
    <input
      type="password"
      maxLength={4}
      placeholder="••••"
      value={pin}
      autoFocus
      onChange={e => { setPin(e.target.value); setError(""); }}
      onKeyDown={e => { if (e.key === "Enter") onEnter(); }}
      className={`w-full border-2 border-slate-200 rounded-xl px-4 py-4 text-center text-3xl tracking-[0.5em] font-bold focus:outline-none focus:ring-4 transition-all mb-3 bg-slate-50 ${ringMap[accent] ?? ringMap.blue}`}
    />
  );
};

const BackButton = ({ onClick }) => (
  <div onClick={onClick} className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center bg-white shadow-sm border border-slate-200 hover:bg-slate-50 rounded-full cursor-pointer">
    <span className="text-slate-600 font-bold">←</span>
  </div>
);

export default GlobalLogin;
