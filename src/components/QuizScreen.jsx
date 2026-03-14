import { useState, useRef, useEffect } from "react";
import { ripple } from "../utils/ripple";
import { soundCorrect, soundWrong, soundComplete } from "../utils/sounds";

const FEEDBACK_DELAY = 2000;
const LETTERS = ["A", "B", "C", "D"];
const LETTER_COLORS = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#C77DFF"];
const TIMEOUT_MS = 600_000; // 10 minutes

function formatTime(ms) {
  const s = ms / 1000;
  if (s < 60) return s.toFixed(1) + "s";
  const m = Math.floor(s / 60);
  return `${m}m ${(s % 60).toFixed(1)}s`;
}

export default function QuizScreen({ questions, onFinish, onTimeout }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [displayMs, setDisplayMs] = useState(0);

  const accumulatedMsRef = useRef(0);
  const questionStartRef = useRef(Date.now());
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const question = questions[currentIndex];
  const total = questions.length;
  const progressPct = (currentIndex / total) * 100;

  // Elapsed-time display ticker
  useEffect(() => {
    questionStartRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setDisplayMs(accumulatedMsRef.current + (Date.now() - questionStartRef.current));
    }, 100);
    return () => clearInterval(intervalRef.current);
  }, [currentIndex]);

  // 3-minute global timeout — set once on mount, cleared on unmount
  useEffect(() => {
    timeoutRef.current = setTimeout(onTimeout, TIMEOUT_MS);
    return () => clearTimeout(timeoutRef.current);
  }, []);

  function handleAnswer(optionIndex) {
    if (locked) return;
    clearInterval(intervalRef.current);
    accumulatedMsRef.current += Date.now() - questionStartRef.current;
    setDisplayMs(accumulatedMsRef.current);
    setLocked(true);
    setSelected(optionIndex);
    const isCorrect = optionIndex === question.correctIndex;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) soundCorrect(); else soundWrong();
    const isLast = currentIndex + 1 >= total;
    if (isLast) setTimeout(soundComplete, 300);
    setTimeout(() => {
      if (currentIndex + 1 < total) {
        setSelected(null);
        setLocked(false);
        setScore(newScore);
        setCurrentIndex((i) => i + 1);
      } else {
        clearTimeout(timeoutRef.current);
        onFinish(newScore, accumulatedMsRef.current);
      }
    }, FEEDBACK_DELAY);
  }

  function getOptionState(i) {
    if (selected === null) return "default";
    if (i === question.correctIndex) return "correct";
    if (i === selected) return "wrong";
    return "dimmed";
  }

  return (
    <div className="qz-screen">
      <div className="qz-card">

        {/* Neon progress bar */}
        <div className="qz-progress-track">
          <div className="qz-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>

        {/* Meta row */}
        <div className="qz-meta">
          <span className="qz-counter">
            {currentIndex + 1} <span className="qz-counter-of">/ {total}</span>
          </span>
          <span className={`qz-timer${locked ? " qz-timer-frozen" : ""}`}>
            ⏱ {formatTime(displayMs)}
          </span>
        </div>

        {/* Score dots */}
        <div className="qz-dots">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`qz-dot${i < currentIndex ? " qz-dot-done" : ""}${i === currentIndex ? " qz-dot-active" : ""}`}
            />
          ))}
        </div>

        {/* Question */}
        <h2 className="qz-question">{question.questionText}</h2>

        {/* Options */}
        <div className="qz-options">
          {question.options.map((option, i) => {
            const state = getOptionState(i);
            return (
              <button
                key={i}
                className={`qz-option qz-option-${state}`}
                onClick={(e) => { ripple(e); handleAnswer(i); }}
                disabled={locked}
              >
                <span className="qz-letter" style={{ background: LETTER_COLORS[i] }}>
                  {LETTERS[i]}
                </span>
                <span className="qz-option-text">{option}</span>
                {state === "correct" && <span className="qz-check">✓</span>}
                {state === "wrong"   && <span className="qz-check">✗</span>}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
