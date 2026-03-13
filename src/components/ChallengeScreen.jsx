import { ripple } from "../utils/ripple";

const DIFF_LABELS = { explorer: "🌱 Explorer", challenger: "⚔️ Challenger", master: "🔥 Master" };

export default function ChallengeScreen({ challenger, onAccept, onDecline, t }) {
  // challenger = { name, score, total, category, difficulty }
  const { name, score, total, category, difficulty } = challenger;
  const pct = Math.round((score / total) * 100);

  return (
    <div className="ch-screen">
      <div className="ch-card">
        <div className="ch-badge">⚔️</div>
        <h2 className="ch-title">{t.ch_title}</h2>
        <p className="ch-challenger">{name}</p>
        <p className="ch-detail">scored <strong>{score}/{total}</strong> ({pct}%) on</p>
        <div className="ch-quiz-info">
          <span className="ch-cat">{t.ch_cat_label(category)}</span>
          <span className="ch-diff">{DIFF_LABELS[difficulty] || difficulty}</span>
        </div>
        <p className="ch-taunt">{t.ch_taunt(name, score, total)}</p>
        <button
          className="ch-accept-btn"
          onClick={(e) => { ripple(e); onAccept(category, difficulty); }}
        >
          {t.ch_accept}
        </button>
        <button className="ch-decline" onClick={onDecline}>
          {t.ch_decline}
        </button>
      </div>
    </div>
  );
}
