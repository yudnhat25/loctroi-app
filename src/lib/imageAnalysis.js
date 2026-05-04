// AI Computer Vision (mock) — chấm điểm phủ xanh + NDVI ước lượng từ ảnh drone upload.
// Dùng <canvas> đọc trực tiếp pixel, đếm tỷ lệ pixel "xanh chiếm ưu thế" → suy ra NDVI & SRP score.
// Hoàn toàn chạy client-side, không cần backend, đủ thuyết phục cho demo.

import { MAX_FARMING, SRP_CRITERIA, SRP_MAX } from "./scoring";

const sha8 = (str) => {
  // Hash đơn giản (FNV-like) 8 ký tự hex — đủ cho IPFS-hash giả lập trên chain
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
};

// Đọc file ảnh, downscale rồi đếm tỉ lệ pixel xanh (G dominant)
// Trả về: greenPct, brownPct, ndvi, qualityNote, fileHash
export const analyzeDroneImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Không đọc được file"));
    reader.onload = (e) => {
      const dataUrl = e.target.result;
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
          // Xanh khoẻ: G > R và G > B với độ chênh đủ lớn
          if (g > r + 8 && g > b + 8 && g > 60) green++;
          // Nâu/úa: R cao, G trung bình, B thấp (vùng khô/úng/sâu bệnh)
          else if (r > g && r > b && r > 80 && Math.abs(g - b) < 30) brown++;
          // Nước/úng: B chiếm ưu thế
          else if (b > r + 10 && b > g + 5 && b > 70) water++;
        }

        const greenPct = Math.round((green / total) * 100);
        const brownPct = Math.round((brown / total) * 100);
        const waterPct = Math.round((water / total) * 100);
        // NDVI ước lượng (proxy): cây xanh khỏe → NDVI cao. Mapping greenPct → 0.05–0.85
        const ndvi = Math.min(85, Math.round(greenPct * 0.85 + 5));

        let qualityNote = "Tốt";
        if (brownPct > 25) qualityNote = "Có dấu hiệu sâu bệnh / vùng khô";
        else if (waterPct > 35) qualityNote = "Nguy cơ úng — quản lý nước kém";
        else if (greenPct < 35) qualityNote = "Phủ xanh thấp — sạ thưa hoặc cây yếu";
        else if (greenPct >= 70) qualityNote = "Sinh trưởng xuất sắc";

        const fileHash = sha8(`${file.name}-${file.size}-${greenPct}-${ndvi}`);

        resolve({
          greenPct,
          brownPct,
          waterPct,
          ndvi,
          qualityNote,
          fileHash,
          previewUrl: dataUrl,
          fileName: file.name,
        });
      };
      img.onerror = () => reject(new Error("Ảnh không hợp lệ"));
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });

// Từ phân tích AI → suy ra Farming Score gợi ý cho 3 Cùng (KTV vẫn được sửa)
export const aiSuggestFarmingScore = (analysis) => {
  // Trộn 3 yếu tố: greenPct (60%) + ndvi (30%) − brownPct (10%)
  const raw = analysis.greenPct * 0.6 + analysis.ndvi * 0.3 - analysis.brownPct * 0.1;
  const pct = Math.max(0, Math.min(100, Math.round(raw)));
  return Math.round((pct / 100) * MAX_FARMING);
};

// Auto tick những tiêu chí SRP mà ảnh drone CÓ THỂ chấm được tự động (4 tiêu chí có cờ "byDrone")
// Các tiêu chí còn lại để KTV 3 Cùng tick tay tại thực địa
export const aiSuggestChecklist = (analysis) => {
  const checked = {};
  // density — chấm dựa trên độ phủ xanh
  checked.density = analysis.greenPct >= 50;
  // water — chấm dựa trên không bị úng quá nhiều
  checked.water = analysis.waterPct < 25;
  // disease — chấm dựa trên tỉ lệ vùng nâu/úa thấp
  checked.disease = analysis.brownPct < 20;
  // fert — chấm dựa trên độ xanh đều (proxy: greenPct >= 55)
  checked.fert = analysis.greenPct >= 55;
  // còn lại để KTV tick tay
  SRP_CRITERIA.forEach(c => {
    if (!(c.id in checked)) checked[c.id] = false;
  });
  return checked;
};
