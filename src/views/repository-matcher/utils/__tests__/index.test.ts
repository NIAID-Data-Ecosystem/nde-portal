import { itemTypes } from '..';
import { RepositoryMatcherItem } from 'src/views/repository-matcher/types';

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
