// Auto-pilot picker — chọn farmer điểm thấp + lấy ảnh từ public/anhlua
// Tỷ lệ ảnh hư/chín theo Tier:
//   Tier A (VIP, 700-1000):    0 hư + 3 chín  — ruộng khoẻ, sẵn sàng thu hoạch
//   Tier B (Tin cậy, 500-699): 1 hư + 2 chín  — đa số tốt, thỉnh thoảng có vấn đề
//   Tier C (Phổ thông, 300-499):2 hư + 1 chín — cần cải thiện
//   Tier D (Cảnh báo, 0-299):  3 hư + 0 chín  — ruộng có nhiều vấn đề rõ rệt

import { getTier } from "./scoring";

const HU_IMAGES = [
  "/anhlua/hu/06_raynau05.jpg",
  "/anhlua/hu/9.jpg",
  "/anhlua/hu/l09035_tm.txt.e458dd.jpg",
];

const CHIN_IMAGES = [
  "/anhlua/chin/R.jpg",
  "/anhlua/chin/istockphoto-1128163734-170667a.jpg",
  "/anhlua/chin/istockphoto-1490100695-170667a.jpg",
  "/anhlua/chin/istockphoto-1621961518-170667a.jpg",
  "/anhlua/chin/istockphoto-166114352-170667a.jpg",
  "/anhlua/chin/pngtree-really-shot-mature-golden-rice-fields-picture-image_1498565.jpg",
  "/anhlua/chin/pngtree-rice-in-the-rice-fields-awaiting-harvest-cooked-rice-harvest-photo-picture-image_2833660.jpg",
];

const sampleN = (arr, n) => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
};

// Chọn farmer có Overall Score thấp nhất (chưa được drone bay nhiều)
export const pickLowCreditFarmer = (farmers, droneReports = []) => {
  if (!farmers?.length) return null;
  const reportCounts = {};
  droneReports.forEach(r => { reportCounts[r.farmerId] = (reportCounts[r.farmerId] || 0) + 1; });

  // Sắp xếp: ít bay nhất trước, sau đó tới tổng score thấp nhất
  const sorted = [...farmers].sort((a, b) => {
    const ra = reportCounts[a.id] || 0;
    const rb = reportCounts[b.id] || 0;
    if (ra !== rb) return ra - rb;
    const sa = (a.creditScore || 0) + (a.farmingScore || 0);
    const sb = (b.creditScore || 0) + (b.farmingScore || 0);
    return sa - sb;
  });
  // Pick random từ top 3 hộ ưu tiên (ít bay + điểm thấp)
  const top3 = sorted.slice(0, 3);
  return top3[Math.floor(Math.random() * top3.length)];
};

// Số ảnh hư/chín theo Tier code
const PHOTO_RATIO = {
  A: { hu: 0, chin: 3 },
  B: { hu: 1, chin: 2 },
  C: { hu: 2, chin: 1 },
  D: { hu: 3, chin: 0 },
};

// Pick 3 ảnh: tỷ lệ hư/chín theo Tier
export const pickAutoPhotos = (farmer) => {
  const tierCode = getTier(farmer)?.code ?? "D";
  const ratio = PHOTO_RATIO[tierCode] ?? PHOTO_RATIO.D;
  const items = [
    ...sampleN(HU_IMAGES, ratio.hu).map(u => ({ url: u, kind: "hư" })),
    ...sampleN(CHIN_IMAGES, ratio.chin).map(u => ({ url: u, kind: "chín" })),
  ];
  // Shuffle để thứ tự gửi không lộ pattern
  return items.sort(() => Math.random() - 0.5);
};

// Fetch ảnh từ public URL → File object (để truyền vào Gemini API)
export const fetchAsFile = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Không tải được ${url}: ${res.status}`);
  const blob = await res.blob();
  const filename = url.split("/").pop() || "drone-capture.jpg";
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
};

export const sleep = (ms) => new Promise(r => setTimeout(r, ms));
