import { FormattedResource } from 'src/utils/api/types';

import { BannerDate } from './types';

const DATE_FIELDS = [
  { property: 'datePublished', label: 'Published' },
  { property: 'dateCreated', label: 'Created' },
  { property: 'dateModified', label: 'Modified' },
] as const;

// A resource's labelled dates, led by its unlabelled `date` unless that only
// repeats one of them.
export const getBannerDates = (data: FormattedResource): BannerDate[] => {
  const dates = DATE_FIELDS.flatMap(({ property, label }) => {
    const value = data[property];
    return value ? [{ label, value }] : [];
  });
  const { date } = data;
  return date && dates.every(({ value }) => value !== date)
    ? [{ value: date }, ...dates]
    : dates;
};
