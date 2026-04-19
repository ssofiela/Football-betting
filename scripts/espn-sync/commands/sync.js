const { getTournamentConfig } = require('../config/tournaments');
const { fetchScoreboard } = require('../espn/client');
const { normalizeEvent } = require('../espn/normalize');
const { getMatch, updateMatch } = require('../firestore/repository');

// Pure: given a stored match doc and a freshly-normalized ESPN event,
// return only the fields that need to change.
function buildPartialUpdate(stored, incoming) {
  const partial = {};

  if (incoming.homeScore !== stored.homeScore) {
    partial.homeScore = incoming.homeScore;
  }
  if (incoming.awayScore !== stored.awayScore) {
    partial.awayScore = incoming.awayScore;
  }
  if (incoming.status !== stored.status) {
    partial.status = incoming.status;
  }

  // Only promote home/away from UND → real team. Never the reverse,
  // never a swap between two real teams.
  if (stored.home === 'UND' && incoming.home && incoming.home !== 'UND') {
    partial.home = incoming.home;
  }
  if (stored.away === 'UND' && incoming.away && incoming.away !== 'UND') {
    partial.away = incoming.away;
  }

  // `id` is immutable after seed — never included in a partial.
  return partial;
}

function daysWindow(now = new Date()) {
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const yesterday = new Date(today.getTime());
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return { from: yesterday, to: today };
}

async function run({ tournamentKey }) {
  const config = getTournamentConfig(tournamentKey);
  const { from, to } = daysWindow();
  console.log(
    `[sync] ${config.key}: fetching ESPN ${config.espnLeague} ` +
      `${from.toISOString().slice(0, 10)} → ${to.toISOString().slice(0, 10)}`
  );

  const rawEvents = await fetchScoreboard(config.espnLeague, from, to);
  console.log(`[sync] fetched ${rawEvents.length} ESPN events`);

  let updated = 0;
  let unchanged = 0;
  let skipped = 0;

  for (const raw of rawEvents) {
    let incoming;
    try {
      incoming = normalizeEvent(raw, config);
    } catch (err) {
      console.warn(`[sync] skipping event ${raw && raw.id}: ${err.message}`);
      skipped += 1;
      continue;
    }

    const stored = await getMatch(config.collection, incoming.espnId);
    if (!stored) {
      console.warn(
        `[sync] no Firestore doc for ESPN id=${incoming.espnId}; ` +
          `sync does not create. Re-seed if this is systemic.`
      );
      skipped += 1;
      continue;
    }

    const partial = buildPartialUpdate(stored, incoming);
    if (Object.keys(partial).length === 0) {
      unchanged += 1;
      continue;
    }

    await updateMatch(config.collection, incoming.espnId, partial);
    updated += 1;
    console.log(
      `[sync] [id=${stored.id}] ${stored.home} ${incoming.homeScore} – ` +
        `${incoming.awayScore} ${stored.away} (${incoming.status})`
    );
  }

  console.log(
    `[sync] done: updated=${updated} unchanged=${unchanged} skipped=${skipped}`
  );
}

module.exports = { run, buildPartialUpdate };
