import { useEffect, useState } from "react";

// Static confetti — varied rainbow palette to celebrate achievements
const CONFETTI = Array.from({ length: 32 }, (_, i) => {
  const palette = ["#FFD93D", "#4ECDC4", "#FF6B6B", "#C77DFF", "#69DB7C", "#FF914D", "#74C0FC", "#FFE066"];
  return {
    id: i,
    left:     (i * 3.25 + 1.5) % 100,
    delay:    (i * 0.065) % 1.4,
    duration: 1.7 + (i % 6) * 0.28,
    rot:      (i * 53) % 720 - 360,
    w:        5 + (i % 5) * 2.5,
    h:        3 + (i % 3) * 2,
    color:    palette[i % palette.length],
  };
});

export default function BadgePopup({ badges, onClose }) {
  const [leaving, setLeaving] = useState(false);
  const multi = badges.length > 1;

  useEffect(() => {
    const t = setTimeout(() => dismiss(), 6000);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setLeaving(true);
    setTimeout(onClose, 500);
  }

  return (
    <div className={`bdg-overlay${leaving ? " bdg-leaving" : ""}`} onClick={dismiss}>

      {/* Confetti */}
      <div className="bdg-confetti" aria-hidden="true">
        {CONFETTI.map(c => (
          <span
            key={c.id}
            className="bdg-confetti-piece"
            style={{
              left: `${c.left}%`,
              width: `${c.w}px`,
              height: `${c.h}px`,
              background: c.color,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              "--rot": `${c.rot}deg`,
            }}
          />
        ))}
      </div>

      {/* Card — drops from above */}
      <div className="bdg-card" onClick={e => e.stopPropagation()}>

        {/* Gold shimmer top bar */}
        <div className="bdg-shimmer-bar" aria-hidden="true" />

        {/* Medal icon */}
        <div className="bdg-medal-wrap">
          <div className="bdg-medal-ring" />
          <span className="bdg-medal-icon">🏅</span>
        </div>

        {/* Headline */}
        <p className="bdg-eyebrow">
          {multi ? `${badges.length} ACHIEVEMENTS` : "ACHIEVEMENT"}
        </p>
        <h2 className="bdg-headline">UNLOCKED!</h2>

        {/* Badges */}
        <div className={`bdg-badges-row${multi ? " bdg-multi" : ""}`}>
          {badges.map((b, i) => (
            <div
              key={b.id}
              className="bdg-badge-item"
              style={{ animationDelay: `${0.65 + i * 0.18}s` }}
            >
              <span className="bdg-badge-emoji">{b.emoji}</span>
              <span className="bdg-badge-name">{b.name}</span>
              <span className="bdg-badge-desc">{b.desc}</span>
            </div>
          ))}
        </div>

        <button className="bdg-cta" onClick={dismiss}>
          Awesome! ✨
        </button>
      </div>
    </div>
  );
}
