import en from "./en";
import bg from "./bg";

const LANG_KEY = "wq_lang";

export function getLang() {
  return localStorage.getItem(LANG_KEY) || "en";
}

export function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
}

export function getT(lang) {
  return lang === "bg" ? bg : en;
}
