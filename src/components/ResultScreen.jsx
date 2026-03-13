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

import { ripple } from "../utils/ripple";

export default function ResultScreen({ score, total, totalTime, timePercentile, onPlayAgain, onStats }) {
  const percentage = Math.round((score / total) * 100);
  const { emoji, text, sub } = getMessage(score);
  const timeStr = formatTime(totalTime);
  const speedMsg = getSpeedMessage(timePercentile);

  return (
    <div className="res-screen">

      {/* Celebration sparks */}
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

        <div className="res-actions">
          <button className="res-btn-primary" onClick={(e) => { ripple(e); onPlayAgain(); }}>
            Play Again
          </button>
          <button className="res-btn-ghost" onClick={(e) => { ripple(e); onStats(); }}>
            🏆 Hall of Fame
          </button>
        </div>
      </div>
    </div>
  );
}
