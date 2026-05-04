import { useRef, useState } from "react";
import { LT_SUBROLES } from "../lib/staff";
import { analyzeDroneImage } from "../lib/imageAnalysis";

// Bước B4.1 + B4.2: Phi công drone bay đa phổ → upload ảnh → AI Computer Vision phân tích
// pixel xanh, NDVI, vùng úng/khô → ghi DRONE_REPORT lên blockchain → 3 Cùng dùng làm input cho B4.3.
const DroneOperatorTab = ({ staff, farmers, droneReports, onSubmitDroneReport, blockchainLog }) => {
  const sr = LT_SUBROLES.droneOperator;
  const fileInputRef = useRef(null);

  const [selectedFarmer, setSelectedFarmer] = useState(farmers[0] ?? null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);

  const myReports = droneReports.filter(r => r.operatorId === staff.id);
  const totalAnh = myReports.length;
  const totalHa = myReports.reduce((s, r) => s + (r.farmerArea ?? 0), 0);

  const onFile = async (file) => {
    if (!file || !selectedFarmer) return;
    setAnalyzing(true);
    setAnalysis(null);
    setScanProgress(0);

    // Mô phỏng progress AI scan
    let p = 0;
    const interval = setInterval(() => {
      p = Math.min(p + 12, 92);
      setScanProgress(p);
    }, 150);

    try {
      const result = await analyzeDroneImage(file);
      clearInterval(interval);
      setScanProgress(100);
      setAnalysis(result);
    } catch (err) {
      clearInterval(interval);
      alert("Lỗi phân tích ảnh: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const submit = () => {
    if (!analysis || !selectedFarmer) return;
    onSubmitDroneReport({
      farmerId: selectedFarmer.id,
      farmerName: selectedFarmer.hoTen,
      farmerArea: selectedFarmer.dienTich,
      operatorId: staff.id,
      operatorName: staff.hoTen,
      ...analysis,
      timestamp: new Date().toISOString(),
    });
    setAnalysis(null);
    setScanProgress(0);
  };

  return (
    <div className="space-y-6 fade-in pb-10">
      {/* Hero */}
      <div className={`bg-gradient-to-r ${sr.color} rounded-2xl p-6 text-white shadow-lg`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl spin inline-block">🚁</span>
          <h2 className="text-xl font-bold">Drone DJI Agras T40 — AI Computer Vision (Bước B4.1-B4.2)</h2>
        </div>
        <p className="text-sky-100 text-sm">
          Bay drone đa phổ qua ruộng → upload ảnh → AI phân tích trực tiếp tỷ lệ phủ xanh, NDVI, phát hiện vùng úng/khô/sâu bệnh →
          ghi <b>DRONE_REPORT</b> lên blockchain. 3 Cùng dùng báo cáo này làm input để xuống đồng kiểm tra (B4.3).
        </p>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Stat label="Tổng ảnh đã upload" value={totalAnh} />
          <Stat label="Diện tích đã quét" value={`${totalHa.toFixed(1)} ha`} />
          <Stat label="Drone hoạt động" value="DJI T40" sub="Đa phổ + RGB" />
        </div>
      </div>

      {/* Farmer selector */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-gray-800">1️⃣ Chọn ruộng cần bay drone</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-4 max-h-72 overflow-y-auto">
          {farmers.map(f => (
            <div
              key={f.id}
              onClick={() => setSelectedFarmer(f)}
              className={`border rounded-xl p-3 cursor-pointer transition-all select-none ${selectedFarmer?.id === f.id ? "border-sky-400 bg-sky-50 ring-1 ring-sky-300" : "border-slate-200 hover:border-slate-300 bg-white"}`}
            >
              <div className="font-bold text-sm text-gray-900">{f.hoTen}</div>
              <div className="text-[11px] text-slate-500">{f.htx} · {f.dienTich} ha</div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">{f.digitalId ?? f.id}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-gray-800">2️⃣ Upload ảnh drone (giả lập drone gửi về cloud)</h3>
          <p className="text-[11px] text-slate-500 mt-1">Chọn 1 ảnh JPG/PNG — AI sẽ đọc pixel để chấm % phủ xanh & NDVI.</p>
        </div>
        <div className="p-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => onFile(e.target.files?.[0])}
          />
          {!analyzing && !analysis && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-sky-300 rounded-2xl p-12 text-center cursor-pointer hover:bg-sky-50/50 transition-colors select-none"
            >
              <div className="text-5xl mb-3">📤</div>
              <p className="font-bold text-sm text-gray-800">Bấm để chọn ảnh drone hoặc kéo thả vào đây</p>
              <p className="text-xs text-slate-500 mt-2">
                Mock drone DJI: dùng bất kỳ ảnh ruộng/cây/màu xanh nào để AI xử lý.
                Ảnh có nhiều xanh → điểm cao. Ảnh khô/nâu → AI cảnh báo sâu bệnh.
              </p>
            </div>
          )}

          {analyzing && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-8 text-center">
              <div className="text-5xl mb-3 spin inline-block">🚁</div>
              <h3 className="text-base font-bold">AI Computer Vision đang phân tích ảnh đa phổ...</h3>
              <p className="text-xs text-slate-400 mt-1">Đang đếm pixel xanh/nâu/nước · Tính NDVI · Phát hiện sâu bệnh</p>
              <div className="mt-4 max-w-md mx-auto h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-300" style={{ width: `${scanProgress}%` }} />
              </div>
              <p className="text-xs text-emerald-300 mt-2 font-mono">{scanProgress}%</p>
            </div>
          )}

          {analysis && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <img src={analysis.previewUrl} alt="drone capture" className="w-full rounded-xl border-2 border-slate-200 shadow-sm" />
                  <p className="text-[10px] text-slate-500 mt-1 font-mono truncate">{analysis.fileName}</p>
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-3">
                  <Metric label="🌱 Phủ xanh" value={`${analysis.greenPct}%`} color="emerald" />
                  <Metric label="📡 NDVI ước lượng" value={`${analysis.ndvi}%`} color="cyan" />
                  <Metric label="🍂 Vùng nâu/úa" value={`${analysis.brownPct}%`} color="amber" />
                  <Metric label="💧 Vùng nước/úng" value={`${analysis.waterPct}%`} color="blue" />
                  <div className="col-span-2 bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">🤖 AI nhận định</div>
                    <p className="text-sm font-bold text-gray-800">{analysis.qualityNote}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">IPFS hash: {analysis.fileHash}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div onClick={() => { setAnalysis(null); setScanProgress(0); }} className="flex-1 text-center py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm cursor-pointer hover:bg-slate-50 select-none">
                  Hủy & Chọn ảnh khác
                </div>
                <div onClick={submit} className={`flex-1 text-center py-3 rounded-xl text-white font-bold text-sm cursor-pointer shadow-sm select-none bg-gradient-to-r ${sr.color} hover:shadow-lg transition-all`}>
                  ⛓️ Ký số &amp; Ghi DRONE_REPORT lên Blockchain
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* My drone reports */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4">📜 Báo cáo drone của tôi (mới nhất)</h3>
        {myReports.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Chưa có báo cáo nào. Upload ảnh đầu tiên ở trên.</p>
        ) : (
          <div className="space-y-2">
            {myReports.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <img src={r.previewUrl} alt="" className="w-14 h-14 rounded-lg object-cover border" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{r.farmerName} · {r.farmerArea} ha</p>
                  <div className="flex flex-wrap gap-2 text-[10px] mt-1">
                    <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Xanh {r.greenPct}%</span>
                    <span className="bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded font-bold">NDVI {r.ndvi}</span>
                    <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">Nâu {r.brownPct}%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">#{r.fileHash} · {new Date(r.timestamp).toLocaleString("vi-VN")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value, sub }) => (
  <div className="bg-white/10 rounded-xl p-3">
    <div className="text-[10px] text-white/80 font-bold uppercase">{label}</div>
    <div className="text-2xl font-bold">{value}</div>
    {sub && <div className="text-[10px] text-white/70">{sub}</div>}
  </div>
);
const Metric = ({ label, value, color }) => {
  const map = { emerald: "bg-emerald-50 border-emerald-200 text-emerald-700", cyan: "bg-cyan-50 border-cyan-200 text-cyan-700", amber: "bg-amber-50 border-amber-200 text-amber-700", blue: "bg-blue-50 border-blue-200 text-blue-700" };
  return (
    <div className={`rounded-xl p-3 border-2 ${map[color]}`}>
      <div className="text-[10px] font-bold uppercase opacity-80">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
};

export default DroneOperatorTab;
