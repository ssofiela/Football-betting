const groupFixture = require('./__fixtures__/group-stage.json');
const knockoutFixture = require('./__fixtures__/knockout-und.json');
const { normalizeEvent } = require('./normalize');

const config = {
  key: 'euro2024_test',
  collection: 'euro2024_test_matches',
  espnLeague: 'uefa.euro',
  season: 2024,
  groupLabels: ['A', 'B', 'C', 'D', 'E', 'F'],
  knockoutRounds: ['rof16', 'rof8', 'rof4', 'rof2'],
};

describe('normalizeEvent', () => {
  test('maps a completed group-stage event to the internal shape', () => {
    const result = normalizeEvent(groupFixture, config);
    expect(result).toEqual({
      espnId: '727306',
      home: 'GER',
      away: 'SCO',
      homeScore: 1,
      awayScore: 0,
      group: 'A',
      kickoff: '2024-06-14T19:00Z',
      status: 'final',
    });
  });

  test('maps an unplayed knockout event with missing teams to UND / -1', () => {
    const result = normalizeEvent(knockoutFixture, config);
    expect(result).toEqual({
      espnId: '727350',
      home: 'UND',
      away: 'UND',
      homeScore: -1,
      awayScore: -1,
      group: 'rof16',
      kickoff: '2024-06-29T16:00Z',
      status: 'scheduled',
    });
  });

  test('maps state=in to status=in-progress', () => {
    const fixture = JSON.parse(JSON.stringify(groupFixture));
    fixture.status.type.state = 'in';
    fixture.status.type.completed = false;
    expect(normalizeEvent(fixture, config).status).toBe('in-progress');
  });

  test('throws a descriptive error if the event has no competitors', () => {
    const fixture = JSON.parse(JSON.stringify(groupFixture));
    fixture.competitions[0].competitors = [];
    expect(() => normalizeEvent(fixture, config)).toThrow(/competitors/);
  });

  test('returns group="UNK" when headline is missing (caller decides to skip)', () => {
    const fixture = JSON.parse(JSON.stringify(groupFixture));
    fixture.competitions[0].notes = [];
    expect(normalizeEvent(fixture, config).group).toBe('UNK');
  });
});
