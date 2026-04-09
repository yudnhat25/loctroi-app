const LandmarkIcon = ({ className = "" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>
);
const LayoutDashboardIcon = ({ className = "" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
);
const UsersIcon = ({ className = "" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const FileTextIcon = ({ className = "" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
);
const SmartphoneIcon = ({ className = "" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
);

const navItems = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboardIcon },
  { id: "farmers", label: "Nông hộ & Vật tư", icon: UsersIcon },
  { id: "invoices", label: "Khoản phải thu", icon: FileTextIcon },
  { id: "scf", label: "SCF Ngân hàng", icon: LandmarkIcon },
  { id: "farmerPortal", label: "Cổng Nông hộ", icon: SmartphoneIcon },
];

const Sidebar = ({ activeTab, setActiveTab, blockchainLog, invoices, role, onLogout }) => {
  const pendingScf = invoices.filter(i => i.trangThai === "Chào bán ngân hàng").length;

  let availableTabs = [];
  if (role === "loctroi") {
    availableTabs = [
      { id: "overview", label: "Tổng quan", icon: LayoutDashboardIcon },
      { id: "farmers", label: "Nông hộ & Vật tư", icon: UsersIcon },
      { id: "invoices", label: "Khoản phải thu", icon: FileTextIcon },
    ];
  } else if (role === "bank") {
    availableTabs = [
      { id: "scf", label: "Liên minh Ngân hàng", icon: LandmarkIcon },
    ];
  } else if (role === "farmer") {
    availableTabs = [
      { id: "farmerPortal", label: "Hồ sơ cá nhân", icon: SmartphoneIcon },
    ];
  }

  return (
    <aside className="w-60 xl:w-64 bg-white border-r border-slate-200 flex flex-col z-20 shrink-0 h-full shadow-sm">
      <div className="h-16 flex items-center px-5 border-b border-slate-100">
        <span className="text-2xl mr-2">🌾</span>
        <h1 className="text-base font-bold tracking-tight text-gray-900">LocTroi <span className="text-green-600">AgriChain</span></h1>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 mt-2">Nghiệp vụ cốt lõi</p>
        {availableTabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === id ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-slate-50 hover:text-gray-900"}`}
          >
            <Icon className={`w-5 h-5 shrink-0 ${activeTab === id ? "text-green-600" : "text-gray-400"}`} />
            <span className="truncate">{label}</span>
            {id === "scf" && pendingScf > 0 && (
              <span className="ml-auto bg-orange-100 text-orange-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0">{pendingScf}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-100 bg-slate-50 shrink-0 space-y-3">
        <div onClick={onLogout} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer transition-colors text-sm font-bold shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Đăng xuất
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"
              style={{ animation: "ping 1.2s ease-in-out infinite" }}></div>
            <span className="text-xs font-bold text-gray-700">Blockchain Node</span>
          </div>
          <p className="text-[10px] text-gray-400 font-mono truncate">{blockchainLog[0]?.hash ?? "—"}...live</p>
          <div className="mt-2 bg-green-100 text-green-800 text-[10px] uppercase font-bold text-center py-1 rounded-lg tracking-wider">
            Private DLT Network
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
export { navItems, LandmarkIcon, LayoutDashboardIcon, UsersIcon, FileTextIcon };
