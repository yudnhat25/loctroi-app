import { useState } from "react";
import { LT_SUBROLES } from "../lib/staff";

// Bước A1-A2: Cán bộ 3 Cùng đến HTX, đăng ký Hộ chiếu Số cho nông dân mới.
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

  const sr = LT_SUBROLES.fieldOfficer;

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
    <div className="space-y-6 fade-in pb-10">
      {/* Hero */}
      <div className={`bg-gradient-to-r ${sr.color} rounded-2xl p-6 text-white shadow-lg`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🪪</span>
          <h2 className="text-xl font-bold">Onboard Hộ Nông dân (Bước A1 → A2)</h2>
        </div>
        <p className="text-emerald-100 text-sm">
          Cán bộ 3 Cùng đến từng HTX, đăng ký Hộ chiếu Số (Digital ID) cho nông dân.
          <b> Smart contract <code>createPassport()</code></b> chạy tự động → sinh DID + ghi Genesis Record bất biến trên blockchain.
        </p>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Stat label="Tổng hộ trong hệ thống" value={farmers.length} />
          <Stat label="Hộ tôi đã onboard" value={myOnboardCount} />
          <Stat label="Tier khởi tạo" value="D" sub="Mới · Score 0/0" />
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-gray-800">📝 Form đăng ký nông dân mới</h3>
          <p className="text-[11px] text-slate-500 mt-1">CCCD sẽ được hash SHA-256 trước khi đưa lên chain (không lưu raw để bảo mật).</p>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <input type="number" min="0.1" step="0.1" value={form.dienTich} onChange={e => setForm({ ...form, dienTich: e.target.value })} className="input" />
          </Field>
          <Field label="Giống lúa thường dùng" full>
            <select value={form.giong} onChange={e => setForm({ ...form, giong: e.target.value })} className="input">
              {GIONG_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>

          <div className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            <b>⚠️ Tự động khi nộp đơn:</b> Smart contract <code>createPassport()</code> sẽ:
            sinh Digital ID (LT-NDxxxxxx), hash CCCD, tạo block Genesis Record, set Tier D, Score 0/0.
            Trả về QR code để in ra giấy đưa nông dân giữ.
          </div>

          <div className="md:col-span-2 flex gap-3">
            <div onClick={() => setForm({ hoTen: "", cccd: "", sdt: "", diaChi: "", htx: HTX_OPTIONS[0], dienTich: "5", giong: GIONG_OPTIONS[0] })} className="flex-1 text-center py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm cursor-pointer hover:bg-slate-50 select-none">
              Xóa form
            </div>
            <div onClick={creating ? undefined : submit} className={`flex-1 text-center py-3 rounded-xl text-white font-bold text-sm cursor-pointer shadow-sm select-none transition-all ${creating ? "bg-slate-400 cursor-wait" : `bg-gradient-to-r ${sr.color} hover:shadow-lg`}`}>
              {creating ? "⛓️ Đang ký Genesis Block..." : "⛓️ Tạo Hộ chiếu Số & Ghi Blockchain"}
            </div>
          </div>
        </div>
      </div>

      {/* Created success */}
      {created && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 fade-in">
          <div className="flex items-start gap-4">
            <div className="text-5xl">✅</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-emerald-900">Hộ chiếu Số đã được tạo trên blockchain</h3>
              <p className="text-sm text-emerald-700 mt-1">
                <b>{created.hoTen}</b> · {created.htx} · {created.dienTich} ha
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white rounded-lg p-2 border border-emerald-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Digital ID</div>
                  <div className="font-mono font-bold text-emerald-700">{created.digitalId}</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-emerald-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Tier khởi tạo</div>
                  <div className="font-bold text-rose-600">Tier D · Score 0/0</div>
                </div>
              </div>
              {/* Mock QR code */}
              <div className="mt-3 inline-flex items-center gap-3 bg-white rounded-xl border-2 border-dashed border-emerald-300 p-3">
                <div className="w-20 h-20 bg-slate-900 rounded-lg flex items-center justify-center text-white font-mono text-[8px] leading-tight p-1 text-center">
                  {created.digitalId}<br/>QR<br/>v2.0
                </div>
                <div className="text-xs text-slate-700">
                  <b>QR Hộ chiếu Số</b><br/>
                  <span className="text-[10px] text-slate-500">In ra giấy đưa nông dân giữ.<br/>Quét để mở app.</span>
                </div>
              </div>
            </div>
            <div onClick={() => setCreated(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">✕</div>
          </div>
        </div>
      )}

      {/* My recent onboards */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4">📜 Lịch sử onboard của tôi (mới nhất)</h3>
        {myOnboardLogs.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Chưa có hộ nào do bạn onboard. Đăng ký hộ đầu tiên ở form trên.</p>
        ) : (
          <div className="space-y-2">
            {myOnboardLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-lg">🪪</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 font-semibold">{log.data}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">#{log.hash} · {new Date(log.timestamp).toLocaleString("vi-VN")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `.input{width:100%;border:1px solid #e2e8f0;border-radius:12px;padding:10px 12px;font-size:14px;outline:none;transition:all .2s;background:#f8fafc}.input:focus{border-color:#10b981;box-shadow:0 0 0 3px #10b9811a;background:#fff}`}} />
    </div>
  );
};

const Field = ({ label, error, full, children }) => (
  <div className={full ? "md:col-span-2" : ""}>
    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
    {error && <p className="text-[10px] text-red-500 font-bold mt-1">⚠ {error}</p>}
  </div>
);

const Stat = ({ label, value, sub }) => (
  <div className="bg-white/10 rounded-xl p-3">
    <div className="text-[10px] text-white/80 font-bold uppercase">{label}</div>
    <div className="text-2xl font-bold">{value}</div>
    {sub && <div className="text-[10px] text-white/70">{sub}</div>}
  </div>
);

export default OnboardingTab;
