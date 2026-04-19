const { toIso3 } = require('../lib/teamCodes');

// ESPN's scoreboard response puts the round/group label in
// competitions[0].notes[0].headline. Examples seen:
//   "Group A - Matchday 1"
//   "Round of 16"
//   "Quarterfinals"
//   "Semifinals"
//   "Final"
const KNOCKOUT_HEADLINE_MAP = {
  'round of 32': 'rof32',
  'round of 16': 'rof16',
  'quarterfinals': 'rof8',
  'quarterfinal': 'rof8',
  'semifinals': 'rof4',
  'semifinal': 'rof4',
  'final': 'rof2',
};

function extractGroupLabel(headline, config) {
  if (!headline) return 'UNK';
  const lower = headline.toLowerCase().trim();

  const groupMatch = lower.match(/^group\s+([a-l])\b/i);
  if (groupMatch) {
    const letter = groupMatch[1].toUpperCase();
    if (config.groupLabels.includes(letter)) return letter;
    return 'UNK';
  }

  for (const [prefix, code] of Object.entries(KNOCKOUT_HEADLINE_MAP)) {
    if (lower.startsWith(prefix)) {
      return config.knockoutRounds.includes(code) ? code : 'UNK';
    }
  }
  return 'UNK';
}

function toStatus(state, completed) {
  if (completed) return 'final';
  if (state === 'in') return 'in-progress';
  return 'scheduled';
}

function normalizeEvent(event, config) {
  const competition = event.competitions && event.competitions[0];
  if (!competition) {
    throw new Error(`event ${event.id} has no competitions[]`);
  }
  const competitors = competition.competitors || [];
  if (competitors.length !== 2) {
    throw new Error(
      `event ${event.id} has ${competitors.length} competitors, expected 2`
    );
  }

  const home = competitors.find((c) => c.homeAway === 'home');
  const away = competitors.find((c) => c.homeAway === 'away');
  if (!home || !away) {
    throw new Error(`event ${event.id} missing home or away competitor`);
  }

  const status = toStatus(
    event.status && event.status.type && event.status.type.state,
    !!(event.status && event.status.type && event.status.type.completed)
  );

  const parseScore = (raw) => {
    const n = Number(raw);
    return Number.isFinite(n) ? n : -1;
  };
  const homeScore = status === 'scheduled' ? -1 : parseScore(home.score);
  const awayScore = status === 'scheduled' ? -1 : parseScore(away.score);

  const headline =
    competition.notes && competition.notes[0] && competition.notes[0].headline;
  const group = extractGroupLabel(headline, config);

  return {
    espnId: String(event.id),
    home: toIso3(home.team && home.team.abbreviation),
    away: toIso3(away.team && away.team.abbreviation),
    homeScore,
    awayScore,
    group,
    kickoff: event.date,
    status,
  };
}

module.exports = { normalizeEvent, extractGroupLabel };
