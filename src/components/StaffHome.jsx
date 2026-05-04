import { LT_SUBROLES } from "../lib/staff";

// Trang chủ cá nhân — mỗi sub-role có KPI khác nhau, tính từ blockchainLog & state.
const StaffHome = ({ staff, farmers, transactions, invoices, supplyRequests, droneReports, deliveryQueue, blockchainLog, formatVND }) => {
  const sr = LT_SUBROLES[staff.subrole];

  // Tính KPI cho từng sub-role
  const kpi = computeKpi(staff, blockchainLog, droneReports, transactions, invoices);

  return (
    <div className="space-y-6 fade-in pb-10">
      {/* Profile hero */}
      <div className={`bg-gradient-to-r ${sr.color} rounded-2xl p-6 text-white shadow-lg`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
              {sr.icon}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">{sr.label}</div>
              <h2 className="text-2xl font-bold">{staff.hoTen}</h2>
              <p className="text-white/85 text-sm">{staff.chucDanh}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="font-mono text-white/90 text-xs bg-white/15 px-2 py-0.5 rounded">{staff.id}</span>
                <span className="text-white/85 text-xs">📍 {staff.khuVuc}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">Vào làm</div>
            <div className="text-base font-bold">{new Date(staff.ngayVaoLam).toLocaleDateString("vi-VN")}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {kpi.cards.map((c, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-3">
              <div className="text-[10px] text-white/80 font-bold uppercase">{c.label}</div>
              <div className="text-2xl font-bold leading-tight">{c.value}</div>
              {c.sub && <div className="text-[10px] text-white/70">{c.sub}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3">⚡ Tác nghiệp nhanh</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {kpi.shortcuts.map((s, i) => (
            <div key={i} className={`rounded-xl p-3 border-2 ${s.bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{s.icon}</span>
                <span className="text-sm font-bold text-gray-800">{s.title}</span>
              </div>
              <p className="text-xs text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4">📜 Lịch sử thao tác blockchain của tôi</h3>
        {kpi.myLogs.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Chưa có thao tác nào. Bắt đầu ở các tab nghiệp vụ bên trái.</p>
        ) : (
          <div className="space-y-2">
            {kpi.myLogs.slice(0, 8).map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold whitespace-nowrap ${actionBg(log.action)}`}>{log.action}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700">{log.data}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">#{log.hash} · {new Date(log.timestamp).toLocaleString("vi-VN")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const actionBg = (action) => {
  if (action.includes("PASSPORT")) return "bg-emerald-100 text-emerald-700";
  if (action.includes("DELIVERY") || action.includes("SUPPLY")) return "bg-amber-100 text-amber-700";
  if (action.includes("DRONE")) return "bg-sky-100 text-sky-700";
  if (action.includes("INSPECTION")) return "bg-purple-100 text-purple-700";
  if (action.includes("HARVEST")) return "bg-rose-100 text-rose-700";
  if (action.includes("LOAN")) return "bg-orange-100 text-orange-700";
  return "bg-slate-100 text-slate-700";
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
          { icon: "📊", title: "Tổng quan mạng lưới", desc: "Theo dõi KPI toàn vùng + tier distribution của 10+ hộ.", bg: "border-blue-200 bg-blue-50/40" },
          { icon: "✅", title: "Duyệt đơn vật tư", desc: "Smart contract tự đối chiếu Tier — bạn chỉ cần xác nhận hoặc từ chối.", bg: "border-emerald-200 bg-emerald-50/40" },
          { icon: "📄", title: "Khoản phải thu (AR)", desc: "Token hoá hoá đơn → chào bán cho liên minh ngân hàng SCF.", bg: "border-cyan-200 bg-cyan-50/40" },
          { icon: "🌊", title: "Bảo lãnh recourse", desc: "Khi nông dân default vì thiên tai, kích hoạt bảo hiểm + recourse.", bg: "border-rose-200 bg-rose-50/40" },
        ],
        myLogs,
      };
    }
    case "fieldOfficer": {
      const onboarded = blockchainLog.filter(l => l.action === "PASSPORT_CREATED" && l.data.includes(staff.id)).length;
      const inspected = blockchainLog.filter(l => l.action === "FIELD_INSPECTION" && l.data.includes(staff.id)).length;
      // Avg SRP score from inspections
      const insps = blockchainLog.filter(l => l.action === "FIELD_INSPECTION" && l.data.includes(staff.id));
      const avgScore = insps.length === 0 ? 0 : Math.round(insps.reduce((s, l) => {
        const m = /Farming Score (\d+)/.exec(l.data);
        return s + (m ? parseInt(m[1]) : 0);
      }, 0) / insps.length);
      return {
        cards: [
          { label: "Hộ đã onboard (A1)", value: onboarded, sub: "Tạo Hộ chiếu Số" },
          { label: "Lần kiểm tra SRP", value: inspected, sub: "Đã ký số" },
          { label: "Farming Score TB", value: avgScore, sub: "/600" },
          { label: "Khu vực phụ trách", value: staff.khuVuc.split("—")[0].trim() },
        ],
        shortcuts: [
          { icon: "🪪", title: "Onboard hộ mới (A1-A2)", desc: "Đến HTX, đăng ký Hộ chiếu Số → tạo Digital ID + Genesis Record.", bg: "border-emerald-200 bg-emerald-50/40" },
          { icon: "✅", title: "Tick checklist SRP (B4.3)", desc: "Sau khi drone bay, xuống đồng tick 41 tiêu chí + ký số.", bg: "border-purple-200 bg-purple-50/40" },
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
          { label: "Drone hoạt động", value: "DJI T40", sub: "Đa phổ + RGB" },
        ],
        shortcuts: [
          { icon: "🚁", title: "Bay drone & upload ảnh", desc: "Upload ảnh đa phổ → AI tự đếm pixel xanh → ghi DRONE_REPORT.", bg: "border-sky-200 bg-sky-50/40" },
          { icon: "📡", title: "NDVI & vùng úng/khô", desc: "Báo cáo tự sinh → 3 Cùng nhận thông báo xuống đồng.", bg: "border-cyan-200 bg-cyan-50/40" },
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
          { label: "Tổng khối lượng", value: tonnage, sub: "đv vật tư" },
          { label: "Đơn vị xe", value: staff.khuVuc },
          { label: "Bonus Credit/đơn", value: "+10" },
        ],
        shortcuts: [
          { icon: "📷", title: "Quét QR Hộ chiếu Số", desc: "Quét QR → app hiện danh sách vật tư cần giao cho đúng hộ.", bg: "border-amber-200 bg-amber-50/40" },
          { icon: "✍️", title: "Ký số 2 bên", desc: "Cả nông dân và bạn cùng ký → smart contract confirmDelivery() chạy.", bg: "border-orange-200 bg-orange-50/40" },
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
          { icon: "🌾", title: "Cân lúa & tất toán", desc: "Cân điện tử → tính bao tiêu + Premium → trừ công nợ → chuyển khoản.", bg: "border-rose-200 bg-rose-50/40" },
          { icon: "📈", title: "Cập nhật Credit Score", desc: "Smart contract +300 Credit cho nông dân khi giao đủ + trả nợ đúng hạn.", bg: "border-pink-200 bg-pink-50/40" },
        ],
        myLogs,
      };
    }
    default:
      return { cards: [], shortcuts: [], myLogs };
  }
}

export default StaffHome;
