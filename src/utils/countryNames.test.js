import { getCountryName } from './countryNames';

describe('getCountryName', () => {
	it('returns the Finnish name for a normal ISO3 code', () => {
		expect(getCountryName('MAR')).toBe('Marokko');
		expect(getCountryName('BRA')).toBe('Brasilia');
		expect(getCountryName('HRV')).toBe('Kroatia');
	});

	it('uses the manual fallback for the non-ISO GB nations', () => {
		expect(getCountryName('ENG')).toBe('Englanti');
		expect(getCountryName('SCO')).toBe('Skotlanti');
		expect(getCountryName('WAL')).toBe('Wales');
	});

	it('falls back to the raw code for an unknown team', () => {
		expect(getCountryName('XXX')).toBe('XXX');
	});
});
