import React from 'react';
import _ from 'lodash';
import { convertIso3Code } from 'convert-country-codes';
import FlagWithName from '../components/FlagWithName';
import { getCountryName } from './countryNames';

export const groupKeys = [
	'A',
	'B',
	'C',
	'D',
	'E',
	'F',
	'G',
	'H',
	'I',
	'J',
	'K',
	'L',
	'rof32',
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
	if (!convertedCountryCode) {
		return <p key={team}>{getCountryName(team)}</p>;
	}
	return <FlagWithName countryCode={team} iso2={convertedCountryCode} key={team} />;
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
	if (id === 103) points *= 2;
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
		rof32: 'Kahdeksasosavälierät',
		rof16: 'Neljännesvälierät',
		rof8: 'Puolivälierät',
		rof4: 'Välierät',
		rof2: 'Mitaliottelut',
	};
	return names[code];
};

export const checkActivity = (groupCode) => {
	return _.includes(groupKeys, groupCode);
};
