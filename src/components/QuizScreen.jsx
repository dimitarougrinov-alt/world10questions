import { useState } from "react";

// Delay (ms) before advancing to next question after an answer is selected
const FEEDBACK_DELAY = 2000;

export default function QuizScreen({ questions, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null); // index of chosen option
  const [locked, setLocked] = useState(false);    // prevent double-click

  const question = questions[currentIndex];
  const total = questions.length;

  function handleAnswer(optionIndex) {
    if (locked) return;
    setLocked(true);
    setSelected(optionIndex);

    const isCorrect = optionIndex === question.correctIndex;
    const newScore = isCorrect ? score + 1 : score;

    setTimeout(() => {
      if (currentIndex + 1 < total) {
        setSelected(null);
        setLocked(false);
        setScore(newScore);
        setCurrentIndex((i) => i + 1);
      } else {
        onFinish(newScore);
      }
    }, FEEDBACK_DELAY);
  }

  function getButtonClass(optionIndex) {
    if (selected === null) return "btn btn-option";

    if (optionIndex === question.correctIndex) {
      return "btn btn-option correct";
    }
    if (optionIndex === selected) {
      return "btn btn-option wrong";
    }
    return "btn btn-option dimmed";
  }

  return (
    <div className="screen quiz-screen">
      <div className="quiz-card">
        {/* Progress bar */}
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${((currentIndex) / total) * 100}%` }}
          />
        </div>

        {/* Progress label */}
        <p className="progress-label">
          Question {currentIndex + 1} of {total}
        </p>

        {/* Question */}
        <h2 className="question-text">
          What is the capital of{" "}
          <span className="country-name">{question.country}</span>?
        </h2>

        {/* Options */}
        <div className="options-grid">
          {question.options.map((option, i) => (
            <button
              key={i}
              className={getButtonClass(i)}
              onClick={() => handleAnswer(i)}
              disabled={locked}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
