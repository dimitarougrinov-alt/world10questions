/**
 * Generates a 10-question quiz from a list of country-capital pairs.
 *
 * Each question:
 *   { country, options: [string x4], correctIndex: number }
 *
 * Algorithm:
 *  1. Shuffle all countries.
 *  2. Pick first 10 as the quiz countries.
 *  3. For each, pick 3 random wrong capitals from the remaining pool.
 *  4. Shuffle the 4 options and record the correct index.
 */

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateQuiz(countries) {
  if (countries.length < 13) {
    throw new Error("Need at least 13 countries to generate a quiz.");
  }

  const shuffled = shuffle(countries);
  const quizCountries = shuffled.slice(0, 10);
  const remainingCapitals = shuffled.slice(10).map((c) => c.capital);

  return quizCountries.map((entry) => {
    const wrongPool = shuffle(remainingCapitals).slice(0, 3);
    const optionsUnshuffled = [entry.capital, ...wrongPool];
    const options = shuffle(optionsUnshuffled);
    const correctIndex = options.indexOf(entry.capital);

    return {
      country: entry.country,
      options,
      correctIndex,
    };
  });
}
