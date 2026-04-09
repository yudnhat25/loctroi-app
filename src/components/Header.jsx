const Header = ({ activeTab }) => {
  const labels = {
    overview: "Tổng quan",
    farmers: "Hộ Nông dân & Vật tư",
    invoices: "Khoản phải thu",
    scf: "SCF Ngân hàng",
  };
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 xl:px-8 shadow-sm shrink-0 z-10">
      <div className="flex items-center gap-3">
        <h2 className="text-base xl:text-lg font-bold text-gray-800">{labels[activeTab]}</h2>
        {activeTab === "overview" && (
          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-md font-bold">Real-time</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden xl:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" style={{ animation: "ping 1.2s ease-in-out infinite" }}></span>
          Smart Contract: Active
        </div>
        <div className="h-9 w-9 bg-gradient-to-br from-green-500 to-green-700 text-white rounded-full flex items-center justify-center font-bold shadow-md text-sm cursor-pointer">
          LT
        </div>
      </div>
    </header>
  );
};

export default Header;
