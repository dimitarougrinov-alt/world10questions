import { useEffect, useState } from "react";
import { soundUnlock } from "../utils/sounds";

const DIFF_CONFIG = {
  challenger: {
    icon: "⚔️",
    label: "Challenger",
    colors: ["#FFD93D", "#FF914D", "#FF6B35", "#FFE566", "#fbbf24"],
    glowVar: "rgba(255, 185, 50, 0.7)",
    gradient: "linear-gradient(135deg, #FFE566 0%, #FFD93D 35%, #FF914D 70%, #FF6B35 100%)",
    borderColor: "rgba(255, 200, 60, 0.6)",
  },
  master: {
    icon: "🔥",
    label: "Master",
    colors: ["#f87171", "#FF6B35", "#c026d3", "#fb923c", "#e879f9"],
    glowVar: "rgba(240, 80, 80, 0.7)",
    gradient: "linear-gradient(135deg, #fb923c 0%, #f87171 40%, #c026d3 100%)",
    borderColor: "rgba(248, 113, 113, 0.6)",
  },
};

// Static so they don't re-randomise on re-render
const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left:     (i * 3.7 + 2) % 100,
  delay:    (i * 0.08) % 1.6,
  duration: 1.8 + (i % 5) * 0.35,
  rot:      (i * 47) % 720 - 360,
  w:        6 + (i % 4) * 3,
  h:        3 + (i % 3) * 2,
}));

const BURST = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  angle: i * 30,
  delay: i * 0.025,
  size:  5 + (i % 3) * 4,
}));

export default function UnlockPopup({ difficulty, onClose }) {
  const [leaving, setLeaving] = useState(false);
  const cfg = DIFF_CONFIG[difficulty];

  useEffect(() => {
    soundUnlock();
    const t = setTimeout(() => dismiss(), 5500);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setLeaving(true);
    setTimeout(onClose, 500);
  }

  return (
    <div className={`ulk-overlay${leaving ? " ulk-leaving" : ""}`} onClick={dismiss}>

      {/* Confetti rain */}
      <div className="ulk-confetti" aria-hidden="true">
        {CONFETTI.map(c => (
          <span
            key={c.id}
            className="ulk-confetti-piece"
            style={{
              left: `${c.left}%`,
              width: `${c.w}px`,
              height: `${c.h}px`,
              background: cfg.colors[c.id % cfg.colors.length],
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              "--rot": `${c.rot}deg`,
            }}
          />
        ))}
      </div>

      {/* Shockwave */}
      <div
        className="ulk-shockwave"
        aria-hidden="true"
        style={{ "--glow": cfg.glowVar }}
      />

      {/* Card */}
      <div
        className="ulk-card"
        style={{ "--border": cfg.borderColor, "--glow": cfg.glowVar }}
        onClick={e => e.stopPropagation()}
      >
        {/* Ambient radiance */}
        <div className="ulk-radiance" aria-hidden="true" style={{ "--glow": cfg.glowVar }} />

        {/* Burst particles */}
        <div className="ulk-burst" aria-hidden="true">
          {BURST.map(p => (
            <span
              key={p.id}
              className="ulk-burst-particle"
              style={{
                "--angle": `${p.angle}deg`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: cfg.colors[p.id % cfg.colors.length],
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Lock icon */}
        <div className="ulk-lock-wrap">
          <div className="ulk-lock-ring" style={{ "--glow": cfg.glowVar }} />
          <span className="ulk-lock-icon">🔓</span>
        </div>

        {/* Text content */}
        <p className="ulk-eyebrow">NEW DIFFICULTY</p>
        <h2
          className="ulk-headline"
          style={{ "--gradient": cfg.gradient }}
        >
          UNLOCKED!
        </h2>

        <div className="ulk-badge" style={{ "--border": cfg.borderColor, "--glow": cfg.glowVar }}>
          <span className="ulk-badge-icon">{cfg.icon}</span>
          <span className="ulk-badge-name">{cfg.label}</span>
        </div>

        <p className="ulk-sub">You've earned the next level. Good luck!</p>

        <button
          className="ulk-cta"
          style={{ "--gradient": cfg.gradient, "--glow": cfg.glowVar }}
          onClick={dismiss}
        >
          Let's Go! →
        </button>
      </div>
    </div>
  );
}
