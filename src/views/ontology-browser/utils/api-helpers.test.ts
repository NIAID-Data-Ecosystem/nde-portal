import axios from 'axios';
import { fetchSearchResults } from 'src/utils/api';

import { OntologyLineageItem } from '../types';
import {
  fetchBioThingsSearchAPI,
  fetchChildrenFromBioThingsAPI,
  fetchLineageFromBioThingsAPI,
  fetchPortalCounts,
  formatIRI,
  searchOntologyAPI,
  SearchParams,
} from './api-helpers';

jest.mock('axios');
jest.mock('src/utils/api', () => ({ fetchSearchResults: jest.fn() }));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedFetchSearchResults = fetchSearchResults as jest.Mock;

const BIOTHINGS_API_URL = 'https://t.biothings.io/v1';

const SEARCH_PARAMS: SearchParams = {
  q: 'homo',
  ontology: ['ncbitaxon'],
  biothingsFields: ['_id', 'rank', 'scientific_name'],
  olsFields: ['iri', 'label', 'ontology_name', 'short_form', 'type'],
};

const makeNode = (
  taxonId: string,
  overrides: Partial<OntologyLineageItem> = {},
): OntologyLineageItem => ({
  id: taxonId,
  commonName: '',
  hasChildren: false,
  iri: formatIRI(taxonId, 'ncbitaxon'),
  label: `taxon ${taxonId}`,
  ontologyName: 'ncbitaxon',
  parentTaxonId: null,
  state: { opened: false, selected: false },
  taxonId,
  ...overrides,
});

// Shape of the NDE `/query` response that the lineage lookups read.
const portalResponse = ({
  totalRecords,
  totalLineageRecords,
  childTaxonCounts = [],
}: {
  totalRecords?: number;
  totalLineageRecords?: number;
  childTaxonCounts?: { taxonId: number; count: number }[];
}) => ({
  results: [],
  total: 0,
  facets: {
    lineage: {
      totalRecords,
      totalLineageRecords,
      children: { childTaxonCounts },
    },
  },
});

