import { useState } from "react";

// Cán bộ 3 Cùng đến HTX đăng ký Hộ chiếu Số cho nông dân mới.
// Smart contract createPassport() chạy tự động → sinh DigitalID, ghi Genesis Record lên chain.
const HTX_OPTIONS = [
  "HTX Thoại Sơn", "HTX Châu Phú", "HTX Tri Tôn", "HTX Vĩnh Thạnh",
  "HTX Cờ Đỏ", "HTX Tân Hiệp", "HTX Châu Thành", "HTX Thanh Bình",
  "HTX Hòn Đất", "HTX Long Xuyên",
];
const GIONG_OPTIONS = ["Lộc Trời 28", "OM 5451", "Đài Thơm 8", "Jasmine 85", "ST25"];

const OnboardingTab = ({ staff, blockchainLog, farmers, onCreateFarmer }) => {
  const [form, setForm] = useState({
    hoTen: "",
    cccd: "",
    sdt: "",
    diaChi: "",
    htx: HTX_OPTIONS[0],
    dienTich: "5",
    giong: GIONG_OPTIONS[0],
  });
  const [errors, setErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.hoTen.trim()) e.hoTen = "Họ tên bắt buộc";
    if (!/^\d{9,12}$/.test(form.cccd)) e.cccd = "CCCD 9-12 số";
    if (!/^0\d{9,10}$/.test(form.sdt)) e.sdt = "SĐT 10 số bắt đầu 0";
    if (!form.diaChi.trim()) e.diaChi = "Địa chỉ bắt buộc";
    const ha = parseFloat(form.dienTich);
    if (!ha || ha <= 0) e.dienTich = "Diện tích > 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    setCreating(true);
    // Mô phỏng smart contract createPassport() chạy 1.5s
    setTimeout(() => {
      const newFarmer = onCreateFarmer({
        hoTen: form.hoTen.trim(),
        cccd: form.cccd,
        sdt: form.sdt,
        diaChi: form.diaChi.trim(),
        htx: form.htx,
        dienTich: parseFloat(form.dienTich),
        giong: form.giong,
        onboardedBy: staff.id,
      });
      setCreated(newFarmer);
      setCreating(false);
      // Reset form
      setForm({ hoTen: "", cccd: "", sdt: "", diaChi: "", htx: HTX_OPTIONS[0], dienTich: "5", giong: GIONG_OPTIONS[0] });
    }, 1500);
  };

  const myOnboardLogs = blockchainLog.filter(l => l.action === "PASSPORT_CREATED" && l.data.includes(staff.id)).slice(0, 5);
  const myOnboardCount = blockchainLog.filter(l => l.action === "PASSPORT_CREATED" && l.data.includes(staff.id)).length;

  return (
    <div className="space-y-6 sm:space-y-8 fade-in pb-10">
      {/* Hero — slate-900, brand accent line */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 text-white">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-brand-700" />
        <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-5 sm:pb-6">
          <div className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">Cán bộ 3 Cùng</div>
          <h2 className="text-[22px] sm:text-[28px] font-display font-semibold tracking-tight mt-1.5 leading-tight">Onboard hộ nông dân</h2>
          <p className="text-[13px] sm:text-[14px] text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Đến từng HTX, đăng ký Hộ chiếu Số (Digital ID) cho nông dân. Smart contract <code className="font-mono text-brand-300">createPassport()</code> chạy tự động: sinh DID, ghi Genesis Record bất biến lên blockchain.
          </p>
          <div className="mt-5 sm:mt-6 grid grid-cols-3 gap-px bg-white/10 rounded-xl overflow-hidden">
            <Stat label="Tổng hộ" value={farmers.length} />
            <Stat label="Tôi đã onboard" value={myOnboardCount} />
            <Stat label="Tier khởi tạo" value="D" sub="Mới · Score 0/0" />
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-200">
          <h3 className="text-[15px] sm:text-[17px] font-display font-semibold text-slate-900 tracking-tight">Form đăng ký nông dân mới</h3>
          <p className="text-[11px] sm:text-[12px] text-slate-500 mt-1">CCCD sẽ được hash SHA-256 trước khi đưa lên chain (không lưu raw để bảo mật).</p>
        </div>
        <div className="px-4 sm:px-6 py-4 sm:py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Họ và tên" error={errors.hoTen}>
            <input value={form.hoTen} onChange={e => setForm({ ...form, hoTen: e.target.value })} placeholder="VD: Nguyễn Văn An" className="input" />
          </Field>
          <Field label="Số CCCD/CMND (9-12 số)" error={errors.cccd}>
            <input value={form.cccd} onChange={e => setForm({ ...form, cccd: e.target.value.replace(/\D/g, "") })} placeholder="VD: 087xxxxxxxxx" className="input" maxLength={12} />
          </Field>
          <Field label="Số điện thoại" error={errors.sdt}>
            <input value={form.sdt} onChange={e => setForm({ ...form, sdt: e.target.value.replace(/\D/g, "") })} placeholder="VD: 0987654321" className="input" maxLength={11} />
          </Field>
          <Field label="Địa chỉ" error={errors.diaChi}>
            <input value={form.diaChi} onChange={e => setForm({ ...form, diaChi: e.target.value })} placeholder="VD: Thoại Sơn, An Giang" className="input" />
          </Field>
          <Field label="Hợp tác xã (HTX)">
            <select value={form.htx} onChange={e => setForm({ ...form, htx: e.target.value })} className="input">
              {HTX_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </Field>
          <Field label="Diện tích ruộng (ha)" error={errors.dienTich}>
            <input type="number" min="0.1" step="0.1" value={form.dienTich} onChange={e => setForm({ ...form, dienTich: e.target.value })} className="input bg-white text-slate-900" />
          </Field>
          <Field label="Giống lúa thường dùng" full>
            <select value={form.giong} onChange={e => setForm({ ...form, giong: e.target.value })} className="input">
              {GIONG_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>



          <div className="md:col-span-2 flex gap-3">
            <button
              type="button"
              onClick={() => setForm({ hoTen: "", cccd: "", sdt: "", diaChi: "", htx: HTX_OPTIONS[0], dienTich: "5", giong: GIONG_OPTIONS[0] })}
              className="flex-1 text-center py-3 rounded-lg border border-surface-200 text-slate-600 font-semibold text-[14px] hover:bg-surface-50 transition-colors"
            >
              Xóa form
            </button>
            <button
              type="button"
              onClick={creating ? undefined : submit}
              disabled={creating}
              className={`flex-[2] text-center py-3 rounded-lg text-white font-semibold text-[14px] transition-colors ${creating ? "bg-slate-400 cursor-wait" : "bg-brand-700 hover:bg-brand-800"}`}
            >
              {creating ? "Đang ký Genesis Block…" : "Tạo Hộ chiếu Số và ghi blockchain"}
            </button>
          </div>
        </div>
      </section>

      {/* Created success */}
      {created && (
        <section className="bg-white rounded-2xl border border-brand-200 ring-1 ring-brand-100 px-6 py-5 fade-in">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight">Hộ chiếu Số đã được tạo trên blockchain</h3>
              <p className="text-[14px] text-slate-500 mt-1">
                <b className="text-slate-700">{created.hoTen}</b> · {created.htx} · {created.dienTich} ha
              </p>
              <div className="mt-4 grid grid-cols-2 gap-px bg-surface-200 rounded-lg overflow-hidden">
                <div className="bg-white px-3.5 py-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Digital ID</div>
                  <div className="font-mono font-semibold text-brand-800 text-[15px] mt-1">{created.digitalId}</div>
                </div>
                <div className="bg-white px-3.5 py-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Tier khởi tạo</div>
                  <div className="font-semibold text-rose-700 text-[15px] mt-1">Tier D · Score 0/0</div>
                </div>
              </div>
              <div className="mt-4 inline-flex items-center gap-3 bg-surface-50 rounded-lg border border-dashed border-surface-300 p-3">
                <div className="w-16 h-16 bg-slate-900 rounded-md flex items-center justify-center text-white font-mono text-[7px] leading-tight p-1 text-center">
                  {created.digitalId}<br/>QR<br/>v2.0
                </div>
                <div className="text-[14px] text-slate-700">
                  <b>QR Hộ chiếu Số</b>
                  <p className="text-[12px] text-slate-500 mt-0.5">In ra giấy đưa nông dân giữ.<br/>Quét để mở app.</p>
                </div>
              </div>
            </div>
            <button onClick={() => setCreated(null)} className="text-slate-400 hover:text-slate-700">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </section>
      )}

      {/* My recent onboards */}
      <section className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-200 flex items-baseline justify-between">
          <h3 className="text-[17px] font-display font-semibold text-slate-900 tracking-tight">Lịch sử onboard của tôi</h3>
          <span className="text-[12px] font-mono text-slate-400">{myOnboardLogs.length} hộ</span>
        </div>
        {myOnboardLogs.length === 0 ? (
          <p className="text-[14px] text-slate-500 text-center py-10">Chưa có hộ nào do bạn onboard.</p>
        ) : (
          <ul className="divide-y divide-surface-200">
            {myOnboardLogs.map((log, i) => (
              <li key={i} className="px-6 py-3.5">
                <p className="text-[14px] text-slate-700 leading-snug">{log.data}</p>
                <p className="text-[12px] text-slate-400 mt-1.5 font-mono">#{log.hash} · {new Date(log.timestamp).toLocaleString("vi-VN")}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <style dangerouslySetInnerHTML={{__html: `.input{width:100%;border:1px solid #dde3d9;border-radius:8px;padding:10px 12px;font-size:13px;outline:none;transition:border-color .15s, box-shadow .15s;background:#fdfefc;color:#1a1f1c}.input:focus{border-color:#2e7048;box-shadow:0 0 0 3px rgba(46,112,72,0.12);background:#fff}.input::placeholder{color:#94a194}`}} />
    </div>
  );
};

const Field = ({ label, error, full, children }) => (
  <div className={full ? "md:col-span-2" : ""}>
    <label className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5">{label}</label>
    {children}
    {error && <p className="text-[12px] text-rose-600 font-semibold mt-1">{error}</p>}
  </div>
);

const Stat = ({ label, value, sub }) => (
  <div className="bg-slate-900 px-3 sm:px-4 py-3 sm:py-3.5">
    <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
    <div className="font-display text-[22px] sm:text-[28px] font-semibold tabular leading-none mt-2 sm:mt-2.5 text-white break-words">{value}</div>
    {sub && <div className="text-[11px] sm:text-[12px] text-slate-500 mt-1 sm:mt-1.5">{sub}</div>}
  </div>
);

export default OnboardingTab;
