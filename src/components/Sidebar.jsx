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
  onboarding:      { label: "Onboard nông dân",         icon: UserPlusIcon },
  inspection:      { label: "Kiểm tra SRP",             icon: ClipboardIcon },
  droneHome:       { label: "Trang chủ Drone",          icon: LayoutDashboardIcon },
  droneUpload:     { label: "Bay drone & AI scan",      icon: DroneIcon },
  driverHome:      { label: "Trang chủ Tài xế",         icon: LayoutDashboardIcon },
  delivery:        { label: "Giao vật tư",              icon: TruckIcon },
  procurementHome: { label: "Trang chủ Thu mua",        icon: LayoutDashboardIcon },
  harvest:         { label: "Thu hoạch & Tất toán",     icon: HarvestIcon },
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

  // Initial cho avatar - tránh ký tự rỗng
  const initial = (profile?.hoTen ?? "?").trim().charAt(0).toUpperCase();

  return (
    <aside className="w-60 xl:w-64 bg-white border-r border-surface-200 flex flex-col z-20 shrink-0 h-full">
      {/* Brand mark */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-surface-200">
        <div className="w-8 h-8 rounded-lg bg-brand-700 text-white flex items-center justify-center font-display font-bold text-[17px] tracking-tight">LT</div>
        <div className="leading-none">
          <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-brand-700">Lộc Trời</div>
          <div className="text-[16px] font-display font-bold tracking-tight text-slate-900 mt-1">AgriChain</div>
        </div>
      </div>

      {/* Profile block — flat, no gradient */}
      {profile && (
        <div className="px-4 pt-4 pb-3 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white font-display font-bold flex items-center justify-center text-[17px]">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold text-slate-900 truncate">{profile.hoTen}</div>
              <div className="text-[12px] text-slate-500 truncate font-mono mt-0.5">{profile.id}</div>
            </div>
          </div>
          {(profile.chucDanh ?? profile.htx ?? profile.diaChi) && (
            <p className="text-[12px] text-slate-500 mt-2 leading-snug line-clamp-2">
              {profile.chucDanh ?? profile.htx ?? profile.diaChi}
            </p>
          )}
        </div>
      )}

      <nav className="flex-1 px-3 pt-4 pb-2 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2.5">{sectionLabel}</p>
        {availableTabs.map(id => {
          const def = TAB_DEF[id];
          if (!def) return null;
          const Ico = def.icon;
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[14px] font-medium ${
                isActive
                  ? "bg-brand-50 text-brand-800 font-semibold"
                  : "text-slate-600 hover:bg-surface-50 hover:text-slate-900"
              }`}
            >
              <Ico className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-brand-700" : "text-slate-400 group-hover:text-slate-600"}`} />
              <span className="truncate text-left flex-1">{def.label}</span>
              {id === "scf" && pendingScf > 0 && (
                <span className="bg-amber-500 text-white text-[11px] px-1.5 py-0.5 rounded-md font-semibold shrink-0 tabular">{pendingScf}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pt-3 pb-4 border-t border-surface-200 space-y-2">
        {/* Network status — single line, no card-in-card */}
        <div className="px-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex w-2 h-2 shrink-0">
              <span className="absolute inset-0 rounded-full bg-emerald-400/40 ping"></span>
              <span className="relative w-2 h-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-[12px] font-medium text-slate-600">DLT Node</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 truncate">{(blockchainLog[0]?.hash ?? "—").substring(0, 6)}</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition-colors text-[14px] font-medium select-none"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
export { LandmarkIcon, LayoutDashboardIcon, UsersIcon, FileTextIcon };
