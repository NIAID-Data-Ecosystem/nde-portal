import {
  isProgramInfoCollection,
  matchesProgramQuery,
  ProgramCollection,
} from './helpers';

const makeCollection = (
  sourceOrganization: Record<string, unknown> | null = {},
): ProgramCollection =>
  ({
    id: 'a-program',
    term: 'A Program',
    count: 1,
    sourceOrganization: sourceOrganization && {
      name: 'A Program',
      ...sourceOrganization,
    },
  } as ProgramCollection);

describe('isProgramInfoCollection', () => {
  it('returns true when sourceOrganization is null', () => {
    expect(isProgramInfoCollection(makeCollection(null))).toBe(true);
  });

  it('returns true when sameAs does not exist', () => {
    expect(isProgramInfoCollection(makeCollection())).toBe(true);
    expect(isProgramInfoCollection(makeCollection({ sameAs: null }))).toBe(
      true,
    );
    expect(isProgramInfoCollection(makeCollection({ sameAs: [] }))).toBe(true);
  });

  it('returns true when sameAs has no dde_ url', () => {
    expect(
      isProgramInfoCollection(
        makeCollection({ sameAs: 'https://example.org/program' }),
      ),
    ).toBe(true);
    expect(
      isProgramInfoCollection(
        makeCollection({
          sameAs: ['https://example.org/a', 'https://example.org/b'],
        }),
      ),
    ).toBe(true);
  });

  it('returns false when sameAs contains a dde_ url', () => {
    expect(
      isProgramInfoCollection(
        makeCollection({
          sameAs: 'https://data.niaid.nih.gov/resources?id=dde_abc',
        }),
      ),
    ).toBe(false);
    expect(
      isProgramInfoCollection(
        makeCollection({
          sameAs: ['https://example.org/a', '/resources?id=dde_abc'],
        }),
      ),
    ).toBe(false);
  });
});

describe('matchesProgramQuery', () => {
  const collection = makeCollection({
    name: 'Centers for Research in Emerging Infectious Diseases',
    alternateName: ['CREID'],
    abstract: 'A global network studying viral outbreaks.',
  });

  it('returns false for an empty or default query', () => {
    expect(matchesProgramQuery(collection, '')).toBe(false);
    expect(matchesProgramQuery(collection, undefined)).toBe(false);
    expect(matchesProgramQuery(collection, '__all__')).toBe(false);
  });

  it('matches the name, alternate names and abstract', () => {
    expect(matchesProgramQuery(collection, 'emerging')).toBe(true);
    expect(matchesProgramQuery(collection, 'creid')).toBe(true);
    expect(matchesProgramQuery(collection, 'outbreaks')).toBe(true);
  });

  it('requires every term to match', () => {
    expect(matchesProgramQuery(collection, 'viral outbreaks')).toBe(true);
    expect(matchesProgramQuery(collection, 'viral malaria')).toBe(false);
  });

  it('ignores operators, quotes and field syntax', () => {
    expect(matchesProgramQuery(collection, '"viral" AND (outbreaks)')).toBe(
      true,
    );
    expect(
      matchesProgramQuery(collection, 'sourceOrganization.name:"CREID"'),
    ).toBe(true);
  });
});
