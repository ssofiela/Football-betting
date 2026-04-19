# espn-sync

Node.js service that pulls match fixtures and scores from ESPN and writes
them into the Firestore `<tournament>_matches` collection used by the
Football-betting React app. Runs daily via GitHub Actions.

See `docs/superpowers/specs/2026-04-19-espn-score-sync-design.md` in the
repo root for the full design.

## Commands

```bash
cd scripts/espn-sync
npm install

# One-off seed (requires empty target collection or --force)
TOURNAMENT_KEY=euro2024_test \
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
  npm run seed

# Daily sync
TOURNAMENT_KEY=euro2024_test \
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
  npm run sync

# Tests
npm test
```

## Environment

- `TOURNAMENT_KEY` — which entry in `config/tournaments.js` to use.
- `GOOGLE_APPLICATION_CREDENTIALS` — path to a service-account JSON with
  Cloud Datastore User on the Firebase project.

In GitHub Actions, the service-account JSON is passed via the
`FIREBASE_SERVICE_ACCOUNT` secret and written to a temp file before the
script runs. See `.github/workflows/espn-sync.yml`.
