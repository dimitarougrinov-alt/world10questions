import { useEffect, useState } from "react";
import { ripple } from "../utils/ripple";
import { getPlayerStats, getPlayerSessions, getLeaderboard } from "../firebase/stats";
import { ensureFriendCode, addFriendByCode, getFriends } from "../firebase/friends";
import { getTotalXp, getLevelInfo, getStreak, getEarnedBadges, BADGE_DEFS } from "../utils/xp";

const localLevel = getLevelInfo(getTotalXp()).level;

function formatTime(ms) {
  if (!ms) return "—";
  const s = ms / 1000;
  if (s < 60) return s.toFixed(1) + "s";
  const m = Math.floor(s / 60);
  return `${m}m ${(s % 60).toFixed(1)}s`;
}

function sessionClass(pct) {
  if (pct >= 90) return "sf-session-top";
  if (pct >= 70) return "sf-session-good";
  if (pct >= 50) return "sf-session-ok";
  return "sf-session-poor";
}

function levelColorClass(level) {
  if (level >= 7) return "sf-lv-gold";
  if (level >= 5) return "sf-lv-purple";
  if (level >= 3) return "sf-lv-blue";
  return "sf-lv-grey";
}

const MEDALS = ["🥇", "🥈", "🥉"];
const RANK_CLASS = ["sf-lb-rank-1", "sf-lb-rank-2", "sf-lb-rank-3"];

const CATEGORIES = [
  { key: "capitals",   label: "World Capitals",    icon: "🗺️" },
  { key: "inventions", label: "Inventions",        icon: "💡" },
  { key: "history",    label: "Historical Events", icon: "📜" },
  { key: "people",     label: "Famous People",     icon: "🌟" },
];

const DIFFICULTIES = [
  { key: "explorer",   label: "Explorer",   icon: "🌱" },
  { key: "challenger", label: "Challenger", icon: "⚔️" },
  { key: "master",     label: "Master",     icon: "🔥" },
];

