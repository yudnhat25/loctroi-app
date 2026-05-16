import { LT_SUBROLES } from "../lib/staff";

// Mapping subrole → bộ token màu (accent solid + soft bg + ink) cho UI tinh giản.
// Quản lý & 3 Cùng dùng brand emerald (chính của Lộc Trời); 3 sub-role còn lại
// dùng accent riêng để phân biệt nghiệp vụ thực địa.
const ROLE_TOKENS = {
  manager:        { accent: "bg-brand-700",  soft: "bg-brand-50",  ink: "text-brand-800",  ring: "ring-brand-200" },
  fieldOfficer:   { accent: "bg-brand-700",  soft: "bg-brand-50",  ink: "text-brand-800",  ring: "ring-brand-200" },
  droneOperator:  { accent: "bg-sky-700",    soft: "bg-sky-50",    ink: "text-sky-800",    ring: "ring-sky-200" },
  driver:         { accent: "bg-amber-700",  soft: "bg-amber-50",  ink: "text-amber-800",  ring: "ring-amber-200" },
  procurement:    { accent: "bg-rose-700",   soft: "bg-rose-50",   ink: "text-rose-800",   ring: "ring-rose-200" },
};

// Trang chủ cá nhân — mỗi sub-role có KPI khác nhau, tính từ blockchainLog & state.
const StaffHome = ({ staff, farmers, transactions, invoices, supplyRequests, droneReports, deliveryQueue, blockchainLog, formatVND }) => {
  const sr = LT_SUBROLES[staff.subrole];
  const tok = ROLE_TOKENS[staff.subrole] ?? ROLE_TOKENS.manager;

  // Tính KPI cho từng sub-role
  const kpi = computeKpi(staff, blockchainLog, droneReports, transactions, invoices);

  return (
    <div className="space-y-8 fade-in pb-10">
      {/* Hero — slate-900 sober, accent line trên đỉnh giúp phân biệt sub-role */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 text-white">
        <div className={`absolute inset-x-0 top-0 h-[3px] ${tok.accent}`} />
        <div className="px-7 pt-7 pb-6">
          <div className="flex items-start gap-5 flex-wrap">
            <div className={`w-14 h-14 rounded-xl ${tok.accent} text-white flex items-center justify-center text-2xl shrink-0`}>
              <span className="drop-shadow-sm">{sr.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {sr.label}
              </div>
              <h2 className="text-[32px] font-display font-semibold tracking-tight leading-tight mt-1 text-white">
                {staff.hoTen}
              </h2>
              <p className="text-[14px] text-slate-300 mt-1.5">{staff.chucDanh}</p>
              <div className="flex items-center gap-3 mt-3 flex-wrap text-[12px]">
                <span className="font-mono text-slate-400 bg-white/5 px-2 py-1 rounded-md ring-1 ring-white/10">{staff.id}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-400">{staff.khuVuc}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-400">Vào làm {new Date(staff.ngayVaoLam).toLocaleDateString("vi-VN")}</span>
              </div>
            </div>
          </div>

          {/* KPI strip: 1px white divider grid, không nested cards */}
          <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-xl overflow-hidden">
            {kpi.cards.map((c, i) => (
              <div key={i} className="bg-slate-900 px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{c.label}</div>
                <div className="font-display text-[30px] font-semibold tabular leading-none mt-2.5 text-white">{c.value}</div>
                {c.sub && <div className="text-[12px] text-slate-500 mt-1.5">{c.sub}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick actions — list, không phải grid card đồng phục */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight">Tác nghiệp nhanh</h3>
          <span className="text-[12px] text-slate-500">Pinned cho vai trò {sr.label}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {kpi.shortcuts.map((s, i) => (
            <div key={i} className="group bg-white rounded-xl border border-surface-200 hover:border-surface-300 transition-colors p-4">
              <div className="flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-lg ${tok.soft} ${tok.ink} flex items-center justify-center text-base shrink-0 ring-1 ${tok.ring}`}>
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-slate-900">{s.title}</div>
                  <p className="text-[14px] text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent activity — timeline-style cho rõ trình tự */}
      <section className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-200 flex items-center justify-between">
          <h3 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight">Hoạt động trên blockchain</h3>
          <span className="text-[12px] font-mono text-slate-400">{kpi.myLogs.length} blocks</span>
        </div>
        {kpi.myLogs.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-surface-100 flex items-center justify-center text-slate-400 mb-3">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            </div>
            <p className="text-[14px] text-slate-500">Chưa có thao tác nào.</p>
            <p className="text-[12px] text-slate-400 mt-1">Bắt đầu ở các tab nghiệp vụ bên trái.</p>
          </div>
        ) : (
          <ul className="divide-y divide-surface-200">
            {kpi.myLogs.slice(0, 8).map((log, i) => (
              <li key={i} className="px-5 py-3.5 flex items-start gap-4 hover:bg-surface-50/60 transition-colors">
                <span className={`mt-0.5 text-[11px] font-semibold tabular tracking-tight px-2 py-1 rounded-md whitespace-nowrap ${actionBg(log.action)}`}>
                  {log.action}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-slate-700 leading-snug">{log.data}</p>
                  <p className="text-[12px] text-slate-400 mt-1.5 font-mono">
                    #{log.hash} · {new Date(log.timestamp).toLocaleString("vi-VN")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

// Mapping action → màu badge. Giữ palette hẹp.
const actionBg = (action) => {
  if (action.includes("PASSPORT"))                       return "bg-brand-50 text-brand-800 ring-1 ring-brand-100";
  if (action.includes("DELIVERY") || action.includes("SUPPLY")) return "bg-amber-50 text-amber-800 ring-1 ring-amber-100";
  if (action.includes("DRONE"))                          return "bg-sky-50 text-sky-800 ring-1 ring-sky-100";
  if (action.includes("INSPECTION"))                     return "bg-brand-50 text-brand-800 ring-1 ring-brand-100";
  if (action.includes("HARVEST"))                        return "bg-rose-50 text-rose-800 ring-1 ring-rose-100";
  if (action.includes("LOAN"))                           return "bg-amber-50 text-amber-800 ring-1 ring-amber-100";
  return "bg-surface-100 text-slate-700 ring-1 ring-surface-200";
};

function computeKpi(staff, blockchainLog, droneReports, transactions, invoices) {
  const myLogs = blockchainLog.filter(l => l.data?.includes(staff.id) || l.data?.includes(staff.hoTen));

  switch (staff.subrole) {
    case "manager": {
      const approved = blockchainLog.filter(l => l.action === "SUPPLY_APPROVED").length;
      const issued   = blockchainLog.filter(l => l.action === "SUPPLY_ISSUED").length;
      const settled  = blockchainLog.filter(l => l.action === "LOAN_REPAID_ON_TIME").length;
      const totalRev = invoices.reduce((s, i) => s + (i.amount || 0), 0);
      return {
        cards: [
          { label: "Đơn vật tư đã duyệt", value: approved },
          { label: "Lô vật tư đã giao", value: issued },
          { label: "Hợp đồng tất toán", value: settled },
          { label: "Tổng AR đang quản lý", value: (totalRev/1e6).toFixed(0) + "M" },
        ],
        shortcuts: [
          { icon: "📊", title: "Tổng quan mạng lưới", desc: "Theo dõi KPI toàn vùng và phân bố Tier của các hộ liên kết." },
          { icon: "✅", title: "Duyệt đơn vật tư", desc: "Smart contract đối chiếu Tier tự động, bạn xác nhận hoặc từ chối." },
          { icon: "📄", title: "Khoản phải thu (AR)", desc: "Token hóa hóa đơn rồi chào bán cho liên minh ngân hàng SCF." },
          { icon: "🌊", title: "Bảo lãnh recourse", desc: "Khi nông dân default vì thiên tai, kích hoạt bảo hiểm và recourse." },
        ],
        myLogs,
      };
    }
    case "fieldOfficer": {
      const onboarded = blockchainLog.filter(l => l.action === "PASSPORT_CREATED" && l.data.includes(staff.id)).length;
      const inspected = blockchainLog.filter(l => l.action === "FIELD_INSPECTION" && l.data.includes(staff.id)).length;
      const insps = blockchainLog.filter(l => l.action === "FIELD_INSPECTION" && l.data.includes(staff.id));
      const avgScore = insps.length === 0 ? 0 : Math.round(insps.reduce((s, l) => {
        const m = /Farming Score (\d+)/.exec(l.data);
        return s + (m ? parseInt(m[1]) : 0);
      }, 0) / insps.length);
      return {
        cards: [
          { label: "Hộ đã onboard", value: onboarded, sub: "Tạo Hộ chiếu Số" },
          { label: "Lần kiểm tra SRP", value: inspected, sub: "Đã ký số" },
          { label: "Farming Score TB", value: avgScore, sub: "trên thang 600" },
          { label: "Khu vực phụ trách", value: staff.khuVuc.split("—")[0].trim() },
        ],
        shortcuts: [
          { icon: "🪪", title: "Onboard hộ mới", desc: "Đến HTX, đăng ký Hộ chiếu Số. Tạo Digital ID và Genesis Record." },
          { icon: "✅", title: "Tick checklist SRP", desc: "Sau khi drone bay, xuống đồng tick 41 tiêu chí rồi ký số." },
        ],
        myLogs,
      };
    }
    case "droneOperator": {
      const flights = droneReports.filter(r => r.operatorId === staff.id).length;
      const totalArea = droneReports.filter(r => r.operatorId === staff.id).reduce((s, r) => s + (r.farmerArea || 0), 0);
      const avgGreen = flights === 0 ? 0 : Math.round(droneReports.filter(r => r.operatorId === staff.id).reduce((s, r) => s + r.greenPct, 0) / flights);
      return {
        cards: [
          { label: "Lần bay drone", value: flights },
          { label: "Diện tích đã quét", value: `${totalArea.toFixed(1)} ha` },
          { label: "Phủ xanh TB", value: `${avgGreen}%`, sub: "AI Computer Vision" },
          { label: "Drone hoạt động", value: "DJI T40", sub: "Đa phổ và RGB" },
        ],
        shortcuts: [
          { icon: "🚁", title: "Bay drone và upload ảnh", desc: "Ảnh đa phổ được AI đếm pixel xanh, ghi DRONE_REPORT lên chain." },
          { icon: "📡", title: "NDVI và vùng úng/khô", desc: "Báo cáo tự sinh, 3 Cùng nhận thông báo xuống đồng kiểm tra." },
        ],
        myLogs: blockchainLog.filter(l => l.action === "DRONE_REPORT" && l.data.includes(staff.id)),
      };
    }
    case "driver": {
      const delivered = blockchainLog.filter(l => l.action === "DELIVERY_CONFIRMED" && l.data.includes(staff.id)).length;
      const tonnage = transactions.filter(t => t.driverId === staff.id).reduce((s, t) => s + (t.soLuong || 0), 0);
      return {
        cards: [
          { label: "Đơn đã giao", value: delivered },
          { label: "Tổng khối lượng", value: tonnage, sub: "đơn vị vật tư" },
          { label: "Đơn vị xe", value: staff.khuVuc },
          { label: "Bonus Credit/đơn", value: "+10" },
        ],
        shortcuts: [
          { icon: "📷", title: "Quét QR Hộ chiếu Số", desc: "Quét QR rồi app hiện danh sách vật tư cần giao cho đúng hộ." },
          { icon: "✍️", title: "Ký số 2 bên", desc: "Cả nông dân và bạn cùng ký, smart contract confirmDelivery chạy." },
        ],
        myLogs,
      };
    }
    case "procurement": {
      const settled = blockchainLog.filter(l => l.action === "HARVEST_SETTLED" && l.data.includes(staff.id)).length;
      const totalKg = blockchainLog.filter(l => l.action === "HARVEST_SETTLED" && l.data.includes(staff.id)).reduce((s, l) => {
        const m = /(\d+(?:\.\d+)?) tấn/.exec(l.data);
        return s + (m ? parseFloat(m[1]) * 1000 : 0);
      }, 0);
      return {
        cards: [
          { label: "Hợp đồng tất toán", value: settled },
          { label: "Tổng lúa thu mua", value: `${(totalKg/1000).toFixed(1)}t` },
          { label: "Trạm thu mua", value: staff.khuVuc.split("—")[0].trim() },
          { label: "Premium SRP đã chi", value: "Auto" },
        ],
        shortcuts: [
          { icon: "🌾", title: "Cân lúa và tất toán", desc: "Cân điện tử, tính bao tiêu cộng Premium, trừ công nợ, chuyển khoản." },
          { icon: "📈", title: "Cập nhật Credit Score", desc: "Smart contract +300 Credit khi nông dân giao đủ và trả nợ đúng hạn." },
        ],
        myLogs,
      };
    }
    default:
      return { cards: [], shortcuts: [], myLogs };
  }
}

export default StaffHome;
