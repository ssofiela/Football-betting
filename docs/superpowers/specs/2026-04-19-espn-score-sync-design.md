# ESPN → Firestore Score Sync Service — Design

**Date:** 2026-04-19
**Status:** Approved, ready for implementation plan
**Target tournament:** FIFA World Cup 2026 (tested against UEFA Euro 2024)

## Background

`Football-betting` is a React + Firebase app where users guess scores of a
football tournament's matches and compete inside named `userGroup`s. Match
results are the source of truth for the points table, and today they are
written by hand: an admin edits `src/data/matches.json` and runs a
commented-out `writeDB()` helper in `HomePage.js` that copies the JSON into
the `euro2025_matches` Firestore collection.

This spec defines a Node.js background service that replaces the manual step
by pulling match data from ESPN's public scoreboard API and writing it into
Firestore on a daily schedule.

### Relevant existing data model

- **`users`** — one doc per user. Keys: `name`, `userGroup`, and one key per
  group code (`A`, `B`, `C`, `D`, `rof8`, `rof4`, `rof2`). Each group key
  stores the user's bets as an array of length `2N` for the group's `N`
  matches: `[m0Home, m0Away, m1Home, m1Away, ...]`.
- **`euro2025_matches`** — one doc per match. Fields: `id` (number),
  `home` (ISO3 code or `UND`), `away`, `homeScore` (−1 = not played),
  `awayScore`, `group`.
- **`userGroups`** — list of user-group metadata.

### Points rule (unchanged by this project)

`utils.js#getPoints`:
- Exact score → **3 points**.
- Correct outcome (same winner, or draw with same goal difference) → **1 point**.
- Otherwise → **0**.
- Match with `id === 30` → points tripled (featured-match convention).
- A match with either score `−1` yields 0 points (treated as not played).

## Goals

1. Pull fixtures and scores from ESPN for a parameterized tournament.
2. Maintain the Firestore match collection automatically once per day at
   **06:00 UTC** (late enough to capture previous-day North-American
   kickoffs for WC 2026).
3. Fill in knockout-round teams (`home` / `away`) once ESPN knows them,
   without ever renumbering matches or breaking saved user bets.
4. Be runnable against a past tournament (Euro 2024) for end-to-end
   verification before WC 2026 kicks off.

## Non-goals

- No changes to the betting flow, scoreboard UI, or points calculation.
- No live / in-match updates (daily cadence is sufficient).
- No alternative data sources or fallback APIs.
- No user-facing admin UI — all configuration is code + env vars.

## Architecture

A single Node.js script lives in this repo under `scripts/espn-sync/`,
invoked by a GitHub Actions scheduled workflow at `0 6 * * *` and by a
`workflow_dispatch` trigger for manual seed runs. It talks to Firestore via
`firebase-admin` using a service-account JSON stored in the
`FIREBASE_SERVICE_ACCOUNT` repo secret, and to ESPN via the unauthenticated
`site.api.espn.com` scoreboard endpoint.

```
GitHub Actions cron (0 6 * * *)
        │
        ▼
  node scripts/espn-sync/index.js sync
        │
        ├──► ESPN scoreboard API (HTTP GET)
        │
        └──► Firestore (firebase-admin)
```

Deployment choice (GitHub Actions over Cloud Functions / Cloud Run / a VM)
was driven by: the repo is already on GitHub, daily cadence makes drift
irrelevant, and it avoids enabling Firebase Blaze or standing up new
hosting.

## Component layout

```
scripts/espn-sync/
├── package.json           # Isolated from the React app's deps
├── README.md
├── index.js               # CLI entry: dispatches to seed or sync
├── config/
│   └── tournaments.js     # Tournament configs
├── espn/
│   ├── client.js          # Thin HTTP wrapper around ESPN
│   └── normalize.js       # ESPN event → internal shape
├── firestore/
│   ├── admin.js           # Lazy-init firebase-admin from env
│   └── repository.js      # get/set/merge match docs for a collection
├── commands/
│   ├── seed.js            # Build match list from ESPN, write new docs
│   └── sync.js            # Merge updates into existing docs
├── lib/
│   └── teamCodes.js       # ESPN abbreviation ↔ ISO3 translation
└── __tests__/
    └── fixtures/espn-*.json
```

