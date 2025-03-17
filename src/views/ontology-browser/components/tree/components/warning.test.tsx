import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Warning } from './warning';
import { OntologyLineageItemWithCounts } from 'src/views/ontology-browser/types';

describe('Warning component', () => {
  const mockNode: OntologyLineageItemWithCounts = {
    id: '10239',
    commonName: '',
    hasChildren: true,
    iri: 'http://purl.obolibrary.org/obo/NCBITaxon_10239',
    label: 'viruses',
    ontologyName: 'ncbitaxon',
    parentTaxonId: '1',
    state: {
      opened: true,
      selected: false,
    },
    taxonId: '10239',
    counts: {
      termCount: 751,
      termAndChildrenCount: 755,
    },
  };

  const mockOnClick = jest.fn();

  it('renders the warning message with node label and taxon ID', () => {
    render(<Warning node={mockNode} onClick={mockOnClick} />);

    expect(screen.getByText(/viruses \(Taxon ID: 10239\)/)).toBeInTheDocument();
    expect(
      screen.getByText(/has hidden children with 0 associated datasets./),
    ).toBeInTheDocument();
  });

  it('renders the "Show hidden terms" button', () => {
    render(<Warning node={mockNode} onClick={mockOnClick} />);

    expect(
      screen.getByRole('button', { name: /Show hidden terms/i }),
    ).toBeInTheDocument();
  });

  it('calls the onClick callback when the button is clicked', () => {
    render(<Warning node={mockNode} onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole('button', { name: /Show hidden terms/i }));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
