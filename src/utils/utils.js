import React from 'react';
import _ from 'lodash';
import Flag from 'react-flags';
import { convertIso3Code } from 'convert-country-codes';

export const groupKeys = [
	'A',
	'B',
	'C',
	'D',
	'E',
	'F',
	'rof16',
	'rof8',
	'rof4',
	'rof2',
];

export const getFlag = (team) => {
	const greatBritain = { SCO: '_scotland', WAL: '_wales', ENG: '_england' };
	const convertedCountryCode = convertIso3Code(team)
		? convertIso3Code(team).iso2
		: _.has(greatBritain, team)
		? greatBritain[team]
		: 'UND';
	const flagSize =
		window.innerWidth > 600 ? 64 : window.innerWidth > 330 ? 48 : 32;
	return (
		<Flag
			country={convertedCountryCode}
			format="png"
			pngSize={64}
			shiny={false}
			alt={convertedCountryCode}
			basePath="../img/flags/"
			width={flagSize}
			height={flagSize}
			key={team}
		/>
	);
};

export const getPoints = (
	myHomeScoreStr,
	myAwayScoreStr,
	rightHomeScore,
	rightAwayScore,
	id
) => {
	const myHomeScore = Number(myHomeScoreStr);
	const myAwayScore = Number(myAwayScoreStr);
	let points = 0;
	if (
		rightHomeScore >= 0 &&
		rightAwayScore >= 0 &&
		myHomeScore >= 0 &&
		myAwayScore >= 0
	) {
		if (
			(rightHomeScore - rightAwayScore) * (myHomeScore - myAwayScore) > 0 ||
			rightHomeScore - rightAwayScore === myHomeScore - myAwayScore
		) {
			if (rightHomeScore === myHomeScore && rightAwayScore === myAwayScore) {
				points = 3;
			} else {
				points = 1;
			}
		}
	}
	if (id === 50) points *= 2;
	return points;
};

export const countPoints = (user, matches) => {
	let points = 0;
	for (let groupChar of groupKeys) {
		const userBets = user[groupChar];
		if (userBets) {
			matches[groupChar].forEach((match, index) => {
				points += getPoints(
					userBets[index * 2],
					userBets[index * 2 + 1],
					match.homeScore,
					match.awayScore,
					match.id
				);
			});
		}
	}
	return points;
};

export const convertFinals = (code) => {
	const names = {
		rof16: 'Neljännesvälierät',
		rof8: 'Puolivälierät',
		rof4: 'Välierät',
		rof2: 'Finaali',
	};
	return names[code];
};

export const checkActivity = (groupCode) => {
	return _.includes(groupKeys, groupCode);
};
