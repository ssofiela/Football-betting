#!/usr/bin/env node
// CLI entry for the espn-sync service.
//
// Usage:
//   node index.js seed [tournamentKey] [--force]
//   node index.js sync [tournamentKey]
//
// `tournamentKey` defaults to the TOURNAMENT_KEY env var.

const seed = require('./commands/seed');
const sync = require('./commands/sync');

function parseArgs(argv) {
  const [command, maybeKey, ...flags] = argv.slice(2);
  const tournamentKey = maybeKey && !maybeKey.startsWith('--')
    ? maybeKey
    : process.env.TOURNAMENT_KEY;
  const force = flags.includes('--force') || argv.includes('--force');
  return { command, tournamentKey, force };
}

async function main() {
  const { command, tournamentKey, force } = parseArgs(process.argv);

  if (!tournamentKey) {
    console.error(
      'Missing tournament key. Pass as argument or set TOURNAMENT_KEY env var.'
    );
    process.exit(2);
  }

  switch (command) {
    case 'seed':
      await seed.run({ tournamentKey, force });
      break;
    case 'sync':
      await sync.run({ tournamentKey });
      break;
    default:
      console.error(`Unknown command "${command}". Use seed | sync.`);
      process.exit(2);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
