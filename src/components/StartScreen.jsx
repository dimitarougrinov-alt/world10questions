import { useState } from "react";
import { ripple } from "../utils/ripple";
import { getLevelInfo, isChallengerUnlocked, isMasterUnlocked, CHALLENGER_UNLOCK_LEVEL, MASTER_UNLOCK_LEVEL, getEarnedBadges, BADGE_DEFS } from "../utils/xp";


const SHAPES = [
  { emoji: "⭐", style: { top: "8%",  left: "7%",  animationDelay: "0s",    animationDuration: "6s",  fontSize: "2rem"   } },
  { emoji: "🌟", style: { top: "15%", left: "88%", animationDelay: "1.5s",  animationDuration: "7s",  fontSize: "1.6rem" } },
  { emoji: "✨", style: { top: "72%", left: "5%",  animationDelay: "0.8s",  animationDuration: "5s",  fontSize: "1.4rem" } },
  { emoji: "💫", style: { top: "60%", left: "91%", animationDelay: "2.2s",  animationDuration: "8s",  fontSize: "1.8rem" } },
  { emoji: "🎯", style: { top: "82%", left: "75%", animationDelay: "0.3s",  animationDuration: "6.5s",fontSize: "1.5rem" } },
  { emoji: "🚀", style: { top: "25%", left: "3%",  animationDelay: "1.1s",  animationDuration: "9s",  fontSize: "1.7rem" } },
  { emoji: "🎪", style: { top: "88%", left: "20%", animationDelay: "2.7s",  animationDuration: "7.5s",fontSize: "1.3rem" } },
  { emoji: "🌈", style: { top: "5%",  left: "50%", animationDelay: "0.5s",  animationDuration: "10s", fontSize: "1.6rem" } },
  { emoji: "🎉", style: { top: "45%", left: "95%", animationDelay: "3.1s",  animationDuration: "6s",  fontSize: "1.4rem" } },
  { emoji: "⚡", style: { top: "92%", left: "55%", animationDelay: "1.8s",  animationDuration: "5.5s",fontSize: "1.5rem" } },
];

const DIFFICULTIES = [
  {
    key: "explorer",
    label: "Explorer",
    icon: "🌱",
    desc: "Famous & well-known",
    color: "diff-explorer",
  },
  {
    key: "challenger",
    label: "Challenger",
    icon: "⚔️",
    desc: "Test your knowledge",
    color: "diff-challenger",
  },
  {
    key: "master",
    label: "Master",
    icon: "🔥",
    desc: "Only the best know these",
    color: "diff-master",
  },
];

export default function StartScreen({ onStart, onStats, loading, totalXp = 0 }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const levelInfo           = getLevelInfo(totalXp);
  const challengerUnlocked  = isChallengerUnlocked(totalXp);
  const masterUnlocked      = isMasterUnlocked(totalXp);
  const earnedBadges        = getEarnedBadges()
    .map(id => BADGE_DEFS.find(b => b.id === id))
    .filter(Boolean);

  function handleCategorySelect(cat) {
    setTimeout(() => setSelectedCategory(cat), 220);
  }

  function handleBack() {
    setTimeout(() => setSelectedCategory(null), 220);
  }

  return (
    <div className="screen start-screen-redesign">

      {/* Floating background shapes */}
      <div className="floating-bg">
        {SHAPES.map((s, i) => (
          <span key={i} className="float-shape" style={s.style}>
            {s.emoji}
          </span>
        ))}
      </div>

      <div className="hero-card">

        {/* Globe with pulsing ring */}
        <div className="hero-globe-wrap">
          <div className="globe-pulse-ring ring1" />
          <div className="globe-pulse-ring ring2" />
          <div className="hero-globe">🌍</div>
        </div>

        {/* Title */}
        <h1 className="hero-title">
          <span className="hero-title-world">World</span>
          <span className="hero-title-10">10</span>
          <span className="hero-title-questions">Questions</span>
        </h1>

        {/* Level indicator */}
        <div className="hero-level-bar">
          <div className="hero-level-info">
            <span className="hero-level-badge">Lv {levelInfo.level}</span>
            {levelInfo.xpForLevel ? (
              <span className="hero-level-xp">{levelInfo.xpIntoLevel} / {levelInfo.xpForLevel} XP</span>
            ) : (
              <span className="hero-level-xp">Max Level ✨</span>
            )}
          </div>
          <div className="hero-level-track">
            <div
              className="hero-level-fill"
              style={{ width: levelInfo.xpForLevel ? `${Math.min(100, Math.round((levelInfo.xpIntoLevel / levelInfo.xpForLevel) * 100))}%` : "100%" }}
            />
          </div>
        </div>

        {/* Earned badges strip */}
        {earnedBadges.length > 0 && (
          <div className="hero-badges-strip">
            {earnedBadges.map(b => (
              <span key={b.id} className="hero-badge-pip" title={`${b.name}: ${b.desc}`}>
                {b.emoji}
              </span>
            ))}
          </div>
        )}

        {!selectedCategory ? (
          <>
            <p className="hero-subtitle">
              Choose your challenge and show the world what you know! 🏆
            </p>

            {/* Step 1: Category buttons */}
            <div className="hero-categories">
              <button
                className="hero-cat-btn cat-capitals"
                onClick={(e) => { ripple(e); handleCategorySelect("capitals"); }}
                disabled={loading}
              >
                <span className="cat-btn-icon">🗺️</span>
                <span className="cat-btn-label">World Capitals</span>
                <span className="cat-btn-sub">Name the capital cities!</span>
              </button>

              <button
                className="hero-cat-btn cat-inventions"
                onClick={(e) => { ripple(e); handleCategorySelect("inventions"); }}
                disabled={loading}
              >
                <span className="cat-btn-icon">💡</span>
                <span className="cat-btn-label">Inventions</span>
                <span className="cat-btn-sub">Who invented what?</span>
              </button>
            </div>

            {/* Hall of fame */}
            <button className="hero-hof-btn" onClick={(e) => { ripple(e); onStats(); }}>
              🏆 Hall of Fame
            </button>
          </>
        ) : (
          <>
            <p className="hero-subtitle">
              {selectedCategory === "capitals" ? "🗺️ World Capitals" : "💡 Inventions"} — Pick your level!
            </p>

            {/* Step 2: Difficulty buttons */}
            <div className="hero-difficulties">
              {DIFFICULTIES.map((d) => {
                const locked =
                  (d.key === "challenger" && !challengerUnlocked) ||
                  (d.key === "master"     && !masterUnlocked);
                const unlockLevel =
                  d.key === "challenger" ? CHALLENGER_UNLOCK_LEVEL :
                  d.key === "master"     ? MASTER_UNLOCK_LEVEL : null;
                return (
                  <button
                    key={d.key}
                    className={`hero-diff-btn ${d.color}${locked ? " diff-locked" : ""}`}
                    onClick={(e) => { if (!locked) { ripple(e); onStart(selectedCategory, d.key); } }}
                    disabled={loading || locked}
                    aria-disabled={locked}
                  >
                    {locked && <span className="diff-lock-icon">🔒</span>}
                    <span className="diff-btn-icon">{d.icon}</span>
                    <span className="diff-btn-label">{d.label}</span>
                    <span className="diff-btn-desc">
                      {locked ? `Reach Level ${unlockLevel} to unlock` : d.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {loading && <p className="hero-loading">⏳ Loading your quiz…</p>}

            <button className="hero-back-btn" onClick={(e) => { ripple(e); handleBack(); }}>
              ← Back
            </button>
          </>
        )}

      </div>
    </div>
  );
}
