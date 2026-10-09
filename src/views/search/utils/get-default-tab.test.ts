import { getDefaultTabId } from './get-default-tab';
import { tabs } from '../config/tabs';
import { DEFAULT_TAB_ID } from '../context/search-tabs-context';

const counts = (entries: Record<string, number>) =>
  Object.entries(entries).map(([type, count]) => ({ type, count }));

describe('getDefaultTabId', () => {
  describe('without type filters', () => {
    it.each([
      ['Sample only', { Sample: 5 }, 's'],
      ['DataCollection only', { DataCollection: 5 }, 'dc'],
      [
        'Dataset and ComputationalTool',
        { Dataset: 5, ComputationalTool: 5 },
        'd',
      ],
      ['Sample and DataCollection', { Sample: 5, DataCollection: 5 }, 's'],
      [
        'ComputationalTool and DataCollection',
        { ComputationalTool: 5, DataCollection: 5 },
        'ct',
      ],
      [
        'ComputationalTool, Sample and DataCollection',
        { ComputationalTool: 5, Sample: 5, DataCollection: 5 },
        'ct',
      ],
      [
        'all four types',
        { Dataset: 5, ComputationalTool: 5, Sample: 5, DataCollection: 5 },
        'd',
      ],
      ['types with zero results', { Dataset: 0, Sample: 5 }, 's'],
      ['ResourceCatalog and Sample', { ResourceCatalog: 5, Sample: 5 }, 'd'],
    ])('%s %j -> tab %s', (_, facetCounts, expected) => {
      expect(getDefaultTabId(tabs, counts(facetCounts))).toBe(expected);
    });

    it('falls back to the default tab when there are no results', () => {
      expect(getDefaultTabId(tabs, [])).toBe(DEFAULT_TAB_ID);
      expect(getDefaultTabId(tabs, counts({ Dataset: 0 }))).toBe(
        DEFAULT_TAB_ID,
      );
    });
  });

  describe('with type filters', () => {
    it('shows the tab of a single selected type even with zero results', () => {
      expect(
        getDefaultTabId(tabs, counts({ Dataset: 5, Sample: 0 }), ['Sample']),
      ).toBe('s');
    });

    it('shows the highest-priority selected type with results', () => {
      expect(
        getDefaultTabId(
          tabs,
          counts({ Dataset: 0, ComputationalTool: 0, DataCollection: 5 }),
          ['Dataset', 'DataCollection'],
        ),
      ).toBe('dc');
    });

    it('shows the highest-priority selected type when all have zero results', () => {
      expect(
        getDefaultTabId(tabs, counts({ Sample: 0, DataCollection: 0 }), [
          'DataCollection',
          'Sample',
        ]),
      ).toBe('s');
    });
  });
});
