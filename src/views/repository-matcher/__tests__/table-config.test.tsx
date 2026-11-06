import { screen } from '@testing-library/react';
import React from 'react';
import { renderWithClient } from 'src/__tests__/mocks/utils';
import { resolveColumn } from 'src/components/table/data-table/utils/columns';

import {
  FILTERABLE_REPOSITORY_MATCHER_COLUMNS,
  REPOSITORY_MATCHER_COLUMNS,
} from '../table-config';
import { RepositoryMatcherColumn } from '../types';

// The name column links either to the raw source `url` or to a `/sources`
// anchor depending on the `USE_MERGED_SOURCES_AND_CATALOGS` flag; make it
// controllable per-test. The getter is re-read on every render, so toggling
// `mockUseMergedSourcesAndCatalogs` between renders switches the branch.
let mockUseMergedSourcesAndCatalogs = true;
jest.mock('src/utils/feature-flags', () => ({
  ...jest.requireActual('src/utils/feature-flags'),
  get USE_MERGED_SOURCES_AND_CATALOGS() {
    return mockUseMergedSourcesAndCatalogs;
  },
}));

const byId = REPOSITORY_MATCHER_COLUMNS.reduce((acc, col) => {
  acc[col.id] = col;
  return acc;
}, {} as Record<string, RepositoryMatcherColumn>);

/** Renders a column's cell for a value the way the table does. */
const renderValue = (id: string, value: unknown) =>
  renderWithClient(
    <div data-testid='cell'>
      {resolveColumn(byId[id]).renderCell({
        _id: '1',
        _search: '',
        [id]: value,
      } as any)}
    </div>,
  );
const sortValue = (id: string, value: unknown) =>
  resolveColumn(byId[id]).getSortValue({ [id]: value } as any);
const cell = () => screen.getByTestId('cell');

describe('table-config metadata', () => {
  it('makes only the name column non-hideable', () => {
    expect(
      REPOSITORY_MATCHER_COLUMNS.filter(c => c.hideable === false).map(
        c => c.id,
      ),
    ).toEqual(['name']);
  });

  it('shows every column by default', () => {
    expect(
      REPOSITORY_MATCHER_COLUMNS.every(c => c.defaultVisible !== false),
    ).toBe(true);
  });

  it('exposes the filterable columns subset', () => {
    const expected = REPOSITORY_MATCHER_COLUMNS.filter(c =>
      Boolean(c.filter),
    ).map(c => c.id);
    expect(FILTERABLE_REPOSITORY_MATCHER_COLUMNS.map(c => c.id)).toEqual(
      expected,
    );
    expect(expected).toEqual(
      expect.arrayContaining([
        'researchDomain',
        'coa',
        'healthCondition',
        'type',
      ]),
    );
  });

  it('gives the header-described columns a description', () => {
    expect(byId.coa.description).toMatch(/^Access-level definitions/);
    expect(byId.name.description).toBeUndefined();
  });
});

