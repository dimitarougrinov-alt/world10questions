import { useState, useCallback, useRef, useEffect } from "react";
import { generateCapitalsQuiz, generateInventionsQuiz, generateHistoryQuiz, generatePeopleQuiz } from "./utils/quizGenerator";
import countriesData from "./data/countries";
import inventionsData from "./data/inventions";
import historicalEventsData from "./data/historicalEvents";
import famousPeopleData from "./data/famousPeople";
import { getPlayerId, getPlayerCountry, USERNAME_KEY } from "./utils/player";
import { getLang, setLang, getT } from "./i18n/index";
import { saveSession, getTimePercentile, saveUsername, migratePlayer, savePlayerProgress } from "./firebase/stats";
import { onAuthChange, signInWithGoogle, signOutUser } from "./firebase/auth";
import { soundTransition } from "./utils/sounds";
import { processGameRewards, getTotalXp, getLevelInfo, getEarnedBadges, getStreak, recordCategoryResult, isChallengerUnlockedForCat, isMasterUnlockedForCat } from "./utils/xp";

import StartScreen from "./components/StartScreen";
import QuizScreen from "./components/QuizScreen";
import ResultScreen from "./components/ResultScreen";
import StatsScreen from "./components/StatsScreen";
import UsernamePrompt from "./components/UsernamePrompt";
import ChallengeScreen from "./components/ChallengeScreen";

const SCREEN = {
  START: "start",
  CHALLENGE: "challenge",
  QUIZ: "quiz",
  RESULT: "result",
  STATS: "stats",
};

const TRANSITION_MS = 300;

