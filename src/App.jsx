import { useState, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase/config";
import { generateQuiz } from "./utils/quizGenerator";

import StartScreen from "./components/StartScreen";
import QuizScreen from "./components/QuizScreen";
import ResultScreen from "./components/ResultScreen";

// Screens
const SCREEN = {
  START: "start",
  QUIZ: "quiz",
  RESULT: "result",
};

export default function App() {
  const [screen, setScreen] = useState(SCREEN.START);
  const [questions, setQuestions] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await getDocs(collection(db, "countries"));
      const countries = snapshot.docs.map((doc) => doc.data());
      const quiz = generateQuiz(countries);
      setQuestions(quiz);
      setScreen(SCREEN.QUIZ);
    } catch (err) {
      console.error("Failed to load countries:", err);
      setError("Oops! Could not load the quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  function handleFinish(score) {
    setFinalScore(score);
    setScreen(SCREEN.RESULT);
  }

  function handlePlayAgain() {
    setScreen(SCREEN.START);
    setQuestions([]);
    setFinalScore(0);
  }

  return (
    <div className="app">
      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      {screen === SCREEN.START && (
        <StartScreen onStart={startQuiz} loading={loading} />
      )}
      {screen === SCREEN.QUIZ && (
        <QuizScreen questions={questions} onFinish={handleFinish} />
      )}
      {screen === SCREEN.RESULT && (
        <ResultScreen
          score={finalScore}
          total={questions.length}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}
