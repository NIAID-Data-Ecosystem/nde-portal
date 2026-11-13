import axios from 'axios';
import { fetchSearchResults } from 'src/utils/api';

import { OntologyChildrenRequestParams } from '../types';
import { fetchChildrenFromBioThingsAPI } from './api-helpers';

jest.mock('axios');
jest.mock('src/utils/api', () => ({ fetchSearchResults: jest.fn() }));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedFetchSearchResults = fetchSearchResults as jest.Mock;

const record = (taxid: number, children: number[] = []) => ({
  _id: `${taxid}`,
  _version: 1,
  children,
  parent_taxid: 10239,
  rank: 'realm',
  scientific_name: `Taxon ${taxid}`,
  taxid,
});

const params = {
  node: { id: '10239' },
  q: '',
  id: '10239',
  ontology: 'ncbitaxon',
  from: 0,
  size: 50,
} as OntologyChildrenRequestParams;

describe('fetchChildrenFromBioThingsAPI', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Portal counts reference 3403061, a taxon that is no longer in NCBI /
  // BioThings (real case: expanding "Viruses").
  beforeEach(() => {
    mockedFetchSearchResults.mockResolvedValue({
      facets: {
        lineage: {
          children: {
            childTaxonCounts: [
              { taxonId: 2559587, count: 119928 },
              { taxonId: 3403061, count: 1252 },
            ],
          },
        },
      },
    });
    mockedAxios.get.mockResolvedValue({
      data: { children: [10472, 2559587] },
    });
  });

  it('only paginates over ids BioThings lists as children', async () => {
    mockedAxios.post.mockResolvedValue({
      data: [record(2559587), record(10472)],
    });

    const { pagination } = await fetchChildrenFromBioThingsAPI(params);

    // Portal-counted children first, stale id never requested or counted.
    expect(mockedAxios.post.mock.calls[0][1]).toMatchObject({
      ids: '2559587,10472',
    });
    expect(pagination).toMatchObject({ hasMore: false, totalElements: 2 });
  });

  it('skips records BioThings reports as notfound instead of throwing', async () => {
    mockedAxios.post.mockResolvedValue({
      data: [
        { query: '2559587', ...record(2559587, [1]) },
        { query: '3403061', notfound: true },
        { query: '10472', ...record(10472) },
      ],
    });

    const { children } = await fetchChildrenFromBioThingsAPI(params);

    expect(children.map(c => c.taxonId).sort()).toEqual(['10472', '2559587']);
    expect(children.find(c => c.taxonId === '2559587')?.hasChildren).toBe(true);
  });
});
