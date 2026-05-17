import { useMemo, useState } from "react";
import { ShieldCheck, CheckCircle2, XCircle, Clock, MapPin, Phone, IdCard, Sprout, X } from "lucide-react";

// Giám đốc Vùng duyệt đơn đăng ký do nông dân tự gửi từ trang Login.
// Khi duyệt → smart contract createPassport() chạy + cấp Hộ chiếu Số LT-XXX.
// Khi từ chối → giữ đơn trong sổ (status "Từ chối") để nông dân tra cứu được lý do.

const RegistrationsTab = ({ staff, farmerApplications, onApprove, onReject }) => {
  const [filter, setFilter] = useState("pending");
  const [rejecting, setRejecting] = useState(null); // app being rejected
  const [rejectReason, setRejectReason] = useState("");

  const sorted = useMemo(
    () => [...farmerApplications].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [farmerApplications]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return sorted;
    if (filter === "pending") return sorted.filter(a => a.status === "Chờ duyệt");
    if (filter === "approved") return sorted.filter(a => a.status === "Đã duyệt");
    return sorted.filter(a => a.status === "Từ chối");
  }, [sorted, filter]);

  const counts = {
    pending:  sorted.filter(a => a.status === "Chờ duyệt").length,
    approved: sorted.filter(a => a.status === "Đã duyệt").length,
    rejected: sorted.filter(a => a.status === "Từ chối").length,
  };

  const handleApprove = (app) => {
    if (!confirm(`Xác nhận DUYỆT đơn của ${app.hoTen}?\nSau khi duyệt, nông dân sẽ được cấp Hộ chiếu Số và có thể đăng nhập.`)) return;
    onApprove(app, staff);
  };

  const handleRejectSubmit = () => {
    if (!rejecting) return;
    onReject(rejecting, staff, rejectReason.trim());
    setRejecting(null);
    setRejectReason("");
  };

  return (
    <div className="space-y-6 sm:space-y-8 fade-in pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 text-white">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-rose-500" />
        <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-5 sm:pb-6">
          <div className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-rose-400" /> Giám đốc Vùng
          </div>
          <h2 className="text-[22px] sm:text-[28px] font-display font-semibold tracking-tight mt-1.5 leading-tight">Duyệt đơn đăng ký nông dân</h2>
          <p className="text-[13px] sm:text-[14px] text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Nông dân tự gửi đơn từ trang đăng nhập. Sau khi bạn duyệt, smart contract{" "}
            <code className="font-mono text-rose-300">createPassport()</code> chạy tự động: cấp Hộ chiếu Số LT-XXX, ghi Genesis Record lên blockchain. Nông dân có thể dùng mã đó để đăng nhập.
          </p>
          <div className="mt-5 sm:mt-6 grid grid-cols-3 gap-px bg-white/10 rounded-xl overflow-hidden">
            <Stat label="Chờ duyệt" value={counts.pending}  accent="text-rose-300" />
            <Stat label="Đã duyệt"  value={counts.approved} accent="text-emerald-300" />
            <Stat label="Từ chối"   value={counts.rejected} accent="text-slate-300" />
          </div>
        </div>
      </section>

      {/* Filter tabs */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto -mx-1 px-1">
        {[
          { id: "pending",  label: "Chờ duyệt",  count: counts.pending,  active: "bg-rose-600 text-white",     dot: "bg-rose-500" },
          { id: "approved", label: "Đã duyệt",   count: counts.approved, active: "bg-emerald-700 text-white",  dot: "bg-emerald-500" },
          { id: "rejected", label: "Từ chối",    count: counts.rejected, active: "bg-slate-700 text-white",    dot: "bg-slate-400" },
          { id: "all",      label: "Tất cả",     count: sorted.length,   active: "bg-slate-900 text-white",    dot: "bg-slate-500" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
              filter === t.id ? t.active : "bg-white text-slate-600 border border-surface-200 hover:bg-surface-50"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${filter === t.id ? "bg-white/80" : t.dot}`} />
            {t.label}
            <span className={`tabular text-[11px] px-1.5 py-0.5 rounded ${filter === t.id ? "bg-white/20" : "bg-surface-100 text-slate-500"}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-surface-200 p-10 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-surface-100 flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-[14px] text-slate-500">
            {filter === "pending" ? "Chưa có đơn nào chờ duyệt." : "Không có đơn nào trong mục này."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(app => (
            <AppCard
              key={app.id}
              app={app}
              onApprove={() => handleApprove(app)}
              onReject={() => { setRejecting(app); setRejectReason(""); }}
            />
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejecting && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 fade-in" onClick={() => setRejecting(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-surface-200 flex items-center justify-between">
              <h3 className="text-[16px] font-display font-semibold text-slate-900 tracking-tight">Từ chối đơn đăng ký</h3>
              <button onClick={() => setRejecting(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-[13px] text-slate-600">
                Đơn của <b className="text-slate-900">{rejecting.hoTen}</b> · {rejecting.sdt} · {rejecting.htx}
              </p>
              <label className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Lý do từ chối</label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                placeholder="VD: Diện tích không khớp với HTX đã đăng ký, hoặc SĐT không liên lạc được."
                className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              />
              <p className="text-[11px] text-slate-400">Lý do sẽ được nông dân thấy khi tra cứu đơn.</p>
            </div>
            <div className="px-5 py-3 border-t border-surface-200 flex gap-2 justify-end">
              <button onClick={() => setRejecting(null)} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-slate-600 hover:bg-surface-100">Hủy</button>
              <button onClick={handleRejectSubmit} className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-rose-600 text-white hover:bg-rose-700">Xác nhận từ chối</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AppCard = ({ app, onApprove, onReject }) => {
  const pending  = app.status === "Chờ duyệt";
  const approved = app.status === "Đã duyệt";
  const rejected = app.status === "Từ chối";

  const statusStyle = pending
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : approved
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <article className="bg-white rounded-2xl border border-surface-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3 border-b border-surface-200">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${statusStyle}`}>{app.status.toUpperCase()}</span>
            <span className="text-[11px] font-mono text-slate-400">{app.id}</span>
          </div>
          <h3 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight truncate">{app.hoTen}</h3>
          <p className="text-[12px] text-slate-500 mt-0.5">Gửi lúc: {new Date(app.submittedAt).toLocaleString("vi-VN")}</p>
        </div>
        {approved && app.assignedFarmerId && (
          <div className="text-right shrink-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-600">Đã cấp</div>
            <div className="font-mono font-bold text-emerald-800 text-[15px] mt-0.5">{app.assignedFarmerId}</div>
          </div>
        )}
      </div>

      <div className="px-5 py-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
        <InfoRow icon={IdCard} label="CCCD/CMND" value={`••• ${app.cccd.slice(-4)}`} mono />
        <InfoRow icon={Phone} label="SĐT" value={app.sdt} mono />
        <InfoRow icon={MapPin} label="Địa chỉ" value={app.diaChi} colSpan />
        <InfoRow icon={Sprout} label="HTX" value={app.htx} />
        <InfoRow label="Diện tích" value={`${app.dienTich} ha`} />
        <InfoRow label="Giống lúa" value={app.giong} colSpan />
      </div>

      {rejected && app.rejectReason && (
        <div className="mx-5 mb-4 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-700 mb-0.5">Lý do từ chối</div>
          <p className="text-[13px] text-slate-700">{app.rejectReason}</p>
        </div>
      )}

      {pending && (
        <div className="px-5 py-3 bg-surface-50 border-t border-surface-200 flex gap-2">
          <button
            onClick={onReject}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-rose-200 text-rose-700 font-semibold text-[13px] hover:bg-rose-50 transition-colors"
          >
            <XCircle className="w-4 h-4" /> Từ chối
          </button>
          <button
            onClick={onApprove}
            className="flex-[2] inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-brand-700 text-white font-semibold text-[13px] hover:bg-brand-800 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" /> Duyệt & cấp Hộ chiếu Số
          </button>
        </div>
      )}
      {!pending && app.reviewedBy && (
        <div className="px-5 py-2.5 bg-surface-50 border-t border-surface-200 text-[11px] text-slate-500 font-mono">
          {approved ? "✓" : "✗"} {app.reviewedBy} · {new Date(app.reviewedAt).toLocaleString("vi-VN")}
        </div>
      )}
    </article>
  );
};

const InfoRow = ({ icon: Icon, label, value, mono, colSpan }) => (
  <div className={colSpan ? "col-span-2" : ""}>
    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 flex items-center gap-1">
      {Icon && <Icon className="w-3 h-3" />} {label}
    </div>
    <div className={`text-slate-800 mt-0.5 ${mono ? "font-mono font-semibold" : "font-medium"}`}>{value}</div>
  </div>
);

const Stat = ({ label, value, accent = "text-white" }) => (
  <div className="bg-slate-900 px-3 sm:px-4 py-3 sm:py-3.5">
    <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
    <div className={`font-display text-[22px] sm:text-[28px] font-semibold tabular leading-none mt-2 sm:mt-2.5 ${accent}`}>{value}</div>
  </div>
);

export default RegistrationsTab;
