import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithClient } from 'src/__tests__/mocks/utils';
import {
  FILTERABLE_REPOSITORY_MATCHER_COLUMNS,
  REPOSITORY_MATCHER_COLUMNS,
} from '../table-config';
import { RepositoryMatcherColumn } from '../types';

const byId = REPOSITORY_MATCHER_COLUMNS.reduce((acc, col) => {
  acc[col.id] = col;
  return acc;
}, {} as Record<string, RepositoryMatcherColumn<any>>);

const renderCell = (node: React.ReactNode) =>
  renderWithClient(<div data-testid='cell'>{node}</div>);

describe('table-config metadata', () => {
  it('marks only the name column as required', () => {
    expect(byId.name.required).toBe(true);
    expect(byId.description.required).toBeUndefined();
  });

  it('exposes the filterable columns subset', () => {
    const expected = REPOSITORY_MATCHER_COLUMNS.filter(c =>
      Boolean(c.filter),
    ).map(c => c.id);
    expect(FILTERABLE_REPOSITORY_MATCHER_COLUMNS.map(c => c.id)).toEqual(
      expected,
    );
    expect(expected).toContain('researchDomain');
    expect(expected).toContain('coa');
  });
});

describe('name column', () => {
  const col = () => byId.name;

  it('transforms name/url/_id with fallbacks', () => {
    expect(
      col().transform({ name: 'NCBI', url: 'u', _id: 'x' } as any),
    ).toEqual({ label: 'NCBI', url: 'u', _id: 'x' });
    // Falls back to _id when name is missing and drops url when absent.
    expect(col().transform({ _id: 'only-id' } as any)).toEqual({
      label: 'only-id',
      url: '',
      _id: 'only-id',
    });
    expect(col().transform({} as any)).toEqual({ label: '', url: '', _id: '' });
  });

  it('derives sort/search values from the label', () => {
    const value = { label: 'NCBI', url: 'u', _id: 'x' };
    expect(col().getSortValue!(value)).toBe('ncbi');
    expect(col().getSearchValue!(value)).toBe('NCBI');
  });

  it('renders a link cell', () => {
    renderCell(
      col().component({
        value: { label: 'NCBI', url: 'https://ncbi.gov', _id: 'x' },
        data: {} as any,
      }),
    );
    expect(screen.getByText('NCBI').closest('a')).toHaveAttribute(
      'href',
      'https://ncbi.gov',
    );
  });

  it('renders a fallback when value is missing', () => {
    renderCell(col().component({ value: undefined as any, data: {} as any }));
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});

describe('description column', () => {
  it('transforms with a fallback and renders the text', () => {
    expect(byId.description.transform({ description: 'desc' } as any)).toBe(
      'desc',
    );
    expect(byId.description.transform({} as any)).toBe('');
    renderCell(byId.description.component({ value: 'desc', data: {} as any }));
    expect(screen.getByText('desc')).toBeInTheDocument();
  });
});

describe('researchDomain column', () => {
  const col = () => byId.researchDomain;

  it('normalizes genre into an array', () => {
    expect(col().transform({ genre: ['IID', 'Generalist'] } as any)).toEqual([
      'IID',
      'Generalist',
    ]);
    expect(col().transform({ genre: 'IID' } as any)).toEqual(['IID']);
    expect(col().transform({} as any)).toEqual([]);
  });

  it('exposes filter values', () => {
    expect(col().filter!.getFilterValues(['IID'])).toEqual(['IID']);
    expect(col().filter!.getFilterValues(undefined as any)).toEqual([]);
  });

  it('renders loading, empty, undefined, and populated states', () => {
    const loading = renderCell(
      col().component({ value: [], isLoading: true, data: {} as any }),
    );
    loading.unmount();

    // undefined value exercises the `value ?? []` fallback.
    const undef = renderCell(
      col().component({ value: undefined as any, data: {} as any }),
    );
    expect(screen.getByText('not available')).toBeInTheDocument();
    undef.unmount();

    renderCell(col().component({ value: [], data: {} as any }));
    expect(screen.getByText('not available')).toBeInTheDocument();

    renderCell(col().component({ value: ['IID'], data: {} as any }));
    expect(screen.getByText('IID')).toBeInTheDocument();
  });
});

describe('coa column', () => {
  const col = () => byId.coa;

  it('transforms conditions of access into a readable label', () => {
    expect(col().transform({ conditionsOfAccess: 'Open' } as any)).toBe(
      'Open Access',
    );
    expect(col().transform({} as any)).toBe('');
  });

  it('exposes filter values', () => {
    expect(col().filter!.getFilterValues('Open Access')).toEqual([
      'Open Access',
    ]);
    expect(col().filter!.getFilterValues('')).toEqual([]);
  });

  it('renders the access tag, defaulting empty values to a dash', () => {
    renderCell(col().component({ value: 'Open Access', data: {} as any }));
    expect(screen.getByText('Open Access')).toBeInTheDocument();

    renderCell(col().component({ value: '', data: {} as any }));
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});

describe.each([
  'healthCondition',
  'infectiousAgent',
  'species',
  'meas-technique',
])('defined-term column: %s', id => {
  const col = () => byId[id];

  it('normalizes the value into an array', () => {
    expect(col().transform({ [field(id)]: [{ name: 'A' }] } as any)).toEqual([
      { name: 'A' },
    ]);
    expect(col().transform({ [field(id)]: { name: 'A' } } as any)).toEqual([
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

  it('renders the term tags', () => {
    renderCell(col().component({ value: [{ name: 'A' }], data: {} as any }));
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});

// Maps a defined-term column id to its source field on the raw item.
function field(id: string): string {
  return {
    healthCondition: 'healthCondition',
    infectiousAgent: 'infectiousAgent',
    species: 'species',
    'meas-technique': 'measurementTechnique',
  }[id]!;
}

describe('topic column', () => {
  const col = () => byId.topic;

  it('normalizes topicCategory into an array', () => {
    expect(col().transform({ topicCategory: [{ name: 'T' }] } as any)).toEqual([
      { name: 'T' },
    ]);
    expect(col().transform({ topicCategory: { name: 'T' } } as any)).toEqual([
      { name: 'T' },
    ]);
    expect(col().transform({} as any)).toEqual([]);
  });

  it('derives search values from term names', () => {
    expect(
      col().getSearchValue!([{ name: 'T' }, { name: undefined }] as any),
    ).toEqual(['T']);
    expect(col().getSearchValue!(undefined as any)).toEqual([]);
  });

  it('renders a placeholder when no term has a name', () => {
    renderCell(
      col().component({ value: [{ name: undefined }] as any, data: {} as any }),
    );
    expect(screen.getByText('not available')).toBeInTheDocument();
  });

  it('renders tags when terms are named', () => {
    renderCell(col().component({ value: [{ name: 'T' }], data: {} as any }));
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('renders nothing extra while loading', () => {
    const { container } = renderCell(
      col().component({ value: [], isLoading: true, data: {} as any }),
    );
    expect(container).toBeInTheDocument();
  });
});

describe('temporalCoverage column', () => {
  const col = () => byId.temporalCoverage;

  it('passes through the raw temporalCoverage', () => {
    const tc = [{ startDate: '2020', endDate: '2021' }];
    expect(col().transform({ temporalCoverage: tc } as any)).toBe(tc);
  });

  it('derives search values from start/end dates', () => {
    expect(
      col().getSearchValue!([{ startDate: '2020', endDate: '2021' }] as any),
    ).toEqual(['2020,2021']);
    expect(col().getSearchValue!(undefined as any)).toEqual([]);
  });

  it('renders loading, empty, and formatted ranges', () => {
    const { unmount } = renderCell(
      col().component({ value: undefined, isLoading: true, data: {} as any }),
    );
    unmount();

    const empty = renderCell(col().component({ value: [], data: {} as any }));
    empty.unmount();

    renderCell(
      col().component({
        value: [
          { startDate: '2020-01-01', endDate: '2021-01-01' },
          { startDate: '2022-01-01', endDate: undefined as any },
          { startDate: undefined as any, endDate: '2023-01-01' },
        ],
        data: {} as any,
      }),
    );
    // The "to" separator renders for each range.
    expect(screen.getAllByText('to').length).toBe(3);
    // Missing start/end dates render as a dash.
    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(2);
  });
});

describe('license column', () => {
  const col = () => byId.license;

  it('transforms with a fallback', () => {
    expect(col().transform({ license: 'MIT' } as any)).toBe('MIT');
    expect(col().transform({} as any)).toBe('');
  });

  it('renders a link for url licenses and text otherwise', () => {
    renderCell(
      col().component({ value: 'https://license.org', data: {} as any }),
    );
    expect(
      screen.getByText('https://license.org').closest('a'),
    ).toHaveAttribute('href', 'https://license.org');

    renderCell(col().component({ value: 'MIT', data: {} as any }));
    expect(screen.getByText('MIT')).toBeInTheDocument();
  });
});

describe('type column', () => {
  const col = () => byId.type;

  it('transforms via itemTypes', () => {
    expect(col().transform({ type: ['Resource Catalog'] } as any)).toEqual([
      'Resource Catalog',
    ]);
    expect(col().transform({} as any)).toEqual([]);
  });

  it('derives sort and filter values', () => {
    expect(col().getSortValue!(['Resource Catalog'])).toBe('resource catalog');
    expect(col().getSortValue!([])).toBe('');
    expect(col().filter!.getFilterValues(['Resource Catalog'])).toEqual([
      'Resource Catalog',
    ]);
    expect(col().filter!.getFilterValues(undefined as any)).toEqual([]);
  });

  it('joins multiple types and falls back to empty', () => {
    renderCell(
      col().component({
        value: ['Resource Catalog', 'Dataset Repository'],
        data: {} as any,
      }),
    );
    expect(
      screen.getByText('Resource Catalog, Dataset Repository'),
    ).toBeInTheDocument();

    // Empty array and undefined both fall back to the placeholder.
    const empty = renderCell(col().component({ value: [], data: {} as any }));
    expect(screen.getByText('not available')).toBeInTheDocument();
    empty.unmount();

    renderCell(col().component({ value: undefined as any, data: {} as any }));
    expect(screen.getByText('not available')).toBeInTheDocument();
  });
});

describe('license column edge cases', () => {
  it('renders text for an undefined value', () => {
    renderCell(
      byId.license.component({ value: undefined as any, data: {} as any }),
    );
    expect(screen.getByText('not available')).toBeInTheDocument();
  });
});

describe('topic column edge cases', () => {
  it('renders a placeholder for an undefined value', () => {
    renderCell(
      byId.topic.component({ value: undefined as any, data: {} as any }),
    );
    expect(screen.getByText('not available')).toBeInTheDocument();
  });
});
