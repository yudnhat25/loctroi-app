import { useRef, useState } from "react";
import {
  SRP_CRITERIA, SRP_MAX, MAX_FARMING,
  getTier, getOverallScore,
} from "../lib/scoring";
import { analyzeDroneImage, aiSuggestChecklist } from "../lib/imageAnalysis";
import { isGeminiConfigured } from "../lib/geminiClient";

// Aggregate kết quả AI từ N ảnh (drone + field) — AND nghiêm cho SRP, avg cho metric
const aggregateAnalyses = (analyses) => {
  const valid = analyses.filter(a => a && !a.error);
  if (valid.length === 0) return null;
  const avg = (key) => Math.round(valid.reduce((s, a) => s + (a[key] || 0), 0) / valid.length);
  const allDiseases = [...new Set(valid.flatMap(a => a.diseases || []))];
  const allRecs = [...new Set(valid.flatMap(a => a.recommendations || []))];
  const srpKeys = ["density", "seed", "fert", "pesticide", "water", "disease", "withdrawal", "ppe"];
  const aggSrp = {};
  srpKeys.forEach(k => {
    aggSrp[k] = valid.every(a => a.srpCompliance?.[k] === true);
  });
  return {
    greenPct: avg("greenPct"), brownPct: avg("brownPct"), waterPct: avg("waterPct"), ndvi: avg("ndvi"),
    diseases: allDiseases, recommendations: allRecs, srpCompliance: aggSrp, count: valid.length,
  };
};

