import {
  getSectionFilters,
  getSectionTypeFilter,
} from './resource-type-filter';

describe('getSectionTypeFilter', () => {
  it("uses the section's types when no type is selected", () => {
    expect(getSectionTypeFilter(['Dataset'])).toEqual(['Dataset']);
    expect(getSectionTypeFilter(['Dataset'], [])).toEqual(['Dataset']);
  });

  it("narrows multiple selected types to the section's type", () => {
    // "Select all" in the search bar selects every resource type.
    const selectedTypes = [
      'ComputationalTool',
      'DataCollection',
      'Dataset',
      'ResourceCatalog',
      'Sample',
    ];

    expect(getSectionTypeFilter(['Dataset'], selectedTypes)).toEqual([
      'Dataset',
    ]);
    expect(getSectionTypeFilter(['ComputationalTool'], selectedTypes)).toEqual([
      'ComputationalTool',
    ]);
  });

  it("keeps the selected types when they exclude the section's type", () => {
    expect(getSectionTypeFilter(['Dataset'], ['ComputationalTool'])).toEqual([
      'ComputationalTool',
    ]);
  });
});

describe('getSectionFilters', () => {
  it('scopes `@type` and keeps the other filters', () => {
    expect(
      getSectionFilters(['Sample'], {
        date: ['2020-01-01', '2024-12-31'],
        '@type': ['Dataset', 'Sample'],
      }),
    ).toEqual({
      date: ['2020-01-01', '2024-12-31'],
      '@type': ['Sample'],
    });
  });

  it('adds `@type` when no type is selected', () => {
    expect(getSectionFilters(['DataCollection'])).toEqual({
      '@type': ['DataCollection'],
    });
  });
});