function ProgressView({ t }) {
  const xp        = getTotalXp();
  const levelInfo = getLevelInfo(xp);
  const streak    = getStreak();
  const earned    = getEarnedBadges();
  const pct       = levelInfo.xpForLevel
    ? Math.min(100, Math.round((levelInfo.xpIntoLevel / levelInfo.xpForLevel) * 100))
    : 100;

  return (
    <div className="sf-progress-view">
      <div className="sf-prog-level-card">
        <div className="sf-prog-level-ring">
          <div className="sf-prog-level-inner">{levelInfo.level}</div>
        </div>
        <div className="sf-prog-level-right">
          <div className="sf-prog-level-label">Level {levelInfo.level}</div>
          <div className="sf-prog-xp-track">
            <div className="sf-prog-xp-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="sf-prog-xp-label">
            {levelInfo.xpForLevel ? t.xp_to_next(levelInfo.xpIntoLevel, levelInfo.xpForLevel) : t.max_xp(xp)}
          </div>
        </div>
        {streak > 0 && <div className="sf-prog-streak">{t.streak_disp(streak)}</div>}
      </div>

      <h3 className="sf-section-title">{t.badges_title(earned.length, BADGE_DEFS.length)}</h3>
      <div className="sf-badges-grid">
        {BADGE_DEFS.map(b => {
          const unlocked = earned.includes(b.id);
          return (
            <div key={b.id} className={`sf-badge-card${unlocked ? " sf-badge-unlocked" : " sf-badge-locked"}`}>
              <span className="sf-badge-emoji">{unlocked ? b.emoji : "🔒"}</span>
              <span className="sf-badge-name">{b.name}</span>
              <span className="sf-badge-desc">{b.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function displayName(player) {
  if (player.username) return player.username;
  if (player.friendCode) return player.friendCode;
  if (player.country) return `Player from ${player.country}`;
  return "Player " + player.id.slice(0, 6).toUpperCase();
}

export default function StatsScreen({ playerId, googleUser, onGoogleSignIn, onGoogleSignOut, onBack, t, initialView = "stats" }) {
  const [view, setView] = useState(initialView);
  const [activeTab, setActiveTab] = useState("capitals");
  const [activeDiff, setActiveDiff] = useState("explorer");
  const [playerData, setPlayerData] = useState(null);
  const [allSessions, setAllSessions] = useState([]);
  const [leaderboards, setLeaderboards] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [friendCode, setFriendCode] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [addInput, setAddInput] = useState("");
  const [addStatus, setAddStatus] = useState(null);
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
      await addFriendByCode(playerId, addInput);
      const friendSnap = await getFriends(playerId);
      setFriends(friendSnap);
      setAddInput("");
      setAddStatus({ ok: true, msg: "Friend added! 🎉" });
    } catch (err) {
      setAddStatus({ ok: false, msg: err.message });
    }
    setTimeout(() => setAddStatus(null), 3000);
  }

  const statKey      = `${activeTab}_${activeDiff}`;
  const catStats     = playerData?.[statKey] ?? null;
  const catSessions  = allSessions.filter(s => s.category === activeTab && s.difficulty === activeDiff);
  const catLeaderboard = leaderboards[statKey] ?? [];

  return (
    <div className="sf-screen">
      <div className="sf-card">

        {/* ── Header ── */}
        <div className="sf-header">
          <div className="sf-trophy-wrap">
            <div className="sf-trophy-glow" />
            <span className="sf-trophy">🏆</span>
          </div>
          <h2 className="sf-title">Hall of Fame</h2>
        </div>

        {/* ── View toggle (sliding pill) ── */}
        <div className="sf-view-toggle" data-view={view}>
          <div className="sf-view-glider" />
          <button className="sf-view-btn" onClick={() => handleViewSwitch("stats")}>{t.stats_tab}</button>
          <button className="sf-view-btn" onClick={() => handleViewSwitch("progress")}>{t.progress_tab}</button>
          <button className="sf-view-btn" onClick={() => handleViewSwitch("friends")}>{t.friends_tab}</button>
        </div>

        {/* ── Progress view ── */}
        {view === "progress" && <ProgressView t={t} />}

        {/* ── Stats view ── */}
        {view === "stats" && (
          <>
            {/* Category filter */}
            <div className="sf-filter-row">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  className={`sf-chip${activeTab === cat.key ? " sf-chip-active sf-chip-cat" : ""}`}
                  onClick={() => setActiveTab(cat.key)}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Difficulty filter */}
            <div className="sf-filter-row sf-filter-diff">
              {DIFFICULTIES.map(d => (
                <button
                  key={d.key}
                  className={`sf-chip sf-chip-diff-${d.key}${activeDiff === d.key ? " sf-chip-active sf-chip-diff-active" : ""}`}
                  onClick={() => setActiveDiff(d.key)}
                >
                  {d.icon} {d.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="sf-loading">
                <span className="sf-loading-dot" /><span className="sf-loading-dot" /><span className="sf-loading-dot" />
              </div>
            ) : error ? (
              <p className="sf-error">{error}</p>
            ) : (
              <>
                {/* Your stats */}
                <section className="sf-section">
                  <h3 className="sf-section-title">{t.your_stats}</h3>
                  {catStats ? (
                    <div className="sf-stat-grid">
                      {/* Hero stat */}
                      <div className={`sf-stat-hero${catStats.bestPercentage === 100 ? " sf-stat-perfect" : ""}`}>
                        <div className="sf-stat-hero-ring">
                          <span className="sf-stat-hero-val">{catStats.bestPercentage}%</span>
                          {catStats.bestPercentage === 100 && <span className="sf-stat-perfect-crown">👑</span>}
                        </div>
                        <span className="sf-stat-hero-lbl">{t.best_score}</span>
                      </div>
                      {/* Secondary stats */}
                      <div className="sf-stat-secondary">
                        <div className="sf-stat-box">
                          <span className="sf-stat-val">{catStats.gamesPlayed}</span>
                          <span className="sf-stat-lbl">{t.games_lbl}</span>
                        </div>
                        <div className="sf-stat-box">
                          <span className="sf-stat-val">{catStats.avgPercentage}%</span>
                          <span className="sf-stat-lbl">{t.avg_score}</span>
                        </div>
                      </div>
                      {/* Time strip */}
                      <div className="sf-stat-time">
                        <span className="sf-stat-time-icon">⚡</span>
                        <span className="sf-stat-time-val">{formatTime(catStats.bestTime)}</span>
                        <span className="sf-stat-time-lbl">{t.fastest}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="sf-empty">
                      {t.no_stats(DIFFICULTIES.find(d => d.key === activeDiff)?.icon, activeDiff, CATEGORIES.find(c => c.key === activeTab)?.label)}
                    </p>
                  )}
                </section>

                {/* Global leaderboard */}
                <section className="sf-section">
                  <h3 className="sf-section-title">{t.global_lb}</h3>
                  {catLeaderboard.length === 0 ? (
                    <p className="sf-empty">{t.no_players}</p>
                  ) : (
                    <ol className="sf-lb">
                      {catLeaderboard.map((p, i) => {
                        const isYou = p.id === playerId;
                        const level = isYou ? localLevel : (p.level ?? 1);
                        return (
                          <li key={p.id} className={`sf-lb-item${isYou ? " sf-lb-you" : ""}${i < 3 ? ` ${RANK_CLASS[i]}` : ""}`}>
                            <span className="sf-lb-rank">{i < 3 ? MEDALS[i] : `#${i + 1}`}</span>
                            <span className={`sf-lb-level ${levelColorClass(level)}`}>Lv{level}</span>
                            <span className="sf-lb-name">{isYou ? "⭐ You" : displayName(p)}</span>
                            <span className="sf-lb-pct">{p.bestPercentage}%</span>
                            <span className="sf-lb-time">{formatTime(p.bestTime)}</span>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </section>

                {/* Recent games */}
                {catSessions.length > 0 && (
                  <section className="sf-section">
                    <h3 className="sf-section-title">{t.recent_games}</h3>
                    <ul className="sf-sessions">
                      {catSessions.slice(0, 10).map((s, i) => (
                        <li key={s.id} className={`sf-session ${sessionClass(s.percentage)}`}>
                          <span className="sf-session-num">#{i + 1}</span>
                          <span className="sf-session-score">{s.score}/{s.total}</span>
                          <div className="sf-session-bar-wrap">
                            <div className="sf-session-bar" style={{ width: `${s.percentage}%` }} />
                          </div>
                          <span className="sf-session-pct">{s.percentage}%</span>
                          <span className="sf-session-time">⏱ {formatTime(s.totalTime)}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            )}
          </>
        )}

        {/* ── Friends view ── */}
        {view === "friends" && (
          <div className="sf-friends-view">
            {friendsLoading ? (
              <div className="sf-loading">
                <span className="sf-loading-dot" /><span className="sf-loading-dot" /><span className="sf-loading-dot" />
              </div>
            ) : (
              <>
                <section className="sf-section">
                  <h3 className="sf-section-title">{t.your_code}</h3>
                  <p className="sf-code-hint">{t.code_hint}</p>
                  <div className="sf-code-row">
                    <span className="sf-code-display">{friendCode || "—"}</span>
                    <button className="sf-code-copy" onClick={handleCopyCode}>
                      {codeCopied ? t.copied_code : t.copy_btn}
                    </button>
                  </div>
                </section>

                <section className="sf-section">
                  <h3 className="sf-section-title">{t.add_friend}</h3>
                  <div className="sf-add-row">
                    <input
                      className="sf-add-input"
                      placeholder={t.code_ph}
                      value={addInput}
                      onChange={e => setAddInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleAddFriend()}
                    />
                    <button
                      className="sf-add-btn"
                      onClick={e => { ripple(e); handleAddFriend(); }}
                      disabled={addStatus === "loading" || !addInput.trim()}
                    >
                      {addStatus === "loading" ? "…" : t.add_btn}
                    </button>
                  </div>
                  {addStatus && addStatus !== "loading" && (
                    <p className={`sf-add-status ${addStatus.ok ? "sf-add-ok" : "sf-add-err"}`}>{addStatus.msg}</p>
                  )}
                </section>

                <section className="sf-section">
                  <h3 className="sf-section-title">{t.friends_ttl(friends.length)}</h3>
                  {friends.length === 0 ? (
                    <p className="sf-empty">{t.no_friends}</p>
                  ) : (
                    <ol className="sf-lb">
                      {friends
                        .sort((a, b) => (b.bestPercentage ?? 0) - (a.bestPercentage ?? 0))
                        .map((f, i) => (
                          <li key={f.id} className={`sf-lb-item${i < 3 ? ` ${RANK_CLASS[i]}` : ""}`}>
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

        {/* ── Identity / Google ── */}
        {googleUser ? (
          <div className="sf-identity sf-identity-signedin">
            <img className="sf-avatar" src={googleUser.photoURL} alt="" referrerPolicy="no-referrer" />
            <span className="sf-identity-name">{googleUser.displayName || googleUser.email}</span>
            <button className="sf-signout-btn" onClick={onGoogleSignOut}>{t.sign_out}</button>
          </div>
        ) : (
          <div className="sf-identity">
            <p className="sf-identity-pitch">{t.save_prog}</p>
            <button className="sf-google-btn" onClick={e => { ripple(e); onGoogleSignIn(); }}>
              <svg className="sf-google-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t.sign_google}
            </button>
          </div>
        )}

        <button className="sf-back-btn" onClick={e => { ripple(e); onBack(); }}>
          {t.back_home}
        </button>

      </div>
    </div>
  );
}
