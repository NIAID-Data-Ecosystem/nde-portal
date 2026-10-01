import { generateOtherResourcesTitle } from '../tabs';

describe('generateOtherResourcesTitle', () => {
  it('sums resource catalogs, diseases and program info cards', () => {
    expect(
      generateOtherResourcesTitle(
        [
          { type: 'ResourceCatalog', count: 3 },
          { type: 'Dataset', count: 100 },
          { type: 'Disease', count: 2 },
        ],
        4,
      ),
    ).toBe('Other Resources (9)');
  });

  it('shows only the Other Resources total when there are no diseases', () => {
    expect(
      generateOtherResourcesTitle([{ type: 'ResourceCatalog', count: 5 }]),
    ).toBe('Other Resources (5)');
  });

  it('handles zero counts', () => {
    expect(generateOtherResourcesTitle([], 0)).toBe('Other Resources (0)');
  });

  it('formats large totals', () => {
    expect(
      generateOtherResourcesTitle(
        [{ type: 'ResourceCatalog', count: 1200 }],
        34,
      ),
    ).toBe(`Other Resources (${(1234).toLocaleString()})`);
  });
});
