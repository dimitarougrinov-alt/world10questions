const ID_KEY = "wq_player_id";
const COUNTRY_KEY = "wq_player_country";

export function getPlayerId() {
  let id = localStorage.getItem(ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ID_KEY, id);
  }
  return id;
}

export async function getPlayerCountry() {
  const cached = localStorage.getItem(COUNTRY_KEY);
  if (cached) return cached;

  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    const country = data.country_name || null;
    if (country) localStorage.setItem(COUNTRY_KEY, country);
    return country;
  } catch {
    return null;
  }
}
