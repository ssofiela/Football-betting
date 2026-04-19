// Thin wrapper around ESPN's public scoreboard endpoint, with retry.
//
// Endpoint shape:
//   GET http://site.api.espn.com/apis/site/v2/sports/soccer/<league>/scoreboard
//       ?dates=YYYYMMDD           (single day)
//       ?dates=YYYYMMDD-YYYYMMDD  (range; ESPN supports up to ~30 days)
//
// The response is JSON with `events: [...]` at the top level.

const BASE = 'http://site.api.espn.com/apis/site/v2/sports/soccer';

async function fetchWithRetry(url, attempts = [1000, 4000, 15000]) {
  let lastErr;
  for (let i = 0; i <= attempts.length; i += 1) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': 'football-betting-espn-sync/0.1' },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} from ${url}`);
      }
      return res.json();
    } catch (err) {
      lastErr = err;
      if (i < attempts.length) {
        const delay = attempts[i];
        console.warn(
          `[espn] fetch failed (${err.message}); retry ${i + 1} in ${delay}ms`
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

function formatDate(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

// Fetches the scoreboard for the given date range. `from` and `to` are
// JS Dates interpreted as UTC calendar days.
async function fetchScoreboard(league, from, to) {
  const range = `${formatDate(from)}-${formatDate(to)}`;
  const url = `${BASE}/${league}/scoreboard?dates=${range}`;
  const json = await fetchWithRetry(url);
  return Array.isArray(json.events) ? json.events : [];
}

// Convenience: fetch events for a full tournament season by walking the
// year in 30-day chunks. Returns deduplicated events (by id).
async function fetchSeason(league, season) {
  const start = new Date(Date.UTC(season, 0, 1));
  const end = new Date(Date.UTC(season, 11, 31));
  const chunkDays = 30;

  const byId = new Map();
  let cursor = start;
  while (cursor <= end) {
    const chunkEnd = new Date(cursor.getTime());
    chunkEnd.setUTCDate(chunkEnd.getUTCDate() + chunkDays - 1);
    const effectiveEnd = chunkEnd > end ? end : chunkEnd;
    const events = await fetchScoreboard(league, cursor, effectiveEnd);
    for (const ev of events) byId.set(String(ev.id), ev);
    cursor = new Date(effectiveEnd.getTime());
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return Array.from(byId.values());
}

module.exports = { fetchScoreboard, fetchSeason };
