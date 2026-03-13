import { useEffect, useState } from "react";
import { ripple } from "../utils/ripple";
import { getPlayerStats, getPlayerSessions, getLeaderboard } from "../firebase/stats";
import { ensureFriendCode, addFriendByCode, getFriends } from "../firebase/friends";

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

function displayName(player) {
  if (player.username) return player.username;
  if (player.friendCode) return player.friendCode;
  if (player.country) return `Player from ${player.country}`;
  return "Player " + player.id.slice(0, 6).toUpperCase();
}

export default function StatsScreen({ playerId, googleUser, onGoogleSignIn, onGoogleSignOut, onBack }) {
  const [view, setView] = useState("stats"); // "stats" | "friends"
  const [activeTab, setActiveTab] = useState("capitals");
  const [activeDiff, setActiveDiff] = useState("explorer");
  const [playerData, setPlayerData] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [leaderboards, setLeaderboards] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Friends state
  const [friendCode, setFriendCode] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [addInput, setAddInput] = useState("");
  const [addStatus, setAddStatus] = useState(null); // null | "loading" | {ok: bool, msg: string}
  const [codeCopied, setCodeCopied] = useState(false);

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

  async function loadFriends() {
    setFriendsLoading(true);
    try {
      const [code, friendList] = await Promise.all([
        ensureFriendCode(playerId),
        getFriends(playerId),
      ]);
      setFriendCode(code);
      setFriends(friendList);
    } catch (err) {
      console.error(err);
    } finally {
      setFriendsLoading(false);
    }
  }

  function handleViewSwitch(v) {
    setView(v);
    if (v === "friends" && !friendCode) loadFriends();
  }

  async function handleCopyCode() {
    if (!friendCode) return;
    await navigator.clipboard.writeText(friendCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  async function handleAddFriend() {
    if (!addInput.trim()) return;
    setAddStatus("loading");
    try {
      const friendId = await addFriendByCode(playerId, addInput);
      const friendSnap = await getFriends(playerId);
      setFriends(friendSnap);
      setAddInput("");
      setAddStatus({ ok: true, msg: "Friend added! 🎉" });
    } catch (err) {
      setAddStatus({ ok: false, msg: err.message });
    }
    setTimeout(() => setAddStatus(null), 3000);
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

        {/* Top-level view toggle */}
        <div className="sf-view-toggle">
          <button
            className={`sf-view-btn${view === "stats" ? " sf-view-active" : ""}`}
            onClick={() => handleViewSwitch("stats")}
          >
            📊 My Stats
          </button>
          <button
            className={`sf-view-btn${view === "friends" ? " sf-view-active" : ""}`}
            onClick={() => handleViewSwitch("friends")}
          >
            👥 Friends
          </button>
        </div>

        {view === "stats" ? (
          <>
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
                            <span className="sf-lb-rank">{i < 3 ? MEDALS[i] : `#${i + 1}`}</span>
                            <span className="sf-lb-name">{isYou ? "⭐ You" : displayName(p)}</span>
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
          </>
        ) : (
          /* FRIENDS VIEW */
          <div className="sf-friends-view">
            {friendsLoading ? (
              <div className="sf-loading">
                <span className="sf-loading-dot" />
                <span className="sf-loading-dot" />
                <span className="sf-loading-dot" />
              </div>
            ) : (
              <>
                {/* Your code */}
                <section className="sf-section">
                  <h3 className="sf-section-title">🔑 Your Friend Code</h3>
                  <p className="sf-code-hint">Share this with friends so they can add you.</p>
                  <div className="sf-code-row">
                    <span className="sf-code-display">{friendCode || "—"}</span>
                    <button className="sf-code-copy" onClick={handleCopyCode}>
                      {codeCopied ? "✓ Copied!" : "Copy"}
                    </button>
                  </div>
                </section>

                {/* Add friend */}
                <section className="sf-section">
                  <h3 className="sf-section-title">➕ Add a Friend</h3>
                  <div className="sf-add-row">
                    <input
                      className="sf-add-input"
                      placeholder="Enter their code…"
                      value={addInput}
                      onChange={(e) => setAddInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddFriend()}
                    />
                    <button
                      className="sf-add-btn"
                      onClick={(e) => { ripple(e); handleAddFriend(); }}
                      disabled={addStatus === "loading" || !addInput.trim()}
                    >
                      {addStatus === "loading" ? "…" : "Add"}
                    </button>
                  </div>
                  {addStatus && addStatus !== "loading" && (
                    <p className={`sf-add-status ${addStatus.ok ? "sf-add-ok" : "sf-add-err"}`}>
                      {addStatus.msg}
                    </p>
                  )}
                </section>

                {/* Friends list */}
                <section className="sf-section">
                  <h3 className="sf-section-title">👥 Friends ({friends.length})</h3>
                  {friends.length === 0 ? (
                    <p className="sf-empty">No friends yet. Add one above! 🤝</p>
                  ) : (
                    <ol className="sf-lb">
                      {friends
                        .sort((a, b) => (b.bestPercentage ?? 0) - (a.bestPercentage ?? 0))
                        .map((f, i) => (
                          <li key={f.id} className="sf-lb-item">
                            <span className="sf-lb-rank">{i < 3 ? MEDALS[i] : `#${i + 1}`}</span>
                            <span className="sf-lb-name">{displayName(f)}</span>
                            <span className="sf-lb-pct">{f.bestPercentage ?? 0}%</span>
                            <span className="sf-lb-time">{formatTime(f.bestTime ?? null)}</span>
                          </li>
                        ))}
                    </ol>
                  )}
                </section>
              </>
            )}
          </div>
        )}

        {/* Identity / Save Progress */}
        {googleUser ? (
          <div className="sf-identity sf-identity-signedin">
            <img className="sf-avatar" src={googleUser.photoURL} alt="" referrerPolicy="no-referrer" />
            <span className="sf-identity-name">{googleUser.displayName || googleUser.email}</span>
            <button className="sf-signout-btn" onClick={onGoogleSignOut}>Sign out</button>
          </div>
        ) : (
          <div className="sf-identity">
            <p className="sf-identity-pitch">Save progress &amp; compete with your friends!</p>
            <button className="sf-google-btn" onClick={(e) => { ripple(e); onGoogleSignIn(); }}>
              <svg className="sf-google-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        )}

        <button className="sf-back-btn" onClick={(e) => { ripple(e); onBack(); }}>
          ← Back to Home
        </button>

      </div>
    </div>
  );
}