Boundaries:

- `espn/` knows nothing about Firestore.
- `firestore/` knows nothing about ESPN.
- `commands/` is the only layer that composes both.
- `lib/teamCodes.js` isolates the one dirty spot where ESPN abbreviations
  (mostly ISO3 already) get translated to the ISO3 codes the React app's
  flag component expects.

### Tournament config shape

A single file (`config/tournaments.js`) exports a map keyed by tournament:

```js
{
  wc2026: {
    key: 'wc2026',
    collection: 'wc2026_matches',
    espnLeague: 'fifa.world',
    season: 2026,
    groupLabels: ['A','B','C','D','E','F','G','H','I','J','K','L'],
    knockoutRounds: ['rof32','rof16','rof8','rof4','rof2'],
  },
  euro2024_test: {
    key: 'euro2024_test',
    collection: 'euro2024_test_matches',
    espnLeague: 'uefa.euro',
    season: 2024,
    groupLabels: ['A','B','C','D','E','F'],
    knockoutRounds: ['rof16','rof8','rof4','rof2'],
  },
}
```

The active tournament is selected via the `TOURNAMENT_KEY` env var set in
the GitHub Actions workflow.

## Data flow

### Seed (manual, one-off per tournament)

Triggered by `workflow_dispatch` or `node index.js seed <tournamentKey>`.

1. Load the tournament config by key.
2. Fetch the full fixtures list from ESPN (scoreboard endpoint, paginated
   by week / date range until every match is covered).
3. Sort all events by kickoff time and assign a sequential numeric `id`
   starting at 0.
4. For each ESPN event, build the internal shape:
   - `espnId` (string)
   - `home`, `away` — ISO3 codes, translated via `teamCodes.js`. Use
     `'UND'` when ESPN doesn't yet have a team for a knockout slot.
   - `homeScore`, `awayScore` — `-1` at seed time.
   - `group` — `'A'..'L'` for group stage; round code (`'rof32'`,
     `'rof16'`, `'rof8'`, `'rof4'`, `'rof2'`) for knockouts.
   - `kickoff` — ISO timestamp string.
   - `status` — `'scheduled'`.
   - `id` — sequential number from step 3.
5. Write each doc with `set(doc)` using the ESPN event ID as the Firestore
   doc ID. Seeding is non-destructive by default: abort with a clear error
   if the target collection is non-empty, unless `--force` is passed.

### Sync (automatic, daily at 06:00 UTC)

Triggered by the cron schedule.

1. Load the tournament config from `TOURNAMENT_KEY`.
2. Fetch yesterday + today's ESPN scoreboard (narrow window — we don't
   re-walk the whole tournament each day).
3. For each ESPN event:
   - Look up the matching Firestore doc by ESPN ID (= doc ID). If not
     found, log a warning and skip. Sync never creates docs; seed does.
   - Build a partial update containing only fields whose ESPN value
     differs from the stored value. Always consider `homeScore`,
     `awayScore`, `status`. When the stored `home`/`away` is `'UND'` and
     ESPN now has a real team, include `home`/`away` too.
   - Write the partial via `update(doc, partial)`. No-op if empty.
4. Log one line per match (`[id=12] USA 2 – 1 CAN (final)` or
   `no change`) and a counts summary at the end.
5. Exit 0 on success; non-zero on any HTTP or Firestore failure not caught
   by the per-event error handling.

**Invariant: `id` is immutable after seed.** The service must refuse to
write an `id` value that differs from the one already stored. This is
what keeps user bets indexed correctly.

**Narrow time window rationale:** we don't need to re-read 104 matches to
catch the two or three that happened yesterday. Sparse reads are
friendlier to ESPN's unauthenticated endpoint and reduce the blast radius
of a malformed response for an old match.

