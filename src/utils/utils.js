import React from 'react';
import _ from 'lodash';
import Flag from 'react-flags';
import { convertIocCode } from 'convert-country-codes';

export const getFlag = team => {
	const greatBritain = { WAL: '_wales', ENG: '_england' };
	const convertedCountryCode = convertIocCode(team)
		? convertIocCode(team).iso3
		: _.has(greatBritain, team)
		? greatBritain[team]
		: 'UND';
	return (
		<Flag
			country={convertedCountryCode}
			format="png"
			pngSize={64}
			shiny={false}
			alt="A flag"
			basePath="../img/flags/"
			width={48}
			height={48}
			key={team}
		/>
	);
};
