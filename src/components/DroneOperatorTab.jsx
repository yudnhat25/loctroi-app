import { useState } from "react";
import { analyzeDroneImage } from "../lib/imageAnalysis";
import { isGeminiConfigured } from "../lib/geminiClient";
import { pickLowCreditFarmer, pickAutoPhotos, fetchAsFile, sleep } from "../lib/anhluaPicker";
import UavScanScene from "./UavScanScene";

const DroneOperatorTab = ({ staff, farmers, droneReports, onSubmitDroneReport, blockchainLog }) => {
  const [selectedFarmer, setSelectedFarmer] = useState(farmers[0] ?? null);

  // Auto-pilot state
  const [autoSimRunning, setAutoSimRunning] = useState(false);
  const [autoSimFarmer, setAutoSimFarmer] = useState(null);
  const [autoSimProgress, setAutoSimProgress] = useState(0);
  const [autoSimMessage, setAutoSimMessage] = useState("");
  const [autoSimCurrentIdx, setAutoSimCurrentIdx] = useState(0);
  const [autoSimResults, setAutoSimResults] = useState(null); // 3 reports sau khi xong

  const myReports = droneReports.filter(r => r.operatorId === staff.id);
  const totalAnh = myReports.length;
  const totalHa = myReports.reduce((s, r) => s + (r.farmerArea ?? 0), 0);

  // ─── AUTO-PILOT MISSION ────────────────────────────────────────────────────
  // Bay đến farmer đã chọn ở grid trên → fetch 3 ảnh từ /anhlua (mix hư/chín
  // theo credit của farmer) → Gemini phân tích từng ảnh → submit DRONE_REPORT
  const startAutoPilot = async () => {
    // Dùng farmer user đã chọn ở grid bên trên. Fallback pick hộ điểm thấp
    // chỉ khi user chưa chọn ai (case gần như không bao giờ vì default là farmers[0]).
    const target = selectedFarmer ?? pickLowCreditFarmer(farmers, droneReports);
    if (!target) return;

    const photos = pickAutoPhotos(target);
    setAutoSimFarmer(target);
    setAutoSimRunning(true);
    setAutoSimProgress(0);
    setAutoSimCurrentIdx(0);
    setAutoSimResults(null);
    setAutoSimMessage(`Drone DJI Agras T40 cất cánh — bay đến ruộng ${target.hoTen} (${target.dienTich}ha)...`);

    await sleep(1500);

    const reports = [];
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      setAutoSimCurrentIdx(i + 1);

      // Quét ô lưới (mỗi ảnh ~25-30% progress)
      const startP = (i / photos.length) * 100;
      const endP = ((i + 1) / photos.length) * 100;

      setAutoSimMessage(`Quét ô ${i + 1}/${photos.length} — chụp ảnh đa phổ vùng ${photo.kind}...`);
      // Animate progress qua segment
      const steps = 8;
      for (let s = 0; s < steps; s++) {
        await sleep(180);
        setAutoSimProgress(startP + ((endP - startP) * (s + 1)) / steps * 0.6);
      }

      setAutoSimMessage(`Gemini AI đang phân tích ảnh ${i + 1}...`);
      try {
        const file = await fetchAsFile(photo.url);
        const analysis = await analyzeDroneImage(file, "drone");
        reports.push({ ...analysis, _kindHint: photo.kind, _photoUrl: photo.url });
      } catch (err) {
        console.error(`[AutoPilot] Ảnh ${i + 1} fail:`, err);
        reports.push({ error: err.message, _kindHint: photo.kind, _photoUrl: photo.url, qualityNote: "Phân tích thất bại", greenPct: 0, brownPct: 0, waterPct: 0, ndvi: 0, diseases: [], recommendations: [], srpCompliance: {} });
      }
      setAutoSimProgress(endP);
    }

    setAutoSimMessage(`Hoàn tất — đang ký số và ghi ${reports.length} báo cáo lên blockchain...`);
    await sleep(1200);

    // Submit từng báo cáo lên chain
    for (const r of reports) {
      if (r.error) continue;
      onSubmitDroneReport({
        farmerId: target.id,
        farmerName: target.hoTen,
        farmerArea: target.dienTich,
        operatorId: staff.id,
        operatorName: staff.hoTen,
        ...r,
        timestamp: new Date().toISOString(),
      });
    }

    setAutoSimMessage(`✅ Đã gửi ${reports.filter(r => !r.error).length} báo cáo cho 3 Cùng đánh giá thực địa.`);
    await sleep(1500);

    // Đóng simulation, hiện results panel
    setAutoSimRunning(false);
    setAutoSimResults({ farmer: target, reports });
  };


  return (
    <div className="space-y-5 sm:space-y-6 fade-in pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 text-white">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-sky-700" />
        <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-5 sm:pb-6">
          <div className="flex items-start justify-between gap-3 sm:gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">Phi công drone</div>
              <h2 className="text-[20px] sm:text-[28px] font-display font-semibold tracking-tight mt-1.5 leading-tight">
                DJI Agras T40 · Gemini Vision
              </h2>
              <p className="text-[13px] sm:text-[14px] text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Auto-pilot: drone bay đến hộ điểm thấp, chụp 3 ảnh đa phổ, Gemini AI phân tích từng ảnh.
              </p>
            </div>
            {isGeminiConfigured() && (
              <span className="inline-flex items-center gap-1.5 bg-white/5 text-sky-300 text-[10px] sm:text-[11px] font-semibold tracking-[0.12em] px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md ring-1 ring-white/10 uppercase shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                Gemini 2.5
              </span>
            )}
          </div>
          <div className="mt-5 sm:mt-6 grid grid-cols-3 gap-px bg-white/10 rounded-xl overflow-hidden">
            <Stat label="Tổng ảnh" value={totalAnh} />
            <Stat label="DT đã quét" value={`${totalHa.toFixed(1)} ha`} />
            <Stat label="Drone" value="DJI T40" sub="Đa phổ và RGB" />
          </div>
        </div>
      </section>

      {/* FARMER SELECTOR — dùng chung cho auto + manual */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-gray-800">📍 Chọn ruộng cần bay drone</h3>
            <p className="text-[12px] text-slate-500 mt-0.5">Lựa chọn này áp dụng cho Auto-pilot bên dưới.</p>
          </div>
          {selectedFarmer && (
            <div className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full font-bold">
              ✓ Đã chọn: {selectedFarmer.hoTen} · {selectedFarmer.dienTich}ha
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-4 max-h-72 overflow-y-auto">
          {farmers.map(f => (
            <div
              key={f.id}
              onClick={() => setSelectedFarmer(f)}
              className={`border rounded-xl p-3 cursor-pointer transition-all select-none ${selectedFarmer?.id === f.id ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300" : "border-slate-200 hover:border-slate-300 bg-white"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-sm text-gray-900">{f.hoTen}</div>
                {selectedFarmer?.id === f.id && <span className="text-emerald-600">✓</span>}
              </div>
              <div className="text-[12px] text-slate-500">{f.htx} · {f.dienTich} ha</div>
              <div className="text-[11px] font-mono text-slate-400 mt-1">{f.digitalId ?? f.id}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AUTO-PILOT — primary CTA */}
      <div className="bg-gradient-to-br from-emerald-50 via-emerald-50 to-cyan-50 rounded-2xl border-2 border-emerald-300 shadow-md p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🛰️</div>
            <div>
              <h3 className="text-base font-bold text-emerald-900">Auto-pilot Mission — Bay tự động + AI đánh giá</h3>
              <p className="text-xs text-emerald-700 mt-1">
                Drone bay theo S-pattern qua ruộng <b>{selectedFarmer?.hoTen ?? "—"}</b>
                {selectedFarmer && <> ({selectedFarmer.dienTich}ha · {selectedFarmer.htx})</>} → chụp 3 ảnh đa phổ →
                Gemini phân tích → báo cáo gửi 3 Cùng kiểm tra thực địa.
              </p>
              <p className="text-[12px] text-emerald-600 mt-1.5">
                Tỷ lệ ảnh hư:chín theo Tier — <b>A:</b> 0:3 · <b>B:</b> 1:2 · <b>C:</b> 2:1 · <b>D:</b> 3:0
              </p>
            </div>
          </div>
          <div
            onClick={autoSimRunning || !selectedFarmer ? undefined : startAutoPilot}
            className={`shrink-0 select-none text-center px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
              autoSimRunning ? "bg-slate-300 text-slate-500 cursor-wait" :
              !selectedFarmer ? "bg-slate-300 text-slate-500 cursor-not-allowed" :
              "bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg cursor-pointer"
            }`}
          >
            {autoSimRunning ? "🚁 Đang bay..." : selectedFarmer ? `🚁 Bay đến ruộng ${selectedFarmer.hoTen}` : "Chọn hộ trước"}
          </div>
        </div>
      </div>

      {/* RESULTS panel sau khi auto-pilot xong */}
      {autoSimResults && (
        <div className="bg-white rounded-2xl border-2 border-emerald-300 shadow-md overflow-hidden">
          <div className="px-5 py-4 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-emerald-900">📦 3 báo cáo đã gửi 3 Cùng đánh giá</h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Hộ <b>{autoSimResults.farmer.hoTen}</b> · {autoSimResults.farmer.htx} · {autoSimResults.farmer.dienTich}ha
                · Overall {(autoSimResults.farmer.creditScore || 0) + (autoSimResults.farmer.farmingScore || 0)}/1000
              </p>
            </div>
            <div onClick={() => setAutoSimResults(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer text-xl">✕</div>
          </div>
          
          <div className="p-5 pb-0">
            <AggregateSummary analyses={autoSimResults.reports} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
            {autoSimResults.reports.map((r, i) => (
              <div key={i} className={`border-2 rounded-xl overflow-hidden ${r.error ? "border-red-200 bg-red-50" : r.brownPct > 30 || (r.diseases && r.diseases.length > 0) ? "border-rose-300" : "border-emerald-200"}`}>
                <img src={r._photoUrl} alt="" className="w-full h-32 object-cover" />
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${r._kindHint === "hư" ? "bg-rose-100 text-rose-800 border-rose-200" : "bg-emerald-100 text-emerald-800 border-emerald-200"}`}>
                      {r._kindHint === "hư" ? "🦠 Vùng hư" : "🌾 Vùng chín"}
                    </span>
                    {r.growthStage && r.growthStage !== "không xác định" && (
                      <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">{r.growthStage}</span>
                    )}
                  </div>
                  {r.error ? (
                    <p className="text-xs text-red-700">⚠️ {r.error.substring(0, 80)}</p>
                  ) : (
                    <>
                      <p className="text-xs font-semibold text-gray-800">{r.qualityNote}</p>
                      <div className="grid grid-cols-3 gap-1 text-[11px] text-center">
                        <div className="bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded font-bold">Xanh {r.greenPct}%</div>
                        <div className="bg-amber-100 text-amber-700 px-1 py-0.5 rounded font-bold">Nâu {r.brownPct}%</div>
                        <div className="bg-cyan-100 text-cyan-700 px-1 py-0.5 rounded font-bold">NDVI {r.ndvi}</div>
                      </div>
                      {r.diseases && r.diseases.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {r.diseases.map((d, di) => (
                            <span key={di} className="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{d}</span>
                          ))}
                        </div>
                      )}
                      {r.recommendations?.length > 0 && (
                        <ul className="text-[11px] text-amber-800 mt-1 space-y-0.5 bg-amber-50 rounded p-1.5 border border-amber-100">
                          {r.recommendations.slice(0, 2).map((rec, ri) => (
                            <li key={ri} className="flex gap-1">
                              <span className="text-amber-500">▸</span><span className="line-clamp-2">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
            💡 3 Cùng sẽ thấy 3 báo cáo này khi mở tab <b>Kiểm tra SRP</b> — dùng làm input để xuống đồng xác minh.
          </div>
        </div>
      )}

      {/* UAV simulation overlay */}
      {autoSimRunning && (
        <UavScanScene
          farmer={autoSimFarmer}
          progress={autoSimProgress}
          message={autoSimMessage}
          currentPhotoIdx={autoSimCurrentIdx}
          totalPhotos={3}
        />
      )}

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
                  <div className="flex flex-wrap gap-2 text-[11px] mt-1">
                    <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Xanh {r.greenPct}%</span>
                    <span className="bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded font-bold">NDVI {r.ndvi}</span>
                    <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">Nâu {r.brownPct}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">#{r.fileHash} · {new Date(r.timestamp).toLocaleString("vi-VN")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const LABEL_SRP = {
  density: "Mật độ sạ",
  seed: "Giống thuần",
  fert: "Bón phân",
  pesticide: "Thuốc BVTV",
  water: "Quản lý nước",
  disease: "Phòng bệnh",
  withdrawal: "Cách ly thuốc",
  ppe: "An toàn LĐ",
};

// Tổng hợp avg metrics + union diseases + recommendations từ N ảnh
const AggregateSummary = ({ analyses }) => {
  const valid = analyses.filter(a => !a.error);
  if (valid.length === 0) return null;
  const avg = (key) => Math.round(valid.reduce((s, a) => s + (a[key] || 0), 0) / valid.length);
  const allDiseases = [...new Set(valid.flatMap(a => a.diseases || []))];
  const allRecs = [...new Set(valid.flatMap(a => a.recommendations || []))];

  // SRP compliance: AND tất cả ảnh (chuẩn nghiêm — chỉ pass nếu MỌI ảnh đều ok)
  const srpKeys = ["density", "seed", "fert", "pesticide", "water", "disease", "withdrawal", "ppe"];
  const aggSrp = {};
  srpKeys.forEach(k => {
    aggSrp[k] = valid.every(a => a.srpCompliance?.[k] === true);
  });

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-sm font-bold text-purple-900">📊 Tổng hợp {valid.length} ảnh</h3>
        <span className="text-[11px] text-purple-700 italic">Trung bình + chuẩn AND nghiêm cho SRP</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <Metric label="🌱 Phủ xanh TB" value={`${avg("greenPct")}%`} color="emerald" />
        <Metric label="📡 NDVI TB" value={`${avg("ndvi")}%`} color="cyan" />
        <Metric label="🍂 Nâu/úa TB" value={`${avg("brownPct")}%`} color="amber" />
        <Metric label="💧 Nước TB" value={`${avg("waterPct")}%`} color="blue" />
      </div>

      {allDiseases.length > 0 && (
        <div className="bg-white rounded-xl p-3 mb-2 border border-rose-200">
          <div className="text-[11px] font-bold text-rose-800 uppercase mb-1">🦠 Tổng sâu bệnh phát hiện ({allDiseases.length})</div>
          <div className="flex flex-wrap gap-1.5">
            {allDiseases.map((d, i) => <span key={i} className="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{d}</span>)}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-3 mb-2 border border-emerald-200">
        <div className="text-[11px] font-bold text-emerald-800 uppercase mb-2">✅ SRP — pass khi MỌI ảnh đều đạt</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
          {srpKeys.map(k => (
            <div key={k} className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded ${aggSrp[k] ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
              <span>{aggSrp[k] ? "✓" : "✗"}</span>
              <span className="font-semibold">{LABEL_SRP[k]}</span>
            </div>
          ))}
        </div>
      </div>

      {allRecs.length > 0 && (
        <div className="bg-white rounded-xl p-3 border border-amber-200">
          <div className="text-[11px] font-bold text-amber-800 uppercase mb-1">💡 Khuyến nghị tổng hợp</div>
          <ul className="space-y-0.5 text-xs text-amber-900">
            {allRecs.map((r, i) => <li key={i} className="flex gap-1.5"><span className="text-amber-600">▸</span><span>{r}</span></li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

// Card cho từng ảnh
const AnalysisCard = ({ analysis, index }) => {
  const a = analysis;
  const hasError = !!a.error;
  return (
    <div className={`border-2 rounded-xl overflow-hidden ${a.quotaExhausted ? "border-amber-300 bg-amber-50" : hasError ? "border-red-200 bg-red-50" : a.diseases?.length > 0 || a.brownPct > 30 ? "border-rose-300" : "border-emerald-200 bg-emerald-50/30"}`}>
      <img src={a.previewUrl} alt={`Ảnh ${index + 1}`} className="w-full h-32 object-cover" />
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-600">Ảnh #{index + 1}</span>
          {a.source === "gemini" && <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold">✨ Gemini</span>}
          {a.source === "gemini-cached" && <span className="text-[10px] bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-bold" title="Đã có sẵn từ phân tích trước, không tốn quota">💾 Cached</span>}
          {a.source === "canvas-fallback" && a.quotaExhausted && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">⏳ Quota hết</span>}
          {a.source === "canvas-fallback" && !a.quotaExhausted && <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">🔄 Canvas</span>}
          {a.growthStage && a.growthStage !== "không xác định" && <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold">🌾 {a.growthStage}</span>}
        </div>
        {a.quotaExhausted ? (
          <div className="bg-white rounded-lg p-2 border border-amber-300 text-[12px] text-amber-900">
            <div className="font-bold mb-1">⏳ Hết quota Gemini free tier</div>
            <p className="text-[11px] mb-1">Đã chuyển sang phân tích pixel canvas (kém chính xác hơn).</p>
            {a.retryAfter && <p className="text-[11px]">Thử lại sau <b>{a.retryAfter}s</b></p>}
            <p className="text-[11px] mt-1">→ Đổi <code>VITE_GEMINI_MODEL</code> trong .env.local sang <code>gemini-2.5-flash-lite</code> nếu chưa.</p>
          </div>
        ) : hasError ? (
          <p className="text-xs text-red-700 break-all">⚠️ {a.error.substring(0, 80)}</p>
        ) : (
          <>
            <p className="text-xs font-semibold text-gray-800 line-clamp-2">{a.qualityNote}</p>
            <div className="grid grid-cols-3 gap-1 text-[11px] text-center">
              <div className="bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded font-bold">Xanh {a.greenPct}%</div>
              <div className="bg-amber-100 text-amber-700 px-1 py-0.5 rounded font-bold">Nâu {a.brownPct}%</div>
              <div className="bg-cyan-100 text-cyan-700 px-1 py-0.5 rounded font-bold">NDVI {a.ndvi}</div>
            </div>
            {a.diseases?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {a.diseases.map((d, i) => <span key={i} className="bg-rose-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full">{d}</span>)}
              </div>
            )}
            {a.recommendations?.length > 0 && (
              <ul className="text-[11px] text-amber-800 mt-1 space-y-0.5 bg-amber-50 rounded p-1.5 border border-amber-100">
                {a.recommendations.slice(0, 2).map((rec, ri) => (
                  <li key={ri} className="flex gap-1">
                    <span className="text-amber-500">▸</span><span className="line-clamp-2">{rec}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        <p className="text-[10px] text-slate-400 font-mono truncate">{a.fileName}</p>
      </div>
    </div>
  );
};

const Stat = ({ label, value, sub }) => (
  <div className="bg-slate-900 px-3 sm:px-4 py-3 sm:py-3.5">
    <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
    <div className="font-display text-[20px] sm:text-[28px] font-semibold tabular leading-none mt-2 sm:mt-2.5 text-white break-words">{value}</div>
    {sub && <div className="text-[11px] sm:text-[12px] text-slate-500 mt-1 sm:mt-1.5">{sub}</div>}
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

export default DroneOperatorTab;
