import { LT_SUBROLES } from "../lib/staff";

const Icon = ({ d, className = "" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);
const LandmarkIcon = ({ className }) => <Icon className={className} d={<><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></>} />;
const LayoutDashboardIcon = ({ className }) => <Icon className={className} d={<><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></>} />;
const UsersIcon = ({ className }) => <Icon className={className} d={<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>} />;
const FileTextIcon = ({ className }) => <Icon className={className} d={<><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></>} />;
const SmartphoneIcon = ({ className }) => <Icon className={className} d={<><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></>} />;
const DroneIcon = ({ className }) => <Icon className={className} d={<><path d="M10 10 6 6"/><path d="m14 10 4-4"/><path d="m14 14 4 4"/><path d="m10 14-4 4"/><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><circle cx="6" cy="18" r="2"/><rect x="10" y="10" width="4" height="4"/></>} />;
const TruckIcon = ({ className }) => <Icon className={className} d={<><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></>} />;
const SeedlingIcon = ({ className }) => <Icon className={className} d={<><path d="M7 17.5C7 14 5 8 12 8s5 6 5 9.5"/><path d="M12 8v14"/><path d="M12 8c0-2 2-6 6-6 0 4-2 6-6 6Z"/><path d="M12 8c0-2-2-6-6-6 0 4 2 6 6 6Z"/></>} />;
const ClipboardIcon = ({ className }) => <Icon className={className} d={<><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></>} />;
const HarvestIcon = ({ className }) => <Icon className={className} d={<><path d="M2 22h20"/><path d="M12 16v6"/><path d="M12 16a6 6 0 0 0 6-6c-6 0-6 6-6 6Z"/><path d="M12 16a6 6 0 0 1-6-6c6 0 6 6 6 6Z"/><path d="M12 10V2"/></>} />;
const UserPlusIcon = ({ className }) => <Icon className={className} d={<><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" x2="20" y1="8" y2="14"/><line x1="23" x2="17" y1="11" y2="11"/></>} />;

// Map: tab id → { label, icon }
export const TAB_DEF = {
  managerHome:     { label: "Trang chủ Quản lý",       icon: LayoutDashboardIcon },
  overview:        { label: "Tổng quan mạng lưới",      icon: LayoutDashboardIcon },
  farmers:         { label: "Hộ Nông dân & Vật tư",     icon: UsersIcon },
  invoices:        { label: "Khoản phải thu",           icon: FileTextIcon },
  officerHome:     { label: "Trang chủ 3 Cùng",         icon: LayoutDashboardIcon },
  onboarding:      { label: "Onboard nông dân (A1)",    icon: UserPlusIcon },
  inspection:      { label: "Kiểm tra SRP (B4)",        icon: ClipboardIcon },
  droneHome:       { label: "Trang chủ Drone",          icon: LayoutDashboardIcon },
  droneUpload:     { label: "Bay drone & AI scan",      icon: DroneIcon },
  driverHome:      { label: "Trang chủ Tài xế",         icon: LayoutDashboardIcon },
  delivery:        { label: "Giao vật tư (B3)",         icon: TruckIcon },
  procurementHome: { label: "Trang chủ Thu mua",        icon: LayoutDashboardIcon },
  harvest:         { label: "Thu hoạch & Tất toán (B5)", icon: HarvestIcon },
  scf:             { label: "Liên minh Ngân hàng",      icon: LandmarkIcon },
  farmerPortal:    { label: "Hồ sơ cá nhân",            icon: SmartphoneIcon },
};

const Sidebar = ({ activeTab, setActiveTab, blockchainLog, invoices, role, subrole, profile, onLogout }) => {
  const pendingScf = invoices.filter(i => i.trangThai === "Chào bán ngân hàng").length;

  let availableTabs = [];
  if (role === "loctroi") {
    availableTabs = LT_SUBROLES[subrole]?.tabs ?? ["overview", "farmers", "invoices"];
  } else if (role === "bank") {
    availableTabs = ["scf"];
  } else if (role === "farmer") {
    availableTabs = ["farmerPortal"];
  }

  const sectionLabel =
    role === "loctroi" ? `Lộc Trời · ${LT_SUBROLES[subrole]?.label ?? "Quản lý"}` :
    role === "bank" ? "Liên Minh Ngân Hàng" : "Hộ Nông dân";

  return (
    <aside className="w-60 xl:w-64 bg-white border-r border-slate-200 flex flex-col z-20 shrink-0 h-full shadow-sm">
      <div className="h-16 flex items-center px-5 border-b border-slate-100">
        <span className="text-2xl mr-2">🌾</span>
        <h1 className="text-base font-bold tracking-tight text-gray-900">LocTroi <span className="text-green-600">AgriChain</span></h1>
      </div>

      {/* Profile mini-card */}
      {profile && (
        <div className="px-4 pt-3">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 border border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow">
                {profile.hoTen?.charAt(0) ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-gray-900 truncate">{profile.hoTen}</div>
                <div className="text-[10px] text-slate-500 truncate font-mono">{profile.id}</div>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 mt-1.5 leading-tight">{profile.chucDanh ?? profile.htx ?? profile.diaChi ?? "—"}</div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 mt-2">{sectionLabel}</p>
        {availableTabs.map(id => {
          const def = TAB_DEF[id];
          if (!def) return null;
          const Ico = def.icon;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === id ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-slate-50 hover:text-gray-900"}`}
            >
              <Ico className={`w-5 h-5 shrink-0 ${activeTab === id ? "text-green-600" : "text-gray-400"}`} />
              <span className="truncate">{def.label}</span>
              {id === "scf" && pendingScf > 0 && (
                <span className="ml-auto bg-orange-100 text-orange-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0">{pendingScf}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100 bg-slate-50 shrink-0 space-y-3">
        <div onClick={onLogout} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer transition-colors text-sm font-bold shadow-sm select-none">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Đăng xuất
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" style={{ animation: "ping 1.2s ease-in-out infinite" }}></div>
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
export { LandmarkIcon, LayoutDashboardIcon, UsersIcon, FileTextIcon };
