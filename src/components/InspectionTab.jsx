import { useRef, useState } from "react";
import {
  SRP_CRITERIA, SRP_MAX, MAX_FARMING,
  getTier, getOverallScore,
} from "../lib/scoring";
import { analyzeDroneImage, aiSuggestChecklist, aiSuggestFarmingScore } from "../lib/imageAnalysis";

// Bước B4.3-B4.5: 3 Cùng nhận thông báo từ drone report → xuống đồng → tick checklist 41 SRP →
// upload ảnh thực địa làm bằng chứng → AI gợi ý điểm phủ xanh từ ảnh → ký số ghi chain.
const InspectionTab = ({ staff, farmers, droneReports, blockchainLog, onInspect }) => {
  const fileInputRef = useRef(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle | review | upload | analyzing | checklist | done
  const [checked, setChecked] = useState({});
  const [fieldAnalysis, setFieldAnalysis] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [reusedDroneReport, setReusedDroneReport] = useState(null);

  const startInspection = (farmer) => {
    setSelectedFarmer(farmer);
    setChecked({});
    setFieldAnalysis(null);
    setScanProgress(0);
    // Tìm drone report mới nhất cho farmer này (do phi công upload trước đó)
    const latestDrone = droneReports.find(r => r.farmerId === farmer.id);
    setReusedDroneReport(latestDrone || null);
    setPhase("review");
  };

  const goUploadField = () => {
    setPhase("upload");
    fileInputRef.current?.click();
  };

  const onFile = async (file) => {
    if (!file) return;
    setPhase("analyzing");
    setScanProgress(0);
    let p = 0;
    const interval = setInterval(() => { p = Math.min(p + 12, 92); setScanProgress(p); }, 150);
    try {
      const result = await analyzeDroneImage(file);
      clearInterval(interval);
      setScanProgress(100);
      setFieldAnalysis(result);
      // AI auto-tick checklist dựa kết quả phân tích
      setChecked(aiSuggestChecklist(result));
      setPhase("checklist");
    } catch (err) {
      clearInterval(interval);
      alert("Lỗi phân tích ảnh: " + err.message);
      setPhase("review");
    }
  };

  const totalChecked = Object.values(checked).filter(Boolean).length;
  const earnedPoints = SRP_CRITERIA.filter(c => checked[c.id]).reduce((s, c) => s + c.points, 0);
  const newFarmingScore = Math.round((earnedPoints / SRP_MAX) * MAX_FARMING);

  const submit = () => {
    onInspect({
      farmer: selectedFarmer,
      checked,
      newFarmingScore,
      droneReportHash: reusedDroneReport?.fileHash,
      fieldImageHash: fieldAnalysis?.fileHash,
      operator: staff,
      analysis: fieldAnalysis,
    });
    setPhase("done");
    setTimeout(() => {
      setPhase("idle");
      setSelectedFarmer(null);
      setFieldAnalysis(null);
      setReusedDroneReport(null);
    }, 2000);
  };

  const myInspectionLogs = blockchainLog.filter(l => l.action === "FIELD_INSPECTION").slice(0, 5);
  const totalDroneReports = droneReports.length;

  return (
    <div className="space-y-6 fade-in pb-10">
      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🧑‍🌾</span>
          <h2 className="text-xl font-bold">Đội 3 Cùng — Kiểm tra SRP thực địa (Bước B4.3-B4.5)</h2>
        </div>
        <p className="text-emerald-100 text-sm">
          Sau khi drone bay → app báo "có dấu hiệu sâu bệnh ở ruộng X" → xuống đồng kiểm tra trực tiếp →
          chụp ảnh thực địa upload (AI đối chứng với drone) → tick 41 tiêu chí SRP → ký số → ghi blockchain
          (3 lớp bằng chứng: drone + ảnh thực địa + chữ ký số).
        </p>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Stat label="Báo cáo drone đang chờ" value={totalDroneReports} />
          <Stat label="Lần kiểm tra đã ghi chain" value={blockchainLog.filter(l => l.action === "FIELD_INSPECTION").length} />
          <Stat label="Tiêu chí SRP áp dụng" value={`${SRP_CRITERIA.length}/41`} />
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => onFile(e.target.files?.[0])} />

      {/* Farmer list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">Chọn hộ nông dân để kiểm tra</h3>
          <span className="text-xs text-slate-500 font-semibold">{farmers.length} hộ</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-4">
          {farmers.map(f => {
            const tier = getTier(f);
            const fs = f.farmingScore ?? 0;
            const fsPct = Math.round((fs / MAX_FARMING) * 100);
            const droneReport = droneReports.find(r => r.farmerId === f.id);
            return (
              <div key={f.id} className="border border-slate-200 rounded-xl p-3 hover:border-emerald-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm text-gray-900">{f.hoTen}</p>
                    <p className="text-[10px] font-mono text-slate-500">{f.digitalId ?? f.id}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.badge}`}>Tier {tier.code}</span>
                </div>
                <div className="text-[11px] text-slate-600 mb-2">{f.htx} · {f.dienTich} ha</div>

                {droneReport && (
                  <div className="bg-sky-50 border border-sky-200 rounded-lg p-2 mb-2 flex items-center gap-2">
                    <img src={droneReport.previewUrl} alt="drone" className="w-10 h-10 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-sky-800">🚁 Drone đã bay — {droneReport.qualityNote}</div>
                      <div className="text-[9px] text-sky-600">Phủ xanh {droneReport.greenPct}% · NDVI {droneReport.ndvi}</div>
                    </div>
                  </div>
                )}

                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Farming Score</span>
                    <span className="font-bold text-emerald-700">{fs}/{MAX_FARMING}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${fsPct}%` }} />
                  </div>
                </div>

                <div
                  onClick={() => phase === "idle" && startInspection(f)}
                  className={`text-[11px] font-bold rounded-lg py-2 text-center cursor-pointer transition-colors select-none ${
                    phase === "idle" ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  ✅ Kiểm tra SRP thực địa
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase: review drone report */}
      {phase === "review" && selectedFarmer && (
        <div className="bg-white rounded-2xl border-2 border-emerald-300 shadow-xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-lg font-bold text-gray-900">📋 Bước 1: Xem báo cáo drone — {selectedFarmer.hoTen}</h3>
              <p className="text-xs text-slate-500 mt-1">Drone bay trước, 3 Cùng xem report để biết ruộng nào có vấn đề trước khi xuống đồng.</p>
            </div>
            <div onClick={() => { setPhase("idle"); setSelectedFarmer(null); }} className="text-slate-400 hover:text-slate-700 cursor-pointer">✕ Hủy</div>
          </div>

          {reusedDroneReport ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <img src={reusedDroneReport.previewUrl} alt="" className="w-full rounded-xl border-2 border-slate-200" />
              <div className="md:col-span-2 grid grid-cols-2 gap-3">
                <Metric label="🌱 Phủ xanh" value={`${reusedDroneReport.greenPct}%`} color="emerald" />
                <Metric label="📡 NDVI" value={`${reusedDroneReport.ndvi}%`} color="cyan" />
                <Metric label="🍂 Vùng nâu" value={`${reusedDroneReport.brownPct}%`} color="amber" />
                <Metric label="💧 Vùng nước" value={`${reusedDroneReport.waterPct}%`} color="blue" />
                <div className="col-span-2 bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">🤖 Drone AI nhận định</div>
                  <p className="text-sm font-bold text-gray-800">{reusedDroneReport.qualityNote}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              ⚠️ <b>Chưa có báo cáo drone</b> cho ruộng này. Bạn vẫn có thể kiểm tra thực địa, nhưng sẽ thiếu 1 trong 3 lớp bằng chứng.
              Hãy yêu cầu phi công drone bay trước nếu có thể.
            </div>
          )}

          <div className="flex gap-3">
            <div onClick={() => { setPhase("idle"); setSelectedFarmer(null); }} className="flex-1 text-center py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm cursor-pointer hover:bg-slate-50 select-none">
              Quay lại
            </div>
            <div onClick={goUploadField} className="flex-1 text-center py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer shadow-sm select-none">
              📷 Upload ảnh thực địa &amp; tick SRP →
            </div>
          </div>
        </div>
      )}

      {/* Phase: analyzing */}
      {phase === "analyzing" && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-8 text-center">
          <div className="text-5xl mb-3 spin inline-block">🤖</div>
          <h3 className="text-base font-bold">AI đối chứng ảnh thực địa với drone report...</h3>
          <p className="text-xs text-slate-400 mt-1">Đếm pixel xanh thực địa · So sánh NDVI · Auto tick checklist</p>
          <div className="mt-4 max-w-md mx-auto h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300" style={{ width: `${scanProgress}%` }} />
          </div>
          <p className="text-xs text-emerald-300 mt-2 font-mono">{scanProgress}%</p>
        </div>
      )}

      {/* Phase: checklist */}
      {phase === "checklist" && selectedFarmer && (
        <div className="bg-white rounded-2xl border-2 border-emerald-300 shadow-xl p-6">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">✅ Tick checklist SRP — {selectedFarmer.hoTen}</h3>
              <p className="text-xs text-slate-500 mt-1">AI đã auto-tick các tiêu chí có thể chấm từ ảnh. KTV xác nhận hoặc sửa.</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Farming Score mới</div>
              <div className="text-3xl font-bold text-emerald-600">{newFarmingScore}<span className="text-sm">/{MAX_FARMING}</span></div>
              <div className="text-[10px] text-slate-400">Đạt {totalChecked}/{SRP_CRITERIA.length} tiêu chí</div>
            </div>
          </div>

          {/* Field photo + drone photo side by side */}
          {fieldAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">📷 Ảnh thực địa (KTV)</div>
                <img src={fieldAnalysis.previewUrl} alt="" className="w-full h-32 object-cover rounded-lg border" />
                <div className="grid grid-cols-3 gap-1 mt-2 text-[10px] text-center">
                  <div className="bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded font-bold">Xanh {fieldAnalysis.greenPct}%</div>
                  <div className="bg-cyan-100 text-cyan-700 px-1 py-0.5 rounded font-bold">NDVI {fieldAnalysis.ndvi}</div>
                  <div className="bg-amber-100 text-amber-700 px-1 py-0.5 rounded font-bold">Nâu {fieldAnalysis.brownPct}%</div>
                </div>
              </div>
              {reusedDroneReport && (
                <div className="bg-sky-50 rounded-xl p-3 border border-sky-200">
                  <div className="text-[10px] font-bold text-sky-700 uppercase mb-2">🚁 Ảnh drone (Phi công)</div>
                  <img src={reusedDroneReport.previewUrl} alt="" className="w-full h-32 object-cover rounded-lg border" />
                  <div className="grid grid-cols-3 gap-1 mt-2 text-[10px] text-center">
                    <div className="bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded font-bold">Xanh {reusedDroneReport.greenPct}%</div>
                    <div className="bg-cyan-100 text-cyan-700 px-1 py-0.5 rounded font-bold">NDVI {reusedDroneReport.ndvi}</div>
                    <div className="bg-amber-100 text-amber-700 px-1 py-0.5 rounded font-bold">Nâu {reusedDroneReport.brownPct}%</div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2 mb-5">
            {SRP_CRITERIA.map(c => {
              const isChecked = !!checked[c.id];
              const aiAuto = ["density", "water", "disease", "fert"].includes(c.id);
              return (
                <div
                  key={c.id}
                  onClick={() => setChecked(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all select-none ${
                    isChecked ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${isChecked ? "bg-emerald-500 text-white" : "bg-white border-2 border-slate-300"}`}>
                      {isChecked ? "✓" : ""}
                    </div>
                    <div>
                      <span className={`text-sm font-semibold ${isChecked ? "text-emerald-900" : "text-slate-600"}`}>{c.label}</span>
                      {aiAuto && <span className="ml-2 text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">🤖 AI auto</span>}
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${isChecked ? "text-emerald-700" : "text-slate-400"}`}>+{c.points}đ</span>
                </div>
              );
            })}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800">
            <b>⚠️ Oracle người (LT):</b> 3 lớp bằng chứng sẽ ghi vĩnh viễn lên blockchain — drone NDVI ({reusedDroneReport ? "✓" : "✗"}) + ảnh thực địa ({fieldAnalysis ? "✓" : "✗"}) + chữ ký số 3 Cùng — không thể sửa đổi.
          </div>

          <div className="flex gap-3">
            <div onClick={() => setPhase("idle")} className="flex-1 text-center py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm cursor-pointer hover:bg-slate-50 select-none">
              Hủy
            </div>
            <div onClick={submit} className="flex-1 text-center py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer shadow-sm select-none">
              ⛓️ Ký số &amp; Ghi Blockchain
            </div>
          </div>
        </div>
      )}

      {/* Phase: done */}
      {phase === "done" && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-8 text-center fade-in">
          <div className="text-5xl mb-3">✅</div>
          <h3 className="text-lg font-bold text-emerald-800">Đã ghi blockchain thành công</h3>
          <p className="text-sm text-emerald-700 mt-1">Farming Score của {selectedFarmer?.hoTen} đã được cập nhật.</p>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4">📜 Lịch sử kiểm tra gần đây</h3>
        {myInspectionLogs.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Chưa có lần kiểm tra nào.</p>
        ) : (
          <div className="space-y-2">
            {myInspectionLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-lg">🧑‍🌾</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 font-semibold">{log.data}</p>
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

export default InspectionTab;
