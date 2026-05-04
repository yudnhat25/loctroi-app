import { LT_SUBROLES } from "../lib/staff";
import { TAB_DEF } from "./Sidebar";

const Header = ({ activeTab, user }) => {
  const tabLabel = TAB_DEF[activeTab]?.label ?? activeTab;
  const sr = user?.role === "loctroi" ? LT_SUBROLES[user.subrole] : null;
  const initial = user?.profile?.hoTen?.charAt(0) ?? (user?.role === "bank" ? "🏦" : "?");
  const grad = sr?.color ?? (user?.role === "bank" ? "from-orange-500 to-red-600" : "from-green-500 to-green-700");
  const subtitle = user?.role === "loctroi" ? `Lộc Trời · ${sr?.label ?? ""}`
                : user?.role === "bank" ? "Liên minh Ngân hàng"
                : `Hộ ${user?.profile?.htx ?? user?.profile?.diaChi ?? ""}`;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 xl:px-8 shadow-sm shrink-0 z-10">
      <div className="flex items-center gap-3">
        <h2 className="text-base xl:text-lg font-bold text-gray-800">{tabLabel}</h2>
        {activeTab === "managerHome" || activeTab === "overview" ? (
          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-md font-bold">Real-time</span>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden xl:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" style={{ animation: "ping 1.2s ease-in-out infinite" }}></span>
          Smart Contract: Active
        </div>
        {user && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-gray-800 leading-tight">{user.profile?.hoTen ?? "—"}</div>
              <div className="text-[10px] text-slate-500 leading-tight">{subtitle}</div>
            </div>
            <div className={`h-9 w-9 bg-gradient-to-br ${grad} text-white rounded-full flex items-center justify-center font-bold shadow-md text-sm`}>
              {initial}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
