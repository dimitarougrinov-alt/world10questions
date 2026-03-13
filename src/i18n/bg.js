const bg = {
  // ── Language ──────────────────────────────────────────────
  langCode: "bg",

  // ── StartScreen ───────────────────────────────────────────
  subtitle:            "Избери предизвикателство и покажи на света какво знаеш! 🏆",
  pick_level:          (cat) => `${cat} — Избери ниво!`,
  cat_capitals_label:  "Столици на света",
  cat_capitals_sub:    "Назови столичния град!",
  cat_inventions_label:"Изобретения",
  cat_inventions_sub:  "Кой какво е изобретил?",
  cat_history_label:   "Исторически събития",
  cat_history_sub:     "Кога се е случило?",
  cat_people_label:    "Известни личности",
  cat_people_sub:      "Кой какво е направил?",
  diff_explorer_desc:   "Известни и популярни",
  diff_challenger_desc: "Провери знанията си",
  diff_master_desc:     "Само най-добрите знаят",
  diff_locked:          (level) => `Достигни ниво ${level} за достъп`,
  diff_need_explorer:   "Постигни 80%+ в Explorer първо",
  diff_need_challenger: "Постигни 80%+ в Challenger първо",
  hof_btn:             "🏆 Зала на славата",
  back_btn:            "← Назад",
  loading:             "⏳ Зареждане на теста…",
  max_level:           "Максимално ниво ✨",

  // ── Quiz questions ─────────────────────────────────────────
  capital_q:   (country)   => `Коя е столицата на ${country}?`,
  invention_q: (invention) => `Кой е изобретил ${invention}?`,

  // ── Result messages ────────────────────────────────────────
  results: [
    { min: 10, emoji: "🏆", text: "Легендарно!",    sub: "Всички верни отговори!" },
    { min: 8,  emoji: "🌟", text: "Невероятно!",    sub: "Почти перфектно — браво!" },
    { min: 6,  emoji: "🚀", text: "Отлично!",       sub: "Вървиш напред!" },
    { min: 4,  emoji: "📚", text: "Продължавай!",   sub: "Упражнявай се повече!" },
    { min: 0,  emoji: "💪", text: "Опитай пак!",    sub: "Следващия път ще се справиш!" },
  ],

  // ── ResultScreen ───────────────────────────────────────────
  play_again:    "▶ Играй пак",
  home_btn:      "🏠 Начало",
  hof_result:    "🏆 Зала на славата",
  challenge_btn: "⚔️ Предизвикай приятел",
  link_copied:   "✓ Линкът е копиран!",
  shared_ok:     "✓ Споделено!",
  faster_than:   (pct) => `По-бърз от ${pct}% от играчите със същия резултат!`,
  beat_time:     "Опитай се да подобриш времето си!",
  ch_won:        (name, s, t) => `🏆 Победи ${name}! (${s}/${t})`,
  ch_tied:       (name, s, t) => `🤝 Равенство с ${name}! (${s}/${t})`,
  ch_lost:       (name, s, t) => `😅 ${name} печели този рунд (${s}/${t})`,
  xp_earned:     (n)    => `+${n} XP`,
  level_up:      (lvl)  => `⬆️ Ново ниво! Вече си на ниво ${lvl}`,
  streak_msg:    (n)    => `🔥 ${n}-дневна серия!`,
  new_badges:    "Нови значки:",

  // ── StatsScreen ────────────────────────────────────────────
  stats_tab:    "📊 Статистики",
  progress_tab: "🏅 Прогрес",
  friends_tab:  "👥 Приятели",
  your_stats:   "⚡ Твоите статистики",
  recent_games: "🕹️ Последни игри",
  global_lb:    "🌍 Глобална класация",
  no_players:   "Няма играчи все още. Бъди пръв! 🌟",
  no_stats:     (icon, diff, cat) => `Все още няма ${icon} ${diff} ${cat} игри — играй сега! 🚀`,
  games_lbl:    "Игри",
  avg_score:    "Среден резултат",
  best_score:   "Най-добър резултат",
  fastest:      "Най-бързо при най-добър резултат",
  back_home:    "← Към началото",
  xp_to_next:   (cur, total) => `${cur} / ${total} XP до следващо ниво`,
  max_xp:       (xp) => `${xp} XP — Максимално ниво! ✨`,
  badges_title: (e, t) => `🏅 Значки (${e} / ${t})`,
  streak_disp:  (n) => `🔥 ${n}-дневна серия`,
  your_code:    "🔑 Твоят приятелски код",
  code_hint:    "Сподели кода с приятели, за да те добавят.",
  copy_btn:     "Копирай",
  copied_code:  "✓ Копирано!",
  add_friend:   "➕ Добави приятел",
  code_ph:      "Въведи техния код…",
  add_btn:      "Добави",
  friends_ttl:  (n) => `👥 Приятели (${n})`,
  no_friends:   "Нямаш приятели все още. Добави някого! 🤝",
  save_prog:    "Запази прогреса си и се състезавай с приятели!",
  sign_google:  "Влез с Google",
  sign_out:     "Изход",

  // ── UsernamePrompt ─────────────────────────────────────────
  up_title:  "Как се казваш?",
  up_sub:    "Покажи се в класацията с избрано от теб име.",
  up_ph:     "Въведи своето име…",
  up_save:   "Запази името",
  up_saving: "Запазване…",
  up_skip:   "По-късно",

  // ── ChallengeScreen ────────────────────────────────────────
  ch_title:     "⚔️ Предизвикан си!",
  ch_taunt:     (name, s, t) => `${name} направи ${s}/${t}. Можеш ли да ги победиш?`,
  ch_accept:    "Приеми предизвикателството ⚔️",
  ch_decline:   "Играй нещо друго",
  ch_cat_label: (cat) =>
    cat === "capitals"   ? "🗺️ Столици на света" :
    cat === "inventions" ? "💡 Изобретения" :
    cat === "history"    ? "📜 Исторически събития" :
                           "🌟 Известни личности",
};

export default bg;
