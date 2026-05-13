// Phân tích ảnh: ưu tiên Gemini (AI thật), fallback canvas pixel-counting
// nếu Gemini không khả dụng (network fail / quota / không có API key).
// Có cache in-memory theo file name+size — re-upload cùng ảnh không tốn API call.

import { MAX_FARMING, SRP_CRITERIA, SRP_MAX } from "./scoring";
import { analyzeImageWithGemini, isGeminiConfigured } from "./geminiClient";

// Cache: key = "fileName|fileSize|context" → analysis result.
// In-memory (reload trang là mất). Đủ để tiết kiệm quota lúc dev/demo.
const analysisCache = new Map();
const cacheKey = (file, context) => `${file.name}|${file.size}|${context}`;

const sha8 = (str) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
};

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => resolve(e.target.result);
  reader.onerror = () => reject(new Error("Không đọc được file"));
  reader.readAsDataURL(file);
});

// ─── Fallback: phân tích pixel bằng canvas (chạy local, không cần network) ─
const analyzeWithCanvas = async (file) => {
  const dataUrl = await fileToDataUrl(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const W = 200, H = 200;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, W, H);
      const { data } = ctx.getImageData(0, 0, W, H);

      let green = 0, brown = 0, water = 0, total = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        total++;
        if (g > r + 8 && g > b + 8 && g > 60) green++;
        else if (r > g && r > b && r > 80 && Math.abs(g - b) < 30) brown++;
        else if (b > r + 10 && b > g + 5 && b > 70) water++;
      }

      const greenPct = Math.round((green / total) * 100);
      const brownPct = Math.round((brown / total) * 100);
      const waterPct = Math.round((water / total) * 100);
      const ndvi = Math.min(85, Math.round(greenPct * 0.85 + 5));

      let qualityNote = "Tốt";
      if (brownPct > 25) qualityNote = "Có dấu hiệu sâu bệnh / vùng khô";
      else if (waterPct > 35) qualityNote = "Nguy cơ úng — quản lý nước kém";
      else if (greenPct < 35) qualityNote = "Phủ xanh thấp — sạ thưa hoặc cây yếu";
      else if (greenPct >= 70) qualityNote = "Sinh trưởng xuất sắc";

      resolve({
        greenPct, brownPct, waterPct, ndvi, qualityNote,
        diseases: [],
        srpCompliance: {
          density: greenPct >= 50,
          seed: true,
          fert: greenPct >= 55,
          pesticide: brownPct < 30,
          water: waterPct < 25,
          disease: brownPct < 20,
          withdrawal: true,
          ppe: true,
        },
        recommendations: [],
      });
    };
    img.onerror = () => reject(new Error("Ảnh không hợp lệ"));
    img.src = dataUrl;
  });
};

// Detect 429 quota error → tách msg ngắn gọn cho UI
const parseQuotaError = (errMsg) => {
  if (!errMsg?.includes("429") && !errMsg?.includes("RESOURCE_EXHAUSTED")) return null;
  const retryMatch = errMsg.match(/retry in (\d+)/i) || errMsg.match(/(\d+)s/);
  const seconds = retryMatch ? parseInt(retryMatch[1]) : null;
  return {
    quota: true,
    retryAfter: seconds,
    msg: seconds
      ? `Hết quota Gemini free tier — thử lại sau ${seconds}s, hoặc đổi sang model khác trong .env.local`
      : "Hết quota Gemini free tier — đợi qua ngày hoặc đổi model trong .env.local",
  };
};

// ─── Main analyzer ─────────────────────────────────────────────────────────
// Trả về { greenPct, brownPct, waterPct, ndvi, qualityNote, diseases[],
//          srpCompliance{}, recommendations[], previewUrl, fileHash, fileName, source }
// source: "gemini" | "gemini-cached" | "canvas-fallback"
export const analyzeDroneImage = async (file, context = "drone") => {
  const dataUrl = await fileToDataUrl(file);
  const fileHash = sha8(`${file.name}-${file.size}-${Date.now()}`);
  const baseInfo = { previewUrl: dataUrl, fileName: file.name, fileHash };

  // ① Cache hit — re-upload cùng ảnh không tốn API call
  const key = cacheKey(file, context);
  if (analysisCache.has(key)) {
    console.log("[Cache hit]", key);
    const cached = analysisCache.get(key);
    return { ...baseInfo, ...cached, source: "gemini-cached" };
  }

  // ② Thử Gemini
  if (isGeminiConfigured()) {
    try {
      const result = await analyzeImageWithGemini(file, context);
      analysisCache.set(key, result);  // lưu cache cho lần sau
      return { ...baseInfo, ...result, source: "gemini" };
    } catch (err) {
      const quotaErr = parseQuotaError(err.message);
      if (quotaErr) {
        console.warn(`[Gemini quota exhausted] ${quotaErr.msg}`);
      } else {
        console.warn("[Gemini fail → fallback canvas]", err.message);
      }
      const fallback = await analyzeWithCanvas(file);
      return {
        ...baseInfo,
        ...fallback,
        source: "canvas-fallback",
        error: quotaErr?.msg ?? err.message,
        quotaExhausted: !!quotaErr,
        retryAfter: quotaErr?.retryAfter,
      };
    }
  }

  // ③ Không có key → canvas
  const fallback = await analyzeWithCanvas(file);
  return { ...baseInfo, ...fallback, source: "canvas-fallback" };
};

// Cho phép clear cache khi cần (vd: user đổi model hoặc API key)
export const clearAnalysisCache = () => analysisCache.clear();

// Quy đổi → Farming Score gợi ý cho 3 Cùng (KTV vẫn được sửa)
export const aiSuggestFarmingScore = (analysis) => {
  // Nếu có srpCompliance từ Gemini → tính chính xác từ checklist
  if (analysis.srpCompliance) {
    const earned = SRP_CRITERIA.filter(c => analysis.srpCompliance[c.id]).reduce((s, c) => s + c.points, 0);
    return Math.round((earned / SRP_MAX) * MAX_FARMING);
  }
  // Fallback: trộn green/ndvi/brown
  const raw = analysis.greenPct * 0.6 + analysis.ndvi * 0.3 - analysis.brownPct * 0.1;
  const pct = Math.max(0, Math.min(100, Math.round(raw)));
  return Math.round((pct / 100) * MAX_FARMING);
};

// Auto-tick checklist từ phân tích
export const aiSuggestChecklist = (analysis) => {
  // Nếu có Gemini srpCompliance → dùng trực tiếp
  if (analysis.srpCompliance) {
    const checked = {};
    SRP_CRITERIA.forEach(c => {
      checked[c.id] = Boolean(analysis.srpCompliance[c.id]);
    });
    return checked;
  }
  // Fallback heuristic
  const checked = {};
  checked.density = analysis.greenPct >= 50;
  checked.water = analysis.waterPct < 25;
  checked.disease = analysis.brownPct < 20;
  checked.fert = analysis.greenPct >= 55;
  SRP_CRITERIA.forEach(c => {
    if (!(c.id in checked)) checked[c.id] = false;
  });
  return checked;
};
