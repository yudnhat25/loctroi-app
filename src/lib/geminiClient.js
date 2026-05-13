// Gemini 2.5 Flash client — gọi trực tiếp REST endpoint từ browser.
// API key đọc từ VITE_GEMINI_API_KEY (file .env.local).
// CẢNH BÁO: key sẽ bị bundle vào JS client → không an toàn cho production.

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL   = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export const isGeminiConfigured = () => Boolean(API_KEY);

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    const idx = dataUrl.indexOf(",");
    resolve(dataUrl.substring(idx + 1));
  };
  reader.onerror = () => reject(new Error("Không đọc được file ảnh"));
  reader.readAsDataURL(file);
});

const buildPrompt = (context = "drone") => {
  // Prompt linh hoạt hơn — chấp nhận cả ảnh từ trên cao (drone) lẫn ảnh cận (KTV)
  // và cả các giai đoạn sinh trưởng khác nhau (mạ → đẻ nhánh → trổ → chín).
  return `Bạn là chuyên gia nông học của Tập đoàn Lộc Trời (Việt Nam), chuyên đánh giá ruộng lúa ĐBSCL theo bộ tiêu chuẩn SRP (Sustainable Rice Platform).

NHIỆM VỤ: Phân tích ảnh ruộng lúa được cung cấp (có thể là ảnh ${context === "drone" ? "drone từ trên cao HOẶC ảnh cận do người chụp" : "thực địa cận do KTV 3 Cùng chụp"}). Ảnh có thể ở bất kỳ giai đoạn nào: mạ non, đẻ nhánh, làm đòng, trổ bông, hoặc chín vàng sẵn sàng thu hoạch.

Trả về DUY NHẤT một JSON object — KHÔNG markdown, KHÔNG text giải thích, chỉ JSON thuần:

{
  "growthStage": "mạ non" | "đẻ nhánh" | "làm đòng" | "trổ bông" | "chín" | "đã thu hoạch" | "không xác định",
  "greenPct": number 0-100,
  "brownPct": number 0-100,
  "waterPct": number 0-100,
  "ndvi": number 0-100,
  "qualityNote": string,
  "diseases": string[],
  "srpCompliance": {
    "density":    boolean,
    "seed":       boolean,
    "fert":       boolean,
    "pesticide":  boolean,
    "water":      boolean,
    "disease":    boolean,
    "withdrawal": boolean,
    "ppe":        boolean
  },
  "recommendations": string[]
}

QUY TẮC ĐÁNH GIÁ:
- "greenPct": % phần ảnh có cây lúa khoẻ. Nếu lúa ĐANG CHÍN VÀNG (giai đoạn chín) thì lá vẫn xanh nhưng bông vàng — vẫn tính là khoẻ, greenPct cao.
- "brownPct": chỉ tính vùng NÂU BẤT THƯỜNG (cháy lá, sâu bệnh, khô hạn). Bông lúa chín vàng KHÔNG tính là brown.
- "ndvi": ước lượng độ xanh tươi của tán cây lúa (0-100).
- "qualityNote": 1 câu tiếng Việt < 90 ký tự nhận định tổng thể có nêu giai đoạn sinh trưởng. Vd: "Lúa giai đoạn chín, hạt vàng đều, không sâu bệnh — sẵn sàng thu hoạch".
- "diseases": liệt kê sâu/bệnh CỤ THỂ phát hiện được, vd: ["đạo ôn lá", "bạc lá", "rầy nâu", "sâu cuốn lá", "khô vằn"]. Nếu lúa khoẻ → trả [].
- "srpCompliance": đánh giá 8 tiêu chí. Nếu không thấy người trong ảnh, "ppe" = true. Nếu không có dấu hiệu rõ ràng cho một tiêu chí, mặc định true.
- "recommendations": 2-3 câu khuyến nghị tiếng Việt. Nếu lúa chín, đề xuất "Báo Lộc Trời tới thu hoạch". Nếu thấy bệnh, đề xuất biện pháp xử lý.

XỬ LÝ ẢNH KHÔNG HỢP LỆ:
Nếu ảnh hoàn toàn KHÔNG liên quan ruộng lúa (vd: ảnh người, đồ vật, phong cảnh khác) → trả: growthStage = "không xác định", tất cả % = 0, qualityNote = "Ảnh không phải ruộng lúa", diseases = [], srpCompliance toàn false, recommendations = ["Vui lòng upload đúng ảnh ruộng lúa"].

Trả ngay JSON, không lời mào đầu.`;
};

export const analyzeImageWithGemini = async (file, context = "drone") => {
  if (!API_KEY) throw new Error("Chưa cấu hình VITE_GEMINI_API_KEY trong .env.local");

  const base64 = await fileToBase64(file);
  const prompt = buildPrompt(context);

  // FIX: Gemini REST API dùng camelCase (inlineData, mimeType) — NOT snake_case như Python SDK
  const requestBody = {
    contents: [{
      role: "user",
      parts: [
        { text: prompt },
        { inlineData: { mimeType: file.type || "image/jpeg", data: base64 } },
      ],
    }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
      // Gemini 2.5 Flash có "thinking mode" mặc định tiêu nhiều token nội bộ.
      // JSON tiếng Việt có dấu = nhiều token hơn ASCII. Bump lên 4096 để chắc.
      maxOutputTokens: 4096,
      // Tắt thinking mode để tiết kiệm token + giảm latency, vì task này
      // (đọc ảnh + trả JSON theo schema) không cần lập luận sâu.
      thinkingConfig: { thinkingBudget: 0 },
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };

  console.log("[Gemini] Calling", MODEL, "with image", file.name, `(${(file.size/1024).toFixed(0)}KB)`);

  const response = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("[Gemini] HTTP", response.status, errText);
    throw new Error(`Gemini API ${response.status}: ${errText.substring(0, 300)}`);
  }

  const data = await response.json();
  console.log("[Gemini] Response", data);

  // Check for prompt blocking / safety blocks
  if (data.promptFeedback?.blockReason) {
    throw new Error(`Gemini từ chối: ${data.promptFeedback.blockReason}`);
  }

  const candidate = data.candidates?.[0];
  if (!candidate) throw new Error("Gemini trả response không có candidates");
  if (candidate.finishReason && candidate.finishReason !== "STOP") {
    console.warn("[Gemini] finishReason:", candidate.finishReason);
  }

  const text = candidate.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini response rỗng (có thể bị safety filter chặn)");

  let parsed;
  try {
    const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error("[Gemini] JSON parse fail. finishReason:", candidate.finishReason, "Raw text:", text);
    if (candidate.finishReason === "MAX_TOKENS") {
      throw new Error("Gemini bị cắt do MAX_TOKENS — output quá dài, thử ảnh nhỏ hơn hoặc tăng maxOutputTokens");
    }
    throw new Error("Gemini trả JSON không hợp lệ: " + text.substring(0, 150));
  }

  // Sanitize numeric fields
  parsed.greenPct = Math.round(Number(parsed.greenPct) || 0);
  parsed.brownPct = Math.round(Number(parsed.brownPct) || 0);
  parsed.waterPct = Math.round(Number(parsed.waterPct) || 0);
  parsed.ndvi     = Math.round(Number(parsed.ndvi) || 0);
  parsed.diseases = Array.isArray(parsed.diseases) ? parsed.diseases : [];
  parsed.recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
  parsed.srpCompliance = parsed.srpCompliance || {};
  parsed.growthStage = parsed.growthStage || "không xác định";

  return parsed;
};
