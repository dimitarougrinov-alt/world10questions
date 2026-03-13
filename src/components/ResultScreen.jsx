import { useState, useEffect } from "react";
import { ripple } from "../utils/ripple";
import { USERNAME_KEY } from "../utils/player";
import { getLevelInfo, BADGE_DEFS } from "../utils/xp";
import UnlockPopup from "./UnlockPopup";
import BadgePopup from "./BadgePopup";

function formatTime(ms) {
  if (!ms) return null;
  const s = ms / 1000;
  if (s < 60) return s.toFixed(1) + "s";
  const m = Math.floor(s / 60);
  return `${m}m ${(s % 60).toFixed(1)}s`;
}

export default function ResultScreen({ score, total, totalTime, timePercentile, category, difficulty, challengeData, rewards, unlockedDifficulty, onPlayAgain, onHome, onStats, t }) {
  const [shareState, setShareState] = useState("idle");
  const [showUnlock, setShowUnlock] = useState(false);
  const [showBadges, setShowBadges] = useState(false);

  useEffect(() => {
    const hasBadges = newBadgeDefs.length > 0;
    const hasUnlock = !!unlockedDifficulty;
    if (!hasUnlock && !hasBadges) return;
    const timer = setTimeout(() => {
      if (hasUnlock) setShowUnlock(true);
      else           setShowBadges(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  function handleUnlockClose() {
    setShowUnlock(false);
    if (newBadgeDefs.length > 0) setTimeout(() => setShowBadges(true), 500);
  }
  const percentage = Math.round((score / total) * 100);
  const { emoji, text, sub } = t.results.find((m) => score >= m.min);
  const timeStr = formatTime(totalTime);

  const speedMsg = (() => {
    if (timePercentile === null) return null;
    if (timePercentile > 0) return { text: t.faster_than(timePercentile), emoji: timePercentile >= 90 ? "⚡" : timePercentile >= 50 ? "🚀" : "👍" };
    return { text: t.beat_time, emoji: "⏳" };
  })();

  const levelInfo = rewards ? getLevelInfo(rewards.totalXp) : null;
  const newBadgeDefs = rewards?.newBadges?.map(id => BADGE_DEFS.find(b => b.id === id)).filter(Boolean) ?? [];

  const challengeWon  = challengeData ? score > challengeData.score : null;
  const challengeTied = challengeData ? score === challengeData.score : null;

  // Ambient glow colour based on performance
  const glowColor = percentage >= 80
    ? "rgba(255, 200, 50, 0.18)"
    : percentage >= 50
      ? "rgba(78, 205, 196, 0.13)"
      : "rgba(100, 120, 220, 0.12)";

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
      // user cancelled
    }
    setTimeout(() => setShareState("idle"), 2500);
  }

  return (
    <div className="res-screen">
      {showUnlock && (
        <UnlockPopup difficulty={unlockedDifficulty} onClose={handleUnlockClose} />
      )}
      {showBadges && newBadgeDefs.length > 0 && (
        <BadgePopup badges={newBadgeDefs} onClose={() => setShowBadges(false)} />
      )}
      {/* Ambient score glow */}
      <div
        className="res-ambient"
        aria-hidden="true"
        style={{ background: `radial-gradient(ellipse at 50% 25%, ${glowColor}, transparent 68%)` }}
      />

      {/* Falling sparks */}
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

        {/* ── 1. Header ── */}
        <div className="res-header res-reveal">
          <div className="res-emoji">{emoji}</div>
          <h2 className="res-title">{text}</h2>
          <p className="res-sub">{sub}</p>
        </div>

        {/* ── 2. Challenge banner ── */}
        {challengeData && (
          <div className={`res-challenge-banner res-reveal res-reveal-d1 ${challengeWon ? "res-ch-won" : challengeTied ? "res-ch-tied" : "res-ch-lost"}`}>
            {challengeWon  && t.ch_won(challengeData.name, challengeData.score, challengeData.total)}
            {challengeTied && t.ch_tied(challengeData.name, challengeData.score, challengeData.total)}
            {!challengeWon && !challengeTied && t.ch_lost(challengeData.name, challengeData.score, challengeData.total)}
          </div>
        )}

        {/* ── 3. Score hero ── */}
        <div className="res-score-hero res-reveal res-reveal-d1">
          <div className="res-score-wrap">
            <span className="res-score-big">{score}</span>
            <span className="res-score-sep">/</span>
            <span className="res-score-total">{total}</span>
          </div>
          <div className="res-pct-bar-wrap">
            <div className="res-pct-bar">
              <div className="res-pct-fill" style={{ "--pct": `${percentage}%` }} />
            </div>
            <span className="res-pct-label">{percentage}%</span>
          </div>
        </div>

        {/* ── 4. Stats ── */}
        {(timeStr || speedMsg) && (
          <div className="res-stats-row res-reveal res-reveal-d2">
            {timeStr && (
              <div className="res-stat-card">
                <span className="res-stat-card-icon">⏱</span>
                <div className="res-stat-card-body">
                  <span className="res-stat-card-val">{timeStr}</span>
                  <span className="res-stat-card-lbl">Time</span>
                </div>
              </div>
            )}
            {speedMsg && (
              <div className="res-stat-card res-stat-card-speed">
                <span className="res-stat-card-icon">{speedMsg.emoji}</span>
                <div className="res-stat-card-body">
                  <span className="res-stat-card-val res-stat-card-val-sm">{speedMsg.text}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 5. XP / Level panel ── */}
        {rewards && (
          <div className={`res-xp-panel res-reveal res-reveal-d3${rewards.leveledUp ? " res-xp-levelup" : ""}`}>
            <div className="res-xp-top">
              <span className="res-xp-earned">{t.xp_earned(rewards.xpEarned)}</span>
              {rewards.streak > 1 && (
                <span className="res-streak">{t.streak_msg(rewards.streak)}</span>
              )}
            </div>

            {rewards.leveledUp && (
              <div className="res-levelup">
                <span className="res-levelup-shine" aria-hidden="true" />
                <span className="res-levelup-text">{t.level_up(rewards.newLevel)}</span>
              </div>
            )}

            <div className="res-xp-bar-row">
              <span className="res-xp-level-label">Lv {levelInfo.level}</span>
              <div className="res-xp-track">
                <div
                  className="res-xp-fill"
                  style={{ "--xp-pct": levelInfo.xpForLevel
                    ? `${Math.min(100, Math.round((levelInfo.xpIntoLevel / levelInfo.xpForLevel) * 100))}%`
                    : "100%" }}
                />
              </div>
              <span className="res-xp-sub-label">
                {levelInfo.xpForLevel ? `${levelInfo.xpIntoLevel}/${levelInfo.xpForLevel}` : "MAX"}
              </span>
            </div>

            {newBadgeDefs.length > 0 && (
              <div className="res-new-badges">
                <span className="res-badges-label">{t.new_badges}</span>
                {newBadgeDefs.map(b => (
                  <span key={b.id} className="res-badge-pill" title={b.desc}>
                    {b.emoji} {b.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 6. Actions ── */}
        <div className="res-actions res-reveal res-reveal-d4">
          <button className="res-btn-primary" onClick={(e) => { ripple(e); onPlayAgain(); }}>
            {t.play_again}
          </button>
          <div className="res-btn-row">
            <button className="res-btn-ghost" onClick={(e) => { ripple(e); onHome(); }}>
              {t.home_btn}
            </button>
            <button className="res-btn-ghost" onClick={(e) => { ripple(e); onStats(); }}>
              {t.hof_result}
            </button>
          </div>
          {category && difficulty && (
            <button className="res-btn-share" onClick={(e) => { ripple(e); handleShare(); }}>
              {shareState === "copied" ? t.link_copied : shareState === "shared" ? t.shared_ok : t.challenge_btn}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
