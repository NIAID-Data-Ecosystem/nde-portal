import { FormattedResource } from 'src/utils/api/types';

import { getBannerDates } from './helpers';

// getBannerDates only reads the date fields.
const datesOf = (fields: Partial<FormattedResource>) =>
  getBannerDates(fields as FormattedResource);

describe('getBannerDates', () => {
  it('labels each specific date, in published/created/modified order', () => {
    expect(
      datesOf({
        dateModified: '2024-03-01',
        dateCreated: '2024-02-01',
        datePublished: '2024-01-01',
      }),
    ).toEqual([
      { label: 'Published', value: '2024-01-01' },
      { label: 'Created', value: '2024-02-01' },
      { label: 'Modified', value: '2024-03-01' },
    ]);
  });

  it('leads with the unlabelled date when no specific date repeats it', () => {
    expect(
      datesOf({ date: '2024-05-01', datePublished: '2024-01-01' }),
    ).toEqual([
      { value: '2024-05-01' },
      { label: 'Published', value: '2024-01-01' },
    ]);
  });

  it('drops the unlabelled date when a specific date repeats it', () => {
    expect(
      datesOf({
        date: '2024-03-01',
        datePublished: '2024-01-01',
        dateModified: '2024-03-01',
      }),
    ).toEqual([
      { label: 'Published', value: '2024-01-01' },
      { label: 'Modified', value: '2024-03-01' },
    ]);
  });

  it('returns nothing for a resource without dates', () => {
    expect(datesOf({ date: null, datePublished: null })).toEqual([]);
  });
});
