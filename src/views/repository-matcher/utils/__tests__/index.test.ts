import { buildItemUrl, itemTypes } from '..';
import { RepositoryMatcherItem } from 'src/views/repository-matcher/types';
import { getTabIdFromResourceType } from 'src/views/search/config/tabs';

const makeItem = (overrides: Partial<RepositoryMatcherItem>) =>
  overrides as RepositoryMatcherItem;

describe('itemTypes', () => {
  it('returns the array as-is when type is an array', () => {
    expect(
      itemTypes(makeItem({ type: ['Resource Catalog', 'Dataset Repository'] })),
    ).toEqual(['Resource Catalog', 'Dataset Repository']);
  });

  it('wraps a string type in an array', () => {
    expect(itemTypes(makeItem({ type: 'Resource Catalog' as any }))).toEqual([
      'Resource Catalog',
    ]);
  });

  it('returns an empty array when type is missing or not a string/array', () => {
    expect(itemTypes(makeItem({}))).toEqual([]);
    expect(itemTypes(makeItem({ type: 42 as any }))).toEqual([]);
  });
});

describe('buildItemUrl', () => {
  it('returns an empty string when the item has no identifier', () => {
    expect(buildItemUrl(makeItem({ type: ['Resource Catalog'] }))).toBe('');
    expect(buildItemUrl(makeItem({ identifier: '', type: [] as any }))).toBe(
      '',
    );
  });

  it('links to the resources page for Resource Catalog items', () => {
    expect(
      buildItemUrl(
        makeItem({ identifier: 'cat 1', type: ['Resource Catalog'] }),
      ),
    ).toBe(`/resources?id=${encodeURIComponent('cat 1')}`);
  });

  it('links to the search page with a dataCatalog filter for repositories', () => {
    const url = buildItemUrl(
      makeItem({ identifier: 'repo-1', type: ['Dataset Repository'] }),
    );
    expect(url.startsWith('/search?')).toBe(true);
    expect(url).toContain('q=');
    expect(url).toContain('filters=');
    expect(url).toContain(encodeURIComponent('repo-1'));
    // Plain repositories get no tab param.
    expect(url).not.toContain('tab=');
  });

  it('adds the computational tool tab for Computational Tool Repository items', () => {
    const tab = getTabIdFromResourceType('ComputationalTool');
    const url = buildItemUrl(
      makeItem({
        identifier: 'tool-1',
        type: ['Computational Tool Repository'],
      }),
    );
    expect(url.startsWith('/search?')).toBe(true);
    if (tab) {
      expect(url).toContain(`tab=${tab}`);
    }
  });

  it('adds the sample tab for Sample Repository items', () => {
    const tab = getTabIdFromResourceType('Sample');
    const url = buildItemUrl(
      makeItem({ identifier: 'sample-1', type: ['Sample Repository'] }),
    );
    expect(url.startsWith('/search?')).toBe(true);
    if (tab) {
      expect(url).toContain(`tab=${tab}`);
    }
  });
});