beforeEach(() => {
  jest.clearAllMocks();
  // The fetchers log before rethrowing; keep the error-path tests quiet.
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('formatIRI', () => {
  it.each([
    ['9606', 'ncbitaxon', 'http://purl.obolibrary.org/obo/NCBITaxon_9606'],
    ['9606', 'NCBITaxon', 'http://purl.obolibrary.org/obo/NCBITaxon_9606'],
    ['topic_0091', 'edam', 'http://edamontology.org/topic_0091'],
    ['GO_0008150', 'go', 'http://purl.obolibrary.org/obo/GO_0008150'],
  ])('formats %s in %s as %s', (id, ontology, expected) => {
    expect(formatIRI(id, ontology)).toBe(expected);
  });
});

describe('fetchBioThingsSearchAPI', () => {
  it('returns no results for an empty query without a request', async () => {
    await expect(
      fetchBioThingsSearchAPI({ ...SEARCH_PARAMS, q: '' }),
    ).resolves.toEqual([]);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('queries BioThings and maps hits to search results', async () => {
    const signal = new AbortController().signal;
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        hits: [
          { _id: '9606', scientific_name: 'Homo sapiens', rank: 'species' },
          { _id: '9605', scientific_name: 'Homo', rank: 'genus' },
        ],
      },
    });

    const results = await fetchBioThingsSearchAPI(
      { ...SEARCH_PARAMS, userquery: 'nde' },
      signal,
    );

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${BIOTHINGS_API_URL}/query?`,
      {
        params: {
          q: 'homo',
          fields: '_id,rank,scientific_name',
          size: 8,
          userquery: 'nde',
        },
        signal,
      },
    );
    expect(results).toEqual([
      {
        _id: '9606',
        definingAPI: 'biothings',
        definingOntology: 'ncbitaxon',
        label: 'Homo sapiens',
        rank: 'species',
      },
      {
        _id: '9605',
        definingAPI: 'biothings',
        definingOntology: 'ncbitaxon',
        label: 'Homo',
        rank: 'genus',
      },
    ]);
  });

  it('returns no results when the request is cancelled', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('canceled'));
    mockedAxios.isCancel.mockReturnValueOnce(true);

    await expect(fetchBioThingsSearchAPI(SEARCH_PARAMS)).resolves.toEqual([]);
  });

  it('rethrows other request errors', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));
    mockedAxios.isCancel.mockReturnValueOnce(false);

    await expect(fetchBioThingsSearchAPI(SEARCH_PARAMS)).rejects.toThrow(
      'Network Error',
    );
  });
});

describe('searchOntologyAPI', () => {
  it('returns no results for an empty query without a request', async () => {
    await expect(
      searchOntologyAPI({ ...SEARCH_PARAMS, q: '' }),
    ).resolves.toEqual([]);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('searches BioThings when NCBI Taxonomy is selected', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        hits: [
          { _id: '9606', scientific_name: 'Homo sapiens', rank: 'species' },
        ],
      },
    });

    const results = await searchOntologyAPI({
      ...SEARCH_PARAMS,
      ontology: ['edam', 'ncbitaxon'],
    });

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get.mock.calls[0][0]).toBe(
      `${BIOTHINGS_API_URL}/query?`,
    );
    expect(results.map(result => result._id)).toEqual(['9606']);
  });

  it('returns no results for ontologies other than NCBI Taxonomy', async () => {
    // The OLS search for the other ontologies is currently switched off.
    await expect(
      searchOntologyAPI({ ...SEARCH_PARAMS, ontology: ['edam'] }),
    ).resolves.toEqual([]);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });
});

describe('fetchLineageFromBioThingsAPI', () => {
  /*
  BioThings returns the lineage ids from the term itself up to the root, and the
  POST returns the detailed records in that same order.
  */
  const LINEAGE_IDS = [9606, 9605, 1];
  const DETAILED_LINEAGE = [
    {
      taxid: 9606,
      parent_taxid: 9605,
      scientific_name: 'Homo sapiens',
      genbank_common_name: 'human',
      common_name: ['man'],
      rank: 'species',
      children: [],
    },
    {
      taxid: 9605,
      parent_taxid: 1,
      scientific_name: 'Homo',
      common_name: 'humans',
      rank: 'genus',
      children: [9606],
    },
    {
      taxid: 1,
      parent_taxid: 1,
      scientific_name: 'root',
      rank: 'no rank',
      children: [9605],
    },
  ];

  const mockLineageResponses = () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { lineage: LINEAGE_IDS } });
    mockedAxios.post.mockResolvedValueOnce({ data: DETAILED_LINEAGE });
  };

  it('throws without an id', async () => {
    await expect(
      fetchLineageFromBioThingsAPI({ id: '', ontology: 'ncbitaxon' }),
    ).rejects.toThrow('No id provided');
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('fetches the lineage ids, then their details', async () => {
    mockLineageResponses();

    await fetchLineageFromBioThingsAPI({ id: '9606', ontology: 'ncbitaxon' });

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${BIOTHINGS_API_URL}/taxon/9606?include_children`,
    );
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${BIOTHINGS_API_URL}/taxon`,
      expect.objectContaining({ ids: '9606,9605,1' }),
      expect.anything(),
    );
  });

  it('returns the lineage from the root down to the term', async () => {
    mockLineageResponses();

    const { lineage } = await fetchLineageFromBioThingsAPI({
      id: '9606',
      ontology: 'ncbitaxon',
    });

    expect(lineage).toEqual([
      expect.objectContaining({
        id: '1',
        taxonId: '1',
        label: 'root',
        parentTaxonId: null,
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_1',
        ontologyName: 'ncbitaxon',
        state: { opened: true, selected: false },
      }),
      expect.objectContaining({
        id: '9605',
        label: 'Homo',
        parentTaxonId: '1',
        hasChildren: true,
        state: { opened: true, selected: false },
      }),
      expect.objectContaining({
        id: '9606',
        label: 'Homo sapiens',
        parentTaxonId: '9605',
        hasChildren: false,
        // The searched term is the selected leaf of the tree.
        state: { opened: false, selected: true },
      }),
    ]);
  });

  it('prefers the GenBank common name over the common name', async () => {
    mockLineageResponses();

    const { lineage } = await fetchLineageFromBioThingsAPI({
      id: '9606',
      ontology: 'ncbitaxon',
    });

    expect(lineage.map(node => node.commonName)).toEqual([
      '',
      'humans',
      'human',
    ]);
  });

  it('throws when the lineage is missing from the response', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: {} });

    await expect(
      fetchLineageFromBioThingsAPI({ id: '9606', ontology: 'ncbitaxon' }),
    ).rejects.toThrow('lineage data is not available or invalid');
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });
});

describe('fetchChildrenFromBioThingsAPI', () => {
  const parent = makeNode('9605', { label: 'Homo', hasChildren: true });
  const params = {
    node: parent,
    q: '',
    id: '9605',
    ontology: 'ncbitaxon',
    from: 0,
    size: 2,
  };

  const detailedChild = (taxid: number) => ({
    taxid,
    parent_taxid: 9605,
    scientific_name: `taxon ${taxid}`,
    rank: 'species',
    children: [],
  });

  /*
  9606 has datasets in the portal; BioThings also lists it among Homo's
  children, alongside two children with no datasets.
  */
  const mockChildrenResponses = () => {
    mockedFetchSearchResults.mockResolvedValueOnce(
      portalResponse({ childTaxonCounts: [{ taxonId: 9606, count: 50 }] }),
    );
    mockedAxios.get.mockResolvedValueOnce({
      data: { children: [1425170, 9606, 2665952] },
    });
    mockedAxios.post.mockImplementationOnce(async (_url, body: any) => ({
      data: body.ids.split(',').map(Number).map(detailedChild),
    }));
  };

  const requestedIds = () => (mockedAxios.post.mock.calls[0][1] as any).ids;

  it('throws without an id', async () => {
    await expect(
      fetchChildrenFromBioThingsAPI({ ...params, id: '' }),
    ).rejects.toThrow('No ID provided');
  });

  it('looks up portal counts for the parent node', async () => {
    mockChildrenResponses();

    await fetchChildrenFromBioThingsAPI(params);

    expect(mockedFetchSearchResults).toHaveBeenCalledWith({
      q: '__all__',
      size: 0,
      lineage: 9605,
    });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${BIOTHINGS_API_URL}/taxon/9605?include_children`,
    );
  });

  it('scopes the portal counts to the search query', async () => {
    mockChildrenResponses();

    await fetchChildrenFromBioThingsAPI({ ...params, q: 'covid' });

    expect(mockedFetchSearchResults).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'covid' }),
    );
  });

  it('pages children with datasets first, without duplicates', async () => {
    mockChildrenResponses();

    const { pagination } = await fetchChildrenFromBioThingsAPI(params);

    expect(requestedIds()).toBe('9606,1425170');
    expect(pagination).toEqual({
      hasMore: true,
      numPage: 0,
      totalPages: 2,
      totalElements: 3,
    });
  });

  it('fetches the requested page of children', async () => {
    mockChildrenResponses();

    const { children, pagination } = await fetchChildrenFromBioThingsAPI({
      ...params,
      from: 1,
    });

    expect(requestedIds()).toBe('2665952');
    expect(children.map(child => child.taxonId)).toEqual(['2665952']);
    expect(pagination).toEqual({
      hasMore: false,
      numPage: 1,
      totalPages: 2,
      totalElements: 3,
    });
  });

  it('maps children onto the parent node', async () => {
    mockChildrenResponses();

    const { children } = await fetchChildrenFromBioThingsAPI(params);

    expect(children).toHaveLength(2);
    children.forEach(child =>
      expect(child).toEqual(
        expect.objectContaining({
          parentTaxonId: '9605',
          ontologyName: 'ncbitaxon',
          iri: `http://purl.obolibrary.org/obo/NCBITaxon_${child.taxonId}`,
          hasChildren: false,
        }),
      ),
    );
  });

  it('returns no children and empty pagination for a leaf', async () => {
    mockedFetchSearchResults.mockResolvedValueOnce(portalResponse({}));
    mockedAxios.get.mockResolvedValueOnce({ data: { children: [] } });

    await expect(fetchChildrenFromBioThingsAPI(params)).resolves.toEqual({
      children: [],
      pagination: {
        hasMore: false,
        numPage: 0,
        totalPages: 0,
        totalElements: 0,
      },
    });
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });
});

