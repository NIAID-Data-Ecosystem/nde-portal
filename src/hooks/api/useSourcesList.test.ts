import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fetchMetadata } from './helpers';
import { useResourceCatalogs } from './useResourceCatalogs';
import {
  buildResourceCatalogSearchURL,
  getResourceCatalogIdentifier,
  getTabIdFromSourceType,
  useSourcesList,
} from './useSourcesList';

jest.mock('./helpers', () => ({ fetchMetadata: jest.fn() }));
jest.mock('./useResourceCatalogs');

const mockFetchMetadata = fetchMetadata as jest.Mock;
const mockUseResourceCatalogs = useResourceCatalogs as jest.Mock;

// Fresh QueryClient per test so cached metadata doesn't leak between cases.
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

// Two metadata sources: `repoA` is a plain repository; `repoB` maps to the
// `dde_existing` resource catalog via `sameAs`.
const metadata = {
  src: {
    repoA: {
      sourceInfo: {
        identifier: 'repoA',
        name: 'Repo A',
        collectionType: 'Dataset Repository',
      },
    },
    repoB: {
      sourceInfo: {
        identifier: 'repoB',
        name: 'Repo B',
        collectionType: 'Dataset Repository',
        sameAs: 'https://data.niaid.nih.gov/resources?id=dde_existing',
      },
    },
  },
};

const setCatalogs = ({
  data = [] as any[],
  isLoading = false,
  error = null as Error | null,
}: {
  data?: any[];
  isLoading?: boolean;
  error?: Error | null;
} = {}) => {
  mockUseResourceCatalogs.mockReturnValue({ data, isLoading, error });
};

describe('buildResourceCatalogSearchURL', () => {
  it('returns an empty string when no id is given', () => {
    expect(buildResourceCatalogSearchURL('')).toBe('');
  });

  it('scopes the search to the catalog record by _id', () => {
    const url = buildResourceCatalogSearchURL('dde_new');
    const params = new URLSearchParams(url.split('?')[1]);
    expect(url.startsWith('/search?')).toBe(true);
    expect(params.get('q')).toBe('');
    expect(params.get('filters')).toBe('(_id:("dde_new"))');
    expect(params.get('applyDefaultDate')).toBe('false');
  });
});