describe('name column', () => {
  it('transforms name/url/_id with fallbacks', () => {
    expect(
      byId.name.transform({ name: 'NCBI', url: 'u', _id: 'x' } as any),
    ).toEqual({
      label: 'NCBI',
      url: 'u',
      _id: 'x',
    });
    expect(byId.name.transform({ _id: 'only-id' } as any)).toEqual({
      label: 'only-id',
      url: '',
      _id: 'only-id',
    });
    expect(byId.name.transform({} as any)).toEqual({
      label: '',
      url: '',
      _id: '',
    });
  });

  it('sorts and searches on the label', () => {
    const value = { label: 'NCBI', url: 'u', _id: 'x' };
    expect(sortValue('name', value)).toBe('NCBI');
    expect(byId.name.getSearchValue!(value)).toBe('NCBI');
  });

  it('links to the raw source url when USE_MERGED_SOURCES_AND_CATALOGS is disabled', () => {
    mockUseMergedSourcesAndCatalogs = false;
    renderValue('name', { label: 'NCBI', url: 'https://ncbi.gov', _id: 'x' });
    // Still a client-side link, as before: no new tab.
    expect(screen.getByRole('link', { name: 'NCBI' })).toHaveAttribute(
      'href',
      'https://ncbi.gov',
    );
    expect(screen.getByRole('link', { name: 'NCBI' })).not.toHaveAttribute(
      'target',
    );
  });

  it('links to the /sources anchor by _id when USE_MERGED_SOURCES_AND_CATALOGS is enabled', () => {
    mockUseMergedSourcesAndCatalogs = true;
    renderValue('name', { label: 'NCBI', url: 'https://ncbi.gov', _id: 'x' });
    expect(screen.getByRole('link', { name: 'NCBI' })).toHaveAttribute(
      'href',
      '/sources#x',
    );
  });

  it('renders the label as text when there is no link', () => {
    mockUseMergedSourcesAndCatalogs = false;
    renderValue('name', { label: 'NCBI', url: '', _id: 'x' });
    expect(cell()).toHaveTextContent('NCBI');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('description column', () => {
  it('transforms with a fallback and renders the text', () => {
    expect(byId.description.transform({ description: 'desc' } as any)).toBe(
      'desc',
    );
    expect(byId.description.transform({} as any)).toBe('');
    renderValue('description', 'desc');
    expect(screen.getByText('desc')).toBeInTheDocument();
  });

  it('shows the shared placeholder when there is no description', () => {
    renderValue('description', '');
    expect(cell()).toHaveTextContent('No data');
  });
});

describe('researchDomain column', () => {
  it('normalizes genre into an array', () => {
    expect(
      byId.researchDomain.transform({ genre: ['IID', 'Generalist'] } as any),
    ).toEqual(['IID', 'Generalist']);
    expect(byId.researchDomain.transform({ genre: 'IID' } as any)).toEqual([
      'IID',
    ]);
    expect(byId.researchDomain.transform({} as any)).toEqual([]);
  });

  it('exposes filter values', () => {
    expect(byId.researchDomain.filter!.getFilterValues(['IID'])).toEqual([
      'IID',
    ]);
    expect(
      byId.researchDomain.filter!.getFilterValues(undefined as any),
    ).toEqual([]);
  });

  it('renders tags, or the placeholder when empty', () => {
    const { unmount } = renderValue('researchDomain', ['IID']);
    expect(screen.getByText('IID')).toBeInTheDocument();
    unmount();
    renderValue('researchDomain', []);
    expect(cell()).toHaveTextContent('No data');
  });
});

describe('coa column', () => {
  it('transforms conditions of access into a readable label', () => {
    expect(byId.coa.transform({ conditionsOfAccess: 'Open' } as any)).toBe(
      'Open Access',
    );
    expect(byId.coa.transform({} as any)).toBe('');
  });

  it('exposes filter values', () => {
    expect(byId.coa.filter!.getFilterValues('Open Access')).toEqual([
      'Open Access',
    ]);
    expect(byId.coa.filter!.getFilterValues('')).toEqual([]);
  });

  it('renders the access tag, or the placeholder when empty', () => {
    const { unmount } = renderValue('coa', 'Open Access');
    expect(screen.getByText('Open Access')).toBeInTheDocument();
    unmount();
    renderValue('coa', '');
    expect(cell()).toHaveTextContent('No data');
  });
});

// Maps a defined-term column id to its source field on the raw item.
const FIELDS: Record<string, string> = {
  healthCondition: 'healthCondition',
  infectiousAgent: 'infectiousAgent',
  species: 'species',
  'meas-technique': 'measurementTechnique',
  topic: 'topicCategory',
};

describe.each(Object.keys(FIELDS))('defined-term column: %s', id => {
  const col = () => byId[id];

  it('is a tag column fetching its field', () => {
    expect(col().type).toBe('tags');
    expect(col().fields).toEqual([FIELDS[id]]);
  });

  it('normalizes the value into an array', () => {
    expect(col().transform({ [FIELDS[id]]: [{ name: 'A' }] } as any)).toEqual([
      { name: 'A' },
    ]);
    expect(col().transform({ [FIELDS[id]]: { name: 'A' } } as any)).toEqual([
      { name: 'A' },
    ]);
    expect(col().transform({} as any)).toEqual([]);
  });

  it('derives search and filter values from term names', () => {
    const value = [{ name: 'A' }, { name: undefined }] as any;
    expect(col().getSearchValue!(value)).toEqual(['A']);
    expect(col().filter!.getFilterValues(value)).toEqual(['A']);
    expect(col().getSearchValue!(undefined as any)).toEqual([]);
    expect(col().filter!.getFilterValues(undefined as any)).toEqual([]);
  });

  it('renders the named terms as tags, or the placeholder when none is named', () => {
    const { unmount } = renderValue(id, [{ name: 'A' }]);
    expect(screen.getByText('A')).toBeInTheDocument();
    unmount();
    renderValue(id, [{ name: undefined }]);
    expect(cell()).toHaveTextContent('No data');
  });
});

describe('temporalCoverage column', () => {
  it('passes through the raw temporalCoverage', () => {
    const tc = [{ startDate: '2020', endDate: '2021' }];
    expect(
      byId.temporalCoverage.transform({ temporalCoverage: tc } as any),
    ).toBe(tc);
  });

  it('derives search values from start/end dates', () => {
    expect(
      byId.temporalCoverage.getSearchValue!([
        { startDate: '2020', endDate: '2021' },
      ] as any),
    ).toEqual(['2020,2021']);
    expect(byId.temporalCoverage.getSearchValue!(undefined as any)).toEqual([]);
  });

  it('sorts on the first start date, newest first', () => {
    expect(resolveColumn(byId.temporalCoverage).descFirst).toBe(true);
    expect(sortValue('temporalCoverage', [{ startDate: '2020-01-01' }])).toBe(
      '2020-01-01',
    );
    expect(sortValue('temporalCoverage', [{ name: 'Current' }])).toBe(
      'Current',
    );
    expect(sortValue('temporalCoverage', undefined)).toBeUndefined();
  });

  it('renders ISO ranges, named periods, and the placeholder when empty', () => {
    const { unmount } = renderValue('temporalCoverage', [
      { startDate: '2020-01-01T00:00:00Z', endDate: '2021-06-30' },
      { startDate: '2022-01-01', endDate: undefined },
      { name: 'Current' },
    ]);
    const [range, openEnded, named] = Array.from(
      cell().children,
      el => (el as HTMLElement).innerHTML,
    );
    // One coverage per block: start, "to", end on their own lines.
    expect(range).toBe('2020-01-01<br>to<br>2021-06-30');
    expect(openEnded).toBe('2022-01-01<br>to<br>-');
    expect(named).toBe('Current');
    unmount();
    renderValue('temporalCoverage', []);
    expect(cell()).toHaveTextContent('No data');
  });
});

describe('license column', () => {
  it('transforms with a fallback', () => {
    expect(byId.license.transform({ license: 'MIT' } as any)).toBe('MIT');
    expect(byId.license.transform({} as any)).toBe('');
  });

  it('renders url licenses as external links and others as text', () => {
    const { unmount } = renderValue('license', 'https://license.org');
    const link = screen.getByRole('link', { name: /license\.org/ });
    expect(link).toHaveAttribute('href', 'https://license.org');
    expect(link).toHaveAttribute('target', '_blank');
    unmount();
    const www = renderValue('license', 'www.license.org');
    expect(screen.getByRole('link', { name: /license\.org/ })).toHaveAttribute(
      'href',
      'https://www.license.org',
    );
    www.unmount();
    renderValue('license', 'MIT');
    expect(cell()).toHaveTextContent(/^MIT$/);
  });

  it('shows the placeholder when there is no license', () => {
    renderValue('license', '');
    expect(cell()).toHaveTextContent('No data');
  });
});

describe('type column', () => {
  it('transforms via itemTypes', () => {
    expect(byId.type.transform({ type: ['Resource Catalog'] } as any)).toEqual([
      'Resource Catalog',
    ]);
    expect(byId.type.transform({} as any)).toEqual([]);
  });

  it('sorts on the first type and exposes filter values', () => {
    expect(sortValue('type', ['Resource Catalog', 'Dataset Repository'])).toBe(
      'Resource Catalog',
    );
    expect(sortValue('type', [])).toBeUndefined();
    expect(byId.type.filter!.getFilterValues(['Resource Catalog'])).toEqual([
      'Resource Catalog',
    ]);
    expect(byId.type.filter!.getFilterValues(undefined as any)).toEqual([]);
  });

  it('joins multiple types and falls back to the placeholder', () => {
    const { unmount } = renderValue('type', [
      'Resource Catalog',
      'Dataset Repository',
    ]);
    expect(
      screen.getByText('Resource Catalog, Dataset Repository'),
    ).toBeInTheDocument();
    unmount();
    renderValue('type', []);
    expect(cell()).toHaveTextContent('No data');
  });
});
