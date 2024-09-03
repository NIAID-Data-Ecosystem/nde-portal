import { buildQueries, buildSourceQueries } from '../../utils/query-builders';
import {
  createCommonQuery,
  createQueryWithSourceMetadata,
  createNotExistsQuery,
} from '../../utils/queries';

jest.mock('../../utils/queries', () => ({
  createCommonQuery: jest.fn(),
  createQueryWithSourceMetadata: jest.fn(),
  createNotExistsQuery: jest.fn(),
}));

describe('buildQueries', () => {
  it('should create queries for a given facet field', () => {
    const facetField = 'testFacet';
    const params = { q: '', extra_filter: 'filter1' };
    const options = { queryKey: ['key1'], option1: 'value1' };

    const createQueries = buildQueries(facetField)!;
    const queries = createQueries(params, options);

    expect(createCommonQuery).toHaveBeenCalledWith({
      queryKey: ['key1'],
      params: { ...params, extra_filter: 'filter1', facets: facetField },
      option1: 'value1',
    });

    expect(createNotExistsQuery).toHaveBeenCalledWith({
      queryKey: ['key1'],
      params: { ...params, facets: facetField },
      option1: 'value1',
    });

    expect(queries).toHaveLength(2);
  });

  it('should handle absence of extra_filter in params', () => {
    const facetField = 'testFacet';
    const params = { q: '' };
    const options = { queryKey: ['key1'], option1: 'value1' };

    const createQueries = buildQueries(facetField)!;
    const queries = createQueries(params, options);

    expect(createCommonQuery).toHaveBeenCalledWith({
      queryKey: ['key1'],
      params: { ...params, extra_filter: undefined, facets: facetField },
      option1: 'value1',
    });

    expect(createNotExistsQuery).toHaveBeenCalledWith({
      queryKey: ['key1'],
      params: { ...params, facets: facetField },
      option1: 'value1',
    });

    expect(queries).toHaveLength(2);
  });

  it('should handle absence of options', () => {
    const facetField = 'testFacet';
    const params = { q: '', extra_filter: 'filter1' };
    const options = undefined;

    const createQueries = buildQueries(facetField)!;
    const queries = createQueries(params, options);

    expect(createCommonQuery).toHaveBeenCalledWith({
      queryKey: [],
      params: { ...params, extra_filter: 'filter1', facets: facetField },
    });

    expect(createNotExistsQuery).toHaveBeenCalledWith({
      queryKey: [],
      params: { ...params, facets: facetField },
    });

    expect(queries).toHaveLength(2);
  });

  it('should handle absence of queryKey in options', () => {
    const facetField = 'testFacet';
    const params = { q: '', extra_filter: 'filter1' };
    const options = { option1: 'value1' };

    const createQueries = buildQueries(facetField)!;
    // @ts-ignore
    const queries = createQueries(params, options);

    expect(createCommonQuery).toHaveBeenCalledWith({
      queryKey: [],
      params: { ...params, extra_filter: 'filter1', facets: facetField },
      option1: 'value1',
    });

    expect(createNotExistsQuery).toHaveBeenCalledWith({
      queryKey: [],
      params: { ...params, facets: facetField },
      option1: 'value1',
    });

    expect(queries).toHaveLength(2);
  });
});

describe('buildSourceQueries', () => {
  it('should create queries for the "Sources" facet field', () => {
    const facetField = 'sourceFacet';
    const params = { q: '', extra_filter: 'filter2' };
    const options = { queryKey: ['key2'], option2: 'value2' };

    const createQueries = buildSourceQueries(facetField)!;
    const queries = createQueries(params, options);

    expect(createQueryWithSourceMetadata).toHaveBeenCalledWith({
      queryKey: ['key2'],
      params: { ...params, extra_filter: 'filter2', facets: facetField },
      option2: 'value2',
    });

    expect(queries).toHaveLength(1);
  });

  it('should handle absence of extra_filter in params', () => {
    const facetField = 'sourceFacet';
    const params = { q: '' };
    const options = { queryKey: ['key2'], option2: 'value2' };

    const createQueries = buildSourceQueries(facetField)!;
    const queries = createQueries(params, options);

    expect(createQueryWithSourceMetadata).toHaveBeenCalledWith({
      queryKey: ['key2'],
      params: { ...params, extra_filter: undefined, facets: facetField },
      option2: 'value2',
    });

    expect(queries).toHaveLength(1);
  });

  it('should handle absence of options', () => {
    const facetField = 'sourceFacet';
    const params = { q: '', extra_filter: 'filter2' };
    const options = undefined;

    const createQueries = buildSourceQueries(facetField)!;
    const queries = createQueries(params, options);

    expect(createQueryWithSourceMetadata).toHaveBeenCalledWith({
      queryKey: [],
      params: { ...params, extra_filter: 'filter2', facets: facetField },
    });

    expect(queries).toHaveLength(1);
  });

  it('should handle absence of queryKey in options', () => {
    const facetField = 'sourceFacet';
    const params = { q: '', extra_filter: 'filter2' };
    const options = { option2: 'value2' };

    const createQueries = buildSourceQueries(facetField)!;
    // @ts-ignore
    const queries = createQueries(params, options);

    expect(createQueryWithSourceMetadata).toHaveBeenCalledWith({
      queryKey: [],
      params: { ...params, extra_filter: 'filter2', facets: facetField },
      option2: 'value2',
    });

    expect(queries).toHaveLength(1);
  });
});