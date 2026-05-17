import { LT_SUBROLES } from "../lib/staff";
import {
  Landmark as LandmarkIcon,
  LayoutDashboard as LayoutDashboardIcon,
  Users as UsersIcon,
  FileText as FileTextIcon,
  Smartphone as SmartphoneIcon,
  Wind as DroneIcon,
  Truck as TruckIcon,
  Wheat as HarvestIcon,
  UserPlus as UserPlusIcon,
  ClipboardCheck as ClipboardIcon
} from "lucide-react";

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

const Sidebar = ({ activeTab, setActiveTab, blockchainLog, invoices, role, subrole, profile, onLogout, isSidebarOpen, setIsSidebarOpen }) => {
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
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside
        aria-label="Điều hướng chính"
        className={`fixed inset-y-0 left-0 lg:static w-[84vw] max-w-[280px] lg:w-60 xl:w-64 bg-white lg:bg-white/80 lg:backdrop-blur-xl border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.08)] lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col z-40 shrink-0 h-full transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand mark */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-surface-200">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-8 overflow-hidden shrink-0">
              <img src="/loctroi-logo.png" alt="Lộc Trời" className="w-full block" />
            </div>
            <div className="leading-none">
              <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-brand-700">Lộc Trời</div>
              <div className="text-[16px] font-display font-bold tracking-tight text-slate-900 mt-1">AgriChain</div>
            </div>
          </div>
          <button aria-label="Đóng menu" className="lg:hidden text-slate-400 hover:text-slate-600 p-1.5 -mr-1.5 rounded-lg active:bg-slate-100" onClick={() => setIsSidebarOpen(false)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
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
              className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-[14px] font-medium ${
                isActive
                  ? "bg-emerald-50 text-emerald-800 font-bold shadow-sm"
                  : "text-slate-600 hover:bg-slate-50/80 hover:text-slate-900 hover:translate-x-1"
              }`}
            >
              <Ico className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isActive ? "text-emerald-700 scale-110" : "text-slate-400 group-hover:text-emerald-600"}`} />
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
    </>
  );
};

export default Sidebar;
export { LandmarkIcon, LayoutDashboardIcon, UsersIcon, FileTextIcon };
