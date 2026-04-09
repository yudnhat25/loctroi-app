import { useState } from "react";

const GlobalLogin = ({ farmers, onLogin }) => {
  const [mode, setMode] = useState("select"); // "select", "farmer", "loctroi", "bank"
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleLoginSubmit = () => {
    if (mode === "farmer" && !selectedFarmer) {
      return setError("Vui lòng chọn tài khoản nông hộ.");
    }
    if (pin !== "1234") return setError("Sai mã PIN. (Gợi ý: 1234)");
    
    setError("");
    const role = mode;
    onLogin({ role, profile: mode === "farmer" ? selectedFarmer : null });
  };

  if (mode === "select") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 fade-in" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">🌾</div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">LocTroi AgriChain</h1>
          <p className="text-slate-500 mt-3 text-lg">Hệ sinh thái Blockchain Tài trợ Nông nghiệp</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {/* Lộc Trời Admin */}
          <div onClick={() => setMode("loctroi")} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center cursor-pointer hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group ring-2 ring-transparent hover:ring-blue-100">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">🏢</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ban Quản Lý Lộc Trời</h2>
            <p className="text-sm text-slate-500">Duyệt cấp vật tư, theo dõi KPI mạng lưới, và xác minh thực địa qua Oracle.</p>
          </div>

          {/* Ngân hàng */}
          <div onClick={() => setMode("bank")} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center cursor-pointer hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group ring-2 ring-transparent hover:ring-orange-100">
            <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">🏦</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Liên Minh Ngân Hàng</h2>
            <p className="text-sm text-slate-500">Cấp vốn ưu đãi, thẩm định hồ sơ điện tử và giải ngân tự động qua Smart Contract.</p>
          </div>

          {/* Nông hộ */}
          <div onClick={() => setMode("farmer")} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center cursor-pointer hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group ring-2 ring-transparent hover:ring-green-100">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">👨‍🌾</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Cổng Nông Hộ</h2>
            <p className="text-sm text-slate-500">Quản lý định danh số (Digital ID), sổ cái cá nhân và trực tiếp ký duyệt SCF.</p>
          </div>
        </div>
        
        <div className="mt-16 text-center text-xs text-slate-400 font-mono tracking-widest uppercase">
          Powered by Hyperledger Fabric & Chainlink Oracles
        </div>
      </div>
    );
  }

  // PIN / User Select Mode
  const isFarmer = mode === "farmer";
  const title = isFarmer ? "Đăng nhập Nông hộ" : mode === "loctroi" ? "Đăng nhập Lộc Trời" : "Đăng nhập Ngân Hàng";
  const subtitle = isFarmer ? "Truy cập vào định danh số của bạn" : "Xác thực lớp truy cập tổ chức";
  const icon = isFarmer ? "👨‍🌾" : mode === "loctroi" ? "🏢" : "🏦";
  const iconBg = isFarmer ? "from-green-500 to-emerald-600" : mode === "loctroi" ? "from-blue-500 to-indigo-600" : "from-orange-500 to-red-600";
  const btnColor = isFarmer ? "bg-green-600 hover:bg-green-700" : mode === "loctroi" ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-600 hover:bg-orange-700";
  const ringColor = isFarmer ? "focus:ring-green-50 focus:border-green-500" : mode === "loctroi" ? "focus:ring-blue-50 focus:border-blue-500" : "focus:ring-orange-50 focus:border-orange-500";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 fade-in" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6 relative">
          <div onClick={() => { setMode("select"); setError(""); setPin(""); }} className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white shadow-sm border border-slate-200 hover:bg-slate-50 rounded-full cursor-pointer transition-colors">
            <span className="text-slate-600 font-bold">←</span>
          </div>
          <div className={`w-20 h-20 bg-gradient-to-br ${iconBg} rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
            <span className="text-4xl">{icon}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
          {isFarmer && (
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. Chọn tài khoản cá nhân</p>
              <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1 custom-scrollbar">
                {farmers.map(f => (
                  <div
                    key={f.id}
                    onClick={() => { setSelectedFarmer(f); setError(""); }}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedFarmer?.id === f.id
                        ? "border-green-400 bg-green-50 shadow-sm ring-1 ring-green-400"
                        : "border-slate-100 hover:border-slate-300 hover:bg-white bg-white"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                      selectedFarmer?.id === f.id ? "bg-green-600 text-white border-green-700" : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {f.hoTen.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm truncate">{f.hoTen}</div>
                      <div className="text-xs text-slate-400 transition-colors truncate font-mono">{f.id}</div>
                    </div>
                    {selectedFarmer?.id === f.id && <span className="text-green-600 text-lg mr-2">✓</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{isFarmer ? "2. Nhập Mã PIN (Chữ ký số)" : "Nhập Mã PIN truy cập hệ thống"}</p>
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={pin}
              autoFocus
              onChange={e => { setPin(e.target.value); setError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleLoginSubmit(); }}
              className={`w-full border-2 border-slate-200 rounded-xl px-4 py-4 text-center text-3xl tracking-[0.5em] font-bold focus:outline-none focus:ring-4 transition-all mb-3 bg-slate-50 ${ringColor}`}
            />
            {error && <p className="text-red-500 text-xs font-bold mb-3 text-center animate-bounce">{error}</p>}
            <div
              onClick={handleLoginSubmit}
              className={`w-full text-white font-bold py-4 rounded-xl text-sm text-center cursor-pointer transition-all shadow-md mt-2 hover:shadow-lg hover:-translate-y-0.5 ${btnColor}`}
            >
              🔑 Xác thực & Đăng nhập
            </div>
            <p className="text-center text-xs text-slate-400 mt-4 font-mono">Demo PIN: 1234</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalLogin;
