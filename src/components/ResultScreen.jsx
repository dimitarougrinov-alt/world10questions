import { useState } from "react";
import { ripple } from "../utils/ripple";
import { USERNAME_KEY } from "../utils/player";
import { getLevelInfo, BADGE_DEFS } from "../utils/xp";

const MESSAGES = [
  { min: 10, emoji: "🏆", text: "Legendary!", sub: "You got every single one!" },
  { min: 8,  emoji: "🌟", text: "Superstar!",  sub: "Nearly perfect — amazing!" },
  { min: 6,  emoji: "🚀", text: "Great Job!",  sub: "You're on your way up!" },
  { min: 4,  emoji: "📚", text: "Keep Going!", sub: "Practice makes perfect!" },
  { min: 0,  emoji: "💪", text: "Try Again!",  sub: "You've got this next time!" },
];

function getMessage(score) {
  return MESSAGES.find((m) => score >= m.min);
}

function formatTime(ms) {
  if (!ms) return null;
  const s = ms / 1000;
  if (s < 60) return s.toFixed(1) + "s";
  const m = Math.floor(s / 60);
  return `${m}m ${(s % 60).toFixed(1)}s`;
}

function getSpeedMessage(percentile) {
  if (percentile === null) return null;
  if (percentile >= 90) return { text: `Faster than ${percentile}% of players with the same score!`, emoji: "⚡" };
  if (percentile >= 50) return { text: `Faster than ${percentile}% of players with the same score!`, emoji: "🚀" };
  if (percentile > 0)   return { text: `Faster than ${percentile}% of players with the same score!`, emoji: "👍" };
  return { text: "Try to beat your time next round!", emoji: "⏳" };
}

export default function ResultScreen({ score, total, totalTime, timePercentile, category, difficulty, challengeData, rewards, onPlayAgain, onStats }) {
  const [shareState, setShareState] = useState("idle"); // idle | copied | shared
  const percentage = Math.round((score / total) * 100);
  const { emoji, text, sub } = getMessage(score);
  const timeStr = formatTime(totalTime);
  const speedMsg = getSpeedMessage(timePercentile);

  // XP / level rewards
  const levelInfo = rewards ? getLevelInfo(rewards.totalXp) : null;
  const newBadgeDefs = rewards?.newBadges?.map(id => BADGE_DEFS.find(b => b.id === id)).filter(Boolean) ?? [];

  // Challenge comparison
  const challengeWon = challengeData ? score > challengeData.score : null;
  const challengeTied = challengeData ? score === challengeData.score : null;

  async function handleShare() {
    const rawName = localStorage.getItem(USERNAME_KEY);
    const name = (rawName && rawName !== "__skipped__") ? rawName : "A friend";
    const url = `${window.location.origin}${window.location.pathname}?challenge=1&score=${score}&total=${total}&cat=${encodeURIComponent(category || "")}&diff=${encodeURIComponent(difficulty || "")}&name=${encodeURIComponent(name)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "World 10 Questions — Challenge!", text: `${name} scored ${score}/${total}. Can you beat them?`, url });
        setShareState("shared");
      } else {
        await navigator.clipboard.writeText(url);
        setShareState("copied");
      }
    } catch {
      // user cancelled share — do nothing
    }
    setTimeout(() => setShareState("idle"), 2500);
  }

  return (
    <div className="res-screen">
      <div className="res-sparks" aria-hidden="true">
        {["⭐","✨","💫","🌟","⭐","✨","💫","🌟","⭐","✨","💫","🌟"].map((s, i) => (
          <span key={i} className="res-spark" style={{
            left: `${5 + i * 8}%`,
            animationDelay: `${i * 0.12}s`,
            animationDuration: `${1.4 + (i % 3) * 0.3}s`,
            fontSize: `${0.9 + (i % 3) * 0.4}rem`,
          }}>{s}</span>
        ))}
      </div>

      <div className="res-card">
        <div className="res-emoji">{emoji}</div>
        <h2 className="res-title">{text}</h2>
        <p className="res-sub">{sub}</p>

        {/* Challenge result banner */}
        {challengeData && (
          <div className={`res-challenge-banner ${challengeWon ? "res-ch-won" : challengeTied ? "res-ch-tied" : "res-ch-lost"}`}>
            {challengeWon  && `🏆 You beat ${challengeData.name}! (${challengeData.score}/${challengeData.total})`}
            {challengeTied && `🤝 Tied with ${challengeData.name}! (${challengeData.score}/${challengeData.total})`}
            {!challengeWon && !challengeTied && `😅 ${challengeData.name} wins this round (${challengeData.score}/${challengeData.total})`}
          </div>
        )}

        <div className="res-score-wrap">
          <span className="res-score-big">{score}</span>
          <span className="res-score-sep">/</span>
          <span className="res-score-total">{total}</span>
        </div>

        <div className="res-pct-bar-wrap">
          <div className="res-pct-bar">
            <div className="res-pct-fill" style={{ width: `${percentage}%` }} />
          </div>
          <span className="res-pct-label">{percentage}%</span>
        </div>

        {(timeStr || speedMsg) && (
          <div className="res-stats-row">
            {timeStr && (
              <div className="res-stat-pill">
                <span className="res-stat-pill-icon">⏱</span>
                <span className="res-stat-pill-val">{timeStr}</span>
              </div>
            )}
            {speedMsg && (
              <div className="res-stat-pill res-stat-pill-speed">
                <span className="res-stat-pill-icon">{speedMsg.emoji}</span>
                <span className="res-stat-pill-val">{speedMsg.text}</span>
              </div>
            )}
          </div>
        )}

        {/* XP / Level panel */}
        {rewards && (
          <div className="res-xp-panel">
            <div className="res-xp-earned">+{rewards.xpEarned} XP</div>
            {rewards.leveledUp && (
              <div className="res-levelup">⬆️ Level Up! You're now Level {rewards.newLevel}</div>
            )}
            <div className="res-xp-bar-row">
              <span className="res-xp-level-label">Lv {levelInfo.level}</span>
              <div className="res-xp-track">
                <div
                  className="res-xp-fill"
                  style={{ width: levelInfo.xpForLevel
                    ? `${Math.min(100, Math.round((levelInfo.xpIntoLevel / levelInfo.xpForLevel) * 100))}%`
                    : "100%" }}
                />
              </div>
              <span className="res-xp-sub-label">
                {levelInfo.xpForLevel
                  ? `${levelInfo.xpIntoLevel}/${levelInfo.xpForLevel}`
                  : "MAX"}
              </span>
            </div>
            {rewards.streak > 1 && (
              <div className="res-streak">🔥 {rewards.streak}-day streak!</div>
            )}
            {newBadgeDefs.length > 0 && (
              <div className="res-new-badges">
                <span className="res-badges-label">New badges:</span>
                {newBadgeDefs.map(b => (
                  <span key={b.id} className="res-badge-pill" title={b.desc}>
                    {b.emoji} {b.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="res-actions">
          <button className="res-btn-primary" onClick={(e) => { ripple(e); onPlayAgain(); }}>
            Play Again
          </button>
          <button className="res-btn-ghost" onClick={(e) => { ripple(e); onStats(); }}>
            🏆 Hall of Fame
          </button>
          {category && difficulty && (
            <button className="res-btn-share" onClick={(e) => { ripple(e); handleShare(); }}>
              {shareState === "copied" ? "✓ Link Copied!" : shareState === "shared" ? "✓ Shared!" : "⚔️ Challenge a Friend"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
