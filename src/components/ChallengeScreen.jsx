import { ripple } from "../utils/ripple";

const CAT_LABELS = { capitals: "World Capitals", inventions: "Inventions" };
const DIFF_LABELS = { explorer: "🌱 Explorer", challenger: "⚔️ Challenger", master: "🔥 Master" };

export default function ChallengeScreen({ challenger, onAccept, onDecline }) {
  // challenger = { name, score, total, category, difficulty }
  const { name, score, total, category, difficulty } = challenger;
  const pct = Math.round((score / total) * 100);

  return (
    <div className="ch-screen">
      <div className="ch-card">
        <div className="ch-badge">⚔️</div>
        <h2 className="ch-title">You've been challenged!</h2>
        <p className="ch-challenger">{name}</p>
        <p className="ch-detail">scored <strong>{score}/{total}</strong> ({pct}%) on</p>
        <div className="ch-quiz-info">
          <span className="ch-cat">{CAT_LABELS[category] || category}</span>
          <span className="ch-diff">{DIFF_LABELS[difficulty] || difficulty}</span>
        </div>
        <p className="ch-taunt">Can you beat them? 🚀</p>
        <button
          className="ch-accept-btn"
          onClick={(e) => { ripple(e); onAccept(category, difficulty); }}
        >
          Accept Challenge!
        </button>
        <button className="ch-decline" onClick={onDecline}>
          Play something else
        </button>
      </div>
    </div>
  );
}
