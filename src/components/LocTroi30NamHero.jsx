// Hero scene "Lộc Trời — 30 Năm Cùng Nông Dân Phát Triển Bền Vững"
// Convert từ Loc Troi 30 Nam.html → React. Base image là /loctroi-30nam.png (public folder).
// Các overlay UAV / cloud / glow / vignette / spray giữ nguyên animation từ HTML gốc.

const LocTroi30NamHero = () => (
  <>
    <style>{`
      .lt-stage {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #0a3d1c;
      }

      /* Sky overlay where UAVs fly — top ~45% */
      .lt-sky-layer {
        position: absolute;
        left: 0; top: 0;
        width: 100%;
        height: 45%;
        z-index: 5;
        pointer-events: none;
        overflow: visible;
      }

      /* ============ UAV ============ */
      .lt-uav {
        position: absolute;
        width: 130px;
        height: 60px;
        transform-origin: center;
        will-change: transform;
        filter: drop-shadow(0 6px 8px rgba(0,0,0,0.25));
      }
      .lt-uav.lt-small { width: 70px; height: 32px; opacity: 0.85; }
      .lt-uav.lt-tiny  { width: 42px; height: 20px; opacity: 0.7; }

      /* fly path 1 — left to right, mid-sky */
      .lt-uav-1 { top: 22%; left: -15%; animation: ltFly1 18s linear infinite; }
      @keyframes ltFly1 {
        0%   { transform: translate(0, 0) rotate(-2deg); }
        25%  { transform: translate(35vw, -10px) rotate(1deg); }
        50%  { transform: translate(70vw, 8px) rotate(-1deg); }
        75%  { transform: translate(95vw, -6px) rotate(2deg); }
        100% { transform: translate(130vw, 4px) rotate(-2deg); }
      }

      /* fly path 2 — right to left, higher */
      .lt-uav-2 { top: 8%; right: -15%; animation: ltFly2 24s linear infinite; animation-delay: -6s; }
      @keyframes ltFly2 {
        0%   { transform: translate(0, 0) rotate(2deg) scaleX(-1); }
        50%  { transform: translate(-65vw, 12px) rotate(-2deg) scaleX(-1); }
        100% { transform: translate(-130vw, 0) rotate(2deg) scaleX(-1); }
      }

      /* tiny far-away one */
      .lt-uav-3 { top: 14%; left: -10%; animation: ltFly3 30s linear infinite; animation-delay: -10s; }
      @keyframes ltFly3 {
        0%   { transform: translate(0, 0) rotate(-1deg); }
        100% { transform: translate(120vw, -10px) rotate(1deg); }
      }

      /* gentle bob on top of fly path */
      .lt-uav .lt-body-wrap { width: 100%; height: 100%; animation: ltBob 2.4s ease-in-out infinite; }
      .lt-uav-2 .lt-body-wrap { animation-duration: 2.8s; animation-delay: -0.6s; }
      .lt-uav-3 .lt-body-wrap { animation-duration: 3.1s; animation-delay: -1.2s; }
      @keyframes ltBob {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-4px); }
      }

      /* rotor blur — fast spinning blades */
      .lt-rotor { transform-origin: center; animation: ltSpin 0.06s linear infinite; }
      @keyframes ltSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

      /* navigation light blink */
      .lt-nav-light { animation: ltBlink 1s steps(2, end) infinite; }
      .lt-nav-light.lt-green { animation-delay: 0.5s; }
      @keyframes ltBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.15; } }

      /* spray mist falling from the lead UAV */
      .lt-spray { position: absolute; left: 28%; top: 70%; width: 60%; height: 40px; opacity: 0.55; pointer-events: none; }
      .lt-spray span {
        position: absolute; bottom: 0; width: 4px; height: 4px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,0.95), rgba(200,230,255,0));
        animation: ltFall 1.6s linear infinite;
      }
      @keyframes ltFall {
        0%   { transform: translate(0, -8px) scale(0.6); opacity: 0; }
        20%  { opacity: 0.9; }
        100% { transform: translate(var(--dx, 0px), 60px) scale(1); opacity: 0; }
      }

      /* sun rays / atmospheric glow on top */
      .lt-glow {
        position: absolute; inset: 0 0 auto 0; height: 50%;
        background: radial-gradient(ellipse at 50% 0%, rgba(255,240,200,0.35), rgba(255,240,200,0) 60%);
        pointer-events: none; z-index: 4; mix-blend-mode: screen;
      }

      /* clouds drift slowly */
      .lt-cloud {
        position: absolute; border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,0.55), rgba(255,255,255,0));
        filter: blur(8px); pointer-events: none;
      }
      .lt-cloud-1 { top: 6%;  left: -20%; width: 280px; height: 80px; animation: ltDrift 60s linear infinite; }
      .lt-cloud-2 { top: 18%; left: -30%; width: 200px; height: 60px; animation: ltDrift 90s linear infinite; animation-delay: -30s; opacity: 0.7; }
      @keyframes ltDrift { from { transform: translateX(0); } to { transform: translateX(140vw); } }

      /* subtle vignette */
      .lt-vignette {
        position: absolute; inset: 0;
        background: radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.18) 100%);
        pointer-events: none; z-index: 6;
      }

      /* anniversary badge */
      .lt-anniv-badge {
        position: absolute; top: 16px; right: 16px; z-index: 10;
        display: flex; align-items: center; gap: 10px;
        padding: 8px 14px;
        background: rgba(12, 90, 44, 0.92);
        border: 1.5px solid rgba(245, 197, 24, 0.9);
        border-radius: 999px;
        color: #fff7e0;
        font-weight: 700; font-size: 13px;
        letter-spacing: 0.06em;
        backdrop-filter: blur(6px);
        box-shadow: 0 6px 22px rgba(0,0,0,0.25);
      }
      .lt-anniv-badge .lt-dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: #f5c518;
        box-shadow: 0 0 0 4px rgba(245, 197, 24, 0.25);
        animation: ltPulse 1.6s ease-in-out infinite;
      }
      @keyframes ltPulse {
        0%, 100% { box-shadow: 0 0 0 4px rgba(245, 197, 24, 0.25); }
        50%      { box-shadow: 0 0 0 8px rgba(245, 197, 24, 0); }
      }

      /* base hero illustration */
      .lt-hero-base {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover;
        object-position: center top;
        z-index: 1;
        transform-origin: center center;
        animation: ltPan 60s alternate infinite ease-in-out;
      }
      @keyframes ltPan {
        0% { transform: scale(1) translate(0, 0); }
        100% { transform: scale(1.05) translate(-1%, 1%); }
      }
    `}</style>

    <div className="lt-stage">
      {/* base illustration — file PNG gốc của Lộc Trời 30 năm */}
      <img className="lt-hero-base" src="/loctroi-30nam.png" alt="Lộc Trời 30 năm cùng nông dân phát triển bền vững" />

      {/* atmospheric extras */}
      <div className="lt-glow"></div>
      <div className="lt-vignette"></div>

      {/* floating UAV layer */}
      <div className="lt-sky-layer" aria-hidden="true">
        <div className="lt-cloud lt-cloud-1"></div>
        <div className="lt-cloud lt-cloud-2"></div>

        {/* UAV 1: lead drone, larger, with spray */}
        <div className="lt-uav lt-uav-1">
          <div className="lt-body-wrap">
            <UavSvg variant="lead" />
            <div className="lt-spray">
              <span style={{ left: "10%", "--dx": "-2px", animationDelay: "0s" }}></span>
              <span style={{ left: "18%", "--dx": "1px", animationDelay: "0.2s" }}></span>
              <span style={{ left: "26%", "--dx": "-1px", animationDelay: "0.4s" }}></span>
              <span style={{ left: "34%", "--dx": "2px", animationDelay: "0.1s" }}></span>
              <span style={{ left: "42%", "--dx": "0px", animationDelay: "0.5s" }}></span>
              <span style={{ left: "50%", "--dx": "1px", animationDelay: "0.3s" }}></span>
              <span style={{ left: "58%", "--dx": "-2px", animationDelay: "0.7s" }}></span>
              <span style={{ left: "66%", "--dx": "2px", animationDelay: "0.6s" }}></span>
              <span style={{ left: "74%", "--dx": "-1px", animationDelay: "0.9s" }}></span>
              <span style={{ left: "82%", "--dx": "1px", animationDelay: "0.4s" }}></span>
              <span style={{ left: "90%", "--dx": "0px", animationDelay: "0.8s" }}></span>
            </div>
          </div>
        </div>

        {/* UAV 2: smaller, mirrored, going right→left */}
        <div className="lt-uav lt-small lt-uav-2">
          <div className="lt-body-wrap">
            <UavSvg variant="green" />
          </div>
        </div>

        {/* UAV 3: tiny, far-away */}
        <div className="lt-uav lt-tiny lt-uav-3">
          <div className="lt-body-wrap">
            <UavSvg variant="tiny" />
          </div>
        </div>
      </div>

      {/* anniversary badge */}
      <div className="lt-anniv-badge">
        <span className="lt-dot"></span>
        <span>1993 — 2023 · 30 NĂM</span>
      </div>
    </div>
  </>
);

