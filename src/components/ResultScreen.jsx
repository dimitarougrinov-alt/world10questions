const MESSAGES = [
  { min: 10, emoji: "🏆", text: "Amazing! Geography master!" },
  { min: 8,  emoji: "🌟", text: "Excellent work!" },
  { min: 6,  emoji: "😊", text: "Good job!" },
  { min: 4,  emoji: "📚", text: "Not bad, keep practising!" },
  { min: 0,  emoji: "💪", text: "Try again — you can do it!" },
];

function getMessage(score) {
  return MESSAGES.find((m) => score >= m.min);
}

export default function ResultScreen({ score, total, onPlayAgain, onStats }) {
  const percentage = Math.round((score / total) * 100);
  const { emoji, text } = getMessage(score);

  return (
    <div className="screen result-screen">
      <div className="result-card">
        <div className="result-emoji" aria-hidden="true">{emoji}</div>
        <h2 className="result-message">{text}</h2>

        <div className="score-display">
          <span className="score-big">{score}</span>
          <span className="score-divider"> / </span>
          <span className="score-total">{total}</span>
        </div>

        <p className="score-percent">{percentage}% correct</p>

        <button className="btn btn-primary" onClick={onPlayAgain}>
          Play Again
        </button>
        <button className="btn btn-secondary" onClick={onStats}>
          My Hall of Fame
        </button>
      </div>
    </div>
  );
}
