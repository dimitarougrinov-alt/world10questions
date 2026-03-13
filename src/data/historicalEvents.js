// Historical events with the year as the answer.
// event: English phrasing used in the question template "In what year did [event]?"
// bgEvent: Bulgarian phrasing for "В коя година [bgEvent]?"

const historicalEvents = [
  // ── EXPLORER ──────────────────────────────────────────────────────────────
  { event: "the Berlin Wall fell",                                         bgEvent: "падна Берлинската стена",                                         answer: "1989", difficulty: "explorer" },
  { event: "man first landed on the Moon",                                 bgEvent: "хората кацнаха на Луната за първи път",                           answer: "1969", difficulty: "explorer" },
  { event: "World War II ended",                                           bgEvent: "завърши Втората световна война",                                   answer: "1945", difficulty: "explorer" },
  { event: "World War I began",                                            bgEvent: "започна Първата световна война",                                   answer: "1914", difficulty: "explorer" },
  { event: "the French Revolution began",                                  bgEvent: "започна Френската революция",                                      answer: "1789", difficulty: "explorer" },
  { event: "Columbus first reached the Americas",                          bgEvent: "Колумб достигна Америките за първи път",                          answer: "1492", difficulty: "explorer" },
  { event: "World War II began",                                           bgEvent: "започна Втората световна война",                                   answer: "1939", difficulty: "explorer" },
  { event: "the American Declaration of Independence was signed",          bgEvent: "беше подписана Американската декларация за независимост",          answer: "1776", difficulty: "explorer" },
  { event: "the Titanic sank",                                             bgEvent: "потъна Титаник",                                                   answer: "1912", difficulty: "explorer" },
  { event: "the Russian Revolution took place",                            bgEvent: "се проведе Руската революция",                                     answer: "1917", difficulty: "explorer" },
  { event: "Nelson Mandela became President of South Africa",              bgEvent: "Нелсън Мандела стана президент на Южна Африка",                   answer: "1994", difficulty: "explorer" },
  { event: "the Soviet Union collapsed",                                   bgEvent: "разпадна се Съветският съюз",                                     answer: "1991", difficulty: "explorer" },
  { event: "the first modern Olympic Games were held",                     bgEvent: "се проведоха първите модерни Олимпийски игри",                    answer: "1896", difficulty: "explorer" },
  { event: "the September 11 terrorist attacks occurred",                  bgEvent: "се случиха терористичните атаки от 11 септември",                 answer: "2001", difficulty: "explorer" },
  { event: "the Great Fire of London broke out",                           bgEvent: "избухна Великият лондонски пожар",                                 answer: "1666", difficulty: "explorer" },

  // ── CHALLENGER ────────────────────────────────────────────────────────────
  { event: "Abraham Lincoln was assassinated",                             bgEvent: "беше убит Ейбрахам Линкълн",                                      answer: "1865", difficulty: "challenger" },
  { event: "the Wright Brothers made their first powered flight",          bgEvent: "братята Райт извършиха първия си моторен полет",                  answer: "1903", difficulty: "challenger" },
  { event: "the Wall Street Crash began",                                  bgEvent: "започна сривът на Уолстрийт",                                     answer: "1929", difficulty: "challenger" },
  { event: "King Tutankhamun's tomb was discovered",                       bgEvent: "беше открита гробницата на Тутанкамон",                           answer: "1922", difficulty: "challenger" },
  { event: "President Kennedy was assassinated",                           bgEvent: "беше убит президент Кенеди",                                      answer: "1963", difficulty: "challenger" },
  { event: "the Chernobyl nuclear disaster occurred",                      bgEvent: "се случи Чернобилската ядрена катастрофа",                        answer: "1986", difficulty: "challenger" },
  { event: "the Battle of Hastings was fought",                            bgEvent: "се проведе Битката при Хейстингс",                                answer: "1066", difficulty: "challenger" },
  { event: "the Boston Tea Party took place",                              bgEvent: "се проведе Бостонското чаено парти",                              answer: "1773", difficulty: "challenger" },
  { event: "the Magna Carta was signed",                                   bgEvent: "беше подписана Магна Харта",                                      answer: "1215", difficulty: "challenger" },
  { event: "the Cuban Missile Crisis took place",                          bgEvent: "се разрази Кубинската ракетна криза",                             answer: "1962", difficulty: "challenger" },
  { event: "the Treaty of Versailles was signed",                          bgEvent: "беше подписан Версайският договор",                               answer: "1919", difficulty: "challenger" },
  { event: "India gained independence from Britain",                       bgEvent: "Индия получи независимост от Великобритания",                     answer: "1947", difficulty: "challenger" },
  { event: "the Euro currency was introduced",                             bgEvent: "еврото беше въведено като валута",                                answer: "1999", difficulty: "challenger" },
  { event: "the Gulf War began",                                           bgEvent: "започна Войната в Персийския залив",                              answer: "1990", difficulty: "challenger" },
  { event: "the first atom bomb was dropped on Hiroshima",                 bgEvent: "беше хвърлена атомната бомба върху Хирошима",                    answer: "1945", difficulty: "challenger" },

  // ── MASTER ────────────────────────────────────────────────────────────────
  { event: "the Byzantine Empire fell to the Ottomans",                   bgEvent: "Византийската империя падна под Ottoman властта",                 answer: "1453", difficulty: "master" },
  { event: "the Peace of Westphalia was signed",                          bgEvent: "беше подписан Вестфалският мир",                                  answer: "1648", difficulty: "master" },
  { event: "the Glorious Revolution occurred in Britain",                  bgEvent: "се проведе Славната революция в Британия",                       answer: "1688", difficulty: "master" },
  { event: "the Congress of Vienna concluded",                             bgEvent: "приключи Виенският конгрес",                                      answer: "1815", difficulty: "master" },
  { event: "the Suez Crisis began",                                        bgEvent: "започна Суецката криза",                                          answer: "1956", difficulty: "master" },
  { event: "the first successful heart transplant was performed",          bgEvent: "беше извършена първата успешна трансплантация на сърце",          answer: "1967", difficulty: "master" },
  { event: "the Mongol Empire was founded by Genghis Khan",               bgEvent: "Чингиз хан основа Монголската империя",                           answer: "1206", difficulty: "master" },
  { event: "the first circumnavigation of the globe was completed",       bgEvent: "беше завършено първото околосветско плаване",                    answer: "1522", difficulty: "master" },
  { event: "the Thirty Years' War began",                                  bgEvent: "започна Тридесетгодишната война",                                 answer: "1618", difficulty: "master" },
  { event: "the Black Death first reached Europe",                         bgEvent: "Черната чума достигна Европа за първи път",                      answer: "1347", difficulty: "master" },
  { event: "the Battle of Marathon was fought",                            bgEvent: "се проведе Битката при Маратон",                                  answer: "490 BC", difficulty: "master" },
  { event: "the Rwandan genocide took place",                              bgEvent: "се случи геноцидът в Руанда",                                    answer: "1994", difficulty: "master" },
  { event: "the printing press was invented by Gutenberg",                bgEvent: "Гутенберг изобрети печатната преса",                              answer: "1440", difficulty: "master" },
  { event: "the first transatlantic telegraph cable was laid",            bgEvent: "беше положен първият трансатлантически телеграфен кабел",         answer: "1858", difficulty: "master" },
  { event: "the Battle of Thermopylae was fought",                        bgEvent: "се проведе Битката при Термопилите",                              answer: "480 BC", difficulty: "master" },
];

export default historicalEvents;
