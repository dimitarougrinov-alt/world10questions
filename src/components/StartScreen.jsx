export default function StartScreen({ onStart, loading }) {
  return (
    <div className="screen start-screen">
      <div className="start-card">
        <div className="globe-icon" aria-hidden="true">🌍</div>
        <h1 className="title">World Capitals Quiz</h1>
        <p className="subtitle">
          How well do you know the capitals of the world?
          <br />
          Answer 10 questions and find out!
        </p>
        <button
          className="btn btn-primary"
          onClick={onStart}
          disabled={loading}
        >
          {loading ? "Loading…" : "Start Quiz"}
        </button>
      </div>
    </div>
  );
}