## Idempotency & error handling

Both commands are safe to re-run.

- `seed` — aborts on a non-empty collection (unless `--force`), so
  repeated invocations never duplicate.
- `sync` — `update` with an empty partial is a no-op; a second identical
  run writes nothing.

| Failure | Response |
|---|---|
| ESPN non-200 / network error | Retry 3× with exponential backoff (1s / 4s / 15s). If still failing, exit non-zero; next day's run recovers. |
| ESPN returns a malformed event | Log a warning, skip that event, continue. |
| Firestore write fails | No per-write retry — surface the error and exit non-zero. |
| Unknown team abbreviation | Log warning with the raw value, write through as-is. React's `getFlag` renders unknown codes as text, which is acceptable. Add the mapping later. |
| ESPN event has no matching Firestore doc (during sync) | Log and skip. Systematic occurrences imply the seed is stale and a human should re-seed. |
| Missing / invalid service-account secret | Fail fast at startup before hitting ESPN. |

**Alerting:** GitHub Actions emails repo owners on failed workflow runs.
That's the alert channel — no extra notification plumbing.

**Safety rails:**
- `sync` never writes to the `users` collection.
- Never deletes documents.
- Never modifies `id` after seed.
- Treats a stored doc as authoritative for `id`; diverging computed `id`
  is a bug and causes the event to be skipped with a loud warning.

## React-app impact

One small change in the consumer:

In `src/pages/HomePage.js`, when grouping fetched matches, sort each
group's array by the numeric `id` field. Today the app relies on
Firestore's default doc order, which happens to be correct for doc IDs
`"0".."51"` but won't be for numeric-string ESPN IDs:

```js
_.mapValues(
  _.groupBy(docs, d => d.group),
  arr => _.sortBy(arr, 'id'),
)
```

When the service goes live for WC 2026, `src/components/Firebase/firebase.js`
is pointed at the new collection (`wc2026_matches`). The existing
`euro2025_matches` data is left alone.

Unchanged: bet-writing flow, point calculation, scoreboard, knockout
logic, users / userGroups collections.

## Testing strategy

**Unit tests** (Jest, inside `scripts/espn-sync/__tests__/`):

- `espn/normalize.js` — frozen ESPN JSON fixtures in, normalized events
  out. Covers team-code translation, `UND` fallback, status mapping.
- `lib/teamCodes.js` — translation table spot checks.
- `commands/sync.js` — given (stored doc, ESPN event), assert the partial
  update contains only changed fields.

**Integration test** against the Firestore local emulator:

- Seed a synthetic dataset, run `sync` with a recorded ESPN response,
  assert docs end up as expected. Also covers the idempotent second-run
  invariant.

**Manual end-to-end test** (the acceptance test):

1. Run `seed` against `euro2024_test_matches` pointing at ESPN's
   `uefa.euro` 2024 endpoint.
2. Spot-check ~5 matches in the Firebase console against known Euro 2024
   results.
3. Run `sync`. Verify zero writes (idempotency).
4. Temporarily point a throwaway branch of the React app at the test
   collection; eyeball the scoreboard.

**Out of scope for tests:** ESPN's own data correctness, GitHub Actions'
scheduling reliability, Firestore durability.

## Secrets & configuration

GitHub Actions secrets (repo Settings → Secrets → Actions):

- `FIREBASE_SERVICE_ACCOUNT` — JSON key for a service account scoped to
  Cloud Datastore User on this Firebase project.

Workflow env vars (plain, in `espn-sync.yml`):

- `TOURNAMENT_KEY` — `wc2026` in production, `euro2024_test` during
  testing.

No ESPN API key is required.

## Open items deliberately left unsolved

- The "featured match = `id === 30`" rule is brittle across tournaments.
  This project preserves the convention (service assigns sequential `id`s
  ordered by kickoff). Making this a proper field is out of scope.
- React-side sort-by-`id` is a minimal fix; a broader refactor of the
  matches-loading code is out of scope.
