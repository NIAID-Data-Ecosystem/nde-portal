jest.mock('src/components/metadata', () => ({
  getMetadataDescription: jest.fn((key: string) => `${key} description`),
}));

jest.mock('src/utils/formatting/formatConditionsOfAccess', () => ({
  formatConditionsOfAccess: jest.fn((value: string) => `formatted:${value}`),
  transformConditionsOfAccessLabel: jest.fn(
    (value: string) => `label:${value}`,
  ),
}));

import { FILTER_CONFIGS, getFilterById } from '../config';

describe('filters/config', () => {
  it('has unique filter ids and required fields', () => {
    const ids = FILTER_CONFIGS.map(cfg => cfg.id);
    expect(new Set(ids).size).toBe(ids.length);
    FILTER_CONFIGS.forEach(cfg => {
      expect(cfg.id).toBeTruthy();
      expect(cfg.name).toBeTruthy();
      expect(cfg.property).toBeTruthy();
      expect(cfg.queryType).toBeTruthy();
      expect(cfg.category).toBeTruthy();
    });
  });

  it('returns filter by id and undefined for missing id', () => {
    expect(getFilterById('date')?.property).toBe('date');
    expect(getFilterById('__missing__')).toBeUndefined();
  });

  it('applies transformData for conditionsOfAccess', () => {
    const conditions = FILTER_CONFIGS.find(f => f.id === 'conditionsOfAccess');
    expect(conditions?.transformData).toBeDefined();
    expect(
      conditions?.transformData?.({ term: 'open', count: 1, label: 'open' }),
    ).toEqual({ term: 'open', count: 1, label: 'label:formatted:open' });
    expect(conditions?.transformData?.({ term: 'open', count: 2 })).toEqual({
      term: 'open',
      count: 2,
      label: 'label:formatted:open',
    });
  });
});
