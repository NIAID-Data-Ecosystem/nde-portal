import {
  addMissingYears,
  getYear,
} from '../../../components/date-filter/helpers';

describe('date-filter/helpers', () => {
  it('parses valid years and handles invalid/special terms', () => {
    expect(getYear('2024-01-01')).toBe(2024);
    expect(getYear('-_exists_')).toBeNull();
    expect(getYear('')).toBeNull();
  });

  it('fills missing years while preserving existing values', () => {
    const filled = addMissingYears([
      { term: '2020-01-01', label: '2020', count: 2 },
      { term: '2022-01-01', label: '2022', count: 3 },
      { term: '-_exists_', label: 'No', count: 1 },
    ]);

    expect(filled.map(x => x.term)).toEqual([
      '2020-01-01',
      '2021-01-01',
      '2022-01-01',
    ]);
    expect(filled[1]).toEqual({ term: '2021-01-01', label: '2021', count: 0 });
  });

  it('applies start/end clamping and custom labels', () => {
    const filled = addMissingYears(
      [{ term: '2021-01-01', label: '2021', count: 5 }],
      { startYear: 2020, endYear: 2022, makeLabel: y => `Y-${y}` },
    );

    expect(filled).toEqual([
      { term: '2020-01-01', label: 'Y-2020', count: 0 },
      { term: '2021-01-01', label: '2021', count: 5 },
      { term: '2022-01-01', label: 'Y-2022', count: 0 },
    ]);
  });

  it('returns empty array for no valid year entries', () => {
    expect(
      addMissingYears([{ term: '-_exists_', label: 'No', count: 3 }]),
    ).toEqual([]);
  });
});
