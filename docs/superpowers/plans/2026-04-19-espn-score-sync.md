# ESPN → Firestore Score Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Node.js service that seeds a Firestore match collection from the ESPN public scoreboard API and updates scores daily via a GitHub Actions cron, without breaking saved user bets in the existing React app.

**Architecture:** Two-command CLI (`seed`, `sync`) under `scripts/espn-sync/`, isolated from the React app's deps. Pure modules (ESPN normalize, team-code map, partial-update builder) are unit-tested with Jest; the orchestration layer (seed/sync commands) is exercised manually against a real Euro 2024 collection before going live. GitHub Actions runs `sync` daily at 06:00 UTC with a service-account JSON passed via a repo secret.

**Tech Stack:** Node 20 (native `fetch`), `firebase-admin` 12.x for Firestore writes, Jest 29 for unit tests, GitHub Actions for scheduling. No ESPN API key required.

**Reference spec:** `docs/superpowers/specs/2026-04-19-espn-score-sync-design.md`

---

## File inventory

Files created:

- `scripts/espn-sync/package.json` — isolated Node package with `firebase-admin` and `jest`.
- `scripts/espn-sync/.gitignore` — ignores `node_modules/` and service-account JSON files.
- `scripts/espn-sync/README.md` — how to seed / run / configure secrets.
- `scripts/espn-sync/index.js` — CLI dispatcher: `seed | sync`.
- `scripts/espn-sync/config/tournaments.js` — tournament config map.
- `scripts/espn-sync/lib/teamCodes.js` — ESPN abbreviation → ISO3 translation.
- `scripts/espn-sync/lib/teamCodes.test.js` — tests for the translation.
- `scripts/espn-sync/espn/client.js` — `fetchScoreboard(league, season, dateRange)` with retry.
- `scripts/espn-sync/espn/normalize.js` — `normalizeEvent(rawEvent, config)`.
- `scripts/espn-sync/espn/normalize.test.js` — tests for `normalizeEvent`.
- `scripts/espn-sync/espn/__fixtures__/group-stage.json` — captured ESPN response for tests.
- `scripts/espn-sync/espn/__fixtures__/knockout-und.json` — captured knockout-stage fixture.
- `scripts/espn-sync/firestore/admin.js` — lazy firebase-admin initializer.
- `scripts/espn-sync/firestore/repository.js` — `listMatches`, `getMatch`, `createMatch`, `updateMatch`.
- `scripts/espn-sync/commands/seed.js` — seed command.
- `scripts/espn-sync/commands/sync.js` — sync command, plus pure `buildPartialUpdate` helper.
- `scripts/espn-sync/commands/sync.test.js` — tests for `buildPartialUpdate`.
- `.github/workflows/espn-sync.yml` — cron + manual dispatch.

Files modified:

- `src/pages/HomePage.js` — sort each group's matches by `id` before setting state.

Files unchanged (explicitly):

- `src/components/Firebase/firebase.js` — stays pointed at `euro2025_matches` until the user decides to cut over. A one-line edit to switch collections is called out in the final task but left for the user to flip.
- `src/utils/utils.js` — points/flag logic untouched.
- `src/data/matches.json` — kept as historical reference.

---

## Task 1: Package skeleton and .gitignore

**Files:**
- Create: `scripts/espn-sync/package.json`
- Create: `scripts/espn-sync/.gitignore`
- Create: `scripts/espn-sync/README.md`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "espn-sync",
  "version": "0.1.0",
  "private": true,
  "description": "Syncs match fixtures and scores from ESPN into the Football-betting Firestore collection.",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "seed": "node index.js seed",
    "sync": "node index.js sync",
    "test": "jest"
  },
  "dependencies": {
    "firebase-admin": "^12.7.0"
  },
  "devDependencies": {
    "jest": "^29.7.0"
  },
  "jest": {
    "testEnvironment": "node",
    "testPathIgnorePatterns": [
      "/node_modules/",
      "/__fixtures__/"
    ]
  }
}
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
*.log
service-account*.json
.env
.env.local
```

- [ ] **Step 3: Create stub `README.md`**

```markdown
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
```

- [ ] **Step 4: Install dependencies**

Run:
```bash
cd scripts/espn-sync && npm install
```

Expected: creates `node_modules/` and `package-lock.json` without errors.

- [ ] **Step 5: Commit**

```bash
git add scripts/espn-sync/package.json scripts/espn-sync/package-lock.json scripts/espn-sync/.gitignore scripts/espn-sync/README.md
git commit -m "feat(espn-sync): add package skeleton"
```

---

## Task 2: Tournament config

**Files:**
- Create: `scripts/espn-sync/config/tournaments.js`

- [ ] **Step 1: Create the config module**

```js
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
```

- [ ] **Step 2: Commit**

```bash
git add scripts/espn-sync/config/tournaments.js
git commit -m "feat(espn-sync): add tournament configs for WC2026 and Euro2024 test"
```

---

## Task 3: Team-code translation (TDD)

**Files:**
- Create: `scripts/espn-sync/lib/teamCodes.test.js`
- Create: `scripts/espn-sync/lib/teamCodes.js`

- [ ] **Step 1: Write failing tests**

```js
// scripts/espn-sync/lib/teamCodes.test.js
const { toIso3 } = require('./teamCodes');

