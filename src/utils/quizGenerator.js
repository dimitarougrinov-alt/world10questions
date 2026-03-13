import { countriesBG, inventionsBG } from "../data/bg";

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generic quiz generator.
 * items: [{ questionText: string, answer: string }]
 * Returns: [{ questionText, options: [string x4], correctIndex }]
 */
function generateQuiz(items) {
  if (items.length < 13) {
    throw new Error("Need at least 13 items to generate a quiz.");
  }
  const shuffled = shuffle(items);
  const quizItems = shuffled.slice(0, 10);
  const answerPool = shuffled.slice(10).map((i) => i.answer);

  return quizItems.map((entry) => {
    const wrongAnswers = shuffle(answerPool).slice(0, 3);
    const options = shuffle([entry.answer, ...wrongAnswers]);
    return {
      questionText: entry.questionText,
      options,
      correctIndex: options.indexOf(entry.answer),
    };
  });
}

export function generateCapitalsQuiz(countries, difficulty = null, lang = "en") {
  const filtered = difficulty ? countries.filter((c) => c.difficulty === difficulty) : countries;
  const items = filtered.map((c) => {
    if (lang === "bg" && countriesBG[c.country]) {
      const bg = countriesBG[c.country];
      return {
        questionText: `Коя е столицата на ${bg.country}?`,
        answer: bg.capital,
      };
    }
    return {
      questionText: `What is the capital of ${c.country}?`,
      answer: c.capital,
    };
  });
  return generateQuiz(items);
}

export function generateInventionsQuiz(inventions, difficulty = null, lang = "en") {
  const filtered = difficulty ? inventions.filter((i) => i.difficulty === difficulty) : inventions;
  const items = filtered.map((i) => {
    const inventionName = lang === "bg" && inventionsBG[i.invention]
      ? inventionsBG[i.invention]
      : i.invention;
    const question = lang === "bg"
      ? `Кой е изобретил ${inventionName}?`
      : `Who invented the ${i.invention}?`;
    return {
      questionText: question,
      answer: i.inventor,
    };
  });
  return generateQuiz(items);
}

export function generateHistoryQuiz(events, difficulty = null, lang = "en") {
  const filtered = difficulty ? events.filter((e) => e.difficulty === difficulty) : events;
  const items = filtered.map((e) => ({
    questionText: lang === "bg"
      ? `В коя година ${e.bgEvent}?`
      : `In what year did ${e.event}?`,
    answer: e.answer,
  }));
  return generateQuiz(items);
}

export function generatePeopleQuiz(people, difficulty = null, lang = "en") {
  const filtered = difficulty ? people.filter((p) => p.difficulty === difficulty) : people;
  const items = filtered.map((p) => ({
    questionText: lang === "bg" ? p.bgQuestion : p.question,
    answer: lang === "bg" && p.bgAnswer ? p.bgAnswer : p.answer,
  }));
  return generateQuiz(items);
}
