const WORDS1 = ["Swift","Bold","Brave","Cool","Epic","Fast","Keen","Wise","Calm","Wild","Jade","Iron","Gold","Neon","Dark"];
const WORDS2 = ["Eagle","Tiger","Panda","Cobra","Raven","Wolf","Fox","Bear","Hawk","Lynx","Viper","Shark","Lion","Deer","Owl"];

export function generateFriendCode() {
  const w1 = WORDS1[Math.floor(Math.random() * WORDS1.length)];
  const w2 = WORDS2[Math.floor(Math.random() * WORDS2.length)];
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${w1}${w2}${num}`;
}
