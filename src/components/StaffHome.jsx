import { LT_SUBROLES } from "../lib/staff";

// Mapping subrole → bộ token màu (accent solid + soft bg + ink) cho UI tinh giản.
// Quản lý & 3 Cùng dùng brand emerald (chính của Lộc Trời); 3 sub-role còn lại
// dùng accent riêng để phân biệt nghiệp vụ thực địa.
const ROLE_TOKENS = {
  manager:        { accent: "bg-brand-700",  soft: "bg-brand-50",  ink: "text-brand-800",  ring: "ring-brand-200" },
  fieldOfficer:   { accent: "bg-emerald-700",soft: "bg-emerald-50",ink: "text-emerald-800",ring: "ring-emerald-200" },
  driver:         { accent: "bg-amber-700",  soft: "bg-amber-50",  ink: "text-amber-800",  ring: "ring-amber-200" },
};

// Trang chủ cá nhân — mỗi sub-role có KPI khác nhau, tính từ blockchainLog & state.
const StaffHome = ({ staff, farmers, transactions, invoices, supplyRequests, droneReports, deliveryQueue, blockchainLog, formatVND, insurancePool = 0, buyerInvoices = [], harvestLots = [] }) => {
  const sr = LT_SUBROLES[staff.subrole];
  const tok = ROLE_TOKENS[staff.subrole] ?? ROLE_TOKENS.manager;

  // Tính KPI cho từng sub-role
  const kpi = computeKpi(staff, blockchainLog, droneReports, transactions, invoices, buyerInvoices, harvestLots);

  // SCF Portfolio breakdown — chỉ hiển thị cho Giám đốc Vùng
  const scfPortfolio = staff.subrole === "manager" ? computeScfPortfolio(invoices, buyerInvoices) : null;

  return (
    <div className="space-y-6 sm:space-y-8 fade-in pb-10">
      {/* Hero — slate-900 sober, accent line trên đỉnh giúp phân biệt sub-role */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 text-white">
        <div className={`absolute inset-x-0 top-0 h-[3px] ${tok.accent}`} />
        <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-5 sm:pb-6">
          <div className="flex items-start gap-4 sm:gap-5 flex-wrap">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${tok.accent} text-white flex items-center justify-center text-xl sm:text-2xl shrink-0`}>
              <span className="drop-shadow-sm">{sr.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {sr.label}
              </div>
              <h2 className="text-[22px] sm:text-[28px] lg:text-[32px] font-display font-semibold tracking-tight leading-tight mt-1 text-white break-words">
                {staff.hoTen}
              </h2>
              <p className="text-[13px] sm:text-[14px] text-slate-300 mt-1.5">{staff.chucDanh}</p>
              <div className="flex items-center gap-2 sm:gap-3 mt-3 flex-wrap text-[11px] sm:text-[12px]">
                <span className="font-mono text-slate-400 bg-white/5 px-2 py-1 rounded-md ring-1 ring-white/10">{staff.id}</span>
                <span className="text-slate-400 hidden sm:inline">·</span>
                <span className="text-slate-400">{staff.khuVuc}</span>
                <span className="text-slate-400 hidden sm:inline">·</span>
                <span className="text-slate-400 hidden sm:inline">Vào làm {new Date(staff.ngayVaoLam).toLocaleDateString("vi-VN")}</span>
              </div>
            </div>
          </div>

          {/* KPI strip: 1px white divider grid, không nested cards */}
          <div className="mt-5 sm:mt-7 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-xl overflow-hidden">
            {kpi.cards.map((c, i) => (
              <div key={i} className="bg-slate-900 px-3 sm:px-4 py-3 sm:py-4">
                <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{c.label}</div>
                <div className="font-display text-[22px] sm:text-[28px] lg:text-[30px] font-semibold tabular leading-none mt-2 sm:mt-2.5 text-white break-words">{c.value}</div>
                {c.sub && <div className="text-[11px] sm:text-[12px] text-slate-500 mt-1 sm:mt-1.5">{c.sub}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCF Portfolio breakdown — chỉ Giám đốc Vùng */}
      {scfPortfolio && (
        <section className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-200 flex items-baseline justify-between">
            <div>
              <h3 className="text-[16px] sm:text-[17px] font-display font-semibold text-slate-900 tracking-tight">Cấu trúc SCF Portfolio (V3)</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">Buyer-SCF (factoring khoản phải thu từ buyer xuất khẩu) là cơ chế chính · AR nội bộ hộ nông dân giữ vai trò phụ.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-surface-200">
            <PortfolioCard
              label="⚡ Buyer-SCF chờ bank"
              count={scfPortfolio.buyerPendingCount}
              amount={formatVND(scfPortfolio.buyerPendingAmount)}
              sub="token buyer · low risk"
              accent="text-indigo-700"
            />
            <PortfolioCard
              label="💰 Buyer-SCF đã giải ngân"
              count={scfPortfolio.buyerDisbursedCount}
              amount={formatVND(scfPortfolio.buyerDisbursedAmount)}
              sub="LT đã có tiền trả nông dân"
              accent="text-brand-700"
            />
            <PortfolioCard
              label="🔀 AR nội bộ active"
              count={scfPortfolio.farmerActiveCount}
              amount={formatVND(scfPortfolio.farmerActiveAmount)}
              sub="legacy · vật tư đầu vụ"
              accent="text-amber-700"
            />
            <PortfolioCard
              label="🛡 Insurance Pool"
              count={null}
              amount={formatVND(insurancePool)}
              sub="5% face mỗi HĐ · đệm vỡ nợ"
              accent="text-sky-700"
            />
          </div>
        </section>
      )}

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

// Mini card cho SCF Portfolio breakdown
const PortfolioCard = ({ label, count, amount, sub, accent }) => (
  <div className="bg-white px-4 py-3.5">
    <div className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</div>
    <div className={`font-display text-[18px] sm:text-[22px] font-semibold tabular leading-none mt-2 ${accent}`}>
      {amount}
    </div>
    {count !== null && (
      <div className="text-[12px] text-slate-600 mt-1.5 font-semibold tabular">{count} hóa đơn</div>
    )}
    <div className="text-[11px] text-slate-400 mt-0.5 italic">{sub}</div>
  </div>
);

// V3: gộp Buyer-SCF (cơ chế chính) + AR nội bộ hộ (legacy)
const computeScfPortfolio = (invoices, buyerInvoices = []) => {
  const farmerActive = invoices.filter(i => !["Đã tất toán", "Nợ xấu", "Từ chối duyệt vay"].includes(i.trangThai));
  const buyerPending = buyerInvoices.filter(i => i.trangThai === "Đã token hóa" || i.trangThai === "Chào bán ngân hàng");
  const buyerDisbursed = buyerInvoices.filter(i => i.trangThai === "Đã giải ngân" || i.trangThai === "Buyer đã thanh toán");
  const sumF = arr => arr.reduce((s, i) => s + (i.amount || 0), 0);
  const sumBFace = arr => arr.reduce((s, i) => s + (i.faceValue || 0), 0);
  const sumBDisbursed = arr => arr.reduce((s, i) => s + (i.bankDiscount?.disbursedAmount || 0), 0);
  return {
    farmerActiveCount: farmerActive.length,
    farmerActiveAmount: sumF(farmerActive),
    buyerPendingCount: buyerPending.length,
    buyerPendingAmount: sumBFace(buyerPending),
    buyerDisbursedCount: buyerDisbursed.length,
    buyerDisbursedAmount: sumBDisbursed(buyerDisbursed),
  };
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

function computeKpi(staff, blockchainLog, droneReports, transactions, invoices, buyerInvoices = [], harvestLots = []) {
  const myLogs = blockchainLog.filter(l => l.data?.includes(staff.id) || l.data?.includes(staff.hoTen));

  switch (staff.subrole) {
    case "manager": {
      const approved = blockchainLog.filter(l => l.action === "SUPPLY_APPROVED").length;
      const harvestSettled = blockchainLog.filter(l => l.action === "HARVEST_SETTLED").length;
      const buyerTokenized = buyerInvoices.length;
      const lotsAvail = harvestLots.filter(l => !l.buyerInvoiceId).length;
      const buyerDisbursed = buyerInvoices
        .filter(i => i.trangThai === "Đã giải ngân" || i.trangThai === "Buyer đã thanh toán")
        .reduce((s, i) => s + (i.bankDiscount?.disbursedAmount ?? 0), 0);
      return {
        cards: [
          { label: "Đơn vật tư đã duyệt", value: approved },
          { label: "Phiên thu hoạch tất toán", value: harvestSettled },
          { label: "HĐ Buyer đã token hóa", value: buyerTokenized, sub: `${lotsAvail} lô chờ gom` },
          { label: "Tiền bank giải ngân", value: buyerDisbursed > 0 ? `${(buyerDisbursed/1e9).toFixed(2)}T` : "0", sub: "VNĐ qua Buyer-SCF" },
        ],
        shortcuts: [
          { icon: "📊", title: "Tổng quan mạng lưới", desc: "Theo dõi KPI toàn vùng và phân bố Tier của các hộ liên kết." },
          { icon: "✅", title: "Duyệt đơn vật tư", desc: "Smart contract đối chiếu Tier tự động, bạn xác nhận hoặc từ chối." },
          { icon: "🌾", title: "Điều phối thu mua", desc: "Mở phiên cân lúa cho hộ đủ điều kiện, tự tính premium SRP, trừ nợ vật tư." },
          { icon: "🚢", title: "Ký HĐ buyer & token hóa", desc: "Gom lô lúa thành HĐ xuất khẩu, token hóa khoản phải thu, bank giải ngân T+1." },
        ],
        myLogs,
      };
    }
    case "fieldOfficer": {
      // GỘP: 3 Cùng + Drone Operator — 1 chuyến xuống đồng làm cả 2 việc
      const onboarded = blockchainLog.filter(l => l.action === "PASSPORT_CREATED" && l.data.includes(staff.id)).length;
      const inspected = blockchainLog.filter(l => l.action === "FIELD_INSPECTION" && l.data.includes(staff.id)).length;
      const flights   = droneReports.filter(r => r.operatorId === staff.id).length;
      const totalArea = droneReports.filter(r => r.operatorId === staff.id).reduce((s, r) => s + (r.farmerArea || 0), 0);
      const insps = blockchainLog.filter(l => l.action === "FIELD_INSPECTION" && l.data.includes(staff.id));
      const avgScore = insps.length === 0 ? 0 : Math.round(insps.reduce((s, l) => {
        const m = /Farming Score (\d+)/.exec(l.data);
        return s + (m ? parseInt(m[1]) : 0);
      }, 0) / insps.length);
      return {
        cards: [
          { label: "Hộ đã onboard", value: onboarded, sub: "Tạo Hộ chiếu Số" },
          { label: "Lần kiểm tra SRP", value: inspected, sub: "Đã ký số" },
          { label: "Lần bay drone", value: flights, sub: `${totalArea.toFixed(1)} ha đã quét` },
          { label: "Farming Score TB", value: avgScore, sub: "trên thang 600" },
        ],
        shortcuts: [
          { icon: "🪪", title: "Onboard hộ mới", desc: "Đến HTX, đăng ký Hộ chiếu Số. Tạo Digital ID và Genesis Record." },
          { icon: "🚁", title: "Bay drone & AI scan", desc: "Bay drone đa phổ → AI Gemini chấm NDVI/phủ xanh/sâu bệnh." },
          { icon: "✅", title: "Tick checklist SRP", desc: "Sau khi drone bay, xuống đồng tick 41 tiêu chí rồi ký số." },
          { icon: "📈", title: "Re-tier real-time", desc: "Farming Score đổi → Tier leo/tụt ngay → ảnh hưởng premium vụ tới." },
        ],
        myLogs,
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
    default:
      return { cards: [], shortcuts: [], myLogs };
  }
}

export default StaffHome;
