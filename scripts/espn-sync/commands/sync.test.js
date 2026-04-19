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
