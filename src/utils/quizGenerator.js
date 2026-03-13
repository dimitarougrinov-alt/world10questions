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

export function generateCapitalsQuiz(countries, difficulty = null) {
  const filtered = difficulty ? countries.filter((c) => c.difficulty === difficulty) : countries;
  const items = filtered.map((c) => ({
    questionText: `What is the capital of ${c.country}?`,
    answer: c.capital,
  }));
  return generateQuiz(items);
}

export function generateInventionsQuiz(inventions, difficulty = null) {
  const filtered = difficulty ? inventions.filter((i) => i.difficulty === difficulty) : inventions;
  const items = filtered.map((i) => ({
    questionText: `Who invented the ${i.invention}?`,
    answer: i.inventor,
  }));
  return generateQuiz(items);
}