describe('toIso3', () => {
  test('passes through a common ISO3 code unchanged', () => {
    expect(toIso3('ESP')).toBe('ESP');
    expect(toIso3('USA')).toBe('USA');
  });

  test('maps the UK nation overrides to the React app conventions', () => {
    expect(toIso3('ENG')).toBe('ENG');
    expect(toIso3('SCO')).toBe('SCO');
    expect(toIso3('WAL')).toBe('WAL');
  });

  test('returns UND for null, undefined, or empty string', () => {
    expect(toIso3(null)).toBe('UND');
    expect(toIso3(undefined)).toBe('UND');
    expect(toIso3('')).toBe('UND');
  });

  test('uppercases lowercased input', () => {
    expect(toIso3('esp')).toBe('ESP');
  });

  test('returns UND for unknown two-letter codes but keeps three-letter ones as-is', () => {
    // Two-letter → we don't know what to do, fail loud by returning UND.
    expect(toIso3('XX')).toBe('UND');
    // Three-letter unknown → pass through, React will render it as text.
    expect(toIso3('ZZZ')).toBe('ZZZ');
  });
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:
```bash
cd scripts/espn-sync && npx jest lib/teamCodes.test.js
```

Expected: FAIL with `Cannot find module './teamCodes'`.

- [ ] **Step 3: Implement `teamCodes.js`**

```js
// scripts/espn-sync/lib/teamCodes.js
// ESPN's soccer team `abbreviation` is usually ISO3 (e.g. "ESP", "USA").
// This module normalizes to the codes the React app's `getFlag` helper
// expects. Add overrides here when ESPN uses something non-standard.

const OVERRIDES = {
  // ESPN-specific → ISO3. Keep this small; most codes pass through.
  // Example stubs (uncomment + edit when we encounter a mismatch):
  // 'NED': 'NED',
};

function toIso3(raw) {
  if (!raw) return 'UND';
  const upper = String(raw).toUpperCase().trim();
  if (upper.length !== 3) return 'UND';
  return OVERRIDES[upper] || upper;
}

module.exports = { toIso3 };
```

- [ ] **Step 4: Run tests and verify they pass**

Run:
```bash
cd scripts/espn-sync && npx jest lib/teamCodes.test.js
```

Expected: PASS, 5/5 tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/espn-sync/lib/teamCodes.js scripts/espn-sync/lib/teamCodes.test.js
git commit -m "feat(espn-sync): add ESPN abbreviation → ISO3 translation"
```

---

## Task 4: ESPN event normalization (TDD)

**Files:**
- Create: `scripts/espn-sync/espn/__fixtures__/group-stage.json`
- Create: `scripts/espn-sync/espn/__fixtures__/knockout-und.json`
- Create: `scripts/espn-sync/espn/normalize.test.js`
- Create: `scripts/espn-sync/espn/normalize.js`

- [ ] **Step 1: Capture a group-stage fixture**

Create `scripts/espn-sync/espn/__fixtures__/group-stage.json`. This is a hand-minimized copy of the fields our code reads from a real ESPN event:

```json
{
  "id": "727306",
  "date": "2024-06-14T19:00Z",
  "status": {
    "type": {
      "name": "STATUS_FULL_TIME",
      "state": "post",
      "completed": true
    }
  },
  "competitions": [
    {
      "id": "727306",
      "notes": [
        {
          "type": "event",
          "headline": "Group A - Matchday 1"
        }
      ],
      "competitors": [
        {
          "homeAway": "home",
          "score": "1",
          "team": { "abbreviation": "GER" }
        },
        {
          "homeAway": "away",
          "score": "0",
          "team": { "abbreviation": "SCO" }
        }
      ]
    }
  ]
}
```

- [ ] **Step 2: Capture a knockout-with-UND fixture**

Create `scripts/espn-sync/espn/__fixtures__/knockout-und.json`:

```json
{
  "id": "727350",
  "date": "2024-06-29T16:00Z",
  "status": {
    "type": {
      "name": "STATUS_SCHEDULED",
      "state": "pre",
      "completed": false
    }
  },
  "competitions": [
    {
      "id": "727350",
      "notes": [
        {
          "type": "event",
          "headline": "Round of 16"
        }
      ],
      "competitors": [
        {
          "homeAway": "home",
          "score": "0",
          "team": { "abbreviation": "" }
        },
        {
          "homeAway": "away",
          "score": "0",
          "team": { "abbreviation": "" }
        }
      ]
    }
  ]
}
```

- [ ] **Step 3: Write failing tests**

```js
// scripts/espn-sync/espn/normalize.test.js
const groupFixture = require('./__fixtures__/group-stage.json');
const knockoutFixture = require('./__fixtures__/knockout-und.json');
const { normalizeEvent } = require('./normalize');

const config = {
  key: 'euro2024_test',
  collection: 'euro2024_test_matches',
  espnLeague: 'uefa.euro',
  season: 2024,
  groupLabels: ['A', 'B', 'C', 'D', 'E', 'F'],
  knockoutRounds: ['rof16', 'rof8', 'rof4', 'rof2'],
};

describe('normalizeEvent', () => {
  test('maps a completed group-stage event to the internal shape', () => {
    const result = normalizeEvent(groupFixture, config);
    expect(result).toEqual({
      espnId: '727306',
      home: 'GER',
      away: 'SCO',
      homeScore: 1,
      awayScore: 0,
      group: 'A',
      kickoff: '2024-06-14T19:00Z',
      status: 'final',
    });
  });

  test('maps an unplayed knockout event with missing teams to UND / -1', () => {
    const result = normalizeEvent(knockoutFixture, config);
    expect(result).toEqual({
      espnId: '727350',
      home: 'UND',
      away: 'UND',
      homeScore: -1,
      awayScore: -1,
      group: 'rof16',
      kickoff: '2024-06-29T16:00Z',
      status: 'scheduled',
    });
  });

  test('maps state=in to status=in-progress', () => {
    const fixture = JSON.parse(JSON.stringify(groupFixture));
    fixture.status.type.state = 'in';
    fixture.status.type.completed = false;
    expect(normalizeEvent(fixture, config).status).toBe('in-progress');
  });

  test('throws a descriptive error if the event has no competitors', () => {
    const fixture = JSON.parse(JSON.stringify(groupFixture));
    fixture.competitions[0].competitors = [];
    expect(() => normalizeEvent(fixture, config)).toThrow(/competitors/);
  });

  test('returns group="UNK" when headline is missing (caller decides to skip)', () => {
    const fixture = JSON.parse(JSON.stringify(groupFixture));
    fixture.competitions[0].notes = [];
    expect(normalizeEvent(fixture, config).group).toBe('UNK');
  });
});
```

- [ ] **Step 4: Run tests and verify they fail**

Run:
```bash
cd scripts/espn-sync && npx jest espn/normalize.test.js
```

Expected: FAIL with `Cannot find module './normalize'`.

- [ ] **Step 5: Implement `normalize.js`**

```js
// scripts/espn-sync/espn/normalize.js
const { toIso3 } = require('../lib/teamCodes');

// ESPN's scoreboard response puts the round/group label in
// competitions[0].notes[0].headline. Examples seen:
//   "Group A - Matchday 1"
//   "Group C - Matchday 3"
//   "Round of 16"
//   "Quarterfinals"
//   "Semifinals"
//   "Final"
// This mapping translates those into the codes the React app uses.
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

  // Group stage: "Group A - Matchday 1"
  const groupMatch = lower.match(/^group\s+([a-l])\b/i);
  if (groupMatch) {
    const letter = groupMatch[1].toUpperCase();
    if (config.groupLabels.includes(letter)) return letter;
    return 'UNK';
  }

  // Knockouts: longest-prefix match against the map (check "round of 16"
  // before "round of 32" etc. by iterating deterministically).
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

  // When the match hasn't been played, ESPN returns score "0" for both
  // sides. We only trust the score once status === 'final' or 'in-progress'.
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
```

- [ ] **Step 6: Run tests and verify they pass**

Run:
```bash
cd scripts/espn-sync && npx jest espn/normalize.test.js
```

Expected: PASS, 5/5 tests.

- [ ] **Step 7: Commit**

```bash
git add scripts/espn-sync/espn/normalize.js scripts/espn-sync/espn/normalize.test.js scripts/espn-sync/espn/__fixtures__/
git commit -m "feat(espn-sync): normalize ESPN events to internal shape"
```

---

## Task 5: ESPN HTTP client

**Files:**
- Create: `scripts/espn-sync/espn/client.js`

This module has no unit test — it's a thin HTTP wrapper and the real value comes from the Euro 2024 manual end-to-end run (Task 12).

- [ ] **Step 1: Implement `client.js`**

```js
// scripts/espn-sync/espn/client.js
// Thin wrapper around ESPN's public scoreboard endpoint, with retry.
//
// Endpoint shape:
//   GET http://site.api.espn.com/apis/site/v2/sports/soccer/<league>/scoreboard
//       ?dates=YYYYMMDD           (single day)
//       ?dates=YYYYMMDD-YYYYMMDD  (range; ESPN supports up to ~30 days)
//       ?seasontype=1             (optional: 1 = regular, but for tournaments
//                                  the endpoint respects the date range alone)
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
  // Tournaments run inside a single calendar year. We fetch Jan 1 →
  // Dec 31 of `season` in 30-day chunks.
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
```

- [ ] **Step 2: Commit**

```bash
git add scripts/espn-sync/espn/client.js
git commit -m "feat(espn-sync): add ESPN scoreboard HTTP client with retry"
```

---

## Task 6: Firebase admin initializer

**Files:**
- Create: `scripts/espn-sync/firestore/admin.js`

- [ ] **Step 1: Implement `admin.js`**

```js
// scripts/espn-sync/firestore/admin.js
// Lazy initialization of firebase-admin.
//
// Auth resolution order:
//   1. GOOGLE_APPLICATION_CREDENTIALS env var pointing at a service-account
//      JSON file (handled natively by firebase-admin's
//      `applicationDefault()`).
//   2. FIREBASE_SERVICE_ACCOUNT env var containing the JSON inline
//      (used by the GitHub Actions workflow).
//
// Fails fast at startup if neither is set.

const admin = require('firebase-admin');

let app;

function init() {
  if (app) return app;

  const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const filePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!inlineJson && !filePath) {
    throw new Error(
      'Neither FIREBASE_SERVICE_ACCOUNT (inline JSON) nor ' +
        'GOOGLE_APPLICATION_CREDENTIALS (path) is set. ' +
        'One is required to authenticate with Firestore.'
    );
  }

  const credential = inlineJson
    ? admin.credential.cert(JSON.parse(inlineJson))
    : admin.credential.applicationDefault();

  app = admin.initializeApp({ credential });
  return app;
}

function db() {
  init();
  return admin.firestore();
}

module.exports = { init, db };
```

- [ ] **Step 2: Commit**

```bash
git add scripts/espn-sync/firestore/admin.js
git commit -m "feat(espn-sync): add firebase-admin lazy initializer"
```

---

## Task 7: Firestore repository

**Files:**
- Create: `scripts/espn-sync/firestore/repository.js`

- [ ] **Step 1: Implement `repository.js`**

```js
// scripts/espn-sync/firestore/repository.js
// Narrow CRUD layer over the match collection. All methods take
// `collectionName` so the same repo works across tournaments.

const { db } = require('./admin');

function collection(name) {
  return db().collection(name);
}

async function listMatches(collectionName) {
  const snap = await collection(collectionName).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getMatch(collectionName, espnId) {
  const snap = await collection(collectionName).doc(String(espnId)).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

async function createMatch(collectionName, doc) {
  // `espnId` is required; used as the Firestore doc ID.
  if (!doc.espnId) throw new Error('createMatch requires doc.espnId');
  await collection(collectionName).doc(String(doc.espnId)).set(doc);
}

async function updateMatch(collectionName, espnId, partial) {
  if (!partial || Object.keys(partial).length === 0) return false;
  await collection(collectionName).doc(String(espnId)).update(partial);
  return true;
}

async function isEmpty(collectionName) {
  const snap = await collection(collectionName).limit(1).get();
  return snap.empty;
}

module.exports = {
  listMatches,
  getMatch,
  createMatch,
  updateMatch,
  isEmpty,
};
```

- [ ] **Step 2: Commit**

```bash
git add scripts/espn-sync/firestore/repository.js
git commit -m "feat(espn-sync): add Firestore match repository"
```

---

## Task 8: Sync command (TDD for the pure part)

**Files:**
- Create: `scripts/espn-sync/commands/sync.test.js`
- Create: `scripts/espn-sync/commands/sync.js`

Only `buildPartialUpdate` is pure. The orchestration around it (fetching + writing) is exercised manually in Task 12.

- [ ] **Step 1: Write failing tests**

```js
// scripts/espn-sync/commands/sync.test.js
const { buildPartialUpdate } = require('./sync');

const baseStored = {
  espnId: '727306',
  id: 3,
  home: 'GER',
  away: 'SCO',
  homeScore: -1,
  awayScore: -1,
  group: 'A',
  kickoff: '2024-06-14T19:00Z',
  status: 'scheduled',
};

describe('buildPartialUpdate', () => {
  test('returns empty object when nothing changed', () => {
    const incoming = { ...baseStored };
    expect(buildPartialUpdate(baseStored, incoming)).toEqual({});
  });

  test('includes only changed score/status fields', () => {
    const incoming = {
      ...baseStored,
      homeScore: 1,
      awayScore: 0,
      status: 'final',
    };
    expect(buildPartialUpdate(baseStored, incoming)).toEqual({
      homeScore: 1,
      awayScore: 0,
      status: 'final',
    });
  });

  test('fills in home/away when the stored values are UND and ESPN now has teams', () => {
    const stored = { ...baseStored, home: 'UND', away: 'UND', group: 'rof16' };
    const incoming = { ...stored, home: 'ESP', away: 'GER' };
    expect(buildPartialUpdate(stored, incoming)).toEqual({
      home: 'ESP',
      away: 'GER',
    });
  });

  test('never overwrites stored home/away if already a real team', () => {
    const stored = { ...baseStored, home: 'GER', away: 'SCO' };
    const incoming = { ...stored, home: 'FRA', away: 'ITA' };
    const partial = buildPartialUpdate(stored, incoming);
    expect(partial).not.toHaveProperty('home');
    expect(partial).not.toHaveProperty('away');
  });

  test('never includes id in the partial update', () => {
    const incoming = { ...baseStored, id: 999, status: 'final' };
    const partial = buildPartialUpdate(baseStored, incoming);
    expect(partial).not.toHaveProperty('id');
    expect(partial.status).toBe('final');
  });
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:
```bash
cd scripts/espn-sync && npx jest commands/sync.test.js
```

Expected: FAIL with `Cannot find module './sync'`.

- [ ] **Step 3: Implement `sync.js`**

```js
// scripts/espn-sync/commands/sync.js
const { getTournamentConfig } = require('../config/tournaments');
const { fetchScoreboard } = require('../espn/client');
const { normalizeEvent } = require('../espn/normalize');
const { getMatch, updateMatch } = require('../firestore/repository');

// Pure: given a stored match doc and a freshly-normalized ESPN event,
// return only the fields that need to change.
function buildPartialUpdate(stored, incoming) {
  const partial = {};

  // Always candidates for update.
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
  // Yesterday 00:00 UTC → today 23:59 UTC.
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
```

- [ ] **Step 4: Run tests and verify they pass**

Run:
```bash
cd scripts/espn-sync && npx jest commands/sync.test.js
```

Expected: PASS, 5/5 tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/espn-sync/commands/sync.js scripts/espn-sync/commands/sync.test.js
git commit -m "feat(espn-sync): add sync command with partial-update builder"
```

---

## Task 9: Seed command

**Files:**
- Create: `scripts/espn-sync/commands/seed.js`

No unit test — this is orchestration that writes to Firestore. It's exercised against Euro 2024 in Task 12.

- [ ] **Step 1: Implement `seed.js`**

```js
// scripts/espn-sync/commands/seed.js
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
  // sequential `id`s. Drop events whose group we can't determine — those
  // are typically friendlies or qualifiers returned alongside the tournament.
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
```

- [ ] **Step 2: Commit**

```bash
git add scripts/espn-sync/commands/seed.js
git commit -m "feat(espn-sync): add seed command that bootstraps a tournament"
```

---

## Task 10: CLI entry point

**Files:**
- Create: `scripts/espn-sync/index.js`

- [ ] **Step 1: Implement `index.js`**

```js
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
```

- [ ] **Step 2: Verify the CLI reports missing args cleanly**

Run:
```bash
cd scripts/espn-sync && node index.js
```

Expected: exits with code 2 and message "Missing tournament key..." (no auth errors — args are checked before Firestore init).

- [ ] **Step 3: Commit**

```bash
git add scripts/espn-sync/index.js
git commit -m "feat(espn-sync): add CLI entry point"
```

---

## Task 11: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/espn-sync.yml`

- [ ] **Step 1: Implement the workflow**

```yaml
name: ESPN Score Sync

on:
  schedule:
    # Daily at 06:00 UTC (catches overnight North American matches for WC 2026).
    - cron: '0 6 * * *'
  workflow_dispatch:
    inputs:
      command:
        description: 'Which command to run'
        required: true
        default: 'sync'
        type: choice
        options:
          - sync
          - seed
      tournament_key:
        description: 'Tournament config key (defaults to repo var TOURNAMENT_KEY)'
        required: false
        default: ''
      force:
        description: 'Pass --force (seed only)'
        required: false
        default: 'false'
        type: choice
        options:
          - 'false'
          - 'true'

jobs:
  run:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: scripts/espn-sync
    env:
      TOURNAMENT_KEY: ${{ github.event.inputs.tournament_key != '' && github.event.inputs.tournament_key || vars.TOURNAMENT_KEY }}
      FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: scripts/espn-sync/package-lock.json

      - run: npm ci

      - name: Run command
        run: |
          CMD="${{ github.event.inputs.command || 'sync' }}"
          if [ "$CMD" = "seed" ] && [ "${{ github.event.inputs.force }}" = "true" ]; then
            node index.js seed "$TOURNAMENT_KEY" --force
          else
            node index.js "$CMD" "$TOURNAMENT_KEY"
          fi
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/espn-sync.yml
git commit -m "ci: schedule daily ESPN score sync at 06:00 UTC"
```

- [ ] **Step 3: Document how to configure repo secrets & vars in the README**

Append to `scripts/espn-sync/README.md`:

```markdown

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
```

- [ ] **Step 4: Commit the README update**

```bash
git add scripts/espn-sync/README.md
git commit -m "docs(espn-sync): document GitHub secrets and vars"
```

---

## Task 12: Manual end-to-end seed against Euro 2024

**Files:** none created; writes to Firestore collection `euro2024_test_matches`.

This is the acceptance gate before cutting over to WC 2026.

- [ ] **Step 1: Create a service-account key locally**

In the Firebase console → Project settings → Service accounts → Generate new private key. Save as `scripts/espn-sync/service-account.json` (already git-ignored).

- [ ] **Step 2: Run seed against Euro 2024 test collection**

Run:
```bash
cd scripts/espn-sync
TOURNAMENT_KEY=euro2024_test \
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
  node index.js seed
```

Expected: log line per match (`[id=0] A: GER vs SCO @ 2024-06-14T19:00Z` and similar), total around 51 matches, ends with `[seed] done`.

- [ ] **Step 3: Spot-check Firestore**

In the Firebase console, open `euro2024_test_matches`. Verify:

- Document count matches the tournament (~51 for Euro 2024 with a 24-team bracket — group stage + 16 knockouts).
- `id=0` is the opening match (GER vs SCO for Euro 2024, 2024-06-14).
- A few random group-stage matches have real `homeScore` / `awayScore` values.
- At least one knockout doc has `home: 'UND'` or real teams filled in depending on recency of the seed.

- [ ] **Step 4: Run sync and verify zero writes**

Run:
```bash
TOURNAMENT_KEY=euro2024_test \
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
  node index.js sync
```

Expected: final log line `[sync] done: updated=0 unchanged=N skipped=M`, where `updated=0` confirms idempotency. A non-zero `skipped` count is fine — it just means the ESPN 48-hour window included events not tied to this tournament.

- [ ] **Step 5: Document the run**

No commit here (secret file must not be committed). Take a screenshot or copy the log output into a PR comment if this is being reviewed.

---

## Task 13: React app — sort matches by id

**Files:**
- Modify: `src/pages/HomePage.js`

Before the service goes live for WC 2026, the React app needs to sort matches by `id` within each group. Currently the order depends on the Firestore doc-ID lex order, which happens to match for `"0"..."51"` but will not for ESPN numeric-string IDs.

- [ ] **Step 1: Read the current HomePage.js grouping code**

Current code at `src/pages/HomePage.js` around lines 33–41:

```js
props.firebase
  .matches()
  .get()
  .then((querySnapshot) => {
    return _.groupBy(
      querySnapshot.docs.map((item) => item.data()),
      (item) => item.group
    );
  }),
```

- [ ] **Step 2: Replace with a sort-after-group version**

Change the inner `.then(...)` to:

```js
.then((querySnapshot) => {
  const grouped = _.groupBy(
    querySnapshot.docs.map((item) => item.data()),
    (item) => item.group
  );
  return _.mapValues(grouped, (arr) => _.sortBy(arr, 'id'));
}),
```

- [ ] **Step 3: Smoke-test the React app locally**

Run:
```bash
cd /Users/tomi/Documents/Football-betting
npm start
```

Expected: dev server starts, existing scoreboards and bet pages render. The sort should be a no-op for the current `euro2025_matches` data (doc IDs already match `id` field), so no visible change.

- [ ] **Step 4: Commit**

```bash
git add src/pages/HomePage.js
git commit -m "fix(home): sort matches by id within each group"
```

---

## Task 14: Cutover checklist (documentation only)

**Files:**
- Modify: `scripts/espn-sync/README.md`

The actual WC 2026 cutover happens months after this plan is written. Leave a checklist for the human who flips the switch so they don't have to re-derive it.

- [ ] **Step 1: Append a cutover section to the README**

Append to `scripts/espn-sync/README.md`:

```markdown

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
```

- [ ] **Step 2: Commit**

```bash
git add scripts/espn-sync/README.md
git commit -m "docs(espn-sync): add WC 2026 cutover checklist"
```

---

## Self-review notes

**Spec coverage check:**
- Daily 06:00 UTC cadence → Task 11 (cron string).
- Seed/sync split → Tasks 8, 9.
- ESPN event ID as Firestore doc ID → Task 7 (`createMatch` uses `doc.espnId`).
- Sequential `id` by kickoff → Task 9 (sort + `i` assignment).
- `id` immutable after seed → Task 8 (`buildPartialUpdate` never emits `id`).
- Promote UND → real team for knockouts → Task 8 (test + logic).
- Narrow time window on sync (yesterday + today) → Task 8 (`daysWindow`).
- Retry policy 1s/4s/15s → Task 5.
- Malformed event skipped with warning → Task 8 (sync) + Task 9 (seed).
- Seed aborts on non-empty unless `--force` → Task 9 + Task 10.
- GitHub Actions email on failure → default behavior, noted in spec, nothing to implement.
- React app sort-by-`id` → Task 13.
- Manual E2E against Euro 2024 → Task 12.
- Unit tests: teamCodes, normalize, buildPartialUpdate → Tasks 3, 4, 8.

**Deliberately deferred (per spec "Open items"):**
- Featured-match rule refactor (`id === 30`): not in plan, preserved by design.
- Broader HomePage refactor: not in plan, minimal sort-fix only.

**Integration emulator test (spec "Testing strategy"):** Not turned into a task. The manual Euro 2024 seed+sync in Task 12 covers the same invariant (seed + idempotent re-sync) against the real Firestore, which is higher-signal than the emulator for a one-time verification. If we end up needing repeatable CI integration tests later, we'll add an emulator task then. This is a deliberate deviation from the spec's testing strategy section — flagged here so the reviewer can push back if needed.
