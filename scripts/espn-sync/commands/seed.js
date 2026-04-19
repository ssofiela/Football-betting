const { getTournamentConfig } = require('../config/tournaments');
const { fetchSeason } = require('../espn/client');
const { normalizeEvent } = require('../espn/normalize');
const { isEmpty, createMatch } = require('../firestore/repository');

async function run({ tournamentKey, force = false }) {
  const config = getTournamentConfig(tournamentKey);

  const empty = await isEmpty(config.collection);
  if (!empty && !force) {
    throw new Error(
      `Collection ${config.collection} is not empty. Pass --force to reseed ` +
        `(this will NOT delete existing docs; new docs will be written ` +
        `by set() and may overwrite).`
    );
  }

  console.log(
    `[seed] ${config.key}: fetching full season from ESPN ` +
      `(${config.espnLeague} ${config.season})`
  );
  const rawEvents = await fetchSeason(config.espnLeague, config.season);
  console.log(`[seed] fetched ${rawEvents.length} raw events`);

  // Normalize all events first so we can sort by kickoff before assigning
  // sequential `id`s. Drop events whose group we can't determine.
  const normalized = [];
  for (const raw of rawEvents) {
    try {
      const ev = normalizeEvent(raw, config);
      if (ev.group === 'UNK') {
        console.warn(
          `[seed] dropping ESPN id=${ev.espnId} (${ev.home} vs ${ev.away}): ` +
            `could not map headline to group/round`
        );
        continue;
      }
      normalized.push(ev);
    } catch (err) {
      console.warn(
        `[seed] dropping ESPN id=${raw && raw.id}: ${err.message}`
      );
    }
  }
  normalized.sort((a, b) => a.kickoff.localeCompare(b.kickoff));

  console.log(`[seed] writing ${normalized.length} match docs`);
  for (let i = 0; i < normalized.length; i += 1) {
    const ev = normalized[i];
    await createMatch(config.collection, { ...ev, id: i });
    console.log(
      `[seed] [id=${i}] ${ev.group}: ${ev.home} vs ${ev.away} @ ${ev.kickoff}`
    );
  }
  console.log(`[seed] done`);
}

module.exports = { run };
