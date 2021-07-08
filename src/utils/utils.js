import React from 'react';
import _ from 'lodash';
import Flag from 'react-flags';
import { convertIocCode } from 'convert-country-codes';

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
];

export const getFlag = (team) => {
	const greatBritain = { SCO: '_scotland', WAL: '_wales', ENG: '_england' };
	const convertedCountryCode = convertIocCode(team)
		? convertIocCode(team).iso3
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
	rightAwayScore
) => {
	const myHomeScore = Number(myHomeScoreStr);
	const myAwayScore = Number(myAwayScoreStr);
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
				return 3;
			} else {
				return 1;
			}
		}
	}
	return 0;
};

export const convertFinals = (code) => {
	const names = {
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
