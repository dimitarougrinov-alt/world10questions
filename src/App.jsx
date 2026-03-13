import { useState, useCallback, useRef } from "react";
import { generateCapitalsQuiz, generateInventionsQuiz } from "./utils/quizGenerator";
import countriesData from "./data/countries";
import inventionsData from "./data/inventions";
import { getPlayerId, getPlayerCountry } from "./utils/player";
import { saveSession, getTimePercentile } from "./firebase/stats";

import StartScreen from "./components/StartScreen";
import QuizScreen from "./components/QuizScreen";
import ResultScreen from "./components/ResultScreen";
import StatsScreen from "./components/StatsScreen";

const SCREEN = {
  START: "start",
  QUIZ: "quiz",
  RESULT: "result",
  STATS: "stats",
};

const TRANSITION_MS = 300;

const playerId = getPlayerId();

export default function App() {
  const [screen, setScreen] = useState(SCREEN.START);
  const [exiting, setExiting] = useState(false);
  const nextScreenRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [timePercentile, setTimePercentile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const [difficulty, setDifficulty] = useState(null);

  function goTo(next) {
    nextScreenRef.current = next;
    setExiting(true);
    setTimeout(() => {
      setScreen(nextScreenRef.current);
      setExiting(false);
    }, TRANSITION_MS);
  }

  const startQuiz = useCallback(async (cat, diff) => {
    setLoading(true);
    setError(null);
    setCategory(cat);
    setDifficulty(diff);
    try {
      let quiz;
      if (cat === "inventions") {
        quiz = generateInventionsQuiz(inventionsData, diff);
      } else {
        quiz = generateCapitalsQuiz(countriesData, diff);
      }
      setQuestions(quiz);
      goTo(SCREEN.QUIZ);
    } catch (err) {
      console.error("Failed to load quiz:", err);
      setError("Oops! Could not load the quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleFinish(score, timeMs) {
    setFinalScore(score);
    setTotalTime(timeMs);
    goTo(SCREEN.RESULT);
    try {
      const percentage = Math.round((score / questions.length) * 100);
      const [country, percentile] = await Promise.all([
        getPlayerCountry(),
        getTimePercentile(percentage, timeMs, category, difficulty),
      ]);
      setTimePercentile(percentile);
      await saveSession(playerId, score, questions.length, country, timeMs, category, difficulty);
    } catch (err) {
      console.error("Failed to save session:", err);
    }
  }

  function handlePlayAgain() {
    setQuestions([]);
    setFinalScore(0);
    setTotalTime(0);
    setTimePercentile(null);
    setCategory(null);
    setDifficulty(null);
    goTo(SCREEN.START);
  }

  return (
    <div className="app">
      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      <div className={exiting ? "page-exit" : "page-enter"}>
        {screen === SCREEN.START && (
          <StartScreen
            onStart={startQuiz}
            onStats={() => goTo(SCREEN.STATS)}
            loading={loading}
          />
        )}
        {screen === SCREEN.QUIZ && (
          <QuizScreen questions={questions} onFinish={handleFinish} />
        )}
        {screen === SCREEN.RESULT && (
          <ResultScreen
            score={finalScore}
            total={questions.length}
            totalTime={totalTime}
            timePercentile={timePercentile}
            onPlayAgain={handlePlayAgain}
            onStats={() => goTo(SCREEN.STATS)}
          />
        )}
        {screen === SCREEN.STATS && (
          <StatsScreen
            playerId={playerId}
            onBack={() => goTo(SCREEN.START)}
          />
        )}
      </div>
    </div>
  );
}