describe('getResourceCatalogIdentifier', () => {
  // A `sameAs` on a portal hostname qualifies whatever its path — the hostname
  // alone establishes that the link points back at this portal.
  it.each([
    // The canonical shape the metadata API actually returns.
    [
      'production',
      'https://data.niaid.nih.gov/resources?id=dde_prod',
      'dde_prod',
    ],
    // Every deployment is accepted, not just the one currently running: the
    // metadata API hands the same `sameAs` values to prod, staging and dev.
    [
      'staging',
      'https://data-staging.niaid.nih.gov/resources?id=dde_stg',
      'dde_stg',
    ],
    ['dev', 'https://nde-dev.biothings.io/resources?id=dde_dev', 'dde_dev'],
    // Hostnames are case-insensitive per the URL spec.
    [
      'a mixed-case hostname',
      'https://DATA.NIAID.NIH.GOV/resources?id=dde_case',
      'dde_case',
    ],
    [
      'http rather than https',
      'http://data.niaid.nih.gov/resources?id=dde_http',
      'dde_http',
    ],
    // `URLSearchParams` percent-decodes the value for us.
    [
      'a percent-encoded id',
      'https://data.niaid.nih.gov/resources?id=dde%5Fenc',
      'dde_enc',
    ],
    [
      'extra query params',
      'https://data.niaid.nih.gov/resources?foo=1&id=dde_multi',
      'dde_multi',
    ],
  ])('parses an absolute portal link with %s', (_label, sameAs, expected) => {
    expect(getResourceCatalogIdentifier(sameAs)).toBe(expected);
  });

  // A trailing slash is tolerated, and the pathname match is case-insensitive.
  it.each([
    ['https://data.niaid.nih.gov/resources/?id=dde_slash', 'dde_slash'],
    ['https://data.niaid.nih.gov/Resources?id=dde_case', 'dde_case'],
  ])('parses %s', (sameAs, expected) => {
    expect(getResourceCatalogIdentifier(sameAs)).toBe(expected);
  });

  it('ignores a fragment', () => {
    expect(
      getResourceCatalogIdentifier(
        'https://data.niaid.nih.gov/resources?id=dde_frag#section',
      ),
    ).toBe('dde_frag');
  });

  it('tolerates surrounding whitespace', () => {
    expect(
      getResourceCatalogIdentifier(
        '  https://data.niaid.nih.gov/resources?id=dde_trim  ',
      ),
    ).toBe('dde_trim');
  });

  // `sameAs` is free-form, source-supplied data: an unrelated link that merely
  // carries an `id` query param must not be mistaken for a catalog link.
  it.each([
    // Substring matches on "resources" are not enough — these were the false
    // positives the old `value.includes('resources')` check let through.
    [
      'the path merely contains "resources"',
      'https://example.org/human-resources?id=BAD',
    ],
    [
      '"resources" appears only in the query',
      'https://example.org/data?q=resources&id=BAD',
    ],
    // Lookalike host: a prefix/suffix check on the base URL would accept this.
    [
      'a lookalike hostname',
      'https://data.niaid.nih.gov.evil.com/resources?id=BAD',
    ],
    ['an unrelated host', 'https://orcid.org/0000-0002?id=BAD'],
    // A portal hostname alone is not enough — the `/resources` path is
    // required too.
    [
      'a portal host on another path',
      'https://data.niaid.nih.gov/other?id=BAD',
    ],
    ['a portal host at the root', 'https://data.niaid.nih.gov/?id=BAD'],
    [
      'a portal host on a nested resources path',
      'https://data.niaid.nih.gov/a/resources?id=BAD',
    ],
    // Protocol-relative values resolve to the *other* host, not the portal.
    ['a protocol-relative link', '//data.niaid.nih.gov/resources?id=BAD'],
    // Relative links are never accepted, even on the catalog path: only an
    // absolute link proves the value points back at this portal.
    ['a root-relative catalog link', '/resources?id=dde_1'],
    [
      'a root-relative catalog link with a trailing slash',
      '/resources/?id=dde_1',
    ],
    ['a relative link without a leading slash', 'resources?id=dde_2'],
    ['a dot-prefixed relative link', './resources?id=dde_3'],
    ['a relative link on another path', '/some/other/page?id=dde_4'],
    ['a query-only relative link', '?id=dde_5'],
    // No usable `id` to extract.
    ['an empty id', 'https://data.niaid.nih.gov/resources?id='],
    ['a portal link with no id param', 'https://data.niaid.nih.gov/resources'],
    // Not URL-like.
    ['a non-URL string', 'not a url'],
    ['a non-http scheme', 'mailto:someone@example.org?id=BAD'],
    ['an empty string', ''],
    ['a whitespace-only string', '   '],
  ])('returns undefined for %s', (_label, sameAs) => {
    expect(getResourceCatalogIdentifier(sameAs)).toBeUndefined();
  });

  it('returns undefined when sameAs is absent', () => {
    expect(getResourceCatalogIdentifier(undefined)).toBeUndefined();
    expect(getResourceCatalogIdentifier(undefined as any)).toBeUndefined();
    expect(getResourceCatalogIdentifier([])).toBeUndefined();
  });

  it('returns the first qualifying value in an array, skipping the rest', () => {
    expect(
      getResourceCatalogIdentifier([
        'https://orcid.org/0000-0002?id=BAD',
        'https://data.niaid.nih.gov/resources?id=dde_first',
        'https://data.niaid.nih.gov/resources?id=dde_second',
      ]),
    ).toBe('dde_first');
  });

  it('skips non-string array members despite the declared string[]', () => {
    // `sameAs` comes from upstream metadata, so an array can hold nulls.
    expect(
      getResourceCatalogIdentifier([
        null,
        undefined,
        42,
        '  ',
        'https://data.niaid.nih.gov/resources?id=dde_guarded',
      ] as any),
    ).toBe('dde_guarded');
  });

  // `PORTAL_HOSTNAMES` is built at module load, so these cases re-import the
  // module with a different `NEXT_PUBLIC_BASE_URL`.
  describe('the running deployment hostname', () => {
    const originalBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const loadWithBaseUrl = (baseUrl?: string) => {
      jest.resetModules();
      if (baseUrl === undefined) {
        delete process.env.NEXT_PUBLIC_BASE_URL;
      } else {
        process.env.NEXT_PUBLIC_BASE_URL = baseUrl;
      }
      return (require('./useSourcesList') as typeof import('./useSourcesList'))
        .getResourceCatalogIdentifier;
    };

    afterEach(() => {
      if (originalBaseUrl === undefined) {
        delete process.env.NEXT_PUBLIC_BASE_URL;
      } else {
        process.env.NEXT_PUBLIC_BASE_URL = originalBaseUrl;
      }
      jest.resetModules();
    });

    it('accepts links on the host the portal is currently served from', () => {
      // localhost isn't a known deployment, so this only passes because the
      // current base URL is folded into the allowed hostnames.
      const parse = loadWithBaseUrl('http://localhost:3000');
      expect(parse('http://localhost:3000/resources?id=dde_local')).toBe(
        'dde_local',
      );
    });

    it('falls back to the known hostnames when the base URL is unusable', () => {
      const parse = loadWithBaseUrl('not-a-url');
      expect(parse('https://data.niaid.nih.gov/resources?id=dde_prod')).toBe(
        'dde_prod',
      );
      // An unparseable base URL must not widen the check to everything.
      expect(parse('https://example.org/resources?id=BAD')).toBeUndefined();
    });
  });
});
describe('useSourcesList', () => {
  afterEach(() => jest.clearAllMocks());

  it('merges in only the resource catalogs not already represented by a source', async () => {
    mockFetchMetadata.mockResolvedValue(metadata as any);
    setCatalogs({
      data: [
        // Already represented by `repoB` (sameAs -> dde_existing): skipped.
        { _id: 'dde_existing', name: 'Existing Catalog' },
        // Not represented anywhere: added as a standalone source.
        { _id: 'dde_new', name: 'New Catalog', abstract: 'a new catalog' },
      ],
    });

    const { result } = renderHook(() => useSourcesList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const data = result.current.data || [];
    // 2 metadata sources + 1 added catalog (the duplicate is dropped).
    expect(data).toHaveLength(3);

    // The already-represented catalog is not added as its own row: the only
    // source carrying its id is the metadata source (`repoB`) that points to
    // it, which now adopts the catalog id as its own `_id`.
    const withExistingId = data.filter(source => source._id === 'dde_existing');
    expect(withExistingId).toHaveLength(1);
    expect(withExistingId[0].identifier).toBe('repoB');
    // ...and that source keeps the parsed identifier.
    const repoB = data.find(source => source.identifier === 'repoB');
    expect(repoB?.resourceCatalogIdentifier).toBe('dde_existing');

    // The unrepresented catalog is added, typed, and scoped by `_id`...
    const added = data.find(source => source._id === 'dde_new');
    expect(added).toBeDefined();
    expect(added?.name).toBe('New Catalog');
    expect(added?.type).toEqual(['Resource Catalog']);
    // ... and links to its own catalog page.
    expect(added?.resourceCatalogIdentifier).toBe('dde_new');
    const params = new URLSearchParams((added?.searchURL || '').split('?')[1]);
    expect(params.get('filters')).toBe('(_id:("dde_new"))');
  });

  it('types a source with a catalog sameAs as a Resource Catalog and ORs it into the search URL', async () => {
    mockFetchMetadata.mockResolvedValue({
      src: {
        repoCat: {
          sourceInfo: {
            identifier: 'repoCat',
            name: 'Repo Cat',
            collectionType: 'Dataset Repository',
            sameAs: 'https://data.niaid.nih.gov/resources?id=dde_catalog',
          },
        },
      },
    } as any);
    setCatalogs({ data: undefined });

    const { result } = renderHook(() => useSourcesList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const source = (result.current.data || [])[0];

    // The parsed identifier is adopted as the source `_id` and adds the
    // "Resource Catalog" type alongside the source's own type.
    expect(source.resourceCatalogIdentifier).toBe('dde_catalog');
    expect(source._id).toBe('dde_catalog');
    expect(source.type).toEqual(['Dataset Repository', 'Resource Catalog']);

    // Resources are matched by the source's display name, and the DDE catalog
    // record is OR-ed in by `name` next to them. The `_or` key itself is not
    // serialized: the parts keep their `field:` prefixes inside one paren
    // group, which is how the filter parser tells a cross-field OR from a
    // single field's multi-value OR.
    const params = new URLSearchParams((source.searchURL || '').split('?')[1]);
    expect(params.get('filters')).toBe(
      '(includedInDataCatalog.name:("Repo Cat") OR _id:("dde_catalog"))',
    );
  });

  it.each([
    // Carries an `id` param but is not a portal link.
    ['an unrelated link', 'https://example.org/human-resources?id=BAD'],
    // Points at the catalog page, but relative links are not accepted.
    ['a root-relative catalog link', '/resources?id=dde_relative'],
  ])(
    'leaves a source whose sameAs is %s untyped as a catalog',
    async (_label, sameAs) => {
      mockFetchMetadata.mockResolvedValue({
        src: {
          repoOther: {
            sourceInfo: {
              identifier: 'repoOther',
              name: 'Repo Other',
              collectionType: 'Dataset Repository',
              sameAs,
            },
          },
        },
      } as any);
      setCatalogs({ data: undefined });

      const { result } = renderHook(() => useSourcesList(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      const source = (result.current.data || [])[0];

      expect(source.resourceCatalogIdentifier).toBeUndefined();
      expect(source.type).toEqual(['Dataset Repository']);
      const params = new URLSearchParams(
        (source.searchURL || '').split('?')[1],
      );
      expect(params.get('filters')).toBe(
        '(includedInDataCatalog.name:("Repo Other"))',
      );
    },
  );

  it.each([
    [
      'drops unrecognized values from a collectionType array',
      ['Software', 'Dataset Repository', 'Knowledgebase'],
      ['Dataset Repository'],
    ],
    [
      'skips non-string array members despite the declared string[]',
      [null, 'Dataset Repository', 42],
      ['Dataset Repository'],
    ],
    [
      'leaves a source untyped when its only collectionType is unrecognized',
      'Knowledgebase',
      [],
    ],
    [
      'treats collectionType values as case-sensitive',
      ['dataset repository', 'Dataset Repository'],
      ['Dataset Repository'],
    ],
  ])('%s', async (_label, collectionType, expected) => {
    mockFetchMetadata.mockResolvedValue({
      src: {
        repoMixed: {
          sourceInfo: {
            identifier: 'repoMixed',
            name: 'Repo Mixed',
            collectionType,
          },
        },
      },
    } as any);
    setCatalogs({ data: undefined });

    const { result } = renderHook(() => useSourcesList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const source = (result.current.data || [])[0];

    expect(source.type).toEqual(expected);
  });

  it('preselects the search tab from the first recognized type', async () => {
    mockFetchMetadata.mockResolvedValue({
      src: {
        repoTool: {
          sourceInfo: {
            identifier: 'repoTool',
            name: 'Repo Tool',
            // `Aardvark` would sort first and hide the tab if it weren't
            // dropped before sorting.
            collectionType: ['Computational Tool Repository', 'Aardvark'],
          },
        },
      },
    } as any);
    setCatalogs({ data: undefined });

    const { result } = renderHook(() => useSourcesList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const source = (result.current.data || [])[0];

    expect(source.type).toEqual(['Computational Tool Repository']);
    const params = new URLSearchParams((source.searchURL || '').split('?')[1]);
    expect(params.get('tab')).toBe(
      getTabIdFromSourceType('Computational Tool Repository'),
    );
    expect(params.get('tab')).toBeTruthy();
  });

  it('enriches metadata sources with numberOfRecords, isNiaidFunded and dateModified', async () => {
    mockFetchMetadata.mockResolvedValue({
      src: {
        immport: {
          sourceInfo: {
            identifier: 'immport',
            name: 'ImmPort',
            collectionType: 'Dataset Repository',
          },
          stats: { immport: 1234 },
          version: '20240115',
        },
        // Missing stats/version — enrichment fields fall back safely.
        repoA: metadata.src.repoA,
      },
    } as any);
    setCatalogs({ data: undefined });

    const { result } = renderHook(() => useSourcesList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const data = result.current.data || [];

    const immport = data.find(source => source.identifier === 'immport');
    expect(immport?.numberOfRecords).toBe(1234);
    expect(immport?.isNiaidFunded).toBe(true);
    expect(immport?.dateModified).toBe('2024-01-15T00:00:00');

    const repoA = data.find(source => source.identifier === 'repoA');
    expect(repoA?.numberOfRecords).toBeUndefined();
    expect(repoA?.isNiaidFunded).toBe(false);
    expect(repoA?.dateModified).toBe('');
  });

  it('returns only the metadata sources when there are no resource catalogs', async () => {
    mockFetchMetadata.mockResolvedValue(metadata as any);
    setCatalogs({ data: undefined });

    const { result } = renderHook(() => useSourcesList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(2);
  });

  it('reports loading while the resource catalogs are still loading', () => {
    mockFetchMetadata.mockResolvedValue(metadata as any);
    setCatalogs({ isLoading: true, data: undefined });

    const { result } = renderHook(() => useSourcesList(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('surfaces a resource catalog error', () => {
    const catalogErr = new Error('catalog boom');
    mockFetchMetadata.mockResolvedValue(metadata as any);
    setCatalogs({ error: catalogErr });

    const { result } = renderHook(() => useSourcesList(), {
      wrapper: createWrapper(),
    });

    expect(result.current.error).toBe(catalogErr);
  });
});
