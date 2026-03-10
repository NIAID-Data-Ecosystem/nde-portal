import * as mod from '../index';

describe('refactored-filters/index exports', () => {
  it('exports key runtime symbols', () => {
    expect(mod.FILTER_CONFIGS).toBeDefined();
    expect(mod.getFilterById).toBeDefined();
    expect(mod.Filters).toBeDefined();
    expect(mod.FiltersSection).toBeDefined();
    expect(mod.FiltersList).toBeDefined();
    expect(mod.FiltersContainer).toBeDefined();
    expect(mod.DateFilter).toBeDefined();
    expect(mod.useFilterQueries).toBeDefined();
    expect(mod.filtersToQueryString).toBeDefined();
    expect(mod.queryStringToFilters).toBeDefined();
    expect(mod.normalizeFilterValues).toBeDefined();
    expect(mod.getSelectedFilterDisplay).toBeDefined();
  });
});
