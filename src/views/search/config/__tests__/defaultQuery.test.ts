import {
  APPLY_DEFAULT_DATE_FILTER_KEY,
  APPLY_DEFAULT_DATE_PARAM,
  shouldApplyDefaultDate,
} from '../defaultQuery';

describe('shouldApplyDefaultDate', () => {
  it('seeds the default on a fresh query (no opt-out, no date)', () => {
    expect(shouldApplyDefaultDate(undefined, {})).toBe(true);
    expect(shouldApplyDefaultDate('true', { topic: ['alpha'] })).toBe(true);
  });

  it('does not seed when the user opted out via applyDefaultDate=false', () => {
    expect(shouldApplyDefaultDate('false', {})).toBe(false);
    expect(shouldApplyDefaultDate('false', { topic: ['alpha'] })).toBe(false);
  });

  it('does not seed when a date filter is already applied', () => {
    expect(
      shouldApplyDefaultDate(undefined, {
        date: ['2020-01-01', '2021-12-31'],
      }),
    ).toBe(false);
  });

  it('treats an empty date array as no date filter', () => {
    expect(shouldApplyDefaultDate(undefined, { date: [] })).toBe(true);
  });

  it('exposes stable param/key names used across the URL and saved queries', () => {
    expect(APPLY_DEFAULT_DATE_PARAM).toBe('applyDefaultDate');
    expect(APPLY_DEFAULT_DATE_FILTER_KEY).toBe('_applyDefaultDate');
  });
});
