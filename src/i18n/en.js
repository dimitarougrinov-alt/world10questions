const en = {
  // ── Language ──────────────────────────────────────────────
  langCode: "en",

  // ── StartScreen ───────────────────────────────────────────
  subtitle:            "Choose your challenge and show the world what you know! 🏆",
  pick_level:          (cat) => `${cat} — Pick your level!`,
  cat_capitals_label:  "World Capitals",
  cat_capitals_sub:    "Name the capital cities!",
  cat_inventions_label:"Inventions",
  cat_inventions_sub:  "Who invented what?",
  cat_history_label:   "Historical Events",
  cat_history_sub:     "When did it happen?",
  cat_people_label:    "Famous People",
  cat_people_sub:      "Who did what?",
  diff_explorer_desc:   "Famous & well-known",
  diff_challenger_desc: "Test your knowledge",
  diff_master_desc:     "Only the best know these",
  diff_locked:          (level) => `Reach Level ${level} to unlock`,
  diff_need_explorer:   "Score 80%+ in Explorer first",
  diff_need_challenger: "Score 80%+ in Challenger first",
  hof_btn:             "🏆 Hall of Fame",
  back_btn:            "← Back",
  loading:             "⏳ Loading your quiz…",
  max_level:           "Max Level ✨",

  // ── Quiz questions ─────────────────────────────────────────
  capital_q:    (country)    => `What is the capital of ${country}?`,
  invention_q:  (invention)  => `Who invented the ${invention}?`,

  // ── Result messages ────────────────────────────────────────
  results: [
    { min: 10, emoji: "🏆", text: "Legendary!",  sub: "You got every single one!" },
    { min: 8,  emoji: "🌟", text: "Superstar!",  sub: "Nearly perfect — amazing!" },
    { min: 6,  emoji: "🚀", text: "Great Job!",  sub: "You're on your way up!" },
    { min: 4,  emoji: "📚", text: "Keep Going!", sub: "Practice makes perfect!" },
    { min: 0,  emoji: "💪", text: "Try Again!",  sub: "You've got this next time!" },
  ],

  // ── ResultScreen ───────────────────────────────────────────
  play_again:    "▶ Play Again",
  home_btn:      "🏠 Home",
  hof_result:    "🏆 Hall of Fame",
  challenge_btn: "⚔️ Challenge a Friend",
  link_copied:   "✓ Link Copied!",
  shared_ok:     "✓ Shared!",
  faster_than:   (pct) => `Faster than ${pct}% of players with the same score!`,
  beat_time:     "Try to beat your time next round!",
  ch_won:        (name, s, t) => `🏆 You beat ${name}! (${s}/${t})`,
  ch_tied:       (name, s, t) => `🤝 Tied with ${name}! (${s}/${t})`,
  ch_lost:       (name, s, t) => `😅 ${name} wins this round (${s}/${t})`,
  xp_earned:     (n)    => `+${n} XP`,
  level_up:      (lvl)  => `⬆️ Level Up! You're now Level ${lvl}`,
  streak_msg:    (n)    => `🔥 ${n}-day streak!`,
  new_badges:    "New badges:",

  // ── StatsScreen ────────────────────────────────────────────
  stats_tab:    "📊 Stats",
  progress_tab: "🏅 Progress",
  friends_tab:  "👥 Friends",
  your_stats:   "⚡ Your Stats",
  recent_games: "🕹️ Recent Games",
  global_lb:    "🌍 Global Leaderboard",
  no_players:   "No players yet. Be the first! 🌟",
  no_stats:     (icon, diff, cat) => `No ${icon} ${diff} ${cat} games yet — go play one! 🚀`,
  games_lbl:    "Games",
  avg_score:    "Avg Score",
  best_score:   "Best Score",
  fastest:      "Fastest at Best Score",
  back_home:    "← Back to Home",
  xp_to_next:   (cur, total) => `${cur} / ${total} XP to next level`,
  max_xp:       (xp) => `${xp} XP — Max Level! ✨`,
  badges_title: (e, t) => `🏅 Badges (${e} / ${t})`,
  streak_disp:  (n) => `🔥 ${n}-day streak`,
  your_code:    "🔑 Your Friend Code",
  code_hint:    "Share this with friends so they can add you.",
  copy_btn:     "Copy",
  copied_code:  "✓ Copied!",
  add_friend:   "➕ Add a Friend",
  code_ph:      "Enter their code…",
  add_btn:      "Add",
  friends_ttl:  (n) => `👥 Friends (${n})`,
  no_friends:   "No friends yet. Add one above! 🤝",
  save_prog:    "Save progress & compete with your friends!",
  sign_google:  "Sign in with Google",
  sign_out:     "Sign out",

  // ── UsernamePrompt ─────────────────────────────────────────
  up_title:     "What's your name?",
  up_sub:       "Show up on the leaderboard with a name you choose.",
  up_ph:        "Enter your name…",
  up_save:      "Save my name",
  up_saving:    "Saving…",
  up_skip:      "Maybe later",

  // ── ChallengeScreen ────────────────────────────────────────
  ch_title:     "⚔️ You've been challenged!",
  ch_taunt:     (name, s, t) => `${name} scored ${s}/${t}. Can you beat them?`,
  ch_accept:    "Accept Challenge ⚔️",
  ch_decline:   "Play something else",
  ch_cat_label: (cat) =>
    cat === "capitals"   ? "🗺️ World Capitals" :
    cat === "inventions" ? "💡 Inventions" :
    cat === "history"    ? "📜 Historical Events" :
                           "🌟 Famous People",
};

export default en;
