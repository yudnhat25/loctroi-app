import { useState } from "react";
import { LT_SUBROLES } from "../lib/staff";

// Bước B3: Tài xế đến nhà nông dân, quét QR Hộ chiếu Số → app hiển thị danh sách vật tư cần giao
// → 2 bên ký số → smart contract confirmDelivery() → +10 Credit Score.
const DeliveryTab = ({ staff, deliveryQueue, farmers, supplies, onConfirmDelivery, formatVND, blockchainLog }) => {
  const sr = LT_SUBROLES.driver;
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
      <div className={`bg-gradient-to-r ${sr.color} rounded-2xl p-6 text-white shadow-lg`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🚛</span>
          <h2 className="text-xl font-bold">Giao vật tư & Ký số 2 bên (Bước B3)</h2>
        </div>
        <p className="text-amber-50 text-sm">
          Quét QR Hộ chiếu Số nông dân → app hiện danh sách vật tư → 2 bên cùng ký số → smart contract <code>confirmDelivery()</code>
          ghi blockchain → cộng <b>+10 Credit Score</b> cho nông dân (Tầng 2 — không ai làm giả được).
        </p>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Stat label="Đơn chờ giao" value={deliveryQueue.length} />
          <Stat label="Đơn tôi đã giao" value={myDeliveries} />
          <Stat label="Bonus Credit/đơn" value="+10" />
        </div>
      </div>

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
                    <div className="text-[11px] text-slate-500">{d.farmer.htx ?? d.farmer.diaChi} · {d.farmer.dienTich} ha</div>
                    <div className="text-xs text-slate-700 mt-1">
                      <b>{d.quantity}</b> {supply?.donVi} <b>{supply?.ten}</b> · {d.season}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">{d.id} → {d.farmer.digitalId ?? d.farmer.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-600">{formatVND(total)}</div>
                    <div className="text-[10px] text-slate-400 mb-2">Tier {d.tier}</div>
                    <div onClick={() => startScan(d)} className={`bg-gradient-to-r ${sr.color} text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer shadow-sm hover:shadow-lg transition-all select-none`}>
                      📷 Quét QR &amp; Giao
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
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Hộ chiếu Số đã quét</div>
                  <div className="font-bold text-base">{scanning.farmer.hoTen}</div>
                  <div className="text-xs text-slate-300">{scanning.farmer.htx} · {scanning.farmer.dienTich} ha</div>
                  <div className="text-[10px] font-mono text-emerald-400 mt-0.5">{scanning.farmer.digitalId ?? scanning.farmer.id}</div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Vật tư cần giao</div>
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

              <div onClick={finalize} className={`w-full text-center py-3 rounded-xl text-white font-bold text-sm cursor-pointer select-none transition-all ${
                farmerSigned && driverSigned ? `bg-gradient-to-r ${sr.color} shadow-md hover:shadow-lg` : "bg-slate-300 cursor-not-allowed"
              }`}>
                {farmerSigned && driverSigned ? "⛓️ Ghi DELIVERY_CONFIRMED lên Blockchain" : "Cần đủ 2 chữ ký để giao"}
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
      <div className="text-[10px] font-bold uppercase text-slate-500">{label}</div>
      <div className="text-sm font-bold text-gray-800 mt-1">{who}</div>
      <div className={`text-3xl mt-2 ${signed ? "text-emerald-500" : "text-slate-300"}`}>{signed ? "✍️ ✓" : "✍️"}</div>
      <div className="text-[10px] text-slate-500 mt-1">{signed ? "Đã ký số" : "Chấm vân tay/PIN"}</div>
    </div>
  );
};

const Stat = ({ label, value, sub }) => (
  <div className="bg-white/15 rounded-xl p-3">
    <div className="text-[10px] text-white/80 font-bold uppercase">{label}</div>
    <div className="text-2xl font-bold">{value}</div>
    {sub && <div className="text-[10px] text-white/70">{sub}</div>}
  </div>
);

export default DeliveryTab;
