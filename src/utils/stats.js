import _ from 'lodash';
import { groupKeys, getPoints, convertFinals } from './utils';

// The final is stored with id 103 and getPoints doubles its points (×2).
const FINAL_ID = 103;

// Phase label shown on the chart's x-axis for a given group code.
// Knockout rounds reuse the app's Finnish names; group stage is "Lohkot".
export const phaseLabel = (group) => convertFinals(group) || 'Lohkot';

// Flattens the grouped matches into a single list in chronological id order.
// Each entry keeps the group code and the match's position within its group,
// which is the index used to look up a user's bet (home at index*2, away at
// index*2 + 1).
export const flattenMatches = (matches) => {
	const flat = [];
	groupKeys.forEach((group) => {
		const groupMatches = matches[group];
		if (groupMatches) {
			groupMatches.forEach((match, index) => {
				flat.push({ match, group, index });
			});
		}
	});
	return _.sortBy(flat, (entry) => entry.match.id);
};

const isPlayed = (match) => match.homeScore >= 0 && match.awayScore >= 0;

const userPoints = (user, group, index, match) => {
	const userBets = user[group];
	return getPoints(
		userBets ? userBets[index * 2] : undefined,
		userBets ? userBets[index * 2 + 1] : undefined,
		match.homeScore,
		match.awayScore,
		match.id
	);
};

// Counts how many played matches landed a user in each base category.
// The final's points are halved first so an exact final counts as a single
// "3-point match" (not its doubled value). A played match the user did not
// bet on, or earned nothing on, counts as a 0-point match.
export const pointsBreakdown = (user, matches) => {
	const breakdown = { zero: 0, one: 0, three: 0 };
	flattenMatches(matches).forEach(({ match, group, index }) => {
		if (!isPlayed(match)) return;
		let points = userPoints(user, group, index, match);
		if (match.id === FINAL_ID) points /= 2;
		if (points === 3) breakdown.three += 1;
		else if (points === 1) breakdown.one += 1;
		else breakdown.zero += 1;
	});
	return breakdown;
};

// Builds, for every played match in chronological order, a row of each user's
// cumulative points (using the real points, so the final counts ×2). The
// returned userNames are unique so they can be used as Recharts data keys.
export const cumulativeSeries = (users, matches) => {
	const userList = _.values(users);
	const seen = {};
	const userNames = userList.map((user) => {
		const base = user.name ? user.name : 'Anonymous';
		if (seen[base] === undefined) {
			seen[base] = 0;
			return base;
		}
		seen[base] += 1;
		return `${base} (${seen[base] + 1})`;
	});

	const running = userList.map(() => 0);
	const rows = [];
	flattenMatches(matches).forEach(({ match, group, index }) => {
		if (!isPlayed(match)) return;
		const row = {
			phase: phaseLabel(group),
			matchup: `${match.home}–${match.away}`,
		};
		userList.forEach((user, i) => {
			running[i] += userPoints(user, group, index, match);
			row[userNames[i]] = running[i];
		});
		rows.push(row);
	});

	return { rows, userNames };
};