describe('fetchPortalCounts', () => {
  /*
  The real request limiter spaces requests 100ms apart, so these tests keep
  their lineages short.
  */
  const mockCountsByTaxon = (
    responses: Record<number, ReturnType<typeof portalResponse> | undefined>,
  ) =>
    mockedFetchSearchResults.mockImplementation(async ({ lineage }) =>
      lineage in responses ? responses[lineage] : portalResponse({}),
    );

  it('requests counts for each node by its numeric taxon id', async () => {
    mockCountsByTaxon({});

    await fetchPortalCounts([makeNode('NCBITaxon_9606'), makeNode('9605')], {
      q: 'covid',
    });

    expect(mockedFetchSearchResults).toHaveBeenCalledWith({
      q: 'covid',
      size: 0,
      lineage: 9606,
    });
    expect(mockedFetchSearchResults).toHaveBeenCalledWith({
      q: 'covid',
      size: 0,
      lineage: 9605,
    });
  });

  it('counts across all resources without a query', async () => {
    mockCountsByTaxon({});

    await fetchPortalCounts([makeNode('9606')], {});

    expect(mockedFetchSearchResults).toHaveBeenCalledWith(
      expect.objectContaining({ q: '__all__' }),
    );
  });

  it('adds term and sub-term counts, keeping lineage order', async () => {
    mockCountsByTaxon({
      1: portalResponse({ totalRecords: 0, totalLineageRecords: 600 }),
      9606: portalResponse({ totalRecords: 40, totalLineageRecords: 45 }),
    });

    const lineage = await fetchPortalCounts(
      [makeNode('1'), makeNode('9606')],
      {},
    );

    expect(lineage.map(({ taxonId, counts }) => ({ taxonId, counts }))).toEqual(
      [
        { taxonId: '1', counts: { termCount: 0, termAndChildrenCount: 600 } },
        {
          taxonId: '9606',
          counts: { termCount: 40, termAndChildrenCount: 45 },
        },
      ],
    );
  });

  it('defaults counts to zero when the portal has none', async () => {
    mockCountsByTaxon({ 9606: undefined });

    const [node] = await fetchPortalCounts([makeNode('9606')], {});

    expect(node.counts).toEqual({ termCount: 0, termAndChildrenCount: 0 });
  });

  it.each([
    [
      'BioThings lists children',
      { hasChildren: true },
      portalResponse({ totalRecords: 5, totalLineageRecords: 5 }),
      true,
    ],
    [
      'the portal has datasets for child taxa',
      {},
      portalResponse({
        totalRecords: 5,
        totalLineageRecords: 5,
        childTaxonCounts: [{ taxonId: 63221, count: 1 }],
      }),
      true,
    ],
    [
      'sub-terms add datasets beyond the term itself',
      {},
      portalResponse({ totalRecords: 5, totalLineageRecords: 8 }),
      true,
    ],
    [
      'nothing indicates children',
      {},
      portalResponse({ totalRecords: 5, totalLineageRecords: 5 }),
      false,
    ],
  ])(
    'marks hasChildren when %s',
    async (_, nodeOverrides, response, expected) => {
      mockCountsByTaxon({ 9606: response });

      const [node] = await fetchPortalCounts(
        [makeNode('9606', nodeOverrides)],
        {},
      );

      expect(node.hasChildren).toBe(expected);
    },
  );

  it('rethrows when a count request fails', async () => {
    mockedFetchSearchResults.mockRejectedValueOnce(new Error('API Error'));

    await expect(fetchPortalCounts([makeNode('9606')], {})).rejects.toThrow(
      'API Error',
    );
  });
});
