import { useMemo } from "react";

// Fullscreen NDVI heatmap viewer + 3D UAV bay theo S-pattern.
// Hiển thị khi auto-pilot đang chạy: bay → quét → AI phân tích.

const UavScanScene = ({ farmer, progress = 0, message = "Đang khởi động drone...", currentPhotoIdx = 0, totalPhotos = 3 }) => {
  // ─── NDVI heatmap grid 14×10 — random nhưng deterministic theo farmer.id ──
  const cells = useMemo(() => {
    const seed = (farmer?.id ?? "default").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const rng = mulberry32(seed);
    const COLS = 14, ROWS = 10;
    const arr = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const noise = rng();
        // Đa số xanh đậm (NDVI cao), thỉnh thoảng có ô vàng nhạt (NDVI thấp)
        const lightness = 25 + noise * 22;
        const hue = noise > 0.92 ? 65 + noise * 10 : 110 + (noise - 0.5) * 30;
        const sat = 45 + noise * 25;
        arr.push({ r, c, color: `hsl(${hue}, ${sat}%, ${lightness}%)`, anomaly: noise > 0.95 });
      }
    }
    return { cells: arr, COLS, ROWS };
  }, [farmer?.id]);

  // GPS coordinate giả lập (vùng ĐBSCL)
  const gps = useMemo(() => {
    const lat = 9.4 + (Math.random() - 0.5) * 0.2;
    const lng = 105.6 + (Math.random() - 0.5) * 0.5;
    const today = new Date();
    return {
      latStr: `${lat.toFixed(3)}°N · ${lng.toFixed(3)}°E`,
      dateStr: `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
    };
  }, [farmer?.id]);

  // UAV vị trí — bay theo S-pattern dựa trên progress (0-100)
  // S-pattern: 4 lượt ngang qua field, mỗi lượt từ 25% progress
  const uavPos = useMemo(() => {
    const p = Math.max(0, Math.min(100, progress)) / 100;
    const rows = 4;
    const segment = 1 / rows;
    const seg = Math.min(rows - 1, Math.floor(p / segment));
    const segP = (p - seg * segment) / segment;       // 0..1 trong segment hiện tại
    const goingRight = seg % 2 === 0;
    const x = goingRight ? segP * 100 : (1 - segP) * 100;     // %
    const y = ((seg + 0.5) / rows) * 100;                     // %
    return { x, y, heading: goingRight ? 0 : 180 };
  }, [progress]);

  // Trail — vết đã bay qua (dùng để vẽ overlay sáng hơn lên các ô đã quét)
  const scannedCells = useMemo(() => {
    const totalCells = cells.cells.length;
    const scanned = Math.floor((progress / 100) * totalCells);
    return new Set(cells.cells.slice(0, scanned).map(c => `${c.r}-${c.c}`));
  }, [progress, cells.cells]);

  return (
    <>
      <style>{`
        @keyframes uavBob {
          0%, 100% { transform: rotateX(58deg) translateY(0); }
          50%      { transform: rotateX(58deg) translateY(-3px); }
        }
        @keyframes uavShadowPulse {
          0%, 100% { transform: scaleX(1); opacity: 0.5; }
          50%      { transform: scaleX(0.9); opacity: 0.35; }
        }
        @keyframes blink {
          0%, 50%   { opacity: 1; }
          50.01%, 100% { opacity: 0.15; }
        }
        @keyframes scanLine {
          from { transform: translateY(-100%); }
          to   { transform: translateY(100%); }
        }
        .ndvi-grid {
          display: grid;
          grid-template-columns: repeat(14, 1fr);
          grid-template-rows: repeat(10, 1fr);
          gap: 2px;
          width: 100%; height: 100%;
        }
        .ndvi-cell {
          transition: filter 0.6s ease;
        }
        .ndvi-cell.scanned {
          filter: brightness(1.15) saturate(1.2);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.15);
        }
        .uav3d-wrap {
          position: absolute;
          width: 70px; height: 70px;
          transform: translate(-50%, -50%);
          pointer-events: none;
          transition: top 1.2s linear, left 1.2s linear;
        }
        .uav3d-shadow {
          position: absolute;
          bottom: -22px; left: 50%;
          width: 50px; height: 14px;
          margin-left: -25px;
          background: radial-gradient(ellipse, rgba(0,0,0,0.55), transparent 70%);
          border-radius: 50%;
          animation: uavShadowPulse 1.5s ease-in-out infinite;
        }
        .uav3d-body {
          width: 100%; height: 100%;
          transform: rotateX(58deg);
          transform-origin: center;
          animation: uavBob 1.5s ease-in-out infinite;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));
        }
        .uav-led-blink { animation: blink 0.7s steps(1) infinite; }
        .scan-beam {
          position: absolute; left: 50%; top: 100%;
          width: 4px; height: 200px;
          background: linear-gradient(to bottom, rgba(34,211,238,0.7), transparent);
          transform: translateX(-50%);
          opacity: 0.6;
          filter: blur(1px);
        }
      `}</style>

      <div className="fixed inset-0 z-50 bg-emerald-950/96 backdrop-blur-md flex items-center justify-center p-4 fade-in">
        <div className="w-full max-w-5xl bg-emerald-900 rounded-3xl shadow-2xl overflow-hidden border-2 border-emerald-700">
          {/* Header */}
          <div className="px-6 py-3 bg-emerald-950 border-b border-emerald-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="text-xl">🚁</div>
              <div>
                <div className="text-xs text-emerald-300 font-bold uppercase tracking-wider">DJI Agras T40 — Auto-pilot Mission</div>
                <div className="text-sm font-bold text-white">{farmer?.hoTen ?? "—"} · {farmer?.htx ?? farmer?.diaChi ?? ""} · {farmer?.dienTich ?? 0}ha</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-emerald-300 font-bold uppercase">Tiến độ</div>
              <div className="text-2xl font-extrabold text-amber-300 leading-none font-mono">{Math.round(progress)}%</div>
            </div>
          </div>

          {/* NDVI heatmap viewport */}
          <div className="relative aspect-[14/10] bg-emerald-950 p-4">
            {/* Dashed border frame */}
            <div className="absolute inset-3 border-2 border-dashed border-white/40 rounded-lg pointer-events-none z-20"></div>

            {/* GPS pin badge */}
            <div className="absolute top-5 left-5 z-30 bg-emerald-950/90 backdrop-blur px-3 py-1.5 rounded-lg border border-emerald-700 flex items-center gap-2 text-xs">
              <span className="text-rose-400 text-base">📍</span>
              <span className="font-mono font-bold text-amber-200">{gps.latStr}</span>
              <span className="text-emerald-400">·</span>
              <span className="font-mono text-emerald-100">{gps.dateStr}</span>
            </div>

            {/* Photo counter */}
            <div className="absolute top-5 right-5 z-30 bg-emerald-950/90 backdrop-blur px-3 py-1.5 rounded-lg border border-emerald-700 text-xs font-mono">
              <span className="text-amber-200 font-bold">📷 {currentPhotoIdx}/{totalPhotos}</span>
              <span className="text-emerald-400 ml-1">ảnh đa phổ</span>
            </div>

            {/* NDVI grid */}
            <div className="absolute inset-3 ndvi-grid">
              {cells.cells.map(cell => {
                const isScanned = scannedCells.has(`${cell.r}-${cell.c}`);
                return (
                  <div
                    key={`${cell.r}-${cell.c}`}
                    className={`ndvi-cell rounded-sm ${isScanned ? "scanned" : ""}`}
                    style={{ background: cell.color }}
                  />
                );
              })}
            </div>

            {/* 3D UAV at current position */}
            <div className="uav3d-wrap" style={{ left: `${uavPos.x}%`, top: `${uavPos.y}%` }}>
              <div className="uav3d-shadow"></div>
              <UavSvg />
              {/* Scan beam shooting down */}
              <div className="scan-beam"></div>
            </div>

            {/* Scan line sweep effect (slowly moving) */}
            <div className="absolute inset-3 overflow-hidden rounded-lg pointer-events-none z-10">
              <div
                className="absolute inset-x-0 h-12 bg-gradient-to-b from-cyan-400/0 via-cyan-300/15 to-cyan-400/0"
                style={{ animation: "scanLine 4s linear infinite" }}
              />
            </div>
          </div>

          {/* NDVI legend bar */}
          <div className="px-6 pt-3 pb-2">
            <div className="bg-emerald-950 rounded-xl p-3 border border-emerald-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-amber-300 uppercase tracking-wider">NDVI</span>
                <span className="font-mono text-emerald-300">0.0 → 1.0</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{
                background: "linear-gradient(to right, #ea580c 0%, #f59e0b 25%, #fde047 45%, #84cc16 65%, #16a34a 85%, #14532d 100%)"
              }}/>
            </div>
          </div>

          {/* Status message */}
          <div className="px-6 py-4 bg-emerald-950 border-t border-emerald-800">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" style={{ animation: "ping 1s ease-in-out infinite" }}></div>
              <p className="text-sm text-amber-100 font-semibold">{message}</p>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-1.5 bg-emerald-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// 3D-look UAV (top-down isometric với rotateX trong CSS)
const UavSvg = () => (
  <div className="uav3d-body">
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      {/* Arms X-shape */}
      <line x1="22" y1="22" x2="78" y2="78" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" />
      <line x1="22" y1="78" x2="78" y2="22" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" />

      {/* 4 rotor pads with spinning blur */}
      {[[22, 22], [78, 22], [22, 78], [78, 78]].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="9" fill="#0f172a" />
          {/* Cross blades (animated via SMIL ry/rx pulse) */}
          <ellipse cx={cx} cy={cy} rx="14" ry="2" fill="rgba(80,80,80,0.55)">
            <animate attributeName="ry" values="2;0.4;2" dur="0.06s" repeatCount="indefinite" begin={`${i * 0.015}s`} />
          </ellipse>
          <ellipse cx={cx} cy={cy} rx="2" ry="14" fill="rgba(80,80,80,0.45)">
            <animate attributeName="rx" values="2;0.4;2" dur="0.06s" repeatCount="indefinite" begin={`${i * 0.015}s`} />
          </ellipse>
          <circle cx={cx} cy={cy} r="2.5" fill="#1f2937" />
        </g>
      ))}

      {/* Body */}
      <ellipse cx="50" cy="50" rx="18" ry="14" fill="#dc2626" />
      <ellipse cx="50" cy="48" rx="15" ry="11" fill="#ef4444" />
      <rect x="44" y="42" width="12" height="6" rx="2" fill="#1a1a1a" />

      {/* Camera */}
      <circle cx="50" cy="55" r="4.5" fill="#1f2937" />
      <circle cx="50" cy="55" r="2.8" fill="#22d3ee" className="uav-led-blink" />

      {/* LED nav lights */}
      <circle cx="33" cy="50" r="2" fill="#22c55e" className="uav-led-blink" />
      <circle cx="67" cy="50" r="2" fill="#ef4444" className="uav-led-blink" />
    </svg>
  </div>
);

// Deterministic RNG (Mulberry32)
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default UavScanScene;
