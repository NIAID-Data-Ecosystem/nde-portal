import {
  COLLECTION_SIZE_BUCKETS,
  getBucketByKey,
  getBucketRangeValues,
} from './collection-size';

describe('collection size buckets', () => {
  it('are ordered and contiguous, with no gaps or overlaps', () => {
    COLLECTION_SIZE_BUCKETS.forEach((bucket, index) => {
      const next = COLLECTION_SIZE_BUCKETS[index + 1];
      if (!next) return;
      // Every bucket except the last is closed, and the next one starts
      // exactly one above it. A gap would drop records from the chart.
      expect(bucket.max).toBeDefined();
      expect(next.min).toBe((bucket.max as number) + 1);
    });
  });

  it('start at zero and end open-ended', () => {
    expect(COLLECTION_SIZE_BUCKETS[0].min).toBe(0);
    expect(
      COLLECTION_SIZE_BUCKETS[COLLECTION_SIZE_BUCKETS.length - 1].max,
    ).toBeUndefined();
  });

  it('have unique keys that resolve back to their bucket', () => {
    const keys = COLLECTION_SIZE_BUCKETS.map(bucket => bucket.key);
    expect(new Set(keys).size).toBe(keys.length);

    keys.forEach(key => {
      expect(getBucketByKey(key)?.key).toBe(key);
    });
  });

  it('returns nothing for an unknown key', () => {
    expect(getBucketByKey('nope')).toBeUndefined();
  });

  describe('getBucketRangeValues', () => {
    it('returns both endpoints of a closed bucket', () => {
      expect(
        getBucketRangeValues({ key: '1000-9999', min: 1000, max: 9999 }),
      ).toEqual(['1000', '9999']);
    });

    // Matches what the range inputs write for an unbounded end, so a bar click
    // and a typed range serialize identically.
    it('marks the open end with a wildcard', () => {
      expect(
        getBucketRangeValues({ key: '10000000-*', min: 10000000 }),
      ).toEqual(['10000000', '*']);
    });
  });
});
