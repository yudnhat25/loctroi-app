import { LT_SUBROLES } from "../lib/staff";
import { TAB_DEF } from "./Sidebar";

// Solid accent classes per role/subrole. Replaces gradient soup.
const accentByRole = (user) => {
  if (user?.role === "bank") return "bg-amber-700";
  if (user?.role === "farmer") return "bg-brand-700";
  if (user?.role === "loctroi") {
    switch (user.subrole) {
      case "droneOperator": return "bg-sky-700";
      case "driver":        return "bg-amber-700";
      case "procurement":   return "bg-rose-700";
      default:              return "bg-brand-700"; // manager + fieldOfficer
    }
  }
  return "bg-slate-700";
};

const Header = ({ activeTab, user, setIsSidebarOpen }) => {
  const tabLabel = TAB_DEF[activeTab]?.label ?? activeTab;
  const sr = user?.role === "loctroi" ? LT_SUBROLES[user.subrole] : null;
  const initial = (user?.profile?.hoTen ?? "?").trim().charAt(0).toUpperCase();
  const accent = accentByRole(user);
  const eyebrow = user?.role === "loctroi"
    ? "Lộc Trời"
    : user?.role === "bank"
      ? "Liên minh Ngân hàng"
      : "Hộ Nông dân";
  const role = user?.role === "loctroi" ? sr?.label
    : user?.role === "bank" ? "SCF Underwriter"
    : user?.profile?.htx ?? user?.profile?.diaChi ?? "";

  const showLive = activeTab === "managerHome" || activeTab === "overview";

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-surface-200 flex items-center justify-between px-3 sm:px-4 lg:px-6 xl:px-8 shrink-0 z-10 gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          aria-label="Mở menu"
          className="lg:hidden text-slate-500 hover:text-slate-900 p-1.5 -ml-1.5 rounded-lg active:bg-slate-100 shrink-0"
          onClick={() => setIsSidebarOpen(true)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div className="leading-none min-w-0 flex-1">
          <div className="text-[10px] sm:text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-400 truncate">{eyebrow}</div>
          <h2 className="text-[15px] sm:text-[19px] xl:text-[21px] font-display font-semibold tracking-tight text-slate-900 mt-0.5 sm:mt-1 truncate">{tabLabel}</h2>
        </div>
        {showLive && (
          <span className="hidden sm:inline-flex items-center gap-1.5 bg-brand-50 text-brand-800 text-[12px] px-2 py-1 rounded-md font-semibold border border-brand-100 shrink-0">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full bg-brand-500/40 ping"></span>
              <span className="relative w-1.5 h-1.5 rounded-full bg-brand-600"></span>
            </span>
            Live
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <div className="hidden xl:flex items-center gap-2 text-[12px] font-medium text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="font-mono">smartContract</span>
          <span className="text-slate-700">active</span>
        </div>
        {user && (
          <div className="flex items-center gap-2 sm:gap-3 sm:pl-4 sm:border-l sm:border-surface-200">
            <div className="text-right hidden md:block leading-tight">
              <div className="text-[14px] font-semibold text-slate-900 truncate max-w-[160px]">{user.profile?.hoTen ?? "—"}</div>
              <div className="text-[12px] text-slate-500 truncate max-w-[160px]">{role}</div>
            </div>
            <div className={`h-8 w-8 sm:h-9 sm:w-9 ${accent} text-white rounded-full flex items-center justify-center font-display font-semibold text-[14px] sm:text-[15px] ring-2 ring-white shadow-[0_2px_8px_-4px_rgba(15,23,42,0.4)] shrink-0`}>
              {initial}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
