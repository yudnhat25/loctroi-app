import { useState } from "react";

// Tài xế đến nhà nông dân, quét QR Hộ chiếu Số → app hiện danh sách vật tư cần giao
// → 2 bên ký số → smart contract confirmDelivery() → +10 Credit Score.
const DeliveryTab = ({ staff, deliveryQueue, farmers, supplies, onConfirmDelivery, formatVND, blockchainLog }) => {
  const [scanning, setScanning] = useState(null); // delivery being scanned
  const [farmerSigned, setFarmerSigned] = useState(false);
  const [driverSigned, setDriverSigned] = useState(false);

  const myDeliveries = blockchainLog.filter(l => l.action === "DELIVERY_CONFIRMED" && l.data.includes(staff.id)).length;

  const startScan = (d) => {
    setScanning(d);
    setFarmerSigned(false);
    setDriverSigned(false);
  };

  const finalize = () => {
    if (!scanning || !farmerSigned || !driverSigned) return;
    onConfirmDelivery(scanning, staff);
    setScanning(null);
  };

  return (
    <div className="space-y-6 fade-in pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 text-white">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-amber-600" />
        <div className="px-7 pt-7 pb-6">
          <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">Tài xế giao vật tư</div>
          <h2 className="text-[28px] font-display font-semibold tracking-tight mt-1.5 leading-tight">
            Giao vật tư và ký số 2 bên
          </h2>
          <p className="text-[14px] text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Quét QR Hộ chiếu Số nông dân, app hiện danh sách vật tư, 2 bên cùng ký số,
            smart contract <code className="font-mono text-amber-300">confirmDelivery()</code> ghi blockchain
            và cộng <b className="text-white">+10 Credit Score</b> cho nông dân (Tầng 2, không ai làm giả được).
          </p>
          <div className="mt-6 grid grid-cols-3 gap-px bg-white/10 rounded-xl overflow-hidden">
            <Stat label="Đơn chờ giao" value={deliveryQueue.length} />
            <Stat label="Đơn tôi đã giao" value={myDeliveries} />
            <Stat label="Bonus Credit/đơn" value="+10" />
          </div>
        </div>
      </section>

      {/* Pending deliveries */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-orange-50/30 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">📦 Đơn chờ giao</h3>
          {deliveryQueue.length > 0 && <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{deliveryQueue.length} pending</span>}
        </div>
        {deliveryQueue.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-sm font-semibold">Hết đơn — không còn vật tư nào chờ giao.</p>
            <p className="text-xs mt-1">Quay lại sau khi quản lý duyệt thêm đơn mới.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {deliveryQueue.map(d => {
              const supply = supplies.find(s => s.id === d.supplyId);
              const total = d.quantity * (supply?.donGia ?? 0);
              return (
                <div key={d.id} className="p-4 hover:bg-amber-50/40 transition-colors flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{d.farmer.hoTen}</div>
                    <div className="text-[12px] text-slate-500">{d.farmer.htx ?? d.farmer.diaChi} · {d.farmer.dienTich} ha</div>
                    <div className="text-xs text-slate-700 mt-1">
                      <b>{d.quantity}</b> {supply?.donVi} <b>{supply?.ten}</b> · {d.season}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">{d.id} → {d.farmer.digitalId ?? d.farmer.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-600">{formatVND(total)}</div>
                    <div className="text-[11px] text-slate-400 mb-2">Tier {d.tier}</div>
                    <div onClick={() => startScan(d)} className="bg-amber-700 hover:bg-amber-800 text-white text-[14px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors select-none inline-flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>
                      Quét QR và giao
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scan modal */}
      {scanning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-amber-50/50">
              <h3 className="text-base font-bold text-gray-900">🚛 Giao vật tư & Ký số 2 bên</h3>
              <div onClick={() => setScanning(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">✕</div>
            </div>

            <div className="p-5 space-y-4">
              {/* QR mock */}
              <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center gap-4">
                <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center text-slate-900 font-mono text-[8px] leading-tight p-1 text-center">
                  {scanning.farmer.digitalId ?? scanning.farmer.id}<br/>QR<br/>v2.0
                </div>
                <div className="flex-1">
                  <div className="text-[11px] text-slate-400 font-bold uppercase">Hộ chiếu Số đã quét</div>
                  <div className="font-bold text-base">{scanning.farmer.hoTen}</div>
                  <div className="text-xs text-slate-300">{scanning.farmer.htx} · {scanning.farmer.dienTich} ha</div>
                  <div className="text-[11px] font-mono text-emerald-400 mt-0.5">{scanning.farmer.digitalId ?? scanning.farmer.id}</div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="text-[11px] text-slate-500 font-bold uppercase mb-2">Vật tư cần giao</div>
                <div className="text-sm font-bold text-gray-900">
                  {scanning.quantity} {supplies.find(s => s.id === scanning.supplyId)?.donVi} {supplies.find(s => s.id === scanning.supplyId)?.ten}
                </div>
                <div className="text-xs text-slate-500 mt-1">Vụ: {scanning.season} · Tier {scanning.tier}</div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-3">
                <SignBox
                  label="Chữ ký Nông dân"
                  who={scanning.farmer.hoTen}
                  signed={farmerSigned}
                  onClick={() => setFarmerSigned(true)}
                  color="green"
                />
                <SignBox
                  label="Chữ ký Tài xế"
                  who={staff.hoTen}
                  signed={driverSigned}
                  onClick={() => setDriverSigned(true)}
                  color="amber"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                ⚠️ Cả 2 chữ ký đều bắt buộc. Sau khi ký xong, smart contract <code>confirmDelivery()</code> ghi block bất biến.
                Nông dân được <b>+10 Credit Score</b> ngay lập tức.
              </div>

              <div onClick={finalize} className={`w-full text-center py-3 rounded-lg text-white font-semibold text-[14px] cursor-pointer select-none transition-colors ${
                farmerSigned && driverSigned ? "bg-amber-700 hover:bg-amber-800" : "bg-slate-300 cursor-not-allowed"
              }`}>
                {farmerSigned && driverSigned ? "Ghi DELIVERY_CONFIRMED lên Blockchain" : "Cần đủ 2 chữ ký để giao"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SignBox = ({ label, who, signed, onClick, color }) => {
  const map = {
    green: signed ? "border-green-400 bg-green-50" : "border-green-200 hover:border-green-300",
    amber: signed ? "border-amber-400 bg-amber-50" : "border-amber-200 hover:border-amber-300",
  };
  return (
    <div onClick={signed ? undefined : onClick} className={`border-2 rounded-xl p-3 cursor-pointer transition-all select-none text-center ${map[color]}`}>
      <div className="text-[11px] font-bold uppercase text-slate-500">{label}</div>
      <div className="text-sm font-bold text-gray-800 mt-1">{who}</div>
      <div className={`text-3xl mt-2 ${signed ? "text-emerald-500" : "text-slate-300"}`}>{signed ? "✍️ ✓" : "✍️"}</div>
      <div className="text-[11px] text-slate-500 mt-1">{signed ? "Đã ký số" : "Chấm vân tay/PIN"}</div>
    </div>
  );
};

const Stat = ({ label, value, sub }) => (
  <div className="bg-slate-900 px-4 py-3.5">
    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
    <div className="font-display text-[28px] font-semibold tabular leading-none mt-2.5 text-white">{value}</div>
    {sub && <div className="text-[12px] text-slate-500 mt-1.5">{sub}</div>}
  </div>
);

export default DeliveryTab;
