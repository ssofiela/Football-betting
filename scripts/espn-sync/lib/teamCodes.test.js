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
    expect(toIso3('XX')).toBe('UND');
    expect(toIso3('ZZZ')).toBe('ZZZ');
  });
});
