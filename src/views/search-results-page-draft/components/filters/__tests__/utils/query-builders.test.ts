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
    const id = 'test_id';
    const facets = 'testFacet';
    const params = { q: '', extra_filter: 'filter1', facets };
    const options = { queryKey: ['key1'], option1: 'value1' };

    const createQueries = buildQueries()!;
    const queries = createQueries(id, params, options);

    expect(createCommonQuery).toHaveBeenCalledWith({
      id,
      queryKey: ['key1'],
      params: { ...params, extra_filter: 'filter1', facets },
      option1: 'value1',
    });

    expect(createNotExistsQuery).toHaveBeenCalledWith({
      id,
      queryKey: ['key1'],
      params: { ...params, facets },
      option1: 'value1',
    });

    expect(queries).toHaveLength(2);
  });

  it('should handle absence of extra_filter in params', () => {
    const id = 'test_id';
    const facets = 'testFacet';
    const params = { q: '', facets };
    const options = { queryKey: ['key1'], option1: 'value1' };

    const createQueries = buildQueries()!;
    const queries = createQueries(id, params, options);

    expect(createCommonQuery).toHaveBeenCalledWith({
      id,
      queryKey: ['key1'],
      params: { ...params, extra_filter: undefined, facets },
      option1: 'value1',
    });

    expect(createNotExistsQuery).toHaveBeenCalledWith({
      id,
      queryKey: ['key1'],
      params: { ...params, facets },
      option1: 'value1',
    });

    expect(queries).toHaveLength(2);
  });

  it('should handle overriding params with buildQueries function', () => {
    const id = 'test_id';
    const params = { q: '', facets: 'testFacet' };
    const options = { queryKey: ['key1'], option1: 'value1' };
    const overrides = {
      params: { q: 'overriding query string', facets: 'overridingFacet' },
      id: 'overridingId',
    };

    const createQueries = buildQueries(overrides)!;
    const queries = createQueries(id, params, options);

    expect(createCommonQuery).toHaveBeenCalledWith({
      id: overrides.id,
      queryKey: ['key1'],
      params: overrides.params,
      option1: 'value1',
    });

    expect(createNotExistsQuery).toHaveBeenCalledWith({
      id: overrides.id,
      queryKey: ['key1'],
      params: overrides.params,
      option1: 'value1',
    });

    expect(queries).toHaveLength(2);
  });

  it('should handle absence of options', () => {
    const id = 'test_id';
    const facets = 'testFacet';
    const params = { q: '', facets };
    const options = undefined;

    const createQueries = buildQueries()!;
    const queries = createQueries(id, params, options);

    expect(createCommonQuery).toHaveBeenCalledWith({
      id,
      queryKey: [],
      params: { ...params, facets },
    });

    expect(createNotExistsQuery).toHaveBeenCalledWith({
      id,
      queryKey: [],
      params: { ...params, facets },
    });

    expect(queries).toHaveLength(2);
  });

  it('should handle absence of queryKey in options', () => {
    const id = 'test-id';
    const facets = 'testFacet';
    const params = { q: '', extra_filter: 'filter1', facets };
    const options = { option1: 'value1' };

    const createQueries = buildQueries();
    // @ts-ignore
    const queries = createQueries(id, params, options);

    expect(createCommonQuery).toHaveBeenCalledWith({
      id,
      queryKey: [],
      params: { ...params, extra_filter: 'filter1', facets },
      option1: 'value1',
    });

    expect(createNotExistsQuery).toHaveBeenCalledWith({
      id,
      queryKey: [],
      params: { ...params, facets },
      option1: 'value1',
    });

    expect(queries).toHaveLength(2);
  });
});

describe('buildSourceQueries', () => {
  it('should create queries for the "Sources" facet field', () => {
    const id = 'test-id';
    const facets = 'sourceFacet';
    const params = { q: '', extra_filter: 'filter2', facets };
    const options = { queryKey: ['key2'], option2: 'value2' };

    const createQueries = buildSourceQueries()!;
    const queries = createQueries(id, params, options);

    expect(createQueryWithSourceMetadata).toHaveBeenCalledWith({
      id,
      queryKey: ['key2'],
      params: { ...params, extra_filter: 'filter2', facets },
      option2: 'value2',
    });

    expect(queries).toHaveLength(1);
  });

  it('should handle absence of extra_filter in params', () => {
    const id = 'test-id';
    const facets = 'sourceFacet';
    const params = { q: '', facets };
    const options = { queryKey: ['key2'], option2: 'value2' };

    const createQueries = buildSourceQueries();
    const queries = createQueries(id, params, options);

    expect(createQueryWithSourceMetadata).toHaveBeenCalledWith({
      id,
      queryKey: ['key2'],
      params: { ...params, extra_filter: undefined, facets },
      option2: 'value2',
    });

    expect(queries).toHaveLength(1);
  });

  it('should handle absence of options', () => {
    const id = 'test-id';
    const facets = 'sourceFacet';
    const params = { q: '', extra_filter: 'filter2', facets };
    const options = undefined;

    const createQueries = buildSourceQueries();
    const queries = createQueries(id, params, options);

    expect(createQueryWithSourceMetadata).toHaveBeenCalledWith({
      id,
      queryKey: [],
      params: { ...params, extra_filter: 'filter2', facets },
    });

    expect(queries).toHaveLength(1);
  });

  it('should handle absence of queryKey in options', () => {
    const id = 'test-id';
    const facets = 'sourceFacet';
    const params = { q: '', extra_filter: 'filter2', facets };
    const options = { option2: 'value2' };

    const createQueries = buildSourceQueries();
    // @ts-ignore
    const queries = createQueries(id, params, options);

    expect(createQueryWithSourceMetadata).toHaveBeenCalledWith({
      id,
      queryKey: [],
      params: { ...params, extra_filter: 'filter2', facets },
      option2: 'value2',
    });

    expect(queries).toHaveLength(1);
  });
});