export default function App() {
  const [playerId, setPlayerId] = useState(() => getPlayerId());
  const [lang, setAppLang] = useState(() => getLang());
  const t = getT(lang);

  function handleSetLang(l) {
    setLang(l);
    setAppLang(l);
  }
  const [googleUser, setGoogleUser] = useState(null);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [challengeData, setChallengeData] = useState(null);

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
  const [rewards, setRewards] = useState(null); // { xpEarned, totalXp, newLevel, leveledUp, streak, newBadges }
  const [unlockedDifficulty, setUnlockedDifficulty] = useState(null);
  const [statsInitialView, setStatsInitialView] = useState("stats");

  // Detect challenge links on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("challenge") === "1") {
      const cd = {
        name:       decodeURIComponent(params.get("name") || "A friend"),
        score:      parseInt(params.get("score"), 10),
        total:      parseInt(params.get("total"), 10),
        category:   params.get("cat"),
        difficulty: params.get("diff"),
      };
      setChallengeData(cd);
      setScreen(SCREEN.CHALLENGE);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Restore Google session on reload
  useEffect(() => {
    return onAuthChange((user) => {
      if (user) {
        setGoogleUser(user);
        setPlayerId(user.uid);
        localStorage.setItem("wq_player_id", user.uid);
      } else {
        setGoogleUser(null);
      }
    });
  }, []);

  function goTo(next) {
    soundTransition();
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
      const quiz =
        cat === "inventions" ? generateInventionsQuiz(inventionsData, diff, lang) :
        cat === "history"    ? generateHistoryQuiz(historicalEventsData, diff, lang) :
        cat === "people"     ? generatePeopleQuiz(famousPeopleData, diff, lang) :
                               generateCapitalsQuiz(countriesData, diff, lang);
      setQuestions(quiz);
      goTo(SCREEN.QUIZ);
    } catch (err) {
      console.error("Failed to load quiz:", err);
      setError("Oops! Could not load the quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [lang]);

  function handleAcceptChallenge(cat, diff) {
    startQuiz(cat, diff);
  }

  function handleDeclineChallenge() {
    setChallengeData(null);
    goTo(SCREEN.START);
  }

  async function handleFinish(score, timeMs) {
    setFinalScore(score);
    setTotalTime(timeMs);
    // Compute rewards synchronously before transitioning so ResultScreen has them immediately
    const r = processGameRewards(score, questions.length, difficulty);
    setRewards(r);
    const pct = Math.round((score / questions.length) * 100);
    const wasChallLocked = !isChallengerUnlockedForCat(category);
    const wasMasterLocked = !isMasterUnlockedForCat(category);
    recordCategoryResult(category, difficulty, pct);
    const justUnlocked =
      (wasChallLocked && isChallengerUnlockedForCat(category)) ? "challenger" :
      (wasMasterLocked && isMasterUnlockedForCat(category))    ? "master"     : null;
    setUnlockedDifficulty(justUnlocked);
    goTo(SCREEN.RESULT);
    try {
      const percentage = Math.round((score / questions.length) * 100);
      const [country, percentile] = await Promise.all([
        getPlayerCountry(),
        getTimePercentile(percentage, timeMs, category, difficulty),
      ]);
      setTimePercentile(percentile);
      await saveSession(playerId, score, questions.length, country, timeMs, category, difficulty);
      // Persist XP/level/badges/streak to Firestore so leaderboard can show them
      savePlayerProgress(playerId, getTotalXp(), getLevelInfo(getTotalXp()).level, getStreak(), getEarnedBadges());
      if (!localStorage.getItem(USERNAME_KEY)) {
        setTimeout(() => setShowUsernamePrompt(true), 800);
      }
    } catch (err) {
      console.error("Failed to save session:", err);
    }
  }

  async function handleSaveUsername(name) {
    localStorage.setItem(USERNAME_KEY, name);
    await saveUsername(playerId, name);
    setShowUsernamePrompt(false);
  }

  function handleSkipUsername() {
    localStorage.setItem(USERNAME_KEY, "__skipped__");
    setShowUsernamePrompt(false);
  }

  async function handleGoogleSignIn() {
    try {
      const anonymousId = playerId;
      const user = await signInWithGoogle();
      if (anonymousId !== user.uid) {
        await migratePlayer(anonymousId, user.uid);
      }
      setGoogleUser(user);
      setPlayerId(user.uid);
      localStorage.setItem("wq_player_id", user.uid);
      const localName = localStorage.getItem(USERNAME_KEY);
      if (localName && localName !== "__skipped__") {
        await saveUsername(user.uid, localName);
      }
    } catch (err) {
      console.error("Google sign-in failed:", err);
    }
  }

  async function handleGoogleSignOut() {
    await signOutUser();
    setGoogleUser(null);
    const newId = getPlayerId();
    setPlayerId(newId);
  }

  function handlePlayAgain() {
    startQuiz(category, difficulty);
    setFinalScore(0);
    setTotalTime(0);
    setTimePercentile(null);
    setChallengeData(null);
    setRewards(null);
    setUnlockedDifficulty(null);
  }

  function handleGoHome() {
    setQuestions([]);
    setFinalScore(0);
    setTotalTime(0);
    setTimePercentile(null);
    setCategory(null);
    setDifficulty(null);
    setChallengeData(null);
    setRewards(null);
    setUnlockedDifficulty(null);
    goTo(SCREEN.START);
  }

  return (
    <div className="app">
      {error && <div className="error-banner" role="alert">{error}</div>}

      <div className={exiting ? "page-exit" : "page-enter"}>
        {screen === SCREEN.START && (
          <StartScreen onStart={startQuiz} onStats={(view = "stats") => { setStatsInitialView(view); goTo(SCREEN.STATS); }} loading={loading} totalXp={getTotalXp()} t={t} lang={lang} onSetLang={handleSetLang} />
        )}
        {screen === SCREEN.CHALLENGE && challengeData && (
          <ChallengeScreen
            challenger={challengeData}
            onAccept={handleAcceptChallenge}
            onDecline={handleDeclineChallenge}
            t={t}
          />
        )}
        {screen === SCREEN.QUIZ && (
          <QuizScreen questions={questions} onFinish={handleFinish} onTimeout={handleGoHome} />
        )}
        {screen === SCREEN.RESULT && (
          <ResultScreen
            score={finalScore}
            total={questions.length}
            totalTime={totalTime}
            timePercentile={timePercentile}
            category={category}
            difficulty={difficulty}
            challengeData={challengeData}
            rewards={rewards}
            unlockedDifficulty={unlockedDifficulty}
            onPlayAgain={handlePlayAgain}
            onHome={handleGoHome}
            onStats={() => { setStatsInitialView("stats"); goTo(SCREEN.STATS); }}
            t={t}
          />
        )}
        {screen === SCREEN.STATS && (
          <StatsScreen
            playerId={playerId}
            googleUser={googleUser}
            onGoogleSignIn={handleGoogleSignIn}
            onGoogleSignOut={handleGoogleSignOut}
            onBack={() => goTo(SCREEN.START)}
            t={t}
            initialView={statsInitialView}
          />
        )}
      </div>

      {showUsernamePrompt && (
        <UsernamePrompt onSave={handleSaveUsername} onSkip={handleSkipUsername} t={t} />
      )}
    </div>
  );
}
