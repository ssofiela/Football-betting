// Tournament configs. `TOURNAMENT_KEY` env var selects one of these.
// Add a new entry when bootstrapping a new tournament.

const TOURNAMENTS = {
  wc2026: {
    key: 'wc2026',
    collection: 'wc2026_matches',
    espnLeague: 'fifa.world',
    season: 2026,
    // Group stage: 12 groups of 4 teams (48-team format).
    groupLabels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
    // Knockout: R32, R16, QF, SF, Final.
    knockoutRounds: ['rof32', 'rof16', 'rof8', 'rof4', 'rof2'],
  },
  euro2024_test: {
    key: 'euro2024_test',
    collection: 'euro2024_test_matches',
    espnLeague: 'uefa.euro',
    season: 2024,
    groupLabels: ['A', 'B', 'C', 'D', 'E', 'F'],
    knockoutRounds: ['rof16', 'rof8', 'rof4', 'rof2'],
  },
};

function getTournamentConfig(key) {
  const config = TOURNAMENTS[key];
  if (!config) {
    const known = Object.keys(TOURNAMENTS).join(', ');
    throw new Error(`Unknown TOURNAMENT_KEY "${key}". Known: ${known}`);
  }
  return config;
}

module.exports = { TOURNAMENTS, getTournamentConfig };
