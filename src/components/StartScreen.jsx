import { useState } from "react";
import { ripple } from "../utils/ripple";
import { getLevelInfo, isChallengerUnlockedForCat, isMasterUnlockedForCat, getEarnedBadges, getStreak, BADGE_DEFS } from "../utils/xp";
import { USERNAME_KEY } from "../utils/player";


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

const SHAPES_BG = [
  { emoji: "🌹", style: { top: "8%",  left: "7%",  animationDelay: "0s",    animationDuration: "6s",  fontSize: "2rem"   } },
  { emoji: "🌻", style: { top: "15%", left: "88%", animationDelay: "1.5s",  animationDuration: "7s",  fontSize: "1.6rem" } },
  { emoji: "🦁", style: { top: "72%", left: "5%",  animationDelay: "0.8s",  animationDuration: "5s",  fontSize: "1.4rem" } },
  { emoji: "🏔️", style: { top: "60%", left: "91%", animationDelay: "2.2s",  animationDuration: "8s",  fontSize: "1.8rem" } },
  { emoji: "🌿", style: { top: "82%", left: "75%", animationDelay: "0.3s",  animationDuration: "6.5s",fontSize: "1.5rem" } },
  { emoji: "🍇", style: { top: "25%", left: "3%",  animationDelay: "1.1s",  animationDuration: "9s",  fontSize: "1.7rem" } },
  { emoji: "⚔️", style: { top: "88%", left: "20%", animationDelay: "2.7s",  animationDuration: "7.5s",fontSize: "1.3rem" } },
  { emoji: "🌾", style: { top: "5%",  left: "50%", animationDelay: "0.5s",  animationDuration: "10s", fontSize: "1.6rem" } },
  { emoji: "🇧🇬", style: { top: "45%", left: "95%", animationDelay: "3.1s",  animationDuration: "6s",  fontSize: "1.4rem" } },
  { emoji: "🏛️", style: { top: "92%", left: "55%", animationDelay: "1.8s",  animationDuration: "5.5s",fontSize: "1.5rem" } },
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

export default function StartScreen({ onStart, onStats, loading, totalXp = 0, t, lang, onSetLang }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const shapes = lang === "bg" ? SHAPES_BG : SHAPES;
  const levelInfo = getLevelInfo(totalXp);
  const earnedBadges        = getEarnedBadges()
    .map(id => BADGE_DEFS.find(b => b.id === id))
    .filter(Boolean);
  const streak              = getStreak();
  const rawName             = localStorage.getItem(USERNAME_KEY);
  const playerName          = (rawName && rawName !== "__skipped__") ? rawName : null;
  const xpFillPct           = levelInfo.xpForLevel
    ? Math.min(100, Math.round((levelInfo.xpIntoLevel / levelInfo.xpForLevel) * 100))
    : 100;

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
        {shapes.map((s, i) => (
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

        {/* Language toggle — sliding pill */}
        <div className="hero-lang-toggle" data-lang={lang}>
          <div className="hero-lang-glider" />
          <button className="hero-lang-btn" onClick={() => onSetLang("bg")}>България</button>
          <button className="hero-lang-btn" onClick={() => onSetLang("en")}>International</button>
        </div>

        {/* Player identity card */}
        <div className="hero-identity">
          <div className="hero-identity-level-ring" onClick={(e) => { ripple(e); onStats("progress"); }} style={{ cursor: "pointer" }} title="View progress">
            <div className="hero-identity-level-inner">{levelInfo.level}</div>
          </div>
          <div className="hero-identity-info">
            {playerName
              ? <div className="hero-identity-name">{playerName}</div>
              : <div className="hero-identity-name hero-identity-anon">Explorer</div>
            }
            <div className="hero-identity-xp-row">
              <div className="hero-identity-xp-track">
                <div className="hero-identity-xp-fill" style={{ width: `${xpFillPct}%` }} />
              </div>
              <span className="hero-identity-xp-label">
                {levelInfo.xpForLevel ? `${levelInfo.xpIntoLevel}/${levelInfo.xpForLevel} XP` : t.max_level}
              </span>
            </div>
          </div>
          {streak > 1 && (
            <div className="hero-identity-streak">🔥 {streak}</div>
          )}
        </div>

        {/* Earned badges strip */}
        {earnedBadges.length > 0 && (
          <div className="hero-badges-strip" onClick={(e) => { ripple(e); onStats("progress"); }} style={{ cursor: "pointer" }} title="View badges">
            {earnedBadges.map(b => (
              <span key={b.id} className="hero-badge-pip" title={`${b.name}: ${b.desc}`}>
                {b.emoji}
              </span>
            ))}
          </div>
        )}

        {!selectedCategory ? (
          <>
            <p className="hero-subtitle">{t.subtitle}</p>

            {/* Step 1: Category buttons */}
            <div className="hero-categories">
              <button
                className="hero-cat-btn cat-capitals"
                onClick={(e) => { ripple(e); handleCategorySelect("capitals"); }}
                disabled={loading}
              >
                <span className="cat-btn-icon">🗺️</span>
                <span className="cat-btn-label">{t.cat_capitals_label}</span>
                <span className="cat-btn-sub">{t.cat_capitals_sub}</span>
              </button>

              <button
                className="hero-cat-btn cat-inventions"
                onClick={(e) => { ripple(e); handleCategorySelect("inventions"); }}
                disabled={loading}
              >
                <span className="cat-btn-icon">💡</span>
                <span className="cat-btn-label">{t.cat_inventions_label}</span>
                <span className="cat-btn-sub">{t.cat_inventions_sub}</span>
              </button>

              <button
                className="hero-cat-btn cat-history"
                onClick={(e) => { ripple(e); handleCategorySelect("history"); }}
                disabled={loading}
              >
                <span className="cat-btn-icon">📜</span>
                <span className="cat-btn-label">{t.cat_history_label}</span>
                <span className="cat-btn-sub">{t.cat_history_sub}</span>
              </button>

              <button
                className="hero-cat-btn cat-people"
                onClick={(e) => { ripple(e); handleCategorySelect("people"); }}
                disabled={loading}
              >
                <span className="cat-btn-icon">🌟</span>
                <span className="cat-btn-label">{t.cat_people_label}</span>
                <span className="cat-btn-sub">{t.cat_people_sub}</span>
              </button>
            </div>

            {/* Hall of fame */}
            <button className="hero-hof-btn" onClick={(e) => { ripple(e); onStats(); }}>
              {t.hof_btn}
            </button>
          </>
        ) : (
          <>
            <p className="hero-subtitle">
              {t.pick_level(
              selectedCategory === "capitals"   ? `🗺️ ${t.cat_capitals_label}`  :
              selectedCategory === "inventions" ? `💡 ${t.cat_inventions_label}` :
              selectedCategory === "history"    ? `📜 ${t.cat_history_label}`    :
                                                  `🌟 ${t.cat_people_label}`
            )}
            </p>

            {/* Step 2: Difficulty buttons */}
            <div className="hero-difficulties">
              {DIFFICULTIES.map((d) => {
                const locked =
                  (d.key === "challenger" && !isChallengerUnlockedForCat(selectedCategory)) ||
                  (d.key === "master"     && !isMasterUnlockedForCat(selectedCategory));
                const desc = d.key === "explorer" ? t.diff_explorer_desc
                  : d.key === "challenger" ? t.diff_challenger_desc
                  : t.diff_master_desc;
                const lockMsg = d.key === "challenger" ? t.diff_need_explorer : t.diff_need_challenger;
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
                      {locked ? lockMsg : desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {loading && <p className="hero-loading">{t.loading}</p>}

            <button className="hero-back-btn" onClick={(e) => { ripple(e); handleBack(); }}>
              {t.back_btn}
            </button>
          </>
        )}

      </div>
    </div>
  );
}
