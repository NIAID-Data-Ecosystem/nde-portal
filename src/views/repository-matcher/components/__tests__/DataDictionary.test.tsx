import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithClient } from 'src/__tests__/mocks/utils';
import { DataDictionary } from '../DataDictionary';
import { RepositoryMatcherColumn } from '../../types';

const columns: RepositoryMatcherColumn[] = [
  {
    id: 'b',
    label: 'Beta',
    fields: [],
    transform: () => null,
    component: () => null,
    info: {
      description: 'Beta description',
      terms: [{ label: 'B-term', description: 'B-term description' }],
    },
  },
  {
    id: 'a',
    label: 'Alpha',
    fields: [],
    transform: () => null,
    component: () => null,
    info: { description: 'Alpha description' },
  },
  // No info -> skipped entirely.
  {
    id: 'c',
    label: 'Gamma',
    fields: [],
    transform: () => null,
    component: () => null,
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

  it('renders a row per column with info, sorted by label', () => {
    renderWithClient(<DataDictionary columns={columns} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Alpha description')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Beta description')).toBeInTheDocument();

    // Columns without info are skipped.
    expect(screen.queryByText('Gamma')).not.toBeInTheDocument();
  });

  it('renders sub-terms when present', () => {
    renderWithClient(<DataDictionary columns={columns} />);
    expect(screen.getByText('B-term')).toBeInTheDocument();
    expect(screen.getByText('B-term description')).toBeInTheDocument();
  });
});
