import { pointsBreakdown, cumulativeSeries } from './stats';
import { countPoints } from './utils';

// A small league: two group matches and the final (id 103, points ×2).
// Match order by id: group A [0, 1], final rof2 [103].
const matches = {
	A: [
		{ id: 0, home: 'BRA', away: 'JPN', homeScore: 2, awayScore: 1, group: 'A' },
		{ id: 1, home: 'GER', away: 'FRA', homeScore: 0, awayScore: 0, group: 'A' },
	],
	rof2: [
		{
			id: 103,
			home: 'ESP',
			away: 'ARG',
			homeScore: 1,
			awayScore: 0,
			group: 'rof2',
		},
	],
};

// alice: exact group match (3), wrong second (0), exact final (3 → 6 with ×2)
// bob: right outcome group match (1), no bet on second, right-outcome final (1 → 2)
const alice = {
	id: 'alice',
	name: 'Alice',
	A: ['2', '1', '2', '0'],
	rof2: ['1', '0'],
};
const bob = {
	id: 'bob',
	name: 'Bob',
	A: ['3', '1'],
	rof2: ['2', '1'],
};
const users = { alice, bob };

describe('pointsBreakdown', () => {
	it('buckets exact, right-outcome and wrong results by base category', () => {
		// Alice: exact group (3), wrong group (0), exact final counted as base 3
		expect(pointsBreakdown(alice, matches)).toEqual({
			zero: 1,
			one: 0,
			three: 2,
		});
	});

	it('counts a played match with a missing bet as a 0-point match', () => {
		// Bob: right-outcome group (1), no bet on second group match (0),
		// right-outcome final counted as base 1
		expect(pointsBreakdown(bob, matches)).toEqual({
			zero: 1,
			one: 2,
			three: 0,
		});
	});

	it('ignores unplayed matches', () => {
		const withUnplayed = {
			...matches,
			A: [
				...matches.A,
				{ id: 2, home: 'X', away: 'Y', homeScore: -1, awayScore: -1, group: 'A' },
			],
		};
		expect(pointsBreakdown(alice, withUnplayed)).toEqual(
			pointsBreakdown(alice, matches)
		);
	});

	it('counts sum to the number of played matches', () => {
		const { zero, one, three } = pointsBreakdown(alice, matches);
		expect(zero + one + three).toBe(3);
	});
});

describe('cumulativeSeries', () => {
	it('returns rows in chronological id order', () => {
		const { rows } = cumulativeSeries(users, matches);
		expect(rows.map((r) => r.matchup)).toEqual([
			'BRA–JPN',
			'GER–FRA',
			'ESP–ARG',
		]);
		expect(rows.map((r) => r.phase)).toEqual([
			'Lohkot',
			'Lohkot',
			'Mitaliottelut',
		]);
	});

	it('produces monotonically non-decreasing series per user', () => {
		const { rows, userNames } = cumulativeSeries(users, matches);
		userNames.forEach((name) => {
			for (let i = 1; i < rows.length; i++) {
				expect(rows[i][name]).toBeGreaterThanOrEqual(rows[i - 1][name]);
			}
		});
	});

	it("ends each user's cumulative value at countPoints", () => {
		const { rows, userNames } = cumulativeSeries(users, matches);
		const last = rows[rows.length - 1];
		expect(last[userNames[0]]).toBe(countPoints(alice, matches));
		expect(last[userNames[1]]).toBe(countPoints(bob, matches));
	});
});