// ─── UAV SVG (3 biến thể: lead red, green, tiny) ────────────────────────────
const UavSvg = ({ variant }) => {
  const colors = {
    lead:  { body1: "#d9342b", body2: "#ef4a3f", led: "#5ac8fa", accent: "#fff" },
    green: { body1: "#0c5a2c", body2: "#1f8a3d", led: "#f5c518", accent: "#f5c518" },
    tiny:  { body1: "#d9342b", body2: "#d9342b", led: "#fff", accent: "#fff" },
  }[variant] || { body1: "#d9342b", body2: "#ef4a3f", led: "#5ac8fa", accent: "#fff" };

  return (
    <svg viewBox="0 0 260 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* arms */}
      <g stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round">
        <line x1="60"  y1="60" x2="20"  y2="30" />
        <line x1="60"  y1="60" x2="20"  y2="90" />
        <line x1="200" y1="60" x2="240" y2="30" />
        <line x1="200" y1="60" x2="240" y2="90" />
      </g>
      {/* main body */}
      {variant !== "tiny" && <ellipse cx="130" cy="62" rx="70" ry="22" fill={colors.body1} />}
      <ellipse cx="130" cy={variant === "tiny" ? 60 : 58} rx={variant === "tiny" ? 65 : 70} ry={variant === "tiny" ? 20 : 20} fill={colors.body2} />
      {/* top fin / camera */}
      <rect x="118" y={variant === "tiny" ? 42 : 40} width="24" height={variant === "tiny" ? 12 : 14} rx="3" fill="#1a1a1a" />
      {variant !== "tiny" && (
        <>
          <circle cx="130" cy="68" r="6" fill="#222" />
          <circle cx="130" cy="68" r="3" fill={colors.led} />
        </>
      )}
      {/* side accent */}
      <rect x="80" y="56" width="100" height="3" fill={colors.accent} opacity={variant === "green" ? 0.85 : 0.7} />
      {/* tank below — only for full body */}
      {variant === "lead" && (
        <>
          <rect x="108" y="76" width="44" height="14" rx="4" fill="#fff" opacity="0.85" />
          <rect x="112" y="78" width="36" height="3" fill="#1f8a3d" />
        </>
      )}
      {variant === "green" && <rect x="108" y="76" width="44" height="12" rx="4" fill="#fff" opacity="0.9" />}

      {/* rotor hubs */}
      <circle cx="20"  cy="30" r="6" fill="#1a1a1a" />
      <circle cx="20"  cy="90" r="6" fill="#1a1a1a" />
      <circle cx="240" cy="30" r="6" fill="#1a1a1a" />
      <circle cx="240" cy="90" r="6" fill="#1a1a1a" />

      {/* spinning rotor disks (blurred) */}
      <g className="lt-rotor" style={{ transformBox: "fill-box", transformOrigin: "20px 30px" }}>
        <ellipse cx="20" cy="30" rx="22" ry="3" fill="rgba(40,40,40,0.45)" />
        {variant !== "tiny" && <ellipse cx="20" cy="30" rx="3" ry="22" fill="rgba(40,40,40,0.25)" />}
      </g>
      <g className="lt-rotor" style={{ transformBox: "fill-box", transformOrigin: "20px 90px", animationDelay: "-0.02s" }}>
        <ellipse cx="20" cy="90" rx="22" ry="3" fill="rgba(40,40,40,0.45)" />
        {variant !== "tiny" && <ellipse cx="20" cy="90" rx="3" ry="22" fill="rgba(40,40,40,0.25)" />}
      </g>
      <g className="lt-rotor" style={{ transformBox: "fill-box", transformOrigin: "240px 30px", animationDelay: "-0.04s" }}>
        <ellipse cx="240" cy="30" rx="22" ry="3" fill="rgba(40,40,40,0.45)" />
        {variant !== "tiny" && <ellipse cx="240" cy="30" rx="3" ry="22" fill="rgba(40,40,40,0.25)" />}
      </g>
      <g className="lt-rotor" style={{ transformBox: "fill-box", transformOrigin: "240px 90px", animationDelay: "-0.03s" }}>
        <ellipse cx="240" cy="90" rx="22" ry="3" fill="rgba(40,40,40,0.45)" />
        {variant !== "tiny" && <ellipse cx="240" cy="90" rx="3" ry="22" fill="rgba(40,40,40,0.25)" />}
      </g>

      {/* nav lights */}
      {variant !== "tiny" && (
        <>
          <circle className="lt-nav-light" cx="60"  cy="60" r="3" fill="#ff3b30" />
          <circle className="lt-nav-light lt-green" cx="200" cy="60" r="3" fill={variant === "green" ? "#f5c518" : "#34c759"} />
        </>
      )}

      {/* spray nozzle mist (only lead) */}
      {variant === "lead" && (
        <g opacity="0.55">
          <path d="M 110 90 L 100 110 L 120 110 Z" fill="rgba(255,255,255,0.7)" />
          <path d="M 150 90 L 140 110 L 160 110 Z" fill="rgba(255,255,255,0.7)" />
        </g>
      )}
    </svg>
  );
};

export default LocTroi30NamHero;
