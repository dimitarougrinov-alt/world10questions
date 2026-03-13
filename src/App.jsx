import { useState, useCallback } from "react";
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

const playerId = getPlayerId();

export default function App() {
  const [screen, setScreen] = useState(SCREEN.START);
  const [questions, setQuestions] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [timePercentile, setTimePercentile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const [difficulty, setDifficulty] = useState(null);

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
      setScreen(SCREEN.QUIZ);
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
    setScreen(SCREEN.RESULT);
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
    setScreen(SCREEN.START);
    setQuestions([]);
    setFinalScore(0);
    setTotalTime(0);
    setTimePercentile(null);
    setCategory(null);
    setDifficulty(null);
  }

  return (
    <div className="app">
      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      {screen === SCREEN.START && (
        <StartScreen
          onStart={startQuiz}
          onStats={() => setScreen(SCREEN.STATS)}
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
          onStats={() => setScreen(SCREEN.STATS)}
        />
      )}
      {screen === SCREEN.STATS && (
        <StatsScreen
          playerId={playerId}
          onBack={() => setScreen(SCREEN.START)}
        />
      )}
    </div>
  );
}
