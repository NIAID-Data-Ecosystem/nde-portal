import { screen } from '@testing-library/react';
import React from 'react';
import { renderWithClient } from 'src/__tests__/mocks/utils';

import { RepositoryMatcherColumn } from '../../types';
import { DataDictionary } from '../DataDictionary';

const columns: RepositoryMatcherColumn[] = [
  {
    id: 'b',
    header: 'Beta',
    description: 'Beta description',
    fields: [],
    transform: () => null,
    info: {
      terms: [{ label: 'B-term', description: 'B-term description' }],
    },
  },
  {
    id: 'a',
    header: 'Alpha',
    description: 'Alpha description',
    fields: [],
    transform: () => null,
  },
  // No description or terms -> skipped entirely.
  {
    id: 'c',
    header: 'Gamma',
    fields: [],
    transform: () => null,
  },
];

describe('DataDictionary', () => {
  it('renders the heading and intro copy', () => {
    renderWithClient(<DataDictionary columns={columns} />);
    expect(
      screen.getByRole('heading', { name: 'Table Dictionary' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Definitions of fields and values/i),
    ).toBeInTheDocument();
  });

  it('renders a row per described column, sorted by header', () => {
    renderWithClient(<DataDictionary columns={columns} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Alpha description')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Beta description')).toBeInTheDocument();

    // Columns without a description or terms are skipped.
    expect(screen.queryByText('Gamma')).not.toBeInTheDocument();
  });

  it('renders sub-terms when present', () => {
    renderWithClient(<DataDictionary columns={columns} />);
    expect(screen.getByText('B-term')).toBeInTheDocument();
    expect(screen.getByText('B-term description')).toBeInTheDocument();
  });
});
