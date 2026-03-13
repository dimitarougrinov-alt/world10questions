import { useEffect, useState } from "react";
import { getPlayerStats, getPlayerSessions, getLeaderboard } from "../firebase/stats";

export default function StatsScreen({ playerId, onBack }) {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [s, hist, lb] = await Promise.all([
          getPlayerStats(playerId),
          getPlayerSessions(playerId),
          getLeaderboard(),
        ]);
        setStats(s);
        setSessions(hist);
        setLeaderboard(lb);
      } catch (err) {
        console.error(err);
        setError(`${err.code}: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [playerId]);

  function displayName(id) {
    return "Player " + id.slice(0, 6).toUpperCase();
  }

  return (
    <div className="screen stats-screen">
      <div className="stats-card">
        <h2 className="stats-title">📊 My Stats</h2>

        {loading ? (
          <p className="stats-loading">Loading…</p>
        ) : error ? (
          <p className="stats-empty" style={{color: "red"}}>{error}</p>
        ) : (
          <>
            {/* Personal summary */}
            <div className="stats-section">
              <h3 className="stats-section-title">Your Performance</h3>
              {stats ? (
                <div className="stats-grid">
                  <div className="stat-box">
                    <span className="stat-value">{stats.gamesPlayed}</span>
                    <span className="stat-label">Games Played</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{stats.avgPercentage}%</span>
                    <span className="stat-label">Avg Score</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{stats.bestPercentage}%</span>
                    <span className="stat-label">Best Score</span>
                  </div>
                </div>
              ) : (
                <p className="stats-empty">No games played yet. Start a quiz!</p>
              )}
            </div>

            {/* Recent history */}
            {sessions.length > 0 && (
              <div className="stats-section">
                <h3 className="stats-section-title">Recent Games</h3>
                <ul className="session-list">
                  {sessions.map((s) => (
                    <li key={s.id} className="session-item">
                      <span className="session-score">{s.score}/{s.total}</span>
                      <span className="session-pct">{s.percentage}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Global leaderboard */}
            <div className="stats-section">
              <h3 className="stats-section-title">🏆 Global Leaderboard</h3>
              {leaderboard.length === 0 ? (
                <p className="stats-empty">No players yet.</p>
              ) : (
                <ol className="leaderboard-list">
                  {leaderboard.map((p, i) => (
                    <li
                      key={p.id}
                      className={`leaderboard-item${p.id === playerId ? " leaderboard-you" : ""}`}
                    >
                      <span className="lb-rank">#{i + 1}</span>
                      <span className="lb-name">
                        {p.id === playerId ? "You" : displayName(p.id)}
                      </span>
                      <span className="lb-avg">{p.avgPercentage}%</span>
                      <span className="lb-games">{p.gamesPlayed} {p.gamesPlayed === 1 ? "game" : "games"}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </>
        )}

        <button className="btn btn-primary" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}
