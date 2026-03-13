import { useEffect, useState } from "react";
import { ripple } from "../utils/ripple";
import { getPlayerStats, getPlayerSessions, getLeaderboard } from "../firebase/stats";

function formatTime(ms) {
  if (!ms) return "—";
  const s = ms / 1000;
  if (s < 60) return s.toFixed(1) + "s";
  const m = Math.floor(s / 60);
  return `${m}m ${(s % 60).toFixed(1)}s`;
}

const MEDALS = ["🥇", "🥈", "🥉"];

const CATEGORIES = [
  { key: "capitals",   label: "World Capitals", icon: "🗺️" },
  { key: "inventions", label: "Inventions",     icon: "💡" },
];

const DIFFICULTIES = [
  { key: "explorer",   label: "Explorer",   icon: "🌱" },
  { key: "challenger", label: "Challenger", icon: "⚔️" },
  { key: "master",     label: "Master",     icon: "🔥" },
];

export default function StatsScreen({ playerId, onBack }) {
  const [activeTab, setActiveTab] = useState("capitals");
  const [activeDiff, setActiveDiff] = useState("explorer");
  const [playerData, setPlayerData] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [leaderboards, setLeaderboards] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const lbPromises = [];
        const lbKeys = [];
        for (const cat of CATEGORIES) {
          for (const diff of DIFFICULTIES) {
            lbKeys.push(`${cat.key}_${diff.key}`);
            lbPromises.push(getLeaderboard(cat.key, diff.key));
          }
        }
        const [pd, sessions, ...lbResults] = await Promise.all([
          getPlayerStats(playerId),
          getPlayerSessions(playerId),
          ...lbPromises,
        ]);
        setPlayerData(pd);
        setAllSessions(sessions);
        const lbMap = {};
        lbKeys.forEach((k, i) => { lbMap[k] = lbResults[i]; });
        setLeaderboards(lbMap);
      } catch (err) {
        console.error(err);
        setError(`${err.code}: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [playerId]);

  function displayName(player) {
    if (player.country) return `Player from ${player.country}`;
    return "Player " + player.id.slice(0, 6).toUpperCase();
  }

  const statKey = `${activeTab}_${activeDiff}`;
  const catStats = playerData?.[statKey] ?? null;
  const catSessions = allSessions.filter((s) => s.category === activeTab && s.difficulty === activeDiff);
  const catLeaderboard = leaderboards[statKey] ?? [];

  return (
    <div className="sf-screen">
      <div className="sf-card">

        {/* Header */}
        <div className="sf-header">
          <div className="sf-trophy">🏆</div>
          <h2 className="sf-title">Hall of Fame</h2>
        </div>

        {/* Category tabs */}
        <div className="sf-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`sf-tab${activeTab === cat.key ? " sf-tab-active" : ""}`}
              onClick={() => setActiveTab(cat.key)}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Difficulty sub-tabs */}
        <div className="sf-diff-tabs">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.key}
              className={`sf-diff-tab sf-diff-${d.key}${activeDiff === d.key ? " sf-diff-active" : ""}`}
              onClick={() => setActiveDiff(d.key)}
            >
              {d.icon} {d.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="sf-loading">
            <span className="sf-loading-dot" />
            <span className="sf-loading-dot" />
            <span className="sf-loading-dot" />
          </div>
        ) : error ? (
          <p className="sf-error">{error}</p>
        ) : (
          <>
            {/* Personal stats for this category + difficulty */}
            <section className="sf-section">
              <h3 className="sf-section-title">⚡ Your Stats</h3>
              {catStats ? (
                <div className="sf-stat-grid">
                  <div className="sf-stat-box">
                    <span className="sf-stat-val">{catStats.gamesPlayed}</span>
                    <span className="sf-stat-lbl">Games</span>
                  </div>
                  <div className="sf-stat-box">
                    <span className="sf-stat-val">{catStats.avgPercentage}%</span>
                    <span className="sf-stat-lbl">Avg Score</span>
                  </div>
                  <div className="sf-stat-box">
                    <span className="sf-stat-val sf-stat-gold">{catStats.bestPercentage}%</span>
                    <span className="sf-stat-lbl">Best Score</span>
                  </div>
                  <div className="sf-stat-box sf-stat-wide">
                    <span className="sf-stat-val">{formatTime(catStats.bestTime)}</span>
                    <span className="sf-stat-lbl">Fastest at Best Score</span>
                  </div>
                </div>
              ) : (
                <p className="sf-empty">
                  No {DIFFICULTIES.find(d => d.key === activeDiff)?.icon} {activeDiff} {activeTab} games yet — go play one! 🚀
                </p>
              )}
            </section>

            {/* Recent games */}
            {catSessions.length > 0 && (
              <section className="sf-section">
                <h3 className="sf-section-title">🕹️ Recent Games</h3>
                <ul className="sf-sessions">
                  {catSessions.slice(0, 10).map((s, i) => (
                    <li key={s.id} className="sf-session">
                      <span className="sf-session-num">#{i + 1}</span>
                      <span className="sf-session-score">{s.score}/{s.total}</span>
                      <span className="sf-session-pct">{s.percentage}%</span>
                      <span className="sf-session-time">⏱ {formatTime(s.totalTime)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Leaderboard */}
            <section className="sf-section">
              <h3 className="sf-section-title">🌍 Global Leaderboard</h3>
              {catLeaderboard.length === 0 ? (
                <p className="sf-empty">No players yet. Be the first! 🌟</p>
              ) : (
                <ol className="sf-lb">
                  {catLeaderboard.map((p, i) => {
                    const isYou = p.id === playerId;
                    return (
                      <li key={p.id} className={`sf-lb-item${isYou ? " sf-lb-you" : ""}`}>
                        <span className="sf-lb-rank">
                          {i < 3 ? MEDALS[i] : `#${i + 1}`}
                        </span>
                        <span className="sf-lb-name">
                          {isYou ? "⭐ You" : displayName(p)}
                        </span>
                        <span className="sf-lb-pct">{p.bestPercentage}%</span>
                        <span className="sf-lb-time">{formatTime(p.bestTime)}</span>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          </>
        )}

        <button className="sf-back-btn" onClick={(e) => { ripple(e); onBack(); }}>
          ← Back to Home
        </button>

      </div>
    </div>
  );
}