// 3 Cùng: xem TẤT CẢ drone reports + upload nhiều ảnh thực địa → AI tổng hợp tự tick SRP
const InspectionTab = ({ staff, farmers, droneReports, blockchainLog, onInspect }) => {
  const fileInputRef = useRef(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle | review | analyzing | checklist | done
  const [checked, setChecked] = useState({});
  const [fieldAnalyses, setFieldAnalyses] = useState([]);  // mảng — multiple field photos
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState("");
  const [farmerDroneReports, setFarmerDroneReports] = useState([]);

  const startInspection = (farmer) => {
    setSelectedFarmer(farmer);
    setChecked({});
    setFieldAnalyses([]);
    setScanProgress(0);
    setScanMessage("");
    // Lấy TẤT CẢ drone reports của farmer này (có thể có 3 từ auto-pilot)
    const reports = droneReports.filter(r => r.farmerId === farmer.id);
    setFarmerDroneReports(reports);
    setPhase("review");
  };

  const goUploadField = () => fileInputRef.current?.click();

  // Upload nhiều ảnh thực địa cùng lúc — AI phân tích từng ảnh, tổng hợp
  const onFiles = async (files) => {
    if (!files?.length) return;
    setPhase("analyzing");
    setScanProgress(0);
    setScanMessage(`Chuẩn bị phân tích ${files.length} ảnh thực địa...`);

    const results = [...fieldAnalyses];  // giữ lại các ảnh trước nếu có
    const startIdx = results.length;

    for (let i = 0; i < files.length; i++) {
      setScanMessage(`Gemini phân tích ảnh thực địa ${i + 1}/${files.length} — ${files[i].name}`);
      try {
        const result = await analyzeDroneImage(files[i], "field");
        results.push(result);
      } catch (err) {
        results.push({ error: err.message, fileName: files[i].name, previewUrl: URL.createObjectURL(files[i]), greenPct: 0, brownPct: 0, waterPct: 0, ndvi: 0, qualityNote: "Phân tích thất bại", diseases: [], recommendations: [], srpCompliance: {} });
      }
      setFieldAnalyses([...results]);
      setScanProgress(((i + 1) / files.length) * 100);
    }

    // Tổng hợp drone reports + tất cả field photos để auto-tick SRP
    const allAnalyses = [...farmerDroneReports, ...results];
    const aggregated = aggregateAnalyses(allAnalyses);
    if (aggregated) {
      setChecked(aiSuggestChecklist(aggregated));
    }

    setScanMessage(`✅ Đã phân tích ${results.length} ảnh thực địa + ${farmerDroneReports.length} ảnh drone — tổng hợp xong`);
    setPhase("checklist");
  };

  const totalChecked = Object.values(checked).filter(Boolean).length;
  const earnedPoints = SRP_CRITERIA.filter(c => checked[c.id]).reduce((s, c) => s + c.points, 0);
  const newFarmingScore = Math.round((earnedPoints / SRP_MAX) * MAX_FARMING);

  const submit = () => {
    const allAnalyses = [...farmerDroneReports, ...fieldAnalyses];
    const aggregated = aggregateAnalyses(allAnalyses);
    onInspect({
      farmer: selectedFarmer,
      checked,
      newFarmingScore,
      droneReportHash: farmerDroneReports.map(r => r.fileHash).join(","),
      fieldImageHash: fieldAnalyses.map(a => a.fileHash || "").join(","),
      operator: staff,
      analysis: aggregated,
      droneCount: farmerDroneReports.length,
      fieldCount: fieldAnalyses.length,
    });
    setPhase("done");
    setTimeout(() => {
      setPhase("idle");
      setSelectedFarmer(null);
      setFieldAnalyses([]);
      setFarmerDroneReports([]);
    }, 2000);
  };

  const myInspectionLogs = blockchainLog.filter(l => l.action === "FIELD_INSPECTION").slice(0, 5);
  const totalDroneReports = droneReports.length;

  return (
    <div className="space-y-6 fade-in pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 text-white">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-brand-700" />
        <div className="px-7 pt-7 pb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">Đội 3 Cùng</div>
              <h2 className="text-[28px] font-display font-semibold tracking-tight mt-1.5 leading-tight">Kiểm tra SRP thực địa</h2>
              <p className="text-[14px] text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Sau khi drone bay phát hiện vấn đề, xuống đồng kiểm tra trực tiếp, chụp ảnh thực địa, Gemini AI tự chấm
                checklist SRP, KTV xác nhận hoặc sửa, ký số ghi blockchain. Ba lớp bằng chứng (drone + ảnh thực địa + chữ ký số)
                đảm bảo không thể giả mạo.
              </p>
            </div>
            {isGeminiConfigured() && (
              <span className="inline-flex items-center gap-1.5 bg-white/5 text-brand-300 text-[11px] font-semibold tracking-[0.12em] px-2.5 py-1.5 rounded-md ring-1 ring-white/10 uppercase shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
                Gemini 2.5 Flash
              </span>
            )}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-px bg-white/10 rounded-xl overflow-hidden">
            <Stat label="Báo cáo drone đang chờ" value={totalDroneReports} />
            <Stat label="Lần đã ghi chain" value={blockchainLog.filter(l => l.action === "FIELD_INSPECTION").length} />
            <Stat label="Tiêu chí SRP áp dụng" value={`${SRP_CRITERIA.length}/41`} />
          </div>
        </div>
      </section>

      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => onFiles(Array.from(e.target.files || []))} />

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
            const fReports = droneReports.filter(r => r.farmerId === f.id);
            return (
              <div key={f.id} className="border border-slate-200 rounded-xl p-3 hover:border-emerald-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm text-gray-900">{f.hoTen}</p>
                    <p className="text-[11px] font-mono text-slate-500">{f.digitalId ?? f.id}</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${tier.badge}`}>Tier {tier.code}</span>
                </div>
                <div className="text-[12px] text-slate-600 mb-2">{f.htx} · {f.dienTich} ha</div>

                {fReports.length > 0 && (
                  <div className="bg-sky-50 border border-sky-200 rounded-lg p-2 mb-2 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {fReports.slice(0, 3).map((r, i) => (
                        <img key={i} src={r.previewUrl} alt="drone" className="w-9 h-9 rounded-full object-cover border-2 border-white" />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-sky-800">🚁 {fReports.length} báo cáo drone đang chờ kiểm tra</div>
                      <div className="text-[10px] text-sky-600">Click để xem chi tiết & xuống đồng</div>
                    </div>
                  </div>
                )}

                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Farming Score</span>
                    <span className="font-bold text-emerald-700">{fs}/{MAX_FARMING}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${fsPct}%` }} />
                  </div>
                </div>

                <div
                  onClick={() => phase === "idle" && startInspection(f)}
                  className={`text-[12px] font-bold rounded-lg py-2 text-center cursor-pointer transition-colors select-none ${
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

      {/* Phase: review drone report — hiển thị TẤT CẢ drone reports */}
      {phase === "review" && selectedFarmer && (
        <div className="bg-white rounded-2xl border-2 border-emerald-300 shadow-xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-lg font-bold text-gray-900">📋 Báo cáo drone của {selectedFarmer.hoTen} ({farmerDroneReports.length})</h3>
              <p className="text-xs text-slate-500 mt-1">
                Drone đã bay trước. Xem các vùng có vấn đề → xuống đồng chụp ảnh thực địa bổ sung → AI tổng hợp.
              </p>
            </div>
            <div onClick={() => { setPhase("idle"); setSelectedFarmer(null); }} className="text-slate-400 hover:text-slate-700 cursor-pointer text-xl">✕</div>
          </div>

          {farmerDroneReports.length > 0 ? (
            <>
              {/* Aggregate summary từ drone reports */}
              {farmerDroneReports.length > 1 && (() => {
                const agg = aggregateAnalyses(farmerDroneReports);
                if (!agg) return null;
                return (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-3">
                    <div className="text-xs font-bold text-purple-900 mb-2">📊 Tổng hợp {agg.count} ảnh drone (AND nghiêm cho SRP)</div>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      <Metric label="🌱 Xanh TB" value={`${agg.greenPct}%`} color="emerald" />
                      <Metric label="📡 NDVI TB" value={`${agg.ndvi}%`} color="cyan" />
                      <Metric label="🍂 Nâu TB" value={`${agg.brownPct}%`} color="amber" />
                      <Metric label="💧 Nước TB" value={`${agg.waterPct}%`} color="blue" />
                    </div>
                    {agg.diseases.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {agg.diseases.map((d, i) => <span key={i} className="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{d}</span>)}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {farmerDroneReports.map((r, i) => (
                  <div key={i} className="border border-sky-200 rounded-xl overflow-hidden bg-sky-50/30">
                    <img src={r.previewUrl} alt="" className="w-full h-28 object-cover" />
                    <div className="p-2.5 space-y-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold">🚁 Drone #{i + 1}</span>
                        {r.growthStage && r.growthStage !== "không xác định" && (
                          <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold">{r.growthStage}</span>
                        )}
                      </div>
                      <p className="text-[12px] font-semibold text-gray-800 line-clamp-2">{r.qualityNote}</p>
                      <div className="grid grid-cols-3 gap-1 text-[10px] text-center">
                        <div className="bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded font-bold">Xanh {r.greenPct}%</div>
                        <div className="bg-amber-100 text-amber-700 px-1 py-0.5 rounded font-bold">Nâu {r.brownPct}%</div>
                        <div className="bg-cyan-100 text-cyan-700 px-1 py-0.5 rounded font-bold">NDVI {r.ndvi}</div>
                      </div>
                      {r.diseases?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {r.diseases.slice(0, 3).map((d, di) => <span key={di} className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{d}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              ⚠️ <b>Chưa có báo cáo drone</b> cho ruộng này. Bạn vẫn có thể kiểm tra thực địa, nhưng sẽ thiếu 1 trong 3 lớp bằng chứng.
            </div>
          )}

          <div className="flex gap-3">
            <div onClick={() => { setPhase("idle"); setSelectedFarmer(null); }} className="flex-1 text-center py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm cursor-pointer hover:bg-slate-50 select-none">
              Quay lại
            </div>
            <div onClick={goUploadField} className="flex-[2] text-center py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer shadow-sm select-none">
              📷 Upload ảnh thực địa (chọn nhiều) → AI tổng hợp tự tick SRP
            </div>
          </div>
        </div>
      )}

      {/* Phase: analyzing */}
      {phase === "analyzing" && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl spin inline-block">{isGeminiConfigured() ? "✨" : "🤖"}</div>
            <div className="flex-1">
              <h3 className="text-sm font-bold">{isGeminiConfigured() ? "Gemini 2.5 Flash" : "AI Computer Vision"} — phân tích batch ảnh thực địa</h3>
              <p className="text-xs text-slate-400">{scanMessage}</p>
            </div>
            <div className="text-xl font-mono font-bold text-emerald-300">{Math.round(scanProgress)}%</div>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300" style={{ width: `${scanProgress}%` }} />
          </div>
          {fieldAnalyses.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">
              {fieldAnalyses.map((a, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-slate-700">
                  <img src={a.previewUrl} alt="" className="w-full h-12 object-cover" />
                </div>
              ))}
            </div>
          )}
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
              <div className="text-[11px] text-slate-500 font-bold uppercase">Farming Score mới</div>
              <div className="text-3xl font-bold text-emerald-600">{newFarmingScore}<span className="text-sm">/{MAX_FARMING}</span></div>
              <div className="text-[11px] text-slate-400">Đạt {totalChecked}/{SRP_CRITERIA.length} tiêu chí</div>
            </div>
          </div>

          {/* Tổng hợp tất cả ảnh: drone + thực địa */}
          {(() => {
            const all = [...farmerDroneReports, ...fieldAnalyses];
            const agg = aggregateAnalyses(all);
            if (!agg) return null;
            return (
              <>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-3 mb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <div className="text-xs font-bold text-purple-900">📊 AI tổng hợp {agg.count} ảnh</div>
                    <div className="text-[11px] text-purple-700">
                      🚁 {farmerDroneReports.length} drone + 📷 {fieldAnalyses.length} thực địa
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <Metric label="🌱 Xanh TB" value={`${agg.greenPct}%`} color="emerald" />
                    <Metric label="📡 NDVI TB" value={`${agg.ndvi}%`} color="cyan" />
                    <Metric label="🍂 Nâu TB" value={`${agg.brownPct}%`} color="amber" />
                    <Metric label="💧 Nước TB" value={`${agg.waterPct}%`} color="blue" />
                  </div>
                  {agg.diseases.length > 0 && (
                    <div className="bg-white rounded-lg p-2 border border-rose-200 mb-2">
                      <div className="text-[11px] font-bold text-rose-800 uppercase mb-1">🦠 Sâu bệnh từ tất cả ảnh ({agg.diseases.length})</div>
                      <div className="flex flex-wrap gap-1">
                        {agg.diseases.map((d, i) => <span key={i} className="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{d}</span>)}
                      </div>
                    </div>
                  )}
                  {agg.recommendations.length > 0 && (
                    <div className="bg-white rounded-lg p-2 border border-amber-200">
                      <div className="text-[11px] font-bold text-amber-800 uppercase mb-1">💡 Khuyến nghị tổng hợp</div>
                      <ul className="space-y-0.5 text-[12px] text-amber-900">
                        {agg.recommendations.map((r, i) => <li key={i} className="flex gap-1.5"><span className="text-amber-600">▸</span><span>{r}</span></li>)}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Thumbnails grid + add more button */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                  {farmerDroneReports.map((r, i) => (
                    <div key={`d-${i}`} className="rounded-lg overflow-hidden border-2 border-sky-200 relative">
                      <img src={r.previewUrl} alt="" className="w-full h-16 object-cover" />
                      <span className="absolute top-1 left-1 bg-sky-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">🚁</span>
                    </div>
                  ))}
                  {fieldAnalyses.map((a, i) => (
                    <div key={`f-${i}`} className="rounded-lg overflow-hidden border-2 border-emerald-200 relative">
                      <img src={a.previewUrl} alt="" className="w-full h-16 object-cover" />
                      <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">📷</span>
                    </div>
                  ))}
                  <div onClick={goUploadField} className="rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-400 hover:bg-emerald-50 transition-colors cursor-pointer flex items-center justify-center text-2xl text-slate-400 h-16 select-none">
                    +
                  </div>
                </div>
              </>
            );
          })()}

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
                      {aiAuto && <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">🤖 AI auto</span>}
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${isChecked ? "text-emerald-700" : "text-slate-400"}`}>+{c.points}đ</span>
                </div>
              );
            })}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800">
            <b>⚠️ Oracle người (LT):</b> 3 lớp bằng chứng sẽ ghi vĩnh viễn lên blockchain — drone ({farmerDroneReports.length > 0 ? `✓ ${farmerDroneReports.length} ảnh` : "✗"}) + ảnh thực địa ({fieldAnalyses.length > 0 ? `✓ ${fieldAnalyses.length} ảnh` : "✗"}) + chữ ký số 3 Cùng — không thể sửa đổi.
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
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">#{log.hash} · {new Date(log.timestamp).toLocaleString("vi-VN")}</p>
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
  <div className="bg-slate-900 px-4 py-3.5">
    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
    <div className="font-display text-[28px] font-semibold tabular leading-none mt-2.5 text-white">{value}</div>
    {sub && <div className="text-[12px] text-slate-500 mt-1.5">{sub}</div>}
  </div>
);
const Metric = ({ label, value, color }) => {
  const map = { emerald: "bg-emerald-50 border-emerald-200 text-emerald-700", cyan: "bg-cyan-50 border-cyan-200 text-cyan-700", amber: "bg-amber-50 border-amber-200 text-amber-700", blue: "bg-blue-50 border-blue-200 text-blue-700" };
  return (
    <div className={`rounded-xl p-3 border-2 ${map[color]}`}>
      <div className="text-[11px] font-bold uppercase opacity-80">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
};

export default InspectionTab;
