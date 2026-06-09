import countries from 'i18n-iso-countries';
import fiLocale from 'i18n-iso-countries/langs/fi.json';

countries.registerLocale(fiLocale);

// Codes that are not ISO 3166 countries and so have no entry in the locale data.
const manualNames = {
	ENG: 'Englanti',
	SCO: 'Skotlanti',
	WAL: 'Wales',
};

// Resolve a team's ISO3 code to its full Finnish country name, falling back to
// the manual GB-nation map and finally the raw code so something always shows.
export const getCountryName = (team) =>
	manualNames[team] || countries.getName(team, 'fi') || team;
