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

## GitHub Actions configuration

Under the GitHub repo settings:

1. **Secrets → Actions → New repository secret**
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: the full JSON contents of a service-account key with
     Cloud Datastore User on the Firebase project.
2. **Variables → Actions → New repository variable**
   - Name: `TOURNAMENT_KEY`
   - Value: `wc2026` in production, `euro2024_test` while testing.

`workflow_dispatch` lets you override `tournament_key`, pick the command
(`sync` or `seed`), and toggle `--force` for re-seeding.

## WC 2026 cutover checklist

When WC 2026 fixtures are available in ESPN:

1. Set GitHub repo variable `TOURNAMENT_KEY=wc2026`.
2. Run the `ESPN Score Sync` workflow with `workflow_dispatch`:
   - command: `seed`
   - tournament_key: `wc2026`
   - force: `false`
3. Inspect the new `wc2026_matches` collection in the Firebase console.
4. Edit `src/components/Firebase/firebase.js` — change the `matches()`
   method to point at `'wc2026_matches'`. Deploy the React app.
5. Update `src/utils/utils.js` `groupKeys` to match the WC 2026 bracket
   (12 group letters A–L + the knockout codes in the tournament config).
6. The daily cron at `0 6 * * *` takes over from here. Monitor the first
   few runs via the Actions tab.

Rollback: keep `euro2025_matches` untouched. If cutover breaks, revert
the `firebase.js` change and the service stops affecting production.
